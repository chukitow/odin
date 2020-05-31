import { useRef } from 'react';
import { desktopCapturer, ipcRenderer, remote } from 'electron';
import { isEmpty } from 'lodash';
import apreture from 'aperture';
import log from 'electron-log';

interface DeviceSelcted {
  microphone: string,
  camera: string,
  mode: string,
};

const useRecorder = (props: DeviceSelcted) => {
  const recorder = useRef(null);
  const startRecording = async (params : ScreenPoint) => {
    try {
      recorder.current = apreture();
      const sources = await desktopCapturer.getSources({ types: ['screen'] });
      const { x, y } = remote.getCurrentWindow().getBounds();
      const activeDisplay = remote.screen.getDisplayNearestPoint({ x, y });
      const screen = sources.find(source => String(source.display_id) == String(activeDisplay.id));
      let cropOptions = {};

      if(!isEmpty(params)) {
        cropOptions = {
          cropArea: {
            ...params,
            y: activeDisplay.bounds.height - (params.y + params.height)
          }
        };
      }

      await recorder.current.startRecording({
        ...cropOptions,
        audioDeviceId: props.microphone == 'none' ? undefined : props.microphone,
        screenId: Number(screen.display_id)
      });
      ipcRenderer.send('DID_START_RECORDING');
    }
    catch(e) {
      ipcRenderer.send('ERROR_RECORDING');
      alert('There was an error proccesing the recording');
      log.warn(e);
    }
  }

  const stopRecording = async () => {
    const filePath = await recorder.current.stopRecording();
    ipcRenderer.send('DISPLAY_PREVIEW', { filePath });
  }

  return [startRecording, stopRecording] as const;
}

export default useRecorder;
