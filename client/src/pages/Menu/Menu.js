import React from 'react';
import Button from '@material-ui/core/Button';
import TimelapseIcon from '@material-ui/icons/Timelapse';
import PanoramaHorizontalIcon from '@material-ui/icons/PanoramaHorizontal';
import MovieIcon from '@material-ui/icons/Movie';
import SocketContext from '../../services/SocketProvider';
import { Link } from 'react-router-dom';
import './Menu.css';

class Menu extends React.Component {
    constructor(){
        super();
        this.state = {
        };
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
            <Button variant="outlined" onClick={() => this.props.socket.emit('shutdown')} >
                Shutdown
            </Button>
            <Button variant="outlined" onClick={() => this.props.socket.emit('reboot')} >
                Reboot
            </Button>
            <Button variant="outlined" onClick={() => this.props.socket.emit('update')} >
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