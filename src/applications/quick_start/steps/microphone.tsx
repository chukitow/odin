import React, { useEffect } from 'react';
import { remote } from 'electron';
import microphoneImage from '@app/assets/images/microphone.png';

interface Props {
  next: () => void,
};

const Microphone : React.FC<Props> = ({
  next
}) => {
  useEffect(() => {
    remote.systemPreferences.askForMediaAccess('microphone');
  }, [])

  return (
    <div className="features-step">
      <img src={microphoneImage} alt="features" />
      <h3 className="content">Allow the app to access the microphone</h3>
      <button
        onClick={next}
        className="button is-danger is-medium action-button">
        Next
        </button>
    </div>
  );
}

export default Microphone;
