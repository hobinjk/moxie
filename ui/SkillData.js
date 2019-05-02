class SkillData {
  constructor() {
    this.loadSkill = this.loadSkill.bind(this);
    this.data = {};
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
    }
  }

  get(id) {
    return this.data[id];
  }
}

export default new SkillData();
