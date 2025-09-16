# YouTube Command-Line Downloader

A simple tool to download video or audio from YouTube directly from your terminal.

## Prerequisites

- [Node.js](https://nodejs.org/) (version 14 or higher)

That's it!.

## Installation

1. **Clone the repository and install dependencies:**
    ```bash
    git clone https://github.com/yourusername/youtube-video-downloader.git
    cd youtube-video-downloader
    npm install
    ```
    *(This step might take a bit longer as it's downloading a ~70MB FFmpeg file).*

### Download Video
To download a video in the best available quality:
```bash
node videodownload.js <YouTube URL>
```

### Download Audio Only
To download just the audio (MP3 format):
```bash
node audiodownload.js <YouTube URL>
```

### Example Commands
```bash
# Download a video
node videodownload.js https://www.youtube.com/watch?v=example123

# Download audio only
node audiodownload.js https://www.youtube.com/watch?v=example123
```

### Output
- Downloaded videos will be saved in the `downloads` folder
- Video files will be in MP4 format
- Audio files will be in MP3 format