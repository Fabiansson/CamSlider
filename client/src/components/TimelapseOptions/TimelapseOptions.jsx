import React from 'react';
import SecondsTimePicker from '../SecondsTimePicker/SecondsTimePicker';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import Grid from '@material-ui/core/Grid';


import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormLabel from '@material-ui/core/FormLabel';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';

class TimelapseOptions extends React.Component {
  constructor(props) {
    super(props);
    this.handleIntervalChange = this.handleIntervalChange.bind(this);
    this.handleRecordingTimeChange = this.handleRecordingTimeChange.bind(this);
    this.handleMovieTimeChange = this.handleMovieTimeChange.bind(this);
    this.handleDisableChange = this.handleDisableChange.bind(this);
    this.state = {
      disabled: 'interval'
    };
  }

  handleIntervalChange(event) {
    this.props.calculateSliders(this.state.disabled, 'interval', event.target.value);
  }

  handleRecordingTimeChange(value) {
    var seconds = this.toSeconds(value);
    this.props.calculateSliders(this.state.disabled, 'recordingTime', seconds);
  }

  handleMovieTimeChange(value) {
    var seconds = this.toSeconds(value);
    this.props.calculateSliders(this.state.disabled, 'movieTime', seconds);
  }

  toDateTime(secs) {
    console.log("lklkl");
    var t = new Date(1970, 0, 1); // Epoch
    t.setSeconds(secs);
    return t;
  }

  toSeconds(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();

    var totalSeconds = (hours * 3600) + (minutes * 60) + seconds;
    return totalSeconds;
  }

  createIntervalOptions = () => {
    let interval = []

    for (let i = 1; i <= 120; i++) {
      interval.push(<option key={i.toString()} value={i}>{i}</option>)
    }
    return interval
  }

  handleDisableChange(event){
    this.setState({disabled: event.target.value})
  }


  render() {
    console.log("rerender general options");
    return (
      <div>
        <Grid container spacing={1}>
        <Grid item xs={8}>
            <div>
              <FormControl >
                <InputLabel htmlFor="age-native-simple">Interval</InputLabel>
                <Select
                  native
                  disabled={this.state.disabled === 'interval'}
                  value={this.props.interval}
                  onChange={this.handleIntervalChange}
                  inputProps={{
                    name: 'Interval',
                    id: 'age-native-simple',
                  }}
                >
                  {this.createIntervalOptions()}
                </Select>
              </FormControl>
            </div>
            <div>
              <SecondsTimePicker disabled={this.state.disabled === 'recordingTime'} label="Recording Time" value={this.toDateTime(this.props.recordingTime)} onChange={this.handleRecordingTimeChange} />
            </div>
            <div>
              <SecondsTimePicker disabled={this.state.disabled === 'movieTime'} label="Movie Time" value={this.toDateTime(this.props.movieTime)} onChange={this.handleMovieTimeChange} />
            </div>
          </Grid>
          <Grid item xs={4}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Lock</FormLabel>
              <RadioGroup
                aria-label="Lock"
                name="lock"

                value={'interval'}
                onChange={this.handleDisableChange}
              >
                <FormControlLabel checked={this.state.disabled === 'interval'} value="interval" control={<Radio />} labelPlacement="top" />
                <FormControlLabel checked={this.state.disabled === 'recordingTime'} value="recordingTime" control={<Radio />} labelPlacement="top" />
                <FormControlLabel checked={this.state.disabled === 'movieTime'} value="movieTime" control={<Radio />} labelPlacement="top" />
              </RadioGroup>
            </FormControl>
          </Grid>
          

        </Grid>


      </div>
    );
  }
}

export default TimelapseOptions;