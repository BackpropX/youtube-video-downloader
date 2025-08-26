# YouTube Video Downloader

A simple command-line tool to download YouTube videos in high quality by combining the best available video and audio streams.

## Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)
- FFmpeg (for merging video and audio streams)

## Installation

1. **Install FFmpeg** (if not already installed):
   - Windows: Download from [FFmpeg's official website](https://ffmpeg.org/download.html) and add it to your system PATH
   - Mac: `brew install ffmpeg`
   - Linux (Debian/Ubuntu): `sudo apt install ffmpeg`

2. **Clone this repository** or download the source code

3. **Install dependencies**:
   ```bash
   npm install
   ```

## Usage

1. **Basic usage**:
   Open `downloader.js` and replace the example URL with your YouTube video URL:
   ```javascript
   // Change this URL to the video you want to download
   downloadVideo("https://www.youtube.com/watch?v=YOUR_VIDEO_ID");
   ```

2. **Run the downloader**:
   ```bash
   node downloader.js
   ```

3. **The downloaded video** will be saved in the same directory with the format: `[Video Title]_final.mp4`

## How It Works

1. The script downloads the highest quality video and audio streams separately
2. Uses FFmpeg to merge them into a single high-quality MP4 file
3. Automatically cleans up temporary files after successful download

## Notes

- The download speed depends on your internet connection
- Some videos might be restricted by YouTube and cannot be downloaded
- For private videos, you'll need to provide authentication

## License

This project is for educational purposes only. Please respect YouTube's Terms of Service and only download videos you have the right to access.
