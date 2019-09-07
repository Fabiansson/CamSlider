import React from 'react';
import Header from '../../components/Header/Header';
import SocketContext from '../../services/SocketProvider';
import TimelapseGraph from '../../components/TimelapseGraph/TimelapseGraph';
import PanoramaGraph from '../../components/PanoramaGraph/PanoramaGraph';
import Button from '@material-ui/core/Button';
import { withSnackbar } from 'notistack';

class Running extends React.Component {
    constructor(props) {
        super(props);
        this.togglePause = this.togglePause.bind(this);
        this.abort = this.abort.bind(this);
        
        this.state = {
            maxProgress: 100,
            waypoints: undefined,
            amountPauses: 0,
            panoConfig: undefined,
            pause: false
        };
    }


    componentDidMount() {
        this.props.socket.on('progress', data => {
            this.setState({
                progress: data.value,
                maxProgress: data.max
            })
        })
        
        this.props.socket.on('timelapseInfoResponse', data => {
            console.log("hey");
            this.setState({
                waypoints: data.waypoints
            })
        })

        this.props.socket.on('panoramaInfoResponse', data => {
            this.setState({
                panoConfig: data.config
            })
        })

        if(this.props.location.pathname === '/runningPanorama'){
            this.props.socket.emit('panoramaInfo');
        } else if (this.props.location.pathname === '/runningTimelapse'){
            this.props.socket.emit('timelapseInfo');
        }

        this.props.socket.on('isBusy', (data) =>{
            this.props.enqueueSnackbar('CamSlider is busy');
            if(data.fromSingle) this.setState({pause: true})
        })
    }

    componentWillUnmount(){
        this.props.socket.removeAllListeners('progress');
        this.props.socket.removeAllListeners('timelapseInfoResponse');
        this.props.socket.removeAllListeners('panoramaInfoResponse');
        this.props.socket.removeAllListeners('isBusy');
    }

    togglePause(){
        this.setState({pause: !this.state.pause}, function(){
            if(this.state.pause) this.props.socket.emit('pause');
            else this.props.socket.emit('resume');
        })
    }

    abort(){
        this.props.socket.emit('abort');
        if(this.props.type === 'timelapse') window.location.href = '/timelapse';
        if(this.props.type === 'panorama') window.location.href = '/panorama';
        if(this.props.type === 'movie') window.location.href = '/movie';
    }



    render() {
        var type = this.props.type;
        var title = type.charAt(0).toUpperCase() + type.slice(1)

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
            <Header title={title + ' Progress'} /> 
            {this.props.type === 'timelapse' && this.state.waypoints !== undefined &&
                <TimelapseGraph waypoints={this.state.waypoints}/>
            }
            {this.props.type === 'panorama' && this.state.panoConfig !== undefined &&
            <div>
                <PanoramaGraph config={this.state.panoConfig}/>
                <Button variant="outlined" onClick={this.togglePause}>{this.state.pause ? 'Resume' : 'Pause'}</Button>
            </div>
            }
            <Button style={abortButtonStyle} color="secondary" variant="outlined" onClick={this.abort} >Abort</Button>
            
            
        </div>
        );
    }
}

const RunningWithSocket = (props) => (
    <SocketContext.Consumer>
      {socket => <Running {...props} socket={socket} />}
    </SocketContext.Consumer>
)

export default withSnackbar(RunningWithSocket);