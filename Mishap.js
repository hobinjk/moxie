export default class Mishap {
  constructor(start, end, label) {
    this.start = start;
    this.end = end;
    this.label = label;
    // uhhhh
  }

  render(log) {
    const elt = document.createElement('li');
    elt.classList.add('mishap');
    const time = document.createElement('a');

    const start = ((this.start - log.start) / 1000).toFixed(2);
    const end = ((this.end - log.start) / 1000).toFixed(2);
    time.dataset.start = this.start;
    time.dataset.end = this.end;
    time.innerHTML = `${start}s&mdash;${end}s`;
    time.href = '#';
    time.classList.add('time-link');
    elt.appendChild(time);
    if (this.label) {
      elt.appendChild(document.createTextNode(' ' + this.label));
    }
    return elt;
  }
}
