import React from 'react';
import { AbsoluteFill, Video, Sequence } from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { slide } from '@remotion/transitions/slide';
import { wipe } from '@remotion/transitions/wipe';
import { flip } from '@remotion/transitions/flip';
import { zoomBlurPresentation, glitchPresentation, panBlurPresentation, spinBlurPresentation, elasticZoomPresentation, rgbSplitPresentation, stretchPresentation, bloomFlashPresentation, warpSpeedPresentation, vortexPresentation, liquidPresentation, slideUpPresentation, bouncePresentation, pixelatePresentation, swirlPresentation, crossZoomPresentation, cubePresentation, doomPresentation, directionalWipePresentation, radialWipePresentation, heartWipePresentation, starWipePresentation, angularWipePresentation } from './AdvancedTransitions';

export interface TextOverlay {
  id: string;
  text: string;
  startFrame: number;
  durationInFrames: number;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontFamily?: string;
  strokeColor?: string;
  strokeWidth?: number;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffset?: { x: number, y: number };
  animation?: 'none' | 'fade' | 'slide' | 'zoom' | 'bounce';
}

export interface VideoClip {
  id: string;
  src: string;
  durationInFrames: number;
  startFrom?: number;
  playbackRate?: number;
  volume?: number;
  brightness?: number;
  contrast?: number;
  saturation?: number;
  blur?: number;
  hueRotate?: number;
  invert?: number;
  transitionType?: 'none' | 'fade' | 'slide' | 'wipe' | 'flip' | 'zoomBlur' | 'glitch' | 'panBlur' | 'spinBlur' | 'elasticZoom' | 'rgbSplit' | 'stretch' | 'bloomFlash' | 'warpSpeed' | 'vortex' | 'liquid' | 'slideUp' | 'bounce' | 'pixelate' | 'swirl' | 'crossZoom' | 'cube' | 'doom' | 'directionalWipe' | 'radialWipe' | 'heartWipe' | 'starWipe' | 'angularWipe';
  transitionDuration?: number;
}

export const MyComposition: React.FC<{ clips: VideoClip[], textOverlays?: TextOverlay[] }> = ({ clips, textOverlays = [] }) => {
  if (!clips || clips.length === 0) {
    return (
      <AbsoluteFill style={{ backgroundColor: 'black', justifyContent: 'center', alignItems: 'center' }}>
        <span style={{ color: 'white' }}>No clips selected</span>
      </AbsoluteFill>
    );
  }

  const getTransition = (type: string) => {
    switch (type) {
      case 'fade': return fade();
      case 'slide': return slide();
      case 'wipe': return wipe();
      case 'flip': return flip();
      case 'zoomBlur': return zoomBlurPresentation();
      case 'glitch': return glitchPresentation();
      case 'panBlur': return panBlurPresentation();
      case 'spinBlur': return spinBlurPresentation();
      case 'elasticZoom': return elasticZoomPresentation();
      case 'rgbSplit': return rgbSplitPresentation();
      case 'stretch': return stretchPresentation();
      case 'bloomFlash': return bloomFlashPresentation();
      case 'warpSpeed': return warpSpeedPresentation();
      case 'vortex': return vortexPresentation();
      case 'liquid': return liquidPresentation();
      case 'slideUp': return slideUpPresentation();
      case 'bounce': return bouncePresentation();
      case 'pixelate': return pixelatePresentation();
      case 'swirl': return swirlPresentation();
      case 'crossZoom': return crossZoomPresentation();
      case 'cube': return cubePresentation();
      case 'doom': return doomPresentation();
      case 'directionalWipe': return directionalWipePresentation();
      case 'radialWipe': return radialWipePresentation();
      case 'heartWipe': return heartWipePresentation();
      case 'starWipe': return starWipePresentation();
      case 'angularWipe': return angularWipePresentation();
      default: return null;
    }
  };

  return (
    <AbsoluteFill style={{ backgroundColor: 'black' }}>
      <TransitionSeries>
        {clips.flatMap((clip, index) => {
          const presentation = index < clips.length - 1 && clip.transitionType && clip.transitionType !== 'none'
            ? getTransition(clip.transitionType)
            : null;

          const sequence = (
            <TransitionSeries.Sequence key={`seq-${clip.id}`} durationInFrames={clip.durationInFrames}>
              <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ 
                  width: '100%',
                  height: '100%',
                  filter: `brightness(${clip.brightness || 1}) contrast(${clip.contrast || 1}) saturate(${clip.saturation || 1}) blur(${clip.blur || 0}px) hue-rotate(${clip.hueRotate || 0}deg) invert(${clip.invert || 0})`
                }}>
                  <Video 
                    src={clip.src} 
                    startFrom={clip.startFrom || 0}
                    playbackRate={clip.playbackRate || 1}
                    volume={clip.volume ?? 1}
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover' 
                    }} 
                  />
                </div>
              </AbsoluteFill>
            </TransitionSeries.Sequence>
          );

          if (presentation) {
            return [
              sequence,
              <TransitionSeries.Transition
                key={`trans-${clip.id}`}
                presentation={presentation as any}
                timing={linearTiming({ durationInFrames: clip.transitionDuration || 15 })}
              />
            ];
          }

          return [sequence];
        })}
      </TransitionSeries>

      {/* Text Overlays */}
      {textOverlays.map((overlay) => (
        <Sequence
          key={overlay.id}
          from={overlay.startFrame}
          durationInFrames={overlay.durationInFrames}
        >
          <div
            style={{
              position: 'absolute',
              left: `${overlay.x}%`,
              top: `${overlay.y}%`,
              fontSize: `${overlay.fontSize}px`,
              color: overlay.color,
              fontFamily: overlay.fontFamily || 'sans-serif',
              transform: 'translate(-50%, -50%)',
              textShadow: '0 2px 4px rgba(0,0,0,0.5)',
              whiteSpace: 'nowrap',
            }}
          >
            {overlay.text}
          </div>
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
