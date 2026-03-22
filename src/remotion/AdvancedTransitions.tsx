import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useVideoConfig,
} from 'remotion';
import { TransitionPresentation, TransitionPresentationComponentProps } from '@remotion/transitions';

const ZoomBlur: React.FC<TransitionPresentationComponentProps<any>> = ({ children, presentationDirection, presentationProgress }) => {
  const progress = presentationProgress;

  if (presentationDirection === 'entering') {
    const scale = interpolate(progress, [0, 1], [0.5, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    const opacity = interpolate(progress, [0, 0.5], [0, 1]);
    const blur = interpolate(progress, [0, 1], [20, 0]);

    return (
      <AbsoluteFill
        style={{
          transform: `scale(${scale})`,
          opacity,
          filter: `blur(${blur}px)`,
        }}
      >
        {children}
      </AbsoluteFill>
    );
  }

  const scale = interpolate(progress, [0, 1], [1, 2], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const opacity = interpolate(progress, [0.5, 1], [1, 0]);
  const blur = interpolate(progress, [0, 1], [0, 40]);

  return (
    <AbsoluteFill
      style={{
        transform: `scale(${scale})`,
        opacity,
        filter: `blur(${blur}px)`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

export const zoomBlurPresentation = (): TransitionPresentation<any> => ({ component: ZoomBlur, props: {} });

const Glitch: React.FC<TransitionPresentationComponentProps<any>> = ({ children, presentationDirection, presentationProgress }) => {
  const progress = presentationProgress;
  const seed = Math.floor(progress * 100);
  const random = (s: number) => Math.sin(s * 12.9898 + 78.233) * 43758.5453123 % 1;

  if (presentationDirection === 'entering') {
    const opacity = interpolate(progress, [0, 0.1], [0, 1]);
    const offsetX = random(seed) * 20 * (1 - progress);
    const offsetY = random(seed + 1) * 20 * (1 - progress);
    
    return (
      <AbsoluteFill
        style={{
          opacity,
          transform: `translate(${offsetX}px, ${offsetY}px)`,
          filter: progress < 0.5 ? 'hue-rotate(90deg) contrast(200%)' : 'none',
        }}
      >
        {children}
      </AbsoluteFill>
    );
  }

  const opacity = interpolate(progress, [0.9, 1], [1, 0]);
  const offsetX = random(seed + 2) * 40 * progress;
  const offsetY = random(seed + 3) * 40 * progress;

  return (
    <AbsoluteFill
      style={{
        opacity,
        transform: `translate(${offsetX}px, ${offsetY}px)`,
        filter: progress > 0.5 ? 'hue-rotate(-90deg) invert(100%)' : 'none',
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

export const glitchPresentation = (): TransitionPresentation<any> => ({ component: Glitch, props: {} });

const PanBlur: React.FC<TransitionPresentationComponentProps<any>> = ({ children, presentationDirection, presentationProgress }) => {
  const { width } = useVideoConfig();
  const progress = presentationProgress;

  if (presentationDirection === 'entering') {
    const translateX = interpolate(progress, [0, 1], [width, 0]);
    const blur = interpolate(progress, [0, 0.5, 1], [20, 10, 0]);
    
    return (
      <AbsoluteFill
        style={{
          transform: `translateX(${translateX}px)`,
          filter: `blur(${blur}px)`,
        }}
      >
        {children}
      </AbsoluteFill>
    );
  }

  const translateX = interpolate(progress, [0, 1], [0, -width]);
  const blur = interpolate(progress, [0, 0.5, 1], [0, 10, 20]);

  return (
    <AbsoluteFill
      style={{
        transform: `translateX(${translateX}px)`,
        filter: `blur(${blur}px)`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

export const panBlurPresentation = (): TransitionPresentation<any> => ({ component: PanBlur, props: {} });

const SpinBlur: React.FC<TransitionPresentationComponentProps<any>> = ({ children, presentationDirection, presentationProgress }) => {
  const progress = presentationProgress;

  if (presentationDirection === 'entering') {
    const rotate = interpolate(progress, [0, 1], [180, 0]);
    const scale = interpolate(progress, [0, 1], [0.5, 1]);
    const blur = interpolate(progress, [0, 1], [20, 0]);
    
    return (
      <AbsoluteFill
        style={{
          transform: `rotate(${rotate}deg) scale(${scale})`,
          filter: `blur(${blur}px)`,
          opacity: interpolate(progress, [0, 0.2], [0, 1]),
        }}
      >
        {children}
      </AbsoluteFill>
    );
  }

  const rotate = interpolate(progress, [0, 1], [0, -180]);
  const scale = interpolate(progress, [0, 1], [1, 1.5]);
  const blur = interpolate(progress, [0, 1], [0, 40]);

  return (
    <AbsoluteFill
      style={{
        transform: `rotate(${rotate}deg) scale(${scale})`,
        filter: `blur(${blur}px)`,
        opacity: interpolate(progress, [0.8, 1], [1, 0]),
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

export const spinBlurPresentation = (): TransitionPresentation<any> => ({ component: SpinBlur, props: {} });

const ElasticZoom: React.FC<TransitionPresentationComponentProps<any>> = ({ children, presentationDirection, presentationProgress }) => {
  const progress = presentationProgress;

  if (presentationDirection === 'entering') {
    const s = spring({
      frame: progress * 30,
      fps: 30,
      config: { stiffness: 100, damping: 10 },
    });
    const scale = interpolate(s, [0, 1], [0, 1]);
    
    return (
      <AbsoluteFill style={{ transform: `scale(${scale})` }}>
        {children}
      </AbsoluteFill>
    );
  }

  const scale = interpolate(progress, [0, 1], [1, 2]);
  const opacity = interpolate(progress, [0.5, 1], [1, 0]);

  return (
    <AbsoluteFill style={{ transform: `scale(${scale})`, opacity }}>
      {children}
    </AbsoluteFill>
  );
};

export const elasticZoomPresentation = (): TransitionPresentation<any> => ({ component: ElasticZoom, props: {} });

const RGBSplit: React.FC<TransitionPresentationComponentProps<any>> = ({ children, presentationDirection, presentationProgress }) => {
  const progress = presentationProgress;
  const offset = interpolate(progress, [0, 0.5, 1], [0, 30, 0]);

  return (
    <AbsoluteFill style={{ opacity: presentationDirection === 'entering' ? progress : 1 - progress }}>
      <AbsoluteFill style={{ transform: `translateX(${offset}px)`, mixBlendMode: 'screen', opacity: 0.8 }}>
        <div style={{ filter: 'hue-rotate(120deg)' }}>{children}</div>
      </AbsoluteFill>
      <AbsoluteFill style={{ transform: `translateX(${-offset}px)`, mixBlendMode: 'screen', opacity: 0.8 }}>
        <div style={{ filter: 'hue-rotate(-120deg)' }}>{children}</div>
      </AbsoluteFill>
      <AbsoluteFill>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

export const rgbSplitPresentation = (): TransitionPresentation<any> => ({ component: RGBSplit, props: {} });

const Stretch: React.FC<TransitionPresentationComponentProps<any>> = ({ children, presentationDirection, presentationProgress }) => {
  const progress = presentationProgress;

  if (presentationDirection === 'entering') {
    const scaleX = interpolate(progress, [0, 1], [4, 1]);
    const opacity = interpolate(progress, [0, 0.2], [0, 1]);
    return (
      <AbsoluteFill style={{ transform: `scaleX(${scaleX})`, opacity }}>
        {children}
      </AbsoluteFill>
    );
  }

  const scaleX = interpolate(progress, [0, 1], [1, 0.1]);
  const opacity = interpolate(progress, [0.8, 1], [1, 0]);
  return (
    <AbsoluteFill style={{ transform: `scaleX(${scaleX})`, opacity }}>
      {children}
    </AbsoluteFill>
  );
};

export const stretchPresentation = (): TransitionPresentation<any> => ({ component: Stretch, props: {} });

const BloomFlash: React.FC<TransitionPresentationComponentProps<any>> = ({ children, presentationDirection, presentationProgress }) => {
  const progress = presentationProgress;
  const brightness = interpolate(progress, [0, 0.5, 1], [1, 10, 1]);
  const blur = interpolate(progress, [0, 0.5, 1], [0, 20, 0]);

  return (
    <AbsoluteFill style={{ 
      filter: `brightness(${brightness}) blur(${blur}px)`,
      opacity: presentationDirection === 'entering' ? progress : 1 - progress 
    }}>
      {children}
    </AbsoluteFill>
  );
};

export const bloomFlashPresentation = (): TransitionPresentation<any> => ({ component: BloomFlash, props: {} });

const WarpSpeed: React.FC<TransitionPresentationComponentProps<any>> = ({ children, presentationDirection, presentationProgress }) => {
  const progress = presentationProgress;

  if (presentationDirection === 'entering') {
    const scale = interpolate(progress, [0, 1], [2, 1]);
    const blur = interpolate(progress, [0, 1], [40, 0]);
    return (
      <AbsoluteFill style={{ transform: `scale(${scale})`, filter: `blur(${blur}px)` }}>
        {children}
      </AbsoluteFill>
    );
  }

  const scale = interpolate(progress, [0, 1], [1, 0.1]);
  const blur = interpolate(progress, [0, 1], [0, 40]);
  return (
    <AbsoluteFill style={{ transform: `scale(${scale})`, filter: `blur(${blur}px)` }}>
      {children}
    </AbsoluteFill>
  );
};

export const warpSpeedPresentation = (): TransitionPresentation<any> => ({ component: WarpSpeed, props: {} });

const Vortex: React.FC<TransitionPresentationComponentProps<any>> = ({ children, presentationDirection, presentationProgress }) => {
  const progress = presentationProgress;

  if (presentationDirection === 'entering') {
    const rotate = interpolate(progress, [0, 1], [720, 0]);
    const scale = interpolate(progress, [0, 1], [0, 1]);
    return (
      <AbsoluteFill style={{ transform: `rotate(${rotate}deg) scale(${scale})` }}>
        {children}
      </AbsoluteFill>
    );
  }

  const rotate = interpolate(progress, [0, 1], [0, -720]);
  const scale = interpolate(progress, [0, 1], [1, 0]);
  return (
    <AbsoluteFill style={{ transform: `rotate(${rotate}deg) scale(${scale})` }}>
      {children}
    </AbsoluteFill>
  );
};

export const vortexPresentation = (): TransitionPresentation<any> => ({ component: Vortex, props: {} });

const Liquid: React.FC<TransitionPresentationComponentProps<any>> = ({ children, presentationDirection, presentationProgress }) => {
  const progress = presentationProgress;
  const skewX = interpolate(progress, [0, 0.5, 1], [0, 45, 0]);
  const scale = interpolate(progress, [0, 0.5, 1], [1, 1.2, 1]);

  return (
    <AbsoluteFill style={{ 
      transform: `skewX(${skewX}deg) scale(${scale})`,
      opacity: presentationDirection === 'entering' ? progress : 1 - progress,
      filter: `blur(${interpolate(progress, [0, 0.5, 1], [0, 10, 0])}px)`
    }}>
      {children}
    </AbsoluteFill>
  );
};

export const liquidPresentation = (): TransitionPresentation<any> => ({ component: Liquid, props: {} });

const SlideUp: React.FC<TransitionPresentationComponentProps<any>> = ({ children, presentationDirection, presentationProgress }) => {
  const { height } = useVideoConfig();
  const progress = presentationProgress;

  if (presentationDirection === 'entering') {
    const translateY = interpolate(progress, [0, 1], [height, 0]);
    return (
      <AbsoluteFill style={{ transform: `translateY(${translateY}px)` }}>
        {children}
      </AbsoluteFill>
    );
  }

  const translateY = interpolate(progress, [0, 1], [0, -height]);
  return (
    <AbsoluteFill style={{ transform: `translateY(${translateY}px)` }}>
      {children}
    </AbsoluteFill>
  );
};

export const slideUpPresentation = (): TransitionPresentation<any> => ({ component: SlideUp, props: {} });

const Bounce: React.FC<TransitionPresentationComponentProps<any>> = ({ children, presentationDirection, presentationProgress }) => {
  const progress = presentationProgress;

  if (presentationDirection === 'entering') {
    const s = spring({
      frame: progress * 30,
      fps: 30,
      config: { stiffness: 200, damping: 10 },
    });
    const translateY = interpolate(s, [0, 1], [200, 0]);
    return (
      <AbsoluteFill style={{ transform: `translateY(${translateY}px)` }}>
        {children}
      </AbsoluteFill>
    );
  }

  const translateY = interpolate(progress, [0, 1], [0, -200]);
  const opacity = interpolate(progress, [0.8, 1], [1, 0]);
  return (
    <AbsoluteFill style={{ transform: `translateY(${translateY}px)`, opacity }}>
      {children}
    </AbsoluteFill>
  );
};

export const bouncePresentation = (): TransitionPresentation<any> => ({ component: Bounce, props: {} });

const Pixelate: React.FC<TransitionPresentationComponentProps<any>> = ({ children, presentationDirection, presentationProgress }) => {
  const progress = presentationProgress;
  const scale = interpolate(progress, [0, 0.5, 1], [1, 0.1, 1]);
  const blur = interpolate(progress, [0, 0.5, 1], [0, 10, 0]);
  
  return (
    <AbsoluteFill style={{ 
      transform: `scale(${1/scale})`,
      filter: `blur(${blur}px)`,
      opacity: presentationDirection === 'entering' ? progress : 1 - progress 
    }}>
      <AbsoluteFill style={{ transform: `scale(${scale})` }}>
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const pixelatePresentation = (): TransitionPresentation<any> => ({ component: Pixelate, props: {} });

const Swirl: React.FC<TransitionPresentationComponentProps<any>> = ({ children, presentationDirection, presentationProgress }) => {
  const progress = presentationProgress;
  const rotation = interpolate(progress, [0, 1], [presentationDirection === 'entering' ? 180 : 0, presentationDirection === 'entering' ? 0 : -180]);
  const scale = interpolate(progress, [0, 0.5, 1], [1, 0.2, 1]);
  
  return (
    <AbsoluteFill style={{ 
      transform: `rotate(${rotation}deg) scale(${scale})`,
      opacity: presentationDirection === 'entering' ? progress : 1 - progress 
    }}>
      {children}
    </AbsoluteFill>
  );
};

export const swirlPresentation = (): TransitionPresentation<any> => ({ component: Swirl, props: {} });

const CrossZoom: React.FC<TransitionPresentationComponentProps<any>> = ({ children, presentationDirection, presentationProgress }) => {
  const progress = presentationProgress;
  const scale = presentationDirection === 'entering' 
    ? interpolate(progress, [0, 1], [0.5, 1])
    : interpolate(progress, [0, 1], [1, 2]);
  const opacity = presentationDirection === 'entering' ? progress : 1 - progress;
  const blur = interpolate(progress, [0, 0.5, 1], [0, 20, 0]);

  return (
    <AbsoluteFill style={{ transform: `scale(${scale})`, opacity, filter: `blur(${blur}px)` }}>
      {children}
    </AbsoluteFill>
  );
};

export const crossZoomPresentation = (): TransitionPresentation<any> => ({ component: CrossZoom, props: {} });

const Cube: React.FC<TransitionPresentationComponentProps<any>> = ({ children, presentationDirection, presentationProgress }) => {
  const progress = presentationProgress;
  const { width } = useVideoConfig();
  
  if (presentationDirection === 'entering') {
    const rotateY = interpolate(progress, [0, 1], [90, 0]);
    const translateX = interpolate(progress, [0, 1], [width/2, 0]);
    return (
      <AbsoluteFill style={{ 
        transform: `perspective(1000px) translateX(${translateX}px) rotateY(${rotateY}deg)`,
        transformOrigin: 'left center',
        opacity: progress
      }}>
        {children}
      </AbsoluteFill>
    );
  }

  const rotateY = interpolate(progress, [0, 1], [0, -90]);
  const translateX = interpolate(progress, [0, 1], [0, -width/2]);
  return (
    <AbsoluteFill style={{ 
      transform: `perspective(1000px) translateX(${translateX}px) rotateY(${rotateY}deg)`,
      transformOrigin: 'right center',
      opacity: 1 - progress
    }}>
      {children}
    </AbsoluteFill>
  );
};

export const cubePresentation = (): TransitionPresentation<any> => ({ component: Cube, props: {} });

const Doom: React.FC<TransitionPresentationComponentProps<any>> = ({ children, presentationDirection, presentationProgress }) => {
  const progress = presentationProgress;
  const { height } = useVideoConfig();
  
  if (presentationDirection === 'entering') {
    return <AbsoluteFill style={{ opacity: progress }}>{children}</AbsoluteFill>;
  }

  const melt = interpolate(progress, [0, 1], [0, height]);
  return (
    <AbsoluteFill style={{ transform: `translateY(${melt}px)`, filter: `blur(${progress * 10}px)`, opacity: 1 - progress }}>
      {children}
    </AbsoluteFill>
  );
};

export const doomPresentation = (): TransitionPresentation<any> => ({ component: Doom, props: {} });

const DirectionalWipe: React.FC<TransitionPresentationComponentProps<any>> = ({ children, presentationDirection, presentationProgress }) => {
  const progress = presentationProgress;
  if (presentationDirection === 'entering') {
    return (
      <AbsoluteFill style={{ 
        clipPath: `inset(0 ${100 - progress * 100}% 0 0)`,
        zIndex: 1
      }}>
        {children}
      </AbsoluteFill>
    );
  }
  return <AbsoluteFill>{children}</AbsoluteFill>;
};

export const directionalWipePresentation = (): TransitionPresentation<any> => ({ component: DirectionalWipe, props: {} });

const RadialWipe: React.FC<TransitionPresentationComponentProps<any>> = ({ children, presentationDirection, presentationProgress }) => {
  const progress = presentationProgress;
  if (presentationDirection === 'entering') {
    return (
      <AbsoluteFill style={{ 
        clipPath: `circle(${progress * 150}% at 50% 50%)`,
        zIndex: 1
      }}>
        {children}
      </AbsoluteFill>
    );
  }
  return <AbsoluteFill>{children}</AbsoluteFill>;
};

export const radialWipePresentation = (): TransitionPresentation<any> => ({ component: RadialWipe, props: {} });

const HeartWipe: React.FC<TransitionPresentationComponentProps<any>> = ({ children, presentationDirection, presentationProgress }) => {
  const progress = presentationProgress;
  if (presentationDirection === 'entering') {
    // Using mask-image for better support and scaling
    return (
      <AbsoluteFill style={{ 
        WebkitMaskImage: `radial-gradient(circle at center, black ${progress * 100}%, transparent ${progress * 100}%)`,
        maskImage: `radial-gradient(circle at center, black ${progress * 100}%, transparent ${progress * 100}%)`,
        WebkitMaskSize: '100% 100%',
        maskSize: '100% 100%',
        zIndex: 1
      }}>
        {children}
      </AbsoluteFill>
    );
  }
  return <AbsoluteFill>{children}</AbsoluteFill>;
};

export const heartWipePresentation = (): TransitionPresentation<any> => ({ component: HeartWipe, props: {} });

const StarWipe: React.FC<TransitionPresentationComponentProps<any>> = ({ children, presentationDirection, presentationProgress }) => {
  const progress = presentationProgress;
  if (presentationDirection === 'entering') {
    return (
      <AbsoluteFill style={{ 
        clipPath: `polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)`,
        transform: `scale(${progress * 15})`,
        transformOrigin: 'center',
        zIndex: 1
      }}>
        {children}
      </AbsoluteFill>
    );
  }
  return <AbsoluteFill>{children}</AbsoluteFill>;
};

export const starWipePresentation = (): TransitionPresentation<any> => ({ component: StarWipe, props: {} });

const AngularWipe: React.FC<TransitionPresentationComponentProps<any>> = ({ children, presentationDirection, presentationProgress }) => {
  const progress = presentationProgress;
  if (presentationDirection === 'entering') {
    return (
      <AbsoluteFill style={{ 
        WebkitMaskImage: `conic-gradient(from 0deg at 50% 50%, black ${progress * 360}deg, transparent 0deg)`,
        maskImage: `conic-gradient(from 0deg at 50% 50%, black ${progress * 360}deg, transparent 0deg)`,
        zIndex: 1
      }}>
        {children}
      </AbsoluteFill>
    );
  }
  return <AbsoluteFill>{children}</AbsoluteFill>;
};

export const angularWipePresentation = (): TransitionPresentation<any> => ({ component: AngularWipe, props: {} });

