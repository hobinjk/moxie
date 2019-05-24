extern crate moxie;

use std::collections::HashMap;
use std::io::Read;
use std::fs::File;

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
    let raw_evtc = moxie::generate_raw_evtc(contents)?;
    let (_, evtc) = moxie::parser::evtc_parser(&raw_evtc).map_err(|_| std::io::Error::new(std::io::ErrorKind::Other, "I don't care"))?;


    println!("boss: {}", moxie::get_boss_name(evtc.boss.instance_id));
    println!("players:");

    for agent in evtc.agents {
        match agent.agent {
            moxie::parser::AgentType::Player {prof_spec} => {
                println!("  {}: {:?}", agent.name, prof_spec);
            },
            _ => {},
        }
    }

    Ok(())
}


