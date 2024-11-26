import SkillData from 'gw2-data/SkillData';
import SkillIds from 'gw2-data/SkillIds';
import Mishap from './Mishap';

const reportCardItems = document.querySelector('.report-card-items');

export default function generateReportCard(log, selectedPlayer, benchmark) {
  if (log.casts.length === 0) {
    console.warn('Log has no casts');
    return;
  }
  switch (benchmark.id) {
    case 'weaver_power_btth':
    case 'weaver_power_fa_small':
      checkAutoChains(log);
      checkWasted(log);
      checkPrimordialAttunements(log);
      checkArcaneBlasts(log);
      checkAttunementTransitions(log);
      checkBuffUptime(log, SkillIds.ELEMENTS_OF_RAGE, 100);
      checkFGSTiming(log, benchmark);
      // Check for both since air might be used
      checkSkillUsage(log, SkillIds.GLYPH_OF_STORMS_FIRE);
      checkSkillUsage(log, SkillIds.GLYPH_OF_STORMS_AIR);
      break;
    case 'weaver_power_btth_large':
    case 'weaver_power_fa_large':
      checkAutoChains(log);
      checkWasted(log);
      checkPrimordialAttunements(log);
      checkAttunementTransitions(log);
      checkBuffUptime(log, SkillIds.ELEMENTS_OF_RAGE, 100);
      checkSkillUsage(log, SkillIds.GLYPH_OF_STORMS_AIR);
      break;
    case 'catalyst_power':
      checkWasted(log);
      checkAttunementTransitions(log);

      checkSkillFrequency(log, SkillIds.STONESTRIKE, 54 / 93.5);

      checkBuffUptime(log, SkillIds.CRESCENT_WIND_BUFF, 89.2);
      checkBuffUptime(log, SkillIds.FLAME_WHEEL_BUFF, 98.6);
      checkBuffUptime(log, SkillIds.ICY_COIL_BUFF, 75.6);
      checkBuffUptime(log, SkillIds.ROCKY_LOOP_BUFF, 60.5);

      checkBuffUptime(log, SkillIds.RELENTLESS_FIRE_BUFF, 51.3);
      checkSkillUsage(log, SkillIds.SHATTERING_ICE);

      checkSkillUsage(log, SkillIds.GLYPH_OF_STORMS_AIR);
      break;
    case 'tempest_power':
      checkWasted(log);

      checkSkillMinDuration(log, SkillIds['Overload Air'], 3190);
      checkSkillMaxDuration(log, SkillIds['Overload Air'], 3300);

      checkBuffUptime(log, SkillIds.TEMPESTUOUS_ARIA, 98.2);
      checkBuffUptime(log, SkillIds.TRANSCENDENT_TEMPEST, 98.2);
      checkBuffUptime(log, SkillIds.FRESH_AIR, 69.8);

      checkSkillUsage(log, SkillIds.GLYPH_OF_STORMS_AIR);
      checkSkillUsage(log, SkillIds['"Feel the Burn!"']);
      break;

    case 'daredevil_power':
      checkAutoChains(log, true);
      checkWasted(log);
      checkBuffUptime(log, SkillIds.ASSASSINS_SIGNET_ACTIVE, 30);
      checkBuffUptime(log, SkillIds.BOUNDING_DODGER, 65);
      // checkSkillUsage(log, SkillIds.steal);
      checkSkillUsage(log, SkillIds.FIST_FLURRY);
      break;
    case 'mirage':
      checkAutoChains(log);
      checkWasted(log);
      checkSkillFrequency(log, SkillIds.IMAGINARY_AXES, 42 / 144);
      checkSkillFrequency(log, SkillIds.AXES_OF_SYMMETRY, 16 / 144);
      checkWeaponSwapCadence(log, [
        {
          dur: 11600,
          label: 'A/P',
        },
        {
          dur: 11600,
          label: 'A/T',
        }
      ], SkillIds['Phantasmal Duelist'], true);

      checkSkillUsage(log, SkillIds.THE_PRESTIGE);
      checkSkillUsage(log, SkillIds.MAGIC_BULLET);
      checkSkillUsage(log, SkillIds.CRY_OF_FRUSTRATION);
      const optsEtherSig = { resets: new Set([SkillIds.SIGNET_OF_THE_ETHER]) };
      checkSkillUsage(log, SkillIds.SIGNET_OF_THE_ETHER);
      checkSkillUsage(log, SkillIds['Phantasmal Duelist'], optsEtherSig);
      checkSkillUsage(log, SkillIds['Phantasmal Mage'], optsEtherSig);

      break;
    case 'chrono_power_gs': {
      checkAutoChains(log);
      checkWasted(log);
      const optsEtherSig = { resets: new Set([SkillIds.SIGNET_OF_THE_ETHER]) };
      const optsEtherSigLeni = Object.assign({ leniency: 2 }, optsEtherSig);
      checkSkillUsage(log, SkillIds.SIGNET_OF_THE_ETHER);
      checkSkillUsage(log, SkillIds.PHANTASMAL_BERSERKER, optsEtherSigLeni);
      checkSkillUsage(log, SkillIds.PHANTASMAL_SWORDSMAN, optsEtherSig);
      checkSkillUsage(log, SkillIds.PHANTASMAL_DISENCHANTER, optsEtherSig);
      checkSkillUsage(log, SkillIds.WELL_OF_CALAMITY);
      break;
    }
    case 'chrono_power_focus': {
      checkAutoChains(log);
      checkWasted(log);
      const optsEtherSig = { resets: new Set([SkillIds.SIGNET_OF_THE_ETHER]) };
      const optsEtherSigLeni = Object.assign({ leniency: 2 }, optsEtherSig);
      checkSkillUsage(log, SkillIds.SIGNET_OF_THE_ETHER);
      checkSkillUsage(log, SkillIds.PHANTASMAL_SWORDSMAN, optsEtherSig);
      checkSkillUsage(log, SkillIds.PHANTASMAL_DISENCHANTER, optsEtherSig);
      checkSkillUsage(log, SkillIds.PHANTASMAL_WARDEN, optsEtherSigLeni);
      break;
    }
    case 'chrono_power_boon': {
      checkAutoChains(log);
      checkWasted(log);
      const optsEtherSig = { resets: new Set([SkillIds.SIGNET_OF_THE_ETHER]) };
      const optsEtherSigLeni = Object.assign({ leniency: 2 }, optsEtherSig);
      checkSkillUsage(log, SkillIds.SIGNET_OF_THE_ETHER);
      checkSkillUsage(log, SkillIds.PHANTASMAL_SWORDSMAN, optsEtherSigLeni);
      checkSkillUsage(log, SkillIds.SIGNET_OF_INSPIRATION);
      checkSkillUsage(log, SkillIds.WELL_OF_ACTION);
      checkSkillUsage(log, SkillIds.WELL_OF_RECALL);
      break;
    }
    case 'chrono_condi_boon': {
      checkAutoChains(log);
      checkWasted(log);
      checkSkillUsage(log, SkillIds.SIGNET_OF_INSPIRATION);
      checkSkillUsage(log, SkillIds.WELL_OF_ACTION);
      checkSkillUsage(log, SkillIds.WELL_OF_RECALL);
      break;
    }
    case 'virtuoso_gs': {
      checkAutoChains(log);
      checkWasted(log);
      const optsEtherSig = { resets: new Set([SkillIds.SIGNET_OF_THE_ETHER]) };
      // const optsEtherSigLeni = Object.assign({leniency: 5}, optsEtherSig);
      checkSkillUsage(log, SkillIds.SIGNET_OF_THE_ETHER);
      checkSkillPerWeaponSwap(log, SkillIds.PHANTASMAL_BERSERKER, 3);
      checkSkillPerWeaponSwap(log, SkillIds.PHANTASMAL_SWORDSMAN, 2);
      checkBuffUptime(log, SkillIds.DEADLY_BLADES, 75)
      checkSkillUsage(log, SkillIds.PHANTASMAL_DISENCHANTER, optsEtherSig);
      checkSkillUsage(log, SkillIds['Rain of Swords']);
      checkSkillUsage(log, SkillIds['Bladesong Harmony']);
      checkSkillPerWeaponSwap(log, SkillIds['Unstable Bladestorm'], 2);
      checkSkillPerWeaponSwap(log, SkillIds['Bladecall'], 3);
      checkSkillPerWeaponSwap(log, SkillIds['Mind Stab'], 2);
      checkSkillPerWeaponSwap(log, SkillIds['Mirror Blade'], 3);
      checkWeaponSwapCadence(log, [
        {
          dur: 13300,
          label: 'GS',
        },
        {
          dur: 12100,
          label: 'D/S',
        }
      ], SkillIds.PHANTASMAL_BERSERKER);
      // checkSkillUsage(log, SkillIds['Mantra of Pain'])
      break;
    }
    case 'virtuoso_focus': {
      checkAutoChains(log);
      checkWasted(log);
      const optsEtherSig = { resets: new Set([SkillIds.SIGNET_OF_THE_ETHER]) };
      const optsEtherSigLeni = Object.assign({ leniency: 3 }, optsEtherSig);
      checkSkillUsage(log, SkillIds.SIGNET_OF_THE_ETHER);
      checkSkillUsage(log, SkillIds.PHANTASMAL_WARDEN, optsEtherSigLeni);
      checkSkillUsage(log, SkillIds.PHANTASMAL_SWORDSMAN, optsEtherSig);
      checkSkillUsage(log, SkillIds.PHANTASMAL_DISENCHANTER, optsEtherSig);
      checkSkillPerWeaponSwap(log, SkillIds['Unstable Bladestorm'], 2);
      checkSkillPerWeaponSwap(log, SkillIds['Bladecall'], 4);
      checkBuffUptime(log, SkillIds.DEADLY_BLADES, 69)
      checkSkillUsage(log, SkillIds['Rain of Swords']);
      checkSkillUsage(log, SkillIds['Bladesong Harmony']);
      // checkSkillUsage(log, SkillIds['Mantra of Pain'])
      break;
    }
    case 'virtuoso_condi': {
      checkAutoChains(log);
      checkWasted(log);
      const optsEtherSig = { resets: new Set([SkillIds.SIGNET_OF_THE_ETHER]) };
      const optsIlluSig = { resets: new Set([SkillIds['Signet of Illusions']]) };
      // const optsEtherSigLeni = Object.assign({leniency: 3}, optsEtherSig);
      checkSkillUsage(log, SkillIds.SIGNET_OF_THE_ETHER);
      checkSkillUsage(log, SkillIds.PHANTASMAL_WARDEN, optsEtherSig);
      checkSkillUsage(log, SkillIds.PHANTASMAL_SWORDSMAN, optsEtherSig);
      checkSkillUsage(log, SkillIds['Signet of Illusions']);
      // TODO this skill has two charges
      checkSkillUsage(log, SkillIds['Bladesong Harmony'], optsIlluSig);
      checkSkillUsage(log, SkillIds['Bladesong Sorrow'], optsIlluSig);
      checkSkillFrequency(log, SkillIds['Bladecall'], 23 / 105);
      checkSkillFrequency(log, SkillIds['Unstable Bladestorm'], 11 / 105);
      checkBuffUptime(log, SkillIds.DEADLY_BLADES, 95)
      break;
    }
    case 'virtuoso_condi_chaos': {
      checkAutoChains(log);
      checkWasted(log);
      // const optsEtherSigLeni = Object.assign({leniency: 3}, optsEtherSig);
      // TODO this skill has two charges
      checkSkillUsage(log, SkillIds['Bladesong Harmony']);
      checkSkillUsage(log, SkillIds['Bladesong Sorrow']);
      checkSkillUsage(log, SkillIds['Rain of Swords']);
      checkSkillUsage(log, SkillIds['Bladecall']);
      checkSkillUsage(log, SkillIds['Unstable Bladestorm']);
      checkBuffUptime(log, SkillIds.DEADLY_BLADES, 95)
      // checkSkillUsage(log, SkillIds['The Prestige']);
      break;
    }

    case 'firebrand_condi':
    case 'firebrand_condi_quick': {
      checkAutoChains(log);
      checkWasted(log);
      checkBadSkillUsage(log, SkillIds.ORB_OF_WRATH, 18);
      checkSkillUsage(log, SkillIds['"Feel My Wrath!"']);
      checkSkillUsage(log, SkillIds['Mantra of Flame'], { onlyNonInstant: true });
      checkSkillUsage(log, SkillIds['Purging Flames']);
      checkSkillUsage(log, SkillIds.EPILOGUE_ASHES_OF_THE_JUST, {
        recharge: 20 * 1000 / 1.25,
        name: 'Epilogue: Ashes of the Just',
      });
      checkSkillUsage(log, SkillIds.CHAPTER_FOUR_SCORCHED_AFTERMATH, {
        recharge: 15 * 1000 / 1.25,
        name: 'Chapter 4: Scorched Aftermath',
        leniency: 1,
      });
      break;
    }
    case 'soulbeast_power_moa_gs':
    case 'soulbeast_power_moa_lb': {
      checkAutoChains(log);
      checkWasted(log);
      checkSkillUsage(log, SkillIds.ONE_WOLF_PACK);
      checkSkillUsage(log, SkillIds.FROST_TRAP);
      checkBuffUptime(log, SkillIds.SIC_EM, 45);
      checkBuffUptime(log, SkillIds.TWICE_AS_VICIOUS, 97);
      break;
    }
    case 'renegade_kalla':
    case 'renegade_deva_kalla':
    case 'renegade_shiro': {
      checkAutoChains(log);
      checkWasted(log);
      checkAverageSkillDuration(log, SkillIds.SEARING_FISSURE, 600);
      apologizeForMissingPasses(log);
      break;
    }
    case 'mechanist_condi_signets': {
      checkWasted(log);
      checkSkillUsage(log, SkillIds['Shrapnel Grenade'], { leniency: 3 });
      checkSkillUsage(log, SkillIds['Blowtorch']);
      checkSkillUsage(log, SkillIds['Superconducting Signet']);
      checkSkillUsage(log, SkillIds['Poison Grenade']);
      break;
    }
    case 'vindicator_power_gs': {
      checkAutoChains(log);
      checkWasted(log);
      checkBuffUptime(log, SkillIds.FORERUNNER_OF_DEATH, 100);
      checkSkillUsage(log, SkillIds['Mist Unleashed'], { leniency: 5 });
      checkSkillUsage(log, SkillIds['Phantom\'s Onslaught'], { leniency: 3 });
      checkSkillUsage(log, SkillIds['Eternity\'s Requiem']);
      checkSkillFrequency(log, SkillIds['Death Drop'], 17 / 109);
      checkAverageSkillDuration(log, SkillIds['Mist Unleashed'], 780, 2000);
      break;
    }
    default:
      console.warn('Nothing cool to do for', benchmark.id);
      checkAutoChains(log);
      checkWasted(log);
      apologizeForMissingPasses(log);
      break;
  }
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

function checkAutoChains(log, strict) {
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
        if (!chains[chains.length - 1]) {
          console.warn('Phantom chain!', cast);
          continue;
        }
        chains[chains.length - 1].push(cast);
      }
    }
  }
  let wastedOne = { chains: [], total: 0 };
  let wastedTwo = { chains: [], total: 0 };
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


  if (strict) {
    let woGrade = '';
    if (wastedOne.chains.length === 0) {
      woGrade = 'S';
    } else if (wastedOne.chains.length < 3) {
      woGrade = 'A';
    } else if (wastedOne.chains.length < 7) {
      woGrade = 'B';
    } else if (wastedOne.chains.length < 15) {
      woGrade = 'C';
    } else {
      woGrade = 'D';
    }

    let attacks = 'attack';
    if (wastedOne.chains.length !== 1) {
      attacks += 's';
    }
    let woSummary = `Let ${wastedOne.chains.length} single auto ${attacks} happen`;
    addReportCardItem(log, woGrade, woSummary, wastedOne.chains.map((chain) => {
      return new Mishap(chain[0].start, chain[chain.length - 1].end);
    }));
  }

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
          dsMishaps.push(new Mishap(lastEnd, cast.start, log.skills[cast.id] || 'Unknown skill'));
        }
      }
    }
    if (!cast.fired) {
      cancels += cast.end - cast.start;
      // Nobody's frame-perfect
      if (cast.end - cast.start > 30) {
        cancelMishaps.push(new Mishap(cast.start, cast.end, log.skills[cast.id] || 'Unknown skill'));
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
  let dsGrade = 'C';
  if (deadspace < 500) {
    dsGrade = 'S';
  } else if (deadspace < 1000) {
    dsGrade = 'A';
  } else if (deadspace < 2000) {
    dsGrade = 'B';
  }
  addReportCardItem(log, dsGrade, dsSummary, dsMishaps);

  const cancelSummary = `Canceled skills for ${(cancels / 1000).toFixed(2)} seconds`;
  let cancelGrade = 'C';
  if (cancels < 500) {
    cancelGrade = 'S';
  } else if (cancels < 1000) {
    cancelGrade = 'A';
  } else if (cancels < 2000) {
    cancelGrade = 'B';
  }
  addReportCardItem(log, cancelGrade, cancelSummary, cancelMishaps);
}

function checkPrimordialAttunements(log) {
  // Overlap between fire/fire and primordial
  let primordial = log.buffs[SkillIds.PRIMORDIAL_STANCE];
  const fireFire = log.buffs[SkillIds.ATTUNEMENT_FIRE_FIRE];

  if (!primordial) {
    primordial = [];
    let tick = 1000;
    let stanceDur = 5 * tick;
    let lastPrimordial = log.start - stanceDur - tick;
    for (const cast of log.casts) {
      if (cast.id !== SkillIds.PRIMORDIAL_STANCE_EFFECT) {
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
  let anyFound = false;
  for (const cast of log.casts) {
    if (cast.id === SkillIds.ARCANE_BLAST) {
      anyFound = true;
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
  if (!anyFound) {
    // EI doesn't track instants
    return;
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
  if (!log.buffs.hasOwnProperty(SkillIds.ATTUNEMENT_FIRE_FIRE)) {
    // Old EI html log
    return;
  }
  // Pretty sure that every attunement swap that changes the primary element
  // should be accompanied by a skill with a long cast time
  // fire/fire -> air/fire is fire 2 alwaaays-ish
  // air/air -> fire/air is air 3
  const usualTransitions = {
    [SkillIds.FLAME_UPRISING]: true, // Flame Uprising
    [SkillIds.QUANTUM_STRIKE]: true, // Quantum Strike
    [SkillIds.GLYPH_OF_STORMS_FIRE]: true, // Fire Storm
    // Fire Grab, slightly worse than Flame Uprising but as good as QS so w/e
    [SkillIds.FIRE_GRAB]: true,
  };

  const mishaps = [];

  const fireFire =
    log.buffs[SkillIds.ATTUNEMENT_FIRE_FIRE]
      .filter(event => event.hasOwnProperty('Remove')).values();
  const airAir =
    log.buffs[SkillIds.ATTUNEMENT_AIR_AIR]
      .filter(event => event.hasOwnProperty('Remove')).values();

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

function checkBuffUptime(log, buffId, targetPerc) {
  const elements = log.buffs[buffId];

  if (!elements) {
    console.error('Missing buff uptime', buffId);
    return;
  }

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
  const perc = 100 - Math.floor(100 * downtime / (log.end - log.start));
  const name = log.skills[buffId];
  const summary = `Had ${perc}% uptime on ${name} (dropped for ${dropped}s, target ${targetPerc}%)`;
  let grade = 'D';
  const percDiff = (targetPerc - perc) / targetPerc;
  if (percDiff < 0.02) {
    grade = 'S';
  } else if (percDiff < 0.05) {
    grade = 'A';
  } else if (percDiff < 0.1) {
    grade = 'B';
  } else if (percDiff < 0.25) {
    grade = 'C';
  }
  addReportCardItem(log, grade, summary, mishaps);
}

function getFGSTiming(casts) {
  let firstStart = -1, firstEnd = -1;
  let secondStart = -1, secondEnd = -1;
  let isFirstFGS = true;
  for (const cast of casts) {
    if (isFirstFGS) {
      // Conjure FGS
      if (cast.id === SkillIds.CONJURE_FIERY_GREATSWORD) {
        firstStart = cast.start;
      }
      // Firestorm (FGS 5)
      if (cast.id === SkillIds.FIERY_GREATSWORD_FIRESTORM) {
        firstEnd = cast.end;
        isFirstFGS = false;
      }
    } else if (secondEnd < 0) {
      // Fiery rush (fgs 4)
      if (cast.id === SkillIds.FIERY_GREATSWORD_FIERY_RUSH) {
        console.log('secondStart', cast.start);
        secondStart = cast.start;
      }
      if (cast.id === SkillIds.FIERY_GREATSWORD_FIRESTORM) {
        secondEnd = cast.end;
      }
    } else {
      break;
    }
  }
  return {
    firstStart,
    firstEnd,
    secondStart,
    secondEnd,
  };
}

function checkFGSTiming(log, benchmark) {
  let {
    firstStart: benchFirstStart,
    firstEnd: benchFirstEnd,
    secondStart: benchSecondStart,
    secondEnd: benchSecondEnd,
  } = getFGSTiming(benchmark.casts);
  let { firstStart, firstEnd, secondStart, secondEnd } = getFGSTiming(log.casts);
  console.log(getFGSTiming(benchmark.casts), getFGSTiming(log.casts));
  if (firstStart < 0) {
    // addReportCardItem(log, 'D', 'Didn\'t use FGS at all', []);
    return;
  }
  if (secondStart < 0) {
    addReportCardItem(log, 'D', 'Didn\'t pick up second FGS', []);
    return;
  }
  const firstDur = firstEnd - firstStart;
  const secondDur = secondEnd - secondStart;
  const benchFirstDur = benchFirstEnd - benchFirstStart;
  const benchSecondDur = benchSecondEnd - benchSecondStart;

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

  function toSecStr(x) {
    return `${Math.round(x / 10) * 10 / 1000}s`;
  }
  console.log('wait what', benchSecondStart);
  const mishaps = [
    new Mishap(firstStart, firstEnd, `First FGS (bench is ${toSecStr(benchFirstStart)}-${toSecStr(benchFirstEnd)})`),
    new Mishap(secondStart, secondEnd, `Second FGS (bench is ${toSecStr(benchSecondStart)}-${toSecStr(benchSecondEnd)})`),
  ];

  addReportCardItem(log, grade, `Goofed around with FGS for ${(diff / 1000).toFixed(2)} seconds`, mishaps);
}

function checkSkillUsage(log, skillId, options = {}) {
  // Use on cooldown after first use
  const skillData = SkillData.get(skillId);
  if (!skillData) {
    console.warn('Missing skill data', skillId);
    return;
  }

  let recharge = options.recharge || 0;
  let countRecharge = 0;
  if (!skillData.facts) {
    skillData.facts = [];
  }
  for (let fact of skillData.facts) {
    if (fact.type === 'Recharge') {
      recharge = fact.value * 1000 / 1.25;
    }
    if (fact.text === 'Count Recharge' || fact.text === 'Charge Recovery') {
      countRecharge = fact.duration * 1000 / 1.25;
    }
  }
  if (!recharge) {
    console.warn('Missing skill recharge', skillId, skillData);
    return;
  }
  // TODO handle countRecharge more correctly
  recharge = Math.max(countRecharge, recharge);

  let nextCast = log.start + recharge;
  let wastedTime = 0;
  const mishaps = [];
  let resets = options.resets;
  for (const cast of log.casts) {
    if (resets && resets.has(cast.id)) {
      nextCast = cast.end;
    }

    if (cast.id !== skillId) {
      continue;
    }

    if (options.onlyNonInstant) {
      if (cast.end - cast.start < 100) {
        continue;
      }
    }

    if (cast.start > nextCast) {
      let wasted = cast.start - nextCast;
      if (wasted > 200) {
        mishaps.push(new Mishap(nextCast, cast.start));
      }
      wastedTime += wasted;
    }
    nextCast = cast.end + recharge;
  }
  if (nextCast === log.start + recharge) {
    console.warn('Skill never used', skillId)
    return;
  }
  let wastedCasts = Math.floor(wastedTime / recharge);
  let grade = 'D';
  const leniency = options.leniency || 0;
  wastedCasts -= leniency;
  if (wastedCasts < 1) {
    grade = 'S';
  } else if (wastedCasts < 2) {
    grade = 'A';
  } else if (wastedCasts < 4) {
    grade = 'B';
  } else if (wastedCasts < 6) {
    grade = 'C';
  }
  wastedCasts += leniency;
  const castPlural = wastedCasts === 1 ? 'cast' : 'casts';
  const summary = `Lost ${wastedCasts} ${castPlural} of ${skillData.name || options.name}`;
  addReportCardItem(log, grade, summary, mishaps);
}

function checkSkillPerWeaponSwap(log, skillId, expectedCasts) {
  // Use on cooldown after first use
  const skillData = SkillData.get(skillId);
  if (!skillData) {
    console.warn('Missing skill data', skillId);
    return;
  }
  let isFirstWeaponSwap = true;
  let isInWeapon = false;

  let castsInWeapon = 0;
  let start = 0;
  let results = [];

  for (const cast of log.casts) {
    if (cast.id === SkillIds.WEAPON_SWAP) {
      isFirstWeaponSwap = false;
      if (isInWeapon) {
        isInWeapon = false;
        results.push({
          start,
          end: cast.end,
          castsInWeapon
        });
      }
      start = cast.start;
    }
    if (isFirstWeaponSwap) {
      continue;
    }
    if (cast.id === skillId) {
      if (!isInWeapon) {
        isInWeapon = true;
        castsInWeapon = 0;
      }
      castsInWeapon += 1;
    }
  }
  let grade = 'D';
  let successes = 0;
  let mishaps = [];
  for (let result of results) {
    if (result.castsInWeapon === expectedCasts) {
      successes += 1;
      continue;
    }
    mishaps.push(new Mishap(result.start, result.end, `Cast ${result.castsInWeapon}/${expectedCasts} times`));
  }

  if (results.length - successes === 0) {
    grade = 'S';
  } else if (results.length - successes < 2) {
    grade = 'A';
  } else if (results.length - successes < 4) {
    grade = 'B';
  } else if (results.length - successes < 6) {
    grade = 'C';
  }
  const timePlural = results.length === 1 ? 'time' : 'times';
  const summary = `Cast ${skillData.name} ${expectedCasts} per swap ${successes}/${results.length} ${timePlural}`;
  addReportCardItem(log, grade, summary, mishaps);
}

function checkSkillFrequency(log, skillId, expectedCastsPerSecond) {
  // Use on cooldown after first use
  const skillData = SkillData.get(skillId);
  if (!skillData) {
    console.warn('Missing skill data', skillId);
    return;
  }

  let casts = 0;
  for (const cast of log.casts) {
    if (cast.id === skillId) {
      casts += 1;
    }
  }
  let grade = 'D';
  const expectedCasts =
    Math.floor(expectedCastsPerSecond * (log.end - log.start) / 1000);
  if (expectedCasts - casts < 1) {
    grade = 'S';
  } else if (expectedCasts - casts < 2) {
    grade = 'A';
  } else if (expectedCasts - casts < 4) {
    grade = 'B';
  } else if (expectedCasts - casts < 6) {
    grade = 'C';
  }
  const timePlural = casts === 1 ? 'time' : 'times';
  const summary = `Cast ${skillData.name} ${casts}/${expectedCasts} ${timePlural}`;
  addReportCardItem(log, grade, summary, []);
}

function apologizeForMissingPasses(log) {
  addReportCardItem(log, 'S', 'Missing build-specific advice', []);
}

function checkBadSkillUsage(log, skillId, leniency) {
  const skillData = SkillData.get(skillId);
  if (!skillData) {
    console.warn('Missing skill data', skillId);
    return;
  }
  const mishaps = [];
  for (const cast of log.casts) {
    if (!cast.fired) {
      continue;
    }
    if (cast.id === skillId) {
      mishaps.push(new Mishap(cast.start, cast.end));
    }
  }
  let grade = 'D';
  let badCasts = mishaps.length;
  badCasts -= leniency;
  if (badCasts < 1) {
    grade = 'S';
  } else if (badCasts < 2) {
    grade = 'A';
  } else if (badCasts < 4) {
    grade = 'B';
  } else if (badCasts < 6) {
    grade = 'C';
  }
  badCasts += leniency;
  const timePlural = badCasts === 1 ? 'time' : 'times';
  const summary = `Cast bad skill ${skillData.name} ${badCasts} ${timePlural}`;
  addReportCardItem(log, grade, summary, mishaps);
}

function checkNotChained(log, skillId, maxCasts, cooldown) {
  const skillData = SkillData.get(skillId);
  if (!skillData) {
    console.warn('Missing skill data', skillId);
    return;
  }
  const mishaps = [];
  let chain = [];
  let timeLost = 0;
  for (const cast of log.casts) {
    if (!cast.fired) {
      continue;
    }
    if (cast.id !== skillId) {
      if (chain.length === 0) {
        continue;
      }

      if (cast.start - chain[0].end > cooldown) {
        chain = [];
      }
      continue;
    }
    chain.push(cast);

    if (chain.length > maxCasts) {
      mishaps.push(new Mishap(cast.start, cast.end));
      timeLost += cast.end - cast.start;
    }
  }

  let grade = 'D';
  let badCasts = mishaps.length;
  if (badCasts < 1) {
    grade = 'S';
  } else if (badCasts < 2) {
    grade = 'A';
  } else if (badCasts < 4) {
    grade = 'B';
  } else if (badCasts < 6) {
    grade = 'C';
  }
  const timePlural = badCasts === 1 ? 'time' : 'times';
  const summary = `Spammed ${skillData.name} too much ${badCasts} ${timePlural} (lost ${(timeLost / 1000).toFixed(2)}s)`;
  addReportCardItem(log, grade, summary, mishaps);
}

function checkAmmoSkillUsage(log, skillId, recharge, maxCharges) {
  const skillData = SkillData.get(skillId);
  if (!skillData) {
    console.warn('Missing skill data', skillId);
    return;
  }

  let charges = maxCharges;
  let nextCharge = log.start + recharge;
  let overcaps = 0;
  const mishaps = [];
  let anyFound = false;
  for (const cast of log.casts) {
    if (cast.id === skillId) {
      anyFound = true;
      let mishapStart = -1;
      while (cast.start > nextCharge && nextCharge >= 0) {
        if (charges < maxCharges) {
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
  if (!anyFound) {
    // EI doesn't track instants
    return;
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
    const summary = `Lost ${overcaps} ${chargePlural} of ${skillData.name}`;
    addReportCardItem(log, grade, summary, mishaps);
  }
}

function checkAverageSkillDuration(log, skillId, targetDuration, leniency) {
  const skillData = SkillData.get(skillId);
  if (!skillData) {
    console.warn('Missing skill data', skillId);
    return;
  }
  let mishaps = [];
  let castTimes = [];
  for (const cast of log.casts) {
    if (cast.id === skillId) {
      castTimes.push(cast.end - cast.start);
      if (cast.end - cast.start > targetDuration) {
        let diff = (cast.end - cast.start - targetDuration) / 1000;
        mishaps.push(new Mishap(cast.start + targetDuration, cast.end, `Over by ${diff.toFixed(2)}s`));
      }
    }
  }

  console.log('cast times', castTimes);

  let totalDiff = 0;
  for (let time of castTimes) {
    totalDiff += time - targetDuration;
  }

  let grade = 'D';
  if (typeof leniency === 'number') {
    totalDiff -= leniency;
  }
  if (totalDiff < 200) {
    grade = 'S';
  } else if (totalDiff < 500) {
    grade = 'A';
  } else if (totalDiff < 1000) {
    grade = 'B';
  } else if (totalDiff < 2000) {
    grade = 'C';
  }
  if (typeof leniency === 'number') {
    totalDiff += leniency;
  }
  const summary = `Left ${(totalDiff / 1000).toFixed(2)}s worth of ${skillData.name} uncancelled`;
  addReportCardItem(log, grade, summary, mishaps);
}

function checkWeaponSwapCadence(log, durations, startSkillId, lenient) {
  let durI = 0;
  let isStarted = false;
  let lastWs = 0;
  let results = [];

  for (const cast of log.casts) {
    if (cast.id === startSkillId) {
      isStarted = true;
    }

    if (cast.id === SkillIds.WEAPON_SWAP) {
      if (isStarted) {
        let targetDur = durations[durI];
        results.push({
          start: lastWs,
          end: cast.end,
          target: targetDur,
        });
        durI = (durI + 1) % durations.length;
      }
      lastWs = cast.end;
    }
  }

  let grade = 'F';
  let successes = 0;
  let mishaps = [];
  let over = 0;
  let maxOver = 0;
  for (let result of results) {
    let dur = result.end - result.start;
    if (result.target.dur > dur) {
      successes += 1;
      continue;
    }
    let amount = dur - result.target.dur;
    over += amount;
    maxOver = Math.max(maxOver, amount);
    mishaps.push(new Mishap(result.start, result.end, `Spent ${amount} ms too long in ${result.target.label}`));
  }

  if (lenient) {
    over -= maxOver;
  }

  if (over < 50) {
    grade = 'S';
  } else if (over < 200) {
    grade = 'A';
  } else if (over < 800) {
    grade = 'B';
  } else if (over < 2000) {
    grade = 'C';
  } else if (over < 5000) {
    grade = 'D';
  }
  const swapPlural = results.length === 1 ? 'swap' : 'swaps';
  let leniencyExplanation = '';
  if (lenient) {
    leniencyExplanation = `, ignored ${maxOver} ms`;
  }
  const summary = `Swapped late by ${over} ms (${successes}/${results.length} ${swapPlural}${leniencyExplanation})`;
  addReportCardItem(log, grade, summary, mishaps);
}

function checkSkillMinDuration(log, skillId, minDurationMs) {
  const skillData = SkillData.get(skillId);
  if (!skillData) {
    console.warn('Missing skill data', skillId);
    return;
  }

  let mishaps = [];
  let castsTotal = 0;
  for (const cast of log.casts) {
    if (cast.id !== skillId) {
      continue;
    }
    castsTotal += 1;
    let duration = cast.end - cast.start;
    if (duration > minDurationMs) {
      continue;
    }
    // Cancelled at cast.end when it should've been later
    mishaps.push(new Mishap(cast.end, cast.start + minDurationMs));
  }
  let grade = 'D';
  if (mishaps.length < 1) {
    grade = 'S';
  } else if (mishaps.length < 3) {
    grade = 'A';
  } else if (mishaps.length < 5) {
    grade = 'B';
  } else if (mishaps.length < 8) {
    grade = 'C';
  }
  const timePlural = mishaps.length === 1 ? 'time' : 'times';
  const summary = `Cancelled ${skillData.name} early ${mishaps.length}/${castsTotal} ${timePlural}`;
  addReportCardItem(log, grade, summary, []);
}

function checkSkillMaxDuration(log, skillId, maxDurationMs) {
  const skillData = SkillData.get(skillId);
  if (!skillData) {
    console.warn('Missing skill data', skillId);
    return;
  }

  let mishaps = [];
  let castsTotal = 0;
  for (const cast of log.casts) {
    if (cast.id !== skillId) {
      continue;
    }
    castsTotal += 1;
    let duration = cast.end - cast.start;
    if (duration < maxDurationMs) {
      continue;
    }
    // Cancelled at cast.end when it should've been earlier
    mishaps.push(new Mishap(cast.start + maxDurationMs, cast.end));
  }
  let grade = 'D';
  if (mishaps.length < 1) {
    grade = 'S';
  } else if (mishaps.length < 3) {
    grade = 'A';
  } else if (mishaps.length < 5) {
    grade = 'B';
  } else if (mishaps.length < 8) {
    grade = 'C';
  }
  const timePlural = mishaps.length === 1 ? 'time' : 'times';
  const summary = `Cancelled ${skillData.name} late ${mishaps.length}/${castsTotal} ${timePlural}`;
  addReportCardItem(log, grade, summary, []);
}
