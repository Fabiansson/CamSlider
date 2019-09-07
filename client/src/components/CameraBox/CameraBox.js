import React from 'react';
import Chip from '@material-ui/core/Chip';
import { createMuiTheme, makeStyles } from '@material-ui/core/styles';
import LinkedCameraIcon from '@material-ui/icons/LinkedCamera';
import DoneIcon from '@material-ui/icons/Done';
import { green } from '@material-ui/core/colors';
import { red } from '@material-ui/core/colors';
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';



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
  const hasCamera = props.hasCamera;
  const [open, setOpen] = React.useState(false);


  function handleClick() {
    props.toggleCamera();
    setOpen(true);
  }

  function handleClose(event, reason) {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
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
    {!hasCamera &&
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        open={open}
        autoHideDuration={5000}
        onClose={handleClose}
        ContentProps={{
          'aria-describedby': 'message-id',
        }}
        message={<span id="message-id">No camera connected</span>}
        action={[
          <IconButton
            key="close"
            aria-label="Close"
            color="inherit"
            className={classes.close}
            onClick={handleClose}
          >
            <CloseIcon />
          </IconButton>,
        ]}
      />
    }

  </div>);
}

export default CameraBox;