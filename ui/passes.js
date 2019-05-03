import SkillData from './SkillData';
import Mishap from './Mishap';

const reportCardItems = document.querySelector('.report-card-items');

export default function generateReportCard(log) {
  checkAutoChains(log);
  checkWasted(log);
  checkPrimordialAttunements(log);
  checkArcaneBlasts(log);
  checkAttunementTransitions(log);
  checkElementsOfRageUptime(log);
}

function addReportCardItem(log, grade, explanation, mishaps) {
  const item = document.createElement('li');
  item.classList.add('report-card-item');
  const gradeElt = document.createElement('span');
  gradeElt.classList.add('grade', 'grade-' + grade.toLowerCase());
  gradeElt.textContent = grade;
  const explanationElt = document.createElement('span');
  explanationElt.classList.add('explanation');
  explanationElt.textContent = explanation;
  const expander = document.createElement('div');
  expander.classList.add('report-card-item-expander');
  expander.textContent = 'Show Mishaps';
  expander.addEventListener('click', function() {
    if (item.classList.contains('open')) {
      expander.textContent = 'Show Mishaps';
      item.classList.remove('open');
      item.parentNode.classList.remove('single');
    } else {
      expander.textContent = 'Hide Mishaps';
      item.classList.add('open');
      item.parentNode.classList.add('single');
    }
  });
  item.appendChild(gradeElt);
  item.appendChild(document.createTextNode(' '));
  item.appendChild(explanationElt);
  item.appendChild(expander);
  const mishapList = document.createElement('ul');
  mishapList.classList.add('mishap-list');
  for (let mishap of mishaps) {
    mishapList.appendChild(mishap.render(log));
  }
  item.appendChild(mishapList);
  reportCardItems.appendChild(item);

  console.log('additional data', mishaps);
}

function checkAutoChains(log) {
  const chains = [];

  for (const cast of log.casts) {
    if (!cast.fired) {
      continue;
    }
    let data = SkillData.get(cast.id);
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
  const dur = log.casts[log.casts.length - 1].end - log.casts[0].start;
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
  addReportCardItem(log, wtGrade, wtSummary, wastedTwo.chains.map((chain) => {
    return new Mishap(chain[0].start, chain[chain.length - 1].end);
  }));
}

function checkWasted(log) {
  let deadspace = 0;
  let dsMishaps = [];
  let cancels = 0;
  let cancelMishaps = [];
  let lastEnd = -1;
  for (const cast of log.casts) {
    if (cast.end === cast.start) {
      continue;
    }
    if (lastEnd > 0) {
      let wasted = cast.start - lastEnd;
      if (wasted < 0) {
        console.log('WHAT', cast);
      } else {
        deadspace += wasted;

        // Nobody's frame-perfect
        if (wasted > 30) {
          dsMishaps.push(new Mishap(lastEnd, cast.start));
        }
      }
    }
    if (!cast.fired) {
      cancels += cast.end - cast.start;
      // Nobody's frame-perfect
      if (cast.end - cast.start > 30) {
        cancelMishaps.push(new Mishap(cast.start, cast.end));
      }
    }
    lastEnd = cast.end;
  }

  console.log('deadspace', deadspace);
  console.log('cancels', cancels);
  let dur = lastEnd - log.casts[0].start;
  console.log('out of', dur);
  console.log('kills your deeps by', 1 - (dur - deadspace - cancels) / dur);

  const dsSummary = `Did nothing for ${(deadspace / 1000).toFixed(2)} seconds`;
  let dsGrade = 'B';
  if (deadspace < 5000) {
    dsGrade = 'S';
  } else if (deadspace < 10000) {
    dsGrade = 'A';
  }
  addReportCardItem(log, dsGrade, dsSummary, dsMishaps);

  const cancelSummary = `Canceled skills for ${(cancels / 1000).toFixed(2)} seconds`;
  let cancelGrade = 'B';
  if (cancels < 5000) {
    cancelGrade = 'S';
  } else if (cancels < 10000) {
    cancelGrade = 'A';
  }
  addReportCardItem(log, cancelGrade, cancelSummary, cancelMishaps);
}

function checkPrimordialAttunements(log) {
  // Overlap between fire/fire and primordial
  let primordial = log.buffs[42086];
  const fireFire = log.buffs[43470];

  if (!primordial) {
    primordial = [];
    let tick = 1000;
    let stanceDur = 5 * tick;
    let lastPrimordial = log.start - stanceDur - tick;
    for (const cast of log.casts) {
      if (cast.id !== 40183) {
        continue;
      }
      let primStart = cast.start - tick;
      if (primStart - lastPrimordial < stanceDur) {
        continue;
      }
      if (lastPrimordial > log.start) {
        primordial.push({
          Remove: Math.min(lastPrimordial + stanceDur, primStart - 1),
        });
      }
      lastPrimordial = primStart;
      primordial.push({
        Apply: primStart,
      });
    }
    if (lastPrimordial > log.start) {
      primordial.push({
        Remove: Math.min(lastPrimordial + stanceDur, log.end),
      });
    }
  }
  let lastFireFireProcessed = 0;

  let stanceStart = -1;
  let misaligns = [];
  let totalAligns = 0;
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
    totalAligns += 1;
    if (coverage < 0.8) {
      misaligns.push({
        coverage: coverage,
        mishap: new Mishap(stanceStart, stanceEnd, `${Math.floor(coverage * 100)}%`),
      });
    }
    stanceStart = -1;
  }

  console.log(misaligns);

  let summary = `Misaligned ${misaligns.length}/${totalAligns} Primordial Stance`;
  if (misaligns.length !== 1) {
    summary += 's';
  }
  let grade = 'D';
  if (misaligns.length < 1) {
    grade = 'S';
  } else if (misaligns.length < 2) {
    grade = 'A';
  } else if (misaligns.length < 4) {
    grade = 'B';
  } else if (misaligns.length < 6) {
    grade = 'C';
  }
  addReportCardItem(log, grade, summary, misaligns.map(a => a.mishap));
}

function checkArcaneBlasts(_log) {
  // Make sure arcane blasts benefit from the +power of fire attunement and
  // ideally the +power of FGS
  // it's only a ~10%? reduction of 2.2% of your dps so uh maybe not worth it
  // also make sure it's being used enough -> 1 charge every 20 / 1.25 seconds
  // with 3 at beginning
}

function checkAttunementTransitions(_log) {
  // Pretty sure that every attunement swap that changes the primary element
  // should be accompanied by a non-weapon skill
}

function checkElementsOfRageUptime(log) {
  const elements = log.buffs[42416];

  let downtime = 0;
  let lastApply = -1;
  let lastRemove = -1;
  let mishaps = [];

  for (let event of elements) {
    if (event.Apply) {
      if (lastApply < 0) {
        if (lastRemove > 0) {
          // Nobody's frame-perfect
          if (event.Apply - lastRemove > 30) {
            mishaps.push(new Mishap(lastRemove, event.Apply));
          }
          downtime += event.Apply - lastRemove;
        }
        lastApply = event.Apply;
      }
    }

    if (event.Remove) {
      lastRemove = event.Remove;
      lastApply = -1;
    }
  }

  const dropped = (downtime / 1000).toFixed(2);
  const perc = Math.floor(100 * downtime / (log.end - log.start));
  const summary = `Dropped Elements of Rage for ${dropped} seconds (${perc}%)`;
  let grade = 'D';
  if (dropped < 1) {
    grade = 'S';
  } else if (dropped < 3) {
    grade = 'A';
  } else if (dropped < 8) {
    grade = 'B';
  } else if (dropped < 15) {
    grade = 'C';
  }
  addReportCardItem(log, grade, summary, mishaps);
}
