import { useRef } from 'react';
import { desktopCapturer, remote } from 'electron';
import { writeFile } from 'fs';
import log from 'electron-log';

const useRecorder = (microphone: string) => {
  const mediaRecorder = useRef(null);
  let recorderdChunks = [];

  const startRecording = async () => {
    try {
      const sources = await desktopCapturer.getSources({ types: ['screen'] });
      const screen = sources.find(source => source.name === 'Entire Screen');
      const audioOptions = microphone === 'none' ? { audio: false } : { audio: { deviceId: { exact: microphone } } };
      const constrains : any = {
        audio: false,
        video: {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: screen.id,
          }
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

        const buffer = Buffer.from(await blob.arrayBuffer());
        const { filePath } = await remote.dialog.showSaveDialog({
          buttonLabel: 'Save video',
          defaultPath: `Screen-Recording-${Date.now()}.webm`
        });

        writeFile(filePath, buffer, () => {
        });
      }
    }
    catch(e) {
      alert('There was an error proccesing the recording');
      log.warn(e);
    }
  }

  const stopRecording = async () => {
    mediaRecorder.current.stop();
  }

  return [startRecording, stopRecording] as const;
}

export default useRecorder;
