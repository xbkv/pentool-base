import { Response } from 'express';
import ytdl from '@distube/ytdl-core';
import { promises as fsPromises } from 'fs';
import { PassThrough } from 'stream';
import { ConvertYouTubeRequest } from '../../utils/types';

import ffmpegPath from '@ffmpeg-installer/ffmpeg';
import ffmpeg from 'fluent-ffmpeg';
ffmpeg.setFfmpegPath(ffmpegPath.path);

import router from "..";

router.get('/convert_youtube', async (req: ConvertYouTubeRequest, res: Response) => {
    const { videoUrl } = req.query;
    if (!videoUrl) {
      res.status(400).json({ error: '動画URLが必要です' });
      return;
    }
  
    try {
      const info = await ytdl.getInfo(videoUrl);
      const videoTitle: string = info.videoDetails.title;
  
      const format = ytdl.chooseFormat(info.formats, {
        quality: 'highestaudio',
        filter: (format) => format.audioCodec && (format.audioCodec === 'opus' || format.audioCodec === 'mp4a.40.2'),
      });
  
      if (!format.url) {
        res.status(400).json({ error: '適切なオーディオフォーマットが見つかりませんでした。' });
        return;
      }
  
      const stream = ytdl(videoUrl, { format, highWaterMark: 32 * 1024 * 1024 });
  
      stream.on('response', (response) => {
        if (response.statusCode === 410 && !res.headersSent) {
          console.error('リソースが存在しません (410)');
          res.status(410).json({ error: 'リソースが存在しません (410)' });
          stream.destroy();
        }
      });
  
      stream.on('error', (err) => {
        console.error('ストリームエラー:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: `ストリーム取得エラー: ${err.message}` });
        }
      });
  
      const passThrough = new PassThrough();
  
      ffmpeg(stream)
        .format('mp3')
        .audioBitrate(128)
        .audioChannels(2)
        .on('error', (err) => {
          console.error('MP3変換中のエラー:', err);
          if (!res.headersSent) {
            res.status(500).json({ error: `MP3への変換に失敗しました: ${err.message}` });
          }
          passThrough.end();
        })
        .pipe(passThrough);
  
      let fileData = '';
      passThrough.setEncoding('base64');
      passThrough.on('data', chunk => { fileData += chunk; });
      passThrough.on('end', () => {
        if (!res.headersSent) {
          res.json({ fileData, videoTitle });
        }
      });
  
    } catch (error) {
      console.error('MP3 URL取得エラー:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: `MP3 URLの取得に失敗しました: ${error.message}` });
      }
    }
});

export default router;