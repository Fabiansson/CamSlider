import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import TimelapseIcon from '@material-ui/icons/Timelapse';
import PanoramaHorizontalIcon from '@material-ui/icons/PanoramaHorizontal';
import MovieIcon from '@material-ui/icons/Movie';
import SocketContext from '../../services/SocketProvider';
import { Link } from 'react-router-dom';
import './Menu.css';

class Menu extends React.Component {
    constructor(){
        super();
        this.openDialog = this.openDialog.bind(this);
        this.handleYes = this.handleYes.bind(this);
        this.handleNo = this.handleNo.bind(this);

        this.state = {
            open: false,
            task: ''
        };
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
    }

    handleNo() {
        this.setState({open: !this.state.open});
    }

    render(){

        const buttonStyle = {
            background: 'linear-gradient(223deg, rgba(9,9,121,1) 0%, rgba(0,212,255,1) 100%)',
                border: 0,
                borderRadius: 3,
                boxShadow: '0 3px 5px 2px rgba(0, 0, 0, .3)',
                color: 'white',
                height: 48,
                padding: '0 30px',
                margin: '3em',
                width: '70%'
          
          }
        return(
            <div>
                <Dialog open={this.state.open} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
                    <DialogTitle id="alert-dialog-title">{"Do you really want to " + this.state.task + "?"}</DialogTitle>
                    <DialogActions>
                        <Button onClick={this.handleNo} color="primary">No</Button>
                        <Button onClick={this.handleYes} color="primary" autoFocus>Yes</Button>
                    </DialogActions>
                </Dialog>
            <div>
            <Button style={buttonStyle} variant="contained" size="large" color="primary" component={Link} to="/timelapse">Timelapse&nbsp;
            <TimelapseIcon /></Button>
            </div>
            <div>
            <Button style={buttonStyle} variant="contained" size="large" color="primary" component={Link} to="/panorama">Panorama&nbsp;
            <PanoramaHorizontalIcon /></Button>
            </div>
            <div>
            <Button style={buttonStyle} variant="contained" size="large" color="primary" onClick={() => this.props.socket.emit('init')} component={Link} to="/movie">Movie&nbsp;
            <MovieIcon /></Button>
            </div>
            <Button variant="outlined" onClick={() => this.openDialog('shutdown')} >
                Shutdown
            </Button>
            <Button variant="outlined" onClick={() => this.openDialog('reboot')} >
                Reboot
            </Button>
            <Button variant="outlined" onClick={() => this.openDialog('restartServices')} >
                Reset
            </Button>
            <Button variant="outlined" onClick={() => this.openDialog('update')} >
                Update
            </Button>
            <h5>Env: {process.env.NODE_ENV}</h5>
            <h5>{process.env.REACT_APP_VERSION}</h5>
            </div>
        );
    }
}

const MenuWithSocket = (props) => (
    <SocketContext.Consumer>
        {socket => <Menu {...props} socket={socket} />}
    </SocketContext.Consumer>
)

export default MenuWithSocket;