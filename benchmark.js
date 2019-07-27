import SkillIds from './SkillIds';
import EIParser from './EIParser';

async function get(id) {
  const url = `./benchmarks/${id}.json`;
  const res = await fetch(url);
  const raw = await res.json();
  const log = EIParser.parseJson(raw);
  log.casts = log.casts[0];
  log.buffs = log.buffs[0];
  log.targetDamage1S = log.targetDamage1S[0];
  log.id = id;
  return log;
}

function hasCast(log, id) {
  for (let cast of log.casts) {
    if (cast.id === id) {
      return true;
    }
  }
  return false;
}

export default function(log, selectedPlayer) {
  const spec = selectedPlayer.profession;

  if (spec === 'Tempest') {
    return get('tempest_power');
  }

  if (spec === 'Weaver') {
    let isCondi = log.buffs.hasOwnProperty(SkillIds.WEAVE_SELF);
    if (isCondi) {
      if (selectedPlayer.weapons.includes('Sword')) {
        return get('weaver_condi_sword');
      } else if (selectedPlayer.weapons.includes('Dagger')) {
        return get('weaver_condi_dagger');
      }
    } else {
      let isFreshAir = log.buffs.hasOwnProperty(SkillIds.ATTUNEMENT_WATER_FIRE);
      // See if LH was cast
      if (hasCast(log, SkillIds.CONJURE_LIGHTNING_HAMMER)) {
        if (isFreshAir) {
          return get('weaver_power_btth_large');
        } else {
          return get('weaver_power_btth_large');
        }
      } else if (isFreshAir) {
        return get('weaver_power_fa_small');
      } else {
        return get('weaver_power_btth_small');
      }
    }
  }

  if (spec === 'Chronomancer') {
    if (selectedPlayer.weapons.includes('Shield')) {
      if (selectedPlayer.weapons.includes('Scepter')) {
        return get('chrono_condi_boon');
      } else {
        return get('chrono_power_boon');
      }
    }
    if (hasCast(log, SkillIds.PHANTASMAL_BERSERKER)) {
      return get('chrono_power_domi');
    } else if (selectedPlayer.weapons.includes('Scepter')) {
      return get('chrono_condi');
    } else {
      return get('chrono_power_illu');
    }
  }

  if (spec === 'Mirage') {
    return get('mirage');
  }

  if (spec === 'Reaper') {
    return get('reaper');
  }

  // Scourge bench is too old
  // if (spec === 'Scourge') {
  //   return get('scourge');
  // }

  // Engi bench is too old
  // if (spec === 'Engineer') {
  //   return get('engineer');
  // }

  if (spec === 'Holosmith') {
    return get('holo_condi');
  }

  if (spec === 'Soulbeast') {
    // Soulbeast benches are too old
    // if (selectedPlayer.weapons.includes('Shortbow')) {
    //   if (hasCast(log, SkillIds.NARCOTIC_SPORES)) {
    //     return get('soulbeast_condi_iboga');
    //   } else {
    //     return get('soulbeast_condi_lynx');
    //   }
    // } else {
    return get('soulbeast_power');
  }

  if (spec === 'Daredevil') {
    if (selectedPlayer.weapons.includes('Staff')) {
      return get('daredevil_power');
    } else {
      return get('daredevil_condi');
    }
  }

  // Deadeye benches are too old
  // if (spec === 'Deadeye') {
  //   if (selectedPlayer.weapons.includes('Rifle')) {
  //     return get('deadeye_rifle');
  //   } else {
  //     return get('deadeye_dagger');
  //   }
  // }

  if (spec === 'Dragonhunter') {
    return get('dragonhunter');
  }

  if (spec === 'Firebrand') {
    if (hasCast(log, SkillIds.MANTRA_OF_POTENCE)) {
      if (selectedPlayer.weapons.includes('Greatsword')) {
        return get('firebrand_power_quick');
      } else {
        return get('firebrand_condi_quick');
      }
    } else {
      return get('firebrand_condi');
    }
  }

  if (spec === 'Herald') {
    return get('herald_boon');
  }

  if (spec === 'Renegade') {
    if (selectedPlayer.weapons.includes('Sword')) {
      return get('renegade_alac');
    }

    if (log.buffs.hasOwnProperty(SkillIds.LEGENDARY_ASSASSIN_STANCE)) {
      return get('renegade_shiro');
    } else {
      return get('renegade_kalla');
    }
  }

  // Warrior bench is too old
  // if (spec === 'Warrior') {
  //   return get('warrior_banners');
  // }

  if (spec === 'Berserker') {
    let isCondi = selectedPlayer.weapons.includes('Longbow');
    if (isCondi) {
      if (hasCast(log, SkillIds.SUNDERING_LEAP)) {
        return get('berserker_condi');
      } else {
        return get('berserker_condi_banners');
      }
    } else if (hasCast(log, SkillIds.THROW_BOLAS)) {
      return get('berserker_power');
    } else {
      return get('berserker_power_banners');
    }
  }

  // Spellbreaker bench is too old
  // if (spec === 'Spellbreaker') {
  //   return get('spellbreaker');
  // }

  return Promise.resolve({
    targetDamage10S: [],
    casts: [],
  });
}