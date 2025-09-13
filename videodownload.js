import ytdl from '@distube/ytdl-core';
import { createWriteStream, unlinkSync, existsSync, mkdirSync } from 'fs';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const videoUrl = process.argv[2];
if (!videoUrl) {
    console.error("ERROR: Please provide a YouTube URL.");
    console.log("Usage: node videodownload.js <YOUTUBE_URL>");
    process.exit(1);
}
downloadVideo(videoUrl);


async function downloadVideo(url) {
    try {
        const downloadsFolder = 'downloads';
        if (!existsSync(downloadsFolder)) {
            mkdirSync(downloadsFolder);
        }

        console.log("Fetching video info...");
        const info = await ytdl.getInfo(url);
        const title = info.videoDetails.title.replace(/[<>:"/\\|?*]/g, '');
        const videoFile = `${title}_video.mp4`;
        const audioFile = `${title}_audio.mp4`;
        const outputFile = path.join(downloadsFolder, `${title}.mp4`);

        console.log(`Downloading video and audio streams for: ${title}`);
        const video = ytdl(url, { quality: 'highestvideo' }).pipe(createWriteStream(videoFile));
        const audio = ytdl(url, { quality: 'highestaudio' }).pipe(createWriteStream(audioFile));
        await Promise.all([
            new Promise(resolve => video.on('finish', resolve)),
            new Promise(resolve => audio.on('finish', resolve))
        ]);

        console.log("Merging video and audio...");

        await new Promise((resolve, reject) => {
            ffmpeg()
                .input(videoFile)
                .input(audioFile)
                .videoCodec('copy')
                .audioCodec('aac')  
                .audioBitrate('192k')
                .save(outputFile)
                .on('end', () => {
                    console.log(`Merge complete: ${outputFile}`);
                    resolve();
                })
                .on('error', (err) => {
                    console.error("Error during merge:", err);
                    reject(err);
                });
        });

        try {
            unlinkSync(videoFile);
            unlinkSync(audioFile);
            console.log("Temporary files removed");
        } catch (err) {
            console.error("Error cleaning up temp files:", err);
        }

    } catch (error) {
        console.error("An error occurred:", error.message);
    }
}