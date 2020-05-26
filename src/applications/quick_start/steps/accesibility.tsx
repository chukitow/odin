import React, { useEffect } from 'react';
import { desktopCapturer, remote } from 'electron';
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
      remote.getCurrentWindow().setAlwaysOnTop(false);
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
      remote.getCurrentWindow().setAlwaysOnTop(true, 'floating');
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
        Relaunch
        </button>
    </div>
  );
}

export default Accesibility;
