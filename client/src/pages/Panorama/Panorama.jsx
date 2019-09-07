import React from 'react';
import Header from '../../components/Header/Header';
import SocketContext from '../../services/SocketProvider';
import PanoramaOptions from '../../components/PanoramaOptions/PanoramaOptions';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import Checkbox from '@material-ui/core/Checkbox';
import { Link } from 'react-router-dom';
import FormControlLabel from '@material-ui/core/FormControlLabel';

import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Button from '@material-ui/core/Button';
import Waterscale from '../../components/Waterscale/Waterscale';

class Panorama extends React.Component {
    constructor(props) {
        super(props);
        this.toggleCamera = this.toggleCamera.bind(this);
        this.activateCamera = this.activateCamera.bind(this);
        this.toggleHdr = this.toggleHdr.bind(this);
        this.handleIntervalChange = this.handleIntervalChange.bind(this);
        this.createIntervalOptions = this.createIntervalOptions.bind(this);
        this.handleRowChange = this.handleRowChange.bind(this);
        this.panorama = this.panorama.bind(this);
        this.setZero = this.setZero.bind(this);


        let socket = props.socket;

        this.state = {
            hasCamera: false,
            cameraActive: false,
            hdr: false,
            waterscale: false,
            interval: 10,
            rows: []
        };

        socket.on('hasCamera', data => {
            this.setState({
                cameraActive: data.hasCamera
            })
            this.setState({
                hasCamera: data.hasCamera
            })
        })
    }


    componentDidMount() {
        this.activateCamera();
    }

    activateCamera() {
        this.props.socket.emit('requestCamera');
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

    toggleHdr() {
        this.setState({
            hdr: !this.state.hdr
        });
    }

    handleIntervalChange(event) {
        this.setState({
            interval: event.target.value
        })
    }

    handleRowChange(rows) {
        this.setState({ rows: rows });
    }

    setZero(){
        this.setState({waterscale: true})
        this.props.socket.emit('waterscale');
    }

    panorama() {
        this.props.socket.emit('panorama', {
            config: this.state.rows,
            interval: this.state.interval,
            cameraControl: this.state.cameraActive,
            hdr: this.state.hdr
        });
    }

    createIntervalOptions = () => {
        let interval = []
        for (let i = 1; i <= 120; i++) {
            interval.push(<option key={i} value={i}>{i}</option>)
        }
        return interval
    }

    render() {
        return (<div >
            <Header title="Panorama"
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
            />

            <div>
                {!this.state.waterscale &&
                    <Waterscale nrOfAxis={2} setZero={this.setZero} />}
                {this.state.waterscale &&
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
                                <FormControl >
                                    <InputLabel htmlFor="age-native-simple">Interval</InputLabel>
                                    <Select
                                        native
                                        value={this.state.interval}
                                        onChange={this.handleIntervalChange}
                                        inputProps={{
                                            name: 'Interval',
                                            id: 'age-native-simple',
                                        }}
                                    >
                                        {this.createIntervalOptions()}
                                    </Select>
                                </FormControl>

                                {this.state.cameraActive &&
                                    <FormControlLabel
                                        control={
                                            <Checkbox checked={this.state.hdr} onChange={this.toggleHdr} />
                                        }
                                        label="HDR"
                                    />
                                }
                            </ExpansionPanelDetails>
                        </ExpansionPanel>

                        <ExpansionPanel>
                            <ExpansionPanelSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls="panel1a-content"
                                id="panel1a-header"
                            >
                                <Typography>Panorama Options</Typography>
                            </ExpansionPanelSummary>
                            <ExpansionPanelDetails>
                                <PanoramaOptions rows={this.state.rows} handleRowChange={this.handleRowChange} />
                            </ExpansionPanelDetails>
                        </ExpansionPanel>


                        {this.state.rows.length > 0 &&
                            <Button variant="outlined" onClick={this.panorama} component={Link} to="/runningPanorama" >
                                Start
              </Button>
                        }</div>
                }
            </div>
        </div>
        );
    }
}

const PanoramaWithSocket = (props) => (
    <SocketContext.Consumer>
        {socket => <Panorama {...props} socket={socket} />}
    </SocketContext.Consumer>
)

export default PanoramaWithSocket;