import React from 'react';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';




class TimelapseCamControls extends React.Component {
    constructor(props) {
        super(props);
        this.toggleBrightnesscontrol = this.toggleBrightnesscontrol.bind(this);
        this.takeReferencePicture = this.takeReferencePicture.bind(this);
        this.state = {
            referencePicture: false,
            loading: false,
        };
    }


    toggleBrightnesscontrol() {
        this.props.toggleBrightnesscontrol();
    }

    takeReferencePicture() {
        this.props.socket.emit('takeReferencePicture');
        this.setState({ loading: true });
        /*this.props.socket.on('analysingDone', data => {
            this.setState({ loading: false });
            this.setState({ referencePicture: data.success });
        })*/
        this.setState({loading: false});
        this.setState({referencePicture: true});
        this.props.camControlsOk(true);
    }

    render() {
        return (
            <div>
                <FormControlLabel
                    control={
                        <Checkbox checked={this.props.brightnessControl} onChange={this.toggleBrightnesscontrol} />
                    }
                    label="Control brightness"
                />
                {this.props.brightnessControl && !this.state.referencePicture && !this.state.loading &&
                    <Button variant="contained" onClick={this.takeReferencePicture}>
                        Take Reference Picture
        </Button>
                }
                {this.state.loading &&
                    <CircularProgress />
                }

            </div>);
    }

}

export default TimelapseCamControls;