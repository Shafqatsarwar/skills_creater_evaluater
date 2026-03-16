// Renderer for Video Generator Agent
// Uses Remotion to render video compositions

const { bundle } = require('@remotion/bundler');
const { getCompositions, renderMedia } = require('@remotion/renderer');
const os = require('os');
const path = require('path');
const fs = require('fs').promises;

// Default video settings
const DEFAULT_FPS = 30;
const RESOLUTIONS = {
  '720p': { width: 1280, height: 720 },
  '1080p': { width: 1920, height: 1080 },
  '4k': { width: 3840, height: 2160 }
};

/**
 * Render a video based on composition specification
 * @param {Object} compositionSpec - Video specification
 * @param {Object} config - Rendering configuration
 * @returns {Promise<string>} - Path to rendered video
 */
async function renderVideo(compositionSpec, config) {
  const tempDir = path.join(os.tmpdir(), `agentfactory-video-${Date.now()}`);
  const bundleDir = path.join(tempDir, 'bundle');

  let bundledComposition = null;
  let cleanupNeeded = true;

  try {
    // Ensure temp and output directories exist
    await fs.mkdir(tempDir, { recursive: true });
    await fs.mkdir(bundleDir, { recursive: true });

    const outputDir = path.join(process.cwd(), 'output');
    await fs.mkdir(outputDir, { recursive: true });

    // Ensure public/assets directory exists in bundle (Remotion standard)
    const bundleAssetsDir = path.join(bundleDir, 'public', 'assets');
    await fs.mkdir(bundleAssetsDir, { recursive: true });

    // Handle voiceover audio asset
    let voiceoverFilename = null;
    if (compositionSpec.assets && compositionSpec.assets.audio) {
      const voiceoverAsset = compositionSpec.assets.audio.find(a => a.role === 'voiceover' && a.valid);
      if (voiceoverAsset) {
        voiceoverFilename = 'voiceover.wav';
        await fs.copyFile(voiceoverAsset.path, path.join(bundleAssetsDir, voiceoverFilename));
      }
    }

    // Generate composition files
    await generateCompositionFiles(bundleDir, compositionSpec, config, voiceoverFilename);

    // Bundle the composition
    console.log('Bundling composition...');
    bundledComposition = await bundle({
      cwd: bundleDir,
      entryPoint: path.join(bundleDir, 'index.js'),
      inputProps: {
        title: compositionSpec.title,
        keyPoints: compositionSpec.keyPoints,
        duration: compositionSpec.duration,
        targetAudience: compositionSpec.targetAudience
      }
    });

    // Get available compositions
    const comps = await getCompositions(bundledComposition);
    const comp = comps.find(c => c.id === 'AgentFactoryDemo');

    if (!comp) {
      throw new Error('AgentFactoryDemo composition not found');
    }

    // Generate output filename
    const timestamp = Date.now();
    const safeTitle = compositionSpec.title.replace(/[^a-zA-Z0-9]/g, '_');
    const outputPath = path.join(outputDir, `${safeTitle}_${timestamp}.${config.outputFormat || 'mp4'}`);

    // Determine codec based on output format
    const codec = (config.outputFormat || 'mp4') === 'webm' ? 'vp9' : 'h264';

    // Render with progress tracking
    console.log('Rendering video...');
    await renderMedia({
      composition: comp,
      serveUrl: bundledComposition,
      codec,
      outputLocation: outputPath,
      imageFormat: 'jpeg',
      jpegQuality: getQualityValue(config.quality || 'high'),
      concurrency: Math.min(os.cpus().length, config.maxConcurrency || 4),
      timeout: config.renderTimeout || 300000,
      onProgress: (progress) => {
        const percent = Math.round(progress * 100);
        if (percent % 10 === 0) {
          console.log(`  Rendering: ${percent}% complete`);
        }
      },
      logLevel: 'info'
    });

    cleanupNeeded = false;
    console.log(`Video rendered successfully: ${outputPath}`);
    return outputPath;

  } catch (error) {
    console.error('Video rendering failed:', error.message);
    throw new Error(`Rendering failed: ${error.message}`);
  } finally {
    if (cleanupNeeded) {
      await cleanupTempFiles(tempDir);
    }
  }
}

/**
 * Get numeric quality value from quality string
 */
function getQualityValue(quality) {
  const qualityMap = {
    'high': 90,
    'medium': 70,
    'low': 50
  };
  return qualityMap[quality] || 70;
}

/**
 * Generate all necessary composition files
 */
async function generateCompositionFiles(bundleDir, spec, config, voiceoverFilename) {
  const resolution = RESOLUTIONS[config.resolution || '1080p'] || RESOLUTIONS['1080p'];
  const fps = config.fps || DEFAULT_FPS;
  const durationInFrames = Math.round((spec.duration || 60) * fps);

  // Create package.json for the bundle
  const packageJson = {
    name: 'agentfactory-video-composition',
    version: '1.0.0',
    private: true,
    dependencies: {
      'react': '^18.2.0',
      'react-dom': '^18.2.0',
      'remotion': '^4.0.0'
    }
  };

  // Create main index.js entry point with proper Composition registration
  const indexJs = `
import { registerRoot, Composition } from 'remotion';
import { MainComposition } from './MainComposition';

const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="AgentFactoryDemo"
        component={MainComposition}
        durationInFrames={${durationInFrames}}
        fps={${fps}}
        width={${resolution.width}}
        height={${resolution.height}}
        defaultProps={{
          title: "${spec.title.replace(/"/g, '\\"')}",
          keyPoints: ${JSON.stringify(spec.keyPoints)},
          voiceoverFilename: ${voiceoverFilename ? `"${voiceoverFilename}"` : 'null'},
          branding: ${JSON.stringify(spec.branding || config.branding || {})}
        }}
      />
    </>
  );
};

registerRoot(RemotionRoot);
`;

  // Create the main composition component
  const mainComposition = generateMainComposition(spec, config, resolution, fps, voiceoverFilename);

  // Write all files
  await fs.writeFile(
    path.join(bundleDir, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );
  await fs.writeFile(path.join(bundleDir, 'index.js'), indexJs);
  // Use .jsx extension for React components
  await fs.writeFile(path.join(bundleDir, 'MainComposition.jsx'), mainComposition);
}

/**
 * Generate the main composition React component
 */
/**
 * Generate the main composition React component
 */
function generateMainComposition(spec, config, resolution, fps) {
  const { title, keyPoints = [], story, script } = spec;
  const durationInSeconds = spec.duration || 60;
  const totalFrames = durationInSeconds * fps;

  // Use voiceover segments if available for perfect sync
  let voiceoverSegments = script?.voiceover?.segments || [];
  
  // If no segments, create a fallback segment
  if (voiceoverSegments.length === 0) {
    voiceoverSegments = [{ section: 'intro', text: title }];
  }

  // Count words to distribute duration proportionally
  const countWords = (text) => text ? text.split(/\s+/).filter(w => w.length > 0).length : 0;
  const totalWords = voiceoverSegments.reduce((acc, s) => acc + countWords(s.text), 0);

  // Distribute frames proportionally to each segment
  let currentFrame = 0;
  const synchronizedSegments = voiceoverSegments.map((s, idx) => {
    const sectionWords = countWords(s.text);
    // Last segment takes remaining frames to avoid rounding gaps
    let sectionFrames = idx === voiceoverSegments.length - 1 
      ? totalFrames - currentFrame 
      : Math.floor(totalFrames * (sectionWords / totalWords));
    
    // Ensure minimum duration for any segment
    sectionFrames = Math.max(fps * 1.5, sectionFrames);
    
    const segment = { ...s, from: currentFrame, duration: sectionFrames };
    currentFrame += sectionFrames;
    return segment;
  });

  // Re-normalize if we exceeded totalFrames due to Math.max
  const actualTotalFrames = synchronizedSegments.reduce((acc, s) => acc + s.duration, 0);
  if (actualTotalFrames > totalFrames) {
    // This is fine, Remotion will just render a longer video if needed
  }

  // Group segments for UI slides
  const introSegment = synchronizedSegments.find(s => s.section === 'intro');
  const problemSegment = synchronizedSegments.find(s => s.section === 'problem');
  const bodyIntroSegment = synchronizedSegments.find(s => s.section === 'body-intro');
  const pointSegments = synchronizedSegments.filter(s => s.section === 'body-point');
  const benefitSegment = synchronizedSegments.find(s => s.section === 'benefit');
  const conclusionSegment = synchronizedSegments.find(s => s.section === 'conclusion');

  // Generate subtitle sequences
  const subtitleSequences = synchronizedSegments.map(s => `
    <Sequence from={${s.from}} durationInFrames={${s.duration}}>
      <Subtitles text="${escapeJsxString(s.text)}" />
    </Sequence>`).join('');

  // Generate slide sequences based on segments
  let introFrames = (introSegment?.duration || 0) + (problemSegment?.duration || 0);
  if (bodyIntroSegment) introFrames += bodyIntroSegment.duration;

  let problemSequence = '';
  if (problemSegment) {
    problemSequence = `
        <Sequence from={${problemSegment.from}} durationInFrames={${problemSegment.duration}}>
          <ProblemSlide text="${escapeJsxString(problemSegment.text)}" />
        </Sequence>`;
  }

  const keyPointSequences = pointSegments.map((s, idx) => {
    const text = s.originalPoint || s.text;
    return `
      <Sequence from={${s.from}} durationInFrames={${s.duration}}>
        <KeyPointSlide point="${escapeJsxString(text)}" index={${idx + 1}} totalPoints={${pointSegments.length}} />
      </Sequence>`;
  }).join('\n');

  let benefitSequence = '';
  if (benefitSegment) {
    benefitSequence = `
        <Sequence from={${benefitSegment.from}} durationInFrames={${benefitSegment.duration}}>
          <BenefitSlide text="${escapeJsxString(benefitSegment.text)}" />
        </Sequence>`;
  }

  return `
import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, interpolate, Easing, Audio, staticFile } from 'remotion';

// Main composition exported for Remotion
export const MainComposition = ({ title, keyPoints = [], voiceoverFilename, branding = {} }) => {
  const brandName = branding.name || 'AgentFactory';
  const brandWebsite = branding.website || 'agentfactory.panaversity.org';
  const primaryColor = branding.primaryColor || '#2563eb';
  const showBranding = branding.showBranding !== false;

  return (
    <AbsoluteFill style={{ backgroundColor: '#ffffff' }}>
      {/* Branded gradient background */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        }}
      />
      
      {/* Header with logo */}
      {showBranding && <Header name={brandName} website={brandWebsite} color={primaryColor} />}

      {/* Voiceover audio */}
      {voiceoverFilename && <Audio src={staticFile(\`assets/\${voiceoverFilename}\`)} />}
      
      {/* Main content area */}
      <AbsoluteFill style={{ paddingTop: showBranding ? 80 : 0 }}>
        {/* Introduction */}
        <Sequence from={0} durationInFrames={${introFrames}}>
          <IntroSlide title="${escapeJsxString(title)}" showBranding={showBranding} brandName={brandName} />
        </Sequence>
        
        {/* Problem Section (V2.0) */}
        ${problemSequence}
        
        {/* Key points (Body) */}
        ${keyPointSequences}
        
        {/* Benefit Section (V2.0) */}
        ${benefitSequence}
        
        {/* Conclusion */}
        <Sequence from={${conclusionSegment?.from || 0}} durationInFrames={${conclusionSegment?.duration || totalFrames}}>
          <ConclusionSlide showBranding={showBranding} brandWebsite={brandWebsite} primaryColor={primaryColor} />
        </Sequence>
      </AbsoluteFill>

      {/* Subtitles Overlay */}
      ${subtitleSequences}
    </AbsoluteFill>
  );
};

// Subtitle component for synchronized text
const Subtitles = ({ text }) => {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 60,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          color: '#facc15', // High contrast yellow
          padding: '4px 12px',
          borderRadius: 4,
          fontSize: 22,
          fontWeight: '500',
          textAlign: 'center',
          maxWidth: '85%',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
          lineHeight: 1.3,
        }}
      >
        {text}
      </div>
    </div>
  );
};

// Header component with branding
const Header = ({ name, website, color }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 30], [0, 1], { clamp: true });
  
  return (
    <div
      style={{
        position: 'absolute',
        top: 20,
        left: 20,
        right: 20,
        height: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        opacity,
      }}
    >
      <div
        style={{
          fontSize: 28,
          fontWeight: 'bold',
          color: color,
          letterSpacing: '-0.5px',
        }}
      >
        {name}
      </div>
      <div
        style={{
          fontSize: 14,
          color: '#64748b',
        }}
      >
        {website}
      </div>
    </div>
  );
};

// Introduction slide component
const IntroSlide = ({ title, showBranding, brandName }) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, 20], [0.9, 1], {
    easing: Easing.out(Easing.cubic),
  });
  const opacity = interpolate(frame, [0, 15], [0, 1]);
  
  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        transform: \`scale(\${scale})\`,
      }}
    >
      <div
        style={{
          fontSize: 56,
          fontWeight: 'bold',
          color: '#1e293b',
          textAlign: 'center',
          padding: '0 80px',
          opacity,
          lineHeight: 1.2,
        }}
      >
        {title}
      </div>
      {showBranding && (
        <div
          style={{
            position: 'absolute',
            bottom: 150, // Moved up to clear subtitles
            fontSize: 20,
            color: '#64748b',
            opacity: interpolate(frame, [10, 25], [0, 1]),
          }}
        >
          Powered by {brandName}
        </div>
      )}
    </AbsoluteFill>
  );
};

// Problem slide component (V2.0)
const ProblemSlide = ({ text }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 20], [0, 1]);
  
  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1e293b',
        padding: '0 100px',
        opacity,
      }}
    >
      <div
        style={{
          fontSize: 42,
          color: '#f8fafc',
          textAlign: 'center',
          fontWeight: '500',
          lineHeight: 1.4,
        }}
      >
        <span style={{ color: '#ef4444', fontWeight: 'bold' }}>The Challenge:</span><br/>
        {text}
      </div>
    </AbsoluteFill>
  );
};

// Key point slide component
const KeyPointSlide = ({ point, index, totalPoints }) => {
  const frame = useCurrentFrame();
  const slideIn = interpolate(frame, [0, 15], [50, 0], { clamp: true });
  const opacity = interpolate(frame, [0, 10], [0, 1], { clamp: true });
  
  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0 60px',
      }}
    >
      <div
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: 16,
          padding: '40px 50px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
          maxWidth: '85%',
          transform: \`translateY(\${slideIn}px)\`,
          opacity,
        }}
      >
        <div
          style={{
            fontSize: 18,
            color: '#2563eb',
            fontWeight: '600',
            marginBottom: 16,
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}
        >
          Step {index} of {totalPoints}
        </div>
        <div
          style={{
            fontSize: 36,
            color: '#1e293b',
            lineHeight: 1.4,
            fontWeight: '500',
          }}
        >
          {point}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Benefit slide component (V2.0)
const BenefitSlide = ({ text }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 20], [0, 1]);
  const scale = interpolate(frame, [0, 30], [0.95, 1.05], { extrapolateRight: 'clamp' });
  
  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #2563eb 0%, #174ed1 100%)',
        padding: '0 100px',
        opacity,
      }}
    >
      <div
        style={{
          fontSize: 48,
          color: 'white',
          textAlign: 'center',
          fontWeight: 'bold',
          lineHeight: 1.3,
          transform: \`scale(\${scale})\`,
        }}
      >
        <div style={{ color: '#60a5fa', fontSize: 24, marginBottom: 20 }}>THE VALUE</div>
        {text}
      </div>
    </AbsoluteFill>
  );
};

// Conclusion slide component
const ConclusionSlide = ({ showBranding, brandWebsite, primaryColor }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 20], [0, 1]);
  const translateY = interpolate(frame, [0, 20], [30, 0], { clamp: true });
  
  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          textAlign: 'center',
          opacity,
          transform: \`translateY(\${translateY}px)\`,
        }}
      >
        <div
          style={{
            fontSize: 42,
            fontWeight: 'bold',
            color: primaryColor,
            marginBottom: 20,
          }}
        >
          Ready to Get Started?
        </div>
        {showBranding && (
          <div
            style={{
              fontSize: 24,
              color: '#64748b',
              marginBottom: 40,
            }}
          >
            Visit {brandWebsite}
          </div>
        )}
        <div
          style={{
            display: 'inline-block',
            padding: '16px 32px',
            backgroundColor: primaryColor,
            color: 'white',
            fontSize: 20,
            fontWeight: '600',
            borderRadius: 8,
          }}
        >
          Get Started Now
        </div>
      </div>
    </AbsoluteFill>
  );
};

export default MainComposition;
`;
}

/**
 * Escape special characters for safe JSX string interpolation
 */
function escapeJsxString(str) {
  if (!str) return '';
  return String(str)
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r');
}

/**
 * Clean up temporary files
 */
async function cleanupTempFiles(tempDir) {
  try {
    await fs.rm(tempDir, { recursive: true, force: true });
  } catch (error) {
    console.warn('Warning: Failed to clean up temp files:', error.message);
  }
}

module.exports = { renderVideo };
