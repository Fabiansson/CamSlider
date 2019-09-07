import React from 'react';
import SecondsTimePicker from '../SecondsTimePicker/SecondsTimePicker';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';

class GeneralOptions extends React.Component {
    constructor(props) {
        super(props);
        this.handleIntervalChange = this.handleIntervalChange.bind(this);
        this.handleRecordingTimeChange = this.handleRecordingTimeChange.bind(this);
        this.handleMovieTimeChange = this.handleMovieTimeChange.bind(this);
        this.state = {
            intervalDisabled: false,
            recordingTimeDisabled: false,
            movieTimeDisabled: false
        };
    }

    handleIntervalChange(value){
        this.props.calculateSliders('interval', 'interval', value);
    }

    handleRecordingTimeChange(value){
        var seconds = this.toSeconds(value);
        this.props.calculateSliders('interval', 'recordingTime', seconds);
    }

    handleMovieTimeChange(value){
        var seconds = this.toSeconds(value);
        this.props.calculateSliders('interval', 'movieTime', seconds);
    }

    toDateTime(secs) {
        var t = new Date(1970, 0, 1); // Epoch
        t.setSeconds(secs);
        return t;
    }

    toSeconds(date){
       var hours = date.getHours();
       var minutes = date.getMinutes();
       var seconds = date.getSeconds();

       var totalSeconds = (hours * 3600) + (minutes * 60) + seconds;
       return totalSeconds;
    }
    createIntervalOptions = () => {
        let interval = []
    
        // Outer loop to create parent
        for (let i = 1; i <= 120; i++) {
          //Inner loop to create children
          
            interval.push(<option value={i}>{i}</option>)
          
          //Create the parent and add the childre
        }
        return interval
      }


    render() {

        return (
            <div>
                
                <FormControl >
        <InputLabel htmlFor="age-native-simple">Interval</InputLabel>
        <Select
          native
          disabled={this.state.intervalDisabled}
          value={this.props.interval}
          onChange={this.handleIntervalChange('age')}
          inputProps={{
            name: 'Interval',
            id: 'age-native-simple',
          }}
        >
        {this.createIntervalOptions()}
        </Select>
      </FormControl>
                <SecondsTimePicker disabled={this.state.recordingTimeDisabled} label="Recording Time" value={this.toDateTime(this.props.recordingTime)} onChange={this.handleRecordingTimeChange}/>
                <SecondsTimePicker disabled={this.state.movieTimeDisabled} label="Movie Time" value={this.toDateTime(this.props.movieTime)} onChange={this.handleMovieTimeChange}/>
            </div>
        );
    }
}

export default GeneralOptions;