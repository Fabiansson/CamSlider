import React from 'react';
import Chip from '@material-ui/core/Chip';
import { createMuiTheme, makeStyles } from '@material-ui/core/styles';
import LinkedCameraIcon from '@material-ui/icons/LinkedCamera';
import DoneIcon from '@material-ui/icons/Done';
import { green } from '@material-ui/core/colors';
import { red } from '@material-ui/core/colors';



const useStyles = makeStyles(them => ({
  chipConnected: {
    margin: theme.spacing(1),
    color: theme.status.connected,
  },
  chipDisconnected: {
    margin: theme.spacing(1),
    color: theme.status.disconnected,
  },
}));

const theme = createMuiTheme({
  status: {
    connected: green[500],
    disconnected: red[500]
  },
});


function CameraBox(props) {
  const classes = useStyles();
  const cameraActive = props.cameraActive;

  function handleClick() {
    props.toggleCamera();
  
  }



  if (cameraActive) {
    return (<div>
      <Chip
        icon={<LinkedCameraIcon />}
        label="Use Camera"
        clickable
        className={classes.chipConnected}

        onClick={handleClick}
        deleteIcon={<DoneIcon />}
      />
    </div>);
  }
  return (<div>
    <Chip
      icon={<LinkedCameraIcon />}
      label="No Camera"
      clickable
      className={classes.chipDisconnected}

      onClick={handleClick}
      deleteIcon={<DoneIcon />}
    />
  </div>);
}

export default CameraBox;