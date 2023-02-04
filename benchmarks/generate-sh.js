import {benchmarks} from './benchmarks.js';

for (const benchmarkKey in benchmarks) {
  const benchmark = benchmarks[benchmarkKey];
  console.log(`# ${benchmark.author} ${benchmark.link}`);
  let slug = benchmark.log.match(/dps.report\/(.+)$/)[1];
  console.log(`curl https://dps.report/getJson?permalink=${slug} > ${benchmarkKey}.json`);
}
