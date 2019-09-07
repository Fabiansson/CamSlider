import React from 'react';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import PointsManager from '../../components/PointsManager/PointsManager';
import MotorControl from '../MotorControl/MotorControl';

class TimelapsePoints extends React.Component {
    constructor(props) {
        super(props);
        this.handleSave = this.handleSave.bind(this);
        this.getAndSavePosition = this.getAndSavePosition.bind(this);
        this.sendPoints = this.sendPoints.bind(this);
        this.addtoLocal = this.addtoLocal.bind(this);

        this.state = {
            points: []
        };
        
    }

    componentDidMount(){
        this.props.socket.on('reportingPosition', function(data){
            console.log(data);
            var pos = [data.x, data.y, data.z];
            this.addtoLocal(pos);
            
        }.bind(this))
    }

    addtoLocal(pos){
        this.setState({points: [...this.state.points, pos]}, function(){
            this.sendPoints()
        })
        
    }

    getAndSavePosition() {
        this.props.socket.emit('getPosition');
        /*this.props.socket.emit('add');
        this.setState({pointsAdded: this.state.pointsAdded + 1});*/
    }


    handleSave(points){
        this.setState({points: points}, function(){
            this.sendPoints();
        })
    }

    sendPoints(){
        this.props.socket.emit('points', {
            points: this.state.points
        })
        this.props.handlePointsChange(this.state.points.length);
    }

    render() {
        const divStyle = {
            width: '100%'
          };
        return (
            <div style={divStyle}>
                
                <Grid container spacing={1}>
                <Grid item xs={8}>
                <MotorControl nrOfAxis={3} />
                </Grid>
                <Grid item xs={4}>
                <PointsManager items={this.state.points} handleSave={this.handleSave}/>
                    
                </Grid>
                </Grid>
              

<Button variant="outlined" onClick={this.getAndSavePosition}>
        Add Point
      </Button>
            </div>);
    }

}

export default TimelapsePoints;