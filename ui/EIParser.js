async function getJson(permalink) {
  const res = await fetch(`https://dps.report/getJson?permalink=${permalink}`);
  const json = await res.json();
  return eiLogDataToLog(json, []);
}

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

  let usedStuff = [];
  try {
    const usedSkills = JSON.parse(
      /var usedSkills = (.+?);/.exec(html)[1]);
    const usedBoons = JSON.parse(
      /var usedBoons = (.+?);/.exec(html)[1]);

    usedStuff = usedSkills.concat(usedBoons);
  } catch (e) {
    console.warn('new EI format', e);
  }

  return eiLogDataToLog(eiData, usedStuff);
}

function eiLogDataToLog(eiData, usedStuff) {
  if (eiData.skillMap) {
    for (const skillKey in eiData.skillMap) {
      const skill = eiData.skillMap[skillKey];
      if (!skill.id) {
        skill.id = skillKey.substr(1);
      }
      usedStuff.push(skill);
    }
  }
  if (eiData.buffMap) {
    for (const buffKey in eiData.buffMap) {
      const buff = eiData.buffMap[buffKey];
      if (!buff.id) {
        buff.id = buffKey.substr(1);
      }
      usedStuff.push(buff);
    }
  }

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

  let apiMode = false;
  for (let i = 0; i < eiData.players.length; i++) {
    if (eiData.players[i].hasOwnProperty('details')) {
      let {buffs, casts} = parseHtmlData(eiData.players[i].details);
      allBuffs[i] = buffs;
      allCasts[i] = casts;
    } else {
      let {buffs, casts} = parseApiData(eiData.players[i]);
      apiMode = true;
      allBuffs[i] = buffs;
      allCasts[i] = casts;
    }
  }

  let skills = {};

  for (let usedThing of usedStuff) {
    skills[usedThing.id] = usedThing.name;
  }

  let timeMul = apiMode ? 1 : 1000;
  return {
    boss: eiData.fightName,
    players,
    start: eiData.phases[0].start * timeMul,
    end: eiData.phases[0].end * timeMul,
    skills,
    casts: allCasts,
    buffs: allBuffs,
  };
}

function parseHtmlData(details) {
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
  for (let rotation of details.rotation) {
    if (!rotation[0]) {
      continue;
    }
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
  }

  return {buffs, casts};
}

function parseApiData(player) {
  let buffs = {};
  let casts = [];

  for (let buff of player.buffUptimes) {
    buffs[buff.id] = [];
    for (let state of buff.states) {
      let [time, stacks] = state;
      if (stacks === 0) {
        buffs[buff.id].push({Remove: time});
      } else {
        buffs[buff.id].push({Apply: time});
      }
    }
  }

  for (let skill of player.rotation) {
    let id = skill.id;
    for (let cast of skill.skills) {
      let start = cast.castTime;
      let end = start + cast.duration;
      let fired = cast.duration + cast.timeGained >= 0;
      casts.push({
        id,
        start,
        end,
        fired,
      });
    }
  }

  return {buffs, casts};
}

export default {
  parseHTML,
  getJson,
};
