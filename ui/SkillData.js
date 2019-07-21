const DEBUG = false;

class SkillData {
  constructor() {
    this.loadSkill = this.loadSkill.bind(this);
    this.data = {};
    if (DEBUG) {
      this.failuresLog = document.createElement('div');
      this.failuresLog.style.display = 'none';
      this.failuresLog.id = 'failures-log';
      document.body.appendChild(this.failuresLog);
    }
  }

  load(skills) {
    return Promise.all(Object.keys(skills).map(this.loadSkill));
  }

  async loadSkill(id) {
    try {
      const res = await fetch(`api-cache/${id}.json`);
      const data = await res.json();
      this.data[id] = data;
    } catch (e) {
      console.log('could not fetch', id);
      if (DEBUG) {
        this.failuresLog.innerHTML += `curl https://api.guildwars2.com/v2/skills/${id} > ${id}.json<br/>\n`;
      }
    }
  }

  get(id) {
    return this.data[id];
  }
}

export default new SkillData();
