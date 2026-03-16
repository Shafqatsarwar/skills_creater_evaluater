---
name: remotion-best-practices-eval
description: Enhanced Best practices for Remotion with evaluation framework - Video creation in React
metadata:
  tags: remotion, video, react, animation, composition, evaluation
---

## When to use

Use this enhanced skill whenever you are dealing with Remotion code to obtain the domain-specific knowledge with evaluation of best practice adherence.

## Evaluation Framework

This skill includes an evaluation framework to assess how well your Remotion implementation follows best practices:

- **Code Quality Score**: Measures adherence to Remotion patterns
- **Performance Score**: Evaluates rendering efficiency
- **Accessibility Score**: Checks for accessibility considerations
- **Maintainability Score**: Assesses code organization and readability

## Captions Evaluation

When dealing with captions or subtitles, evaluate the implementation against accessibility standards. Load the [./rules/subtitles.md](./rules/subtitles.md) file for more information.

## FFmpeg Usage Evaluation

For video operations requiring FFmpeg, assess efficiency and correctness. Load the [./rules/ffmpeg.md](./rules/ffmpeg.md) file for more information.

## Audio Visualization Assessment

When implementing audio visualization, evaluate performance and visual appeal. Load the [./rules/audio-visualization.md](./rules/audio-visualization.md) file for more information.

## Sound Effects Evaluation

When using sound effects, assess appropriateness and implementation quality. Load the [./rules/sound-effects.md](./rules/sound-effects.md) file for more information.

## Best Practice Adherence Scoring

### Animation Best Practices (Animations.md)
- ✅ Use `useCurrentFrame()` for all animations
- ❌ CSS transitions/animations are forbidden
- ❌ Tailwind animation classes are forbidden
- Score: [0-100%] based on compliance

### Asset Management Best Practices
- ✅ Proper asset loading with error handling
- ✅ Optimization for performance
- Score: [0-100%] based on compliance

### Composition Structure Best Practices
- ✅ Proper composition definition
- ✅ Use of Sequences for timing
- ✅ Correct metadata calculation
- Score: [0-100%] based on compliance

## How to use

Read individual rule files for detailed explanations and code examples:

- [rules/3d.md](rules/3d.md) - 3D content in Remotion using Three.js and React Three Fiber
- [rules/animations.md](rules/animations.md) - Fundamental animation skills for Remotion
- [rules/assets.md](rules/assets.md) - Importing images, videos, audio, and fonts into Remotion
- [rules/audio.md](rules/audio.md) - Using audio and sound in Remotion - importing, trimming, volume, speed, pitch
- [rules/calculate-metadata.md](rules/calculate-metadata.md) - Dynamically set composition duration, dimensions, and props
- [rules/can-decode.md](rules/can-decode.md) - Check if a video can be decoded by the browser using Mediabunny
- [rules/charts.md](rules/charts.md) - Chart and data visualization patterns for Remotion (bar, pie, line, stock charts)
- [rules/compositions.md](rules/compositions.md) - Defining compositions, stills, folders, default props and dynamic metadata
- [rules/extract-frames.md](rules/extract-frames.md) - Extract frames from videos at specific timestamps using Mediabunny
- [rules/fonts.md](rules/fonts.md) - Loading Google Fonts and local fonts in Remotion
- [rules/get-audio-duration.md](rules/get-audio-duration.md) - Getting the duration of an audio file in seconds with Mediabunny
- [rules/get-video-dimensions.md](rules/get-video-dimensions.md) - Getting the width and height of a video file with Mediabunny
- [rules/get-video-duration.md](rules/get-video-duration.md) - Getting the duration of a video file in seconds with Mediabunny
- [rules/gifs.md](rules/gifs.md) - Displaying GIFs synchronized with Remotion's timeline
- [rules/images.md](rules/images.md) - Embedding images in Remotion using the Img component
- [rules/light-leaks.md](rules/light-leaks.md) - Light leak overlay effects using @remotion/light-leaks
- [rules/lottie.md](rules/lottie.md) - Embedding Lottie animations in Remotion
- [rules/measuring-dom-nodes.md](rules/measuring-dom-nodes.md) - Measuring DOM element dimensions in Remotion
- [rules/measuring-text.md](rules/measuring-text.md) - Measuring text dimensions, fitting text to containers, and checking overflow
- [rules/sequencing.md](rules/sequencing.md) - Sequencing patterns for Remotion - delay, trim, limit duration of items
- [rules/tailwind.md](rules/tailwind.md) - Using TailwindCSS in Remotion
- [rules/text-animations.md](rules/text-animations.md) - Typography and text animation patterns for Remotion
- [rules/timing.md](rules/timing.md) - Interpolation curves in Remotion - linear, easing, spring animations
- [rules/transitions.md](rules/transitions.md) - Scene transition patterns for Remotion
- [rules/transparent-videos.md](rules/transparent-videos.md) - Rendering out a video with transparency
- [rules/trimming.md](rules/trimming.md) - Trimming patterns for Remotion - cut the beginning or end of animations
- [rules/videos.md](rules/videos.md) - Embedding videos in Remotion - trimming, volume, speed, looping, pitch
- [rules/parameters.md](rules/parameters.md) - Make a video parametrizable by adding a Zod schema
- [rules/maps.md](rules/maps.md) - Add a map using Mapbox and animate it
- [rules/voiceover.md](rules/voiceover.md) - Adding AI-generated voiceover to Remotion compositions using ElevenLabs TTS

## Evaluation Process

### Pre-Implementation Check
Before writing Remotion code, evaluate your approach against:

1. **Architecture Score**: How well does the composition structure support the requirements?
2. **Performance Score**: Will the implementation render efficiently?
3. **Scalability Score**: How easily can the composition be extended?

### During Implementation
Monitor adherence to best practices in real-time:

- Animation patterns
- State management
- Component organization
- Performance considerations

### Post-Implementation Review
Evaluate the final implementation against:

- Code quality metrics
- Rendering performance
- Accessibility compliance
- Maintainability

## Assessment Templates

### Quick Best Practice Check
```
Animation Patterns: [PASS/FAIL] - Using useCurrentFrame()?
Asset Handling: [PASS/FAIL] - Proper error handling?
Performance: [PASS/FAIL] - No CSS animations?
Structure: [PASS/FAIL] - Proper Sequences used?
```

### Detailed Evaluation Report
```
Remotion Best Practices Assessment
==================================

Code Quality: __/100
- Animation patterns: __/25
- Asset management: __/25
- Composition structure: __/25
- Performance: __/25

Overall Score: __%

Recommendations:
1. [Specific improvement suggestion]
2. [Specific improvement suggestion]
3. [Specific improvement suggestion]
```