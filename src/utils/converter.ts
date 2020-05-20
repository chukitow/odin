import { Notification } from 'electron';
import PreviewWindow from '../modules/preview_window';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import ffprobeStatic from 'ffprobe-static';
import log from 'electron-log';

const ffmpegPath = ffmpegStatic.replace(
  'app.asar',
  'app.asar.unpacked'
);

const ffprobePath = ffprobeStatic.path.replace(
    'app.asar',
    'app.asar.unpacked'
);

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

export const convert = (data: { src: string, filePath: string }, render: PreviewWindow) => {
  ffmpeg(data.src)
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
