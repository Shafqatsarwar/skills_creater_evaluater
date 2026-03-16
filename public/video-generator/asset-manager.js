// Asset Manager for Video Generator Agent
// Handles loading and managing video assets

const fs = require('fs').promises;
const path = require('path');

async function loadAssets(assetRequests = []) {
  const assets = {
    images: [],
    videos: [],
    audio: [],
    fonts: []
  };

  for (const request of assetRequests) {
    switch (request.type) {
      case 'image':
        assets.images.push(await loadImage(request));
        break;
      case 'video':
        assets.videos.push(await loadVideo(request));
        break;
      case 'audio':
        assets.audio.push(await loadAudio(request));
        break;
      case 'font':
        assets.fonts.push(await loadFont(request));
        break;
      default:
        console.warn(`Unknown asset type: ${request.type}`);
    }
  }

  return assets;
}

async function loadImage(request) {
  // Verify image exists and return asset info
  try {
    const stats = await fs.stat(request.path);
    return {
      type: 'image',
      path: request.path,
      name: path.basename(request.path),
      size: stats.size,
      width: request.width || null,
      height: request.height || null,
      valid: true
    };
  } catch (error) {
    console.error(`Could not load image: ${request.path}`, error.message);
    return {
      type: 'image',
      path: request.path,
      name: path.basename(request.path),
      valid: false,
      error: error.message
    };
  }
}

async function loadVideo(request) {
  // Verify video exists and return asset info
  try {
    const stats = await fs.stat(request.path);
    return {
      type: 'video',
      path: request.path,
      name: path.basename(request.path),
      size: stats.size,
      duration: request.duration || null,
      valid: true
    };
  } catch (error) {
    console.error(`Could not load video: ${request.path}`, error.message);
    return {
      type: 'video',
      path: request.path,
      name: path.basename(request.path),
      valid: false,
      error: error.message
    };
  }
}

async function loadAudio(request) {
  // Verify audio exists and return asset info
  try {
    const stats = await fs.stat(request.path);
    return {
      type: 'audio',
      path: request.path,
      name: path.basename(request.path),
      size: stats.size,
      duration: request.duration || null,
      valid: true
    };
  } catch (error) {
    console.error(`Could not load audio: ${request.path}`, error.message);
    return {
      type: 'audio',
      path: request.path,
      name: path.basename(request.path),
      valid: false,
      error: error.message
    };
  }
}

async function loadFont(request) {
  // Verify font exists and return asset info
  try {
    const stats = await fs.stat(request.path);
    return {
      type: 'font',
      path: request.path,
      name: path.basename(request.path),
      family: request.family || path.basename(request.path, path.extname(request.path)),
      weight: request.weight || 'normal',
      valid: true
    };
  } catch (error) {
    console.error(`Could not load font: ${request.path}`, error.message);
    return {
      type: 'font',
      path: request.path,
      name: path.basename(request.path),
      valid: false,
      error: error.message
    };
  }
}

// Function to download assets from URLs if needed
async function downloadAsset(url, destination) {
  // This would implement downloading logic if needed
  // For now, just a placeholder
  console.log(`Downloading asset from ${url} to ${destination}`);
  return destination;
}

module.exports = { loadAssets, downloadAsset };