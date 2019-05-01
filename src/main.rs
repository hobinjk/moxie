#[macro_use]
extern crate nom;
extern crate serde;
extern crate serde_json;

use std::collections::HashMap;
use std::fs::File;
use std::io::Read;
use serde::Serialize;

mod parser;

fn to_io_result<A, B>(r: Result<A, B>) -> std::io::Result<A> {
    r.map_err(|_| std::io::Error::new(std::io::ErrorKind::Other, "I don't care"))
}

fn unzip(zipped: &[u8]) -> std::io::Result<Vec<u8>> {
    let zip_reader = std::io::Cursor::new(zipped);
    let mut archive = to_io_result(zip::ZipArchive::new(zip_reader))?;
    let mut file = archive.by_index(0)?;
    let mut contents = vec![];
    file.read_to_end(&mut contents)?;
    Ok(contents)
}

#[derive(Debug, Serialize)]
enum BuffEvent {
    Apply(u64),
    Remove(u64),
}

impl BuffEvent {
    fn time(&self) -> u64 {
        match self {
            BuffEvent::Apply(time) => *time,
            BuffEvent::Remove(time) => *time,
        }
    }
}

#[derive(Debug, Serialize)]
struct SkillCast {
    id: u32,
    start: u64,
    end: u64,
    fired: bool,
}

enum SkillEvent {
    Start(u64),
    End(u64, bool),
}

fn get_skill_event(event: &parser::Event) -> Option<SkillEvent> {
    match event.combat_state_change {
        parser::CombatStateChange::None => {},
        _ => {
            return None;
        }
    }
    match event.combat_activation {
        parser::CombatActivation::None => None,
        parser::CombatActivation::Normal |
        parser::CombatActivation::Quickness => Some(SkillEvent::Start(event.time)),
        parser::CombatActivation::CancelCancel => Some(SkillEvent::End(event.time, false)),
        parser::CombatActivation::CancelFire |
        parser::CombatActivation::Reset => Some(SkillEvent::End(event.time, true)),
        parser::CombatActivation::Unknown => None,
    }
}

fn get_buff_event(event: &parser::Event) -> Option<BuffEvent> {
    if event.combat_buff_remove == parser::CombatBuffRemove::None {
        if event.buff != 0 {
            Some(BuffEvent::Apply(event.time))
        } else {
            None
        }
    } else {
        Some(BuffEvent::Remove(event.time))
    }
}

fn main() -> std::io::Result<()> {
    let args: Vec<String> = std::env::args().collect();
    let file_name = if args.len() >= 2 {
        &args[1]
    } else {
        "test.evtc"
    };
    let mut file = File::open(file_name)?;
    let mut contents = vec![];
    file.read_to_end(&mut contents)?;
    let raw_evtc = match contents[0] as char {
        'P' => unzip(&contents)?,
        _ => contents
    };
    let (_, evtc) = parser::evtc_parser(&raw_evtc).map_err(|_| std::io::Error::new(std::io::ErrorKind::Other, "I don't care"))?;

    let start = evtc.events[0].time;
    let end = evtc.events[evtc.events.len() - 1].time;
    let mut buff_events: HashMap<u32, Vec<BuffEvent>> = HashMap::new();
    let mut pending_skills: HashMap<u32, Vec<u64>> = HashMap::new();
    let mut casts: Vec<SkillCast> = vec![];

    let mut player_id = 0;
    for agent in &evtc.agents {
        match agent.agent {
            parser::AgentType::Player { .. } => {
                player_id = agent.id;
            }
            _ => {}
        }
    }

    for event in &evtc.events {
        if event.src_agent_id != player_id {
            continue;
        }
        // if event.skill_id == 5529 {
        //     println!("ew: {:?}", event);
        // }
        if let Some(skill_event) = get_skill_event(&event) {
            match skill_event {
                SkillEvent::Start(time) => {
                    pending_skills.entry(event.skill_id)
                        .or_insert(vec![])
                        .push(time);
                },
                SkillEvent::End(time, fired) => {
                    let pending = pending_skills.entry(event.skill_id)
                        .or_insert(vec![]);
                    if pending.len() == 0 {
                        continue;
                    }
                    let start_time = pending.remove(pending.len() - 1);
                    casts.push(SkillCast {
                        id: event.skill_id,
                        fired: fired,
                        start: start_time,
                        end: time
                    });
                },
            }
        } else if let Some(buff_event) = get_buff_event(&event) {
            if let Some(events) = buff_events.get_mut(&event.skill_id) {
                if let Some(last_event) = events.last() {
                    // Unsure how the events will actually be processed but so far the first event
                    // to be read is the true event
                    if last_event.time() == event.time {
                        continue;
                    }
                }
                events.push(buff_event);
            } else {
                buff_events.insert(event.skill_id, vec![buff_event]);
            }
        }
    }
    let mut skills: HashMap<u32, &str> = HashMap::new();
    for skill in &evtc.skills {
        skills.insert(skill.id, skill.name);
    }
    println!("const logStart = {};", start);
    println!("const logEnd = {};", end);
    println!("const skills = {};", serde_json::to_string(&skills)?);
    println!("const casts = {};", serde_json::to_string(&casts)?);
    println!("const buffs = {};", serde_json::to_string(&buff_events)?);

    Ok(())
}
