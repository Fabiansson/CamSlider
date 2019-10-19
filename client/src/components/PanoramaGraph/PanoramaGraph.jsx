import React from 'react';
import {
    PieChart, Pie, Cell,
} from 'recharts';
import SocketContext from '../../services/SocketProvider';

class PanoramaGraph extends React.Component {
    constructor(props) {
        super(props);
        this.retake = this.retake.bind(this);

        this.state = {
            data: [],
            progress: 0,
            progressState: [],
        };
    }

    componentDidMount() {
        var array = []
        var progressArray = []
        var count = 0;
        this.props.config.forEach(function (waypoint) {
            //console.log(waypoint);
            var row = []
            for (var i = 0; i < waypoint[0]; i++) {
                var o = Object.assign({ 'image': count, 'angle': waypoint[1], 'innerIndex': i, 'value': 1 });
                count++;
                console.log(o);
                row.push(o);
                progressArray.push(false);
            }
            array.push(row);
        });

        progressArray[0] = true;

        this.setState({ data: array });
        this.setState({progressState: progressArray})


        this.props.socket.on('progress', data => {
            var newProgressArray = this.state.progressState;
            newProgressArray[data.value] = true;
            this.setState({
                progressState: newProgressArray
            })
        })
    
    }

    retake(photo, totalInRow){
        var angle = photo[1];
        var index = photo[0];
        console.log(angle + " " + index + " " + totalInRow);
        this.props.socket.emit('retakePanoPicture', {
            angle: angle,
            index: index,
            totalInRow: totalInRow
        })
    }

    generatePies() {
        var pies = [];

        for (var i = 0; i < this.state.data.length; i++) {
            var pieData = this.state.data[i];
            pies.push(<Pie key={i} data={pieData} dataKey="value" cx={155} cy={150} outerRadius={25 * (i + 1)} innerRadius={25 * (i + 1) - 20} paddingAngle={0} fill="#8884d8"> 
            {   this.generateCells(pieData)
                //pieData.map((entry, index, arr) => <Cell key={index} onClick={() => this.retake(entry, arr.length)} fill={this.state.progressState[entry] ? '#0088FE' : '#00C49F'}/>)
            } </Pie>);
        }
        return pies;
    }

    generateCells(pieData){
        var cells = []

        for(var j = 0; j < pieData.length; j++){
            let imageIndex = pieData[j].image;
            let image = [pieData[j].innerIndex, pieData[j].angle];
            console.log(image);
            let rowLength = pieData.length;
            cells.push(<Cell key={imageIndex} onClick={() => this.retake(image, rowLength)} fill={this.state.progressState[imageIndex] ? '#00C49F' : '#FF8042'}/>)
        }

        return cells;
    }



    render() {

        return (<div >
            <PieChart width={500} height={400}>
        {this.generatePies()}
        
            </PieChart>
        </div>
        );
    }
}

const PanoramaGraphWithSocker = (props) => (
    <SocketContext.Consumer>
      {socket => <PanoramaGraph {...props} socket={socket} />}
    </SocketContext.Consumer>
)

export default PanoramaGraphWithSocker;