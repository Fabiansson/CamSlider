import React from 'react';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import PointsManager from '../../components/PointsManager/PointsManager';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { arraysEqual } from '../../services/util';

class PanoramaOptions extends React.Component {
    constructor(props) {
        super(props);
        this.handleSave = this.handleSave.bind(this);
        this.handlePicturesChange = this.handlePicturesChange.bind(this);
        this.handleAngleChange = this.handleAngleChange.bind(this);
        this.addRow = this.addRow.bind(this);
        this.toggleZN = this.toggleZN.bind(this);
        this.deleteZN = this.deleteZN.bind(this);

        this.state = {
            angle: 0,
            pictures: 1,
            nadir: false,
            zenit: false,
            rows: []
        };

    }

    handlePicturesChange(event){
        this.setState({
            pictures: event.target.value
        })
    }

    handleAngleChange(event){
        this.setState({
            angle: event.target.value
        })
    }


    addRow(row) {
        var r;
        if(Array.isArray(row)) r = row;
        else r = [this.state.pictures, this.state.angle];
        this.setState({ rows: [...this.state.rows, r] }, function () {
            this.props.handleRowChange(this.state.rows);
        })
    }


    handleSave(rows) {
        this.setState({ rows: rows }, function () {
            this.props.handleRowChange(this.state.rows);
        })
    }

    createAngleOptions = () => {
        let interval = []
        for (let i = 90; i >= -90; i--) {
            interval.push(<option value={i}>{i}</option>)
        }
        return interval
    }

    createPicturesOptions = () => {
        let interval = []
        for (let i = 1; i <= 30; i++) {
            interval.push(<option value={i}>{i}</option>)
        }
        return interval
    }

    toggleZN(zenit){
        if(zenit){
            this.setState({zenit: !this.state.zenit}, function(){
                this.state.zenit ? this.addRow([1, 90]) : this.deleteZN(true);
            })
            
        }else{
            this.setState({nadir: !this.state.nadir}, function(){
                this.state.nadir ? this.addRow([1, -90]) : this.deleteZN(false);
            })
        }
    }
    
    deleteZN(zenit){
        var rows = this.state.rows;
        var row;
        if(zenit) row = [1, 90];
        else row = [1, -90];
        
        for (var i=rows.length-1; i>=0; i--) {
            if (arraysEqual(rows[i], row)) {
                console.log("DELETE NOW");
                rows.splice(i, 1);
            }
        }

        this.handleSave(rows);
    }


    

    render() {
        const divStyle = {
            width: '100%'
        };
        return (
            <div style={divStyle}>
                <FormControlLabel
                                control={
                                    <Checkbox checked={this.state.zenit} onChange={() => this.toggleZN(true)} />
                                }
                                label="Zenit"
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox checked={this.state.nadir} onChange={() => this.toggleZN(false)} />
                                }
                                label="Nadir"
                            />

                <Grid container spacing={1}>
                    <Grid item xs={8}>
                        <FormControl >
                            <InputLabel htmlFor="age-native-simple">Angle</InputLabel>
                            <Select
                                native
                                value={this.state.angle}
                                onChange={this.handleAngleChange}
                                inputProps={{
                                    name: 'Interval',
                                    id: 'age-native-simple',
                                }}
                            >
                                {this.createAngleOptions()}
                            </Select>
                        </FormControl>
                        <FormControl >
                            <InputLabel htmlFor="age-native-simple">Pictures</InputLabel>
                            <Select
                                native
                                value={this.state.pictures}
                                onChange={this.handlePicturesChange}
                                inputProps={{
                                    name: 'Interval',
                                    id: 'age-native-simple',
                                }}
                            >
                                {this.createPicturesOptions()}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={4}>
                        <PointsManager items={this.state.rows} handleSave={this.handleSave} />

                    </Grid>
                </Grid>


                <Button variant="outlined" onClick={this.addRow}>
                    Add Point
      </Button>
            </div>);
    }

}

export default PanoramaOptions;