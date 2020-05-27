import React, { useState, useEffect } from 'react';
import { ipcRenderer } from 'electron';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import cx from 'classnames';
import './styles.scss';

const Tools : React.FC = () => {
  const [recording, setRecording] = useState<boolean>(false);

  const stopRecording = () => {
    if(recording) {
      ipcRenderer.send('STOP_RECORDING');
    }
  }

  const openCanvas = () => {
    if(recording) {
      ipcRenderer.send('OPEN_CANVAS');
    }
  };

  useEffect(() => {
    ipcRenderer.on('START_RECORDING', () => {
      setRecording(true);
    });

    ipcRenderer.on('STOP_RECORDING', () => {
      setRecording(false);
    });

    return () => {
      ipcRenderer.removeAllListeners('START_RECORDING');
      ipcRenderer.removeAllListeners('STOP_RECORDING');
    }
  }, []);

  return (
    <div className="tools-view">
      <div className="stop">
        <div
          onClick={stopRecording}
          className={cx('stop-button is-danger', { recording })}>
        </div>
      </div>
      <div className="brush">
        <div
          onClick={openCanvas}
          className={cx({ recording })}>
          <FontAwesomeIcon icon="paint-brush" />
        </div>
      </div>
    </div>
  );
};

export default Tools;
