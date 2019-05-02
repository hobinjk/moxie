function parseHTML(html) {
  console.log(html);
  let eiData = JSON.parse(/var logData = (.+);\r/.exec(html)[1]);
  let player0Details = JSON.parse(
    /logData\.players\[0\]\.details = (.+);\r/.exec(html)[1]);
  eiData.players[0].details = player0Details;

  console.log('wah', /var usedSkills = (.*);\r/.exec(html)[1]);
  const usedSkills = JSON.parse(
    /var usedSkills = (.+?);/.exec(html)[1]);
  const usedBoons = JSON.parse(
    /var usedBoons = (.+?);/.exec(html)[1]);
  const _usedDamageMods = JSON.parse(
    /var usedDamageMods = (.+?);/.exec(html)[1]);

  const usedStuff = usedSkills.concat(usedBoons);

  return eiLogDataToLog(eiData, usedStuff);
}

function eiLogDataToLog(eiData, usedStuff) {
  let details = eiData.players[0].details;

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

  let skills = {};

  for (let usedThing of usedStuff) {
    skills[usedThing.id] = usedThing.name;
  }

  return {
    buffs,
    casts,
    skills,
    start: 0,
    end: eiData.phases[0].end * 1000,
  };
}

export default {
  parseHTML,
};
