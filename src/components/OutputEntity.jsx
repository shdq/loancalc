import React from 'react';

const OutputEntity = props => {
    return(
      <div className="output-field">
        <p className="output-field__description">{props.title}:&nbsp;
          <span className="output-field__value">{props.value} {props.unit}</span>
        </p>
      </div>
    )
}

export default OutputEntity;