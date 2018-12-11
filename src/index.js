import React from 'react';
import ReactDOM from 'react-dom';

import Calculator from './components/Calculator.jsx';
import './index.css';

import { library } from '@fortawesome/fontawesome-svg-core';
import { faFilePdf, faQuestionCircle, faCaretDown } from '@fortawesome/free-solid-svg-icons';

library.add(faFilePdf, faQuestionCircle, faCaretDown);

ReactDOM.render(<Calculator />, document.getElementById('root'));
