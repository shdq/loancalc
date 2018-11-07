import React from 'react';

class OutputEntity extends React.Component {
  render () {
    return(
      <div className="output-field">
        <p className="output-field__description">{this.props.title}:&nbsp;
          <span className="output-field__value">{this.props.value} {this.props.unit}</span>
        </p>
      </div>
    )
  }
}

export default OutputEntity;