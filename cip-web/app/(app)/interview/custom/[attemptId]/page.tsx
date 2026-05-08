'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Clock, Send, CheckCircle, Volume2, VolumeX } from 'lucide-react';
import toast from 'react-hot-toast';
import { customInterviewApi } from '@/lib/api';
import { getAudioManager, resetAudioManager } from '@/lib/audioManager';

interface Question {
  id: number;
  questionText: string;
  topic: string;
  difficulty: string;
  questionOrder: number;
}

interface AnswerResponse {
  id: number;
  questionId: number;
  questionText: string;
  answerText: string;
  score: number;
  feedback: string;
  timeTakenSeconds: number;
}

export default function CustomInterviewLivePage() {
  const router = useRouter();
  const params = useParams();
  const attemptId = parseInt(params.attemptId as string);
  
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [startTime, setStartTime] = useState(Date.now());
  const [feedback, setFeedback] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(1);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [interviewTitle, setInterviewTitle] = useState('Custom Interview');
  
  const audioManager = useRef(getAudioManager());
  const feedbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadNextQuestion();
    
    // Initialize audio manager
    audioManager.current.initializeVoices();
    
    // Cleanup on unmount
    return () => {
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }
      audioManager.current.cleanup();
      resetAudioManager();
    };
  }, [attemptId]);

  const loadNextQuestion = async () => {
    try {
      setLoading(true);
      const response = await customInterviewApi.getNextQuestion(attemptId);
      
      if (!response.data.data) {
        // No more questions - interview completed
        toast.success('Interview completed!');
        completeInterview();
        return;
      }

      const question = response.data.data;
      setCurrentQuestion(question);
      setAnswer('');
      setFeedback(null);
      setScore(null);
      setShowFeedback(false);
      setStartTime(Date.now());
      
      // Reset audio for new question
      audioManager.current.resetForNextQuestion();
      
      // Play question audio after a short delay
      if (audioEnabled) {
        setTimeout(() => {
          audioManager.current.playQuestion(question.questionText);
        }, 800);
      }
      
    } catch (error: any) {
      console.error('Failed to load next question:', error);
      if (error.response?.data?.message?.includes('All questions have been answered')) {
        toast.success('All questions completed!');
        completeInterview();
      } else {
        toast.error('Failed to load question');
      }
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!answer.trim()) {
      toast.error('Please provide an answer');
      return;
    }

    if (!currentQuestion) return;

    setSubmitting(true);
    try {
      const timeTaken = Math.floor((Date.now() - startTime) / 1000);
      
      const response = await customInterviewApi.submitAnswer({
        attemptId,
        questionId: currentQuestion.id,
        answerText: answer,
        timeTakenSeconds: timeTaken
      });

      const answerData: AnswerResponse = response.data.data;
      
      // Show feedback
      setFeedback(answerData.feedback);
      setScore(answerData.score);
      setShowFeedback(true);

      // Play feedback audio
      if (audioEnabled && answerData.feedback) {
        setTimeout(() => {
          audioManager.current.playFeedback(answerData.feedback);
        }, 500);
      }

      toast.success('Answer submitted!');

      // Auto-advance to next question after showing feedback
      feedbackTimeoutRef.current = setTimeout(() => {
        setShowFeedback(false);
        setCurrentQuestionNumber(prev => prev + 1);
        loadNextQuestion();
      }, 4000); // Show feedback for 4 seconds

    } catch (error: any) {
      console.error('Failed to submit answer:', error);
      toast.error(error.response?.data?.message || 'Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  };

  const completeInterview = async () => {
    try {
      await customInterviewApi.completeAttempt(attemptId);
      toast.success('Interview completed successfully!');
      router.push(`/interview/result/${attemptId}`);
    } catch (error) {
      console.error('Failed to complete interview:', error);
      toast.error('Failed to complete interview');
    }
  };

  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled);
    if (!audioEnabled) {
      audioManager.current.stopAudio();
    }
    toast.success(audioEnabled ? 'Audio disabled' : 'Audio enabled');
  };

  const formatFeedback = (feedbackText: string) => {
    return feedbackText
      .replace(/\n\n/g, '<br><br>')
      .replace(/✅/g, '<span class="text-green-400">✅</span>')
      .replace(/💡/g, '<span class="text-blue-400">💡</span>')
      .replace(/📝/g, '<span class="text-yellow-400">📝</span>')
      .replace(/🎯/g, '<span class="text-purple-400">🎯</span>')
      .replace(/❌/g, '<span class="text-red-400">❌</span>')
      .replace(/⚠️/g, '<span class="text-orange-400">⚠️</span>');
  };

  if (loading && !currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#000814] via-[#01030F] to-[#020617] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#38BDF8] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading interview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#000814] via-[#01030F] to-[#020617] p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-white">{interviewTitle}</h1>
            <div className="flex items-center gap-4">
              {/* Audio Toggle */}
              <button
                onClick={toggleAudio}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  audioEnabled 
                    ? 'bg-[#38BDF8]/20 text-[#38BDF8]' 
                    : 'bg-white/10 text-gray-400'
                }`}
              >
                {audioEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
              </button>
              
              {/* Timer */}
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg">
                <Clock className="text-[#38BDF8]" size={20} />
                <span className="text-white font-mono">
                  {Math.floor((Date.now() - startTime) / 1000 / 60)}:{String(Math.floor((Date.now() - startTime) / 1000) % 60).padStart(2, '0')}
                </span>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400 text-sm">
              Question {currentQuestionNumber}
            </p>
            {score !== null && (
              <p className="text-sm">
                <span className="text-gray-400">Last Score: </span>
                <span className={`font-bold ${
                  score >= 80 ? 'text-green-400' : 
                  score >= 60 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {score.toFixed(0)}%
                </span>
              </p>
            )}
          </div>
        </motion.div>

        {/* Feedback Display */}
        {showFeedback && feedback && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-[#38BDF8]/10 to-[#4ADE80]/10 backdrop-blur-xl rounded-2xl border border-[#38BDF8]/20 p-6 mb-6"
          >
            <h3 className="text-xl font-bold text-white mb-3">Feedback</h3>
            <div 
              className="text-gray-300 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: formatFeedback(feedback) }}
            />
            {score !== null && (
              <div className="mt-4 flex items-center gap-2">
                <span className="text-gray-400">Score:</span>
                <span className={`text-2xl font-bold ${
                  score >= 80 ? 'text-green-400' : 
                  score >= 60 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {score.toFixed(0)}%
                </span>
              </div>
            )}
          </motion.div>
        )}

        {/* Question */}
        {currentQuestion && !showFeedback && (
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 mb-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-[#38BDF8]/10 text-[#38BDF8] rounded-full text-sm font-bold">
                {currentQuestion.topic || 'General'}
              </span>
              <span className="px-3 py-1 bg-white/10 text-gray-300 rounded-full text-sm font-bold">
                {currentQuestion.difficulty}
              </span>
              {audioEnabled && (
                <span className="px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-sm font-bold">
                  🔊 Audio Enabled
                </span>
              )}
            </div>

            <h2 className="text-2xl font-bold text-white mb-6">
              {currentQuestion.questionText}
            </h2>

            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer here..."
              rows={10}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#38BDF8] resize-none"
              disabled={submitting}
            />

            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={submitAnswer}
                disabled={submitting || !answer.trim()}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#38BDF8] to-[#0EA5E9] text-white rounded-lg hover:shadow-lg hover:shadow-[#38BDF8]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    Submit Answer
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* Loading next question */}
        {loading && currentQuestion && (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-[#38BDF8] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-gray-400">Loading next question...</p>
          </div>
        )}
      </div>
    </div>
  );
}
