import React from 'react';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import { withSnackbar } from 'notistack';
import { Typography } from '@material-ui/core';


class TimelapseCamControls extends React.Component {
    constructor(props) {
        super(props);
        this.toggleBrightnesscontrol = this.toggleBrightnesscontrol.bind(this);
        this.createShutterSpeedOptions = this.createShutterSpeedOptions.bind(this);
        this.createIsoOptions = this.createIsoOptions.bind(this);
        this.takeReferencePicture = this.takeReferencePicture.bind(this);
        this.genereateRampingConfig = this.genereateRampingConfig.bind(this);
        this.selectCamera = this.selectCamera.bind(this);
        this.state = {
            referencePicture: false,
            rampingConfig: false,
            cameraCollection: undefined,
            selectedCamera: undefined,
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
        this.props.socket.on('takingReferencePictureDone', data => {
            this.setState({ loading: false });
            this.setState({ referencePicture: data.success });
            if (data.success && this.state.rampingConfig) {
                this.props.camControlsOk(true);
            } else if (!data.success) {
                this.props.enqueueSnackbar('Taking Reference Pictrue failed or settings are not in Ramping-Config.');
                this.setState({ rampingConfig: false });
            }
        })

        this.props.socket.on('cameraOptions', (data) => {
            this.setState({
                cameraCollection: data.cameraCollection,
                selectedCamera: 0,
                shutterSpeedOptions: data.cameraCollection[0].shutterSpeedOptions,
                minShutterSpeed: data.cameraCollection[0].shutterSpeedOptions[0],
                maxShutterSpeed: data.cameraCollection[0].shutterSpeedOptions[data.cameraCollection[0].shutterSpeedOptions.length - 1],
                isoOptions: data.cameraCollection[0].isoOptions,
                minIso: data.cameraCollection[0].isoOptions[0],
                maxIso: data.cameraCollection[0].isoOptions[data.cameraCollection[0].isoOptions.length - 1]
            });
        });

        this.props.socket.on('doneReadingCameraOptions', (data) => {
            this.setState({
                selectCamera: null,
                shutterSpeedOptions: data.shutterSpeedOptions,
                isoOptions: data.isoOptions,
                minShutterSpeed: data.shutterSpeedOptions[0],
                maxShutterSpeed: data.shutterSpeedOptions[data.shutterSpeedOptions.length - 1],
                minIso: data.isoOptions[0],
                maxIso: data.isoOptions[data.isoOptions.length - 1]
            })
        })

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

    createCameraCollectionOption() {
        var collectionOptions = [];

        this.state.cameraCollection.forEach((option, index) => collectionOptions.push(
            <option key={index} value={index}>{option.name}</option>
        ))

        collectionOptions.push(
            <option key={'new'} value={'new'}>Not in list</option>
        )

        return collectionOptions;
    }


    takeReferencePicture() {
        this.props.socket.emit('takeReferencePicture');
        this.setState({ loading: true });
    }

    genereateRampingConfig() {
        var minIso = parseFloat(this.state.minIso);
        var maxIso = parseFloat(this.state.maxIso);
        var minShutterSpeed = parseFloat(this.state.minShutterSpeed);
        var maxShutterSpeed = parseFloat(this.state.maxShutterSpeed);

        console.log('MinISO: ' + minIso + ' MaxISO: ' + maxIso + ' MinShutterSpeed: ' + minShutterSpeed + ' MaxShutterSpeed: ' + maxShutterSpeed);
        if (minIso <= maxIso && minShutterSpeed <= maxShutterSpeed) {
            this.props.socket.emit('generateRampingConfig', {
                camera: this.state.selectedCamera,
                minIso: minIso,
                maxIso: maxIso,
                minShutterSpeed: minShutterSpeed,
                maxShutterSpeed: maxShutterSpeed
            });
            this.setState({ rampingConfig: true });
            if (this.state.referencePicture) this.props.camControlsOk(true);
        } else {
            this.props.enqueueSnackbar('Invalid values');
        }
    }

    selectCamera(event) {
        if(event.target.value === 'new') {
            this.setState({ selectedCamera: 'new' });
            this.props.socket.emit('readCameraOptions');
        } else {
            var shutterSpeedOptions = this.state.cameraCollection[event.target.value].shutterSpeedOptions;
            var isoOptions = this.state.cameraCollection[event.target.value].isoOptions;

            this.setState({ 
                selectedCamera: event.target.value,
                shutterSpeedOptions: shutterSpeedOptions,
                isoOptions: isoOptions,
                minShutterSpeed: shutterSpeedOptions[0],
                maxShutterSpeed: shutterSpeedOptions[shutterSpeedOptions.length - 1],
                minIso: isoOptions[0],
                maxIso: isoOptions[isoOptions.length - 1]
             })
        }
    }

    render() {
        const selectStyle = {
            minWidth: 140,
            margin: '0.5em'
        };
        const infoStyle = {
            margin: '1em'
        }
        return (
            <div>
                <FormControlLabel
                    control={
                        <Checkbox checked={this.props.brightnessControl} onChange={this.toggleBrightnesscontrol} />
                    }
                    label="Control brightness"
                />
                {this.props.brightnessControl && this.state.cameraCollection && !this.state.rampingConfig &&
                    <div>
                        <FormControl style={selectStyle}>
                            <InputLabel htmlFor="age-native-simple">Camera</InputLabel>
                            <Select
                                native
                                value={this.state.selectedCamera}
                                onChange={(event) => this.selectCamera(event)}
                                inputProps={{
                                    name: 'Camera',
                                    id: 'age-native-simple',
                                }}
                            >
                                {this.createCameraCollectionOption()}
                            </Select>
                        </FormControl>
                    </div>
                }

                {this.props.brightnessControl && !this.state.referencePicture && !this.state.loading && this.state.rampingConfig &&
                    <div>
                        <Button variant="contained" onClick={this.takeReferencePicture}>
                            Take Reference Picture
                    </Button>
                    </div>
                }
                {this.props.brightnessControl && !this.state.rampingConfig && this.state.shutterSpeedOptions && this.state.isoOptions &&
                    <div>
                        <div>
                            <FormControl style={selectStyle}>
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
                            <FormControl style={selectStyle}>
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
                        </div>
                        <div>
                            <FormControl style={selectStyle}>
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
                            <FormControl style={selectStyle}>
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
                        </div>
                        <Typography style={infoStyle} variant="subtitle2">Note that your max Shutter-Speed has to be at least 2s smaller than your desired interval because of image saving and processing.</Typography>
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

export default withSnackbar(TimelapseCamControls);