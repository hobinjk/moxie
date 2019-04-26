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

#[derive(Debug, Serialize)]
enum SkillEvent {
    Start(u64),
    Cancel(u64),
    Fire(u64),
}

fn get_skill_event(event: &parser::Event) -> Option<SkillEvent> {
    match event.combat_activation {
        parser::CombatActivation::None => None,
        parser::CombatActivation::Normal |
        parser::CombatActivation::Quickness => Some(SkillEvent::Start(event.time)),
        parser::CombatActivation::CancelCancel => Some(SkillEvent::Cancel(event.time)),
        parser::CombatActivation::CancelFire |
        parser::CombatActivation::Reset => Some(SkillEvent::Fire(event.time)),
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

    let mut buff_events: HashMap<u32, Vec<BuffEvent>> = HashMap::new();
    let mut skill_events: HashMap<u32, Vec<SkillEvent>> = HashMap::new();
    for event in &evtc.events {
        if let Some(skill_event) = get_skill_event(&event) {
            skill_events.entry(event.skill_id)
                .or_insert(vec![])
                .push(skill_event);
        }
        if let Some(buff_event) = get_buff_event(&event) {
            if let Some(events) = buff_events.get_mut(&event.skill_id) {
                events.push(buff_event);
            } else {
                buff_events.insert(event.skill_id, vec![buff_event]);
            }
        }
    }
    println!("const skills = {};", serde_json::to_string(&evtc.skills)?);
    println!("const casts = {};", serde_json::to_string(&skill_events)?);
    println!("const buffs = {};", serde_json::to_string(&buff_events)?);
    Ok(())
}
