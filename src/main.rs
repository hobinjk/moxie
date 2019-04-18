#[macro_use]
extern crate nom;

use nom::{IResult, le_u64, le_u32, le_i32, le_u16, le_u8};

use std::str::from_utf8;
use std::fs::File;
use std::io::prelude::*;

#[derive(Debug)]
pub struct Evtc<'a> {
    boss: Boss<'a>,
    agents: Vec<Agent<'a>>,
    skills: Vec<Skill<'a>>,
    events: Vec<Event>,
}

pub fn evtc_parser<'a>(input: &'a [u8]) -> IResult<&'a [u8], Evtc<'a>> {
    do_parse!(input,
        boss: boss_parser >>
        agents: length_count!(le_u32, agent_parser) >>
        skills: length_count!(le_u32, skill_parser) >>
        events: many0!(complete!(event_parser)) >>
        (Evtc {
            boss: boss,
            agents: agents,
            skills: skills,
            events: events,
        })
        )
}

#[derive(Debug)]
pub struct Boss<'a> {
    build_version: &'a [u8],
    instance_id: u16,
}

fn boss_parser<'a>(input: &'a [u8]) -> IResult<&'a [u8], Boss<'a>> {
    do_parse!(input,
        build_version: take!(12) >>
        take!(1) >>
        instance_id: le_u16 >>
        take!(1) >>
        (Boss {
            build_version: build_version,
            instance_id: instance_id
        })
        )
}

#[derive(Debug)]
pub struct Agent<'a> {
    id: u64,
    profession: u32,
    is_elite: u32,
    toughness: u32,
    healing: u32,
    condition: u32,
    name: &'a str,
}

fn agent_parser<'a>(input: &'a [u8]) -> IResult<&'a [u8], Agent<'a>> {
    do_parse!(input,
        id: le_u64 >>
        profession: le_u32 >>
        is_elite: le_u32 >>
        toughness: le_u32 >>
        healing: le_u32 >>
        condition: le_u32 >>
        name: map_res!(take!(68), from_utf8) >>
        (Agent {
            id: id,
            profession: profession,
            is_elite: is_elite,
            toughness: toughness,
            healing: healing,
            condition: condition,
            name: name
        })
        )
}

#[derive(Debug)]
pub struct Skill<'a> {
    id: u32,
    name: &'a str,
}

fn skill_parser<'a>(input: &'a [u8]) -> IResult<&'a [u8], Skill<'a>> {
    do_parse!(input,
        id: le_u32 >>
        name: map_res!(take!(64), from_utf8) >>
        (Skill {
            id: id,
            name: name,
        })
        )
}

#[derive(Debug)]
pub struct Event {
    time: u64,
    src_agent_id: u64,
    dst_agent_id: u64,
    value: i32,
    buff_damage: i32,
    overstack_value: u16,
    skill_id: u16,
    src_instance_id: u16,
    dst_instance_id: u16,
    src_master_instance_id: u16,
    iff: u8,
    buff: u8,
    result: u8,
    is_activation: u8,
    is_buff_remove: u8,
    is_ninety: u8,
    is_fifty: u8,
    is_moving: u8,
    is_state_change: u8,
    is_flanking: u8,
    is_shields: u8,
}

fn event_parser(input: &[u8]) -> IResult<&[u8], Event> {
    do_parse!(input,
        time: le_u64 >>
        src_agent_id: le_u64 >>
        dst_agent_id: le_u64 >>
        value: le_i32 >>
        buff_damage: le_i32 >>
        overstack_value: le_u16 >>
        skill_id: le_u16 >>
        src_instance_id: le_u16 >>
        dst_instance_id: le_u16 >>
        src_master_instance_id: le_u16 >>
        take!(9) >>
        iff: le_u8 >>
        buff: le_u8 >>
        result: le_u8 >>
        is_activation: le_u8 >>
        is_buff_remove: le_u8 >>
        is_ninety: le_u8 >>
        is_fifty: le_u8 >>
        is_moving: le_u8 >>
        is_state_change: le_u8 >>
        is_flanking: le_u8 >>
        is_shields: le_u8 >>
        take!(2) >>
        (Event {
            time: time,
            src_agent_id: src_agent_id,
            dst_agent_id: dst_agent_id,
            value: value,
            buff_damage: buff_damage,
            overstack_value: overstack_value,
            skill_id: skill_id,
            src_instance_id: src_instance_id,
            dst_instance_id: dst_instance_id,
            src_master_instance_id: src_master_instance_id,
            iff: iff,
            buff: buff,
            result: result,
            is_activation: is_activation,
            is_buff_remove: is_buff_remove,
            is_ninety: is_ninety,
            is_fifty: is_fifty,
            is_moving: is_moving,
            is_state_change: is_state_change,
            is_flanking: is_flanking,
            is_shields: is_shields,
        })
        )
}

fn main() -> std::io::Result<()> {
    let mut file = File::open("test.evtc")?;
    let mut contents = vec![];
    file.read_to_end(&mut contents)?;
    let (_, evtc) = evtc_parser(&contents).map_err(|_| std::io::Error::new(std::io::ErrorKind::Other, "I don't care"))?;
    println!("Hello, world! {:?}", evtc);
    Ok(())
}
