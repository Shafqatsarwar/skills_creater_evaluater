// Video Generator Agent
// Main entry point for creating demo videos for AgentFactory

const { renderVideo } = require('./renderer');
const { createScript, VIDEO_TYPE_CONFIGS } = require('./script-generator');
const { loadAssets } = require('./asset-manager');
const { generateVoiceover } = require('./voiceover-generator');
const path = require('path');
const fs = require('fs').promises;

/**
 * Video Generator Agent Class
 * Orchestrates the complete video generation process
 */
class VideoGeneratorAgent {
  constructor(config = {}) {
    this.config = {
      // Rendering settings
      renderTimeout: 300000, // 5 minutes
      maxConcurrentJobs: 3,
      maxConcurrency: 4,

      // Output settings
      outputFormat: 'mp4',
      quality: 'high', // high, medium, low
      resolution: '1080p', // 720p, 1080p, 4k
      fps: 30,

      // Voiceover settings
      voiceover: {
        enabled: true,
        provider: 'openai',
        voice: 'alloy'
      },

      // Branding
      branding: {
        name: 'AgentFactory',
        website: 'agentfactory.panaversity.org',
        primaryColor: '#2563eb'
      },

      ...config
    };

    this.validateConfig();
  }

  /**
   * Validate configuration
   */
  validateConfig() {
    const validQualities = ['high', 'medium', 'low'];
    const validResolutions = ['720p', '1080p', '4k'];
    const validFormats = ['mp4', 'webm'];

    if (!validQualities.includes(this.config.quality)) {
      console.warn(`Invalid quality "${this.config.quality}". Using "high".`);
      this.config.quality = 'high';
    }

    if (!validResolutions.includes(this.config.resolution)) {
      console.warn(`Invalid resolution "${this.config.resolution}". Using "1080p".`);
      this.config.resolution = '1080p';
    }

    if (!validFormats.includes(this.config.outputFormat)) {
      console.warn(`Invalid format "${this.config.outputFormat}". Using "mp4".`);
      this.config.outputFormat = 'mp4';
    }
  }

  /**
   * Generate a demo video from specification
   * @param {Object} specification - Video specification
   * @returns {Promise<string>} - Path to generated video
   */
  async generateDemoVideo(specification) {
    const startTime = Date.now();
    const outputDir = path.join(process.cwd(), 'output');

    try {
      await fs.mkdir(outputDir, { recursive: true });

      console.log('='.repeat(60));
      console.log('Starting video generation process...');
      console.log('='.repeat(60));
      console.log(`Title: ${specification.title}`);
      console.log(`Type: ${specification.videoType || 'default'}`);
      console.log(`Duration: ${specification.duration || 60}s`);
      console.log('');

      // Step 1: Generate script based on specification
      console.log('[1/4] Generating script...');
      const script = await createScript(specification);
      console.log(`      Script generated successfully`);
      console.log(`      - Intro: ${script.timing.introSeconds}s`);
      console.log(`      - Body: ${script.timing.bodySeconds}s`);
      console.log(`      - Conclusion: ${script.timing.conclusionSeconds}s`);
      console.log('');

      // Step 2: Generate Voiceover (TTS)
      let voiceoverAudio = null;
      if (this.config.voiceover.enabled) {
        console.log('[2/4] Generating voiceover (Local Windows TTS)...');
        const voiceoverPath = path.join(outputDir, `voiceover_${Date.now()}.wav`);
        const cleanScript = script.voiceover.full.replace(/\[.*?\]/g, ''); // Remove section markers
        try {
          voiceoverAudio = await generateVoiceover(cleanScript, voiceoverPath);
          const { getAudioDuration } = require('./voiceover-generator');
          const actualDuration = await getAudioDuration(voiceoverAudio);
          if (actualDuration > 0) {
            console.log(`      Voiceover duration: ${actualDuration.toFixed(1)}s`);
            specification.duration = actualDuration + 2; // Add a bit of buffer
          }
          console.log(`      Voiceover generated: ${path.basename(voiceoverAudio)}`);
        } catch (ttsError) {
          console.warn(`      TTS failed, proceeding without voice: ${ttsError.message}`);
        }
      } else {
        console.log('[2/4] Voiceover skipped (disabled in config)');
      }
      console.log('');

      // Step 3: Load required assets
      console.log('[3/4] Loading assets...');
      const assets = await loadAssets(specification.assets || []);
      if (voiceoverAudio) {
        assets.audio.push({
          type: 'audio',
          path: voiceoverAudio,
          name: 'voiceover.mp3',
          valid: true,
          role: 'voiceover'
        });
      }
      const assetSummary = this.summarizeAssets(assets);
      console.log(`      Assets loaded: ${assetSummary}`);
      console.log('');

      // Step 4: Render video with Remotion
      console.log('[4/4] Rendering video...');
      const outputPath = await renderVideo({
        ...specification,
        script,
        assets
      }, this.config);

      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log('');
      console.log('='.repeat(60));
      console.log(`✅ Video rendered successfully in ${duration}s`);
      console.log(`   Output: ${outputPath}`);
      console.log('='.repeat(60));

      return outputPath;
    } catch (error) {
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      console.error('');
      console.error('='.repeat(60));
      console.error(`❌ Video generation failed after ${duration}s`);
      console.error(`   Error: ${error.message}`);
      console.error('='.repeat(60));
      throw error;
    }
  }

  /**
   * Generate multiple videos in batch mode
   * @param {Array<Object>} specifications - Array of video specifications
   * @returns {Promise<Array<string>>} - Array of output paths
   */
  async batchGenerate(specifications) {
    console.log(`\n📦 Starting batch generation of ${specifications.length} video(s)...\n`);

    const results = [];
    const failed = [];

    // Process in batches based on maxConcurrentJobs
    for (let i = 0; i < specifications.length; i += this.config.maxConcurrentJobs) {
      const batch = specifications.slice(i, i + this.config.maxConcurrentJobs);
      const batchNumber = Math.floor(i / this.config.maxConcurrentJobs) + 1;
      const totalBatches = Math.ceil(specifications.length / this.config.maxConcurrentJobs);

      console.log(`\n--- Batch ${batchNumber}/${totalBatches} ---\n`);

      try {
        const batchResults = await Promise.all(
          batch.map(async (spec, index) => {
            try {
              const outputPath = await this.generateDemoVideo(spec);
              return { success: true, spec: spec.title, outputPath };
            } catch (error) {
              return {
                success: false,
                spec: spec.title,
                error: error.message
              };
            }
          })
        );

        batchResults.forEach(result => {
          if (result.success) {
            results.push(result.outputPath);
          } else {
            failed.push({ title: result.spec, error: result.error });
          }
        });

      } catch (error) {
        console.error(`Batch ${batchNumber} failed:`, error.message);
        batch.forEach(spec => {
          failed.push({ title: spec.title, error: error.message });
        });
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Batch Generation Summary');
    console.log('='.repeat(60));
    console.log(`Total: ${specifications.length} | Success: ${results.length} | Failed: ${failed.length}`);

    if (failed.length > 0) {
      console.log('\nFailed videos:');
      failed.forEach(f => console.log(`  - ${f.title}: ${f.error}`));
    }
    console.log('='.repeat(60));

    return results;
  }

  /**
   * Summarize loaded assets
   */
  summarizeAssets(assets) {
    const counts = {
      images: assets.images?.filter(a => a.valid).length || 0,
      videos: assets.videos?.filter(a => a.valid).length || 0,
      audio: assets.audio?.filter(a => a.valid).length || 0,
      fonts: assets.fonts?.filter(a => a.valid).length || 0
    };

    const parts = [];
    if (counts.images) parts.push(`${counts.images} image(s)`);
    if (counts.videos) parts.push(`${counts.videos} video(s)`);
    if (counts.audio) parts.push(`${counts.audio} audio file(s)`);
    if (counts.fonts) parts.push(`${counts.fonts} font(s)`);

    return parts.length > 0 ? parts.join(', ') : 'No external assets';
  }

  /**
   * Get available video types
   */
  getVideoTypes() {
    return Object.keys(VIDEO_TYPE_CONFIGS);
  }

  /**
   * Get configuration info
   */
  getConfig() {
    return { ...this.config };
  }
}

module.exports = { VideoGeneratorAgent };
