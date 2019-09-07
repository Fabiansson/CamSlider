import React from 'react';
import Button from '@material-ui/core/Button';
import MotorControl from '../MotorControl/MotorControl';

class Waterscale extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            axis: []
        };

    }




    render() {
        return (
            <div>
                <MotorControl />


                <Button variant="outlined" onClick={this.props.setZero}>
                    Set zero
                </Button>
            </div>);
    }

}

export default Waterscale;