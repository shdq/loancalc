import React from 'react';

import { RadioGroup, Radio } from 'react-radio-group'
import OutputEntity from './OutputEntity';
import InputRange from './InputRange';
import GeneratePdfButton from './GeneratePdfButton';

import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from "pdfmake/build/vfs_fonts";
import moment from 'moment';
import 'moment/locale/ru';

// correct fonts import for pdfmake
pdfMake.vfs = pdfFonts.pdfMake.vfs;

const element = document.getElementsByClassName('key-interest-rate__value');
let keyInterestRate = element[0].dataset.value;
if(isNaN(keyInterestRate)) {
  keyInterestRate = 8;
  console.error('Key interest rate is not a number');
}

class Calculator extends React.Component {
  constructor(props) {
    super(props);
    this.Calculate = this.Calculate.bind(this);
    this.handleSumChange = this.handleSumChange.bind(this);
    this.handleTermChange = this.handleTermChange.bind(this);
    this.handleGraceChange = this.handleGraceChange.bind(this);
    this.handleRadioChange = this.handleRadioChange.bind(this);
    this.generatePdf = this.generatePdf.bind(this);
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
      startDate: moment(),
      outputData: {
        monthlyPayment: 15495.76,
        gracePeriod: 0,
        // gracePayment: 3020.83,
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

  generatePdf() {
    const startDate = this.state.startDate.format('L');
    
    const date = this.state.startDate.clone();
    let monthlyRate = this.state.interestRate / 100 / 12;
    let remainLoan = this.state.loanSum.value;

    const roundHelper = number => Math.round(number * 100) / 100;

    const rows = [];

    let interestPayments = 0;
    let debtPayments = 0;
    let gracePeriod = this.state.gracePeriod.value;

    for (let i = 1; i <= this.state.loanTerm.value; i++) {
      const paymentDate = date.add(1, 'month').clone();
      switch (paymentDate.day()) {
        case 6:
          paymentDate.add(2, 'days');
          break;
        case 0:
          paymentDate.add(1, 'day');
          break;
        default:
          break;
      }

      const monthlyInterest = remainLoan * monthlyRate;
      interestPayments += monthlyInterest;

      if(gracePeriod > 0) {
        const row = [i, paymentDate.format('L'), roundHelper(remainLoan), roundHelper(monthlyInterest), roundHelper(monthlyInterest), '-'];
        rows.push(row);

        gracePeriod--;
        continue;
      }

      let monthlyDebtPayment = this.state.outputData.monthlyPayment - monthlyInterest;
      debtPayments += monthlyDebtPayment;
      
      const row = [i, paymentDate.format('L'), roundHelper(remainLoan), this.state.outputData.monthlyPayment, roundHelper(monthlyInterest), roundHelper(monthlyDebtPayment)];
      remainLoan -= monthlyDebtPayment;
      rows.push(row);
    }


    let docDefinition = { 
          // a string or { width: number, height: number }
      pageSize: 'A4',
      // by default we use portrait, you can change it to landscape if you wish
      pageOrientation: 'landscape',
      content:
      [
        {
          text: `График возврата займа от ${startDate}\n\n`, fontSize: 18, color: "#0a6586"
        },
        { text: 'Условия микрозайма:', bold: true },
        { text: `Сумма займа: ${this.state.loanSum.value} руб.`},
        { text: `Срок займа: ${this.state.loanTerm.value} мес.`},
        { text: `Льготный период: ${this.state.gracePeriod.value} мес.`},
        { text: `Годовая ставка: ${this.state.selectedValue}%\n\n`},
        {
          table: {
            // headers are automatically repeated if the table spans over multiple pages
            // you can declare how many rows should be treated as headers
            headerRows: 2,
            widths: [30, 'auto', 'auto', 'auto', 'auto', 'auto'],
    
            body: [
              [
                {rowSpan: 2, text: '№', alignment: 'center', bold: true},
                {rowSpan: 2, text: 'Дата', alignment: 'center', bold: true},
                {rowSpan: 2, text: 'Остаток долга на начало месяца, руб.', alignment: 'center', bold: true},
                {rowSpan: 2, text: 'Ежемесячная срочная уплата, руб.', alignment: 'center', bold: true},
                {text: 'В том числе:', colSpan: 2, alignment: 'center', bold: true},
                {}
              ],
              [
                {},
                {},
                {},
                {},
                {text: 'На выплату процентов, руб.', alignment: 'center', bold: true},
                {text: 'На погашение долга, руб.', alignment: 'center', bold: true},
              ],
              ...rows,
              [{text: 'Итого', colSpan: 2, bold: true},{},'–',{text: roundHelper(this.state.outputData.monthlyPayment * this.state.loanTerm.value), alignment: 'right', bold: true}, {text: roundHelper(interestPayments), alignment: 'right', bold: true}, {text: roundHelper(debtPayments), alignment: 'right', bold: true}],
            ]
          }
        }
      ]
    };
    pdfMake.createPdf(docDefinition).open();//download(`График-платежей-с-${date}.pdf`)
  }

  Calculate(interest, sum, term, grace) {
    const monthlyInterest = interest/100/12;
    let monthlyPayment = this.state.outputData.monthlyPayment;
    let gracePayment = this.state.outputData.gracePayment;
    if(grace>0) {
      const graceDepreciation =
      monthlyInterest / (1 - Math.pow((1 + monthlyInterest), -1));
      gracePayment = (sum * graceDepreciation - sum).toFixed(2);
      term = term - grace;
      const depreciation =
      monthlyInterest / (1 - Math.pow((1 + monthlyInterest), (term - (term * 2))));
      monthlyPayment = (sum * depreciation).toFixed(2);
    } else {
      gracePayment = grace;
      const depreciation =
      monthlyInterest / (1 - Math.pow((1 + monthlyInterest), (term - (term * 2))));
      monthlyPayment = (sum * depreciation).toFixed(2);
    }
    let requirements = 'Поручительства физических или юридических лиц';
    if(sum > 500000) {
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
              value={Number(this.state.outputData.gracePayment).toLocaleString('ru-RU')}
              unit="&#8381;" // Ruble symbol
            />
        }
    return (
      <div className="calculator">
        <div className="input-group">
          <InputRange field={loanSum}
            onValueChange={this.handleSumChange}
            unit="&#8381;" // Ruble symbol
            step="50000"
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
            value={Number(this.state.interestRate).toLocaleString('ru-RU')}
            unit="%"
          />
          <OutputEntity
            title="Максимальный срок"
            value={this.state.loanTerm.maxValue}
            unit="мес."
          />
          <OutputEntity
            title="Ежемесячный платеж"
            value={Number(this.state.outputData.monthlyPayment).toLocaleString('ru-RU')}
            unit="&#8381;" // Ruble symbol
          />
          {gracePeriodLabel}
          <OutputEntity
            title="Требования к заемщику"
            value={this.state.outputData.requirements}
          />
          <GeneratePdfButton onClick={this.generatePdf} />
        </div>
      </div>
    )
  }
}

export default Calculator;