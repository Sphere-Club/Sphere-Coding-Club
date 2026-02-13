
import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { User } from '../types';

/**
 * ⚠️ SECURITY WARNING: LiveSession Component
 * 
 * This component uses Gemini's real-time streaming API which requires direct client-side
 * access to the API key. This means:
 * 
 * 1. The API key WILL BE EXPOSED in the client bundle when this feature is enabled
 * 2. This component should ONLY be used in trusted environments
 * 3. For production use, consider implementing a WebSocket proxy server
 * 
 * Current Status: DISABLED by default (process.env.API_KEY is undefined)
 * To enable: Add API_KEY back to vite.config.ts define section (NOT RECOMMENDED for production)
 */

interface LiveSessionProps {
  otherUser: User;
  onClose: () => void;
  skill: string;
}

const LiveSession: React.FC<LiveSessionProps> = ({ otherUser, onClose, skill }) => {
  const [status, setStatus] = useState<'connecting' | 'active' | 'closed'>('connecting');
  const [transcription, setTranscription] = useState<string[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Audio Processing Helpers
  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes;
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext) => {
    const dataInt16 = new Int16Array(data.buffer);
    const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;
    return buffer;
  };

  const encode = (bytes: Uint8Array) => {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  };

  useEffect(() => {
    let nextStartTime = 0;

    // ⚠️ SECURITY WARNING: This component requires client-side API key access
    // The Gemini real-time streaming API cannot be easily proxied through a backend
    // This means the API key will be exposed in the client bundle if enabled
    // Only use this feature in trusted environments or implement WebSocket proxy
    // TODO: Consider implementing WebSocket proxy for production use
    const apiKey = process.env.API_KEY as string;
    if (!apiKey || apiKey === '') {
      console.error('LiveSession: API_KEY is not configured. Please set GEMINI_API_KEY in .env.local');
      setStatus('closed');
      return;
    }
    
    const ai = new GoogleGenAI({ apiKey });

    const startSession = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;

        const inputCtx = new AudioContext({ sampleRate: 16000 });
        const outputCtx = new AudioContext({ sampleRate: 24000 });
        audioContextRef.current = outputCtx;

        const sessionPromise = ai.live.connect({
          model: 'gemini-2.5-flash-native-audio-preview-09-2025',
          config: {
            responseModalities: [Modality.AUDIO],
            systemInstruction: `You are an expert tutor for ${skill}. You are helping a user learn from ${otherUser.name}. Act as a facilitator and advisor during this live session.`,
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
            inputAudioTranscription: {},
            outputAudioTranscription: {},
          },
          callbacks: {
            onopen: () => {
              setStatus('active');
              // Microphone streaming
              const source = inputCtx.createMediaStreamSource(stream);
              const processor = inputCtx.createScriptProcessor(4096, 1, 1);
              processor.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);
                const int16 = new Int16Array(inputData.length);
                for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
                sessionPromise.then(s => s.sendRealtimeInput({
                  media: { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' }
                }));
              };
              source.connect(processor);
              processor.connect(inputCtx.destination);

              // Video frame streaming
              const interval = setInterval(() => {
                if (canvasRef.current && videoRef.current) {
                  const ctx = canvasRef.current.getContext('2d');
                  if (ctx) {
                    ctx.drawImage(videoRef.current, 0, 0, 320, 240);
                    canvasRef.current.toBlob(async (blob) => {
                      if (blob) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          const base64 = (reader.result as string).split(',')[1];
                          sessionPromise.then(s => s.sendRealtimeInput({
                            media: { data: base64, mimeType: 'image/jpeg' }
                          }));
                        };
                        reader.readAsDataURL(blob);
                      }
                    }, 'image/jpeg', 0.6);
                  }
                }
              }, 1000);
              return () => clearInterval(interval);
            },
            onmessage: async (msg: LiveServerMessage) => {
              if (msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data) {
                const audioBuffer = await decodeAudioData(decode(msg.serverContent.modelTurn.parts[0].inlineData.data), outputCtx);
                const source = outputCtx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(outputCtx.destination);
                nextStartTime = Math.max(nextStartTime, outputCtx.currentTime);
                source.start(nextStartTime);
                nextStartTime += audioBuffer.duration;
              }
              if (msg.serverContent?.inputTranscription) {
                setTranscription(prev => [...prev.slice(-4), `User: ${msg.serverContent?.inputTranscription?.text}`]);
              }
              if (msg.serverContent?.outputTranscription) {
                setTranscription(prev => [...prev.slice(-4), `Gemini: ${msg.serverContent?.outputTranscription?.text}`]);
              }
            },
            onclose: () => setStatus('closed'),
            onerror: () => setStatus('closed'),
          }
        });

        sessionRef.current = await sessionPromise;
      } catch (err) {
        console.error("Live session failed:", err);
        setStatus('closed');
      }
    };

    startSession();

    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
      sessionRef.current?.close();
    };
  }, [skill, otherUser.name]);

  return (
    <div className="fixed inset-0 z-[200] bg-slate-900 flex flex-col items-center justify-center p-8 animate-in fade-in duration-500">
      <div className="max-w-4xl w-full h-full flex flex-col gap-6">
        <div className="flex justify-between items-center text-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black">S</div>
            <div>
              <h2 className="font-black text-xl">Live SkillSwap Session</h2>
              <p className="text-slate-400 text-sm">Learning <span className="text-indigo-400">{skill}</span> with {otherUser.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition-all">End Session</button>
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 min-h-0">
          <div className="relative rounded-[2.5rem] overflow-hidden bg-slate-800 border-2 border-slate-700 shadow-2xl">
            <video ref={videoRef} autoPlay muted className="w-full h-full object-cover grayscale-[0.3]" />
            <div className="absolute bottom-6 left-6 px-4 py-2 bg-black/40 backdrop-blur-md rounded-xl border border-white/10">
              <p className="text-white text-xs font-black uppercase tracking-widest">You (Vivaan)</p>
            </div>
          </div>

          <div className="relative rounded-[2.5rem] overflow-hidden bg-slate-800 border-2 border-slate-700 shadow-2xl flex flex-col">
            <img src={otherUser.avatar} className="absolute inset-0 w-full h-full object-cover blur-sm opacity-20" alt="" />
            <div className="flex-1 p-8 flex flex-col justify-end relative z-10">
              <div className="space-y-4">
                {transcription.map((t, i) => (
                  <p key={i} className={`text-sm ${t.startsWith('Gemini') ? 'text-indigo-400 font-bold' : 'text-slate-300'}`}>{t}</p>
                ))}
              </div>
            </div>
            <div className="absolute bottom-6 left-6 flex items-center gap-3 px-4 py-2 bg-black/40 backdrop-blur-md rounded-xl border border-white/10">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <p className="text-white text-xs font-black uppercase tracking-widest">{otherUser.name}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl flex items-center justify-center gap-12">
          <div className="flex flex-col items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${status === 'active' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]' : 'bg-slate-500'}`}></div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{status}</span>
          </div>
          <div className="flex gap-4">
            <button className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white hover:bg-white/20 transition-all">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <button className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white hover:bg-white/20 transition-all">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>
        </div>
      </div>
      <canvas ref={canvasRef} width="320" height="240" className="hidden" />
    </div>
  );
};

export default LiveSession;
