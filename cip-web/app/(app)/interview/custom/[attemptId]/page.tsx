'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Clock, Send, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';

interface Question {
  id: number;
  questionText: string;
  topic: string;
  difficulty: string;
  questionOrder: number;
}

interface Attempt {
  id: number;
  interviewTitle: string;
  questions: Question[];
  status: string;
}

export default function CustomInterviewLivePage() {
  const router = useRouter();
  const params = useParams();
  const attemptId = parseInt(params.attemptId as string);
  
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [answers, setAnswers] = useState<Map<number, string>>(new Map());

  useEffect(() => {
    loadAttempt();
  }, [attemptId]);

  const loadAttempt = async () => {
    try {
      // For now, we'll start the interview directly
      // In production, you'd fetch the attempt details
      toast.success('Interview loaded!');
    } catch (error) {
      console.error('Failed to load attempt:', error);
      toast.error('Failed to load interview');
    }
  };

  const currentQuestion = attempt?.questions[currentQuestionIndex];

  const submitAnswer = async () => {
    if (!answer.trim()) {
      toast.error('Please provide an answer');
      return;
    }

    if (!currentQuestion) return;

    setSubmitting(true);
    try {
      const timeTaken = Math.floor((Date.now() - startTime) / 1000);
      
      await api.post('/custom-interview/attempt/answer', {
        attemptId,
        questionId: currentQuestion.id,
        answerText: answer,
        timeTakenSeconds: timeTaken
      });

      // Save answer locally
      const newAnswers = new Map(answers);
      newAnswers.set(currentQuestion.id, answer);
      setAnswers(newAnswers);

      toast.success('Answer submitted!');

      // Move to next question or complete
      if (currentQuestionIndex < (attempt?.questions.length || 0) - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setAnswer('');
        setStartTime(Date.now());
      } else {
        completeInterview();
      }
    } catch (error: any) {
      console.error('Failed to submit answer:', error);
      toast.error(error.response?.data?.message || 'Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  };

  const completeInterview = async () => {
    try {
      await api.post(`/custom-interview/attempt/${attemptId}/complete`);
      toast.success('Interview completed!');
      router.push(`/interview/custom/${attemptId}/result`);
    } catch (error) {
      console.error('Failed to complete interview:', error);
      toast.error('Failed to complete interview');
    }
  };

  if (!attempt) {
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
            <h1 className="text-3xl font-bold text-white">{attempt.interviewTitle}</h1>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg">
              <Clock className="text-[#38BDF8]" size={20} />
              <span className="text-white font-mono">
                {Math.floor((Date.now() - startTime) / 1000 / 60)}:{String(Math.floor((Date.now() - startTime) / 1000) % 60).padStart(2, '0')}
              </span>
            </div>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-2">
            {attempt.questions.map((_, index) => (
              <div
                key={index}
                className={`flex-1 h-2 rounded-full ${
                  index < currentQuestionIndex
                    ? 'bg-[#4ADE80]'
                    : index === currentQuestionIndex
                    ? 'bg-[#38BDF8]'
                    : 'bg-white/10'
                }`}
              />
            ))}
          </div>
          <p className="text-gray-400 text-sm mt-2">
            Question {currentQuestionIndex + 1} of {attempt.questions.length}
          </p>
        </motion.div>

        {/* Question */}
        {currentQuestion && (
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
                ) : currentQuestionIndex < attempt.questions.length - 1 ? (
                  <>
                    <Send size={20} />
                    Submit & Next
                  </>
                ) : (
                  <>
                    <CheckCircle size={20} />
                    Submit & Complete
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
