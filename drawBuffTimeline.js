import SkillIds from './SkillIds';

const boringBuffs = {
  'Do Nothing Transformation Buff': true,
  'Conjure Fire Attributes': true,
  'Conjure Fiery Greatsword': true,
  'Number of Boons': true,
  'Ride the Lightning': true,
  'Signet of Restoration': true,
  'Elemental Refreshment': true,
  'Fire Aura': true,
  'Fire Attunement': true,
  'Water Attunement': true,
  'Air Attunement': true,
  'Earth Attunement': true,
  'The Light of Deldrimor': true,
  'Hylek Language Effect': true,
  'Incoming!': true,
  'Jump Mushroom Knowledge': true,
  'Mushroom Tracking Knowledge': true,
  'Nuhoch Alchemy': true,
  'Radiant Attunement': true,
  'Speed Mushroom Knowledge': true,
  'Solar Beam': true,
  'Stealth Gliding': true,
  'Xera\'s Fury': true,
};

const profSpecificBuffs = {
  // Weaver
  'Fire/Fire': 0,
  'Earth/Fire': 1,
  'Earth/Earth': 2,
  'Fire/Earth': 3,
  'Fire/Water': 4,
  'Water/Fire': 5,
  'Water/Earth': 6,
  'Air/Water': 7,
  'Air/Fire': 8,
  'Air/Air': 9,
  'Fire/Air': 10,
  'Primordial Stance': 11,
  'Elements of Rage': 12,
  'Signet of Fire': 13,
  'Glyph of Elemental Power (Fire)': 14,
  'Magnetic Wave': 15,
  'Weaver\'s Prowess': 16,
  // Chrono
  'Fencer\'s Finess': 0,
  'Time Anchored': 1,
  'Signet of the Ether': 2,
  // Daredevil
  'Assassin\'s Signet (Passive)': 0,
  'Assassin\'s Signet (Active)': 1,
  'Bounding Dodger': 2,
  Revealed: 3,
  // Mirage
  'Mirage Cloak': 0,
  // Renegade
  'Legendary Demon Stance': 0,
  'Legendary Assassin Stance': 1,
  'Legendary Renegade Stance': 2,
  'Embrace the Darkness': 3,
  'Impossible Odds': 4,
  'Razorclaw\'s Rage': 5,
  'Improved Kalla\'s Fervor': 6,
  // Firebrand
  'Zealot\'s Flame': 0,
  'Renewed Focus': 1,
  'Ashes of the Just': 2,
  // Dragonhunter
  'Symbolic Avenger': 0,
  'Shield of Wrath': 1,
  'Spear of Justice': 2,
  Justice: 3,

  // Soulbeast
  'One Wolf Pack': 0,
  'Sharpening Stone': 1,
  'Sic \'Em!': 2,
  'Twice as Vicious': 3,
};

function recreateJusticeFromSpearPassive(log) {
  const buffs = log.buffs;
  if (!buffs.hasOwnProperty(SkillIds.SPEAR_OF_JUSTICE)) {
    console.log('no spear', log);
    return;
  }
  const soj = buffs[SkillIds.SPEAR_OF_JUSTICE];
  const fakeJusticeEvents = [];
  for (const buffEvent of soj) {
    if (!buffEvent.hasOwnProperty('Remove')) {
      continue;
    }
    const time = buffEvent.Remove;
    if (time === 0) {
      continue;
    }
    const justiceDur = 6000 * 1.33; // 6000 base plus Big Game Hunter trait
    fakeJusticeEvents.push({Apply: time});
    fakeJusticeEvents.push({Remove: time + justiceDur});
  }
  buffs[SkillIds.JUSTICE] = fakeJusticeEvents;
  log.skills[SkillIds.JUSTICE] = 'Justice';
  console.log('did the thing', log);
}

function draw(board, legend, log, startRow, dimensions, showBoring) {
  const {railHeight, railPad, timeToX} = dimensions;

  recreateJusticeFromSpearPassive(log);

  let buffs = log.buffs;

  if (!showBoring) {
    buffs = {};
    for (const id in log.buffs) {
      const buffName = log.skills[id];
      if (profSpecificBuffs.hasOwnProperty(buffName)) {
        buffs[id] = log.buffs[id];
      }
    }
  }

  const buffIds = Object.keys(buffs).sort((a, b) => {
    let aName = log.skills[a];
    let bName = log.skills[b];
    if (profSpecificBuffs.hasOwnProperty(aName)) {
      if (profSpecificBuffs.hasOwnProperty(bName)) {
        return profSpecificBuffs[aName] - profSpecificBuffs[bName];
      }
      return -1;
    } else if (profSpecificBuffs.hasOwnProperty(bName)) {
      return 1;
    }
    return aName.localeCompare(bName);
  });

  let row = startRow;
  for (const buffId of buffIds) {
    // if (/^[+(12]/.test(skills[buffId])) {
    //   continue;
    // }
    if (!/^[A-Z]/.test(log.skills[buffId])) {
      continue;
    }

    if (log.skills[buffId].startsWith('Guild')) {
      continue;
    }

    if (boringBuffs[log.skills[buffId]]) {
      continue;
    }

    const rects = [];
    for (const event of buffs[buffId]) {
      if (event.Apply) {
        const rect = document.createElementNS('http://www.w3.org/2000/svg',
                                              'rect');
        rect.setAttribute('x', timeToX(event.Apply));
        rect.setAttribute('y', (railHeight + railPad) * row);
        rect.setAttribute('height', railHeight);
        rects.push(rect);
      }
      if (event.Remove) {
        let rect = rects.pop();
        if (!rect) {
          rect = document.createElementNS('http://www.w3.org/2000/svg',
                                          'rect');
          rect.setAttribute('x', timeToX(log.start));
          rect.setAttribute('y', (railHeight + railPad) * row);
          rect.setAttribute('height', railHeight);
        }
        rect.setAttribute('width', timeToX(event.Remove) -
                          rect.getAttribute('x'));
        rect.classList.add('buff');
        board.appendChild(rect);
      }
    }
    for (const rect of rects.reverse()) {
      rect.setAttribute('width', timeToX(log.end) - rect.getAttribute('x'));
      rect.classList.add('buff');
      board.appendChild(rect);
    }
    const name = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    name.textContent = log.skills[buffId];
    name.setAttribute('x', 0);
    name.setAttribute('y', row * (railHeight + railPad) + railHeight / 2);
    name.classList.add('name');
    legend.appendChild(name);
    row += 1;
  }

  return row - startRow;
}

export default draw;
