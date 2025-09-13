// import ytdl from '@distube/ytdl-core';
// import { createWriteStream, unlinkSync, existsSync, mkdirSync } from 'fs';
// import { spawn } from 'child_process';
// import path from 'path'; // 1. Import the path module

// // --- Command-Line Execution ---

// const videoUrl = process.argv[2];

// if (!videoUrl) {
//     console.error("❌ ERROR: Please provide a YouTube URL as an argument.");
//     console.log("Usage: node videodownload.js <YOUTUBE_URL>");
//     process.exit(1);
// }

// downloadVideo(videoUrl);


// /**
//  * Downloads a full YouTube video with audio.
//  * @param {string} url The YouTube video URL.
//  */
// async function downloadVideo(url) {
//     try {
//         // 2. Define and create the downloads folder if it doesn't exist
//         const downloadsFolder = 'downloads';
//         if (!existsSync(downloadsFolder)) {
//             mkdirSync(downloadsFolder);
//         }

//         console.log("Fetching video info...");
//         const info = await ytdl.getInfo(url);
//         const title = info.videoDetails.title.replace(/[<>:"/\\|?*]/g, '');
        
//         const videoFile = `${title}_video.mp4`;
//         const audioFile = `${title}_audio.mp4`;
//         // 3. Update the output path to use the 'downloads' folder
//         const outputFile = path.join(downloadsFolder, `${title}.mp4`);

//         console.log(`Downloading video and audio streams for: ${title}`);

//         const video = ytdl(url, { quality: 'highestvideo' })
//             .pipe(createWriteStream(videoFile));

//         const audio = ytdl(url, { quality: 'highestaudio' })
//             .pipe(createWriteStream(audioFile));

//         await Promise.all([
//             new Promise(resolve => video.on('finish', resolve)),
//             new Promise(resolve => audio.on('finish', resolve))
//         ]);

//         console.log("Merging video and audio with ffmpeg...");

//         await new Promise((resolve, reject) => {
//             const ffmpeg = spawn('ffmpeg', [
//                 '-i', videoFile,
//                 '-i', audioFile,
//                 '-c:v', 'copy',
//                 '-c:a', 'aac',
//                 '-b:a', '192k',
//                 outputFile
//             ]);

//             ffmpeg.on('close', code => {
//                 if (code === 0) {
//                     console.log(`✅ Download complete: ${outputFile}`);
//                     try {
//                         unlinkSync(videoFile);
//                         unlinkSync(audioFile);
//                         console.log("🧹 Temporary files removed");
//                     } catch (err) {
//                         console.error("Error cleaning up temp files:", err);
//                     }
//                     resolve();
//                 } else {
//                     reject(new Error(`ffmpeg exited with code ${code}`));
//                 }
//             });

//              ffmpeg.on('error', (err) => reject(err));
//         });
//     } catch (error)
//  {
//         console.error(`An error occurred. The URL might be invalid or private.`);
//         console.error("Original Error:", error.message);
//     }
// }

import ytdl from '@distube/ytdl-core';
import { createWriteStream, unlinkSync, existsSync, mkdirSync } from 'fs';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';

// Point fluent-ffmpeg to the automatically downloaded executable
ffmpeg.setFfmpegPath(ffmpegInstaller.path);


// --- Command-Line Execution ---
const videoUrl = process.argv[2];
if (!videoUrl) {
    console.error("❌ ERROR: Please provide a YouTube URL.");
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
        
        // Use fluent-ffmpeg for merging
        await new Promise((resolve, reject) => {
            ffmpeg()
                .input(videoFile)
                .input(audioFile)
                .videoCodec('copy') // copy video without re-encoding
                .audioCodec('aac')  // re-encode audio for compatibility
                .audioBitrate('192k')
                .save(outputFile)
                .on('end', () => {
                    console.log(`✅ Merge complete: ${outputFile}`);
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
            console.log("🧹 Temporary files removed");
        } catch (err) {
            console.error("Error cleaning up temp files:", err);
        }

    } catch (error) {
        console.error("An error occurred:", error.message);
    }
}