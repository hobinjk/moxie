import SkillIds from './SkillIds';

async function get(url) {
  const res = await fetch(url);
  return res.json();
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
    return get('./benchmarks/tempest_power.json');
  }

  if (spec === 'Weaver') {
    let isCondi = log.buffs.hasOwnProperty(SkillIds.WEAVE_SELF);
    if (isCondi) {
      if (selectedPlayer.weapons.includes('Sword')) {
        return get('./benchmarks/weaver_condi_sword.json');
      } else if (selectedPlayer.weapons.includes('Dagger')) {
        return get('./benchmarks/weaver_condi_dagger.json');
      }
    } else {
      let isFreshAir = log.buffs.hasOwnProperty(SkillIds.ATTUNEMENT_FIRE_WATER);
      // See if LH was cast
      if (hasCast(log, SkillIds.LIGHTNING_HAMMER)) {
        if (isFreshAir) {
          return get('./benchmarks/weaver_power_btth_large.json');
        } else {
          return get('./benchmarks/weaver_power_btth_large.json');
        }
      } else if (isFreshAir) {
        return get('./benchmarks/weaver_power_fa_small.json');
      } else {
        return get('./benchmarks/weaver_power_btth_small.json');
      }
    }
  }

  if (spec === 'Chronomancer') {
    if (selectedPlayer.weapons.includes('Shield')) {
      if (selectedPlayer.weapons.includes('Scepter')) {
        return get('./benchmarks/chrono_condi_boon.json');
      } else {
        return get('./benchmarks/chrono_power_boon.json');
      }
    }
    if (hasCast(log, SkillIds.PHANTASMAL_BERSERKER)) {
      return get('./benchmarks/chrono_power_domi.json');
    } else if (selectedPlayer.weapons.includes('Scepter')) {
      return get('./benchmarks/chrono_condi.json');
    } else {
      return get('./benchmarks/chrono_power_illu.json');
    }
  }

  if (spec === 'Mirage') {
    return get('./benchmarks/mirage.json');
  }

  if (spec === 'Reaper') {
    return get('./benchmarks/reaper.json');
  }

  if (spec === 'Scourge') {
    return get('./benchmarks/scourge.json');
  }

  if (spec === 'Engineer') {
    return get('./benchmarks/engineer.json');
  }

  if (spec === 'Holosmith') {
    return get('./benchmarks/holo_condi.json');
  }

  if (spec === 'Soulbeast') {
    if (selectedPlayer.weapons.includes('Shortbow')) {
      if (hasCast(log, SkillIds.NARCOTIC_SPORES)) {
        return get('./benchmarks/soulbeast_condi_iboga.json');
      } else {
        return get('./benchmarks/soulbeast_condi_lynx.json');
      }
    } else {
      return get('./benchmarks/soulbeast_power.json');
    }
  }

  if (spec === 'Daredevil') {
    if (selectedPlayer.weapons.includes('Staff')) {
      return get('./benchmarks/daredevil_power.json');
    } else {
      return get('./benchmarks/daredevil_condi.json');
    }
  }

  if (spec === 'Deadeye') {
    if (selectedPlayer.weapons.includes('Rifle')) {
      return get('./benchmarks/deadeye_rifle.json');
    } else {
      return get('./benchmarks/deadeye_dagger.json');
    }
  }

  if (spec === 'Dragonhunter') {
    return get('./benchmarks/dragonhunter.json');
  }

  if (spec === 'Firebrand') {
    if (hasCast(log, SkillIds.MANTRA_OF_POTENCE)) {
      if (selectedPlayer.weapons.includes('Greatsword')) {
        return get('./benchmarks/firebrand_power_quick.json');
      } else {
        return get('./benchmarks/firebrand_condi_quick.json');
      }
    } else {
      return get('./benchmarks/firebrand_condi.json');
    }
  }

  if (spec === 'Herald') {
    return get('./benchmarks/herald_boon.json');
  }

  if (spec === 'Renegade') {
    if (hasCast(log, SkillIds.ORDERS_FROM_ABOVE)) {
      return get('./benchmarks/renegade_alac.json');
    }

    if (log.buffs.hasOwnProperty(SkillIds.LEGENDARY_ASSASSIN_STANCE)) {
      return get('./benchmarks/renegade_shiro.json');
    } else {
      return get('./benchmarks/renegade_kalla.json');
    }
  }

  if (spec === 'Warrior') {
    return get('./benchmarks/warrior_banners.json');
  }

  if (spec === 'Berserker') {
    let isCondi = selectedPlayer.weapons.includes('Longbow');
    if (isCondi) {
      if (hasCast(log, SkillIds.SUNDERING_LEAP)) {
        return get('./benchmarks/berserker_condi.json');
      } else {
        return get('./benchmarks/berserker_condi_banners.json');
      }
    } else if (hasCast(log, SkillIds.THROW_BOLAS)) {
      return get('./benchmarks/berserker_power.json');
    } else {
      return get('./benchmarks/berserker_power_banners.json');
    }
  }

  if (spec === 'Spellbreaker') {
    return get('./benchmarks/spellbreaker.json');
  }

  return Promise.resolve({
    targetDamage10S: [],
    casts: [],
  });
}
