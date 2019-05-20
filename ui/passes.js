import SkillData from './SkillData';
import Mishap from './Mishap';

const reportCardItems = document.querySelector('.report-card-items');

export default function generateReportCard(log) {
  if (log.casts.length === 0) {
    console.warn('Log has no casts');
    return;
  }
  checkAutoChains(log);
  checkWasted(log);
  checkPrimordialAttunements(log);
  checkArcaneBlasts(log);
  checkAttunementTransitions(log);
  checkElementsOfRageUptime(log);
  checkFGSTiming(log);
  checkSkillUsage(log, 5736);
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

function checkArcaneBlasts(log) {
  // Make sure arcane blasts benefit from the +power of fire attunement and
  // ideally the +power of FGS
  // it's only a ~10%? reduction of 2.2% of your dps so uh maybe not worth it
  // also make sure it's being used enough -> 1 charge every 20 / 1.25 seconds
  // with 3 at beginning

  const recharge = 16000;
  let nextCharge = log.start + recharge;
  let charges = 3;
  let overcaps = 0;
  const mishaps = [];
  for (const cast of log.casts) {
    if (cast.id === 5539) {
      let mishapStart = -1;
      while (cast.start > nextCharge && nextCharge >= 0) {
        if (charges < 3) {
          charges += 1;
        } else {
          overcaps += 1;
          mishapStart = Math.min(mishapStart, nextCharge);
        }
        nextCharge += recharge;
      }
      if (mishapStart > 0) {
        mishaps.push(new Mishap(mishapStart, cast.start));
      }

      charges -= 1;
      if (nextCharge < 0) {
        nextCharge = cast.start + recharge;
      }
    }
  }
  if (nextCharge < log.end) {
    overcaps += Math.floor((log.end - nextCharge) / recharge);
    mishaps.push(new Mishap(nextCharge, log.end));
  }
  let grade = 'D';
  if (overcaps < 1) {
    grade = 'S';
  } else if (overcaps < 2) {
    grade = 'A';
  } else if (overcaps < 4) {
    grade = 'B';
  } else if (overcaps < 6) {
    grade = 'C';
  }
  if (nextCharge >= 0) {
    const chargePlural = overcaps === 1 ? 'charge' : 'charges';
    const summary = `Lost ${overcaps} ${chargePlural} of Arcane Blast`;
    addReportCardItem(log, grade, summary, mishaps);
  } else {
    addReportCardItem(log, 'S', 'Missing Arcane Blast casts', []);
  }
}

function checkAttunementTransitions(log) {
  // Pretty sure that every attunement swap that changes the primary element
  // should be accompanied by a skill with a long cast time
  // fire/fire -> air/fire is fire 2 alwaaays-ish
  // air/air -> fire/air is air 3
  const usualTransitions = {
    45313: true, // Flame Uprising
    43803: true, // Quantum Strike
    5736: true, // Fire Storm
    // Fire Grab, slightly worse than Flame Uprising but as good as QS so w/e
    5557: true,
  };

  const mishaps = [];

  const fireFire =
    log.buffs[43470].filter(event => event.hasOwnProperty('Remove')).values();
  const airAir =
    log.buffs[42264].filter(event => event.hasOwnProperty('Remove')).values();

  let ff = fireFire.next();
  let aa = fireFire.next();

  for (const cast of log.casts) {
    while (ff.value && ff.value.Remove < cast.start) {
      ff = fireFire.next();
    }
    while (aa.value && aa.value.Remove < cast.start) {
      aa = airAir.next();
    }

    if (ff.value && ff.value.Remove < cast.end) {
      console.log('ff transition', cast, log.skills[cast.id]);
      if (!usualTransitions[cast.id]) {
        mishaps.push(new Mishap(cast.start, cast.end, log.skills[cast.id]));
      }
    }
    if (aa.value && aa.value.Remove < cast.end) {
      console.log('aa transition', cast, log.skills[cast.id]);
      if (!usualTransitions[cast.id]) {
        mishaps.push(new Mishap(cast.start, cast.end, log.skills[cast.id]));
      }
    }
  }

  let grade = 'D';
  if (mishaps.length < 1) {
    grade = 'S';
  } else if (mishaps.length < 3) {
    grade = 'A';
  } else if (mishaps.length < 6) {
    grade = 'B';
  } else if (mishaps.length < 14) {
    grade = 'C';
  }
  let summary = `Switched attunements during ${mishaps.length} unsafe skill`;
  if (mishaps.length !== 1) {
    summary += 's';
  }
  addReportCardItem(log, grade, summary, mishaps);
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

function checkFGSTiming(log) {
  let firstStart = -1, firstEnd;
  let secondStart = -1, secondEnd;
  let isFirstFGS = true;
  for (const cast of log.casts) {
    if (isFirstFGS) {
      // Conjure FGS
      if (cast.id === 5516) {
        firstStart = cast.start;
      }
      // Firestorm (FGS 5)
      if (cast.id === 5531) {
        firstEnd = cast.end;
        isFirstFGS = false;
      }
    } else {
      // Fiery rush (fgs 4)
      if (cast.id === 5517) {
        secondStart = cast.start;
      }
      if (cast.id === 5531) {
        secondEnd = cast.end;
      }
    }
  }
  if (firstStart < 0) {
    addReportCardItem(log, 'D', 'Didn\'t use FGS at all', []);
    return;
  }
  if (secondStart < 0) {
    addReportCardItem(log, 'D', 'Didn\'t pick up second FGS', []);
    return;
  }
  const firstDur = firstEnd - firstStart;
  const secondDur = secondEnd - secondStart;
  const benchFirstStart = 2280;
  const benchFirstDur = (4370 + 670) - benchFirstStart;
  const benchSecondStart = 16840;
  const benchSecondDur = (17810 + 620) - benchSecondStart;

  const diff = (firstStart - log.start - benchFirstStart) +
    (firstDur - benchFirstDur) +
    (secondStart - log.start - benchSecondStart) +
    (secondDur - benchSecondDur);

  console.log('fgs diff', diff, firstStart, firstEnd, secondStart, secondEnd);

  let grade = 'D';
  if (diff < 500) {
    grade = 'S';
  } else if (diff < 1000) {
    grade = 'A';
  } else if (diff < 2000) {
    grade = 'B';
  } else if (diff < 4000) {
    grade = 'C';
  }

  const mishaps = [
    new Mishap(firstStart, firstEnd, 'First FGS (bench is 2.28s-5.04s)'),
    new Mishap(secondStart, secondEnd, 'Second FGS (bench is 16.84s-18.43s)'),
  ];
  addReportCardItem(log, grade, `Goofed around with FGS for ${(diff / 1000).toPrecision(2)} seconds`, mishaps);
}

function checkSkillUsage(log, skillId) {
  // Use on cooldown after first use
  const skillData = SkillData.get(skillId);
  if (!skillData) {
    console.warn('Missing skill data', skillId);
    return;
  }

  let recharge;
  for (let fact of skillData.facts) {
    if (fact.type === 'Recharge') {
      recharge = fact.value * 1000 / 1.25;
    }
  }
  if (!recharge) {
    console.warn('Missing skill recharge', skillId, skillData);
    return;
  }

  let nextCast = log.start + recharge;
  let wastedTime = 0;
  const mishaps = [];
  for (const cast of log.casts) {
    if (cast.id === skillId) {
      if (cast.start > nextCast) {
        wastedTime += cast.start - nextCast;
        nextCast = cast.end + recharge;
      }
    }
  }
  const wastedCasts = Math.floor(wastedTime / recharge);
  let grade = 'D';
  if (wastedCasts < 1) {
    grade = 'S';
  } else if (wastedCasts < 2) {
    grade = 'A';
  } else if (wastedCasts < 4) {
    grade = 'B';
  } else if (wastedCasts < 6) {
    grade = 'C';
  }
  const castPlural = wastedCasts === 1 ? 'cast' : 'casts';
  const summary = `Lost ${wastedCasts} ${castPlural} of ${skillData.name}`;
  addReportCardItem(log, grade, summary, mishaps);
}
