import SkillData from './SkillData';
import SkillIds from './SkillIds';

const boringSkills = {
  [SkillIds.PRIMORDIAL_STANCE_EFFECT]: true, // Primordial Stance
};

function drawCasts(board, log, casts, row, dimensions, rectClass) {
  const {railHeight, railPad, timeToX} = dimensions;

  for (const cast of casts) {
    if (boringSkills[cast.id]) {
      continue;
    }
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    const title = document.createElementNS('http://www.w3.org/2000/svg',
                                           'title');
    let label = log.skills[cast.id] || cast.id;
    const startLabel = `${((cast.start - log.start) / 1000).toFixed(2)}s`;
    const durLabel = `${((cast.end - cast.start) / 1000).toFixed(2)}s`;
    label += ` (${startLabel}, ${durLabel})`;
    title.textContent = label;

    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.classList.add('cast');
    if (!cast.fired) {
      rect.classList.add('cancel');
    }
    if (rectClass) {
      rect.classList.add(rectClass);
    }

    let skillLabel = null;

    let data = SkillData.get(cast.id);
    if (data && data.slot) {
      let content = '';
      let matches = data.slot.match(/Weapon_(\d)/);
      if (matches && matches.length > 0) {
        content = matches[1];
        if (data.prev_chain && !data.next_chain) {
          content += 'f';
        }
      } else if (data.slot === 'Elite') {
        content = 'E';
      } else if (data.slot === 'Utility') {
        content = 'U';
      } else if (data.slot === 'Heal') {
        content = 'H';
      } else {
        let profMatches = data.slot.match(/Profession_(\d)/);
        if (profMatches && profMatches.length > 0) {
          content = 'F' + profMatches[1];
        }
      }
      skillLabel = content;
    } else if (log.skills[cast.id] === 'Dodge') {
      skillLabel = 'D';
    }

    let text = null;
    if (skillLabel) {
      text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', timeToX(cast.start));
      text.setAttribute('y', (railHeight + railPad) * row + railHeight / 2);
      text.classList.add('name');
      text.textContent = skillLabel;
    }

    rect.setAttribute('x', timeToX(cast.start));
    rect.setAttribute('y', (railHeight + railPad) * row);
    if (cast.end - cast.start > 0) {
      rect.setAttribute('width', timeToX(cast.end) - timeToX(cast.start));
    } else {
      rect.setAttribute('width', 2);
      rect.classList.add('cast-instant');
    }

    rect.setAttribute('height', railHeight);

    g.appendChild(title);
    g.appendChild(rect);
    if (text) {
      g.appendChild(text);
    }
    board.appendChild(g);
  }
}

export default drawCasts;
