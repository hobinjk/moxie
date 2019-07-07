const validSpecs = {
  Daredevil: true,
  Weaver: true,
  Mirage: true,
  Chronomancer: true,
};

export default class TargetSelect {
  constructor(log) {
    this.boss = log.boss || 'Unknown';
    console.log(log.players);
    this.players = log.players
      .filter(player => validSpecs[player.agent.Player.prof_spec]);
    this.onSelect = this.onSelect.bind(this);
    this.elt = null;
    this.playerSelect = null;
    this.listener = null;
  }

  render() {
    this.elt = document.createElement('div');
    this.elt.classList.add('target-select');

    let bossLabel = document.createElement('div');
    bossLabel.classList.add('target-select-boss-label');
    bossLabel.textContent = this.boss;
    this.elt.appendChild(bossLabel);

    this.playerSelect = document.createElement('select');
    this.playerSelect.classList.add('target-select-player-select');
    for (let player of this.players) {
      let playerOption = document.createElement('option');
      playerOption.textContent = player.name;
      playerOption.value = player.name;
      this.playerSelect.appendChild(playerOption);
    }
    this.elt.appendChild(this.playerSelect);

    let submit = document.createElement('input');
    submit.classList.add('target-select-submit');
    submit.type = 'button';
    submit.value = 'Analyze';
    submit.addEventListener('click', this.onSelect);
    this.elt.appendChild(submit);

    document.querySelector('.target-select-container').appendChild(this.elt);
  }

  remove() {
    this.elt.parentNode.removeChild(this.elt);
    this.playerSelect = null;
    this.elt = null;
  }

  onSelect() {
    let selectedPlayer = null;
    for (let player of this.players) {
      if (this.playerSelect.value === player.name) {
        selectedPlayer = player;
      }
    }
    this.remove();
    this.listener(selectedPlayer);
    this.listener = null;
  }
}
