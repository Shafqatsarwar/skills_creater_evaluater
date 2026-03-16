// Script Generator for Video Generator Agent
// Creates narrative scripts for demo videos based on specifications

/**
 * Video type configurations for different content styles
 */
const VIDEO_TYPE_CONFIGS = {
  'tutorial': {
    introRatio: 0.1,
    conclusionRatio: 0.1,
    tone: 'instructional',
    structure: 'step-by-step',
    pacing: 'moderate'
  },
  'feature-walkthrough': {
    introRatio: 0.15,
    conclusionRatio: 0.15,
    tone: 'informative',
    structure: 'feature-focused',
    pacing: 'moderate'
  },
  'product-overview': {
    introRatio: 0.2,
    conclusionRatio: 0.2,
    tone: 'engaging',
    structure: 'benefit-focused',
    pacing: 'brisk'
  },
  'case-study': {
    introRatio: 0.15,
    conclusionRatio: 0.2,
    tone: 'storytelling',
    structure: 'problem-solution',
    pacing: 'varied'
  },
  'default': {
    introRatio: 0.15,
    conclusionRatio: 0.15,
    tone: 'professional',
    structure: 'logical',
    pacing: 'moderate'
  }
};

const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Brand voice guidelines for AgentFactory
 */
const BRAND_VOICE = {
  name: 'AgentFactory',
  website: 'agentfactory.panaversity.org',
  primaryColor: '#2563eb',
  tone: 'professional yet approachable',
  keyMessages: [
    'Simplify agent development',
    'Production-ready solutions',
    'Developer-friendly platform'
  ]
};

// Initialize Gemini API if key is available
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || "AIzaSyB0vk95FKX5n1g9pf0lPoGoYpFuKwGr9ko";
let genAI = null;
if (GOOGLE_API_KEY && GOOGLE_API_KEY !== 'your_google_api_key_here') {
  genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
}

/**
 * Create a comprehensive script from video specification
 * @param {Object} specification - Video specification object
 * @returns {Object} Generated script with timing and voiceover
 */
async function createScript(specification) {
  const {
    title,
    description,
    keyPoints,
    duration = 60,
    targetAudience,
    videoType = 'default',
    story, // V2.0 Story block
    useAI = true
  } = specification;

  // Get configuration for video type
  const config = VIDEO_TYPE_CONFIGS[videoType] || VIDEO_TYPE_CONFIGS.default;

  // Try to enhance/generate story with Gemini if allowed and available
  let enhancedStory = story;
  if (useAI && genAI) {
    console.log('      Enhancing script with Gemini AI...');
    enhancedStory = await generateAIScript(specification);
  }

  // Calculate timing based on video type and presence of story components
  const timing = calculateTiming(duration, config, enhancedStory);

  // Generate script sections
  const script = {
    metadata: {
      title: title || 'AgentFactory Demo',
      videoType,
      targetAudience: targetAudience || 'Developers',
      estimatedDuration: duration,
      generatedAt: new Date().toISOString(),
      version: enhancedStory ? '2.0-AI' : '1.0'
    },
    structure: {
      introduction: generateIntroduction({ title, description, targetAudience, videoType, story: enhancedStory }, timing.intro),
      problem: enhancedStory && enhancedStory.problem ? {
        content: typeof enhancedStory.problem === 'string' ? enhancedStory.problem : enhancedStory.problem.text,
        duration: timing.problem || 0
      } : null,
      body: generateBody(keyPoints, timing.body, config.structure, enhancedStory),
      benefit: enhancedStory && enhancedStory.benefit ? {
        content: typeof enhancedStory.benefit === 'string' ? enhancedStory.benefit : enhancedStory.benefit.text,
        duration: timing.benefit || 0
      } : null,
      conclusion: generateConclusion({ title, videoType, targetAudience, story: enhancedStory }, timing.conclusion)
    },
    timing,
    voiceover: generateVoiceoverScript({ title, description, keyPoints, targetAudience, videoType, story: enhancedStory }),
    visualCues: generateVisualCues(keyPoints, config.structure, enhancedStory)
  };

  return script;
}

/**
 * Use Gemini to generate a narrative story block
 */
async function generateAIScript(spec) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
      Create a compelling video script story for a video with the following details:
      Title: ${spec.title}
      Description: ${spec.description}
      Key Points: ${spec.keyPoints.join(', ')}
      Target Audience: ${spec.targetAudience}
      Video Type: ${spec.videoType}

      Return a JSON object with the following fields:
      - hook: An engaging 1-sentence opening hook.
      - problem: A 2-sentence description of the problem this solves.
      - demo: A 2-sentence description of what will be shown.
      - benefit: A 2-sentence value proposition/benefit.
      - cta: A specific call to action.

      Make the tone professional and expert. Do not include any preamble, just the JSON.
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Clean up potential markdown formatting from JSON response
    const jsonStr = text.replace(/```json|```/g, '').trim();
    const aiStory = JSON.parse(jsonStr);

    return {
      ...spec.story,
      ...aiStory
    };
  } catch (error) {
    console.warn(`      Gemini AI enhancement failed: ${error.message}. Falling back to templates.`);
    return spec.story;
  }
}

/**
 * Calculate timing for each section based on duration and video type
 */
function calculateTiming(durationSeconds, config, story) {
  const totalMs = durationSeconds * 1000;

  // Base ratios
  let introRatio = config.introRatio;
  let conclusionRatio = config.conclusionRatio;

  // If story block is present, we need to accommodate problem and benefit
  let problemMs = 0;
  let benefitMs = 0;

  if (story) {
    if (story.problem) problemMs = (story.problem.duration || 7) * 1000;
    if (story.benefit) benefitMs = (story.benefit.duration || 20) * 1000;
  }

  const introMs = Math.floor(totalMs * introRatio);
  const conclusionMs = Math.floor(totalMs * conclusionRatio);
  const bodyMs = totalMs - introMs - conclusionMs - problemMs - benefitMs;

  return {
    total: totalMs,
    intro: introMs,
    problem: problemMs,
    body: bodyMs,
    benefit: benefitMs,
    conclusion: conclusionMs,
    introSeconds: (introMs / 1000).toFixed(1),
    problemSeconds: (problemMs / 1000).toFixed(1),
    bodySeconds: (bodyMs / 1000).toFixed(1),
    benefitSeconds: (benefitMs / 1000).toFixed(1),
    conclusionSeconds: (conclusionMs / 1000).toFixed(1)
  };
}

/**
 * Generate introduction section
 */
function generateIntroduction(context, timingMs) {
  const { title, description, targetAudience, videoType, story } = context;

  let hook = '';
  if (story && story.hook) {
    hook = typeof story.hook === 'string' ? story.hook : story.hook.text;
  } else {
    const hooks = {
      tutorial: `Welcome to this step-by-step tutorial on ${title}. By the end of this video, you'll have a clear understanding of ${description}.`,
      'feature-walkthrough': `Let's explore ${title} - a powerful feature that ${description}. This walkthrough will show you exactly how it works.`,
      'product-overview': `Discover how AgentFactory is transforming the way developers build AI agents. Today, we're diving into ${title}.`,
      'case-study': `See how developers are achieving remarkable results with AgentFactory. This case study examines ${title}.`,
      default: `Welcome to this demonstration of ${title}. We'll explore how ${description} using the AgentFactory platform.`
    };
    hook = hooks[videoType] || hooks.default;
  }

  return {
    hook,
    branding: 'AgentFactory - Empowering developers to build AI agents',
    duration: timingMs,
    keyMessage: `Learn how ${targetAudience || 'developers'} can leverage AgentFactory for ${description || title}`
  };
}

/**
 * Generate body sections from key points
 */
function generateBody(keyPoints = [], timingMs, structure) {
  if (!keyPoints || keyPoints.length === 0) {
    return [{
      title: 'Overview',
      content: 'This section covers the essential aspects of the topic.',
      duration: timingMs
    }];
  }

  const sections = [];
  const timePerSection = Math.floor(timingMs / keyPoints.length);

  keyPoints.forEach((point, index) => {
    let sectionTitle;
    let content;

    switch (structure) {
      case 'step-by-step':
        sectionTitle = `Step ${index + 1}: ${extractKeyAction(point)}`;
        content = `In this step, we'll ${point.toLowerCase()}. This is essential for building a complete solution.`;
        break;

      case 'feature-focused':
        sectionTitle = `Feature: ${capitalizeFirst(point)}`;
        content = `Let's examine this feature closely. ${point} - here's what makes it powerful and how you can use it.`;
        break;

      case 'benefit-focused':
        sectionTitle = `Benefit: ${extractBenefit(point)}`;
        content = `This means ${point.toLowerCase()}. Imagine the possibilities this opens up for your projects.`;
        break;

      case 'problem-solution':
        sectionTitle = `Insight ${index + 1}: ${summarizePoint(point)}`;
        content = `Here's what we observed: ${point}. This insight drives our approach to solving the challenge.`;
        break;

      default:
        sectionTitle = `Point ${index + 1}: ${capitalizeFirst(point)}`;
        content = `Let's cover this key point: ${point}. This is important for understanding the overall concept.`;
    }

    sections.push({
      title: sectionTitle,
      content,
      keyPoint: point,
      duration: timePerSection,
      order: index + 1
    });
  });

  return sections;
}

/**
 * Generate conclusion section
 */
function generateConclusion(context, timingMs) {
  const { title, videoType, targetAudience, story } = context;

  let summary = '';
  let callToAction = '';

  if (story && story.cta) {
    callToAction = typeof story.cta === 'string' ? story.cta : story.cta.text;
    summary = `That concludes our look at ${title}. ${callToAction}`;
  } else {
    const summaries = {
      tutorial: `You've now completed this tutorial on ${targetAudience || 'getting started'} with AgentFactory. Practice these steps to master the concepts.`,
      'feature-walkthrough': `That wraps up our walkthrough of this feature. You now have a solid understanding of how it works and when to use it.`,
      'product-overview': `AgentFactory provides everything you need to build production-ready AI agents. Start your journey today.`,
      'case-study': `This case study demonstrates the real-world impact of AgentFactory. The results speak for themselves.`,
      default: `That concludes our demonstration. You now have a clear understanding of the key concepts we've covered.`
    };
    summary = summaries[videoType] || summaries.default;
    callToAction = `Visit ${BRAND_VOICE.website} to start building your own AI agents today.`;
  }

  return {
    summary,
    callToAction,
    closing: `Thank you for watching. Join the AgentFactory community and start creating amazing AI-powered solutions.`,
    duration: timingMs,
    branding: {
      website: BRAND_VOICE.website,
      tagline: 'Build Your First Agent'
    }
  };
}

/**
 * Generate voiceover script for the entire video
 */
function generateVoiceoverScript(context) {
  const { title, description, keyPoints, targetAudience, videoType, story } = context;

  const segments = [];

  // Intro
  let introText = '';
  if (story && story.hook) {
    introText = typeof story.hook === 'string' ? story.hook : story.hook.text;
  } else {
    introText = `Welcome to AgentFactory. ${capitalizeFirst(description || title)}.`;
  }
  segments.push({ section: 'intro', text: introText });

  // Problem
  if (story && story.problem) {
    segments.push({ section: 'problem', text: typeof story.problem === 'string' ? story.problem : story.problem.text });
  }

  // Body
  if (keyPoints && keyPoints.length > 0) {
    const transition = story && story.problem ? "That's why we built this solution. " : "";
    let bodyIntro = `${transition}In this ${videoType === 'default' ? 'video' : videoType.replace('-', ' ')}, we'll cover ${keyPoints.length} key points:`;
    segments.push({ section: 'body-intro', text: bodyIntro });

    keyPoints.forEach((point, index) => {
      segments.push({ section: 'body-point', text: `${index + 1}. ${capitalizeFirst(point)}`, originalPoint: point });
    });
  }

  // Benefit
  if (story && story.benefit) {
    segments.push({ section: 'benefit', text: typeof story.benefit === 'string' ? story.benefit : story.benefit.text });
  }

  // Conclusion
  let conclusionText = '';
  if (story && story.cta) {
    conclusionText = typeof story.cta === 'string' ? story.cta : story.cta.text;
  } else {
    conclusionText = `That's how AgentFactory empowers ${targetAudience || 'developers'} to build sophisticated AI agents efficiently. Visit ${BRAND_VOICE.website} to get started today.`;
  }
  segments.push({ section: 'conclusion', text: conclusionText });

  const fullScript = segments.map(s => s.text).join('\n\n');

  return {
    full: fullScript,
    segments,
    estimatedWords: fullScript.split(/\s+/).length,
    estimatedSpeakingTime: estimateSpeakingTime(fullScript)
  };
}

/**
 * Generate visual cues for each section
 */
function generateVisualCues(keyPoints = [], structure) {
  const cues = [];

  // Intro visual
  cues.push({
    section: 'intro',
    type: 'title-card',
    description: 'Animated title with AgentFactory logo and gradient background'
  });

  // Body visuals
  keyPoints.forEach((point, index) => {
    cues.push({
      section: `body-${index + 1}`,
      type: 'content-slide',
      description: `Clean slide with step indicator and key point text`,
      highlight: extractKeywords(point)
    });
  });

  // Conclusion visual
  cues.push({
    section: 'conclusion',
    type: 'call-to-action',
    description: 'CTA with website URL and "Build Your First Agent" button'
  });

  return cues;
}

// Helper functions

function capitalizeFirst(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function extractKeyAction(point) {
  // Extract action verb from point (first word or first 3 words)
  const words = point.split(' ');
  return words.slice(0, Math.min(3, words.length)).join(' ');
}

function extractBenefit(point) {
  // Simplified benefit extraction
  return capitalizeFirst(point.split(' ').slice(0, 4).join(' ')) + '...';
}

function summarizePoint(point) {
  // Create a shorter summary of the point
  return capitalizeFirst(point.split(' ').slice(0, 5).join(' ')) + '...';
}

function extractKeywords(point) {
  // Extract potential keywords for highlighting
  const stopWords = ['the', 'a', 'an', 'is', 'are', 'to', 'for', 'with', 'and', 'or'];
  const words = point.toLowerCase().split(' ');
  return words.filter(w => w.length > 4 && !stopWords.includes(w)).slice(0, 3);
}

function estimateSpeakingTime(text) {
  // Average speaking rate: ~150 words per minute
  const wordCount = text.split(/\s+/).length;
  const seconds = Math.ceil((wordCount / 150) * 60);
  return {
    seconds,
    minutes: (seconds / 60).toFixed(1)
  };
}

module.exports = { createScript, VIDEO_TYPE_CONFIGS, BRAND_VOICE };
