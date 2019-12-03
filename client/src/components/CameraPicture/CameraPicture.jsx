import React from 'react';
import SocketContext from '../../services/SocketProvider';

class CameraPicture extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            imageSource: undefined
        }
    }


    componentDidMount() {
        this.props.socket.on('image', data => {
            this.setState({
                imageSource: "data:image/png;base64," + this.b64(data.buffer)
            })
        })

        
    }

    componentWillUnmount(){
        this.props.socket.removeAllListeners('image');
    }

    b64(e){var t="";var n=new Uint8Array(e);var r=n.byteLength;for(var i=0;i<r;i++){t+=String.fromCharCode(n[i])}return window.btoa(t)}

    render() {
        return (<div >
            <img id="img" alt="Recording after analysis will show here" src={this.state.imageSource} width="90%"></img>
            
        </div>
        );
    }
}

const CameraPictureWithSocket = (props) => (
    <SocketContext.Consumer>
      {socket => <CameraPicture {...props} socket={socket} />}
    </SocketContext.Consumer>
)

export default CameraPictureWithSocket;