import SkillIds from 'gw2-data/SkillIds';
import EIParser from './EIParser';

async function get(id, name) {
  const url = `./benchmarks/${id}.json`;
  const res = await fetch(url);
  const raw = await res.json();
  const log = EIParser.parseJson(raw);
  log.casts = log.casts[0];
  log.buffs = log.buffs[0];
  log.targetDamage1S = log.targetDamage1S[0];
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

const QUICKNESS = 1187;
function hasGeneration(selectedPlayer, buffId) {
  for (let buff of selectedPlayer.buffUptimes) {
    if (buff.id !== buffId) {
      continue;
    }
    for (let buffData of buff.buffData) {
      for (let agentName in buffData.generated) {
        if (buffData.generated[agentName] > 0) {
          return true;
        }
      }
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
    let isFreshAir = log.buffs.hasOwnProperty(SkillIds.FRESH_AIR);
    if (isCondi) {
      if (isFreshAir) {
        let isGlyphOfStorms =
          log.skills.hasOwnProperty(SkillIds.GLYPH_OF_STORMS_FIRE);
        if (isGlyphOfStorms) {
          return get('weaver_hybrid_fa');
        } else {
          return get('weaver_hybrid_fa_elementals');
        }
      }
      if (selectedPlayer.weapons.includes('Sword')) {
        return get('weaver_condi_sword');
      }
      if (selectedPlayer.weapons.includes('Dagger')) {
        return get('weaver_condi_dagger');
      }
    } else if (selectedPlayer.weapons.includes('Staff')) {
      return get('weaver_power_staff');
    } else {
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

  if (spec === 'Catalyst') {
    // if (hasCast(log, SkillIds.CONJURE_FIERY_GREATSWORD)) {
    return get('catalyst_power');
    // }
    // return get('catalyst_power_quick');
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
      if (hasCast(log, SkillIds.GRAVITY_WELL)) {
        return get('chrono_power_gs');
      } else if (hasGeneration(selectedPlayer, QUICKNESS)) {
        return get('chrono_power_quick_gs');
      } else {
        return get('chrono_power_gs');
      }
    } else if (selectedPlayer.weapons.includes('Scepter')) {
      return get('chrono_condi');
    } else if (hasCast(log, SkillIds.GRAVITY_WELL)) {
      return get('chrono_power_focus');
    } else if (hasGeneration(selectedPlayer, QUICKNESS)) {
      return get('chrono_power_quick_focus');
    } else if (selectedPlayer.weapons.includes('Pistol')) {
      return get('chrono_power_pistol');
    } else {
      return get('chrono_power_focus');
    }
  }

  if (spec === 'Mirage') {
    if (selectedPlayer.weapons.includes('Staff')) {
      return get('mirage_staff');
    }
    return get('mirage');
  }

  if (spec === 'Virtuoso') {
    if (selectedPlayer.weapons.includes('Greatsword')) {
      return get('virtuoso_gs');
    }
    return get('virtuoso_focus');
  }

  if (spec === 'Reaper') {
    if (selectedPlayer.weapons.includes('Scepter')) {
      return get('reaper_condi');
    } else {
      return get('reaper');
    }
  }

  if (spec === 'Scourge') {
    return get('scourge');
  }

  if (spec === 'Harbinger') {
    // TODO check for quickness output?
    return get('harbinger_condi');
  }

  // Engi bench is too old
  // if (spec === 'Engineer') {
  //   return get('engineer');
  // }

  if (spec === 'Holosmith') {
    if (selectedPlayer.weapons.includes('Sword')) {
      return get('holo_power_sword');
    } else if (selectedPlayer.weapons.includes('Rifle')) {
      return get('holo_power_rifle');
    } else {
      return get('holo_condi');
    }
  }

  if (spec === 'Scrapper') {
    if (hasCast(log, SkillIds.SHREDDER_GYRO)) {
      return get('scrapper_quick');
    }
    return get('scrapper');
  }

  if (spec === 'Soulbeast') {
    // Soulbeast benches are too old
    if (selectedPlayer.weapons.includes('Shortbow')) {
      return get('soulbeast_condi_sb');
    } else if (selectedPlayer.weapons.includes('Torch')) {
      // Either offhand
      if (selectedPlayer.weapons[1] === 'Axe' || selectedPlayer.weapons[3] === 'Axe') {
        return get('soulbeast_hybrid');
      }
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

  if (spec === 'Specter') {
    return get('specter_condi');
  }

  if (spec === 'Dragonhunter') {
    if (selectedPlayer.weapons.includes('Sword')) {
      if (hasCast(log, SkillIds.SHIELD_OF_COURAGE)) {
        return get('dragonhunter_sword_virtues');
      } else {
        return get('dragonhunter_sword');
      }
    } else if (selectedPlayer.weapons.includes('Longbow')) {
      return get('dragonhunter_longbow');
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
      return get('firebrand_condi_gs');
    } else {
      return get('firebrand_condi_quick');
    }
  }

  if (spec === 'Willbender') {
    return get('willbender_power_focus');
  }

  if (spec === 'Herald') {
    if (selectedPlayer.weapons.includes('Sword')) {
      return get('herald_boon');
    } else {
      return get('herald_condi');
    }
  }

  if (spec === 'Renegade') {
    if (selectedPlayer.weapons.includes('Sword')) {
      return get('renegade_alac');
    }

    let isDeva = log.buffs.hasOwnProperty(SkillIds.BATTLE_SCARS);

    if (log.buffs.hasOwnProperty(SkillIds.LEGENDARY_ASSASSIN_STANCE)) {
      return get('renegade_shiro');
    } else if (isDeva) {
      return get('renegade_deva_kalla');
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

  // Spellbreaker is hopefully banners
  if (spec === 'Spellbreaker') {
    return get('spellbreaker_banners');
  }

  return Promise.resolve({
    targetDamage10S: [],
    casts: [],
  });
}
