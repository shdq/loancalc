import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const GeneratePdfButton = props => {
  return (
    <button className="download-button" onClick={props.onClick}>
      Сформировать PDF&nbsp;<FontAwesomeIcon icon="file-pdf" />
    </button>
  );
}

export default GeneratePdfButton;
