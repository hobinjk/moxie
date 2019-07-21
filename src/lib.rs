#[macro_use]
extern crate nom;
extern crate serde;
#[macro_use]
extern crate serde_json;

use wasm_bindgen::prelude::*;

use std::collections::{HashMap, HashSet};
use std::io::Read;
use serde::Serialize;

pub mod parser;

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

pub fn generate_raw_evtc<'a>(contents: Vec<u8>) -> std::io::Result<Vec<u8>> {
    match contents[0] as char {
        'P' => unzip(&contents),
        _ => Ok(contents)
    }
}

pub fn get_boss_name<'a>(instance_id: u16) -> &'a str {
    let mut bosses: HashMap<u16, &str> = HashMap::new();
    bosses.insert(16199, "Standard Kitty Golem");
    bosses.insert(17194, "Cairn the Indomitable");
    bosses.insert(17154, "Deimos");
    bosses.insert(19450, "Dhuum");
    bosses.insert(15429, "Gorseval the Multifarious");
    bosses.insert(16235, "Keep Construct");
    bosses.insert(19676, "Large Kitty Golem");
    bosses.insert(16115, "Matthias Gabrel");
    bosses.insert(17172, "Mursaat Overseer");
    bosses.insert(15375, "Sabetha the Saboteur");
    bosses.insert(17188, "Samarog");
    bosses.insert(16123, "Slothasor");
    bosses.insert(19767, "Soulless Horror");
    bosses.insert(15438, "Vale Guardian");
    bosses.insert(16246, "Xera");
    bosses.get(&instance_id).unwrap_or(&"unknown")
}

pub fn generate_output(contents: Vec<u8>) -> std::io::Result<serde_json::Value> {
    let raw_evtc = generate_raw_evtc(contents)?;
    let (_, evtc) = parser::evtc_parser(&raw_evtc).map_err(|_| std::io::Error::new(std::io::ErrorKind::Other, "I don't care"))?;

    let start = evtc.events[0].time;
    let end = evtc.events[evtc.events.len() - 1].time;
    let mut buff_events_players: HashMap<u64, HashMap<u32, Vec<BuffEvent>>> = HashMap::new();
    let mut pending_skills: HashMap<u32, Vec<u64>> = HashMap::new();
    let mut casts: HashMap<u64, Vec<SkillCast>> = HashMap::new();

    let mut player_ids: HashSet<u64> = HashSet::new();
    for agent in &evtc.agents {
        match agent.agent {
            parser::AgentType::Player { .. } => {
                player_ids.insert(agent.id);
            }
            _ => {}
        }
    }

    let instants: HashSet<u32> = [40183, 5539].iter().cloned().collect();

    for event in &evtc.events {
        if !player_ids.contains(&event.src_agent_id) {
            continue;
        }
        if instants.contains(&event.skill_id) {
            casts.entry(event.src_agent_id)
                .or_insert(vec![])
                .push(SkillCast {
                id: event.skill_id,
                fired: true,
                start: event.time,
                end: event.time
            });
        }
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
                    casts.entry(event.src_agent_id)
                        .or_insert(vec![])
                        .push(SkillCast {
                        id: event.skill_id,
                        fired: fired,
                        start: start_time,
                        end: time
                    });
                },
            }
        } else if let Some(buff_event) = get_buff_event(&event) {
            let buff_events = buff_events_players
                .entry(event.src_agent_id)
                .or_insert(HashMap::new());
            if let Some(events) = buff_events.get_mut(&event.skill_id) {
                if let Some(last_event) = events.last() {
                    // There may be a remove event at the same time as an apply event to show that
                    // it removed the remainder of a 1-stack buff before the apply
                    if last_event.time() == event.time {
                        match (last_event, &buff_event) {
                            (BuffEvent::Apply(_), BuffEvent::Remove(_)) => {
                                events.insert(events.len() - 1, buff_event);
                                continue;
                            },
                            _ => {},
                        }
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

    let boss = get_boss_name(evtc.boss.instance_id);

    let mut players = vec![];
    for agent in evtc.agents {
        match agent.agent {
            parser::AgentType::Player { .. } => {
                players.push(agent);
            },
            _ => {},
        }
    }

    Ok(json!({
        "boss": boss,
        "players": players,
        "start": start,
        "end": end,
        "skills": skills,
        "casts": casts,
        "buffs": buff_events_players,
    }))
}

#[wasm_bindgen]
pub fn generate_object(contents: Vec<u8>) -> JsValue {
    JsValue::from_serde(&generate_output(contents).unwrap()).unwrap()
}
