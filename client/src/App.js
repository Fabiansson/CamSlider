import React from 'react';
import Main from './components/Main/Main';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import green from '@material-ui/core/colors/green';
import blue from '@material-ui/core/colors/blue';
import './App.css';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import io from 'socket.io-client';
import SocketContext from './services/SocketProvider'
import { SnackbarProvider } from 'notistack';


const theme = createMuiTheme({
  palette: {
    primary: blue,
    secondary: green,
  },
});

function App() {
  var date = new Date();
  var serverIP = "http://192.168.4.95:8000";
  if(process.env.NODE_ENV === 'development'){
    serverIP = "http://localhost:8000";
  }
  const socket = io(serverIP);
  socket.emit('time', {
    day: date.getDate(),
    month: date.getMonth(),
    year: date.getFullYear(),
    hour: date.getHours(),
    minutes: date.getMinutes(),
    seconds: date.getSeconds()
  })
  return (
    <div className="App">
      <SocketContext.Provider value={socket}>
        <SnackbarProvider maxSnack={3} dense={true} anchorOrigin={{vertical: 'top', horizontal: 'center'}}>
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <MuiThemeProvider theme={theme}>
          <Main />
        </MuiThemeProvider>
      </MuiPickersUtilsProvider>
      </SnackbarProvider>
      </SocketContext.Provider>
    </div>
  );
}

export default App;
