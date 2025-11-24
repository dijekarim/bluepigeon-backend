const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const ffprobePath = require("ffprobe-static").path;
const fs = require("fs");

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

const path = require("path");

function validateAudioDuration(req, res, next) {
    if(req.body.file_type == 'text') {
        return next();
    }

    if (!req.file) {
        return res.status(400).json({ error: "No audio file uploaded" });
    }

  const filePath = path.resolve(req.file.path);

  ffmpeg.ffprobe(filePath, (err, metadata) => {
    if (err) {
        console.error("ffmpeg error:", err);
        return res.status(500).json({ error: "Error checking audio file" });
    }

    const duration = metadata.format.duration;

    if (duration > 61) {
        fs.unlinkSync(filePath);
        return res.status(400).json({ error: "Audio too long, max 60 seconds allowed" });
    }

    next();
  });
}

module.exports = validateAudioDuration;
