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

    println!("boss: {}", evtc.boss.instance_id);

    let mut bosses: HashMap<u32, &str> = HashMap::new();
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

    println!("agents:");

    for agent in evtc.agents {
        println!("  {}: {:?}", agent.name, agent.agent);
        match agent.agent {
            moxie::parser::AgentType::Player {prof_spec} => {
                println!("    profspec: {:?}", prof_spec);
            },
            _ => {},
        }
    }

    Ok(())
}


