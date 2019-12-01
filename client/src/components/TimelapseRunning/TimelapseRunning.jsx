import React from 'react';
import SocketContext from '../../services/SocketProvider';
import TimelapseGraph from '../TimelapseGraph/TimelapseGraph';
import Button from '@material-ui/core/Button';

class TimelapseRunning extends React.Component {
    constructor(props) {
        super(props);
        this.abort = this.abort.bind(this);
        
        this.state = {
            waypoints: undefined
        };
    }


    componentDidMount() {
        this.props.socket.on('timelapseInfoResponse', data => {
            this.setState({
                waypoints: data.waypoints
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
        
        return (<div >
            {this.state.waypoints !== undefined &&
                <TimelapseGraph waypoints={this.state.waypoints}/>
            }
            
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