import React from 'react';
import ReactDOM from 'react-dom';
import {RadioGroup, Radio} from 'react-radio-group'
import FontAwesome  from 'react-fontawesome';
import './font-awesome-4.7.0/css/font-awesome.min.css';
import './index.css';

const element = document.getElementsByClassName('key-interest-rate__value');
let keyInterestRate = element[0].dataset.value;
if(isNaN(keyInterestRate)) {
  keyInterestRate = 8;
  console.error('Key interest rate is not a number');
}

class InputRange extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }
  handleChange(e) {
    this.props.onValueChange(e.target.value);
  }
  render () {
    let tooltip = null;
    if(this.props.tooltip) {
      tooltip = <span className="tooltip" data-tooltip={this.props.tooltip}>
        &nbsp;<FontAwesome name="question-circle-o" />
      </span>;
    }
    return(
      <div className="input-field">
        <p className="input-field__description">{this.props.desc}{tooltip}&nbsp;
          <span className="input-field__range-value">
            {this.props.field.value} {this.props.unit}
          </span>
        </p>
        <input className="input-field__range"
          type="range"
          min={this.props.field.minValue}
          max={this.props.field.maxValue}
          step={this.props.step}
          value={this.props.field.value}
          onChange={this.handleChange}
        />
        <p className="input-field__label">
          <span className="input-field__label-value input-field__label-value_min">
            {this.props.field.minValue}</span>
          <span className="input-field__label-value input-field__label-value_max">
            {this.props.field.maxValue}</span>
        </p>
      </div>
    )
  }
}

// class InterestRateInput extends React.Component {
//   constructor(props) {
//     super(props);
//     this.handleChange = this.handleChange.bind(this);
//   }
//   handleChange(e) {
//     this.props.onValueChange(e.target.checked);
//   }
//   render () {
//     return(
//       <div className="interest-rate">
//           <input className="interest-rate__checkbox"
//             type="checkbox"
//             id="interestRate"
//             name="lowerInterestRate"
//             onChange={this.handleChange}
//           />
//           <label className="interest-rate__label" htmlFor="interestRate">
//             Льготная ставка&nbsp;
//               <span className="tooltip" data-tooltip="Для программ с сниженной процентной ставкой">
//                 <FontAwesome name="question-circle-o" />
//               </span>
//           </label>
//
//       </div>
//     )
//   }
// }

class InterestRateRadio extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }
  handleChange(e) {
    // this.props.onValueChange(e.target.value);
  }
  render() {
    return (
      <span className="interest-rate">
       <input className="interest-rate__checkbox"
         type="radio"
         // id="InterestRateRadio"
         name="interestRate"
         defaultChecked
         // onChange={this.handleChange}
         value={this.props.value}
       />
       <label className="interest-rate__label" htmlFor="InterestRateRadio">
         {this.props.label}&nbsp;
           <span className="tooltip" data-tooltip={this.props.tooltip}>
             <FontAwesome name="question-circle-o" />
           </span>
       </label>
     </span>
    )
  }
}

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

class Calculator extends React.Component {
  constructor(props) {
    super(props);
    this.Calculate = this.Calculate.bind(this);
    this.handleSumChange = this.handleSumChange.bind(this);
    this.handleTermChange = this.handleTermChange.bind(this);
    this.handleGraceChange = this.handleGraceChange.bind(this);
    // this.handleInterestRateInputChange = this.handleInterestRateInputChange.bind(this);
    this.handleRadioChange = this.handleRadioChange.bind(this);
    this.state = {
      loanSum: {
        value: 500000,
        minValue: 100000,
        maxValue: 3000000,
      },
      loanTerm: {
        value: 36,
        minValue: 3,
        maxValue: 36,
      },
      gracePeriod: {
        value: 0,
        minValue: 0,
        maxValue: 35,
      },
      interestRate: keyInterestRate,
      selectedValue: '0', // default reduction factor
      outputData: {
        monthlyPayment: 15899.87,
        gracePeriod: 0,
        gracePayment: 3750,
        requirements: 'Поручительства физических или юридических лиц'
      }
    }
  }

  handleSumChange(loanSum) {
    this.setState({
      loanSum: {
        value: loanSum,
        minValue: 100000,
        maxValue: 3000000,
      },
    });
    this.Calculate(this.state.interestRate, loanSum, this.state.loanTerm.value,
      this.state.gracePeriod.value);
  }

  handleTermChange(loanTerm) {
    const graceMaxValue = loanTerm - 1;//(loanTerm - (loanTerm % 2)) / 2;
    const graceValue = (this.state.gracePeriod.value<graceMaxValue) ? this.state.gracePeriod.value : graceMaxValue;

    this.setState({
      loanTerm: {
        value: loanTerm,
        minValue: 3,
        maxValue: this.state.loanTerm.maxValue,
      },
      gracePeriod: {
        value: graceValue,
        minValue: 0,
        maxValue: graceMaxValue,
      }
    });
    this.Calculate(this.state.interestRate, this.state.loanSum.value, loanTerm,
      graceValue);
  }

  handleGraceChange(gracePeriod) {
    this.setState({
      gracePeriod: {
        value: gracePeriod,
        minValue: 0,
        maxValue: this.state.gracePeriod.maxValue,
      }
    });
    this.Calculate(this.state.interestRate, this.state.loanSum.value,
      this.state.loanTerm.value, gracePeriod);
  }

  handleRadioChange(value) {
    let interestRate = keyInterestRate - value;
    let loanTerm = this.state.loanTerm.value;
    let maxLoanTerm = 36;
    let graceMaxValue = loanTerm - 1;
    let graceValue = (this.state.gracePeriod.value < graceMaxValue) ? this.state.gracePeriod.value : graceMaxValue;
    if(value==="s+") {
      interestRate = keyInterestRate - 0.5;
      maxLoanTerm = 12;
      if(loanTerm > 12) {
        loanTerm = 12;
        if(graceValue > 11){
            graceValue = 11;
        }
      }
      graceMaxValue = loanTerm - 1;
    }
    this.setState({
        selectedValue: value,
        interestRate: interestRate,
        loanTerm: {
          value: loanTerm,
          minValue: 3,
          maxValue: maxLoanTerm,
        },
        gracePeriod: {
          value: graceValue,
          minValue: 0,
          maxValue: graceMaxValue,
        }
      });
    this.Calculate(interestRate, this.state.loanSum.value, loanTerm,
        graceValue);
  }

  /*handleInterestRateInputChange(lowerInterestRate) {
    let interest = null;
    if(lowerInterestRate) {
      interest = 7;
      this.setState({
        interestRate: 7,
      });
    } else {
      interest = 9;
      this.setState({
        interestRate: 9,
      });
    }
    this.Calculate(interest, this.state.loanSum.value,
      this.state.loanTerm.value, this.state.gracePeriod.value);
  }*/

  Calculate(interest, sum, term, grace) {
    const monthlyInterest = interest/100/12;
    let monthlyPayment = this.state.outputData.monthlyPayment;
    let gracePayment = this.state.outputData.gracePayment;
    if(grace>0) {
      const graceDepreciation =
      monthlyInterest/(1-Math.pow((1+monthlyInterest),-1));
      gracePayment = (sum*graceDepreciation-sum).toFixed(2);
      term = term - grace;
      const depreciation =
      monthlyInterest/(1-Math.pow((1+monthlyInterest),(term-(term*2))));
      monthlyPayment = (sum*depreciation).toFixed(2);
    } else {
      gracePayment = grace;
      const depreciation =
      monthlyInterest/(1-Math.pow((1+monthlyInterest),(term-(term*2))));
      monthlyPayment = (sum*depreciation).toFixed(2);
    }
    let requirements = 'Поручительства физических или юридических лиц';
    if(sum>500000) {
      requirements = 'Залоговое имущество, поручительства физических или юридических лиц';
    }
    this.setState({
      outputData: {
        monthlyPayment: monthlyPayment,
        gracePeriod: grace,
        gracePayment: gracePayment,
        requirements: requirements,
      }
    });
  }

  render () {
    const loanSum = this.state.loanSum;
    const loanTerm = this.state.loanTerm;
    const gracePeriod = this.state.gracePeriod;
    let gracePeriodLabel = null;

    if(this.state.gracePeriod.value>0) {
          gracePeriodLabel =
            <OutputEntity
              title="Платеж в льготный период"
              value={this.state.outputData.gracePayment}
              unit="руб."
            />
        }
    return (
      <div className="calculator">
        <div className="input-group">
          <InputRange field={loanSum}
            onValueChange={this.handleSumChange}
            unit="руб."
            step="100000"
            desc="Сумма займа"
          />
          <InputRange
            field={loanTerm}
            onValueChange={this.handleTermChange}
            unit="мес."
            step="1"
            desc="Срок займа"
          />
          <InputRange
            field={gracePeriod}
            onValueChange={this.handleGraceChange}
            unit="мес."
            step="1"
            desc="Льготный период"
            tooltip="Период, в котором уплачиваются только проценты."
          />
          {/*<InterestRateInput
            lowerInterestRate="false"
            onValueChange={this.handleInterestRateInputChange}
          />*/}
          <div className="input-field">
          <p className="input-field__description">Программы фонда для разных категорий предпринимателей:</p>
          <RadioGroup className="interest-rate-radio"
            name="interestRateRadio"
            selectedValue={this.state.selectedValue}
            onChange={this.handleRadioChange}>
            <label className="interest-rate-radio__label">
              <Radio className="interest-rate-radio__input" checked={this.state.selectedValue === '0'} value="0" />«Стандарт»
              <span className="interest-rate-radio__checkmark"></span>
            </label>
            <label className="interest-rate-radio__label">
              <Radio className="interest-rate-radio__input" checked={this.state.selectedValue === '0.5'} value="0.5" />«Сельхозпроизводитель»
              <span className="interest-rate-radio__checkmark"></span>
            </label>
            <label className="interest-rate-radio__label">
              <Radio className="interest-rate-radio__input" checked={this.state.selectedValue === '0.25'} value="0.25" />«Арктика», «Лизинг», «Местный товаропроизводитель», «Моногород», «Сельский туризм»
              <span className="interest-rate-radio__checkmark"></span>
            </label>
            <label className="interest-rate-radio__label">
              <Radio className="interest-rate-radio__input" checked={this.state.selectedValue === 's+'} value="s+" />«Startup+»
              <span className="interest-rate-radio__checkmark"></span>
            </label>
          </RadioGroup>
          </div>
        </div>
        <div className="output-group">
          <OutputEntity
            title="Годовая ставка"
            value={this.state.interestRate}
            unit="%"
          />
          <OutputEntity
            title="Максимальный срок"
            value={this.state.loanTerm.maxValue}
            unit="мес."
          />
          <OutputEntity
            title="Ежемесячный платеж"
            value={this.state.outputData.monthlyPayment}
            unit="руб."
          />
          {gracePeriodLabel}
          <OutputEntity
            title="Требования к заемщику"
            value={this.state.outputData.requirements}
          />
        </div>
      </div>

    )
  }
}

// ========================================

ReactDOM.render(
  <Calculator />,
  document.getElementById('root')
);
