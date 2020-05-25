import React, { useEffect } from 'react';
import { remote } from 'electron';
import cameraImage from '@app/assets/images/camera.png';

interface Props {
  next: () => void,
};

const Camera : React.FC<Props> = ({
  next
}) => {
  useEffect(() => {
    remote.systemPreferences.askForMediaAccess('camera')
  }, []);

  return (
    <div className="features-step">
      <img src={cameraImage} alt="features" />
      <h3 className="content">Allow the app to access the microphone</h3>
      <button
        onClick={next}
        className="button is-danger is-medium action-button">
        Next
        </button>
    </div>
  );
}

export default Camera;
