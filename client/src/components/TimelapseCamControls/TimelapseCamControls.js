import React from 'react';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';




class TimelapseCamControls extends React.Component {
    constructor(props) {
        super(props);
        this.toggleBrightnesscontrol = this.toggleBrightnesscontrol.bind(this);
        this.takeReferencePicture = this.takeReferencePicture.bind(this);
        this.genereateRampingConfig = this.genereateRampingConfig.bind(this);
        this.state = {
            referencePicture: false,
            rampingConfig: false,
            shutterSpeedOptions: undefined,
            isoOptions: undefined,
            minIso: undefined,
            maxIso: undefined,
            minShutterSpeed: undefined,
            maxShutterSpeed: undefined,
            loading: false,
        };
    }

    componentDidMount(){
        this.props.socket.on('cameraOptions', (data) => {
            this.setState({
                shutterSpeedOptions: data.shutterSpeedOptions,
                isoOptions: data.isoOptions
            }, function(){
                console.log(this.state.shutterSpeedOptions);
                console.log(this.state.isoOptions);
            })
        });
        this.props.socket.emit('getCameraOptions');
    }


    toggleBrightnesscontrol() {
        this.props.toggleBrightnesscontrol();
    }

    takeReferencePicture() {
        this.props.socket.emit('takeReferencePicture');
        this.setState({ loading: true });
        /*this.props.socket.on('analysingDone', data => {
            this.setState({ loading: false });
            this.setState({ referencePicture: data.success });
        })*/
        this.setState({ loading: false });
        this.setState({ referencePicture: true });
        this.props.camControlsOk(true);
    }

    genereateRampingConfig() {
        this.props.socket.emit('generateRampingConfig', {
            minIso: this.state.minIso,
            maxIso: this.state.maxIso,
            minShutterSpeed: this.state.minShutterSpeed,
            maxShutterSpeed: this.state.maxShutterSpeed
        });
        this.setState({ rampingConfig: true });
    }

    render() {
        return (
            <div>
                <FormControlLabel
                    control={
                        <Checkbox checked={this.props.brightnessControl} onChange={this.toggleBrightnesscontrol} />
                    }
                    label="Control brightness"
                />
                {this.props.brightnessControl && !this.state.referencePicture && !this.state.loading &&
                    <Button variant="contained" onClick={this.takeReferencePicture}>
                        Take Reference Picture
                    </Button>
                }
                {this.props.brightnessControl && !this.state.rampingConfig &&
                <div>
                    
                    <Button variant="contained" onClick={this.genereateRampingConfig}>
                        Generate Ramping-Config
                    </Button>
                    </div>
                }
                {this.state.loading &&
                    <CircularProgress />
                }

            </div>);
    }

}

export default TimelapseCamControls;