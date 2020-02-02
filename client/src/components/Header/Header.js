import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import CameraBox from '../CameraBox/CameraBox';
import { Link } from 'react-router-dom';
import BackIcon from '@material-ui/icons/ArrowBack';
import IconButton from '@material-ui/core/IconButton';

const useStyles = makeStyles(theme => ({
    root: {
      flexGrow: 1,
    },
    title: {
      flexGrow: 1,
    },
  }));
  

function Header(props){
    const classes = useStyles();

    return(
        <header>
        <div className={classes.root}>
      <AppBar position="static" color="default">
        <Toolbar>
        {props.backButton &&
        <IconButton aria-label="back" component={ Link } to='/'>
        <BackIcon />
      </IconButton>
            
          }
          <Typography variant="h6" color="inherit" className={classes.title}>
            {props.title}
          </Typography>
          {props.toggleCamera !== undefined &&
            <CameraBox cameraActive={props.cameraActive} toggleCamera={props.toggleCamera}/>
          }
        </Toolbar>
      </AppBar>
    </div>
    </header>
    );

    
}

export default Header;