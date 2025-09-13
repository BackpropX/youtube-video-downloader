import ytdl from '@distube/ytdl-core';
import { createWriteStream, unlinkSync } from 'fs';
import { spawn } from 'child_process';

async function downloadAudio(url) {
    let title = 'default_title';
    let outputFile;

    try {
        console.log("Fetching video info...");
        const info = await ytdl.getInfo(url);
        
        title = info.videoDetails.title.replace(/[<>:"/\\|?*]/g, '');
        
        const tempFile = `${title}_temp.m4a`;
        outputFile = `${title}.mp3`;

        console.log(`Downloading audio stream for: ${title}`);

        const audioStream = ytdl(url, { quality: 'highestaudio' });
        const writer = audioStream.pipe(createWriteStream(tempFile));

        await new Promise(resolve => writer.on('finish', resolve));

        console.log("Download complete. Converting to MP3 with ffmpeg...");

        await new Promise((resolve, reject) => {
            const ffmpeg = spawn('ffmpeg', [
                '-i', tempFile,
                '-b:a', '192k',
                outputFile
            ]);

            ffmpeg.on('close', code => {
                if (code === 0) {
                    console.log(`✅ Conversion complete: ${outputFile}`);
                    resolve();
                } else {
                    reject(new Error(`ffmpeg exited with code ${code}`));
                }
            });

            ffmpeg.on('error', (err) => reject(err));
        });

        unlinkSync(tempFile);
        console.log("🧹 Temporary file removed.");

    } catch (error) {
        console.error(`An error occurred while processing the URL. It might be invalid or private.`);
        console.error("Original Error:", error.message);
    }
}

downloadAudio("Paste your Youtube Video link here");