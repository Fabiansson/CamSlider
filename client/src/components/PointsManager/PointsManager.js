import React from 'react';
import Button from '@material-ui/core/Button';
import ItemList from '../ItemList/ItemList';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import arrayMove from 'array-move';

class PointsManager extends React.Component {
    constructor(props) {
        super(props);
    
        this.handleClickOpen = this.handleClickOpen.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.onSortEnd = this.onSortEnd.bind(this);
        this.handleSave = this.handleSave.bind(this);
        this.handleDelete = this.handleDelete.bind(this);

        this.state = {
            dialogOpen: false,
            items: [...this.props.items]
        };
        
    }

    componentWillReceiveProps({items}) {
        this.setState({items: [...items]})
      }

    handleClickOpen() {
        this.setState({dialogOpen: true});
    }
    
    handleClose() {
        this.setState({dialogOpen: false});
        this.setState({items: [...this.props.items]});
    }

    handleSave() {
        this.props.handleSave(this.state.items);
        this.setState({dialogOpen: false});
    }

    handleDelete(index){
        var items = [...this.state.items];
        items.splice(index, 1);
        this.setState({items: items});
    }

    onSortEnd = ({oldIndex, newIndex}) => {
        this.setState(({items}) => ({
          items: arrayMove(items, oldIndex, newIndex),
        }));
      };

    render() {
        const divStyle = {
            width: '100%'
          };
        return (
            <div style={divStyle}>
       
                <Button variant="outlined" color="primary" onClick={this.handleClickOpen}>
        Manage Points
      </Button>
                <Dialog
        open={this.state.dialogOpen}
        onClose={this.handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Rearange or delete Points"}</DialogTitle>
        <DialogContent>
        <ItemList points={this.state.items} onSortEnd={this.onSortEnd} handleDelete={this.handleDelete}/>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.handleClose} color="primary">
            Dismiss
          </Button>
          <Button onClick={this.handleSave} color="primary" autoFocus>
            Save
          </Button>
        </DialogActions>
      </Dialog>
            </div>);
    }

}

export default PointsManager;