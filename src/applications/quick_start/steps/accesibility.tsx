import React, { useEffect } from 'react';
import { desktopCapturer } from 'electron';
import { head } from 'lodash';
import accesibilityImage from '@app/assets/images/accesibility.gif';
import log from 'electron-log';

interface Props {
  next: () => void,
};

const Accesibility: React.FC<Props> = ({
  next
}) => {
  const askPermissions = async () => {
    try {
      const sources = await desktopCapturer.getSources({ types: ['screen'] });
      const screen = head(sources);
      const constrains : any = {
        audio: false,
        video: {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: screen.id
          }
        }
      };

      await window.navigator.mediaDevices.getUserMedia(constrains);
    } catch(err) {
      log.warn(err.message);
    }
  }
  useEffect(() => {
    askPermissions();
  }, [])

  return (
    <div className="features-step">
      <img src={accesibilityImage} alt="features" />
      <h3 className="content">Grant Screen Recording permissions</h3>
      <button
        onClick={next}
        className="button is-danger is-medium action-button">
        Start
        </button>
    </div>
  );
}

export default Accesibility;
