import React from 'react';
import { Switch, Route } from 'react-router-dom';
import Menu from '../../pages/Menu/Menu';
import Timelapse from '../../pages/Timelapse/Timelapse';
import Panorama from '../../pages/Panorama/Panorama';
import Movie from '../../pages/Movie/Movie';
import Running from '../../pages/Running/Running';
import SocketContext from '../../services/SocketProvider';

function Main(props) {

  props.socket.on('status', function(data) {
    switch(data.running){
      case 'timelapse':
        if(window.location.pathname != '/runningTimelapse') window.location.href = '/runningTimelapse';
        console.log('timelapse running');
        break;
      case 'panorama':
          if(window.location.pathname != '/runningPanorama') window.location.href = '/runningPanorama';
        console.log('panorama running');
        break;
      case null:
          if(window.location.pathname == '/') props.socket.emit('softResetPlaner');
        console.log('nothing running');
        break;
      default:
        break;
    }
  })
  props.socket.emit('requestStatus');
  
  return (
    <main>
      <Switch>
        <Route exact path="/" component={Menu} />
        <Route path="/timelapse" component={Timelapse} />
        <Route path="/panorama" component={Panorama} />
        <Route path="/movie" component={Movie} />
        <Route path={"/runningTimelapse"} render={(props) => <Running {...props} type={'timelapse'} />} />
        <Route path={"/runningPanorama"} render={(props) => <Running {...props} type={'panorama'} />} />

        {/*<Route
          path="/timelapse"
          render={({ match: { url } }) => (
            <>
              <Route path={`${url}/`} component={Timelapse} exact />
              <Route path={`${url}/running`} render={(props) => <Running {...props} type={'timelapse'} />} />
              
            </>
          )}
          />*/}

      </Switch>
      {/*<Redirect
            to={{
              pathname: "/timelapse"
            }}
          />*/}
    </main>
  );
}

const MainWithSocket = (props) => (
  <SocketContext.Consumer>
      {socket => <Main {...props} socket={socket} />}
  </SocketContext.Consumer>
)

export default MainWithSocket;