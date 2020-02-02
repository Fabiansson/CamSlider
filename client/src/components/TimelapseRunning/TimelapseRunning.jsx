import React from 'react';
import SocketContext from '../../services/SocketProvider';
import TimelapseGraph from '../TimelapseGraph/TimelapseGraph';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import CameraPicture from '../CameraPicture/CameraPicture';

class TimelapseRunning extends React.Component {
    constructor(props) {
        super(props);
        this.abort = this.abort.bind(this);
        this.changeReference = this.changeReference.bind(this);
        
        this.state = {
            waypoints: undefined,
            startTime: undefined,
            endTime: undefined,
            progress: 0,
            shutterSpeed: undefined,
            iso: undefined,
            brightness: undefined,
            reference: undefined
        };
    }


    componentDidMount() {
        this.props.socket.on('timelapseInfoResponse', data => {
            this.setState({
                waypoints: data.waypoints,
                startTime: data.startTime,
                endTime: data.endTime
            })
        })

        this.props.socket.on('progress', (data) => {
            this.setState({
                progress: data.step
            })
        })

        this.props.socket.on('image', (data) => {
            this.setState({
                shutterSpeed: data.shutterSpeed,
                iso: data.iso,
                brightness: data.brightness,
                reference: data.reference
            })
        })

       
        this.props.socket.emit('timelapseInfo');
    }

    componentWillUnmount(){
        this.props.socket.removeAllListeners('timelapseInfoResponse');
        this.props.socket.removeAllListeners('progress');
        this.props.socket.removeAllListeners('image');
    }

    abort(){
        this.props.socket.emit('abort');
        window.location.href = '/timelapse';
    }

    addZero(i) {
        if (i < 10) {
          i = "0" + i;
        }
        return i;
    }

    changeReference(value) {
        console.log('change referennce by: ' + value);
        this.props.socket.emit('changeReference', {
            value: value
        });
        
        this.setState({
            reference: Number(this.state.reference) + Number(value)
        });
    }

    render() {
        const abortButtonStyle = {
                border: 0,
                borderRadius: 3,
                color: 'red',
                height: 30,
                padding: '0 0',
                marginTop: '2em',
                position: 'absolute',
                left: '1em',
                top: '2.5em'
        }
        const referenceButtonStyle = {

        }

          const remainingTime = new Date(new Date(this.state.endTime) - new Date());
          const h = this.addZero(remainingTime.getUTCHours());
          const m = this.addZero(remainingTime.getUTCMinutes());
          const s = this.addZero(remainingTime.getUTCSeconds());
          console.log('Start time: ' + this.state.startTime);
          console.log('End time: ' + this.state.endTime);
          console.log('Remaining time: ' + remainingTime);
          
        return (<div >
            {/*this.state.waypoints !== undefined &&
                <TimelapseGraph waypoints={this.state.waypoints}/>
            */}
            <p><span>Start: {new Date(this.state.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span><br/>
            <span>Aprox. End: {new Date(this.state.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span><br/>
            <span>Remaining: {h}:{m}:{s}</span>
            </p>
            <p>Pictures: {this.state.progress}/{this.state.waypoints ? this.state.waypoints.length : '?'}</p>
            {this.state.shutterSpeed && this.state.iso && this.state.brightness && this.state.reference &&
                <div>
                    <CameraPicture />
                    <p>Shutter-Speed: {this.state.shutterSpeed}<br/>Iso: {this.state.iso}</p>
                    <p>Brightness Value: {this.state.brightness}<br/>Reference Brightness: {this.state.reference}</p>
                    <ButtonGroup size="small" color="primary" aria-label="outlined primary button group">
                        <Button color="primary" variant="outlined" onClick={() => this.changeReference(1000)}>Brighten Reference</Button>
                        <Button color="primary" onClick={() => this.changeReference(-1000)}>Darken Reference</Button>
                    </ButtonGroup>      
                </div>
            }

            
            <Button style={abortButtonStyle} variant="outlined" onClick={this.abort} >Abort</Button>
            
            
        </div>
        );
    }
}

const TimelapseRunningWithSocket = (props) => (
    <SocketContext.Consumer>
      {socket => <TimelapseRunning {...props} socket={socket} />}
    </SocketContext.Consumer>
)

export default TimelapseRunningWithSocket;