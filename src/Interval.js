class Interval {
  constructor(id, intervals) {
    this.id = id;
    this.start = intervals.start(id);
    this.end = intervals.end(id);
  }

  get diff() {
    return this.calcDiff();
  }

  calcDiff() {
    return this.end - this.start;
  }
};

export default Interval;