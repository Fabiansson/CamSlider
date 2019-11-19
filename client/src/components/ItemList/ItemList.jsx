import React from 'react';
import {
  sortableContainer,
  sortableElement
} from 'react-sortable-hoc';
import DeleteIcon from '@material-ui/icons/Delete';
import IconButton from '@material-ui/core/IconButton';


const listStyle = {
  listStyleType: 'none',
  lineHeight: '2.5',
  padding: 0

}

const listItemStyle = {
  overflow: 'auto'

}

const buttonStyle = {
  float: 'right'
}

const SortableItem = sortableElement(({ value, onDelete }) => {
  let li
  let deleteButton = <IconButton style={buttonStyle} onClick={onDelete} aria-label="Delete">
  <DeleteIcon fontSize="small" />
</IconButton>
  if (value.length === 3) {
    li = <li style={listItemStyle}>
      X: {value[0]} Y: {value[1]} Z: {value[2]}
      {deleteButton}
    </li>
  } else if (value.length === 2) {
    li = <li style={listItemStyle}>
      Photos: {value[0]} Angle: {value[1]}
      {deleteButton}
    </li>
  }
  return (
  li
)
});



const SortableContainer = sortableContainer(({ children }) => {
  return <ul style={listStyle}>{children}</ul>;
});

class ItemList extends React.Component {
  constructor(props) {
    super(props);
    this.onDelete = this.onDelete.bind(this);

    this.state = {
      items: props.points
    };

  }


  onDelete(index) {
    this.props.handleDelete(index);
  }

  render() {
    const items = this.props.points;

    return (
      <SortableContainer distance={2} onSortEnd={this.props.onSortEnd}>
        {items.map((value, index) => (
          <SortableItem key={`item-${index}`} index={index} value={value} onDelete={() => this.onDelete(index)} />
        ))}
      </SortableContainer>


    );
  }
}

export default ItemList;