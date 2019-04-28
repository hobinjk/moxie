use nom::{IResult, le_u64, le_u32, le_i32, le_u16, le_u8};

use serde::Serialize;
use std::str::from_utf8;

#[derive(Debug, Serialize)]
pub struct Evtc<'a> {
    pub boss: Boss<'a>,
    pub agents: Vec<Agent<'a>>,
    pub skills: Vec<Skill<'a>>,
    pub events: Vec<Event>,
}

pub fn evtc_parser<'a>(input: &'a [u8]) -> IResult<&'a [u8], Evtc<'a>> {
    do_parse!(input,
        boss: boss_parser >>
        agents: length_count!(le_u32, agent_parser) >>
        skills: length_count!(le_u32, skill_parser) >>
        events: many0!(complete!(match boss.event_format {
            EventFormat::Zero => event_parser_ver_zero,
            EventFormat::One => event_parser_ver_one,
        })) >>
        (Evtc {
            boss: boss,
            agents: agents,
            skills: skills,
            events: events,
        })
        )
}

#[derive(Debug, Serialize)]
enum EventFormat {
    Zero,
    One
}

#[derive(Debug, Serialize)]
pub struct Boss<'a> {
    pub build_version: &'a [u8],
    event_format: EventFormat,
    pub instance_id: u16,
}

fn boss_parser<'a>(input: &'a [u8]) -> IResult<&'a [u8], Boss<'a>> {
    do_parse!(input,
        build_version: take!(12) >>
        event_format: le_u8 >>
        instance_id: le_u16 >>
        take!(1) >>
        (Boss {
            build_version: build_version,
            event_format: match event_format {
                1 => EventFormat::One,
                _ => EventFormat::Zero,
            },
            instance_id: instance_id
        })
        )
}

#[derive(Debug, Serialize)]
pub enum AgentType {
    Gadget {id: u32},
    NPC {id: u32},
    Player {profession: u32, spec: u32},
}

#[derive(Debug, Serialize)]
pub struct Agent<'a> {
    pub id: u64,
    pub agent: AgentType,
    pub toughness: u32,
    pub healing: u32,
    pub condition: u32,
    pub name: &'a str,
}

fn agent_type_parser(profession: u32, is_elite: u32) -> AgentType {
    if is_elite == 0xffffffffu32 {
        if (profession & 0xffff0000u32) == 0xffff0000u32 {
            AgentType::Gadget {id: profession & 0xffffu32}
        } else {
            AgentType::NPC {id: profession & 0xffffu32}
        }
    } else {
        AgentType::Player {
            profession: profession,
            spec: is_elite
        }
    }
}

fn name_parser<'a>(raw_name: &'a str) -> &'a str {
    raw_name.split('\0').next().unwrap_or("")
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
            agent: agent_type_parser(profession, is_elite),
            toughness: toughness,
            healing: healing,
            condition: condition,
            name: name_parser(name)
        })
        )
}

#[derive(Debug, Serialize)]
pub struct Skill<'a> {
    pub id: u32,
    pub name: &'a str,
}

fn skill_parser<'a>(input: &'a [u8]) -> IResult<&'a [u8], Skill<'a>> {
    do_parse!(input,
        id: le_u32 >>
        name: map_res!(take!(64), from_utf8) >>
        (Skill {
            id: id,
            name: name_parser(name),
        })
        )
}

#[derive(Debug, Serialize)]
#[repr(u8)]
pub enum IFF {
    Friend,
    Foe,
    Unknown,
}

fn parse_iff(input: u8) -> IFF {
    match input {
        0 => IFF::Friend,
        1 => IFF::Foe,
        _ => IFF::Unknown,
    }
}

#[derive(Debug, Serialize)]
#[repr(u8)]
pub enum CombatResult {
    Normal,
    Crit,
    Glance,
    Block,
    Evade,
    Interrupt,
    Absorb,
    Blind,
    KillingBlow,
    Downed,
    Unknown,
}

fn parse_combat_result(input: u8) -> CombatResult {
    match input {
        0 => CombatResult::Normal,
        1 => CombatResult::Crit,
        2 => CombatResult::Glance,
        3 => CombatResult::Block,
        4 => CombatResult::Evade,
        5 => CombatResult::Interrupt,
        6 => CombatResult::Absorb,
        7 => CombatResult::Blind,
        8 => CombatResult::KillingBlow,
        9 => CombatResult::Downed,
        _ => CombatResult::Unknown,
    }
}

#[derive(Debug, PartialEq, Serialize)]
#[repr(u8)]
pub enum CombatActivation {
    None,
    Normal,
    Quickness,
    CancelFire,
    CancelCancel,
    Reset,
    Unknown,
}

fn parse_combat_activation(input: u8) -> CombatActivation {
    match input {
        0 => CombatActivation::None,
        1 => CombatActivation::Normal,
        2 => CombatActivation::Quickness,
        3 => CombatActivation::CancelFire,
        4 => CombatActivation::CancelCancel,
        5 => CombatActivation::Reset,
        _ => CombatActivation::Unknown,
    }
}

#[repr(u8)]
#[derive(Debug, PartialEq, Serialize)]
pub enum CombatStateChange {
    None = 0,
    EnterCombat,
    ExitCombat,
    ChangeUp,
    ChangeDead,
    ChangeDown,
    Spawn,
    Despawn,
    HealthUpdate,
    LogStart,
    LogEnd,
    WeaponSwap,
    MaxHealthUpdate,
    PointOfView,
    Language,
    GWBuild,
    ShardId,
    Reward,
    BuffInitial,
    Position,
    Velocity,
    Facing,
    TeamChange,
    AttackTarget,
    Targetable,
    MapId,
    ReplInfo,
    StackActive,
    StackReset,
    Guild,
    Unknown,
}

fn parse_combat_state_change(input: u8) -> CombatStateChange {
    match input {
        0 => CombatStateChange::None,
        1 => CombatStateChange::EnterCombat,
        2 => CombatStateChange::ExitCombat,
        3 => CombatStateChange::ChangeUp,
        4 => CombatStateChange::ChangeDead,
        5 => CombatStateChange::ChangeDown,
        6 => CombatStateChange::Spawn,
        7 => CombatStateChange::Despawn,
        8 => CombatStateChange::HealthUpdate,
        9 => CombatStateChange::LogStart,
        10 => CombatStateChange::LogEnd,
        11 => CombatStateChange::WeaponSwap,
        12 => CombatStateChange::MaxHealthUpdate,
        13 => CombatStateChange::PointOfView,
        14 => CombatStateChange::Language,
        15 => CombatStateChange::GWBuild,
        16 => CombatStateChange::ShardId,
        17 => CombatStateChange::Reward,
        18 => CombatStateChange::BuffInitial,
        19 => CombatStateChange::Position,
        20 => CombatStateChange::Velocity,
        21 => CombatStateChange::Facing,
        22 => CombatStateChange::TeamChange,
        23 => CombatStateChange::AttackTarget,
        24 => CombatStateChange::Targetable,
        25 => CombatStateChange::MapId,
        26 => CombatStateChange::ReplInfo,
        27 => CombatStateChange::StackActive,
        28 => CombatStateChange::StackReset,
        29 => CombatStateChange::Guild,
        _ => CombatStateChange::Unknown,
    }
}

#[repr(u8)]
#[derive(Debug, PartialEq, Serialize)]
pub enum CombatBuffRemove {
    None = 0,
    All,
    Single,
    Manual,
    Unknown,
}

fn parse_combat_buff_remove(input: u8) -> CombatBuffRemove {
    match input {
        0 => CombatBuffRemove::None,
        1 => CombatBuffRemove::All,
        2 => CombatBuffRemove::Single,
        3 => CombatBuffRemove::Manual,
        _ => CombatBuffRemove::Unknown,
    }
}

#[derive(Debug, Serialize)]
pub struct Event {
    pub time: u64,
    pub src_agent_id: u64,
    pub dst_agent_id: u64,
    pub value: i32,
    pub buff_damage: i32,
    pub overstack_value: u32,
    pub skill_id: u32,
    pub src_instance_id: u16,
    pub dst_instance_id: u16,
    pub src_master_instance_id: u16,
    pub dst_master_instance_id: Option<u16>,
    pub iff: IFF,
    pub buff: u8,
    pub combat_result: CombatResult,
    pub combat_activation: CombatActivation,
    pub combat_buff_remove: CombatBuffRemove,
    pub is_ninety: u8,
    pub is_fifty: u8,
    pub is_moving: u8,
    pub combat_state_change: CombatStateChange,
    pub is_flanking: u8,
    pub is_shields: u8,
}

fn event_parser_ver_zero(input: &[u8]) -> IResult<&[u8], Event> {
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
        combat_result: le_u8 >>
        combat_activation: le_u8 >>
        combat_buff_remove: le_u8 >>
        is_ninety: le_u8 >>
        is_fifty: le_u8 >>
        is_moving: le_u8 >>
        combat_state_change: le_u8 >>
        is_flanking: le_u8 >>
        is_shields: le_u8 >>
        take!(2) >>
        (Event {
            time: time,
            src_agent_id: src_agent_id,
            dst_agent_id: dst_agent_id,
            value: value,
            buff_damage: buff_damage,
            overstack_value: overstack_value as u32,
            skill_id: skill_id as u32,
            src_instance_id: src_instance_id,
            dst_instance_id: dst_instance_id,
            src_master_instance_id: src_master_instance_id,
            dst_master_instance_id: None,
            iff: parse_iff(iff),
            buff: buff,
            combat_result: parse_combat_result(combat_result),
            combat_activation: parse_combat_activation(combat_activation),
            combat_buff_remove: parse_combat_buff_remove(combat_buff_remove),
            is_ninety: is_ninety,
            is_fifty: is_fifty,
            is_moving: is_moving,
            combat_state_change: parse_combat_state_change(combat_state_change),
            is_flanking: is_flanking,
            is_shields: is_shields,
        })
        )
}

fn event_parser_ver_one(input: &[u8]) -> IResult<&[u8], Event> {
    do_parse!(input,
        time: le_u64 >>
        src_agent_id: le_u64 >>
        dst_agent_id: le_u64 >>
        value: le_i32 >>
        buff_damage: le_i32 >>
        overstack_value: le_u32 >>
        skill_id: le_u32 >>
        src_instance_id: le_u16 >>
        dst_instance_id: le_u16 >>
        src_master_instance_id: le_u16 >>
        dst_master_instance_id: le_u16 >>
        iff: le_u8 >>
        buff: le_u8 >>
        combat_result: le_u8 >>
        combat_activation: le_u8 >>
        combat_buff_remove: le_u8 >>
        is_ninety: le_u8 >>
        is_fifty: le_u8 >>
        is_moving: le_u8 >>
        combat_state_change: le_u8 >>
        is_flanking: le_u8 >>
        is_shields: le_u8 >>
        _is_offcycle: le_u8 >>
        take!(4) >>
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
            dst_master_instance_id: Some(dst_master_instance_id),
            iff: parse_iff(iff),
            buff: buff,
            combat_result: parse_combat_result(combat_result),
            combat_activation: parse_combat_activation(combat_activation),
            combat_buff_remove: parse_combat_buff_remove(combat_buff_remove),
            is_ninety: is_ninety,
            is_fifty: is_fifty,
            is_moving: is_moving,
            combat_state_change: parse_combat_state_change(combat_state_change),
            is_flanking: is_flanking,
            is_shields: is_shields,
        })
        )
}
