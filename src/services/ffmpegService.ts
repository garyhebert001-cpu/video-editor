import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

let ffmpeg: FFmpeg | null = null;

export const getFFmpeg = async (): Promise<FFmpeg> => {
  if (ffmpeg) return ffmpeg;

  ffmpeg = new FFmpeg();
  await ffmpeg.load({
    coreURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.js',
    wasmURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.wasm',
  });
  return ffmpeg;
};

export const trimVideo = async (file: File, startTime: number, duration: number): Promise<Blob> => {
  const ffmpeg = await getFFmpeg();
  await ffmpeg.writeFile('input.mp4', await fetchFile(file));
  
  await ffmpeg.exec(['-ss', `${startTime}`, '-i', 'input.mp4', '-t', `${duration}`, '-c', 'copy', 'output.mp4']);
  
  const data = await ffmpeg.readFile('output.mp4');
  return new Blob([data], { type: 'video/mp4' });
};

export const cropVideo = async (file: File, x: number, y: number, width: number, height: number): Promise<Blob> => {
  const ffmpeg = await getFFmpeg();
  await ffmpeg.writeFile('input.mp4', await fetchFile(file));
  
  // Crop filter: crop=w:h:x:y
  await ffmpeg.exec(['-i', 'input.mp4', '-vf', `crop=${width}:${height}:${x}:${y}`, '-c:a', 'copy', 'output.mp4']);
  
  const data = await ffmpeg.readFile('output.mp4');
  return new Blob([data], { type: 'video/mp4' });
};

export const concatenateVideos = async (files: File[]): Promise<Blob> => {
  const ffmpeg = await getFFmpeg();
  const inputNames: string[] = [];
  
  for (let i = 0; i < files.length; i++) {
    const name = `input${i}.mp4`;
    await ffmpeg.writeFile(name, await fetchFile(files[i]));
    inputNames.push(name);
  }

  // Create a file list for concatenation
  const fileList = inputNames.map(name => `file '${name}'`).join('\n');
  await ffmpeg.writeFile('concat.txt', fileList);

  // Concatenate using the concat demuxer
  await ffmpeg.exec(['-f', 'concat', '-safe', '0', '-i', 'concat.txt', '-c', 'copy', 'output.mp4']);
  
  const data = await ffmpeg.readFile('output.mp4');
  return new Blob([data], { type: 'video/mp4' });
};
