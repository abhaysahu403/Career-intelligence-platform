'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { interviewApi } from '@/lib/api';
import { InterviewV3Report, HiringVerdict } from '@/types';
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Target,
  Brain,
  Eye,
  Mic,
  MessageSquare,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Download,
  Share2,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Sparkles,
  Building2,
  ArrowRight,
  Home,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

export default function InterviewReportPage() {
  const params = useParams();
  const router = useRouter();
  const interviewId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<InterviewV3Report | null>(null);

  useEffect(() => {
    loadReport();
  }, [interviewId]);

  const loadReport = async () => {
    try {
      const response = await interviewApi.v3.getReport(interviewId);
      setReport(response.data.data);
    } catch (error) {
      console.error('Failed to load report:', error);
      toast.error('Failed to load interview report');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#000814] via-[#01030F] to-[#020617] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#38BDF8] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Generating AI report...</p>
        </div>
      </div>
    );
  }

  // Mock data for demo (replace with actual report data)
  const mockReport: InterviewV3Report = {
    interview: {
      id: parseInt(interviewId),
      userId: 1,
      interviewMode: 'COMPANY_SPECIFIC',
      company: 'Google',
      role: 'SDE',
      difficulty: 'HARD',
      persona: 'FAANG_INTERVIEWER',
      status: 'COMPLETED',
      questions: [],
      answers: [],
      totalScore: 92,
      totalQuestions: 5,
      answeredQuestions: 5,
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    },
    finalScore: 92,
    finalVerdict: 'STRONG_HIRE',
    performanceBreakdown: {
      communication: 88,
      technical: 94,
      confidence: 91,
      eyeContact: 85,
      problemSolving: 93,
      clarity: 89,
    },
    companyReadiness: {
      Google: 92,
      Amazon: 88,
      Microsoft: 90,
      Flipkart: 95,
      TCS: 98,
      Infosys: 96,
    },
    weakAreas: [
      'Improve scalability concepts',
      'Better communication structure',
      'Add database optimization examples',
    ],
    strongAreas: [
      'Excellent problem-solving approach',
      'Strong technical knowledge',
      'Good use of STAR framework',
    ],
    recommendations: [
      'Practice DSA medium questions',
      'Study system design basics',
      'Improve answer structure',
      'Focus on database concepts',
    ],
    speechAnalytics: {
      wordsPerMinute: 145,
      fillerWords: 8,
      pauseDuration: 12,
      clarity: 89,
    },
    starCompliance: {
      situation: true,
      task: true,
      action: true,
      result: false,
      score: 75,
    },
  };

  const reportData = report || mockReport;

  const getVerdictColor = (verdict: HiringVerdict) => {
    switch (verdict) {
      case 'STRONG_HIRE':
        return 'text-green-400';
      case 'CONSIDER':
        return 'text-yellow-400';
      case 'REJECT':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getVerdictIcon = (verdict: HiringVerdict) => {
    switch (verdict) {
      case 'STRONG_HIRE':
        return '🟢';
      case 'CONSIDER':
        return '🟡';
      case 'REJECT':
        return '🔴';
      default:
        return '⚪';
    }
  };

  const performanceData = Object.entries(reportData.performanceBreakdown).map(([key, value]) => ({
    subject: key.charAt(0).toUpperCase() + key.slice(1),
    score: value,
    fullMark: 100,
  }));

  const companyReadinessData = Object.entries(reportData.companyReadiness).map(([company, score]) => ({
    company,
    score,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#000814] via-[#01030F] to-[#020617] relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-96 h-96 bg-[#38BDF8] rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#4ADE80] rounded-full blur-[120px] animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <Trophy className="w-12 h-12 text-[#F59E0B]" />
            AI Interview Report
          </h1>
          <p className="text-xl text-gray-400">Comprehensive Performance Analysis</p>
        </motion.div>

        {/* Hero Section - Final Score & Verdict */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 p-12 mb-8 text-center"
        >
          <div className="mb-6">
            <p className="text-gray-400 text-lg mb-2">FINAL SCORE</p>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#38BDF8] to-[#0EA5E9]"
            >
              {reportData.finalScore}
            </motion.div>
            <p className="text-gray-400 text-2xl">/ 100</p>
          </div>

          <div className="mb-6">
            <p className="text-gray-400 text-lg mb-2">FINAL HIRING VERDICT</p>
            <div className={`text-5xl font-bold ${getVerdictColor(reportData.finalVerdict)} flex items-center justify-center gap-3`}>
              <span className="text-6xl">{getVerdictIcon(reportData.finalVerdict)}</span>
              {reportData.finalVerdict.replace('_', ' ')}
            </div>
          </div>

          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => toast.success('Report downloaded!')}
              className="flex items-center gap-2 px-6 py-3 bg-[#38BDF8] hover:bg-[#0EA5E9] text-white font-semibold rounded-xl transition-all"
            >
              <Download className="w-5 h-5" />
              Download PDF
            </button>
            <button
              onClick={() => toast.success('Report shared!')}
              className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all"
            >
              <Share2 className="w-5 h-5" />
              Share Report
            </button>
            <button
              onClick={() => router.push('/interview/setup')}
              className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-all"
            >
              <Zap className="w-5 h-5" />
              New Interview
            </button>
          </div>
        </motion.div>

        {/* Performance Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Radar Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-[#38BDF8]" />
              Performance Breakdown
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={performanceData}>
                <PolarGrid stroke="#ffffff20" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#9CA3AF' }} />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="#38BDF8"
                  fill="#38BDF8"
                  fillOpacity={0.6}
                />
              </RadarChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-3 gap-4 mt-6">
              {Object.entries(reportData.performanceBreakdown).map(([key, value]) => (
                <div key={key} className="text-center">
                  <p className="text-gray-400 text-xs mb-1">{key.charAt(0).toUpperCase() + key.slice(1)}</p>
                  <p className="text-white text-2xl font-bold">{value}%</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Company Readiness */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Building2 className="w-6 h-6 text-[#4ADE80]" />
              Company Readiness
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={companyReadinessData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="company" tick={{ fill: '#9CA3AF', fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
                <YAxis domain={[0, 100]} tick={{ fill: '#9CA3AF' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="score" fill="#4ADE80" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-6 space-y-2">
              {companyReadinessData.slice(0, 3).map((item) => (
                <div key={item.company} className="flex items-center justify-between">
                  <span className="text-gray-400">{item.company}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-white/10 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-[#4ADE80] to-[#22C55E] h-2 rounded-full"
                        style={{ width: `${item.score}%` }}
                      ></div>
                    </div>
                    <span className="text-white font-semibold w-12 text-right">{item.score}%</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Strengths & Weaknesses */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Strong Areas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-[#4ADE80]" />
              Strong Areas
            </h2>
            <div className="space-y-3">
              {reportData.strongAreas.map((area, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + idx * 0.1 }}
                  className="flex items-start gap-3 bg-green-500/10 border border-green-500/20 rounded-lg p-4"
                >
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-300">{area}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Weak Areas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-[#F59E0B]" />
              Areas for Improvement
            </h2>
            <div className="space-y-3">
              {reportData.weakAreas.map((area, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + idx * 0.1 }}
                  className="flex items-start gap-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4"
                >
                  <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-300">{area}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Speech Analytics & STAR Compliance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Speech Analytics */}
          {reportData.speechAnalytics && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
            >
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Mic className="w-6 h-6 text-[#EC4899]" />
                Speech Analytics
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-gray-400 text-sm mb-2">Words/Minute</p>
                  <p className="text-3xl font-bold text-white">{reportData.speechAnalytics.wordsPerMinute}</p>
                  <p className="text-xs text-green-400 mt-1">✓ Optimal pace</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-gray-400 text-sm mb-2">Filler Words</p>
                  <p className="text-3xl font-bold text-white">{reportData.speechAnalytics.fillerWords}</p>
                  <p className="text-xs text-yellow-400 mt-1">⚠ Can improve</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-gray-400 text-sm mb-2">Pause Duration</p>
                  <p className="text-3xl font-bold text-white">{reportData.speechAnalytics.pauseDuration}s</p>
                  <p className="text-xs text-green-400 mt-1">✓ Good timing</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-gray-400 text-sm mb-2">Clarity</p>
                  <p className="text-3xl font-bold text-white">{reportData.speechAnalytics.clarity}%</p>
                  <p className="text-xs text-green-400 mt-1">✓ Excellent</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* STAR Compliance */}
          {reportData.starCompliance && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
            >
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Target className="w-6 h-6 text-[#8B5CF6]" />
                STAR Method Analysis
              </h2>
              <div className="space-y-4 mb-6">
                {Object.entries(reportData.starCompliance).filter(([key]) => key !== 'score').map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {value ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-400" />
                      )}
                      <span className="text-white font-semibold capitalize">{key}</span>
                    </div>
                    <span className={value ? 'text-green-400' : 'text-red-400'}>
                      {value ? 'Present' : 'Missing'}
                    </span>
                  </div>
                ))}
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-gray-400 text-sm mb-2">Overall STAR Score</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-white/10 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] h-3 rounded-full"
                      style={{ width: `${reportData.starCompliance.score}%` }}
                    ></div>
                  </div>
                  <span className="text-white text-2xl font-bold">{reportData.starCompliance.score}%</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* AI Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gradient-to-br from-[#38BDF8]/20 to-[#0EA5E9]/20 backdrop-blur-xl rounded-2xl border border-[#38BDF8]/30 p-8 mb-8"
        >
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <Lightbulb className="w-8 h-8 text-[#F59E0B]" />
            AI Recommendations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reportData.recommendations.map((rec, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + idx * 0.1 }}
                className="flex items-start gap-3 bg-white/10 rounded-xl p-4"
              >
                <ArrowRight className="w-5 h-5 text-[#38BDF8] flex-shrink-0 mt-0.5" />
                <p className="text-gray-200">{rec}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="flex items-center justify-center gap-4"
        >
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all"
          >
            <Home className="w-5 h-5" />
            Back to Dashboard
          </button>
          <button
            onClick={() => router.push('/interview/setup')}
            className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#38BDF8] to-[#0EA5E9] hover:shadow-lg hover:shadow-[#38BDF8]/50 text-white font-semibold rounded-xl transition-all"
          >
            <Sparkles className="w-5 h-5" />
            Start New Interview
          </button>
        </motion.div>
      </div>
    </div>
  );
}
