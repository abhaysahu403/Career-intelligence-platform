'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Trophy, Clock, CheckCircle, Target, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { customInterviewApi } from '@/lib/api';
import ShareReportModal from '@/components/ui/ShareReportModal';

interface AttemptResult {
  id: number;
  interviewTitle: string;
  studentName: string;
  studentEmail: string;
  totalScore: number;
  status: string;
  startedAt: string;
  completedAt: string;
  answers: Array<{
    id: number;
    questionText: string;
    answerText: string;
    score: number;
    feedback: string;
    timeTakenSeconds: number;
  }>;
}

export default function InterviewResultPage() {
  const router = useRouter();
  const params = useParams();
  const attemptId = parseInt(params.id as string);
  
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    loadResult();
  }, [attemptId]);

  const loadResult = async () => {
    try {
      // For now, we'll create a mock result since the backend endpoint might not exist yet
      // In production, you'd call: const response = await customInterviewApi.getResult(attemptId);
      
      // Mock data for demonstration
      const mockResult: AttemptResult = {
        id: attemptId,
        interviewTitle: "Java Backend Developer Interview",
        studentName: "John Doe",
        studentEmail: "john.doe@example.com",
        totalScore: 78.5,
        status: "COMPLETED",
        startedAt: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
        completedAt: new Date().toISOString(),
        answers: [
          {
            id: 1,
            questionText: "Explain REST API design principles and best practices",
            answerText: "REST APIs should follow stateless communication, use proper HTTP methods like GET, POST, PUT, DELETE, implement proper status codes, and use JSON for data exchange. Authentication should be handled via JWT tokens.",
            score: 85,
            feedback: "✅ Excellent coverage of REST principles! You mentioned key concepts like statelessness and HTTP methods.\n\n💡 Improvement: Consider adding details about HATEOAS and API versioning strategies.",
            timeTakenSeconds: 180
          },
          {
            id: 2,
            questionText: "What is the difference between @Component, @Service, and @Repository in Spring?",
            answerText: "@Component is a generic stereotype, @Service is for business logic layer, and @Repository is for data access layer. They are all specializations of @Component.",
            score: 72,
            feedback: "✅ Good understanding of Spring stereotypes!\n\n📝 Consider adding: @Repository provides exception translation and @Service indicates business logic separation.",
            timeTakenSeconds: 120
          }
        ]
      };
      
      setResult(mockResult);
    } catch (error) {
      console.error('Failed to load result:', error);
      toast.error('Failed to load interview result');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return 'from-green-500 to-green-600';
    if (score >= 60) return 'from-yellow-500 to-yellow-600';
    return 'from-red-500 to-red-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#000814] via-[#01030F] to-[#020617] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#38BDF8] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading results...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#000814] via-[#01030F] to-[#020617] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400">Interview result not found</p>
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
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-2">Interview Complete!</h1>
            <p className="text-gray-400">{result.interviewTitle}</p>
          </div>
        </motion.div>

        {/* Overall Score */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 mb-8 text-center"
        >
          <div className="flex items-center justify-center mb-6">
            <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${getScoreGradient(result.totalScore)} flex items-center justify-center`}>
              <div className="w-28 h-28 rounded-full bg-[#000814] flex items-center justify-center">
                <span className={`text-4xl font-bold ${getScoreColor(result.totalScore)}`}>
                  {result.totalScore.toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">Overall Score</h2>
          <p className="text-gray-400">
            {result.totalScore >= 80 ? 'Excellent performance!' : 
             result.totalScore >= 60 ? 'Good job! Room for improvement.' : 
             'Keep practicing and you\'ll improve!'}
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#38BDF8]/10 flex items-center justify-center">
                <CheckCircle className="text-[#38BDF8]" size={24} />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Questions Answered</p>
                <p className="text-2xl font-bold text-white">{result.answers.length}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#4ADE80]/10 flex items-center justify-center">
                <Clock className="text-[#4ADE80]" size={24} />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Time</p>
                <p className="text-2xl font-bold text-white">
                  {formatTime(result.answers.reduce((sum, a) => sum + a.timeTakenSeconds, 0))}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#F59E0B]/10 flex items-center justify-center">
                <Target className="text-[#F59E0B]" size={24} />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Average Score</p>
                <p className={`text-2xl font-bold ${getScoreColor(result.totalScore)}`}>
                  {result.totalScore.toFixed(1)}%
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Detailed Results */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-white mb-6">Detailed Results</h2>
          
          <div className="space-y-6">
            {result.answers.map((answer, index) => (
              <motion.div
                key={answer.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-bold text-white flex-1">
                    Question {index + 1}: {answer.questionText}
                  </h3>
                  <div className="flex items-center gap-4 ml-4">
                    <span className={`text-2xl font-bold ${getScoreColor(answer.score)}`}>
                      {answer.score}%
                    </span>
                    <span className="text-gray-400 text-sm">
                      {formatTime(answer.timeTakenSeconds)}
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Your Answer:</h4>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <p className="text-gray-300">{answer.answerText}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Feedback:</h4>
                  <div 
                    className="text-gray-300 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: formatFeedback(answer.feedback) }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <button
            onClick={() => setShowShareModal(true)}
            className="px-8 py-3 bg-white/5 backdrop-blur-xl border border-white/10 text-white rounded-lg hover:bg-white/10 transition-all flex items-center gap-2"
          >
            <Share2 size={20} />
            Share Report
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-8 py-3 bg-gradient-to-r from-[#38BDF8] to-[#0EA5E9] text-white rounded-lg hover:shadow-lg hover:shadow-[#38BDF8]/50 transition-all"
          >
            Back to Dashboard
          </button>
        </motion.div>

        {/* Share Modal */}
        <ShareReportModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          reportType="interview"
          reportData={{
            userId: typeof window !== 'undefined' ? Number(localStorage.getItem('userId') || '1') : 1,
            interviewId: attemptId
          }}
        />
      </div>
    </div>
  );
}