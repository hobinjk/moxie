/* global casts, skillData, Mishap, buffs */

const reportCardItems = document.querySelector('.report-card-items');

/* eslint-disable-next-line */
function generateReportCard() {
  checkAutoChains();
  checkWasted();
  checkPrimordialAttunements();
  checkArcaneBlasts();
}

function addReportCardItem(grade, explanation, mishaps) {
  const item = document.createElement('li');
  item.classList.add('report-card-item');
  const gradeElt = document.createElement('span');
  gradeElt.classList.add('grade', 'grade-' + grade.toLowerCase());
  gradeElt.textContent = grade;
  const explanationElt = document.createElement('span');
  explanationElt.classList.add('explanation');
  explanationElt.textContent = explanation;
  item.appendChild(gradeElt);
  item.appendChild(document.createTextNode(' '));
  // item.textContent += ' ';
  item.appendChild(explanationElt);
  reportCardItems.appendChild(item);

  console.log('additional data', mishaps);
}

function checkAutoChains() {
  const chains = [];

  for (const cast of casts) {
    if (!cast.fired) {
      continue;
    }
    let data = skillData[cast.id];
    if (data && data.slot) {
      if (data.slot !== 'Weapon_1') {
        continue;
      }

      if (!data.prev_chain && data.next_chain) {
        chains.push([cast]);
      }
      if (data.prev_chain) {
        chains[chains.length - 1].push(cast);
      }
    }
  }
  let wastedOne = {chains: [], total: 0};
  let wastedTwo = {chains: [], total: 0};
  for (let chain of chains) {
    if (chain.length === 3) {
      continue;
    }
    console.log('bad chain of length', chain.length);
    if (chain.length > 3) {
      console.log('wait what', chain);
    }
    if (chain.length === 1) {
      wastedOne.total += chain[chain.length - 1].end - chain[0].start;
      wastedOne.chains.push(chain);
    } else if (chain.length === 2) {
      wastedTwo.total += chain[chain.length - 1].end - chain[0].start;
      wastedTwo.chains.push(chain);
    }
  }
  console.log('wastedOne', wastedOne);
  console.log('wastedTwo', wastedTwo);
  const dur = castsDuration();
  console.log('eliminating one', 1 - (dur - wastedOne.total) / dur);
  console.log('eliminating two', 1 - (dur - wastedTwo.total) / dur);

  let wtGrade = '';
  if (wastedTwo.chains.length === 0) {
    wtGrade = 'S';
  } else if (wastedTwo.chains.length < 2) {
    wtGrade = 'A';
  } else if (wastedTwo.chains.length < 5) {
    wtGrade = 'B';
  } else {
    wtGrade = 'C';
  }
  let wtSummary = `Missed ${wastedTwo.chains.length} auto chain finisher`;
  if (wastedTwo.chains.length !== 1) {
    wtSummary += 's';
  }
  addReportCardItem(wtGrade, wtSummary, wastedTwo.chains.map((chain) => {
    return new Mishap(chain[0].start, chain[chain.length - 1].end);
  }));
}

function castsDuration() {
  return casts[casts.length - 1].end - casts[0].start;
}

function checkWasted() {
  let deadspace = 0;
  let dsMishaps = [];
  let cancels = 0;
  let lastEnd = -1;
  for (const cast of casts) {
    if (lastEnd > 0) {
      let wasted = cast.start - lastEnd;
      if (wasted < 0) {
        console.log('WHAT', cast);
      } else {
        deadspace += wasted;
        dsMishaps.push(new Mishap(lastEnd, cast.start));
      }
    }
    if (!cast.fired) {
      cancels += cast.end - cast.start;
    }
    lastEnd = cast.end;
  }

  console.log('deadspace', deadspace);
  console.log('cancels', cancels);
  let dur = lastEnd - casts[0].start;
  console.log('out of', lastEnd - casts[0].start);
  console.log('kills your deeps by', 1 - (dur - deadspace - cancels) / dur);

  const dsSummary = `Did nothing for ${(deadspace / 1000).toFixed(2)} seconds`;
  let dsGrade = 'B';
  if (deadspace < 5000) {
    dsGrade = 'S';
  } else if (deadspace < 10000) {
    dsGrade = 'A';
  }
  addReportCardItem(dsGrade, dsSummary, dsMishaps);
}

function checkPrimordialAttunements() {
  // Overlap between fire/fire and primordial
  const primordial = buffs[42086];
  const fireFire = buffs[43470];

  let lastFireFireProcessed = 0;

  let stanceStart = -1;
  let misaligns = [];
  for (let event of primordial) {
    if (event.Apply) {
      if (stanceStart < 0) {
        stanceStart = event.Apply;
      }
      continue;
    }

    if (event.Remove && stanceStart < 0) {
      continue;
    }
    const stanceEnd = event.Remove;

    let covered = 0;
    const total = stanceEnd - stanceStart;
    let ffStart = -1;
    for (let i = lastFireFireProcessed; i < fireFire.length; i++) {
      let ff = fireFire[i];
      if (ff.Apply) {
        if (ffStart < 0) {
          ffStart = ff.Apply;
          lastFireFireProcessed = i;
        }
        continue;
      }

      if (ff.Remove && ffStart < 0) {
        continue;
      }
      const ffEnd = ff.Remove;
      if (ffEnd > stanceStart && ffStart < stanceEnd) {
        covered += Math.min(ffEnd, stanceEnd) - Math.max(stanceStart, ffStart);
      }
      // Wholly contained, instant good job
      if (ffEnd < stanceEnd && ffStart > stanceStart) {
        covered += total;
        break;
      }
      ffStart = -1;
      if (ffEnd > stanceEnd) {
        break;
      }
    }
    const coverage = covered / total;
    if (coverage < 0.8) {
      misaligns.push({
        coverage: coverage,
        mishap: new Mishap(stanceStart, stanceEnd, `${Math.floor(coverage * 100)}%`),
      });
    }
    stanceStart = -1;
  }

  console.log(misaligns);

  let summary = `Misaligned ${misaligns.length} Primordial Stance`;
  if (misaligns.length !== 1) {
    summary += 's';
  }
  let grade = 'C';
  if (misaligns.length < 1) {
    grade = 'S';
  } else if (misaligns.length < 2) {
    grade = 'A';
  } else if (misaligns.length < 5) {
    grade = 'B';
  }
  addReportCardItem(grade, summary, misaligns.map(a => a.mishap));
}

function checkArcaneBlasts() {
  // Make sure arcane blasts benefit from the +power of fire attunement and
  // ideally the +power of FGS
  // it's only a ~10%? reduction of 2.2% of your dps so uh maybe not worth it
}
