async function getJson(permalink) {
  const res = await fetch(`https://dps.report/getJson?permalink=${permalink}`);
  const json = await res.json();

  if (json.hasOwnProperty('error')) {
    alert(`failed to fetch that log, message from dps.report: "${json.error}"`);
    return;
  }
  return eiLogDataToLog(json, []);
}

function parseJson(json) {
  return eiLogDataToLog(json, []);
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
  let targetDamage1S = {};

  let players = eiData.players.map((player, i) => {
    return Object.assign({
      id: i,
    }, player);
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
    const tdps = eiData.players[i].targetDamage1S;
    if (tdps && tdps[0]) {
      targetDamage1S[i] = tdps[0][0];
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
    targetDamage1S,
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

  if (!player.rotation) {
    player.rotation = [];
  }
  for (let skill of player.rotation) {
    let id = skill.id;
    for (let cast of skill.skills) {
      let start = cast.castTime;
      let end = start + cast.duration;
      let fired = cast.duration + cast.timeGained > 0;
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
  parseJson,
  getJson,
};
