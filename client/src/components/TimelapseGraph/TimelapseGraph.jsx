import React from 'react';
import SocketContext from '../../services/SocketProvider';
import {
    LineChart, Line, ReferenceLine
  } from 'recharts';

class TimelapseGraph extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            data: [],
            progress: 0
        };
    }

    componentDidMount(){
        var array = []
        this.props.waypoints.forEach(function(waypoint) {

            var o = Object.assign({}, waypoint);
            array.push(o)
        });
        
        this.setState({data: array});

        this.props.socket.on('progress', (data) => {
            this.setState({progress: data.value})
        })
    }



    render() {
        
        return (<div >
            <LineChart width={300} height={100} data={this.state.data}>
        <Line type="monotone" dot={false} dataKey="1" stroke="#006992" strokeWidth={2} />
        <Line type="monotone" dot={false} dataKey="2" stroke="#ECA400" strokeWidth={2} />
        <ReferenceLine x={this.state.progress} stroke="red" />
      </LineChart>
        </div>
        );
    }
}

const TimelapseGraphWithSocket = (props) => (
    <SocketContext.Consumer>
      {socket => <TimelapseGraph {...props} socket={socket} />}
    </SocketContext.Consumer>
)

export default TimelapseGraphWithSocket;