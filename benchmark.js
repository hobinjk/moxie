import SkillIds from './SkillIds';
import EIParser from './EIParser';

async function get(id, name) {
  const url = `./benchmarks/${id}.json`;
  const res = await fetch(url);
  const raw = await res.json();
  const log = EIParser.parseJson(raw);
  log.casts = log.casts[0];
  log.buffs = log.buffs[0];
  log.targetDamage1S = log.targetDamage1S[0];
  if (id === 'deadeye_rifle') {
    // Adjust DPS for LN settings
    for (let i = 0; i < log.targetDamage1S; i++) {
      log.targetDamage1S[i] = log.targetDamage1S[i] * 38100 / 40720;
    }
  }
  log.id = id;
  if (!name) {
    log.name = id.replace(/_/g, ' ');
  }
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
    if (selectedPlayer.weapons.includes('Dagger')) {
      let isGlyphOfStorms =
        log.skills.hasOwnProperty(SkillIds.GLYPH_OF_STORMS_FIRE);
      if (isGlyphOfStorms) {
        return get('tempest_condi_gos');
      } else {
        return get('tempest_condi_ele');
      }
    } else {
      return get('tempest_power');
    }
  }

  if (spec === 'Weaver') {
    let isCondi = log.skills.hasOwnProperty(SkillIds.WEAVE_SELF);
    if (isCondi) {
      if (selectedPlayer.weapons.includes('Sword')) {
        return get('weaver_condi_sword');
      } else if (selectedPlayer.weapons.includes('Dagger')) {
        return get('weaver_condi_dagger');
      }
    } else if (selectedPlayer.weapons.includes('Staff')) {
      return get('weaver_power_staff');
    } else {
      let isFreshAir = log.buffs.hasOwnProperty(SkillIds.ATTUNEMENT_WATER_FIRE);
      // See if LH was cast
      if (hasCast(log, SkillIds.CONJURE_LIGHTNING_HAMMER)) {
        if (isFreshAir) {
          return get('weaver_power_fa_large');
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
    if (selectedPlayer.weapons.includes('Greatsword')) {
      if (hasCast(log, SkillIds.SIGNET_OF_INSPIRATION)) {
        return get('chrono_power_quick_gs');
      } else {
        return get('chrono_power_gs');
      }
    } else if (selectedPlayer.weapons.includes('Scepter')) {
      return get('chrono_condi');
    } else if (hasCast(log, SkillIds.SIGNET_OF_INSPIRATION)) {
      return get('chrono_power_quick_focus');
    } else {
      return get('chrono_power_focus');
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
    if (selectedPlayer.weapons.includes('Shortbow')) {
      return get('soulbeast_condi_sb');
    } else if (selectedPlayer.weapons.includes('Torch')) {
      return get('soulbeast_condi');
    }

    if (selectedPlayer.weapons.includes('Greatsword')) {
      return get('soulbeast_power_moa_gs');
    } else {
      return get('soulbeast_power_moa_lb');
    }
  }

  if (spec === 'Daredevil') {
    if (selectedPlayer.weapons.includes('Staff')) {
      return get('daredevil_power');
    } else {
      return get('daredevil_condi');
    }
  }

  if (spec === 'Deadeye') {
    if (selectedPlayer.weapons.includes('Rifle')) {
      return get('deadeye_rifle');
    } else if (selectedPlayer.weapons.includes('Pistol')) {
      return get('deadeye_condi');
    }
  }
  // Deadeye dagger bench is too old
  //     return get('deadeye_dagger');

  if (spec === 'Dragonhunter') {
    if (selectedPlayer.weapons.includes('Sword')) {
      return get('dragonhunter_sword_virtues');
    } else {
      return get('dragonhunter_scepter');
    }
  }

  if (spec === 'Guardian') {
    return get('guardian');
  }

  if (spec === 'Firebrand') {
    if (hasCast(log, SkillIds.RENEWED_FOCUS)) {
      return get('firebrand_condi');
    } else if (selectedPlayer.weapons.includes('Greatsword')) {
      return get('firebrand_power_quick');
    } else {
      return get('firebrand_condi_quick');
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
