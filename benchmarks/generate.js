import * as fs from 'fs';
import * as EIParser from '../EIParser.js';

let benchPaths = fs.readdirSync('./');

let benches = benchPaths.filter((benchPath) => {
  return benchPath.endsWith('.json');
}).map((benchPath) => {
  let text = fs.readFileSync(`./${benchPath}`, {encoding: 'utf8'});
  let data = JSON.parse(text);
  if (data.error) {
    console.log('log error', benchPath);
  }
  return data;
}).filter(log => !log.error);

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
