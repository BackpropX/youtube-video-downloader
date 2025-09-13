import ytdl from '@distube/ytdl-core';
import { createWriteStream, unlinkSync } from 'fs';
import { spawn } from 'child_process';

async function downloadVideo(url) {
    const info = await ytdl.getInfo(url);
    const title = info.videoDetails.title.replace(/[<>:"/\\|?*]/g, '');
    
    const videoFile = `${title}_video.mp4`;
    const audioFile = `${title}_audio.mp4`;
    const outputFile = `${title}_final.mp4`;

    console.log("Downloading video and audio streams...");

    
    const video = ytdl(url, { quality: 'highestvideo' })
        .pipe(createWriteStream(videoFile));

    const audio = ytdl(url, { quality: 'highestaudio' })
        .pipe(createWriteStream(audioFile));

    await Promise.all([
        new Promise(resolve => video.on('finish', resolve)),
        new Promise(resolve => audio.on('finish', resolve))
    ]);

    console.log("Merging video and audio with ffmpeg...");

    await new Promise((resolve, reject) => {
        const ffmpeg = spawn('ffmpeg', [
            '-i', videoFile,
            '-i', audioFile,
            '-c:v', 'copy',   
            '-c:a', 'aac',    
            '-b:a', '192k',   
            outputFile
        ]);

        ffmpeg.on('close', code => {
            if (code === 0) {
                console.log(`✅ Download complete: ${outputFile}`);

                // Delete temp files
                try {
                    unlinkSync(videoFile);
                    unlinkSync(audioFile);
                    console.log("🧹 Temporary files removed");
                } catch (err) {
                    console.error("Error cleaning up temp files:", err);
                }

                resolve();
            } else {
                reject(new Error(`ffmpeg exited with code ${code}`));
            }
        });
    });
}

downloadVideo("Paste your Youtube Video link here");