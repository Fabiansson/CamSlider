import React from 'react';
import Header from '../../components/Header/Header';
import TimelapseRunning from '../../components/TimelapseRunning/TimelapseRunning';
import PanoramaRunning from '../../components/PanoramaRunning/PanoramaRunning';

class Running extends React.Component {

    render() {
        var type = this.props.type;
        var title = type.charAt(0).toUpperCase() + type.slice(1)
        
        return (<div >
            <Header title={title + ' Progress'} /> 
            {this.props.type === 'timelapse' &&
                <TimelapseRunning />
            }
            {this.props.type === 'panorama' &&
            <PanoramaRunning />
            }  
        </div>
        );
    }
}

export default Running;