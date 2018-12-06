import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const GeneratePdfButton = props => {
  return (
    <button className="download-button" onClick={props.onClick}>
      <FontAwesomeIcon icon="file-pdf" />&nbsp;Сформировать график
    </button>
  );
}

export default GeneratePdfButton;