'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  Brain,
  Mic,
  MicOff,
  Play,
  Square,
  Volume2,
  Waves,
  AlertCircle,
  CheckCircle2,
  Lightbulb,
  RotateCcw,
  ArrowRight,
  Video,
} from 'lucide-react';
import { interviewApi } from '@/lib/api';
import { useAppStore } from '@/store';
import AIAvatar from '@/components/interview/AIAvatar';
import InterviewChatPanel from '@/components/interview/InterviewChatPanel';

type InterviewPhase = 'setup' | 'listening' | 'processing' | 'summary';
type PersonaMode = 'friendly' | 'strict' | 'faang';

type QuestionPayload = {
  question: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  expected_answer?: string;
};

type FeedbackPayload = {
  score: number;
  good: string;
  missing: string;
  ideal: string;
  tip: string;
  speech_text: string;
  provider: string;
  audio?: {
    provider: string;
    mime_type: string;
    audio_base64: string;
  } | null;
};

type AnswerHistory = {
  question: string;
  answer: string;
  topic?: string;
  difficulty?: string;
  accuracy?: number;
};

type SpeechRecognitionCtor = new () => SpeechRecognition;

declare global {
  interface Window {
    webkitSpeechRecognition?: SpeechRecognitionCtor;
    SpeechRecognition?: SpeechRecognitionCtor;
  }

  interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
    onend: (() => void) | null;
    start(): void;
    stop(): void;
  }

  interface SpeechRecognitionEvent {
    resultIndex: number;
    results: SpeechRecognitionResultList;
  }

  interface SpeechRecognitionErrorEvent {
    error: string;
  }
}

const ROLES = ['SDE', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Data Engineer', 'DevOps Engineer'];
const PERSONAS: Array<{ id: PersonaMode; label: string }> = [
  { id: 'friendly', label: 'Friendly' },
  { id: 'strict', label: 'Strict' },
  { id: 'faang', label: 'FAANG' },
];

function extractWeakSkills(history: Array<AnswerHistory & { missing?: string }>) {
  const counts = new Map<string, number>();
  history.slice(-3).forEach((item) => {
    const text = `${item.topic ?? ''} ${item.missing ?? ''}`.toLowerCase();
    const tags: Array<[string, string[]]> = [
      ['time complexity', ['time complexity', 'complexity', 'big o']],
      ['edge cases', ['edge case', 'edge cases']],
      ['system design', ['system design', 'scalability', 'cache', 'load balancer']],
      ['database', ['database', 'index', 'transaction', 'sql']],
      ['communication', ['structure', 'clarity', 'example']],
    ];
    tags.forEach(([label, terms]) => {
      if (terms.some((term) => text.includes(term))) {
        counts.set(label, (counts.get(label) ?? 0) + 1);
      }
    });
  });
  return Array.from(counts.entries())
    .filter(([, count]) => count >= 2)
    .map(([label]) => label);
}

export default function InterviewPage() {
  const router = useRouter();
  const user = useAppStore((state) => state.user);
  const [phase, setPhase] = useState<InterviewPhase>('setup');
  const [role, setRole] = useState('SDE');
  const [persona, setPersona] = useState<PersonaMode>('friendly');
  const [question, setQuestion] = useState<QuestionPayload | null>(null);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [feedback, setFeedback] = useState<FeedbackPayload | null>(null);
  const [history, setHistory] = useState<Array<AnswerHistory & { missing?: string }>>([]);
  const [weakSkills, setWeakSkills] = useState<string[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [lastAnswer, setLastAnswer] = useState('');
  const [backendInterviewId, setBackendInterviewId] = useState<number | null>(null);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [currentMode, setCurrentMode] = useState<'ai' | 'fallback' | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const answerBufferRef = useRef('');
  const keepListeningRef = useRef(false);
  const isEvaluatingRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const [camOn, setCamOn] = useState(false);
  const [metrics, setMetrics] = useState({ confidence: 0.85, accuracy: 0.80 });

  // Live metrics simulation
  useEffect(() => {
    if (phase !== 'listening') return;
    const interval = setInterval(() => {
      setMetrics(m => ({
        confidence: Math.min(1, Math.max(0.4, m.confidence + (Math.random()-0.45)*0.08)),
        accuracy:   Math.min(1, Math.max(0.4, m.accuracy   + (Math.random()-0.4)*0.07)),
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, [phase]);

  // Webcam stream
  useEffect(() => {
    if (camOn && videoRef.current) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => { if (videoRef.current) videoRef.current.srcObject = stream; })
        .catch(() => toast.error('Camera access denied. Video preview unavailable.'));
    }
    return () => {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      }
    };
  }, [camOn]);

  const resumeSkills = user?.skills ?? [];

  useEffect(() => {
    const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Ctor) {
      setSpeechSupported(false);
      return;
    }

    const recognition = new Ctor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let interim = '';
      let finalChunk = '';

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        const text = result[0]?.transcript ?? '';
        if (result.isFinal) {
          finalChunk += `${text} `;
        } else {
          interim += text;
        }
      }

      if (finalChunk.trim()) {
        answerBufferRef.current = `${answerBufferRef.current} ${finalChunk}`.trim();
        setTranscript(answerBufferRef.current);
      }

      setInterimTranscript(interim.trim());

      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }

      silenceTimerRef.current = setTimeout(() => {
        if (keepListeningRef.current && !isEvaluatingRef.current) {
          void finalizeAnswer();
        }
      }, 2500);
    };

    recognition.onerror = (event) => {
      if (event.error !== 'aborted') {
        toast.error(`Speech recognition error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      if (keepListeningRef.current && !isEvaluatingRef.current) {
        try {
          recognition.start();
        } catch {
          return;
        }
      }
    };

    recognitionRef.current = recognition;
    return () => {
      keepListeningRef.current = false;
      recognition.stop();
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  const fetchNextQuestion = async (interviewId: number) => {
    try {
      const response = await interviewApi.getNextQuestion(interviewId);
      // Ensure we unwrap Spring Boot responses correctly
      const rawData = response.data as any;
      const questionData = rawData && rawData.data ? rawData.data : rawData;
      
      setQuestion({
        question: questionData.question || 'Could you explain a complex project you worked on recently?',
        difficulty: (questionData.difficulty || 'medium') as 'easy' | 'medium' | 'hard',
        topic: questionData.topic || 'General',
        expected_answer: questionData.ideal || 'Candidate clearly explains the project.',
      });
      // Update current mode
      setCurrentMode(questionData.source as 'ai' | 'fallback');
      // Show AI/Fallback badge based on source
      if (questionData.source === 'ai') {
        toast.success('🤖 AI Mode - Gemini generating questions', { duration: 2000 });
      } else if (questionData.source === 'fallback') {
        toast('🔄 Fallback Mode - Using offline engine', { duration: 2000, icon: '⚡' });
      }
    } catch (e) {
      console.warn('Backend question fetch failed, using local fallback', e);
      setQuestion({
        question: `As a ${role}, how would you optimize the performance of a slow system or application?`,
        difficulty: 'medium',
        topic: 'System Design',
        expected_answer: 'Candidate should mention profiling, caching, database indexing, and avoiding N+1 queries.',
      });
      setCurrentMode('fallback');
      toast('🔄 Demo Mode - Local Engine Active', { duration: 2000, icon: '⚡' });
    }
  };

  const unwrapApiPayload = <T,>(payload: { data?: T | { data?: T } }) => {
    const nested = payload.data;
    if (nested && typeof nested === 'object' && 'data' in nested) {
      return (nested as { data?: T }).data as T;
    }
    return nested as T;
  };

  const speakFeedback = (payload: FeedbackPayload) => {
    window.speechSynthesis.cancel();

    if (payload.audio?.audio_base64) {
      const audio = new Audio(`data:${payload.audio.mime_type};base64,${payload.audio.audio_base64}`);
      audioRef.current = audio;
      void audio.play().catch(() => {
        const utterance = new SpeechSynthesisUtterance(payload.speech_text);
        utterance.rate = persona === 'strict' ? 1.02 : persona === 'faang' ? 0.98 : 1;
        window.speechSynthesis.speak(utterance);
      });
      return;
    }

    const utterance = new SpeechSynthesisUtterance(payload.speech_text);
    utterance.rate = persona === 'strict' ? 1.02 : persona === 'faang' ? 0.98 : 1;
    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    if (!recognitionRef.current) return;
    keepListeningRef.current = true;
    setPhase('listening');
    try {
      recognitionRef.current.start();
    } catch {
      return;
    }
  };

  const stopInterview = async () => {
    keepListeningRef.current = false;
    recognitionRef.current?.stop();
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
    answerBufferRef.current = '';

    // If we have answers, show summary instead of resetting
    if (history.length > 0) {
      setPhase('summary' as InterviewPhase);
      // Update interview streak
      try {
        const today = new Date().toDateString();
        const raw = localStorage.getItem('cip_streak');
        let count = 1;
        if (raw) {
          const prev = JSON.parse(raw);
          const yesterday = new Date(Date.now() - 86400000).toDateString();
          if (prev.lastDate === today) count = prev.count;
          else if (prev.lastDate === yesterday) count = prev.count + 1;
        }
        localStorage.setItem('cip_streak', JSON.stringify({ count, lastDate: today }));
      } catch {}
    } else {
      setPhase('setup');
      setQuestion(null);
    }
    setCamOn(false);

    if (backendInterviewId) {
      try {
        await interviewApi.end(backendInterviewId);
      } catch {
        toast.error('Interview ended locally, but persistence could not be finalized.');
      }
    }
    setBackendInterviewId(null);
  };

  const resetInterview = () => {
    setPhase('setup');
    setQuestion(null);
    setFeedback(null);
    setHistory([]);
    setWeakSkills([]);
    setTranscript('');
    setSessionId(null);
    setCamOn(false);
  };

  const finalizeAnswer = async () => {
    const answer = `${answerBufferRef.current} ${interimTranscript}`.trim();
    if (!answer || !question || !backendInterviewId) return;

    keepListeningRef.current = false;
    isEvaluatingRef.current = true;
    recognitionRef.current?.stop();
    setPhase('processing');
    setInterimTranscript('');

    try {
      // Use backend hybrid evaluation endpoint
      const evalResponse = await interviewApi.evaluateAnswer({
        question: question.question,
        answer,
        topic: question.topic,
        ideal: question.expected_answer || '',
      });

      const evalData = evalResponse.data as { score: number; good: string; missing: string; ideal: string; tip: string; source: string };
      
      const nextFeedback: FeedbackPayload = {
        score: evalData.score,
        good: evalData.good,
        missing: evalData.missing,
        ideal: evalData.ideal,
        tip: evalData.tip,
        speech_text: `Score ${evalData.score}. ${evalData.good}. ${evalData.tip}`,
        provider: evalData.source === 'ai' ? 'gemini' : 'fallback',
      };

      const nextHistory = [
        ...history,
        {
          question: question.question,
          answer,
          topic: question.topic,
          difficulty: question.difficulty,
          accuracy: nextFeedback.score,
          missing: nextFeedback.missing,
        },
      ];

      setFeedback(nextFeedback);
      setHistory(nextHistory);
      setWeakSkills(extractWeakSkills(nextHistory));
      speakFeedback(nextFeedback);

      // Submit answer to backend
      await interviewApi.answer({
        interviewId: backendInterviewId,
        questionIndex: history.length,
        question: question.question,
        answer,
        timeTakenSeconds: 0,
        score: nextFeedback.score,
        topic: question.topic,
        difficulty: question.difficulty,
        feedback: {
          good: nextFeedback.good,
          missing: nextFeedback.missing,
          ideal: nextFeedback.ideal,
          tip: nextFeedback.tip,
        },
      });

      setLastAnswer(answer);
      answerBufferRef.current = '';
      setTranscript('');
      
      // Fetch next question from backend
      await fetchNextQuestion(backendInterviewId);
      keepListeningRef.current = true;
      setPhase('listening');
      recognitionRef.current?.start();
    } catch (error) {
      toast.error('Backend evaluation failed. Using local fallback...', { icon: '⚡' });
      
      const fallbackFeedback: FeedbackPayload = {
        score: 75,
        good: 'You gave a structured answer.',
        missing: 'You could elaborate more on the specific edge cases.',
        ideal: question.expected_answer || 'Provide a structured response covering all points.',
        tip: 'Try to use the STAR method when explaining past experiences.',
        speech_text: 'I understood your answer. You gave a structured response, but could elaborate more on specific edge cases. Let us move to the next question.',
        provider: 'fallback',
      };

      const nextHistory = [
        ...history,
        {
          question: question.question,
          answer,
          topic: question.topic,
          difficulty: question.difficulty,
          accuracy: fallbackFeedback.score,
          missing: fallbackFeedback.missing,
        },
      ];

      setFeedback(fallbackFeedback);
      setHistory(nextHistory);
      setWeakSkills(extractWeakSkills(nextHistory));
      speakFeedback(fallbackFeedback);

      setLastAnswer(answer);
      answerBufferRef.current = '';
      setTranscript('');
      
      // Fetch next question from backend (which will also fallback if backend is down)
      await fetchNextQuestion(backendInterviewId);
      keepListeningRef.current = true;
      setPhase('listening');
      try {
        recognitionRef.current?.start();
      } catch {}
    } finally {
      isEvaluatingRef.current = false;
    }
  };

  const handleStart = async () => {
    if (!speechSupported) {
      toast.error('This browser does not support Web Speech API.');
      return;
    }
    try {
      setFeedback(null);
      setHistory([]);
      setWeakSkills([]);
      answerBufferRef.current = '';
      setTranscript('');
      
      let newSessionId = Date.now(); // default to demo ID
      
      try {
        // Start interview on backend
        const startResponse = await interviewApi.start({
          jobRole: role,
          type: 'TECHNICAL',
          numberOfQuestions: 4, // Limit to 4 for fast demo
          questions: [],
        });
        
        const interviewSession = unwrapApiPayload<{ id: number }>(startResponse.data as { data?: { id: number } });
        if (interviewSession?.id) {
          newSessionId = interviewSession.id;
        }
      } catch (backendError) {
        console.warn('Backend interview start failed, using mock session', backendError);
      }
      
      setBackendInterviewId(newSessionId);
      setSessionId(String(newSessionId));
      
      // Get first question (will use fallback if backend fails)
      await fetchNextQuestion(newSessionId);
      setCamOn(true);
      startListening();
    } catch (error) {
      toast.error('Could not start the interview flow.');
      console.error(error);
    }
  };

  const liveTranscript = `${transcript}${interimTranscript ? ` ${interimTranscript}` : ''}`.trim();

  return (
    <div className="space-y-6 pb-12 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-syne font-black text-white uppercase tracking-widest">
            AI Voice Interview Coach
          </h2>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Natural voice synthesis • Real-time evaluation • STAR method guidance
          </p>
        </div>
        {sessionId && (
          <div className="rounded-xl border border-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 bg-white/1 backdrop-blur-md">
            Signal: SESSION_{sessionId}
          </div>
        )}
      </div>

      {!speechSupported && (
        <div className="rounded-2xl border p-4 text-sm" style={{ borderColor: 'rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: '#FCA5A5' }}>
          This browser does not expose the Web Speech API, so live voice capture cannot start here.
        </div>
      )}

      {/* Interview Session Summary */}
      {phase === 'summary' && history.length > 0 && (() => {
        const overallScore = Math.round(history.reduce((sum, h) => sum + (h.accuracy ?? 0), 0) / history.length);
        const sorted = [...history].sort((a, b) => (b.accuracy ?? 0) - (a.accuracy ?? 0));
        const strongest = sorted[0];
        const weakest = sorted[sorted.length - 1];
        const scoreColor = (s: number) => s >= 75 ? '#22C55E' : s >= 50 ? '#F59E0B' : '#EF4444';
        return (
          <div className="space-y-6 animate-fadeIn">
            {/* Hero Score */}
            <div className="rounded-[32px] border p-8 text-center relative overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-[20px]"
              style={{ background: 'rgba(8,12,20,0.7)', borderColor: 'rgba(255,255,255,0.06)' }}>
              <div className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none opacity-20"
                style={{ background: 'radial-gradient(circle,#38BDF8,transparent 70%)', transform: 'translate(30%,-30%)' }} />
              <Trophy size={32} className="mx-auto mb-3 text-amber-400" />
              <p className="text-sm mb-2 font-black text-slate-400 uppercase tracking-widest">Session Complete — {history.length} Questions</p>
              <p className="text-6xl font-bold text-sky drop-shadow-[0_0_15px_rgba(56,189,248,0.5)]" style={{ fontFamily: 'JetBrains Mono,monospace' }}>{overallScore}</p>
              <p className="text-sm mt-2 font-bold text-slate-300">
                {overallScore >= 75 ? '🎉 Excellent performance!' : overallScore >= 50 ? '👍 Good effort, keep improving!' : '📚 More practice recommended'}
              </p>
            </div>

            {/* Per-Question Breakdown */}
            <div className="rounded-2xl border p-5 backdrop-blur-[20px]" style={{ background: 'rgba(8,12,20,0.7)', borderColor: 'rgba(255,255,255,0.06)' }}>
              <h3 className="font-syne font-black mb-4 text-white">Question Breakdown</h3>
              <div className="space-y-3">
                {history.map((h, idx) => {
                  const sc = h.accuracy ?? 0;
                  const isStrongest = h === strongest;
                  const isWeakest = h === weakest && history.length > 1;
                  return (
                    <div key={idx} className="rounded-xl p-4 border transition-all hover:-translate-y-1 hover:shadow-lg" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black px-2 py-1 rounded-full font-mono" style={{ background: 'rgba(56,189,248,0.1)', color: '#38BDF8' }}>Q{idx + 1}</span>
                          <span className="text-xs font-bold capitalize text-slate-300">{h.topic}</span>
                          <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider" style={{ background: 'rgba(255,255,255,0.1)', color: '#F8FAFC' }}>{h.difficulty}</span>
                          {isStrongest && <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider" style={{ background: 'rgba(74,222,128,0.1)', color: '#4ADE80' }}>★ Best</span>}
                          {isWeakest && <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider" style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}>↓ Weakest</span>}
                        </div>
                        <span className="text-lg font-bold font-mono" style={{ color: scoreColor(sc), textShadow: `0 0 10px ${scoreColor(sc)}80` }}>{sc}</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${sc}%`, background: scoreColor(sc), boxShadow: `0 0 10px ${scoreColor(sc)}` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Weak Areas + Suggestions */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border p-5 backdrop-blur-[20px]" style={{ background: 'rgba(8,12,20,0.7)', borderColor: 'rgba(255,255,255,0.06)' }}>
                <h3 className="font-syne font-black mb-3 flex items-center gap-2 text-sm text-red-400">
                  <AlertCircle size={16} /> Weak Areas
                </h3>
                {weakSkills.length > 0 ? (
                  <div className="space-y-2">
                    {weakSkills.map(s => (
                      <div key={s} className="flex items-center gap-2 text-sm font-bold text-slate-300 p-3 rounded-lg border" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }}>
                        <span className="text-amber-500">⚠</span>
                        <span className="capitalize">{s}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm font-medium text-slate-400">No repeated weakness detected in this session.</p>
                )}
              </div>
              <div className="rounded-2xl border p-5 backdrop-blur-[20px]" style={{ background: 'rgba(8,12,20,0.7)', borderColor: 'rgba(255,255,255,0.06)' }}>
                <h3 className="font-syne font-black mb-3 flex items-center gap-2 text-sm text-mint">
                  <CheckCircle2 size={16} /> Recommendation
                </h3>
                <p className="text-sm font-medium text-slate-300 leading-relaxed">
                  {overallScore >= 75
                    ? 'Great performance! Move on to harder topics and system design questions.'
                    : overallScore >= 50
                    ? `Focus on ${weakest?.topic ?? 'weak topics'} and practice explaining with specific examples.`
                    : 'Start with fundamentals. Review core DSA concepts and practice structured answers with the STAR method.'}
                </p>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={resetInterview}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all hover:shadow-[0_0_15px_rgba(56,189,248,0.3)] hover:-translate-y-0.5"
                style={{ background: 'linear-gradient(135deg,#2563EB,#0EA5E9)', color: '#fff' }}>
                <RotateCcw size={16} /> Practice Again
              </button>
              <button onClick={() => router.push('/dashboard')}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm border transition-all hover:-translate-y-0.5 hover:shadow-lg" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.1)', color: '#F8FAFC' }}>
                Dashboard <ArrowRight size={16} />
              </button>
              <button onClick={() => router.push('/jobs')}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm border transition-all hover:-translate-y-0.5 hover:shadow-lg" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.1)', color: '#F8FAFC' }}>
                View Jobs <ArrowRight size={16} />
              </button>
            </div>
          </div>
        );
      })()}

      {phase !== 'summary' && <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="xl:col-span-4 space-y-4">
          <div className="rounded-2xl border p-5 backdrop-blur-[20px]" style={{ background: 'rgba(8,12,20,0.7)', borderColor: 'rgba(255,255,255,0.06)' }}>
            <p className="mb-4 text-[10px] font-black text-white uppercase tracking-widest text-slate-500">Interview Setup</p>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-400 uppercase tracking-widest">Role</label>
                <select
                  value={role}
                  onChange={(event) => setRole(event.target.value)}
                  className="w-full rounded-xl border px-3 py-2.5 text-sm font-bold text-white outline-none focus:border-sky focus:ring-2 focus:ring-sky/20 transition-all"
                  style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.1)' }}
                >
                  {ROLES.map((option) => <option key={option} style={{ background: '#0F172A' }}>{option}</option>)}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-400 uppercase tracking-widest">Persona</label>
                <div className="grid grid-cols-3 gap-2">
                  {PERSONAS.map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setPersona(mode.id)}
                      className="rounded-xl border px-3 py-2 text-sm font-bold transition-all"
                      style={persona === mode.id
                        ? { background: 'linear-gradient(135deg,#38BDF8,#0EA5E9)', borderColor: 'transparent', color: '#fff', boxShadow: '0 4px 15px rgba(56,189,248,0.2)' }
                        : { background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.1)', color: '#94A3B8' }}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border p-3 text-xs font-medium text-slate-400" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }}>
                <span className="font-bold text-white">Resume Context:</span> {resumeSkills.length ? resumeSkills.join(', ') : 'none yet, add them in profile for better questions.'}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleStart}
                  disabled={phase !== 'setup' || !speechSupported}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
                  style={{ background: 'linear-gradient(135deg,#2563EB,#0EA5E9)', color: '#fff', opacity: phase !== 'setup' || !speechSupported ? 0.6 : 1 }}
                >
                  <Play size={16} /> Start
                </button>
                <button
                  type="button"
                  onClick={stopInterview}
                  className="flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold transition-all hover:-translate-y-0.5"
                  style={{ borderColor: 'rgba(239,68,68,0.3)', color: '#DC2626', background: 'rgba(239,68,68,0.05)' }}
                >
                  <Square size={16} /> Stop
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border p-5 backdrop-blur-[20px]" style={{ background: 'rgba(8,12,20,0.7)', borderColor: 'rgba(255,255,255,0.06)' }}>
            <p className="mb-4 text-[10px] font-black text-white uppercase tracking-widest text-slate-500">Skill Gap Engine</p>
            {weakSkills.length ? (
              <div className="space-y-3">
                {weakSkills.map((skill, idx) => {
                  const priority = idx === 0 ? 'HIGH' : 'MEDIUM';
                  const prColor = priority === 'HIGH' ? '#EF4444' : '#F59E0B';
                  const prBg = priority === 'HIGH' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)';
                  const fixes: Record<string, string[]> = {
                    'time complexity': ['Review Big-O notation', 'Practice analyzing nested loops'],
                    'edge cases': ['Always consider null/empty inputs', 'Think about boundary values'],
                    'system design': ['Study URL shortener design', 'Practice drawing diagrams'],
                    'database': ['Review indexing & transactions', 'Practice SQL query optimization'],
                    'communication': ['Use STAR method structure', 'Practice "First...Then...Finally"'],
                  };
                  const reasons: Record<string, string> = {
                    'time complexity': 'No complexity analysis in recent answers',
                    'edge cases': 'Missed edge cases in last 3 answers',
                    'system design': 'Incomplete architecture in recent designs',
                    'database': 'Missing DB concepts in recent answers',
                    'communication': 'Answers lack structured flow',
                  };
                  return (
                    <div key={skill} className="rounded-xl border p-4 space-y-2 transition-all hover:shadow-lg" style={{ background: 'rgba(255,255,255,0.02)', borderColor: `${prColor}30`, boxShadow: `inset 0 0 15px ${prBg}` }}>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold tracking-widest uppercase" style={{ background: prBg, color: prColor, border: `1px solid ${prColor}40` }}>
                          {priority}
                        </span>
                        <span className="text-sm font-bold capitalize text-white">{skill}</span>
                      </div>
                      <p className="text-xs font-medium text-slate-400">Why: {reasons[skill] ?? 'Repeated weakness in recent answers'}</p>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-sky">Fix:</p>
                        {(fixes[skill] ?? ['Practice this topic in your next interview']).map((fix) => (
                          <p key={fix} className="text-xs pl-3 font-medium text-slate-500">→ {fix}</p>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm font-medium text-slate-400 p-3 rounded-xl border" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }}>
                Weaknesses appear here when the last 3 answers repeat the same gap.
              </p>
            )}
          </div>
        </div>

        <div className="xl:col-span-5 space-y-4">
          <div className="rounded-2xl border p-6 backdrop-blur-[20px]" style={{ background: 'rgba(8,12,20,0.7)', borderColor: 'rgba(255,255,255,0.06)', minHeight: 260 }}>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* AI Avatar */}
                <AIAvatar
                  state={phase === 'listening' ? 'listening' : phase === 'processing' ? 'thinking' : feedback ? 'speaking' : 'idle'}
                  speechText={feedback?.speech_text}
                  personaMode={persona}
                />
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <div className="rounded-full px-2.5 py-1 text-xs font-bold" style={{ background: 'rgba(56,189,248,0.1)', color: '#38BDF8' }}>
                      {question?.topic ?? 'Waiting'}
                    </div>
                    <div className="rounded-full px-2.5 py-1 text-xs font-bold capitalize" style={{ background: 'rgba(14,165,233,0.1)', color: '#0EA5E9' }}>
                      {question?.difficulty ?? 'easy'}
                    </div>
                    {currentMode && (
                      <div className="rounded-full px-2.5 py-1 text-xs font-bold flex items-center gap-1" 
                           style={currentMode === 'ai' 
                             ? { background: 'rgba(74,222,128,0.1)', color: '#4ADE80' }
                             : { background: 'rgba(245,158,11,0.1)', color: '#F59E0B' }}>
                        {currentMode === 'ai' ? '🤖 AI Mode' : '🔄 Fallback'}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                    {phase === 'listening' ? <Mic size={14} className="text-rose-500 animate-pulse" /> : phase === 'processing' ? <Waves size={14} className="text-sky animate-pulse" /> : <MicOff size={14} className="text-slate-500" />}
                    {phase === 'listening' ? 'Listening' : phase === 'processing' ? 'Evaluating' : 'Ready'}
                  </div>
                </div>
              </div>
            </div>

            <p className="text-xl font-bold leading-8 text-white" style={{ fontFamily: 'Plus Jakarta Sans,sans-serif' }}>
              {question?.question ?? 'Start the interview to get the first AI-generated question.'}
            </p>

            <div className="mt-6 rounded-2xl border p-4 transition-all shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }}>
              <div className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                <Volume2 size={16} className="text-sky" /> Live Transcript
              </div>
              <p className="min-h-24 text-sm leading-relaxed font-medium" style={{ color: liveTranscript ? '#E2E8F0' : '#64748B' }}>
                {liveTranscript || 'Your transcript appears here while you speak. A 2.5 second pause triggers evaluation.'}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border p-5 backdrop-blur-[20px]" style={{ background: 'rgba(8,12,20,0.7)', borderColor: 'rgba(255,255,255,0.06)' }}>
            <div className="mb-4 flex items-center gap-2 text-sm font-syne font-black text-white">
              <Brain size={18} className="text-sky" /> Recent Answers
            </div>
            {history.length ? (
              <div className="space-y-3">
                {history.slice(-3).reverse().map((item, index) => (
                  <div key={`${item.question}-${index}`} className="rounded-xl border p-4 transition-all hover:shadow-lg hover:-translate-y-0.5" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }}>
                    <p className="text-xs font-black text-sky uppercase tracking-widest mb-1">{item.topic} • {item.accuracy}/100</p>
                    <p className="text-sm font-medium text-slate-300 leading-relaxed">{item.answer}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm font-medium text-slate-400 p-3 rounded-xl border" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }}>Your last answers and scores appear here.</p>
            )}
          </div>
        </div>

        <div className="xl:col-span-3">
          <div className="rounded-2xl border p-5 backdrop-blur-[20px]" style={{ background: 'rgba(8,12,20,0.7)', borderColor: 'rgba(255,255,255,0.06)' }}>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-syne font-black text-white">AI Feedback</p>
              {feedback && (
                <div className="rounded-full px-3 py-1 text-sm font-bold" style={{ background: 'rgba(56,189,248,0.1)', color: '#38BDF8', border: '1px solid rgba(56,189,248,0.2)' }}>
                  {feedback.score}
                </div>
              )}
            </div>

            {feedback ? (
              <div className="space-y-4">
                <div className="rounded-xl border p-4" style={{ background: 'rgba(16,185,129,0.03)', borderColor: 'rgba(16,185,129,0.15)' }}>
                  <div className="mb-2 flex items-center gap-2 text-xs font-black text-mint uppercase tracking-widest">
                    <CheckCircle2 size={16} /> Good points
                  </div>
                  <p className="text-sm font-medium text-slate-300 leading-relaxed">{feedback.good}</p>
                </div>

                <div className="rounded-xl border p-4" style={{ background: 'rgba(239,68,68,0.03)', borderColor: 'rgba(239,68,68,0.15)' }}>
                  <div className="mb-2 flex items-center gap-2 text-xs font-black text-red-500 uppercase tracking-widest">
                    <AlertCircle size={16} /> Missing parts
                  </div>
                  <p className="text-sm font-medium text-slate-300 leading-relaxed">{feedback.missing}</p>
                </div>

                <div className="rounded-xl border p-4" style={{ background: 'rgba(56,189,248,0.03)', borderColor: 'rgba(56,189,248,0.15)' }}>
                  <div className="mb-2 flex items-center gap-2 text-xs font-black text-sky uppercase tracking-widest">
                    <Brain size={16} /> Ideal structure
                  </div>
                  <p className="text-sm font-medium text-slate-300 leading-relaxed">{feedback.ideal}</p>
                </div>

                <div className="rounded-xl border p-4" style={{ background: 'rgba(245,158,11,0.03)', borderColor: 'rgba(245,158,11,0.15)' }}>
                  <div className="mb-2 flex items-center gap-2 text-xs font-black text-amber-500 uppercase tracking-widest">
                    <Lightbulb size={16} /> Tip
                  </div>
                  <p className="text-sm font-medium text-slate-300 leading-relaxed">{feedback.tip}</p>
                </div>

                {/* Your Answer vs Ideal — Side by Side */}
                {(lastAnswer || liveTranscript) && feedback.ideal && (
                  <div className="rounded-xl border p-4" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }}>
                    <p className="mb-3 text-xs font-black text-slate-400 uppercase tracking-widest">Your Answer vs Ideal</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg p-3 border" style={{ background: 'rgba(239,68,68,0.05)', borderColor: 'rgba(239,68,68,0.1)', borderLeft: '3px solid #EF4444' }}>
                        <p className="text-[10px] font-extrabold mb-1 text-red-400">YOUR ANSWER</p>
                        <p className="text-xs font-medium leading-relaxed text-slate-400">{(lastAnswer || liveTranscript).slice(0, 200)}{(lastAnswer || liveTranscript).length > 200 ? '...' : ''}</p>
                      </div>
                      <div className="rounded-lg p-3 border" style={{ background: 'rgba(16,185,129,0.05)', borderColor: 'rgba(16,185,129,0.1)', borderLeft: '3px solid #4ADE80' }}>
                        <p className="text-[10px] font-extrabold mb-1 text-mint">IDEAL STRUCTURE</p>
                        <p className="text-xs font-medium leading-relaxed text-slate-400">{feedback.ideal.slice(0, 200)}{feedback.ideal.length > 200 ? '...' : ''}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="text-xs font-medium text-slate-500">
                  Voice provider: {feedback.provider}. Spoken feedback plays automatically after each pause.
                </div>

                {/* AI Follow-up Coach */}
                {question && (lastAnswer || liveTranscript) && (
                  <InterviewChatPanel 
                    question={question.question}
                    lastUserAnswer={lastAnswer || liveTranscript}
                  />
                )}
              </div>
            ) : (
              <p className="text-sm leading-relaxed font-medium text-slate-400 p-4 rounded-xl border" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }}>
                The score, what was good, what was missing, the ideal short structure, and one improvement tip appear here after each spoken answer.
              </p>
            )}
          </div>
        </div>
      </div>}
    </div>
  );
}
