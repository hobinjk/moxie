const fs = require('fs');
const EIParser = require('../EIParser.js');

let benchPaths = fs.readdirSync('./');
console.log(benchPaths);

let benches = benchPaths.filter((benchPath) => {
  return benchPath.endsWith('.json');
}).map((benchPath) => {
  return require(`./${benchPath}`);
});

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
