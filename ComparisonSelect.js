import { guessBenchmarkForPlayer } from './benchmark.js';
import {benchmarks} from './benchmarks/benchmarks.js';

export default class ComparisonSelect {
  constructor(log, player) {
    this.elt = null;
    this.listener = null;
    this.onSelect = this.onSelect.bind(this);
    this.onLogSelectInput = this.onLogSelectInput.bind(this);

    this.boss = log.boss;

    if (log.boss.includes('Golem')) {
      // offer benchmark defaults matching player spec
      this.logSelect = document.createElement('select');
      this.logSelect.classList.add('target-select-select');
      let guessKey = guessBenchmarkForPlayer(log, player);

      let playerSpec = player.profession.toLowerCase().substring(0, 5);
      for (let key of Object.keys(benchmarks)) {
        let spec = key.split('_')[0].substring(0, 5);
        if (spec !== playerSpec) {
          continue;
        }
        let logOption = document.createElement('option');
        logOption.textContent = key.replace(/_/g, ' ');
        logOption.value = key;
        this.logSelect.appendChild(logOption);
      }
      this.logSelect.addEventListener('input', this.onLogSelectInput);
      this.logSelect.value = guessKey;
    }
  }

  render() {
    this.elt = document.createElement('div');
    this.elt.classList.add('target-select');

    let bossLabel = document.createElement('div');
    bossLabel.classList.add('target-select-boss-label');
    bossLabel.textContent = this.boss;
    this.elt.appendChild(bossLabel);

    if (this.logSelect) {
      this.elt.appendChild(this.logSelect);
    }

    this.dpsReportText = document.createElement('input');
    this.dpsReportText.classList.add('dpsreport-text');
    this.dpsReportText.type = 'text';
    this.dpsReportText.placeholder = 'https://dps.report/OFMj-20180908-200556_cairn';
    this.elt.appendChild(this.dpsReportText);

    let submit = document.createElement('input');
    submit.classList.add('target-select-submit');
    submit.type = 'button';
    submit.value = 'Select Log';
    submit.addEventListener('click', this.onSelect);
    this.elt.appendChild(submit);

    let onKeypress = (event) => {
      if (event.key === 'Enter') {
        this.onSelect();
      }
    }

    this.dpsReportText.addEventListener('keypress', onKeypress);

    if (this.logSelect) {
      this.onLogSelectInput();
    }

    document.querySelector('.target-select-container').appendChild(this.elt);
    this.elt.parentNode.classList.remove('hidden');

  }

  remove() {
    this.elt.parentNode.classList.add('hidden');
    this.elt.parentNode.removeChild(this.elt);
    this.playerSelect = null;
    this.elt = null;
  }

  onLogSelectInput() {
    if (!benchmarks[this.logSelect.value]) {
      return;
    }
    this.dpsReportText.value = benchmarks[this.logSelect.value].log;
  }

  onSelect() {
    let logId = 'custom';
    let selLogId = this.logSelect.value;
    if (benchmarks[selLogId] && this.dpsReportText.value === benchmarks[selLogId].log) {
      logId = selLogId;
    }
    let urlText = this.dpsReportText.value.trim();
    if (!/^https:\/\/dps\.report\/[^/]+$/.test(urlText)) {
      alert('Paste in format https://dps.report/Sosx-20180802-193036_cairn');
      return;
    }
    let url = new URL(urlText);

    this.remove();
    this.listener(url.pathname.substr(1), logId);
    this.listener = null;
  }
}

