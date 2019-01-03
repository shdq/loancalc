import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

class InputRange extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }
  handleChange(e) {
    this.props.onValueChange(e.target.value);
  }
  render() {
    let tooltip = null;
    if (this.props.tooltip) {
      tooltip = (
        <span className="tooltip" data-tooltip={this.props.tooltip}>
          &nbsp;
          <FontAwesomeIcon icon="question-circle" />
        </span>
      );
    }
    let value = Number(this.props.field.value).toLocaleString("ru-RU");
    return (
      <div className="input-field">
        <p className="input-field__description">
          {this.props.desc}
          {tooltip}&nbsp;
          <span className="input-field__range-value">
            {value} {this.props.unit}
          </span>
        </p>
        <input
          className="input-field__range"
          type="range"
          min={this.props.field.minValue}
          max={this.props.field.maxValue}
          step={this.props.step}
          value={this.props.field.value}
          onChange={this.handleChange}
        />
        <p className="input-field__label">
          <span className="input-field__label-value input-field__label-value_min">
            {this.props.field.minValue.toLocaleString("ru-RU")}
          </span>
          <span className="input-field__label-value input-field__label-value_max">
            {this.props.field.maxValue.toLocaleString("ru-RU")}
          </span>
        </p>
      </div>
    );
  }
}

export default InputRange;
