import React from 'react';
import SocketContext from '../../services/SocketProvider';
import TimelapseGraph from '../TimelapseGraph/TimelapseGraph';
import Button from '@material-ui/core/Button';

class TimelapseRunning extends React.Component {
    constructor(props) {
        super(props);
        this.abort = this.abort.bind(this);
        
        this.state = {
            waypoints: undefined,
            startTime: undefined,
            endTime: undefined,
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
                progress: data.value
            })
        })

       
        this.props.socket.emit('timelapseInfo');
    }

    componentWillUnmount(){
        this.props.socket.removeAllListeners('timelapseInfoResponse');
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
          const remainingTime = new Date(new Date(this.state.endTime) - new Date());
          const h = this.addZero(remainingTime.getUTCHours());
          const m = this.addZero(remainingTime.getUTCMinutes());
          const s = this.addZero(remainingTime.getUTCSeconds());
          
        return (<div >
            {this.state.waypoints !== undefined &&
                <TimelapseGraph waypoints={this.state.waypoints}/>
            }
            <p><span>Start Time: {new Date(this.state.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span><br/>
            <span>Aprox. End Time: {new Date(this.state.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span><br/>
            <span>Remaining Time: {h}:{m}:{s}</span>
            </p>
            
            <Button style={abortButtonStyle} color="secondary" variant="outlined" onClick={this.abort} >Abort</Button>
            
            
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