import React from 'react';
import SocketContext from '../../services/SocketProvider';
import PanoramaGraph from '../../components/PanoramaGraph/PanoramaGraph';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import { withSnackbar } from 'notistack';

class PanoramaRunning extends React.Component {
    constructor(props) {
        super(props);
        this.togglePause = this.togglePause.bind(this);
        this.openDialog = this.openDialog.bind(this);
        this.handleYes = this.handleYes.bind(this);
        this.handleNo = this.handleNo.bind(this);
        
        this.state = {
            panoConfig: undefined,
            pause: false,
            open: false,
            task: ''
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

    openDialog(task) {
        this.setState({
            open: true,
            task: task
        });
    }

    handleYes() {
        this.setState({open: !this.state.open})
        this.props.socket.emit(this.state.task);
        window.location.href = '/';
    }

    handleNo() {
        this.setState({open: !this.state.open});
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
            <Dialog open={this.state.open} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
                <DialogTitle id="alert-dialog-title">{"Do you really want to " + this.state.task + "?"}</DialogTitle>
                <DialogActions>
                    <Button onClick={this.handleNo} color="primary">No</Button>
                    <Button onClick={this.handleYes} color="primary" autoFocus>Yes</Button>
                </DialogActions>
            </Dialog>
            {this.state.panoConfig !== undefined &&
            <div>
                <PanoramaGraph config={this.state.panoConfig}/>
                <Button variant="outlined" onClick={this.togglePause}>{this.state.pause ? 'Resume' : 'Pause'}</Button>
            </div>
            }
            <Button style={abortButtonStyle} color="secondary" variant="outlined" onClick={() => this.openDialog('abort')} >Abort</Button>
            
            
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