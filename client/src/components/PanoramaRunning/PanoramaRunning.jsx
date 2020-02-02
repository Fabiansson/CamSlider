import React from 'react';
import SocketContext from '../../services/SocketProvider';
import PanoramaGraph from '../../components/PanoramaGraph/PanoramaGraph';
import Button from '@material-ui/core/Button';
import { withSnackbar } from 'notistack';

class PanoramaRunning extends React.Component {
    constructor(props) {
        super(props);
        this.togglePause = this.togglePause.bind(this);
        this.abort = this.abort.bind(this);
        
        this.state = {
            panoConfig: undefined,
            pause: false
        };
    }


    componentDidMount() {
        this.props.socket.on('panoramaInfoResponse', data => {
            this.setState({
                panoConfig: data.config
            })
        })

        
        this.props.socket.emit('panoramaInfo');

        this.props.socket.on('isBusy', (data) =>{
            this.props.enqueueSnackbar('CamSlider is busy');
            if(data.fromSingle) this.setState({pause: true})
        })
    }

    componentWillUnmount(){
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
        window.location.href = '/panorama';
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
            {this.state.panoConfig !== undefined &&
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

const PanoramaRunningWithSocket = (props) => (
    <SocketContext.Consumer>
      {socket => <PanoramaRunning {...props} socket={socket} />}
    </SocketContext.Consumer>
)

export default withSnackbar(PanoramaRunningWithSocket);