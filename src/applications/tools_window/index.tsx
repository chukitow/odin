import React, { useState, useEffect } from 'react';
import { ipcRenderer } from 'electron';
import cx from 'classnames';
import './styles.scss';

const ToolsWindow : React.FC = () => {
  const [recording, setRecording] = useState<boolean>(false);

  const stopRecording = () => {
    ipcRenderer.send('STOP_RECORDING');
  }

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
    </div>
  );
};

export default ToolsWindow;
