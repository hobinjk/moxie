import SkillIds from 'gw2-data/SkillIds';
import * as EIParser from './EIParser';
import {benchmarks} from './benchmarks/benchmarks';

export async function downloadBenchLog(url, id) {
  const res = await fetch(url);
  const raw = await res.json();
  const log = EIParser.parseJson(raw);
  log.casts = log.casts[0];
  log.buffs = log.buffs[0];
  log.targetDamage1S = log.targetDamage1S[0];
  log.id = id;
  log.name = id.replace(/_/g, ' ');
  log.benchmarkMeta = benchmarks[id] || {
    author: 'custom',
    link: '#',
    log: url,
  };
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

function hasBuff(log, name) {
  if (log.buffMap) {
    for (let key in log.buffMap) {
      if (log.buffMap[key].name === name) {
        return true;
      }
    }
  }
  if (log.skills) {
    for (let key in log.skills) {
      if (log.skills[key] === name) {
        return true;
      }
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

export function guessBenchmarkForPlayer(log, selectedPlayer) {
  const spec = selectedPlayer.profession;

  if (spec === 'Tempest') {
    if (selectedPlayer.weapons.includes('Dagger')) {
      let isGlyphOfStorms =
        log.skills.hasOwnProperty(SkillIds.GLYPH_OF_STORMS_FIRE);
      if (isGlyphOfStorms) {
        return 'tempest_condi_gos';
      } else {
        return 'tempest_condi_ele';
      }
    } else {
      return 'tempest_power';
    }
  }

  if (spec === 'Weaver') {
    let isCondi = log.skills.hasOwnProperty(SkillIds['Signet of Fire']);
    let isFreshAir = log.buffs.hasOwnProperty(SkillIds.FRESH_AIR);
    if (isCondi) {
      if (isFreshAir) {
        let isGlyphOfStorms =
          log.skills.hasOwnProperty(SkillIds.GLYPH_OF_STORMS_FIRE);
        if (isGlyphOfStorms) {
          return 'weaver_hybrid_fa';
        } else {
          return 'weaver_hybrid_fa_elementals';
        }
      }
      if (selectedPlayer.weapons.includes('Sword')) {
        return 'weaver_condi_sword';
      }
      if (selectedPlayer.weapons.includes('Scepter')) {
        return 'weaver_condi_scepter';
      }
      if (selectedPlayer.weapons.includes('Dagger')) {
        return 'weaver_condi_dagger';
      }
    } else if (selectedPlayer.weapons.includes('Staff')) {
      if (isCondi) {
        return 'weaver_condi_staff';
      }
      return 'weaver_power_staff';
    } else {
      // See if LH was cast
      if (hasCast(log, SkillIds.CONJURE_LIGHTNING_HAMMER)) {
        if (isFreshAir) {
          return 'weaver_power_fa_large';
        } else {
          return 'weaver_power_btth_large';
        }
      } else if (isFreshAir) {
        return 'weaver_power_fa_small';
      } else {
        return 'weaver_power_btth';
      }
    }
  }

  if (spec === 'Catalyst') {
    // if (hasCast(log, SkillIds.CONJURE_FIERY_GREATSWORD)) {
    return 'catalyst_power';
    // }
    // return 'catalyst_power_quick';
  }

  if (spec === 'Chronomancer') {
    if (selectedPlayer.weapons.includes('Shield')) {
      if (selectedPlayer.weapons.includes('Scepter')) {
        return 'chrono_condi_boon';
      } else {
        return 'chrono_power_boon';
      }
    }
    if (selectedPlayer.weapons.includes('Greatsword')) {
      if (hasCast(log, SkillIds.GRAVITY_WELL)) {
        return 'chrono_power_gs';
      } else if (hasGeneration(selectedPlayer, QUICKNESS)) {
        return 'chrono_power_quick_gs';
      } else {
        return 'chrono_power_gs';
      }
    } else if (selectedPlayer.weapons.includes('Scepter')) {
      return 'chrono_condi';
    } else if (hasCast(log, SkillIds.GRAVITY_WELL)) {
      return 'chrono_power_focus';
    } else if (hasGeneration(selectedPlayer, QUICKNESS)) {
      return 'chrono_power_quick_focus';
    } else if (selectedPlayer.weapons.includes('Pistol')) {
      return 'chrono_power_pistol';
    } else {
      return 'chrono_power_focus';
    }
  }

  if (spec === 'Mirage') {
    if (selectedPlayer.weapons.includes('Staff')) {
      if (selectedPlayer.weapons.includes('Axe')) {
        return 'mirage_staxe';
      } else {
        return 'mirage_staff';
      }
    }
    return 'mirage';
  }

  if (spec === 'Virtuoso') {
    if (selectedPlayer.weapons.includes('Greatsword')) {
      return 'virtuoso_gs';
    }
    if (hasCast(log, SkillIds.PHANTASMAL_DISENCHANTER)) {
      return 'virtuoso_focus';
    }
    if (hasCast(log, SkillIds.PHANTASMAL_WARDEN)) {
      return 'virtuoso_condi';
    }
    return 'virtuoso_condi_chaos';
  }

  if (spec === 'Reaper') {
    if (selectedPlayer.weapons.includes('Scepter')) {
      return 'reaper_condi';
    } else {
      return 'reaper';
    }
  }

  if (spec === 'Scourge') {
    return 'scourge';
  }

  if (spec === 'Harbinger') {
    // TODO check for quickness output?
    return 'harbinger_condi';
  }

  // Engi bench is too old
  // if (spec === 'Engineer') {
  //   return 'engineer';
  // }

  if (spec === 'Holosmith') {
    if (selectedPlayer.weapons.includes('Sword')) {
      return 'holo_power_sword';
    } else if (selectedPlayer.weapons.includes('Rifle')) {
      return 'holo_power_rifle';
    } else {
      return 'holo_condi';
    }
  }

  if (spec === 'Scrapper') {
    if (hasCast(log, SkillIds.SHREDDER_GYRO)) {
      return 'scrapper_quick';
    }
    return 'scrapper';
  }

  if (spec === 'Mechanist') {
    if (hasCast(log, SkillIds.SUPERCONDUCTING_SIGNET)) {
      return 'mechanist_condi_signets';
    }
    if (selectedPlayer.weapons.includes('Mace')) {
      return 'mechanist_power_alac';
    }
    if (hasCast(log, SkillIds.FLAME_BLAST)) {
      return 'mechanist_condi_alac';
    }
    return 'mechanist_condi';
  }

  if (spec === 'Soulbeast') {
    // Soulbeast benches are too old
    if (selectedPlayer.weapons.includes('Shortbow')) {
      return 'soulbeast_condi_sb';
    } else if (selectedPlayer.weapons.includes('Torch')) {
      // Either offhand
      if (selectedPlayer.weapons[1] === 'Axe' || selectedPlayer.weapons[3] === 'Axe') {
        return 'soulbeast_hybrid';
      }
      return 'soulbeast_condi';
    }

    if (selectedPlayer.weapons.includes('Greatsword')) {
      return 'soulbeast_power_moa_gs';
    } else {
      return 'soulbeast_power_moa_lb';
    }
  }

  if (spec === 'Untamed') {
    if (selectedPlayer.weapons.includes('Hammer')) {
      return 'untamed_power';
    }
    return 'untamed_condi';
  }

  if (spec === 'Daredevil') {
    if (selectedPlayer.weapons.includes('Staff')) {
      return 'daredevil_power';
    } else {
      return 'daredevil_condi';
    }
  }

  if (spec === 'Deadeye') {
    if (selectedPlayer.weapons.includes('Rifle')) {
      return 'deadeye_rifle';
    } else if (selectedPlayer.weapons.includes('Pistol')) {
      return 'deadeye_condi';
    }
  }
  // Deadeye dagger bench is too old
  //     return 'deadeye_dagger';

  if (spec === 'Specter') {
    if (hasCast(log, SkillIds.WELL_OF_BOUNTY)) {
      return 'specter_condi_alac';
    }
    return 'specter_condi';
  }

  if (spec === 'Dragonhunter') {
    if (selectedPlayer.weapons.includes('Sword')) {
      if (hasCast(log, SkillIds.SHIELD_OF_COURAGE)) {
        return 'dragonhunter_sword_virtues';
      } else {
        return 'dragonhunter_sword';
      }
    } else if (selectedPlayer.weapons.includes('Longbow')) {
      return 'dragonhunter_longbow';
    } else {
      return 'dragonhunter_scepter';
    }
  }

  if (spec === 'Guardian') {
    return 'guardian';
  }

  if (spec === 'Firebrand') {
    if (hasCast(log, SkillIds['"Feel My Wrath!"'])) {
      return 'firebrand_condi_quick';
    } else if (selectedPlayer.weapons.includes('Greatsword')) {
      return 'firebrand_condi_gs';
    } else {
      return 'firebrand_condi';
    }
  }

  if (spec === 'Willbender') {
    if (hasCast(log, SkillIds.PURGING_FLAMES)) {
      if (selectedPlayer.weapons.includes('Greatsword')) {
        return 'willbender_condi_gs';
      }
      if (hasBuff(log, 'Flowing Resolve')) {
        return 'willbender_condi_alac_sword';
      }
      return 'willbender_condi_sword';
    }
    return 'willbender_power_focus';
  }

  if (spec === 'Herald') {
    if (selectedPlayer.weapons.includes('Sword')) {
      if (hasCast(log, SkillIds.FACET_OF_LIGHT)) {
        return 'herald_boon';
      } else {
        return 'herald_power';
      }
    } else {
      return 'herald_condi';
    }
  }

  if (spec === 'Renegade') {
    if (selectedPlayer.weapons.includes('Sword')) {
      return 'renegade_alac';
    }

    let isDeva = log.buffs.hasOwnProperty(SkillIds.BATTLE_SCARS);

    if (log.buffs.hasOwnProperty(SkillIds.LEGENDARY_ASSASSIN_STANCE)) {
      return 'renegade_shiro';
    } else if (isDeva) {
      return 'renegade_deva_kalla';
    } else {
      return 'renegade_kalla';
    }
  }

  if (spec === 'Vindicator') {
    if (selectedPlayer.weapons.includes('Sword')) {
      return 'vindicator_power_sword';
    }
    return 'vindicator_power_gs';
  }

  // Warrior bench is too old
  // if (spec === 'Warrior') {
  //   return 'warrior_banners';
  // }

  if (spec === 'Berserker') {
    let isCondi = selectedPlayer.weapons.includes('Longbow');
    if (isCondi) {
      if (hasCast(log, SkillIds.SUNDERING_LEAP)) {
        return 'berserker_condi';
      } else {
        return 'berserker_condi_banners';
      }
    } else if (hasCast(log, SkillIds.THROW_BOLAS)) {
      return 'berserker_power';
    } else {
      return 'berserker_power_banners';
    }
  }

  // Spellbreaker is hopefully banners
  if (spec === 'Spellbreaker') {
    if (hasCast(log, 'Banner of Strength')) {
      return 'spellbreaker_banners';
    }
    if (selectedPlayer.weapons.includes('Hammer')) {
      return 'spellbreaker_hammer';
    }
    return 'spellbreaker';
  }

  if (spec === 'Bladesworn') {
    if (hasCast(log, 'Banner of Strength')) {
      return 'bladesworn_power_quick';
    }
    return 'bladesworn_power';
  }
}

export function getBenchmarkForPlayer(log, selectedPlayer) {
  let guess = guessBenchmarkForPlayer(log, selectedPlayer);
  if (guess) {
    const url = `./benchmarks/${guess}.json`;
    return downloadBenchLog(url, guess);
  }
  return Promise.resolve({
    targetDamage10S: [],
    casts: [],
  });
}
