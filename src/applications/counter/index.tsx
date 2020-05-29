import React, { useState } from 'react';
import { ipcRenderer } from 'electron';
import useInterval from './useInterval';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import './styles.scss';

const Counter : React.FC = () => {
  const [count, setCount] = useState<number>(3);

  useInterval(() => {
    const time = count - 1
    if(time == 0) {
      ipcRenderer.send('STOP_COUNTER');
    }

    setCount(count - 1);
  });

  return (
    <div className="counter-window">
      <div className="counter">
        {
          count <= 0 &&
          <FontAwesomeIcon icon="spinner" size="1x" spin/>
        }
        {
          count > 0 && count
        }
      </div>
    </div>
  );
};

export default Counter;
