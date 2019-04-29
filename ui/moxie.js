/* global skills, buffs, casts, logStart, logEnd, generateReportCard */

const width = 1920 * 4;
const railHeight = 20;
const railPad = 4;

const video = document.querySelector('.gameplay-video');
const timeline = document.querySelector('.timeline');
const board = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
board.style.width = width + 'px';

let row = 0;
function timeToX(time) {
  return width * (time - logStart) / (logEnd - logStart);
}

const bonusSkills = {
  43229: 'Fire/Air',
  43470: 'Fire/Fire',
  42811: 'Air/Fire',
  42264: 'Air/Air',
};

for (const id in bonusSkills) {
  skills[id] = bonusSkills[id];
}


row += 1;

const boringBuffs = {
  'Do Nothing Transformation Buff': true,
  'Conjure Fire Attributes': true,
  'Ride the Lightning': true,
  'Signet of Restoration': true,
  'Elemental Refreshment': true,
  'Fire Aura': true,
  'Fire Attunement': true,
  'Water Attunement': true,
  'Air Attunement': true,
  'Earth Attunement': true,
};

const weaverBuffs = {
  'Fire/Fire': 0,
  'Air/Fire': 1,
  'Air/Air': 2,
  'Fire/Air': 3,
  // 'Fire Attunement': 0,
  // 'Water Attunement': 1,
  // 'Air Attunement': 2,
  // 'Earth Attunement': 3,
  'Elements of Rage': 4,
  'Primordial Stance': 5,
};

const buffIds = Object.keys(buffs).sort((a, b) => {
  let aName = skills[a];
  let bName = skills[b];
  if (weaverBuffs.hasOwnProperty(aName)) {
    if (weaverBuffs.hasOwnProperty(bName)) {
      return weaverBuffs[aName] - weaverBuffs[bName];
    }
    return -1;
  } else if (weaverBuffs.hasOwnProperty(bName)) {
    return 1;
  }
  return aName.localeCompare(bName);
});

for (const buffId of buffIds) {
  // if (/^[+(12]/.test(skills[buffId])) {
  //   continue;
  // }
  if (!/^[A-Z]/.test(skills[buffId])) {
    continue;
  }

  if (skills[buffId].startsWith('Guild')) {
    continue;
  }

  if (boringBuffs[skills[buffId]]) {
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
      const rect = rects.pop();
      if (!rect) {
        continue;
      }
      rect.setAttribute('width', timeToX(event.Remove) -
                        rect.getAttribute('x'));
      rect.classList.add('buff');
      board.appendChild(rect);
    }
  }
  for (const rect of rects.reverse()) {
    rect.setAttribute('width', timeToX(logEnd) - rect.getAttribute('x'));
    rect.classList.add('buff');
    board.appendChild(rect);
  }
  const name = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  name.textContent = skills[buffId];
  name.setAttribute('x', 0);
  name.setAttribute('y', row * (railHeight + railPad) + railHeight / 2);
  name.classList.add('name');
  board.appendChild(name);
  row += 1;
}

board.style.height = row * (railHeight + railPad) - railPad + 'px';
timeline.appendChild(board);

const skillData = {};
async function getSkillData(id) {
  try {
    const res = await fetch(`api-cache/${id}.json`);
    const data = await res.json();
    skillData[id] = data;
  } catch (e) {
    console.log('could not fetch', id);
  }
}

const usedSkills = {};
for (let cast of casts) {
  usedSkills[cast.id] = true;
}

async function load() {
  await Promise.all(Object.keys(usedSkills).map(getSkillData));
  draw();
}

function draw() {
  for (const cast of casts) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    const title = document.createElementNS('http://www.w3.org/2000/svg',
                                           'title');
    title.textContent = skills[cast.id] || cast.id;

    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.classList.add('cast');
    if (!cast.fired) {
      rect.classList.add('cancel');
    }

    let text = null;

    let data = skillData[cast.id];
    if (data && data.slot) {
      let content = '';
      let matches = skillData[cast.id].slot.match(/Weapon_(\d)/);
      if (matches && matches.length > 0) {
        content = matches[1];
        if (skillData[cast.id].prev_chain && !skillData[cast.id].next_chain) {
          content += 'f';
        }
      }
      if (data.slot === 'Elite') {
        content = 'E';
      } else if (data.slot === 'Utility') {
        content = 'U';
      }

      text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', timeToX(cast.start));
      text.setAttribute('y', railHeight / 2);
      text.classList.add('name');
      text.textContent = content;
    }

    rect.setAttribute('x', timeToX(cast.start));
    rect.setAttribute('y', 0);
    rect.setAttribute('width', timeToX(cast.end) - timeToX(cast.start));
    rect.setAttribute('height', railHeight);

    g.appendChild(title);
    g.appendChild(rect);
    if (text) {
      g.appendChild(text);
    }
    board.appendChild(g);
  }

  const needle = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  needle.setAttribute('x', 0);
  needle.setAttribute('y', 0);
  needle.setAttribute('width', 2);
  needle.setAttribute('height', row * (railHeight + railPad) - railPad);
  needle.classList.add('needle');
  board.appendChild(needle);

  video.addEventListener('timeupdate', function() {
    needle.setAttribute('x', timeToX((video.currentTime - 1.555) * 1000) -
                        timeToX(0));
  });

  generateReportCard();
}

load();
