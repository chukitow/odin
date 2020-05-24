import os from 'os';
import path from 'path';
import fs from 'fs'
import { Notification } from 'electron';
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
  log.info('Convert file', data);
  log.info(ffmpegPath());
  let transcoder = ffmpeg(data.src)
  if(data.format === 'mp4') {
    transcoder = MP4Converter(transcoder);
  }
  transcoder
  .output(data.filePath)
  .on('end', () => {
    const notification = new Notification();
    notification.body = 'Screen Recording exported';
    notification.show();
    render.window.webContents.send('conversion:end')
  })
  .on('error', (err) => {
    log.warn('Eror on conversion', err);
    render.window.webContents.send('conversion:end')
  })
  .run();
}

function MP4Converter (transcoder : FfmpegCommand) : FfmpegCommand {
  return transcoder.outputOptions([
    '-crf 1',
    '-c:v libx264'
  ]);
}
