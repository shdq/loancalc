import React from "react";

import { RadioGroup, Radio } from "react-radio-group";
import OutputEntity from "./OutputEntity";
import InputRange from "./InputRange";
import GeneratePdfButton from "./GeneratePdfButton";
import DateInput from "./DateInput";

import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import moment from "moment";
import "moment/locale/ru";

import DatePicker, { registerLocale, setDefaultLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.min.css";
import { ru } from "date-fns/esm/locale";
registerLocale("ru", ru);
setDefaultLocale("ru");

// correct fonts import for pdfmake
pdfMake.vfs = pdfFonts.pdfMake.vfs;

// const element = document.getElementsByClassName("key-interest-rate__value");
// let keyInterestRate = element[0].dataset.value;
// if (isNaN(keyInterestRate)) {
//   keyInterestRate = 8;
//   console.error("Key interest rate is not a number");
// }

const keyInterestRate = 6;

class Calculator extends React.Component {
  constructor(props) {
    super(props);

    this.Calculate = this.Calculate.bind(this);
    this.handleSumChange = this.handleSumChange.bind(this);
    this.handleTermChange = this.handleTermChange.bind(this);
    this.handleGraceChange = this.handleGraceChange.bind(this);
    this.handleRadioChange = this.handleRadioChange.bind(this);
    this.handleDateChange = this.handleDateChange.bind(this);
    this.generatePdf = this.generatePdf.bind(this);
    this.roundHelper = this.roundHelper.bind(this);
    this.fillRows = this.fillRows.bind(this);
    this.constructRow = this.constructRow.bind(this);

    this.state = {
      loanSum: {
        value: 500000,
        minValue: 50000,
        maxValue: 5000000,
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
      selectedValue: "0", // default reduction factor
      startDate: moment(),
      outputData: {
        monthlyPayment: 15553.11,
        gracePeriod: 0,
        // gracePayment: 3020.83,
        requirements: "Поручительства физических или юридических лиц",
      },
    };
  }

  handleSumChange(loanSum) {
    this.setState({
      loanSum: {
        value: loanSum,
        minValue: this.state.selectedValue === "express" ? 30000 : 50000,
        maxValue: this.state.selectedValue === "express" ? 100000 : 5000000,
      },
    });
    this.Calculate(
      this.state.interestRate,
      loanSum,
      this.state.loanTerm.value,
      this.state.gracePeriod.value
    );
  }

  handleTermChange(loanTerm) {
    let graceMaxValue;
    this.state.selectedValue === "express"
      ? (graceMaxValue = 0)
      : (graceMaxValue = loanTerm - 1);
    const graceValue =
      this.state.gracePeriod.value < graceMaxValue
        ? this.state.gracePeriod.value
        : graceMaxValue;

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
      },
    });
    this.Calculate(
      this.state.interestRate,
      this.state.loanSum.value,
      loanTerm,
      graceValue
    );
  }

  handleGraceChange(gracePeriod) {
    this.setState({
      gracePeriod: {
        value: gracePeriod,
        minValue: 0,
        maxValue: this.state.gracePeriod.maxValue,
      },
    });
    this.Calculate(
      this.state.interestRate,
      this.state.loanSum.value,
      this.state.loanTerm.value,
      gracePeriod
    );
  }

  handleRadioChange(value) {
    let minLoanSum;
    value === "express" ? (minLoanSum = 30000) : (minLoanSum = 50000);
    let maxLoanSum;
    value === "express" ? (maxLoanSum = 100000) : (maxLoanSum = 5000000);
    let loanSum = this.state.loanSum.value;
    if (loanSum < minLoanSum) loanSum = minLoanSum;
    if (value !== "express" && loanSum < minLoanSum + 50000)
      loanSum = minLoanSum;
    let interestRate = keyInterestRate - value;
    let loanTerm = this.state.loanTerm.value;
    let maxLoanTerm = 36;
    let graceMaxValue = loanTerm - 1;
    let graceValue =
      this.state.gracePeriod.value < graceMaxValue
        ? this.state.gracePeriod.value
        : graceMaxValue;
    if (value === "s+") {
      interestRate = keyInterestRate - 0.5;
      maxLoanTerm = 12;
      if (loanTerm > 12) {
        loanTerm = 12;
        if (graceValue > 11) {
          graceValue = 11;
        }
      }
      graceMaxValue = loanTerm - 1;
    }
    if (value === "express") {
      interestRate = keyInterestRate;
      maxLoanTerm = 12;
      graceMaxValue = 0;
      graceValue = 0;
      if (loanTerm > 12) {
        loanTerm = 12;
        if (graceValue > 0) {
          graceValue = 0;
        }
      }
      if (loanSum > maxLoanSum) loanSum = maxLoanSum;
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
      },
      loanSum: {
        value: loanSum,
        minValue: minLoanSum,
        maxValue: maxLoanSum,
      },
    });
    this.Calculate(interestRate, loanSum, loanTerm, graceValue);
  }

  roundHelper = (number) => Math.round(number * 100) / 100;

  constructRow = (
    number,
    paymentDate,
    loanSum,
    monthlyInterest,
    monthlyPayment,
    monthlyDebtPayment,
    gracePeriod
  ) => {
    return [
      { text: number, alignment: "right" },
      { text: paymentDate.format("MMMM YYYY"), alignment: "left" },
      { text: this.roundHelper(loanSum), alignment: "right" },
      gracePeriod > 0
        ? { text: this.roundHelper(monthlyInterest), alignment: "right" }
        : { text: monthlyPayment, alignment: "right" },
      { text: this.roundHelper(monthlyInterest), alignment: "right" },
      gracePeriod > 0
        ? { text: "–", alignment: "right" }
        : { text: this.roundHelper(monthlyDebtPayment), alignment: "right" },
    ];
  };

  fillRows = (
    loanSum,
    loanTerm,
    gracePeriod,
    monthlyPayment,
    interestRate,
    startDate
  ) => {
    const rows = [];
    const paymentDate = startDate.clone();
    const monthlyRate = interestRate / 100 / 12;

    for (let i = 1; i <= loanTerm; i++) {
      paymentDate.add(1, "month");

      const monthlyInterest = loanSum * monthlyRate;
      const monthlyDebtPayment = monthlyPayment - monthlyInterest;

      const row = this.constructRow(
        i,
        paymentDate,
        loanSum,
        monthlyInterest,
        monthlyPayment,
        monthlyDebtPayment,
        gracePeriod
      );
      rows.push(row);

      if (gracePeriod > 0) {
        gracePeriod--;
        continue;
      }
      loanSum -= monthlyDebtPayment;
    }
    return rows;
  };

  generatePdf() {
    const rows = this.fillRows(
      this.state.loanSum.value,
      this.state.loanTerm.value,
      this.state.gracePeriod.value,
      this.state.outputData.monthlyPayment,
      this.state.interestRate,
      this.state.startDate
    );

    let totalPayments;
    this.state.gracePeriod.value > 0
      ? (totalPayments =
          this.state.gracePeriod.value * this.state.outputData.gracePeriod +
          this.state.outputData.monthlyPayment *
            (this.state.loanTerm.value - this.state.gracePeriod.value))
      : (totalPayments =
          this.state.outputData.monthlyPayment * this.state.loanTerm.value);

    let docDefinition = {
      // a string or { width: number, height: number }
      pageSize: "A4",
      pageOrientation: "landscape",
      content: [
        {
          text: `График возврата займа от ${this.state.startDate.format(
            "D MMMM YYYY"
          )} г. *\n\n`,
          fontSize: 18,
          color: "#0a6586",
        },
        { text: "Условия микрозайма:", bold: true },
        { text: `Сумма займа: ${this.state.loanSum.value} руб.` },
        { text: `Срок займа: ${this.state.loanTerm.value} мес.` },
        {
          text: `${
            this.state.gracePeriod.value > 0
              ? `Льготный период: ${this.state.gracePeriod.value} мес.`
              : ``
          }`,
        },
        {
          text: `Годовая ставка: ${Number(
            this.state.interestRate
          ).toLocaleString("ru-RU")}%\n\n`,
        },
        {
          table: {
            // headers are automatically repeated if the table spans over multiple pages
            // you can declare how many rows should be treated as headers
            headerRows: 2,
            widths: [25, 100, "auto", "auto", "auto", "auto"],

            body: [
              [
                { rowSpan: 2, text: "№", alignment: "right", bold: true },
                {
                  rowSpan: 2,
                  text: "Дата платежа",
                  alignment: "left",
                  bold: true,
                },
                {
                  rowSpan: 2,
                  text: "Остаток долга на начало месяца, руб.",
                  alignment: "right",
                  bold: true,
                },
                {
                  rowSpan: 2,
                  text: "Ежемесячная срочная уплата, руб.",
                  alignment: "right",
                  bold: true,
                },
                {
                  text: "В том числе:",
                  colSpan: 2,
                  alignment: "center",
                  bold: true,
                },
                {},
              ],
              [
                {},
                {},
                {},
                {},
                {
                  text: "На выплату процентов, руб.",
                  alignment: "right",
                  bold: true,
                },
                {
                  text: "На погашение долга, руб.",
                  alignment: "right",
                  bold: true,
                },
              ],
              ...rows,
              [
                { text: "Итого", colSpan: 2, bold: true, alignment: "left" },
                {},
                { text: "–", alignment: "right", bold: true },
                {
                  text: this.roundHelper(totalPayments),
                  alignment: "right",
                  bold: true,
                },
                {
                  text: this.roundHelper(
                    totalPayments - this.state.loanSum.value
                  ),
                  alignment: "right",
                  bold: true,
                },
                {
                  text: this.state.loanSum.value,
                  alignment: "right",
                  bold: true,
                },
              ],
            ],
          },
        },
        {
          text:
            "\n* Не является приложением к договору, расчет предварительный.",
        },
        {
          text: "\n\nhttps://cmf29.ru/kalkulator",
          alignment: "right",
          bold: true,
          color: "#0a6586",
        },
      ],
    };
    pdfMake
      .createPdf(docDefinition)
      .download(`График-платежей-с-${this.state.startDate.format("L")}.pdf`);
  }

  handleDateChange(date) {
    this.setState({
      startDate: moment(date),
    });
  }

  Calculate(interest, sum, term, grace) {
    const monthlyInterest = interest / 100 / 12;
    let monthlyPayment = this.state.outputData.monthlyPayment;
    let gracePayment = this.state.outputData.gracePayment;
    if (grace > 0) {
      const graceDepreciation =
        monthlyInterest / (1 - Math.pow(1 + monthlyInterest, -1));
      gracePayment = (sum * graceDepreciation - sum).toFixed(2);
      term = term - grace;
      const depreciation =
        monthlyInterest / (1 - Math.pow(1 + monthlyInterest, term - term * 2));
      monthlyPayment = (sum * depreciation).toFixed(2);
    } else {
      gracePayment = grace;
      const depreciation =
        monthlyInterest / (1 - Math.pow(1 + monthlyInterest, term - term * 2));
      monthlyPayment = (sum * depreciation).toFixed(2);
    }
    let requirements = "Поручительства физических или юридических лиц";
    if (sum > 500000) {
      requirements =
        "Залоговое имущество, поручительства физических или юридических лиц";
    }
    this.setState({
      outputData: {
        monthlyPayment: monthlyPayment,
        gracePeriod: grace,
        gracePayment: gracePayment,
        requirements: requirements,
      },
    });
  }

  render() {
    const loanSum = this.state.loanSum;
    const loanTerm = this.state.loanTerm;
    const gracePeriod = this.state.gracePeriod;
    let gracePeriodLabel = null;

    if (this.state.gracePeriod.value > 0) {
      gracePeriodLabel = (
        <OutputEntity
          title="Платеж в льготный период"
          value={Number(this.state.outputData.gracePayment).toLocaleString(
            "ru-RU"
          )}
          unit="&#8381;" // Ruble symbol
        />
      );
    }
    return (
      <div className="calculator">
        <div className="input-group">
          <InputRange
            field={loanSum}
            onValueChange={this.handleSumChange}
            unit="&#8381;" // Ruble symbol
            step={this.state.selectedValue === "express" ? "10000" : "50000"}
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
            <p className="input-field__description">
              Программы фонда для разных категорий предпринимателей:
            </p>
            <RadioGroup
              className="interest-rate-radio"
              name="interestRateRadio"
              selectedValue={this.state.selectedValue}
              onChange={this.handleRadioChange}
            >
              <label className="interest-rate-radio__label">
                <Radio
                  className="interest-rate-radio__input"
                  checked={this.state.selectedValue === "0"}
                  value="0"
                />
                «Стандарт», «Рефинансирование»
                <span className="interest-rate-radio__checkmark" />
              </label>
              <label className="interest-rate-radio__label">
                <Radio
                  className="interest-rate-radio__input"
                  checked={this.state.selectedValue === "express"}
                  value="express"
                />
                «Экспресс»
                <span className="interest-rate-radio__checkmark" />
              </label>
              <label className="interest-rate-radio__label">
                <Radio
                  className="interest-rate-radio__input"
                  checked={
                    this.state.selectedValue ===
                    (keyInterestRate / 2).toPrecision(2)
                  }
                  value={(keyInterestRate / 2).toPrecision(3)}
                />
                «Арктика», «Моногород»
                <span className="interest-rate-radio__checkmark" />
              </label>
              <label className="interest-rate-radio__label">
                <Radio
                  className="interest-rate-radio__input"
                  checked={this.state.selectedValue === "0.5"}
                  value="0.5"
                />
                «Сельхозпроизводитель»
                <span className="interest-rate-radio__checkmark" />
              </label>
              <label className="interest-rate-radio__label">
                <Radio
                  className="interest-rate-radio__input"
                  checked={this.state.selectedValue === "1.5"}
                  value="1.5"
                />
                «Рециклинг»
                <span className="interest-rate-radio__checkmark" />
              </label>
              <label className="interest-rate-radio__label">
                <Radio
                  className="interest-rate-radio__input"
                  checked={this.state.selectedValue === "0.25"}
                  value="0.25"
                />
                «Лизинг», «Местный товаропроизводитель», «Туризм»
                <span className="interest-rate-radio__checkmark" />
              </label>
              <label className="interest-rate-radio__label">
                <Radio
                  className="interest-rate-radio__input"
                  checked={this.state.selectedValue === "s+"}
                  value="s+"
                />
                «Startup+»
                <span className="interest-rate-radio__checkmark" />
              </label>
            </RadioGroup>
          </div>
        </div>
        <div className="output-group">
          <OutputEntity
            title="Годовая ставка"
            value={Number(this.state.interestRate).toLocaleString("ru-RU")}
            unit="%"
          />
          <OutputEntity
            title="Максимальный срок"
            value={this.state.loanTerm.maxValue}
            unit="мес."
          />
          <OutputEntity
            title="Ежемесячный платеж"
            value={Number(this.state.outputData.monthlyPayment).toLocaleString(
              "ru-RU"
            )}
            unit="&#8381;" // Ruble symbol
          />
          {gracePeriodLabel}
          <OutputEntity
            title="Требования к заемщику"
            value={this.state.outputData.requirements}
          />
          <div className="output-field">
            <div className="output-field__description">
              График возврата займа от&nbsp;
              <DatePicker
                selected={this.state.startDate._d}
                onChange={this.handleDateChange}
                dateFormat="d MMMM yyyy"
                fixedHeight
                showYearDropdown
                yearDropdownItemNumber={1}
                showYearSelectOnly
                customInput={<DateInput />}
              />
              <GeneratePdfButton onClick={this.generatePdf} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Calculator;
