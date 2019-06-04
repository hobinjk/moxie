function parseHTML(html) {
  console.log(html);
  let eiData = JSON.parse(/var logData = (.+?);/.exec(html)[1]);

  for (let i = 0; i < eiData.players.length; i++) {
    let playerRe = new RegExp(`logData\\.players\\[${i}\\]\\.details = (.+?);`);
    let detailsRaw = playerRe.exec(html);
    if (detailsRaw && detailsRaw.length > 1) {
      let details = JSON.parse(detailsRaw[1]);
      eiData.players[i].details = details;
    }
  }

  const usedSkills = JSON.parse(
    /var usedSkills = (.+?);/.exec(html)[1]);
  const usedBoons = JSON.parse(
    /var usedBoons = (.+?);/.exec(html)[1]);

  const usedStuff = usedSkills.concat(usedBoons);

  return eiLogDataToLog(eiData, usedStuff);
}

function eiLogDataToLog(eiData, usedStuff) {
  console.log('you need thihs', eiData);
  let allBuffs = {};
  let allCasts = {};
  let players = eiData.players.map((player, i) => {
    return {
      id: i,
      name: player.name,
      agent: {
        Player: {
          prof_spec: player.profession,
        },
      },
    };
  });

  for (let i = 0; i < eiData.players.length; i++) {
    if (!eiData.players[i].hasOwnProperty('details')) {
      continue;
    }
    let details = eiData.players[i].details;


    let buffs = {};
    for (let boon of details.boonGraph[0]) {
      buffs[boon.id] = [];
      for (let state of boon.states) {
        let time = state[0] * 1000;
        let stacks = state[1];
        // TODO care about stack numbers
        if (stacks === 0) {
          buffs[boon.id].push({Remove: time});
        } else {
          buffs[boon.id].push({Apply: time});
        }
      }
    }

    let casts = [];
    for (let cast of details.rotation[0]) {
      let time = cast[0] * 1000;
      let id = cast[1];
      let duration = cast[2]; // this is in ms
      let endEvent = cast[3];
      let _quicknessProbably = cast[4];
      casts.push({
        id,
        start: time,
        end: time + duration,
        fired: endEvent !== 2,
      });
    }

    allBuffs[i] = buffs;
    allCasts[i] = casts;
  }

  let skills = {};

  for (let usedThing of usedStuff) {
    skills[usedThing.id] = usedThing.name;
  }

  return {
    boss: eiData.fightName,
    players,
    start: 0,
    end: eiData.phases[0].end * 1000,
    skills,
    casts: allCasts,
    buffs: allBuffs,
  };
}

export default {
  parseHTML,
};
