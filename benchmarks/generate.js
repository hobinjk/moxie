let EIParser = require('../EIParser.js');

let benches = [
  require('./berserker_condi.json'),
  require('./berserker_condi_banners.json'),
  require('./berserker_power.json'),
  require('./berserker_power_banners.json'),
  require('./chrono_condi.json'),
  require('./chrono_condi_boon.json'),
  require('./chrono_power_boon.json'),
  require('./chrono_power_domi.json'),
  require('./chrono_power_illu.json'),
  require('./chrono_power_quick_gs.json'),
  require('./chrono_power_quick_focus.json'),
  require('./daredevil_condi.json'),
  require('./daredevil_power.json'),
  require('./deadeye_condi.json'),
  require('./deadeye_rifle.json'),
  require('./dragonhunter.json'),
  require('./firebrand_condi.json'),
  require('./firebrand_condi_quick.json'),
  require('./firebrand_power_quick.json'),
  require('./herald_boon.json'),
  require('./holo_condi.json'),
  require('./mirage.json'),
  require('./reaper.json'),
  require('./renegade_alac.json'),
  require('./renegade_kalla.json'),
  require('./renegade_shiro.json'),
  require('./soulbeast_power.json'),
  require('./tempest_power.json'),
  require('./weaver_condi_dagger.json'),
  require('./weaver_condi_sword.json'),
  require('./weaver_power_btth_large.json'),
  require('./weaver_power_btth_small.json'),
  require('./weaver_power_fa_large.json'),
  require('./weaver_power_fa_small.json'),
  require('./weaver_power_staff.json'),
];

let skills = {};

for (const bench of benches) {
  const log = EIParser.parseJson(bench);
  for (let id in log.skills) {
    skills[id] = true;
  }
  for (let id in log.casts) {
    for (let cast of log.casts[id]) {
      skills[cast.id] = true;
    }
  }
}

for (let id in skills) {
  console.log(`if [ ! -e ${id}.json ]; then`);
  console.log(`  curl https://api.guildwars2.com/v2/skills/${id} > ${id}.json`);
  console.log(`fi`);
}
