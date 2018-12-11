import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

class DateInput extends React.Component {
  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
  }
  onClick(e) {
    this.props.onValueChange(e.target.value);
  }
  render () {
    return (
      <button
        className="date-picker-button"
        onClick={this.props.onClick}>
        {this.props.value}&nbsp;<FontAwesomeIcon icon="caret-down" />
      </button>
    )
  }
}

export default DateInput;
