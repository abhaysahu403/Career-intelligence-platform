'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Clock, FileText, AlertCircle, Play } from 'lucide-react';
import toast from 'react-hot-toast';
import { customInterviewApi } from '@/lib/api';

interface Interview {
  id: number;
  title: string;
  description: string;
  interviewCode: string;
  durationMinutes: number;
  difficulty: string;
  totalQuestions: number;
  questions: any[];
}

export default function JoinInterviewPage() {
  const router = useRouter();
  const params = useParams();
  const code = params.code as string;
  
  const [interview, setInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (code) {
      loadInterview();
    }
  }, [code]);

  const loadInterview = async () => {
    try {
      const response = await customInterviewApi.joinByCode(code);
      setInterview(response.data.data);
    } catch (error: any) {
      console.error('Failed to load interview:', error);
      toast.error(error.response?.data?.message || 'Interview not found');
      setTimeout(() => router.push('/dashboard'), 2000);
    } finally {
      setLoading(false);
    }
  };

  const startInterview = async () => {
    if (!interview) return;
    
    setStarting(true);
    try {
      const response = await customInterviewApi.startAttempt({
        interviewCode: code
      });
      
      const attempt = response.data.data;
      toast.success('Interview started!');
      router.push(`/interview/custom/${attempt.id}`);
    } catch (error: any) {
      console.error('Failed to start interview:', error);
      toast.error(error.response?.data?.message || 'Failed to start interview');
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#000814] via-[#01030F] to-[#020617] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#38BDF8] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading interview...</p>
        </div>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#000814] via-[#01030F] to-[#020617] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Interview Not Found</h2>
          <p className="text-gray-400">The interview code is invalid or expired</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#000814] via-[#01030F] to-[#020617] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">{interview.title}</h1>
          {interview.description && (
            <p className="text-gray-400">{interview.description}</p>
          )}
        </div>

        {/* Interview Details */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="flex items-center gap-3">
              <Clock className="text-[#38BDF8]" size={24} />
              <div>
                <p className="text-sm text-gray-400">Duration</p>
                <p className="text-lg font-bold text-white">{interview.durationMinutes} minutes</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="flex items-center gap-3">
              <FileText className="text-[#4ADE80]" size={24} />
              <div>
                <p className="text-sm text-gray-400">Questions</p>
                <p className="text-lg font-bold text-white">{interview.totalQuestions} questions</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="flex items-center gap-3">
              <AlertCircle className="text-[#F59E0B]" size={24} />
              <div>
                <p className="text-sm text-gray-400">Difficulty</p>
                <p className="text-lg font-bold text-white">{interview.difficulty}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-[#38BDF8]/10 border border-[#38BDF8]/20 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-bold text-white mb-3">Instructions</h3>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li>• Answer all questions to the best of your ability</li>
            <li>• Your answers will be evaluated by AI</li>
            <li>• You can take your time, but try to complete within the duration</li>
            <li>• Once started, you cannot pause the interview</li>
            <li>• Your results will be shared with the interviewer</li>
          </ul>
        </div>

        {/* Start Button */}
        <button
          onClick={startInterview}
          disabled={starting}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-[#38BDF8] to-[#0EA5E9] text-white rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-[#38BDF8]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {starting ? (
            <>
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Starting Interview...
            </>
          ) : (
            <>
              <Play size={24} />
              Start Interview
            </>
          )}
        </button>
      </motion.div>
    </div>
  );
}
