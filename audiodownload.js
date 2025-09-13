// import ytdl from '@distube/ytdl-core';
// import { createWriteStream, unlinkSync, existsSync, mkdirSync } from 'fs';
// import { spawn } from 'child_process';
// import path from 'path'; // 1. Import the path module

// // --- Command-Line Execution ---

// const audioUrl = process.argv[2];

// if (!audioUrl) {
//     console.error("❌ ERROR: Please provide a YouTube URL as an argument.");
//     console.log("Usage: node audiodownload.js <YOUTUBE_URL>");
//     process.exit(1);
// }

// downloadAudio(audioUrl);


// /**
//  * Downloads the audio from a YouTube video and saves it as an MP3 file.
//  * @param {string} url The YouTube video URL.
//  */
// async function downloadAudio(url) {
//     try {
//         // 2. Define and create the downloads folder if it doesn't exist
//         const downloadsFolder = 'downloads';
//         if (!existsSync(downloadsFolder)) {
//             mkdirSync(downloadsFolder);
//         }

//         console.log("Fetching video info...");
//         const info = await ytdl.getInfo(url);
        
//         const title = info.videoDetails.title.replace(/[<>:"/\\|?*]/g, '');
        
//         const tempFile = `${title}_temp.m4a`;
//         // 3. Update the output path to use the 'downloads' folder
//         const outputFile = path.join(downloadsFolder, `${title}.mp3`);

//         console.log(`Downloading audio stream for: ${title}`);

//         const audioStream = ytdl(url, { quality: 'highestaudio' });
//         const writer = audioStream.pipe(createWriteStream(tempFile));

//         await new Promise((resolve, reject) => {
//             writer.on('finish', resolve);
//             writer.on('error', reject);
//         });

//         console.log("Download complete. Converting to MP3 with ffmpeg...");

//         await new Promise((resolve, reject) => {
//             const ffmpeg = spawn('ffmpeg', [
//                 '-i', tempFile,
//                 '-b:a', '192k',
//                 outputFile
//             ]);

//             ffmpeg.on('close', code => {
//                 if (code === 0) {
//                     console.log(`✅ Conversion complete: ${outputFile}`);
//                     resolve();
//                 } else {
//                     reject(new Error(`ffmpeg exited with code ${code}`));
//                 }
//             });

//             ffmpeg.on('error', (err) => reject(err));
//         });

//         unlinkSync(tempFile);
//         console.log("🧹 Temporary file removed.");

//     } catch (error) {
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
const audioUrl = process.argv[2];
if (!audioUrl) {
    console.error("❌ ERROR: Please provide a YouTube URL.");
    console.log("Usage: node audiodownload.js <YOUTUBE_URL>");
    process.exit(1);
}
downloadAudio(audioUrl);


async function downloadAudio(url) {
    try {
        const downloadsFolder = 'downloads';
        if (!existsSync(downloadsFolder)) {
            mkdirSync(downloadsFolder);
        }

        console.log("Fetching video info...");
        const info = await ytdl.getInfo(url);
        const title = info.videoDetails.title.replace(/[<>:"/\\|?*]/g, '');
        const tempFile = `${title}_temp.m4a`;
        const outputFile = path.join(downloadsFolder, `${title}.mp3`);

        console.log(`Downloading audio stream for: ${title}`);
        const audioStream = ytdl(url, { quality: 'highestaudio' });
        const writer = audioStream.pipe(createWriteStream(tempFile));
        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        console.log("Download complete. Converting to MP3...");
        
        // Use fluent-ffmpeg for conversion
        await new Promise((resolve, reject) => {
            ffmpeg(tempFile)
                .audioBitrate('192k')
                .save(outputFile)
                .on('end', () => {
                    console.log(`✅ Conversion complete: ${outputFile}`);
                    resolve();
                })
                .on('error', (err) => {
                    console.error("Error during conversion:", err);
                    reject(err);
                });
        });

        unlinkSync(tempFile);
        console.log("🧹 Temporary file removed.");

    } catch (error) {
        console.error("An error occurred:", error.message);
    }
}