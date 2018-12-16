class Session {
  constructor(prevSessionId) {
    this.id = prevSessionId === null ? 0 : prevSessionId + 1;
    this.secondsPlayed = 0;
    this.intervals = [];
    this.combinedIntervals = [];
  }

  static reduceIntervals(prevIntervals, currentIntervals) {
    const reducedIntervals = [];
    const intervals = prevIntervals.concat(...currentIntervals);

    for (let i = 0; i < intervals.length; i++) {
      if (i === 0) {
        reducedIntervals.push(intervals[i]);
        continue;
      }

      const prevInterval = reducedIntervals[i - 1];
      const currentInterval = intervals[i];

      // If current start is in between prev range
      // and if current end is in between prev range
      // then we don't concat anything and just return
      const startInPrevRange = currentInterval.start >= prevInterval.start;
      const endInPrevRange = currentInterval.end <= prevInterval.end;
      if (startInPrevRange && endInPrevRange) {
        continue;
      }

      // If current start is in between prev range
      // BUT current end is NOT between prev range
      // then we alter prev range's END value
      // without concatenating anything, and then returning
      if (startInPrevRange && !endInPrevRange) {
        prevInterval.end = currentInterval.end;
        continue;
      }

      // If neither current start nor end are between
      // prev range, then we concat current to reduced intervals
      if (!startInPrevRange && !endInPrevRange) {
        reducedIntervals.push(currentInterval);
      }
    }

    return reducedIntervals;
  }
}

export default Session;