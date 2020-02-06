import React from "react";
import ReactDOM from "react-dom";

/* Baseweb design system */
import { Provider as StyletronProvider } from "styletron-react";
import { Client as Styletron } from "styletron-engine-atomic";

import Calculator from "./components/Calculator.jsx";
import "./index.css";

import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faFilePdf,
  faQuestionCircle,
  faCaretDown
} from "@fortawesome/free-solid-svg-icons";

library.add(faFilePdf, faQuestionCircle, faCaretDown);

const engine = new Styletron();

ReactDOM.render(
  <StyletronProvider value={engine}>
    <Calculator />
  </StyletronProvider>,
  document.getElementById("root")
);
