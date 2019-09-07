import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import ReactNipple from 'react-nipple';
import AxisControl from '../../components/AxisControl/AxisControl';
import SocketContext from '../../services/SocketProvider';


const useStyles = makeStyles(them => ({
    container: {
      position: 'relative'
    }
  }));

function MotorControl(props) {
    const classes = useStyles()
    const [axis, setAxis] = useState('z');

    function handleAxisChange(axis){
        setAxis(axis);
    }

    function plainNipple(evt, data){
        props.socket.emit('stop reposition');
        if(data.direction.x === 'right'){
            props.socket.emit('reposition', {
                axis: axis,
                direction: 'right'
            });
        } else if (data.direction.x === 'left') {
            props.socket.emit('reposition', {
                axis: axis,
                direction: 'left'
            });
        }
}


    return (<div className={classes.container}>
        <AxisControl nrOfAxis={props.nrOfAxis} handleAxisChange={handleAxisChange}/>
        <ReactNipple
                    options={{ mode: 'static', position: { top: '60%', left: '50%' }, threshold: 0.2, lockX: true, color: "black" }}
                    
                    style={{
                        outline: '1px dashed red',
                        width: '100%',
                        height: 130
                    }}
             
                    onEnd={(evt, data) => props.socket.emit('stop reposition')}
                    onPlain={plainNipple}
                />

    </div>);
}

const MotorControlWithSocket = (props) => (
    <SocketContext.Consumer>
      {socket => <MotorControl {...props} socket={socket} />}
    </SocketContext.Consumer>
)

export default MotorControlWithSocket;