import { useRef } from 'react';
import { CAM } from '@app/applications/main';
import { desktopCapturer, ipcRenderer, remote } from 'electron';
import { writeFile } from 'fs';
import log from 'electron-log';
import tempy from 'tempy';
import path from 'path';

interface DeviceSelcted {
  microphone: string,
  camera: string,
  mode: string,
};

const useRecorder = (props: DeviceSelcted) => {
  const mediaRecorder = useRef(null);
  let recorderdChunks = [];

  const startRecording = async () => {
    try {
      const sources = await desktopCapturer.getSources({ types: ['screen'] });
      const cursor = remote.screen.getCursorScreenPoint();
      const activeDisplay = remote.screen.getDisplayNearestPoint({x: cursor.x, y: cursor.y});
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

  return [startRecording, stopRecording] as const;
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
