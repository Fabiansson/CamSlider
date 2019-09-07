import React from 'react';
import Header from '../../components/Header/Header';
import {SocketContext} from '../../services/SocketProvider';
import TimelapseCamControls from '../../components/TimelapseCamControls/TimelapseCamControls';
import GeneralOptions from '../../components/TimelapseOptions/TimelapseOptions';
import TimelapsePoints from '../../components/TimelapsePoints/TimelapsePoints';

import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Button from '@material-ui/core/Button';

class Movie extends React.Component {
    constructor(props) {
        super(props);
        this.toggleCamera = this.toggleCamera.bind(this);
        this.activateCamera = this.activateCamera.bind(this);
        this.toggleBrightnesscontrol = this.toggleBrightnesscontrol.bind(this);
        this.camControlsOk = this.camControlsOk.bind(this);
        this.pointsOk = this.pointsOk.bind(this);
        this.calculateSliders = this.calculateSliders.bind(this);
        this.state = {
            hasCamera: false,
            cameraActive: false,
            brightnessControl: false,
            camControlsOk: false,
            pointsOk: false,
            interval: 10,
            recordingTime: 6000,
            movieTime: 12
        };

        /*socket.on('hasCamera', data => {
            this.setState({
                cameraActive: data.hasCamera
            })
            this.setState({
                hasCamera: data.hasCamera
            })
        })*/
    }
    

    componentDidMount() {
        this.activateCamera();
    }

    activateCamera() {
        //socket.emit('requestCamera');

        
    }

    toggleCamera() {
        if (this.state.cameraActive) {
            this.setState({
                cameraActive: !this.state.cameraActive
            });
        } else {
            this.activateCamera();
        }
    }

    toggleBrightnesscontrol() {
        this.setState({
            brightnessControl: !this.state.brightnessControl
        });

    }

    camControlsOk(ok) {
        this.setState({
            camControlsOk: ok
        });
    }

    pointsOk(amount) {
        this.setState({
            pointsOk: (amount > 1)
        });
    }

    calculateSliders(disabled, type, value) {
        var dynamicValue;

        if (disabled === 'interval' && type === 'recordingTime') {
            dynamicValue = (value / this.state.interval) / 25
            this.setState({
                recordingTime: value
            })
            this.setState({
                movieTime: dynamicValue
            })
        } else if (disabled === 'interval' && type === 'movieTime') {
            dynamicValue = (value * 25) * this.state.interval;
            this.setState({
                movieTime: value
            })
            this.setState({
                recordingTime: dynamicValue
            })
        } else if (disabled === 'recordingTime' && type === 'interval') {
            dynamicValue = (this.state.recordingTime / value) / 25;
            this.setState({
                interval: value
            })
            this.setState({
                movieTime: dynamicValue
            })
        } else if (disabled === 'recordingTime' && type === 'movieTime') {
            dynamicValue = this.state.recordingTime / (value * 25);
            this.setState({
                movieTime: value
            })
            this.setState({
                interval: dynamicValue
            })
        } else if (disabled === 'movieTime' && type === 'interval') {
            dynamicValue = this.state.movieTime * value * 25;
            this.setState({
                interval: value
            })
            this.setState({
                recordingTime: dynamicValue
            })
        } else if (disabled === 'movieTime' && type === 'recordingTime') {
            dynamicValue = value / (this.state.movieTime * 25)
            this.setState({
                recordingTime: value
            })
            this.setState({
                interval: dynamicValue
            })
        }
    }



    render() {
        return (<div >
            <Header title="Timelapse"
                cameraActive={
                    this.state.cameraActive
                }
                hasCamera={
                    this.state.hasCamera
                }
                toggleCamera={
                    this.toggleCamera
                }
                backButton={true}
            /> {
                this.state.cameraActive &&
                <TimelapseCamControls brightnessControl={
                        this.state.brightnessControl
                    }
                    toggleBrightnesscontrol={
                        this.toggleBrightnesscontrol
                    }
                    camControlsOk={
                        this.camControlsOk
                    }
                    /*socket={
                        socket
                    }*/
                />
            } {
                (!this.state.brightnessControl || (this.state.brightnessControl && this.state.camControlsOk)) &&
                <div>
                    <ExpansionPanel>
        <ExpansionPanelSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography>General Options</Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
        <GeneralOptions interval={
                        this.state.interval
                    }
                    recordingTime={
                        this.state.recordingTime
                    }
                    movieTime={
                        this.state.movieTime
                    }
                    calculateSliders={
                        this.calculateSliders
                    }
                />
        </ExpansionPanelDetails>
      </ExpansionPanel>

      <ExpansionPanel>
        <ExpansionPanelSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography>Timelapse Points</Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
        <TimelapsePoints /*socket={socket}*/ handlePointsChange={this.pointsOk}/>
        </ExpansionPanelDetails>
      </ExpansionPanel>
                </div>}
                {this.state.pointsOk && this.camControlsOk &&
                <Button variant="outlined">
                Start
              </Button>
                }
                </div>
        );
    }
}

export default Movie;