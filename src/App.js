import React, { Component } from 'react';
import './App.css';
import video from './video.mp4';
import store from 'store';
import Session from './Session';
import Interval from './Interval';

class App extends Component {
  constructor(props) {
    super(props);
    this.videoElement = React.createRef();

    let video = {};
    if (store.get('sampleVideo')) {
      video = store.get('sampleVideo');
    } else {

      // Initialize video in localStorage
      video = {
        id: 'sampleVideo',
        currentSession: null,
        sessions: [],
        duration: 0,
      };
      store.set('sampleVideo', video);
    }

    this.state = { video };
    this.handleMetadata = this.handleMetadata.bind(this);
    this.recordSession = this.recordSession.bind(this);
  }

  componentDidMount() {
    const video = store.get('sampleVideo');
    if (video) {

      const session = new Session(video.currentSession);
      video.currentSession = session.id;
      video.sessions.push(session);

      store.set('sampleVideo', video);
      this.setState({ video });
    }

    this.videoElement.current.addEventListener('loadedmetadata', this.handleMetadata, false);
    this.videoElement.current.addEventListener('timeupdate', this.recordSession, false);
  }

  componentWillUnmount() {
    this.videoElement.current.removeEventListener('loadedmetadata', this.handleMetadata, false);
  }

  handleMetadata(e) {
    const video = store.get('sampleVideo');
    if (!video) {
      return;
    }

    video.duration = this.videoElement.current.duration;
    video.currentTime = this.videoElement.current.currentTime;
    store.set('sampleVideo', video);
    this.setState({ video });
  }

  recordSession(e) {
    const video = store.get('sampleVideo');
    if (!video) {
      return;
    }

    const session = video.sessions[video.currentSession];

    // Flatten out an array of all the old intervals
    // from previous sessions
    const prevIntervals = video.sessions
      .filter(prevSession => prevSession.id !== session.id)
      .map(prevSession => prevSession.intervals)
      .reduce((prev, oldIntervals) => prev.concat(oldIntervals))
      .sort((a, b) => a.start - b.start);

    // Reset intervals each time before re-saving
    session.intervals = [];

    // Each video element returns a TimeRanges object
    // as a value of the played key
    // TimeRanges are x number of time intervals
    const intervals = this.videoElement.current.played;
    let totalSecondsPlayed = 0;

    // Save any intervals to the intervals array
    // Calculate total seconds based on number of intervals
    // and the seconds between their start and end times
    for (let i = 0; i < intervals.length; i++) {
      const interval = new Interval(i, intervals);
      session.intervals.push(interval);
      totalSecondsPlayed += interval.diff;
    }

    const reducedIntervals = Session.reduceIntervals(prevIntervals, session.intervals);

    session.secondsPlayed = totalSecondsPlayed;
    store.set('sampleVideo', video);
    this.setState({ video });
  }

  render() {
    return (
      <div className="App">
        <div className="video-container">
          <video id="sampleVideo" src={video} controls ref={this.videoElement} />
        </div>
      </div>
    );
  }
}

export default App;
