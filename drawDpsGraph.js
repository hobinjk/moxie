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

function dpsToY(dpsMax, dimensions) {
  const {railHeight, railPad} = dimensions;
  let height = (railHeight + railPad) * 2 + railPad;
  let max = dpsMax * 1.5;
  let logMax = Math.log(max - dpsMax);
  let logMin = Math.log(max);
  return function(dps) {
    const logY = Math.log(max - dps);
    const y = (logMax - logY) / (logMax - logMin) * height + railPad;
    return y;
  };
}

function getPath(log, dps10s, dpsMax, dimensions) {
  const {timeToX} = dimensions;

  let points = '';
  let toY = dpsToY(dpsMax, dimensions);

  for (let i = 0; i < dps10s.length; i++) {
    let x = timeToX(i * 1000 + log.start);
    let y = toY(dps10s[i]);
    if (i === 0) {
      points += 'M';
    } else {
      points += 'L';
    }
    points += x + ' ' + y + ' ';
  }
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

  path.setAttribute('d', points);
  path.classList.add('dps-path');
  return path;
}

class Tooltip {
  constructor(container, dps10s, benchDps10s, dpsMax, dimensions) {
    this.dps10s = dps10s;
    this.benchDps10s = benchDps10s;
    this.timeToX = dimensions.timeToX;
    this.toY = dpsToY(dpsMax, dimensions);

    this.elt = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.elt.classList.add('tooltip');
    this.elt.classList.add('tooltip-hidden');

    this.diffLine = document.createElementNS('http://www.w3.org/2000/svg',
                                             'path');
    this.diffLine.classList.add('tooltip-path');

    this.explanation = document.createElementNS('http://www.w3.org/2000/svg',
                                                'text');
    this.explanation.classList.add('tooltip-explanation');

    this.elt.appendChild(this.diffLine);
    this.elt.appendChild(this.explanation);

    container.appendChild(this.elt);
  }

  show(logTimeMs, time) {
    if (time < 0) {
      return;
    }

    let x = this.timeToX(logTimeMs);
    this.elt.setAttribute('transform', `translate(${x} 0)`);

    this.diffLine.setAttribute('d', '');

    let expl = '';
    let explY = 0;
    if (time < this.dps10s.length) {
      let dps = this.dps10s[time];
      let dpsY = this.toY(dps);
      explY = dpsY;

      if (time < this.benchDps10s.length) {
        let benchDps = this.benchDps10s[time];
        let benchDpsY = this.toY(benchDps);
        explY = Math.min(explY, (dpsY + benchDpsY) / 2);

        let diffPath = `M0 ${dpsY} L0 ${benchDpsY}`;
        this.diffLine.setAttribute('d', diffPath);

        let diff = dps - benchDps;
        let dir = diff > 0 ? 'Ahead' : 'Behind';
        expl = `${dir} ${Math.abs(Math.round(diff))} at ${time}s (${Math.round(dps)} vs ${Math.round(benchDps)})`;
      } else {
        expl = `${Math.round(dps)}`;
      }
    }
    this.explanation.textContent = expl;
    this.explanation.setAttribute('x', 2);
    this.explanation.setAttribute('y', explY);

    this.elt.classList.remove('tooltip-hidden');
  }

  hide() {
    this.elt.classList.add('tooltip-hidden');
  }
}

function draw(board, log, benchmark, dimensions) {
  const {railHeight, railPad, xToTime} = dimensions;
  const {dps10s, max} = getDps10s(log.targetDamage1S);
  const {dps10s: benchDps10s, max: benchMax} =
    getDps10s(benchmark.targetDamage1S);
  const realMax = Math.max(max, benchMax);

  const path = getPath(log, dps10s, realMax, dimensions);
  const benchPath = getPath(log, benchDps10s, realMax, dimensions);
  benchPath.classList.add('dps-path-benchmark');

  board.appendChild(benchPath);
  board.appendChild(path);

  let height = (railHeight + railPad) * 2 + railPad;

  const tooltip = new Tooltip(board, dps10s, benchDps10s, realMax, dimensions);
  const boardContainer = board.parentNode;
  let boardContainerRect;

  function onMouseLeave() {
    tooltip.hide();
  }

  function onMouseMove(event) {
    if (!boardContainerRect) {
      boardContainerRect = boardContainer.getBoundingClientRect();
    }
    if (event.clientY - boardContainerRect.top > height) {
      tooltip.hide();
      return;
    }
    let totalX = event.clientX + boardContainer.scrollLeft -
      boardContainerRect.left;
    let logTime = xToTime(totalX);
    let elapsed = Math.round((logTime - log.start) / 1000);
    tooltip.show(elapsed * 1000 + log.start, elapsed);
  }

  board.addEventListener('mousemove', onMouseMove);
  board.addEventListener('mouseleave', onMouseLeave);
}

export default draw;
