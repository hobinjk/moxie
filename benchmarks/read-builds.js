import * as fs from 'fs';
import {parse} from 'yaml';
import {benchmarks} from './benchmarks.js';


const buildsRaw = fs.readFileSync('../../discretize-gear-optimizer/src/assets/presetdata/preset-distribution.yaml', {encoding: 'utf8'});
const dtBenchmarks = parse(buildsRaw).list;

const dtDistToBench = {
  'Power Berserker': 'berserker_power',
  'Power Spellbreaker GS': 'spellbreaker',
  'Power Spellbreaker Hammer': '',
  'Condi Quickness Bers': 'berserker_condi_quick',
  'Condi Berserker': 'berserker_condi',
  'Power Quickness Spellbreaker': '',
  'Power Quickness Bladesworn': 'bladesworn_power_quick',
  'DPS Bladesworn Tactics': 'bladesworn_power',
  'DH Radiance': 'dragonhunter_lb',
  'Condi Willbender Sword': 'willbender_condi_sword',
  'Condi Willbender GS': 'willbender_condi_gs',
  // 'CFB (5 Page RF, Allies)': '',
  'CFB (5 Page RF, No Allies)': 'firebrand_condi',
  // 'CFB (8 Page, Allies)': '',
  // 'CFB (8 page, no allies)': 'firebrand_condi_aow',
  // 'Condi Quickbrand (Allies)': '',
  'Condi Quickbrand (LL, No Allies)': 'firebrand_condi_quick',
  'Condi Alacrity Willbender': 'willbender_condi_alac_sword',
  'Power Weaver (BTTH, small)': '', // weaver_power_btth_unravel
  'Condi Weaver Sword': 'weaver_condi_sword',
  'Condi Weaver (Dagger)': 'weaver_condi_dagger',
  'Condi Weaver Staff (Large)': 'weaver_condi_staff',
  'Condi Weaver Scepter': 'weaver_condi_scepter',
  'Hybrid Weaver': 'weaver_hybrid_fa',
  'Alacrity Hybrid Tempest': '',
  'Condi Tempest': 'tempest_condi',
  'Power Tempest': 'tempest_power',
  'Power Catalyst': 'catalyst_power',
  'Power Quickness Catalyst': 'catalyst_power_quick',
  'Alacrity Renegade': 'renegade_alac',
  'Condi Alac Invocation': '',
  'Condi Alac Invocation (no allies)': '',
  'Condi Renegade Devastation': '',
  'Condi Renegade Devastation (no allies)': 'renegade_deva_kalla',
  'Condi Renegade Invocation': '',
  'Condi Renegade Invocation (no allies)': 'renegade_kalla',
  'Power Quickness Herald': 'herald_boon',
  'Power Herald FP': 'herald_power',
  'Condi Quickness Herald': 'herald_condi_boon',
  'DPS Vindicator': 'vindicator_power_sword',
  'Condi Alacrity Untamed A/A Hammer': 'untamed_condi_alac_hammer',
  'Condi Untamed Axe': 'untamed_condi',
  'Condi Slb (D/T SB)': '',
  'Condi Slb (D/T A/D)': '', // soulbeast_condi
  'Hybrid Slb OS (A/T D/A)': 'soulbeast_hybrid',
  'Power Holo ECSU': 'holo_power_sword',
  'Condi Holo': 'holo_condi',
  'Power Alacrity Mechanist (inaccurate)': 'mechanist_power_alac',
  'Condi Mechanist J-Drive Mace (approx.)': 'mechanist_condi_signets',
  'Condi Mechanist Jade Dynamo Pistol (approx.)': 'mechanist_condi',
  'Condi Alac Mechanist (inaccurate)': 'mechanist_condi_alac',
  'Power Scrapper': 'scrapper',
  'Quickness Scrapper': 'scrapper_quick',
  'Power Chrono IA GS': 'chrono_power_gs',
  'Quickness Power Chrono GS': 'chrono_power_quick_gs',
  'Quickness Power Chrono GS+Focus': 'chrono_power_quick_focus',
  'Alacrity Power Chrono GS': 'chrono_power_alac_gs',
  'Power Chrono DT Focus': '',
  'Power Chrono IA Focus': '',
  'Power Quickness Chrono': '',
  'Alacrity Staff Mirage': 'mirage_staff',
  'Alacrity Staff / Axe Mirage': 'mirage_staxe',
  'Axe Mirage (Deception Torch)': 'mirage',
  'Quickness Condi Chrono': 'chrono_condi_boon',
  'Condi Virtuoso Dueling': 'virtuoso_condi',
  'Condi Virtuoso Chaos': 'virtuoso_condi_chaos',
  'Power Virtuoso GS': 'virtuoso_gs',
  'Condi Scourge': 'scourge',
  'Power Reaper': 'reaper',
  'Condi Reaper': 'reaper_condi',
  'DPS Harbinger': 'harbinger_condi',
  'Quickness Harbinger': 'harbinger_condi_quick',
  'Quickness Power Harbinger (Approx.)': '',
  // 'Condi Deadeye': 'deadeye_condi',
  'Power Staff Daredevil': 'daredevil_power',
  // 'Condi Daredevil': 'daredevil_condi',
  'Power Deadeye Daggers M7': 'deadeye_dagger',
  'Power Deadeye Daggers BQoBK': '',
  'Rifle Deadeye Premeditation': 'deadeye_rifle',
  'Rifle Deadeye Silent Scope': '',
  // 'DPS Specter (Allies)': '',
  // 'DPS Barrier Specter (Allies)': '',
  // 'Alacrity Specter (allies)': '',
  // '[beta1] DPS Specter Endless Night': '',
};

function getName(name) {
  return dtDistToBench[name];
}

for (let build of dtBenchmarks) {
  if (build.hasOwnProperty('credit')) {
    if (!dtDistToBench.hasOwnProperty(build.name)) {
      console.log(`  '${build.name}': '',`);
    }
    let benchmarkName = getName(build.name);
    if (!benchmarkName) {
      continue;
    }
    const credit = build.credit[0];
    benchmarks[benchmarkName] = {
      author: credit.author,
      link: credit.url,
      log: credit.log,
    };
  }
}
console.log(benchmarks);
