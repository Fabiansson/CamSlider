import React from 'react';
import {
    PieChart, Pie, Cell,
} from 'recharts';
import SocketContext from '../../services/SocketProvider';
import { colorDark } from '../../services/util';

class PanoramaGraph extends React.Component {
    constructor(props) {
        super(props);
        this.retake = this.retake.bind(this);

        this.state = {
            data: [],
            progress: []
        };
    }

    componentDidMount() {
        this.props.socket.on('panoramaInfoResponse', data => {
            this.setState({
                config: data.config
            })

            var array = []
            var progress = []
            var count = 0;
            this.state.config.forEach(function (waypoint) {
                var row = []
                for (var i = 0; i < waypoint[0]; i++) {
                    var o = Object.assign({ 'image': count, 'value': 1 });
                    count++;
                    row.push(o);
                    progress.push(0);
                }
                array.push(row);
            });

            this.setState({ data: array });
            this.setState({ progress: progress })


            this.props.socket.on('progress', data => {
                this.setState({
                    progress: data.progress
                })
            })
        })

        this.props.socket.emit('panoramaInfo');
    }

    retake(index) {
        this.props.socket.emit('retakePanoPicture', {
            index: index
        });
    }

    generatePies() {
        var pies = [];

        for (var i = 0; i < this.state.data.length; i++) {
            var pieData = this.state.data[i];
            pies.push(<Pie key={i} data={pieData} dataKey="value" cx={155} cy={150} outerRadius={25 * (i + 1)} innerRadius={25 * (i + 1) - 20} paddingAngle={0} fill="#8884d8">
                {this.generateCells(pieData)
                    //pieData.map((entry, index, arr) => <Cell key={index} onClick={() => this.retake(entry, arr.length)} fill={this.state.progressState[entry] ? '#0088FE' : '#00C49F'}/>)
                } </Pie>);
        }
        return pies;
    }

    generateCells(pieData) {
        var cells = []

        for (var j = 0; j < pieData.length; j++) {
            let imageIndex = pieData[j].image;
            let newColor = colorDark('#03ff7d', (this.state.progress[imageIndex] - 1)  * -25);
            let color = this.state.progress[imageIndex] > 0 ? newColor : '#FF8042';
            
            cells.unshift(<Cell key={imageIndex} onClick={() => this.retake(imageIndex)} fill={color} />)
        }

        return cells;
    }

    render() {
        return (<div>
            <PieChart width={500} height={400}>
                {this.generatePies()}
            </PieChart>
        </div>)
    }
}

const PanoramaGraphWithSocker = (props) => (
    <SocketContext.Consumer>
        {socket => <PanoramaGraph {...props} socket={socket} />}
    </SocketContext.Consumer>
)

export default PanoramaGraphWithSocker;