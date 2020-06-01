import { useRef } from 'react';
import { CAM } from '@app/applications/main';
import { desktopCapturer, ipcRenderer, remote, shell } from 'electron';
import { writeFile } from 'fs';
import log from 'electron-log';
import tempy from 'tempy';
import path from 'path';
import { get, head } from 'lodash';
import Screenshot from 'screenshot-desktop';

interface DeviceSelcted {
  microphone: string,
  camera: string,
  mode: string,
};

const useRecorder = (props: DeviceSelcted) => {
  const mediaRecorder = useRef(null);
  let recorderdChunks = [];

  const getStream = async () => {
    const sources = await desktopCapturer.getSources({ types: ['screen'] });
    const { x, y } = remote.getCurrentWindow().getBounds();
    const activeDisplay = remote.screen.getDisplayNearestPoint({ x, y });
    const screen = sources.find(source => String(source.display_id) == String(activeDisplay.id));
    const audioOptions = props.microphone === 'none' ? { audio: false } : { audio: { deviceId: { exact: props.microphone } } };

    const constrains : any = {
      audio: false,
      video: {
        ...videoOptions({ ...props, screen_id: screen.id}),
      }
    };

    const videoStream = await window.navigator.mediaDevices.getUserMedia(constrains);
    if(audioOptions.audio != false) {
      const audioStream = await window.navigator.mediaDevices.getUserMedia({ video: false, ...audioOptions});
      let tracks = audioStream.getAudioTracks();
      for(const track of tracks) {
        videoStream.addTrack(track);
      }
    }

    return videoStream;
  }

  const startRecording = async () => {
    try {
      const videoStream = await getStream();
      mediaRecorder.current = new window.MediaRecorder(videoStream);
      mediaRecorder.current.ondataavailable = (e : any) => {
        recorderdChunks.push(e.data);
      }

      mediaRecorder.current.start();
      mediaRecorder.current.onstop = async () => {
        log.info('creating file');
        const blob = new Blob(recorderdChunks, {
          type: 'video/webm'
        })

        recorderdChunks = [];
        mediaRecorder.current = null;
        videoStream.getTracks().forEach(track => {
          track.stop();
        });

        const buffer = Buffer.from(await blob.arrayBuffer());
        const filePath = path.join(tempy.directory(), `Screen-Recording-${Date.now()}.webm`);
        writeFile(filePath, buffer, (err) => {
          if(err) {
            alert('There was an error proccesing the recording');
            return;
          }

          ipcRenderer.send('DISPLAY_PREVIEW', { filePath });
        });
      }
    }
    catch(e) {
      ipcRenderer.send('ERROR_RECORDING');
      alert('There was an error proccesing the recording');
      log.warn(e);
    }
  }

  const stopRecording = async () => {
    mediaRecorder.current.stop();
  }

  const takeScreenshot = async (data) => {
    try {
      const filePath = path.join(tempy.directory(), `Screenshot-${Date.now()}.png`);
      const displays = await Screenshot.listDisplays();
      const { x, y } = remote.getCurrentWindow().getBounds();
      const activeDisplay = remote.screen.getDisplayNearestPoint({ x, y });
      const screen = displays.find(display => String(display.id) == String(activeDisplay.id));
      const bufferImage = await Screenshot({
        format: 'png',
        screen: get(screen, 'id', '') || get(head(displays), 'id')
      });
      const tmpImagePath : string = await new Promise((resolve, reject) => {
        writeFile(filePath, bufferImage, (err) => {
          if(err) {
            reject(err);
          }
          else {
            resolve(filePath);
          }
        });
      });

      ipcRenderer.send('OPEN_IMAGE_EDITOR', { path: tmpImagePath, ...data });
    } catch(err) {
      log.warn(err.message);
    }
  }

  return [startRecording, stopRecording, takeScreenshot] as const;
}

interface VideoSelection {
  mode: string,
  camera: string,
  screen_id: string
};

function videoOptions({ camera, mode, screen_id } : VideoSelection) {
  if(mode == CAM) {
    //TODO: Get camera with the best resolution
    return {
      deviceId: {
        exact: camera
      },
    };
  }
  else {
    return {
      mandatory: {
        chromeMediaSource: 'desktop',
        chromeMediaSourceId: screen_id
      }
    };
  }
}


export default useRecorder;
