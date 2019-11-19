import React, { useState } from 'react';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControl from '@material-ui/core/FormControl';


function AxisControl(props) {
    const [axis, setAxis] = useState('z');

    function handleAxisChange(event){
        setAxis(event.target.value);
        props.handleAxisChange(event.target.value);
    }


    return (<div>
        <FormControl component="fieldset">
            <RadioGroup
                aria-label="Axis"
                name="axis"

                value={'X-Axis'}
                onChange={(event) => handleAxisChange(event)}
                row
            >
                {props.nrOfAxis === 3 &&
                    <FormControlLabel label="X" checked={axis === 'x'} value="x" control={<Radio />} labelPlacement="start" />
                }

                <FormControlLabel label="Y" checked={axis === 'y'} value="y" control={<Radio />} labelPlacement="start" />
                <FormControlLabel label="Z" checked={axis === 'z'} value="z" control={<Radio />} labelPlacement="start" />
            </RadioGroup>
        </FormControl>

    </div>);
}

export default AxisControl;