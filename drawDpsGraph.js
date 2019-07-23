function getDps10s(targetDamage) {
  const dps10s = new Array(targetDamage.length);
  let max = 0;

  for (let i = 0; i < targetDamage.length; i++) {
    let damagePast = 0;
    if (i >= 10) {
      damagePast = targetDamage[i - 10];
    }
    let damagePresent = targetDamage[i];
    let dps = (damagePresent - damagePast) / 10;
    dps10s[i] = dps;
    max = Math.max(dps, max);
  }
  return {dps10s, max};
}

function getPath(log, dps10s, max, dimensions) {
  const {railHeight, railPad, timeToX} = dimensions;
  let height = (railHeight + railPad) * 2 + railPad;

  let points = '';
  for (let i = 0; i < dps10s.length; i++) {
    let x = timeToX(i * 1000 + log.start);
    let y = (max - dps10s[i]) / max * height + railPad;
    if (i === 0) {
      points += 'M';
    } else {
      points += 'L';
    }
    points += Math.floor(x) + ' ' + Math.floor(y) + ' ';
  }
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

  path.setAttribute('d', points);
  path.classList.add('dps-path');
  return path;
}

function draw(graph, log, benchmark, dimensions) {
  console.log('wah', benchmark);
  let {dps10s, max} = getDps10s(log.targetDamage1S);
  let {dps10s: benchDps10s, max: benchMax} =
    getDps10s(benchmark.targetDamage1S);
  let realMax = Math.max(max, benchMax);

  let path = getPath(log, dps10s, realMax, dimensions);
  let benchPath = getPath(log, benchDps10s, realMax, dimensions);
  benchPath.classList.add('dps-path-bench');

  graph.appendChild(path);
  graph.appendChild(benchPath);
}

export default draw;
