// Voiceover Generator using Local Windows TTS
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * Generate voiceover audio from text using local Windows TTS
 * @param {string} text - The script text to convert to speech
 * @param {string} outputPath - Path to save the wav file
 * @returns {Promise<string>} - Path to the generated audio file
 */
async function generateVoiceover(text, outputPath) {
    return new Promise((resolve, reject) => {
        const scriptPath = path.join(__dirname, 'local-tts.ps1');

        // Use spawn to correctly pass arguments with spaces
        const ps = spawn('powershell.exe', [
            '-ExecutionPolicy', 'Bypass',
            '-File', scriptPath,
            text,
            outputPath
        ]);

        let stderr = '';
        ps.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        ps.on('close', (code) => {
            if (code !== 0) {
                console.error(`Local TTS Error (Code ${code}): ${stderr}`);
                return reject(new Error(`Local TTS failed with code ${code}: ${stderr}`));
            }

            if (fs.existsSync(outputPath)) {
                resolve(outputPath);
            } else {
                reject(new Error(`Failed to generate local TTS file: No file at ${outputPath}`));
            }
        });
    });
}

/**
 * Get the duration of an audio file in seconds
 * @param {string} filePath - Path to the audio file
 * @returns {Promise<number>} - Duration in seconds
 */
async function getAudioDuration(filePath) {
    return new Promise((resolve) => {
        const ffmpeg = require('ffmpeg-static');
        const { exec } = require('child_process');
        
        exec(`"${ffmpeg}" -i "${filePath}"`, (error, stdout, stderr) => {
            // ffmpeg outputs info to stderr
            const match = /Duration: (\d{2}):(\d{2}):(\d{2})\.(\d{2})/.exec(stderr);
            if (match) {
                const hours = parseInt(match[1]);
                const minutes = parseInt(match[2]);
                const seconds = parseInt(match[3]);
                const centiseconds = parseInt(match[4]);
                resolve(hours * 3600 + minutes * 60 + seconds + centiseconds / 100);
            } else {
                resolve(0);
            }
        });
    });
}

module.exports = { generateVoiceover, getAudioDuration };
