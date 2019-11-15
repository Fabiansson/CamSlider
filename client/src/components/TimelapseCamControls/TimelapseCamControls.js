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
        this.createShutterSpeedOptions = this.createShutterSpeedOptions.bind(this);
        this.createIsoOptions = this.createIsoOptions.bind(this);
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

    componentDidMount() {
        this.props.socket.on('cameraOptions', (data) => {
            this.setState({
                shutterSpeedOptions: data.shutterSpeedOptions,
                minShutterSpeed: data.shutterSpeedOptions[0],
                maxShutterSpeed: data.shutterSpeedOptions[data.shutterSpeedOptions.length - 1],
                isoOptions: data.isoOptions,
                minIso: data.isoOptions[0],
                maxIso: data.isoOptions[data.isoOptions.length - 1]
            }, function () {
                console.log(this.state.shutterSpeedOptions);
                console.log(this.state.isoOptions);
            })
        });
        this.props.socket.emit('getCameraOptions');
    }


    toggleBrightnesscontrol() {
        this.props.toggleBrightnesscontrol();
    }

    createShutterSpeedOptions() {
        var shutterSpeedOptions = [];

        this.state.shutterSpeedOptions.forEach((option) => shutterSpeedOptions.push(
            <option key={option} value={option}>{option}</option>
        ))

        return shutterSpeedOptions;
    }

    createIsoOptions() {
        var isoOptions = [];

        this.state.isoOptions.forEach((option) => isoOptions.push(
            <option key={option} value={option}>{option}</option>
        ))

        return isoOptions;
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
        if(this.state.rampingConfig) this.props.camControlsOk(true);
    }

    genereateRampingConfig() {
        this.props.socket.emit('generateRampingConfig', {
            minIso: this.state.minIso,
            maxIso: this.state.maxIso,
            minShutterSpeed: this.state.minShutterSpeed,
            maxShutterSpeed: this.state.maxShutterSpeed
        });
        this.setState({ rampingConfig: true });
        if(this.state.referencePicture) this.props.camControlsOk(true);
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
                        <FormControl >
                            <InputLabel htmlFor="age-native-simple">Min. Shutter-Speed</InputLabel>
                            <Select
                                native
                                value={this.state.minShutterSpeed}
                                onChange={(event) => this.setState({ minShutterSpeed: event.target.value })}
                                inputProps={{
                                    name: 'Min. Shutter-Speed',
                                    id: 'age-native-simple',
                                }}
                            >
                                {this.createShutterSpeedOptions()}
                            </Select>
                        </FormControl>
                        <FormControl >
                            <InputLabel htmlFor="age-native-simple">Max. Shutter-Speed</InputLabel>
                            <Select
                                native
                                value={this.state.maxShutterSpeed}
                                onChange={(event) => this.setState({ maxShutterSpeed: event.target.value })}
                                inputProps={{
                                    name: 'Max. Shutter-Speed',
                                    id: 'age-native-simple',
                                }}
                            >
                                {this.createShutterSpeedOptions()}
                            </Select>
                        </FormControl>
                        <FormControl >
                            <InputLabel htmlFor="age-native-simple">Min. ISO</InputLabel>
                            <Select
                                native
                                value={this.state.minIso}
                                onChange={(event) => this.setState({ minIso: event.target.value })}
                                inputProps={{
                                    name: 'Min. ISO',
                                    id: 'age-native-simple',
                                }}
                            >
                                {this.createIsoOptions()}
                            </Select>
                        </FormControl>
                        <FormControl >
                            <InputLabel htmlFor="age-native-simple">Max. ISO</InputLabel>
                            <Select
                                native
                                value={this.state.maxIso}
                                onChange={(event) => this.setState({ maxIso: event.target.value })}
                                inputProps={{
                                    name: 'Max. ISO',
                                    id: 'age-native-simple',
                                }}
                            >
                                {this.createIsoOptions()}
                            </Select>
                        </FormControl>

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