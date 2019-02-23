import React from 'react';
import deburr from 'lodash/deburr';
import Downshift from 'downshift';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import MenuItem from '@material-ui/core/MenuItem';
import Chip from '@material-ui/core/Chip';
import suggestions from './suggestions';
import styles from './styles'


class DownshiftMultiple extends React.Component {

  state = {
    inputValue: '',
    selectedItem: [],
  };

  itemToString = item => (item ? item.name : '');

  handleKeyDown = e => {
    const { inputValue, selectedItem } = this.state;
    if (selectedItem.length && !inputValue.length && e.key === 'Backspace') {
      this.setState({
        selectedItem: selectedItem.slice(0, selectedItem.length - 1),
      });
    }
  }

  handleKeyUp = e => {
    let { inputValue } = this.state;
    if (inputValue && (inputValue[inputValue.length - 1] === ' ' || e.keyCode === 13)) {
      inputValue = inputValue.trim();
      let value = {
        name: inputValue,
        address: inputValue,
        isValid: true
      }
      this.handleAdd(value);
    }
  }

  handleInputChange = e => {
    this.setState({ inputValue: e.target.value });
  };

  handleAdd = item => {
    let { selectedItem } = this.state;

    if (selectedItem.indexOf(item) === -1) {
      selectedItem = [...selectedItem, item];
    }

    this.setState({
      inputValue: '',
      selectedItem,
    });
  };

  handleDelete = item => () => {
    this.setState(state => {
      const selectedItem = [...state.selectedItem];
      selectedItem.splice(selectedItem.indexOf(item), 1);
      return { selectedItem };
    });
  };

  onBlur = e => {
    let inputValue = e.target.value.trim();
    if (inputValue) {
      let value = {
        name: inputValue,
        address: inputValue,
        isValid: true
      }
      this.handleAdd(value);
    }
  }

  render() {
    const { classes } = this.props;
    const { inputValue, selectedItem } = this.state;

    return (
      <Downshift
        inputValue={inputValue}
        onChange={this.handleAdd}
        selectedItem={selectedItem}
        itemToString={this.itemToString}
      >
        {({
          getInputProps,
          getItemProps,
          isOpen,
          inputValue: inputValue2,
          selectedItem: selectedItem2,
          highlightedIndex,
        }) => (
            <div className={classes.container}>
              {renderInput({
                fullWidth: true,
                classes,
                InputProps: getInputProps({
                  startAdornment: selectedItem.map(item => (
                    <Chip
                      key={item.address}
                      tabIndex={-1}
                      label={item.name}
                      className={classes.chip}
                      onDelete={this.handleDelete(item)}
                      style={{
                        background: !item.isValid && 'red',
                        color: !item.isValid && 'white'
                      }}
                    />
                  )),
                  onChange: this.handleInputChange,
                  onKeyDown: this.handleKeyDown,
                  onKeyUp: this.handleKeyUp,
                  onBlur: this.onBlur
                })
              })}
              {isOpen ? (
                <Paper className={classes.paper} square>
                  {getSuggestions(inputValue2).map((suggestion, index) =>
                    renderSuggestion({
                      suggestion,
                      index,
                      itemProps: getItemProps({
                        item: {
                          name: suggestion.name,
                          address: suggestion.address,
                          isValid: suggestion.isValid,
                          label: `${suggestion.name} - ${suggestion.address}`
                        }
                      }),
                      highlightedIndex,
                      selectedItem: selectedItem2,
                    }),
                  )}
                </Paper>
              ) : null}
            </div>
          )}
      </Downshift>
    );
  }
}

export default withStyles(styles)(IntegrationDownshift)

function IntegrationDownshift(props) {
  const { classes } = props;

  return (
    <div className={classes.root} style={{ padding: '50px' }}>
      <DownshiftMultiple classes={classes} />
    </div>
  );
}


function renderInput(inputProps) {
  const { InputProps, classes, ref, ...other } = inputProps;

  return (
    <TextField
      InputProps={{
        inputRef: ref,
        classes: {
          root: classes.inputRoot,
          input: classes.inputInput,
        },
        ...InputProps,
      }}
      {...other}
    />
  );
}

function renderSuggestion({ suggestion, index, itemProps, highlightedIndex, selectedItem }) {
  const isHighlighted = highlightedIndex === index;
  // const isSelected = (selectedItem || '').indexOf(suggestion.label) > -1;
  return (
    <MenuItem
      {...itemProps}
      selected={isHighlighted}
      key={suggestion.address}
      component="div"
    >
      {`${suggestion.name} - ${suggestion.address}`}
    </MenuItem>
  );
}

function getSuggestions(value) {
  const inputValue = deburr(value.trim()).toLowerCase();
  const inputLength = inputValue.length;
  let count = 0;

  return inputLength === 0
    ? []
    : suggestions.filter(suggestion => {
      const keep =
        count < 5 && suggestion.address.slice(0, inputLength).toLowerCase() === inputValue;

      if (keep) {
        count += 1;
      }

      return keep;
    });
}



