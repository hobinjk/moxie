import SkillData from 'gw2-data/SkillData';
import SkillIds from 'gw2-data/SkillIds';

const boringSkills = {
  [SkillIds.PRIMORDIAL_STANCE_EFFECT]: true, // Primordial Stance
};

const specialCaseSkillNames = {
  5663: '4', // FGS skill 4
  43995: 'F2', // Gazelle charge
};

function castSkillIcon(cast) {
  let data = SkillData.get(cast.id);
  if (!data || !data.icon) {
    return;
  }
  return data.icon;
}

function castSkillName(cast, skills) {
  let data = SkillData.get(cast.id);
  if (data && data.slot) {
    let content = '';
    // Downed_\d is for shroud/forge skills
    let matches = data.slot.match(/(Weapon|Downed)_(\d)/);
    if (matches && matches.length > 0) {
      content = matches[2];
      if (data.prev_chain && !data.next_chain) {
        content += 'f';
      }
    } else if (data.slot === 'Elite') {
      content = 'E';
    } else if (data.slot === 'Utility') {
      content = 'U';
    } else if (data.slot === 'Heal') {
      content = 'H';
    } else if (data.slot === 'Toolbelt') {
      content = 'T';
    } else {
      let profMatches = data.slot.match(/Profession_(\d)/);
      if (profMatches && profMatches.length > 0) {
        content = 'F' + profMatches[1];
      }
    }
    return content;
  } else if (skills[cast.id]) {
    let skillName = skills[cast.id];
    if (skillName === 'Dodge') {
      return 'D';
    } else if (skillName.startsWith('Chapter')) {
      let chapter = skillName.match(/Chapter (\d)/);
      if (chapter && chapter.length > 0) {
        return 'C' + chapter[1];
      }
    } else if (skillName.startsWith('Epilogue')) {
      return 'C5'; // Based on feedback! :D
    }
  }

  if (specialCaseSkillNames.hasOwnProperty(cast.id)) {
    return specialCaseSkillNames[cast.id];
  }
}

function drawCasts(board, log, casts, row, dimensions, rectClass,
                   labelMode = 'icon') {
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

    let skillIcon = castSkillIcon(cast);
    let icon = null;

    if (labelMode === 'icon') {
      if (skillIcon) {
        icon = document.createElementNS('http://www.w3.org/2000/svg', 'image');
        icon.setAttribute('x', timeToX(cast.start));
        icon.setAttribute('y', (railHeight + railPad) * row);
        icon.setAttribute('width', railHeight);
        icon.setAttribute('height', railHeight);
        icon.classList.add('icon');
        icon.setAttribute('href', skillIcon);
      } else {
        console.warn('No label for skill', cast.id, log.skills[cast.id]);
      }
    }

    let skillName = castSkillName(cast, log.skills);
    let text = null;
    if (labelMode === 'name') {
      if (skillName) {
        text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', timeToX(cast.start));
        text.setAttribute('y', (railHeight + railPad) * row + railHeight / 2);
        text.classList.add('name');
        text.textContent = skillName;
      } else {
        console.warn('No label for skill', cast.id, log.skills[cast.id]);
      }
    }

    rect.setAttribute('x', timeToX(cast.start));
    rect.setAttribute('y', (railHeight + railPad) * row);
    const width = timeToX(cast.end) - timeToX(cast.start);
    if (width > 6) {
      rect.setAttribute('width', width);
    } else {
      rect.setAttribute('width', 2);
      rect.classList.add('cast-instant');
    }

    rect.setAttribute('height', railHeight);

    g.appendChild(title);
    g.appendChild(rect);
    if (icon) {
      g.appendChild(icon);
    }
    if (text) {
      g.appendChild(text);
    }
    board.appendChild(g);
  }
}

export default drawCasts;
