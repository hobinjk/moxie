extern crate moxie;

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
    println!("{:?}", moxie::generate_output(contents)?);

    Ok(())
}


