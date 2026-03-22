import React, { useState, useRef, useEffect, useMemo } from 'react';
import { trimVideo, cropVideo, concatenateVideos } from './services/ffmpegService';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, Play, Pause, Volume2, VolumeX, Maximize2, Video, Music, Settings, Download, X, BarChart2, Move, Sparkles, Type, Palette, Layers, Trash2, Plus, Save, FileJson, FileUp, Clock, Scissors, Crop } from 'lucide-react';
import { Rnd } from 'react-rnd';
import AudioMotionAnalyzer from 'audiomotion-analyzer';
import { Player } from '@remotion/player';
import { MyComposition } from './remotion/MyComposition';

const initialLyrics = [
  { time: 7, text: "I fuck on my classmate" },
  { time: 8.5, text: "I butter that bitch like a pancake" },
  { time: 10, text: "She jacking my dick call it handshake" },
  { time: 11.5, text: "Toot that ass up I ejaculate" },
  { time: 14, text: "I put that white on top" },
  { time: 15.5, text: "I don't mean to discriminate" },
  { time: 17, text: "I'm trying to penetrate" },
  { time: 18.5, text: "Keep the hoe out then I'm in the gate" },
  { time: 20, text: "Yeah, she know her pussy the best" },
  { time: 22, text: "I might just fuck her and cheat on her test" },
  { time: 23.5, text: "Niga' that pussy I'm leaving a mess" },
  { time: 25, text: "Pull out on the bitch and nut on the desk" },
  { time: 27, text: "Giving me brain she get a straight F" },
  { time: 28.5, text: "Gone on the bitch and I'm leaving like Jeff" },
  { time: 30, text: "Talk to my house she homework" },
  { time: 32, text: "Baby show me how that don't work" },
  { time: 33.5, text: "Yeah" },
  { time: 34, text: "[Skit] (Haha!)" },
  { time: 37, text: "This stupid bitch still don't understand" },
  { time: 40, text: "Bitch I'm just using you for homework" },
  { time: 42, text: "Why won't you just fucking leave?" },
  { time: 45, text: "Get out the fucking house hoe I hate you bitch" },
  { time: 48, text: "This bitch don't understand" },
  { time: 50, text: "I wish I could fly like Superman" },
  { time: 51.5, text: "Bitch I got bands on bands" },
  { time: 53, text: "Fuck on the hoes she say oh yeah yeah" },
  { time: 55, text: "You get high" },
  { time: 57, text: "Fuck a bunch of girls" },
  { time: 59, text: "And then cry" },
  { time: 61, text: "On top of the world" },
  { time: 63, text: "I hope you have the time of your life" },
  { time: 67, text: "I hope you don't lose it tonight" },
  { time: 72, text: "" }
];

const LyricWord = ({ word, index, textColorTheme, highlightColorTheme, fontAnimation }: { key?: string | number, word: string, index: number, textColorTheme: string, highlightColorTheme: string, fontAnimation: string }) => {
  const isHighlight = word.toLowerCase().includes('bitch') || word.toLowerCase().includes('fuck') || word.toLowerCase().includes('pussy');
  
  return (
    <motion.span
      initial={{ opacity: 0, y: 30, rotateX: -90 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ 
        delay: index * 0.08, 
        duration: 0.4, 
        type: "spring",
        stiffness: 200,
        damping: 10
      }}
      className={`inline-block mr-[0.25em] ${isHighlight ? `liquid-glass-text-highlight ${highlightColorTheme}` : `liquid-glass-text ${textColorTheme}`} ${fontAnimation}`}
    >
      {word}
    </motion.span>
  );
};

export default function App() {
  const [videos, setVideos] = useState<{ 
    id: string, 
    src: string, 
    speed: number, 
    duration: number, 
    startFrom: number, 
    durationOverride: number | null,
    volume: number,
    brightness: number,
    contrast: number,
    saturation: number,
    blur: number,
    hueRotate: number,
    invert: number,
    transitionType: 'none' | 'fade' | 'slide' | 'wipe' | 'flip' | 'zoomBlur' | 'glitch' | 'panBlur' | 'spinBlur' | 'elasticZoom' | 'rgbSplit' | 'stretch' | 'bloomFlash' | 'warpSpeed' | 'vortex' | 'liquid' | 'slideUp' | 'bounce' | 'pixelate' | 'swirl' | 'crossZoom' | 'cube' | 'doom' | 'directionalWipe' | 'radialWipe' | 'heartWipe' | 'starWipe' | 'angularWipe';
    transitionDuration: number
  }[]>([]);
  const [textOverlays, setTextOverlays] = useState<{
    id: string,
    text: string,
    startFrame: number,
    durationInFrames: number,
    x: number,
    y: number,
    fontSize: number,
    color: string,
    fontFamily: string,
    strokeColor?: string,
    strokeWidth?: number,
    shadowColor?: string,
    shadowBlur?: number,
    shadowOffset?: { x: number, y: number },
    animation?: 'none' | 'fade' | 'slide' | 'zoom' | 'bounce'
  }[]>([]);
  const [remotionLoop, setRemotionLoop] = useState(true);
  const [projectName, setProjectName] = useState('Untitled Project');

  // Project Persistence
  useEffect(() => {
    const saved = localStorage.getItem('video_editor_project');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.videos) setVideos(data.videos);
        if (data.textOverlays) setTextOverlays(data.textOverlays);
        if (data.projectName) setProjectName(data.projectName);
      } catch (e) {
        console.error('Failed to load project', e);
      }
    }
  }, []);

  useEffect(() => {
    const projectData = {
      videos,
      textOverlays,
      projectName,
      lastSaved: new Date().toISOString()
    };
    localStorage.setItem('video_editor_project', JSON.stringify(projectData));
  }, [videos, projectName]);

  const exportProject = () => {
    const dataStr = JSON.stringify({ videos, textOverlays, projectName });
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `${projectName.replace(/\s+/g, '_')}_project.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importProject = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          if (data.videos) setVideos(data.videos);
          if (data.textOverlays) setTextOverlays(data.textOverlays);
          if (data.projectName) setProjectName(data.projectName);
        } catch (e) {
          alert('Invalid project file');
        }
      };
      reader.readAsText(file);
    }
  };

  const totalDuration = useMemo(() => {
    return videos.reduce((acc, v, idx) => {
      const rawDur = v.durationOverride || (v.duration - v.startFrom);
      const clipDur = isFinite(rawDur) ? (rawDur / (v.speed || 1)) : 0;
      const transDur = (idx < videos.length - 1 && v.transitionType && v.transitionType !== 'none') ? ((v.transitionDuration || 15) / 30) : 0;
      return acc + clipDur - transDur;
    }, 0);
  }, [videos]);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentLyricIndex, setCurrentLyricIndex] = useState(-1);
  const [isMuted, setIsMuted] = useState(false);

  // Customization State
  const [parsedLyrics, setParsedLyrics] = useState(initialLyrics);
  const [lyricsText, setLyricsText] = useState(() => initialLyrics.map(l => `${l.time}|${l.text}`).join('\n'));
  const [videoOpacity, setVideoOpacity] = useState(1);
  const [overlayDarkness, setOverlayDarkness] = useState(0);
  const [noiseOpacity, setNoiseOpacity] = useState(0.2);
  const [textSize, setTextSize] = useState(6);
  const [fontFamily, setFontFamily] = useState('font-display');
  const [isGeneratingLyrics, setIsGeneratingLyrics] = useState(false);
  const [lyricsPrompt, setLyricsPrompt] = useState('');

  const generateLyricsWithAI = async () => {
    if (!lyricsPrompt) return;
    setIsGeneratingLyrics(true);
    try {
      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Generate lyrics for a song based on this prompt: "${lyricsPrompt}". 
        Format the output as a list of timestamps and text, like this:
        7|Lyric text
        8.5|Next lyric text
        ...
        Return ONLY the formatted text, no other explanation.`,
      });
      
      const text = response.text;
      if (text) {
        setLyricsText(text.trim());
        const lines = text.trim().split('\n');
        const newLyrics = lines.map(line => {
          const [time, ...rest] = line.split('|');
          return { time: parseFloat(time), text: rest.join('|') };
        }).filter(l => !isNaN(l.time));
        setParsedLyrics(newLyrics);
      }
    } catch (error) {
      console.error('AI Generation failed', error);
      alert('Failed to generate lyrics. Please try again.');
    } finally {
      setIsGeneratingLyrics(false);
    }
  };
  const [fontAnimation, setFontAnimation] = useState('anim-shine');
  const [textColorTheme, setTextColorTheme] = useState('theme-white');
  const [highlightColorTheme, setHighlightColorTheme] = useState('highlight-red');
  const [radiantOverlay, setRadiantOverlay] = useState('none');
  const [glassRefraction, setGlassRefraction] = useState(0.05);
  const [glassFrost, setGlassFrost] = useState(5);
  const [glassBevel, setGlassBevel] = useState(0.1);
  const [videoFilter, setVideoFilter] = useState('none');
  const [brightness, setBrightness] = useState(1);
  const [contrast, setContrast] = useState(1);
  const [saturation, setSaturation] = useState(1);
  const [videoBlur, setVideoBlur] = useState(0);
  const [hueRotate, setHueRotate] = useState(0);
  const [invert, setInvert] = useState(0);
  const [mainPreviewMode, setMainPreviewMode] = useState<'single' | 'sequence'>('single');
  const [transitionType, setTransitionType] = useState<'none' | 'fade' | 'slide' | 'dissolve'>('none');
  const [activeTab, setActiveTab] = useState<'visuals' | 'videos' | 'remotion' | 'lyrics'>('visuals');
  const [editingOverlayId, setEditingOverlayId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  // Visualizer State
  const [visualizerType, setVisualizerType] = useState<'none' | 'audiomotion' | 'circular' | 'digital' | 'particles' | 'wave' | 'geometric' | 'y2k-wireframe' | 'metalheart-spikes' | 'y2k-grid' | 'metalheart-pulse' | 'y2k-glitch' | 'orbit' | 'spectrum' | 'bars-v2'>('none');
  const [visualizerColor, setVisualizerColor] = useState('#ff0000');
  const [visualizerOpacity, setVisualizerOpacity] = useState(0.8);
  const [visualizerPos, setVisualizerPos] = useState({ x: 20, y: 20 });
  const [visualizerSize, setVisualizerSize] = useState({ width: 300, height: 150 });
  const audioMotionRef = useRef<AudioMotionAnalyzer | null>(null);
  const visualizerCanvasRef = useRef<HTMLCanvasElement>(null);
  const customVisualizerReqRef = useRef<number | null>(null);
  const [modalConfig, setModalConfig] = useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm?: () => void;
    onSecondary?: () => void;
    confirmText?: string;
    secondaryText?: string;
    isAlert?: boolean;
  }>({ show: false, title: '', message: '' });
  
  // Store the recorder instance so we can stop it manually
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isRndReady, setIsRndReady] = useState(false);
  const [rndDefault, setRndDefault] = useState({ x: 0, y: 0, width: 800, height: 400 });

  useEffect(() => {
    setRndDefault({
      x: Math.max(0, (window.innerWidth - 800) / 2),
      y: Math.max(0, (window.innerHeight - 400) / 2),
      width: Math.min(800, window.innerWidth - 40),
      height: Math.min(400, window.innerHeight - 40),
    });
    setIsRndReady(true);
  }, []);

  const handleBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const newVideosPromises = files.map(async (file) => {
        const src = URL.createObjectURL(file as Blob);
        const duration = await new Promise<number>((resolve) => {
          const video = document.createElement('video');
          video.src = src;
          video.onloadedmetadata = () => resolve(video.duration);
        });
        return {
          id: Date.now().toString() + Math.random(),
          src,
          speed: 1,
          duration,
          startFrom: 0,
          durationOverride: null,
          volume: 1,
          brightness: 1,
          contrast: 1,
          saturation: 1,
          blur: 0,
          hueRotate: 0,
          invert: 0,
          transitionType: 'none',
          transitionDuration: 15
        };
      });
      const newVideos = await Promise.all(newVideosPromises);
      setVideos(prev => [...prev, ...newVideos]);
      if (!activeVideoId && newVideos.length > 0) setActiveVideoId(newVideos[0].id);
    }
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAudioFile(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleLyricUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setLyricsText(content);
        try {
          // Simple LRC or TXT parser
          const lines = content.split('\n');
          const newLyrics = lines.map(line => {
            // Check for LRC format [mm:ss.xx]
            const lrcMatch = line.match(/\[(\d+):(\d+\.\d+)\](.*)/);
            if (lrcMatch) {
              const mins = parseInt(lrcMatch[1]);
              const secs = parseFloat(lrcMatch[2]);
              return { time: mins * 60 + secs, text: lrcMatch[3].trim() };
            }
            // Check for custom pipe format time|text
            const pipeMatch = line.split('|');
            if (pipeMatch.length >= 2) {
              return { time: parseFloat(pipeMatch[0]) || 0, text: pipeMatch.slice(1).join('|').trim() };
            }
            return null;
          }).filter(Boolean) as {time: number, text: string}[];
          
          if (newLyrics.length > 0) {
            setParsedLyrics(newLyrics);
            showAlert("Lyrics Updated", `Successfully loaded ${newLyrics.length} lines.`);
          }
        } catch (err) {
          showAlert("Error", "Failed to parse lyric file. Use 'time|text' or '[mm:ss.xx]text' format.");
        }
      };
      reader.readAsText(file);
    }
  };

  const [isEffectInitialized, setIsEffectInitialized] = useState(false);

  // Visualizer Logic
  useEffect(() => {
    if (!audioRef.current || visualizerType === 'none') {
      if (audioMotionRef.current) {
        audioMotionRef.current.destroy();
        audioMotionRef.current = null;
      }
      if (customVisualizerReqRef.current) {
        cancelAnimationFrame(customVisualizerReqRef.current);
        customVisualizerReqRef.current = null;
      }
      return;
    }

    if (visualizerType === 'audiomotion' && visualizerCanvasRef.current) {
      if (!audioMotionRef.current) {
        audioMotionRef.current = new AudioMotionAnalyzer(visualizerCanvasRef.current, {
          source: audioRef.current,
          mode: 3,
          barSpace: 0.5,
          gradient: 'classic',
          bgAlpha: 0,
          colorMode: 'gradient',
        });
      }
    } else if ((visualizerType === 'circular' || visualizerType === 'digital') && visualizerCanvasRef.current) {
      const canvas = visualizerCanvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyzer = audioCtx.createAnalyser();
      const source = audioCtx.createMediaElementSource(audioRef.current);
      source.connect(analyzer);
      analyzer.connect(audioCtx.destination);
      analyzer.fftSize = 256;
      const bufferLength = analyzer.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const draw = () => {
        customVisualizerReqRef.current = requestAnimationFrame(draw);
        analyzer.getByteFrequencyData(dataArray);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = visualizerColor;
        ctx.globalAlpha = visualizerOpacity;

        if (visualizerType === 'circular') {
          const centerX = canvas.width / 2;
          const centerY = canvas.height / 2;
          const radius = Math.min(centerX, centerY) * 0.5;

          for (let i = 0; i < bufferLength; i++) {
            const barHeight = (dataArray[i] / 255) * radius;
            const angle = (i / bufferLength) * Math.PI * 2;
            const x1 = centerX + Math.cos(angle) * radius;
            const y1 = centerY + Math.sin(angle) * radius;
            const x2 = centerX + Math.cos(angle) * (radius + barHeight);
            const y2 = centerY + Math.sin(angle) * (radius + barHeight);

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.strokeStyle = visualizerColor;
            ctx.lineWidth = 2;
            ctx.stroke();
          }
        } else if (visualizerType === 'digital') {
          const barWidth = (canvas.width / bufferLength) * 2.5;
          let x = 0;

          for (let i = 0; i < bufferLength; i++) {
            const barHeight = (dataArray[i] / 255) * canvas.height;
            ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
            x += barWidth + 1;
          }
        } else if (visualizerType === 'particles') {
          // Simple particle system
          ctx.fillStyle = visualizerColor;
          for (let i = 0; i < bufferLength; i += 10) {
            const size = (dataArray[i] / 255) * 10;
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (visualizerType === 'wave') {
          ctx.beginPath();
          ctx.moveTo(0, canvas.height / 2);
          for (let i = 0; i < bufferLength; i++) {
            const x = (i / bufferLength) * canvas.width;
            const y = (canvas.height / 2) + (dataArray[i] - 128) * 2;
            ctx.lineTo(x, y);
          }
          ctx.strokeStyle = visualizerColor;
          ctx.lineWidth = 3;
          ctx.stroke();
        } else if (visualizerType === 'geometric') {
          const centerX = canvas.width / 2;
          const centerY = canvas.height / 2;
          const radius = (dataArray[0] / 255) * 100;
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
          ctx.strokeStyle = visualizerColor;
          ctx.lineWidth = 5;
          ctx.stroke();
        } else if (visualizerType === 'y2k-wireframe') {
          ctx.strokeStyle = visualizerColor;
          ctx.lineWidth = 2;
          for (let i = 0; i < bufferLength; i += 20) {
            const x = (i / bufferLength) * canvas.width;
            const y = (dataArray[i] / 255) * canvas.height;
            ctx.strokeRect(x, y, 50, 50);
          }
        } else if (visualizerType === 'metalheart-spikes') {
          ctx.fillStyle = visualizerColor;
          for (let i = 0; i < bufferLength; i += 10) {
            const angle = (i / bufferLength) * Math.PI * 2;
            const length = (dataArray[i] / 255) * 100;
            const x = canvas.width / 2 + Math.cos(angle) * length;
            const y = canvas.height / 2 + Math.sin(angle) * length;
            ctx.beginPath();
            ctx.moveTo(canvas.width / 2, canvas.height / 2);
            ctx.lineTo(x, y);
            ctx.stroke();
          }
        } else if (visualizerType === 'y2k-grid') {
          ctx.strokeStyle = visualizerColor;
          for (let i = 0; i < canvas.width; i += 50) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, canvas.height);
            ctx.stroke();
          }
        } else if (visualizerType === 'metalheart-pulse') {
          ctx.fillStyle = visualizerColor;
          const radius = (dataArray[0] / 255) * 200;
          ctx.beginPath();
          ctx.arc(canvas.width / 2, canvas.height / 2, radius, 0, Math.PI * 2);
          ctx.fill();
        } else if (visualizerType === 'y2k-glitch') {
          const sliceWidth = canvas.width / 10;
          for (let i = 0; i < 10; i++) {
            if (dataArray[i * 10] > 150) {
              const offset = (Math.random() - 0.5) * 20;
              ctx.drawImage(canvas, i * sliceWidth, 0, sliceWidth, canvas.height, i * sliceWidth + offset, 0, sliceWidth, canvas.height);
            }
          }
        } else if (visualizerType === 'orbit') {
          const centerX = canvas.width / 2;
          const centerY = canvas.height / 2;
          const time = Date.now() * 0.001;
          
          for (let i = 0; i < bufferLength; i += 4) {
            const v = dataArray[i] / 255;
            const angle = (i / bufferLength) * Math.PI * 2 + time;
            const dist = 100 + v * 150;
            const x = centerX + Math.cos(angle) * dist;
            const y = centerY + Math.sin(angle) * dist;
            
            ctx.beginPath();
            ctx.arc(x, y, v * 15, 0, Math.PI * 2);
            ctx.fillStyle = visualizerColor;
            ctx.fill();
            
            // Orbit lines
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(x, y);
            ctx.strokeStyle = visualizerColor;
            ctx.globalAlpha = v * 0.3;
            ctx.stroke();
          }
        } else if (visualizerType === 'spectrum') {
          const barWidth = canvas.width / bufferLength;
          for (let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] / 255;
            const h = v * canvas.height;
            const hue = (i / bufferLength) * 360;
            ctx.fillStyle = `hsla(${hue}, 80%, 50%, ${visualizerOpacity})`;
            ctx.fillRect(i * barWidth, canvas.height - h, barWidth - 1, h);
          }
        } else if (visualizerType === 'bars-v2') {
          const barWidth = (canvas.width / bufferLength) * 2;
          for (let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] / 255;
            const h = v * canvas.height * 0.8;
            const x = i * barWidth;
            
            const gradient = ctx.createLinearGradient(x, canvas.height, x, canvas.height - h);
            gradient.addColorStop(0, visualizerColor);
            gradient.addColorStop(1, '#ffffff');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            // Use rect since roundRect might not be available in all browsers
            ctx.rect(x, canvas.height - h, barWidth - 2, h);
            ctx.fill();
          }
        }
      };

      draw();

      return () => {
        if (customVisualizerReqRef.current) cancelAnimationFrame(customVisualizerReqRef.current);
        // source.disconnect(); // Be careful with disconnecting source, it might break playback
      };
    }
  }, [visualizerType, audioFile, visualizerColor, visualizerOpacity]);

  useEffect(() => {
    // liquidGL JS is removed in favor of CSS backdrop-filter fallback
    // which is more robust in this environment.
    setIsEffectInitialized(true);
  }, [videos.length, audioFile, isRndReady]);

  useEffect(() => {
    const canvases = document.querySelectorAll('canvas');
    canvases.forEach(c => {
      if (c.style.position === 'fixed' && c.style.zIndex === '9999') {
        c.className = videoFilter !== 'none' ? videoFilter : '';
      }
    });
  }, [videoFilter]);

  const showAlert = (title: string, message: string) => {
    setModalConfig({ show: true, title, message, isAlert: true, onConfirm: undefined });
  };

  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    setModalConfig({ show: true, title, message, onConfirm, isAlert: false });
  };

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current?.pause();
      videoRef.current?.pause();
    } else {
      audioRef.current?.play().catch(() => {});
      videoRef.current?.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying && mainPreviewMode === 'single') {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, activeVideoId, mainPreviewMode]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const time = audioRef.current.currentTime;
      setCurrentTime(time);
      
      const index = parsedLyrics.findIndex((lyric, i) => {
        const nextLyric = parsedLyrics[i + 1];
        return time >= lyric.time && (!nextLyric || time < nextLyric.time);
      });
      
      if (index !== currentLyricIndex) {
        setCurrentLyricIndex(index);
      }
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: "browser" },
        audio: true
      });
      
      let mimeType = 'video/webm';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/mp4';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = '';
        }
      }
      
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;
      const chunks: BlobPart[] = [];
      
      recorder.ondataavailable = e => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      
      recorder.onstop = () => {
        const actualMimeType = mimeType || 'video/mp4';
        const blob = new Blob(chunks, { type: actualMimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const ext = actualMimeType.includes('mp4') ? 'mp4' : 'webm';
        a.download = `custom-music-video.${ext}`;
        a.click();
        URL.revokeObjectURL(url);
        stream.getTracks().forEach(t => t.stop());
        setIsRecording(false);
        mediaRecorderRef.current = null;
      };

      recorder.start();
      setIsRecording(true);
      
      // Reset and play automatically
      if (audioRef.current && videoRef.current) {
        audioRef.current.currentTime = 0;
        videoRef.current.currentTime = 0;
        audioRef.current.play();
        videoRef.current.play();
        setIsPlaying(true);
        
        // Stop recording when audio ends
        audioRef.current.onended = () => {
          if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
          }
          setIsPlaying(false);
          if (document.fullscreenElement) {
            document.exitFullscreen();
          }
        };
      }
      
      // Auto fullscreen for better recording quality
      if (containerRef.current && !document.fullscreenElement) {
        await containerRef.current.requestFullscreen().catch(e => console.log("Fullscreen failed", e));
      }
      
    } catch (err: any) {
      console.error("Recording failed:", err);
      if (err.name === 'NotAllowedError' || err.message.includes('not allowed')) {
        showAlert("Permission Denied", "Permission to record screen was denied. Please allow screen sharing to export the video.");
      } else if (err.name === 'NotSupportedError') {
        showAlert("Not Supported", "Your browser does not support the required video format for recording.");
      } else {
        showAlert("Recording Error", `Failed to start recording: ${err.message || 'Unknown error'}`);
      }
      setIsRecording(false);
    }
  };

  const startInternalRecording = async () => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1280;
      canvas.height = 720;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("Canvas 2D not supported");

      const stream = canvas.captureStream(30);
      
      // Audio
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const dest = audioCtx.createMediaStreamDestination();
      
      const recordAudio = new Audio(audioFile!);
      recordAudio.crossOrigin = "anonymous";
      const source = audioCtx.createMediaElementSource(recordAudio);
      source.connect(dest);
      source.connect(audioCtx.destination);
      
      stream.addTrack(dest.stream.getAudioTracks()[0]);
      
      let mimeType = 'video/webm;codecs=vp8,opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/mp4';
          if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = '';
        }
      }
      
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;
      const chunks: BlobPart[] = [];
      
      recorder.ondataavailable = e => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      
      recorder.onstop = () => {
        const actualMimeType = mimeType || 'video/mp4';
        const blob = new Blob(chunks, { type: actualMimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const ext = actualMimeType.includes('mp4') ? 'mp4' : 'webm';
        a.download = `custom-music-video.${ext}`;
        a.click();
        URL.revokeObjectURL(url);
        stream.getTracks().forEach(t => t.stop());
        setIsRecording(false);
        mediaRecorderRef.current = null;
      };

      recorder.start();
      setIsRecording(true);
      
      recordAudio.play();
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play();
      }
      
      recordAudio.onended = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
        }
        setIsRecording(false);
      };

      const renderFrame = () => {
        if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') return;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 1. Draw Video with object-fit: cover logic
        if (videoRef.current) {
          ctx.save();
          ctx.globalAlpha = videoOpacity;
          
          // Apply Filter
          if (videoFilter !== 'none') {
            if (videoFilter === 'grayscale') ctx.filter = 'grayscale(100%)';
            else if (videoFilter === 'sepia') ctx.filter = 'sepia(100%)';
            else if (videoFilter === 'invert') ctx.filter = 'invert(100%)';
            else if (videoFilter === 'hue-rotate-90') ctx.filter = 'hue-rotate(90deg)';
            else if (videoFilter === 'hue-rotate-180') ctx.filter = 'hue-rotate(180deg)';
            else if (videoFilter === 'blur-sm') ctx.filter = 'blur(4px)';
            else if (videoFilter === 'contrast-150 saturate-200') ctx.filter = 'contrast(150%) saturate(200%)';
            else if (videoFilter === 'filter-y2k') ctx.filter = 'contrast(150%) saturate(150%) brightness(120%) hue-rotate(-10deg) sepia(20%)';
            else if (videoFilter === 'filter-frutiger') ctx.filter = 'saturate(200%) brightness(110%) contrast(110%)';
            else if (videoFilter === 'filter-metal') ctx.filter = 'grayscale(100%) contrast(200%) brightness(80%)';
            else if (videoFilter === 'filter-cyber') ctx.filter = 'hue-rotate(180deg) saturate(300%) contrast(120%) brightness(110%)';
            else if (videoFilter === 'filter-dream') ctx.filter = 'blur(2px) saturate(150%) brightness(120%) contrast(90%)';
            else if (videoFilter === 'radiant-1') ctx.filter = 'brightness(120%) contrast(110%) saturate(130%)';
            else if (videoFilter === 'radiant-2') ctx.filter = 'hue-rotate(45deg) brightness(110%)';
            else if (videoFilter === 'radiant-3') ctx.filter = 'sepia(30%) brightness(120%) contrast(110%)';
            else if (videoFilter === 'radiant-4') ctx.filter = 'invert(20%) sepia(20%) saturate(150%)';
            else if (videoFilter === 'radiant-5') ctx.filter = 'saturate(200%) brightness(120%)';
            else if (videoFilter === 'radiant-6') ctx.filter = 'contrast(150%) brightness(90%)';
            else if (videoFilter === 'radiant-7') ctx.filter = 'hue-rotate(270deg) saturate(200%)';
            else if (videoFilter === 'radiant-8') ctx.filter = 'blur(1px) brightness(130%)';
            else if (videoFilter === 'radiant-9') ctx.filter = 'sepia(50%) hue-rotate(300deg)';
            else if (videoFilter === 'radiant-10') ctx.filter = 'contrast(120%) brightness(110%) saturate(150%)';
          }

          const vRatio = videoRef.current.videoWidth / videoRef.current.videoHeight;
          const cRatio = canvas.width / canvas.height;
          let sx = 0, sy = 0, sw = videoRef.current.videoWidth, sh = videoRef.current.videoHeight;
          if (vRatio > cRatio) {
            sw = sh * cRatio;
            sx = (videoRef.current.videoWidth - sw) / 2;
          } else {
            sh = sw / cRatio;
            sy = (videoRef.current.videoHeight - sh) / 2;
          }
          if (sw > 0 && sh > 0) {
            ctx.drawImage(videoRef.current, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
          }
          ctx.restore();
        }

        // 1.5 Draw Radiant Overlay
        if (radiantOverlay !== 'none') {
          ctx.save();
          if (radiantOverlay === 'aurora') {
            const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            grad.addColorStop(0, 'rgba(255,0,0,0.3)');
            grad.addColorStop(0.5, 'rgba(0,255,0,0.3)');
            grad.addColorStop(1, 'rgba(0,0,255,0.3)');
            ctx.fillStyle = grad;
            ctx.globalCompositeOperation = 'screen';
          } else if (radiantOverlay === 'plasma') {
            const grad = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 0, canvas.width/2, canvas.height/2, canvas.width);
            grad.addColorStop(0, 'rgba(255,0,102,0.2)');
            grad.addColorStop(1, 'rgba(0,255,255,0.2)');
            ctx.fillStyle = grad;
            ctx.globalCompositeOperation = 'overlay';
          } else if (radiantOverlay === 'glitch') {
            ctx.fillStyle = 'rgba(0,0,0,0.1)';
            for (let i = 0; i < canvas.height; i += 4) {
              ctx.fillRect(0, i, canvas.width, 2);
            }
            ctx.globalCompositeOperation = 'overlay';
          } else if (radiantOverlay === 'glow') {
            const grad = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 0, canvas.width/2, canvas.height/2, canvas.width/2);
            grad.addColorStop(0, 'rgba(255,255,255,0.3)');
            grad.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.fillStyle = grad;
            ctx.globalCompositeOperation = 'screen';
          }
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.restore();
        }
        
        // 2. Draw WebGL Glass Canvas (liquidGL)
        let glCanvas: HTMLCanvasElement | null = null;
        document.querySelectorAll('canvas').forEach(c => {
          if (c.style.position === 'fixed' && c.style.zIndex === '9999') {
            glCanvas = c as HTMLCanvasElement;
          }
        });
        if (glCanvas) {
          ctx.drawImage(glCanvas, 0, 0, canvas.width, canvas.height);
        }
        
        // 3. Draw Glass Pane Overlay & Text
        const paneEl = document.querySelector('.liquid-glass-pane');
        if (paneEl) {
          const rect = paneEl.getBoundingClientRect();
          const scaleX = canvas.width / window.innerWidth;
          const scaleY = canvas.height / window.innerHeight;
          
          const x = rect.x * scaleX;
          const y = rect.y * scaleY;
          const w = rect.width * scaleX;
          const h = rect.height * scaleY;
          
          // Draw Tint & Border
          ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(x, y, w, h, 48 * scaleX);
          } else {
            ctx.rect(x, y, w, h);
          }
          ctx.fill();
          ctx.stroke();
          
          // Draw Text
          const currentTime = recordAudio.currentTime;
          const currentLyric = parsedLyrics.find((l, i) => {
            const next = parsedLyrics[i + 1];
            return currentTime >= l.time && (!next || currentTime < next.time);
          });
          
          if (currentLyric && currentLyric.text) {
            let fontName = 'sans-serif';
            if (fontFamily === 'font-display') fontName = 'Anton, sans-serif';
            else if (fontFamily === 'font-sans') fontName = 'Inter, sans-serif';
            else if (fontFamily === 'font-serif') fontName = '"Playfair Display", serif';
            else if (fontFamily === 'font-mono') fontName = '"JetBrains Mono", monospace';
            else if (fontFamily.includes('Space_Grotesk')) fontName = '"Space Grotesk", sans-serif';
            else if (fontFamily.includes('Cinzel')) fontName = 'Cinzel, serif';
            else if (fontFamily.includes('Dancing_Script')) fontName = '"Dancing Script", cursive';

            const fontSizePx = textSize * 16 * scaleY;
            ctx.font = `bold ${fontSizePx}px ${fontName}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            ctx.shadowColor = 'rgba(0,0,0,0.5)';
            ctx.shadowBlur = 20;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 10;
            
            const words = currentLyric.text.toUpperCase().split(' ');
            const maxWidth = w - 80 * scaleX;
            let lines: string[] = [];
            let currentLine = words[0] || '';
            
            for (let i = 1; i < words.length; i++) {
              const word = words[i];
              const width = ctx.measureText(currentLine + " " + word).width;
              if (width < maxWidth) {
                currentLine += " " + word;
              } else {
                lines.push(currentLine);
                currentLine = word;
              }
            }
            if (currentLine) lines.push(currentLine);
            
            const lineHeight = fontSizePx * 1.1;
            const startY = y + h / 2 - ((lines.length - 1) * lineHeight) / 2;
            
            lines.forEach((line, i) => {
              const hasHighlight = line.toLowerCase().includes('bitch') || line.toLowerCase().includes('fuck') || line.toLowerCase().includes('pussy');
              
              if (hasHighlight) {
                ctx.fillStyle = highlightColorTheme === 'highlight-red' ? '#ff4444' : 
                                highlightColorTheme === 'highlight-blue' ? '#4444ff' : 
                                highlightColorTheme === 'highlight-green' ? '#44ff44' : '#ffff44';
              } else {
                ctx.fillStyle = textColorTheme === 'theme-white' ? '#ffffff' :
                                textColorTheme === 'theme-black' ? '#000000' :
                                textColorTheme === 'theme-yellow' ? '#ffff00' : '#ff00ff';
              }
              
              ctx.fillText(line, x + w / 2, startY + i * lineHeight);
            });
            
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
          }
        }
        
        requestAnimationFrame(renderFrame);
      };
      
      renderFrame();
      
    } catch (err: any) {
      console.error("Internal recording failed:", err);
      showAlert("Recording Error", `Failed to start internal recording: ${err.message}`);
      setIsRecording(false);
    }
  };

  const handleRecordClick = () => {
    const isIframe = window !== window.parent;
    
    if (isIframe) {
      showConfirm(
        "New Tab Required",
        "Exporting video is restricted in this embedded preview.\n\nWould you like to open the app in a new tab now to enable exporting?",
        () => {
          window.open(window.location.href, '_blank');
          setModalConfig(prev => ({ ...prev, show: false }));
        }
      );
      return;
    }

    setModalConfig({
      show: true,
      title: "Choose Export Method",
      message: "Screen Share (Recommended): Highest quality, captures all visual effects perfectly.\n\nInternal Render (Fallback): Use this if screen sharing fails. Slightly lower quality text rendering.",
      isAlert: false,
      onConfirm: () => {
        setModalConfig(prev => ({ ...prev, show: false }));
        startRecording();
      },
      onSecondary: () => {
        setModalConfig(prev => ({ ...prev, show: false }));
        startInternalRecording();
      },
      confirmText: "Screen Share",
      secondaryText: "Internal Render"
    });
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  if (videos.length === 0 || !audioFile) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-6 font-sans">
        <div className="max-w-xl w-full space-y-8 bg-zinc-900/50 p-10 rounded-3xl border border-zinc-800/50 shadow-2xl backdrop-blur-xl">
          <div className="text-center space-y-3">
            <h1 className="text-4xl font-display uppercase tracking-wider text-white">Music Video Studio</h1>
            <p className="text-zinc-400 text-sm max-w-sm mx-auto">
              Upload the video clips from your chat to generate the interactive music video for "Classmate".
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                <Video className="w-4 h-4 text-red-500" />
                1. Background Loops (Upload multiple)
              </label>
              <label className={`flex flex-col items-center justify-center w-full h-36 border-2 ${videos.length > 0 ? 'border-red-500/50 bg-red-500/5' : 'border-zinc-700 border-dashed'} rounded-2xl cursor-pointer hover:bg-zinc-800/50 transition-all duration-300`}>
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className={`w-8 h-8 mb-3 ${videos.length > 0 ? 'text-red-500' : 'text-zinc-500'}`} />
                  <p className="text-sm text-zinc-400 font-medium">
                    {videos.length > 0 ? `${videos.length} videos loaded ✓` : "Select background video(s)"}
                  </p>
                </div>
                <input type="file" accept="video/*" className="hidden" onChange={handleBgUpload} multiple />
              </label>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                <Music className="w-4 h-4 text-blue-500" />
                2. Audio Track (The lyric video)
              </label>
              <label className={`flex flex-col items-center justify-center w-full h-36 border-2 ${audioFile ? 'border-blue-500/50 bg-blue-500/5' : 'border-zinc-700 border-dashed'} rounded-2xl cursor-pointer hover:bg-zinc-800/50 transition-all duration-300`}>
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className={`w-8 h-8 mb-3 ${audioFile ? 'text-blue-500' : 'text-zinc-500'}`} />
                  <p className="text-sm text-zinc-400 font-medium">
                    {audioFile ? "Audio loaded ✓" : "Select audio/lyric video"}
                  </p>
                </div>
                <input type="file" accept="video/*,audio/*" className="hidden" onChange={handleAudioUpload} />
              </label>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full h-screen bg-black overflow-hidden font-sans group">
      {/* Background Video */}
      {mainPreviewMode === 'single' ? (
        <video
          ref={videoRef}
          src={videos.find(v => v.id === activeVideoId)?.src}
          crossOrigin="anonymous"
          className={`absolute top-0 left-0 object-cover transition-opacity duration-300 ${videoFilter === 'none' ? 'upscale-4k' : videoFilter}`}
          style={{ 
            width: 'calc(100% - 1px)', 
            height: 'calc(100% - 1px)', 
            opacity: videoOpacity,
            filter: `brightness(${brightness}) contrast(${contrast}) saturate(${saturation}) blur(${videoBlur}px) hue-rotate(${hueRotate}deg) invert(${invert})`
          }}
          muted
          playsInline
          loop
          onLoadedMetadata={(e) => {
            const v = e.target as HTMLVideoElement;
            v.playbackRate = videos.find(vid => vid.id === activeVideoId)?.speed || 1;
            if (isPlaying) v.play().catch(() => {});
          }}
        />
      ) : (
        <div className="absolute inset-0 pointer-events-none">
          <Player
            component={MyComposition}
            inputProps={{ 
              clips: videos.map((v, idx) => {
                const rawDur = v.durationOverride || (v.duration - v.startFrom) || 0.1;
                const speed = v.speed || 1;
                const transDurFrames = (idx < videos.length - 1 && v.transitionType && v.transitionType !== 'none') ? (v.transitionDuration || 15) : 0;
                // Ensure clip duration is at least transition duration + 1 frame
                const durationInFrames = Math.max(transDurFrames + 1, Math.floor((rawDur / speed) * 30));
                
                return {
                  id: v.id,
                  src: v.src,
                  durationInFrames,
                  startFrom: Math.floor((v.startFrom || 0) * 30),
                  playbackRate: speed,
                  volume: v.volume ?? 1,
                  brightness: v.brightness ?? 1,
                  contrast: v.contrast ?? 1,
                  saturation: v.saturation ?? 1,
                  blur: v.blur ?? 0,
                  hueRotate: v.hueRotate ?? 0,
                  invert: v.invert ?? 0,
                  transitionType: v.transitionType || 'none',
                  transitionDuration: v.transitionDuration || 15
                };
              })
            }}
            durationInFrames={Math.max(1, Math.floor(videos.reduce((acc, v, idx) => {
              const rawDur = v.durationOverride || (v.duration - v.startFrom);
              const clipDur = isFinite(rawDur) ? (rawDur / (v.speed || 1)) : 0.1;
              const transDur = (idx < videos.length - 1 && v.transitionType && v.transitionType !== 'none') ? ((v.transitionDuration || 15) / 30) : 0;
              return acc + clipDur - transDur;
            }, 0) * 30))}
            compositionWidth={1920}
            compositionHeight={1080}
            fps={30}
            style={{
              width: '100%',
              height: '100%',
              opacity: videoOpacity,
              filter: `brightness(${brightness}) contrast(${contrast}) saturate(${saturation}) blur(${videoBlur}px) hue-rotate(${hueRotate}deg) invert(${invert})`
            }}
            loop={remotionLoop}
            playing={isPlaying}
            autoPlay={isPlaying}
            muted
          />
        </div>
      )}
      
      {/* Audio Source */}
      <audio
        ref={audioRef}
        src={audioFile}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => {
          setIsPlaying(false);
          videoRef.current?.pause();
        }}
      />

      {/* Visual Effects Overlay - Adjustable Darkness */}
      <div 
        className="absolute inset-0 pointer-events-none transition-colors duration-300" 
        style={{ backgroundColor: `rgba(0,0,0,${overlayDarkness})` }} 
      />
      <div 
        className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${radiantOverlay !== 'none' ? `radiant-${radiantOverlay}` : ''}`}
      />
      <div 
        className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay pointer-events-none transition-opacity duration-300" 
        style={{ opacity: noiseOpacity }}
      />

      {/* Lyrics Display */}
      {isRndReady && (
        <Rnd
          default={rndDefault}
          minWidth={300}
          minHeight={200}
          bounds="parent"
          cancel=".no-drag"
          onDrag={() => {
            const renderer = (window as any).__liquidGLRenderer__;
            if (renderer) renderer.lenses.forEach((l: any) => l.updateMetrics());
          }}
          onResize={() => {
            const renderer = (window as any).__liquidGLRenderer__;
            if (renderer) renderer.lenses.forEach((l: any) => l.updateMetrics());
          }}
          className="z-10 pointer-events-auto"
        >
          <div 
            className="liquid-glass-pane w-full h-full p-10 rounded-[3rem] flex items-center justify-center border border-white/10 bg-white/5 relative group cursor-move select-none"
            style={{
              backdropFilter: `blur(${glassFrost}px)`,
              WebkitBackdropFilter: `blur(${glassFrost}px)`,
            }}
          >
            {/* Drag Handle Indicator */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-16 h-2 bg-white/20 group-hover:bg-white/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none" />
            
            <AnimatePresence mode="wait">
              {currentLyricIndex >= 0 && parsedLyrics[currentLyricIndex]?.text && (
                <motion.div
                  key={currentLyricIndex}
                  initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
                  transition={{ duration: 0.3 }}
                  className="text-center w-full"
                >
                  <h2 
                    className={`${fontFamily} uppercase flex flex-wrap justify-center leading-[0.85]`}
                    style={{ fontSize: `${textSize}rem`, textShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                  >
                    {parsedLyrics[currentLyricIndex].text.split(' ').map((word, i) => (
                      <LyricWord key={`${currentLyricIndex}-${i}`} word={word} index={i} textColorTheme={textColorTheme} highlightColorTheme={highlightColorTheme} fontAnimation={fontAnimation} />
                    ))}
                  </h2>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Rnd>
      )}

      {/* Draggable Audio Visualizer */}
      {visualizerType !== 'none' && (
        <Rnd
          size={visualizerSize}
          position={visualizerPos}
          onDragStop={(e, d) => setVisualizerPos({ x: d.x, y: d.y })}
          onResizeStop={(e, direction, ref, delta, position) => {
            setVisualizerSize({ width: parseInt(ref.style.width), height: parseInt(ref.style.height) });
            setVisualizerPos(position);
          }}
          bounds="parent"
          className="z-20 pointer-events-auto"
        >
          <div className="w-full h-full relative group">
            <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-move">
              <Move className="w-4 h-4 text-white/50" />
            </div>
            <canvas 
              ref={visualizerCanvasRef} 
              className="w-full h-full"
              width={visualizerSize.width}
              height={visualizerSize.height}
            />
          </div>
        </Rnd>
      )}

      {/* Top Right Controls (Settings & Record) */}
      {!isRecording ? (
        <div className="absolute top-0 right-0 p-6 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-40">
          <button 
            onClick={() => setIsSettingsOpen(true)} 
            className="p-3 bg-zinc-900/80 hover:bg-zinc-800 text-white rounded-full backdrop-blur-md transition-all shadow-xl border border-white/10"
            title="Settings & Customization"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button 
            onClick={handleRecordClick} 
            className="flex items-center gap-2 px-5 py-3 bg-red-600/90 hover:bg-red-500 text-white rounded-full backdrop-blur-md transition-all font-medium text-sm shadow-xl border border-red-400/20"
            title="Record and Save Video"
          >
            <Download className="w-4 h-4" />
            Export Video
          </button>
        </div>
      ) : (
        <div className="absolute top-0 right-0 p-6 flex gap-3 z-40">
          <div className="flex items-center gap-2 px-4 py-2 bg-black/50 backdrop-blur-md rounded-full border border-red-500/30 text-red-500 animate-pulse">
            <div className="w-3 h-3 bg-red-500 rounded-full" />
            <span className="text-sm font-medium">Recording...</span>
          </div>
          <button 
            onClick={handleStopRecording} 
            className="flex items-center gap-2 px-5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-full backdrop-blur-md transition-all font-medium text-sm shadow-xl border border-white/10"
          >
            Stop & Save
          </button>
        </div>
      )}

      {/* Playback Controls Overlay */}
      {!isRecording && (
        <div className="absolute bottom-0 inset-x-0 p-8 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-30">
          <div className="max-w-5xl mx-auto flex items-center gap-8">
            <button
              onClick={togglePlay}
              className="w-16 h-16 flex items-center justify-center bg-white text-black rounded-full hover:scale-110 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.3)]"
            >
              {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
            </button>
            
            <div className="flex-1 h-3 bg-white/20 rounded-full overflow-hidden relative cursor-pointer backdrop-blur-sm"
                 onClick={(e) => {
                   if (audioRef.current) {
                     const rect = e.currentTarget.getBoundingClientRect();
                     const pos = (e.clientX - rect.left) / rect.width;
                     audioRef.current.currentTime = pos * audioRef.current.duration;
                   }
                 }}>
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-500 to-blue-500 shadow-[0_0_10px_rgba(255,0,0,0.5)]"
                style={{ width: `${(currentTime / (audioRef.current?.duration || 1)) * 100}%` }}
              />
            </div>

            <div className="flex items-center gap-4">
              <button onClick={toggleMute} className="text-white/70 hover:text-white transition-colors">
                {isMuted ? <VolumeX className="w-7 h-7" /> : <Volume2 className="w-7 h-7" />}
              </button>
              
              <button onClick={toggleFullscreen} className="text-white/70 hover:text-white transition-colors">
                <Maximize2 className="w-7 h-7" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Alert/Confirm Modal */}
      {modalConfig.show && (
        <div className="absolute inset-0 z-[99999] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-700 p-6 rounded-2xl max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-3">{modalConfig.title}</h3>
            <p className="text-zinc-300 mb-6 whitespace-pre-line leading-relaxed">{modalConfig.message}</p>
            <div className="flex justify-end gap-3">
              {!modalConfig.isAlert && !modalConfig.onSecondary && (
                <button
                  onClick={() => setModalConfig(prev => ({ ...prev, show: false }))}
                  className="px-4 py-2 rounded-lg text-zinc-300 hover:bg-zinc-800 transition-colors font-medium"
                >
                  Cancel
                </button>
              )}
              {modalConfig.onSecondary && (
                <button
                  onClick={modalConfig.onSecondary}
                  className="px-4 py-2 rounded-lg text-zinc-300 hover:bg-zinc-800 transition-colors font-medium border border-zinc-700"
                >
                  {modalConfig.secondaryText || 'Alternative'}
                </button>
              )}
              <button
                onClick={() => {
                  if (modalConfig.onConfirm) modalConfig.onConfirm();
                  else setModalConfig(prev => ({ ...prev, show: false }));
                }}
                className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium transition-colors shadow-lg shadow-red-500/20"
              >
                {modalConfig.confirmText || (modalConfig.isAlert ? 'OK' : 'Continue')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center p-4 md:p-8 backdrop-blur-md">
          <div className="bg-zinc-900 p-6 md:p-8 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-zinc-700 shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-display uppercase tracking-wider text-white">Customization</h2>
              <button onClick={() => setIsSettingsOpen(false)} className="text-zinc-400 hover:text-white transition-colors bg-zinc-800 p-2 rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex gap-4 mb-8 border-b border-zinc-800">
              <button 
                onClick={() => setActiveTab('visuals')}
                className={`pb-3 text-lg font-display uppercase tracking-wider transition-colors ${activeTab === 'visuals' ? 'text-white border-b-2 border-red-500' : 'text-zinc-500 hover:text-white'}`}
              >
                Visuals
              </button>
              <button 
                onClick={() => setActiveTab('videos')}
                className={`pb-3 text-lg font-display uppercase tracking-wider transition-colors ${activeTab === 'videos' ? 'text-white border-b-2 border-red-500' : 'text-zinc-500 hover:text-white'}`}
              >
                Videos
              </button>
              <button 
                onClick={() => setActiveTab('remotion')}
                className={`pb-3 text-lg font-display uppercase tracking-wider transition-colors ${activeTab === 'remotion' ? 'text-white border-b-2 border-red-500' : 'text-zinc-500 hover:text-white'}`}
              >
                Remotion
              </button>
              <button 
                onClick={() => setActiveTab('lyrics')}
                className={`pb-3 text-lg font-display uppercase tracking-wider transition-colors ${activeTab === 'lyrics' ? 'text-white border-b-2 border-red-500' : 'text-zinc-500 hover:text-white'}`}
              >
                Lyrics
              </button>
            </div>
                     {activeTab === 'lyrics' && (
              <div className="space-y-8">
                <div className="bg-zinc-950/50 p-8 rounded-3xl border border-zinc-800">
                  <h3 className="text-2xl font-display uppercase tracking-widest text-white mb-2 flex items-center gap-3">
                    <Sparkles className="text-red-500" /> AI Lyrics Generator
                  </h3>
                  <p className="text-zinc-500 text-sm mb-8">Describe your song's mood, theme, or story, and Gemini will generate timed lyrics for you.</p>
                  
                  <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <input 
                      type="text" 
                      placeholder="e.g. A high-energy synthwave track about racing through a neon city..."
                      value={lyricsPrompt}
                      onChange={(e) => setLyricsPrompt(e.target.value)}
                      className="flex-1 bg-zinc-900 border border-zinc-700 rounded-2xl px-6 py-4 text-white outline-none focus:border-red-500 transition-all shadow-inner"
                    />
                    <button 
                      onClick={generateLyricsWithAI}
                      disabled={isGeneratingLyrics || !lyricsPrompt}
                      className="px-10 py-4 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold rounded-2xl transition-all shadow-lg shadow-red-600/20 flex items-center justify-center gap-2"
                    >
                      {isGeneratingLyrics ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles size={18} />
                          Generate Lyrics
                        </>
                      )}
                    </button>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest">Raw Lyrics Editor</label>
                    <textarea
                      value={lyricsText}
                      onChange={(e) => {
                        setLyricsText(e.target.value);
                        const lines = e.target.value.split('\n');
                        const newLyrics = lines.map(line => {
                          const [time, ...rest] = line.split('|');
                          return { time: parseFloat(time), text: rest.join('|') };
                        }).filter(l => !isNaN(l.time));
                        setParsedLyrics(newLyrics);
                      }}
                      className="w-full h-64 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-zinc-300 font-mono text-sm focus:outline-none focus:border-red-500 transition-all"
                      placeholder="7|First line of lyrics&#10;12|Second line of lyrics..."
                    />
                    <p className="text-[10px] text-zinc-600 italic">Format: [seconds]|[text]. One line per lyric.</p>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'visuals' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Visual Settings */}
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-semibold text-white border-b border-zinc-800 pb-3 mb-6">Visuals</h3>
                    
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <label className="flex justify-between text-sm font-medium text-zinc-300">
                          <span>Audio Visualizer</span>
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <select 
                            value={visualizerType} 
                            onChange={(e) => setVisualizerType(e.target.value as any)}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                          >
                            <option value="none">None</option>
                            <option value="audiomotion">AudioMotion</option>
                            <option value="circular">Circular Wave</option>
                            <option value="digital">Digital Bars</option>
                            <option value="particles">Particles</option>
                            <option value="wave">Fluid Wave</option>
                            <option value="geometric">Geometric</option>
                            <option value="y2k-wireframe">Y2K Wireframe</option>
                            <option value="metalheart-spikes">Metalheart Spikes</option>
                            <option value="y2k-grid">Y2K Grid</option>
                            <option value="metalheart-pulse">Metalheart Pulse</option>
                            <option value="y2k-glitch">Y2K Glitch</option>
                            <option value="orbit">Cosmic Orbit</option>
                            <option value="spectrum">Spectrum Analyzer</option>
                            <option value="bars-v2">Modern Bars</option>
                          </select>
                          <input 
                            type="color" 
                            value={visualizerColor} 
                            onChange={(e) => setVisualizerColor(e.target.value)}
                            className="w-full h-full bg-zinc-800 border border-zinc-700 rounded-lg cursor-pointer"
                          />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <label className="flex justify-between text-sm font-medium text-zinc-300">
                          <span>Video Opacity</span>
                          <span className="text-zinc-500">{Math.round(videoOpacity * 100)}%</span>
                        </label>
                        <input type="range" min="0" max="1" step="0.05" value={videoOpacity} onChange={(e) => setVideoOpacity(parseFloat(e.target.value))} className="w-full accent-red-500" />
                      </div>

                      <div className="space-y-3">
                        <label className="flex justify-between text-sm font-medium text-zinc-300">
                          <span>Background Darkness</span>
                          <span className="text-zinc-500">{Math.round(overlayDarkness * 100)}%</span>
                        </label>
                        <input type="range" min="0" max="1" step="0.05" value={overlayDarkness} onChange={(e) => setOverlayDarkness(parseFloat(e.target.value))} className="w-full accent-red-500" />
                      </div>

                      <div className="space-y-3">
                        <label className="flex justify-between text-sm font-medium text-zinc-300">
                          <span>Noise Overlay Opacity</span>
                          <span className="text-zinc-500">{Math.round(noiseOpacity * 100)}%</span>
                        </label>
                        <input type="range" min="0" max="1" step="0.05" value={noiseOpacity} onChange={(e) => setNoiseOpacity(parseFloat(e.target.value))} className="w-full accent-red-500" />
                      </div>

                      <div className="space-y-3">
                        <label className="flex justify-between text-sm font-medium text-zinc-300">
                          <span>Video Filter</span>
                        </label>
                        <select 
                          value={videoFilter} 
                          onChange={(e) => setVideoFilter(e.target.value)}
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                        >
                          <option value="none">None</option>
                          <option value="grayscale">Grayscale</option>
                          <option value="sepia">Sepia</option>
                          <option value="invert">Invert</option>
                          <option value="hue-rotate-90">Hue Rotate 90°</option>
                          <option value="hue-rotate-180">Hue Rotate 180°</option>
                          <option value="blur-sm">Blur</option>
                          <option value="contrast-150 saturate-200">High Contrast & Saturation</option>
                          <option value="filter-y2k">Y2K (Vibrant & Contrast)</option>
                          <option value="filter-frutiger">Frutiger Aero (Glossy)</option>
                          <option value="filter-metal">Metalheart (Dark Mono)</option>
                          <option value="filter-cyber">Cyber (Neon Shift)</option>
                          <option value="filter-dream">Dreamy (Soft Glow)</option>
                          <option value="radiant-1">Radiant 1</option>
                          <option value="radiant-2">Radiant 2</option>
                          <option value="radiant-3">Radiant 3</option>
                          <option value="radiant-4">Radiant 4</option>
                          <option value="radiant-5">Radiant 5</option>
                          <option value="radiant-6">Radiant 6</option>
                          <option value="radiant-7">Radiant 7</option>
                          <option value="radiant-8">Radiant 8</option>
                          <option value="radiant-9">Radiant 9</option>
                          <option value="radiant-10">Radiant 10</option>
                        </select>
                      </div>

                      <div className="space-y-3">
                        <label className="flex justify-between text-sm font-medium text-zinc-300">
                          <span>Transition Effect</span>
                        </label>
                        <select 
                          value={transitionType} 
                          onChange={(e) => setTransitionType(e.target.value as any)}
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                        >
                          <option value="none">None</option>
                          <option value="fade">Fade</option>
                          <option value="slide">Slide</option>
                          <option value="dissolve">Dissolve</option>
                        </select>
                      </div>

                      <div className="space-y-3">
                        <label className="flex justify-between text-sm font-medium text-zinc-300">
                          <span>Radiant Overlay</span>
                        </label>
                        <select 
                          value={radiantOverlay} 
                          onChange={(e) => setRadiantOverlay(e.target.value)}
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                        >
                          <option value="none">None</option>
                          <option value="aurora">Radiant Aurora</option>
                          <option value="plasma">Radiant Plasma</option>
                          <option value="glitch">Radiant Glitch</option>
                          <option value="glow">Radiant Glow</option>
                        </select>
                      </div>

                      <div className="space-y-3">
                        <label className="flex justify-between text-sm font-medium text-zinc-300">
                          <span>Glass Refraction</span>
                          <span className="text-zinc-500">{glassRefraction.toFixed(3)}</span>
                        </label>
                        <input type="range" min="0" max="0.2" step="0.005" value={glassRefraction} onChange={(e) => setGlassRefraction(parseFloat(e.target.value))} className="w-full accent-red-500" />
                      </div>

                      <div className="space-y-3">
                        <label className="flex justify-between text-sm font-medium text-zinc-300">
                          <span>Brightness</span>
                          <span className="text-zinc-500">{Math.round(brightness * 100)}%</span>
                        </label>
                        <input type="range" min="0" max="2" step="0.05" value={brightness} onChange={(e) => setBrightness(parseFloat(e.target.value))} className="w-full accent-red-500" />
                      </div>

                      <div className="space-y-3">
                        <label className="flex justify-between text-sm font-medium text-zinc-300">
                          <span>Contrast</span>
                          <span className="text-zinc-500">{Math.round(contrast * 100)}%</span>
                        </label>
                        <input type="range" min="0" max="2" step="0.05" value={contrast} onChange={(e) => setContrast(parseFloat(e.target.value))} className="w-full accent-red-500" />
                      </div>

                      <div className="space-y-3">
                        <label className="flex justify-between text-sm font-medium text-zinc-300">
                          <span>Saturation</span>
                          <span className="text-zinc-500">{Math.round(saturation * 100)}%</span>
                        </label>
                        <input type="range" min="0" max="2" step="0.05" value={saturation} onChange={(e) => setSaturation(parseFloat(e.target.value))} className="w-full accent-red-500" />
                      </div>

                      <div className="space-y-3">
                        <label className="flex justify-between text-sm font-medium text-zinc-300">
                          <span>Video Blur</span>
                          <span className="text-zinc-500">{videoBlur}px</span>
                        </label>
                        <input type="range" min="0" max="20" step="1" value={videoBlur} onChange={(e) => setVideoBlur(parseFloat(e.target.value))} className="w-full accent-red-500" />
                      </div>

                      <div className="space-y-3">
                        <label className="flex justify-between text-sm font-medium text-zinc-300">
                          <span>Hue Rotate</span>
                          <span className="text-zinc-500">{hueRotate}°</span>
                        </label>
                        <input type="range" min="0" max="360" step="1" value={hueRotate} onChange={(e) => setHueRotate(parseFloat(e.target.value))} className="w-full accent-red-500" />
                      </div>

                      <div className="space-y-3">
                        <label className="flex justify-between text-sm font-medium text-zinc-300">
                          <span>Invert</span>
                          <span className="text-zinc-500">{Math.round(invert * 100)}%</span>
                        </label>
                        <input type="range" min="0" max="1" step="0.05" value={invert} onChange={(e) => setInvert(parseFloat(e.target.value))} className="w-full accent-red-500" />
                      </div>

                      <div className="space-y-3">
                        <label className="flex justify-between text-sm font-medium text-zinc-300">
                          <span>Main Preview Mode</span>
                        </label>
                        <div className="flex bg-zinc-900 rounded-lg p-1">
                          <button 
                            onClick={() => setMainPreviewMode('single')}
                            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${mainPreviewMode === 'single' ? 'bg-red-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                          >
                            Single Video
                          </button>
                          <button 
                            onClick={() => setMainPreviewMode('sequence')}
                            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${mainPreviewMode === 'sequence' ? 'bg-red-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                          >
                            Remotion Sequence
                          </button>
                        </div>
                        <p className="text-[10px] text-zinc-500 mt-1">
                          {mainPreviewMode === 'single' ? 'Shows the currently selected active video.' : 'Shows the full sequenced composition from the Remotion tab.'}
                        </p>
                      </div>

                      <div className="space-y-3">
                        <label className="flex justify-between text-sm font-medium text-zinc-300">
                          <span>Glass Frost</span>
                          <span className="text-zinc-500">{glassFrost}</span>
                        </label>
                        <input type="range" min="0" max="20" step="1" value={glassFrost} onChange={(e) => setGlassFrost(parseFloat(e.target.value))} className="w-full accent-red-500" />
                      </div>

                      <div className="space-y-3">
                        <label className="flex justify-between text-sm font-medium text-zinc-300">
                          <span>Glass Bevel</span>
                          <span className="text-zinc-500">{glassBevel.toFixed(2)}</span>
                        </label>
                        <input type="range" min="0" max="0.5" step="0.01" value={glassBevel} onChange={(e) => setGlassBevel(parseFloat(e.target.value))} className="w-full accent-red-500" />
                      </div>

                      <div className="space-y-3">
                        <label className="flex justify-between text-sm font-medium text-zinc-300">
                          <span>Text Size</span>
                          <span className="text-zinc-500">{textSize}rem</span>
                        </label>
                        <input type="range" min="2" max="12" step="0.5" value={textSize} onChange={(e) => setTextSize(parseFloat(e.target.value))} className="w-full accent-red-500" />
                      </div>

                      <div className="space-y-3">
                        <label className="flex justify-between text-sm font-medium text-zinc-300">
                          <span>Font Family</span>
                        </label>
                        <select 
                          value={fontFamily} 
                          onChange={(e) => setFontFamily(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-sm text-zinc-300 focus:outline-none focus:border-red-500"
                        >
                          <option value="font-display">Anton (Display)</option>
                          <option value="font-sans">Inter (Sans)</option>
                          <option value="font-serif">Playfair Display (Serif)</option>
                          <option value="font-mono">JetBrains Mono (Monospace)</option>
                          <option value="font-metal">Metal Mania (Metallica)</option>
                          <option value="font-bubbly">Modak (Bubbly)</option>
                          <option value="font-y2k">Michroma (Y2K)</option>
                          <option value="font-futurism">Syncopate (Futurism)</option>
                          <option value="font-['Orbitron']">Orbitron (Cyber)</option>
                          <option value="font-['Syne']">Syne (Modern)</option>
                          <option value="font-['Cinzel']">Cinzel</option>
                          <option value="font-['Dancing_Script']">Dancing Script</option>
                        </select>
                      </div>

                      <div className="space-y-3">
                        <label className="flex justify-between text-sm font-medium text-zinc-300">
                          <span>Text Animation</span>
                        </label>
                        <select 
                          value={fontAnimation} 
                          onChange={(e) => setFontAnimation(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-sm text-zinc-300 focus:outline-none focus:border-red-500"
                        >
                          <option value="anim-shine">Shine (Gradient Sweep)</option>
                          <option value="anim-pulse-glow">Pulse Glow</option>
                          <option value="anim-float-text">Float</option>
                          <option value="anim-glitch">Glitch</option>
                          <option value="anim-bubbly">Bubbly Pulse</option>
                          <option value="anim-metallic">Metallic Flow</option>
                          <option value="anim-shake">Shake (Aggressive)</option>
                          <option value="anim-bounce">Bounce</option>
                          <option value="anim-rotate">Rotate</option>
                          <option value="anim-skew">Skew</option>
                          <option value="anim-zoom">Zoom</option>
                          <option value="anim-wave">Wave</option>
                          <option value="anim-rainbow">Rainbow Cycle</option>
                          <option value="anim-none">None</option>
                        </select>
                      </div>

                      <div className="space-y-3">
                        <label className="flex justify-between text-sm font-medium text-zinc-300">
                          <span>Text Color Theme</span>
                        </label>
                        <select 
                          value={textColorTheme} 
                          onChange={(e) => setTextColorTheme(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-sm text-zinc-300 focus:outline-none focus:border-red-500"
                        >
                          <option value="theme-white">White Glass</option>
                          <option value="theme-pink">Neon Pink</option>
                          <option value="theme-blue">Cyber Blue</option>
                          <option value="theme-gold">Liquid Gold</option>
                          <option value="theme-metallic">Metallic (Chrome)</option>
                          <option value="theme-frutiger">Frutiger Aero (Glass Blue)</option>
                        </select>
                      </div>

                      <div className="space-y-3">
                        <label className="flex justify-between text-sm font-medium text-zinc-300">
                          <span>Highlight Color Theme</span>
                        </label>
                        <select 
                          value={highlightColorTheme} 
                          onChange={(e) => setHighlightColorTheme(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-sm text-zinc-300 focus:outline-none focus:border-red-500"
                        >
                          <option value="highlight-red">Blood Red</option>
                          <option value="highlight-green">Toxic Green</option>
                          <option value="highlight-purple">Deep Purple</option>
                          <option value="highlight-orange">Blaze Orange</option>
                          <option value="highlight-blue">Electric Blue</option>
                          <option value="highlight-pink">Hot Pink</option>
                          <option value="highlight-gold">Pure Gold</option>
                          <option value="highlight-white">Pure White</option>
                          <option value="highlight-cyan">Cyan Blast</option>
                          <option value="highlight-magenta">Magenta Magic</option>
                          <option value="highlight-yellow">Yellow Flash</option>
                        </select>
                      </div>

                      <div className="pt-6 border-t border-zinc-800 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-zinc-400">Effect Status</span>
                          <span className={`text-xs px-2 py-1 rounded-full font-mono ${isEffectInitialized ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {isEffectInitialized ? 'ACTIVE' : 'INITIALIZING...'}
                          </span>
                        </div>
                        
                        {!(window as any).liquidGL && (
                          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                            <p className="text-[11px] text-red-400 leading-tight">
                              Critical: liquidGL library failed to load. Please check your internet connection or script sources in index.html.
                            </p>
                          </div>
                        )}

                        <button 
                          onClick={() => {
                            if ((window as any).glassEffect) {
                              (window as any).glassEffect = null;
                            }
                            setIsEffectInitialized(false);
                          }}
                          className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold rounded-lg transition-all border border-zinc-700 active:scale-95"
                        >
                          RE-INITIALIZE GLASS EFFECT
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lyrics Editor */}
                <div className="space-y-4">
                  <div className="flex justify-between items-end border-b border-zinc-800 pb-3 mb-6">
                    <h3 className="text-xl font-semibold text-white">Edit Lyrics</h3>
                    <label className="text-xs text-red-500 font-bold bg-red-500/10 px-3 py-1 rounded-full cursor-pointer hover:bg-red-500/20 transition-colors border border-red-500/20">
                      Upload .LRC / .TXT
                      <input type="file" accept=".lrc,.txt" className="hidden" onChange={handleLyricUpload} />
                    </label>
                  </div>
                  <textarea 
                    className="w-full h-[300px] bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-300 font-mono focus:outline-none focus:border-red-500 transition-colors resize-none leading-relaxed"
                    value={lyricsText}
                    onChange={(e) => {
                      setLyricsText(e.target.value);
                      try {
                        const newLyrics = e.target.value.split('\n').map(line => {
                          const parts = line.split('|');
                          if (parts.length >= 2) {
                            return { time: parseFloat(parts[0]) || 0, text: parts.slice(1).join('|').trim() };
                          }
                          return null;
                        }).filter(Boolean) as {time: number, text: string}[];
                        setParsedLyrics(newLyrics);
                      } catch (err) {}
                    }}
                  />
                </div>
              </div>
            )}
            
            {activeTab === 'videos' && (
              <div className="space-y-8">
                <div className="flex justify-between items-center border-b border-zinc-800 pb-3 mb-6">
                  <h3 className="text-xl font-semibold text-white">Video Management</h3>
                  {videos.length > 1 && (
                    <button 
                      onClick={async () => {
                        try {
                          const blobs = await Promise.all(videos.map(v => fetch(v.src).then(r => r.blob())));
                          const files = blobs.map((b, i) => new File([b], `video${i}.mp4`));
                          const combined = await concatenateVideos(files);
                          const newVideo = {
                            id: 'combined-' + Date.now(),
                            src: URL.createObjectURL(combined),
                            speed: 1,
                            duration: videos.reduce((acc, v) => acc + v.duration, 0)
                          };
                          setVideos([newVideo]);
                          setActiveVideoId(newVideo.id);
                        } catch (err) {
                          console.error("Failed to combine videos:", err);
                        }
                      }}
                      className="text-xs bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded-lg font-bold transition-colors"
                    >
                      Combine All into One
                    </button>
                  )}
                </div>
                <label className="flex items-center justify-center w-full h-24 border border-zinc-700 border-dashed rounded-lg cursor-pointer hover:bg-zinc-800 transition-colors">
                  <span className="text-sm text-zinc-400">Upload New Video</span>
                  <input type="file" accept="video/*" className="hidden" onChange={handleBgUpload} multiple />
                </label>
                <div className="space-y-2">
                  {videos.map((video, index) => (
                    <div key={video.id} className="flex items-center gap-2 bg-zinc-800 p-2 rounded-lg">
                      <button 
                        onClick={() => setActiveVideoId(video.id)}
                        className={`flex-1 text-left text-xs truncate ${activeVideoId === video.id ? 'text-red-400' : 'text-zinc-300'}`}
                      >
                        Video {index + 1}
                      </button>
                      <input 
                        type="number" 
                        value={video.speed} 
                        onChange={(e) => {
                          const newSpeed = parseFloat(e.target.value);
                          setVideos(prev => prev.map(v => v.id === video.id ? { ...v, speed: newSpeed } : v));
                          if (videoRef.current && activeVideoId === video.id) videoRef.current.playbackRate = newSpeed;
                        }}
                        className="w-16 bg-zinc-950 border border-zinc-700 rounded px-1 py-0.5 text-xs text-white"
                        step="0.1"
                        min="0.1"
                        max="3"
                      />
                      <button 
                        onClick={() => {
                          if (audioRef.current && videoRef.current) {
                            const audioDuration = audioRef.current.duration;
                            const videoDuration = videoRef.current.duration;
                            if (audioDuration && videoDuration) {
                              const newSpeed = videoDuration / audioDuration;
                              setVideos(prev => prev.map(v => v.id === video.id ? { ...v, speed: newSpeed } : v));
                              if (activeVideoId === video.id) videoRef.current.playbackRate = newSpeed;
                            }
                          }
                        }}
                        className="text-xs bg-zinc-700 hover:bg-zinc-600 text-white px-2 py-1 rounded"
                      >
                        Crop to Song
                      </button>
                      <button 
                        onClick={async () => {
                          const file = await fetch(video.src).then(r => r.blob());
                          const trimmed = await trimVideo(new File([file], 'video.mp4'), 0, 5); // Example: trim first 5s
                          const newVideo = { ...video, src: URL.createObjectURL(trimmed) };
                          setVideos(prev => prev.map(v => v.id === video.id ? newVideo : v));
                        }}
                        className="text-xs bg-zinc-700 hover:bg-zinc-600 text-white px-2 py-1 rounded"
                      >
                        Trim (5s)
                      </button>
                      <button 
                        onClick={async () => {
                          const file = await fetch(video.src).then(r => r.blob());
                          // Crop center 500x500
                          const cropped = await cropVideo(new File([file], 'video.mp4'), 0, 0, 500, 500);
                          const newVideo = { ...video, src: URL.createObjectURL(cropped) };
                          setVideos(prev => prev.map(v => v.id === video.id ? newVideo : v));
                        }}
                        className="text-xs bg-zinc-700 hover:bg-zinc-600 text-white px-2 py-1 rounded"
                      >
                        Crop (Center)
                      </button>
                      <button 
                        onClick={() => {
                          setVideos(prev => prev.filter(v => v.id !== video.id));
                          if (activeVideoId === video.id) setActiveVideoId(videos[0]?.id || null);
                        }}
                        className="text-zinc-500 hover:text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'remotion' && (
              <div className="space-y-8">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-6">
                  <div className="flex items-center gap-4">
                    <input 
                      type="text"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      className="bg-transparent text-xl font-semibold text-white outline-none focus:border-b border-red-500"
                    />
                    <div className="flex gap-2">
                      <button onClick={exportProject} className="p-1.5 bg-zinc-800 rounded hover:bg-zinc-700 text-zinc-400" title="Export Project">
                        <Download size={14} />
                      </button>
                      <label className="p-1.5 bg-zinc-800 rounded hover:bg-zinc-700 text-zinc-400 cursor-pointer" title="Import Project">
                        <Upload size={14} />
                        <input type="file" hidden onChange={importProject} accept=".json" />
                      </label>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-xs text-zinc-500 uppercase font-bold">Loop</label>
                    <button 
                      onClick={() => setRemotionLoop(!remotionLoop)}
                      className={`w-10 h-5 rounded-full relative transition-colors ${remotionLoop ? 'bg-red-500' : 'bg-zinc-700'}`}
                    >
                      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${remotionLoop ? 'left-6' : 'left-1'}`} />
                    </button>
                  </div>
                </div>
                <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                  <p className="text-sm text-zinc-400 mb-4">Programmatic video composition preview. Sequence your clips below.</p>
                  <div className="w-full aspect-video bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800 mb-6">
                    {videos.length > 0 ? (
                      <Player
                        component={MyComposition}
                        inputProps={{ 
                          clips: videos.map(v => ({
                          id: v.id,
                          src: v.src,
                          durationInFrames: Math.floor((v.durationOverride || (v.duration - v.startFrom)) * 30), // 30 fps
                          startFrom: Math.floor(v.startFrom * 30),
                          playbackRate: v.speed,
                          volume: v.volume,
                          brightness: v.brightness,
                          contrast: v.contrast,
                          saturation: v.saturation,
                          blur: v.blur,
                          hueRotate: v.hueRotate,
                          invert: v.invert,
                          transitionType: v.transitionType,
                          transitionDuration: v.transitionDuration
                        })),
                        textOverlays: textOverlays
                      }}
                      durationInFrames={Math.max(1, Math.floor(totalDuration * 30))}
                        compositionWidth={1920}
                        compositionHeight={1080}
                        fps={30}
                        style={{
                          width: '100%',
                          height: '100%',
                        }}
                        controls
                        playing={isPlaying}
                        autoPlay={isPlaying}
                        loop={remotionLoop}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-zinc-600">
                        Please upload videos first.
                      </div>
                    )}
                  </div>

                  {/* Timeline View */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Timeline</h4>
                      <span className="text-[10px] font-mono text-zinc-500">{totalDuration.toFixed(2)}s total</span>
                    </div>
                    <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 overflow-x-auto">
                      <div className="flex items-end gap-0.5 min-w-max h-24 relative">
                        {/* Time markers */}
                        <div className="absolute top-0 left-0 w-full h-4 border-b border-zinc-900 flex">
                          {Array.from({ length: Math.ceil(totalDuration) + 1 }).map((_, i) => (
                            <div key={i} className="border-l border-zinc-800 h-full text-[8px] text-zinc-600 pl-1" style={{ width: '40px' }}>
                              {i}s
                            </div>
                          ))}
                        </div>
                        
                        {videos.map((video, index) => {
                          const clipDur = video.durationOverride || (video.duration - video.startFrom);
                          const width = clipDur * 40; // 40px per second
                          return (
                            <motion.div 
                              key={video.id}
                              layoutId={video.id}
                              className={`h-12 rounded border relative group cursor-pointer transition-all ${activeVideoId === video.id ? 'border-red-500 bg-red-500/10' : 'border-zinc-700 bg-zinc-800 hover:border-zinc-500'}`}
                              style={{ width: `${width}px` }}
                              onClick={() => setActiveVideoId(video.id)}
                            >
                              <div className="absolute inset-0 flex items-center px-2 overflow-hidden">
                                <span className="text-[10px] text-zinc-300 truncate font-medium">{index + 1}</span>
                              </div>
                              {/* Transition indicator */}
                              {index < videos.length - 1 && video.transitionType !== 'none' && (
                                <div 
                                  className="absolute right-0 top-0 bottom-0 bg-red-500/30 border-l border-red-500/50 flex items-center justify-center"
                                  style={{ width: `${(video.transitionDuration / 30) * 40}px` }}
                                >
                                  <div className="w-1 h-1 bg-red-500 rounded-full animate-pulse" />
                                </div>
                              )}
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Text Overlays Editor */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                        <Type size={16} className="text-red-500" /> Text Overlays
                      </h4>
                      <button 
                        onClick={() => {
                          const newOverlay: any = {
                            id: Math.random().toString(36).substr(2, 9),
                            text: 'New Text',
                            startFrame: 0,
                            durationInFrames: 90,
                            x: 50,
                            y: 50,
                            fontSize: 80,
                            color: '#ffffff',
                            fontFamily: 'sans-serif',
                            strokeColor: '#000000',
                            strokeWidth: 0,
                            shadowColor: 'rgba(0,0,0,0.5)',
                            shadowBlur: 0,
                            shadowOffset: { x: 0, y: 0 },
                            animation: 'none'
                          };
                          setTextOverlays([...textOverlays, newOverlay]);
                          setEditingOverlayId(newOverlay.id);
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold rounded-lg transition-all"
                      >
                        <Plus size={14} /> Add Text
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {textOverlays.map((overlay) => (
                        <div key={overlay.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl group relative">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-white font-medium truncate">{overlay.text}</p>
                              <p className="text-[10px] text-zinc-500 font-mono">
                                {overlay.startFrame}f - {overlay.startFrame + overlay.durationInFrames}f
                              </p>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => setEditingOverlayId(overlay.id)}
                                className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white"
                              >
                                <Settings size={14} />
                              </button>
                              <button 
                                onClick={() => setTextOverlays(textOverlays.filter(o => o.id !== overlay.id))}
                                className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-red-500"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded border border-zinc-700" style={{ backgroundColor: overlay.color }} />
                            <span className="text-[10px] text-zinc-500 uppercase tracking-tighter">{overlay.fontFamily}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Advanced Text Editor Modal */}
                  <AnimatePresence>
                    {editingOverlayId && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
                      >
                        <motion.div 
                          initial={{ scale: 0.9, y: 20 }}
                          animate={{ scale: 1, y: 0 }}
                          exit={{ scale: 0.9, y: 20 }}
                          className="bg-zinc-900 border border-zinc-800 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl"
                        >
                          <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-950/50">
                            <h3 className="text-xl font-display uppercase tracking-widest text-white flex items-center gap-3">
                              <Type className="text-red-500" /> Edit Text Overlay
                            </h3>
                            <button onClick={() => setEditingOverlayId(null)} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-all">
                              <X size={20} />
                            </button>
                          </div>
                          
                          <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            {textOverlays.find(o => o.id === editingOverlayId) && (() => {
                              const overlay = textOverlays.find(o => o.id === editingOverlayId)!;
                              const updateOverlay = (updates: Partial<typeof overlay>) => {
                                setTextOverlays(prev => prev.map(o => o.id === editingOverlayId ? { ...o, ...updates } : o));
                              };
                              
                              return (
                                <div className="space-y-8">
                                  <div className="space-y-3">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Text Content</label>
                                    <input 
                                      type="text" 
                                      value={overlay.text}
                                      onChange={(e) => updateOverlay({ text: e.target.value })}
                                      className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-4 text-white text-lg outline-none focus:border-red-500 transition-all"
                                    />
                                  </div>

                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    <div className="space-y-2">
                                      <label className="text-[10px] font-bold text-zinc-500 uppercase">Start Frame</label>
                                      <input type="number" value={overlay.startFrame} onChange={(e) => updateOverlay({ startFrame: parseInt(e.target.value) })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white text-sm" />
                                    </div>
                                    <div className="space-y-2">
                                      <label className="text-[10px] font-bold text-zinc-500 uppercase">Duration (f)</label>
                                      <input type="number" value={overlay.durationInFrames} onChange={(e) => updateOverlay({ durationInFrames: parseInt(e.target.value) })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white text-sm" />
                                    </div>
                                    <div className="space-y-2">
                                      <label className="text-[10px] font-bold text-zinc-500 uppercase">X Pos (%)</label>
                                      <input type="number" value={overlay.x} onChange={(e) => updateOverlay({ x: parseInt(e.target.value) })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white text-sm" />
                                    </div>
                                    <div className="space-y-2">
                                      <label className="text-[10px] font-bold text-zinc-500 uppercase">Y Pos (%)</label>
                                      <input type="number" value={overlay.y} onChange={(e) => updateOverlay({ y: parseInt(e.target.value) })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white text-sm" />
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                      <div className="space-y-3">
                                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                          <Palette size={14} /> Style
                                        </label>
                                        <div className="grid grid-cols-2 gap-4">
                                          <div className="space-y-2">
                                            <label className="text-[10px] text-zinc-600 uppercase">Font Size</label>
                                            <input type="number" value={overlay.fontSize} onChange={(e) => updateOverlay({ fontSize: parseInt(e.target.value) })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white text-sm" />
                                          </div>
                                          <div className="space-y-2">
                                            <label className="text-[10px] text-zinc-600 uppercase">Text Color</label>
                                            <input type="color" value={overlay.color} onChange={(e) => updateOverlay({ color: e.target.value })} className="w-full h-9 bg-zinc-950 border border-zinc-800 rounded-xl cursor-pointer" />
                                          </div>
                                        </div>
                                        <div className="space-y-2">
                                          <label className="text-[10px] text-zinc-600 uppercase">Font Family</label>
                                          <select value={overlay.fontFamily} onChange={(e) => updateOverlay({ fontFamily: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white text-sm">
                                            <option value="sans-serif">Sans Serif</option>
                                            <option value="serif">Serif</option>
                                            <option value="monospace">Monospace</option>
                                            <option value="font-display">Display (Inter)</option>
                                            <option value="font-mono">Mono (JetBrains)</option>
                                          </select>
                                        </div>
                                      </div>

                                      <div className="space-y-3">
                                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                          <Layers size={14} /> Animation
                                        </label>
                                        <select value={overlay.animation} onChange={(e) => updateOverlay({ animation: e.target.value as any })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white text-sm">
                                          <option value="none">None</option>
                                          <option value="fade">Fade In</option>
                                          <option value="slide">Slide In</option>
                                          <option value="zoom">Zoom In</option>
                                          <option value="bounce">Bounce</option>
                                        </select>
                                      </div>
                                    </div>

                                    <div className="space-y-6">
                                      <div className="space-y-3">
                                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Stroke & Shadow</label>
                                        <div className="grid grid-cols-2 gap-4">
                                          <div className="space-y-2">
                                            <label className="text-[10px] text-zinc-600 uppercase">Stroke Width</label>
                                            <input type="number" value={overlay.strokeWidth} onChange={(e) => updateOverlay({ strokeWidth: parseInt(e.target.value) })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white text-sm" />
                                          </div>
                                          <div className="space-y-2">
                                            <label className="text-[10px] text-zinc-600 uppercase">Stroke Color</label>
                                            <input type="color" value={overlay.strokeColor} onChange={(e) => updateOverlay({ strokeColor: e.target.value })} className="w-full h-9 bg-zinc-950 border border-zinc-800 rounded-xl cursor-pointer" />
                                          </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                          <div className="space-y-2">
                                            <label className="text-[10px] text-zinc-600 uppercase">Shadow Blur</label>
                                            <input type="number" value={overlay.shadowBlur} onChange={(e) => updateOverlay({ shadowBlur: parseInt(e.target.value) })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white text-sm" />
                                          </div>
                                          <div className="space-y-2">
                                            <label className="text-[10px] text-zinc-600 uppercase">Shadow Color</label>
                                            <input type="color" value={overlay.shadowColor} onChange={(e) => updateOverlay({ shadowColor: e.target.value })} className="w-full h-9 bg-zinc-950 border border-zinc-800 rounded-xl cursor-pointer" />
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                          
                          <div className="p-6 bg-zinc-950/50 border-t border-zinc-800 flex justify-end">
                            <button 
                              onClick={() => setEditingOverlayId(null)}
                              className="px-10 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-red-600/20"
                            >
                              Done
                            </button>
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                    <div className="space-y-2">
                      {videos.map((video, index) => (
                        <div key={video.id} className="flex items-center gap-4 bg-zinc-900 p-3 rounded-lg border border-zinc-800">
                          <span className="text-zinc-600 font-mono text-xs">{index + 1}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-zinc-300 truncate font-medium mb-1">Clip {index + 1}</p>
                            <div className="grid grid-cols-3 gap-2 mb-3">
                              <div className="space-y-1">
                                <label className="text-[9px] text-zinc-500 uppercase">Start (s)</label>
                                <input 
                                  type="number" 
                                  step="0.1"
                                  min="0"
                                  max={video.duration}
                                  value={video.startFrom}
                                  onChange={(e) => {
                                    const val = parseFloat(e.target.value);
                                    setVideos(prev => prev.map(v => v.id === video.id ? { ...v, startFrom: val } : v));
                                  }}
                                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-1.5 py-0.5 text-[10px] text-white focus:border-red-500 outline-none"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] text-zinc-500 uppercase">Length (s)</label>
                                <input 
                                  type="number" 
                                  step="0.1"
                                  min="0.1"
                                  max={video.duration - video.startFrom}
                                  value={video.durationOverride || video.duration - video.startFrom}
                                  onChange={(e) => {
                                    const val = parseFloat(e.target.value);
                                    setVideos(prev => prev.map(v => v.id === video.id ? { ...v, durationOverride: val } : v));
                                  }}
                                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-1.5 py-0.5 text-[10px] text-white focus:border-red-500 outline-none"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] text-zinc-500 uppercase">Speed</label>
                                <input 
                                  type="number" 
                                  step="0.1"
                                  min="0.1"
                                  max="5"
                                  value={video.speed}
                                  onChange={(e) => {
                                    const val = parseFloat(e.target.value);
                                    setVideos(prev => prev.map(v => v.id === video.id ? { ...v, speed: val } : v));
                                  }}
                                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-1.5 py-0.5 text-[10px] text-white focus:border-red-500 outline-none"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-zinc-800/50">
                              <div className="space-y-2">
                                <label className="text-[9px] text-zinc-500 uppercase font-bold">Transition (to next)</label>
                                <div className="flex gap-2">
                                  <select 
                                    value={video.transitionType}
                                    onChange={(e) => setVideos(prev => prev.map(v => v.id === video.id ? { ...v, transitionType: e.target.value as any } : v))}
                                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded px-1.5 py-1 text-[10px] text-white outline-none"
                                  >
                                    <option value="none">None</option>
                                    <option value="fade">Fade</option>
                                    <option value="slide">Slide</option>
                                    <option value="wipe">Wipe</option>
                                    <option value="flip">Flip</option>
                                    <option value="zoomBlur">Zoom Blur</option>
                                    <option value="glitch">Glitch</option>
                                    <option value="panBlur">Pan Blur</option>
                                    <option value="spinBlur">Spin Blur</option>
                                    <option value="elasticZoom">Elastic Zoom</option>
                                    <option value="rgbSplit">RGB Split</option>
                                    <option value="stretch">Stretch</option>
                                    <option value="bloomFlash">Bloom Flash</option>
                                    <option value="warpSpeed">Warp Speed</option>
                                    <option value="vortex">Vortex</option>
                                    <option value="liquid">Liquid</option>
                                    <option value="slideUp">Slide Up</option>
                                    <option value="bounce">Bounce</option>
                                    <option value="pixelate">Pixelate</option>
                                    <option value="swirl">Swirl</option>
                                    <option value="crossZoom">Cross Zoom</option>
                                    <option value="cube">Cube</option>
                                    <option value="doom">Doom Melt</option>
                                    <option value="directionalWipe">Directional Wipe</option>
                                    <option value="radialWipe">Radial Wipe</option>
                                    <option value="heartWipe">Heart Wipe</option>
                                    <option value="starWipe">Star Wipe</option>
                                    <option value="angularWipe">Angular Wipe</option>
                                  </select>
                                  <input 
                                    type="number"
                                    value={video.transitionDuration}
                                    onChange={(e) => setVideos(prev => prev.map(v => v.id === video.id ? { ...v, transitionDuration: parseInt(e.target.value) } : v))}
                                    className="w-12 bg-zinc-950 border border-zinc-800 rounded px-1.5 py-1 text-[10px] text-white outline-none"
                                    placeholder="Frames"
                                  />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <label className="text-[9px] text-zinc-500 uppercase font-bold">Volume</label>
                                <input 
                                  type="range"
                                  min="0"
                                  max="1"
                                  step="0.1"
                                  value={video.volume}
                                  onChange={(e) => setVideos(prev => prev.map(v => v.id === video.id ? { ...v, volume: parseFloat(e.target.value) } : v))}
                                  className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-red-500"
                                />
                              </div>
                            </div>

                            <div className="mt-3 grid grid-cols-4 gap-2">
                              {['brightness', 'contrast', 'saturation', 'blur'].map((filter) => (
                                <div key={filter} className="space-y-1">
                                  <label className="text-[8px] text-zinc-600 uppercase">{filter}</label>
                                  <input 
                                    type="number"
                                    step="0.1"
                                    value={(video as any)[filter]}
                                    onChange={(e) => setVideos(prev => prev.map(v => v.id === video.id ? { ...v, [filter]: parseFloat(e.target.value) } : v))}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-1 py-0.5 text-[9px] text-zinc-400 outline-none"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <button 
                              disabled={index === 0}
                              onClick={() => {
                                const newVideos = [...videos];
                                [newVideos[index - 1], newVideos[index]] = [newVideos[index], newVideos[index - 1]];
                                setVideos(newVideos);
                              }}
                              className="p-1 hover:bg-zinc-800 rounded disabled:opacity-30"
                            >
                              <Move className="w-3 h-3 text-zinc-400 rotate-180" />
                            </button>
                            <button 
                              disabled={index === videos.length - 1}
                              onClick={() => {
                                const newVideos = [...videos];
                                [newVideos[index + 1], newVideos[index]] = [newVideos[index], newVideos[index + 1]];
                                setVideos(newVideos);
                              }}
                              className="p-1 hover:bg-zinc-800 rounded disabled:opacity-30"
                            >
                              <Move className="w-3 h-3 text-zinc-400" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
          </div>
        </div>
      )}
    </div>
  );
}
