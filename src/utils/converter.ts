import os from 'os';
import path from 'path';
import fs from 'fs'
import { Notification, shell } from 'electron';
import PreviewWindow from '../windows/preview';
import ffmpeg, { FfmpegCommand } from 'fluent-ffmpeg';
import log from 'electron-log';

const ffmpegPath = () => {
  let currentPlatform = os.platform();
  let platform : string;

  if(currentPlatform == 'darwin') {
    platform = 'mac';
  }

  else if(currentPlatform == 'win32') {
    platform = "win";
  }

  const arch = os.arch()

  return path.join(__dirname, 'bin', platform, arch, platform === 'win' ? 'ffmpeg.exe' : 'ffmpeg').replace('app.asar', 'app.asar.unpacked');
}

fs.chmod(ffmpegPath(), '777', () => {
  ffmpeg.setFfmpegPath(ffmpegPath());
});

export const convert = (data: { src: string, filePath: string, format: string }, render: PreviewWindow) => {

  const onSuccess = () => {
    const notification = new Notification();
    notification.title = 'Screen Recording exported';
    notification.body = 'Click here to open';
    notification.on('click', () => {
      shell.openItem(path.dirname(data.filePath));
    })
    notification.show();
    render.window.webContents.send('conversion:end')
  }

  const onError = (err: any) => {
    log.warn('Eror on conversion', err);
    render.window.webContents.send('conversion:end')
  }

  if(path.extname(data.src).includes(data.format)) {
    return fs.copyFile(data.src, data.filePath, (err) => {
      if(err) {
        onError(err);
      }
      onSuccess();
    });
  }

  log.info('Convert file', data);
  log.info(ffmpegPath());
  let transcoder = ffmpeg(data.src)
  if(data.format === 'mp4') {
    transcoder = MP4Converter(transcoder);
  }
  else if(data.format === 'gif') {
    transcoder = GIFConverter(transcoder);
  }
  transcoder
  .output(data.filePath)
  .on('end', () => {
    onSuccess();
  })
  .on('error', (err) => {
    onError(err);
  })
  .run();
}

function MP4Converter (transcoder : FfmpegCommand) : FfmpegCommand {
  return transcoder.outputOptions([
    '-crf 26',
     '-preset slower',
    '-c:v libx264',
    `-threads ${Math.max(os.cpus().length - 1, 1)}`,
  ]);
}

function GIFConverter (transcoder : FfmpegCommand) : FfmpegCommand {
  return transcoder.outputOptions([
    '-vf fps=30',
    `-threads ${Math.max(os.cpus().length - 1, 1)}`,
  ]);
}
