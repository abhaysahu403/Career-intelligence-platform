'use client';

import { useState } from 'react';
import ScoreBreakdown from '@/components/interview/ScoreBreakdown';
import PersonalizedBadge from '@/components/interview/PersonalizedBadge';
import { Sparkles, Brain, Target } from 'lucide-react';

export default function InterviewDemoPage() {
  const [showScores, setShowScores] = useState(true);

  // Example data
  const exampleResult = {
    score: 78,
    llm_score: 75,
    semantic_score: 85,
    feedback: {
      good: "Clear explanation of REST API principles and proper use of HTTP methods",
      missing: "Could add more details about GraphQL advantages and when to use it over REST",
      ideal: "A strong answer should cover REST principles, HTTP methods, status codes, and compare with GraphQL including use cases",
      tip: "Try using the STAR method (Situation, Task, Action, Result) to structure your answers"
    }
  };

  const exampleQuestions = [
    {
      id: 1,
      question: "Explain the difference between REST and GraphQL APIs.",
      personalized: false,
      topic: "API Design",
      difficulty: "Medium"
    },
    {
      id: 2,
      question: "I see you worked on an AI Chatbot project using NLP and TensorFlow. Can you explain how you handled intent classification in your chatbot?",
      personalized: true,
      resume_reference: "AI Chatbot project",
      topic: "Natural Language Processing",
      difficulty: "Medium"
    },
    {
      id: 3,
      question: "In your e-commerce platform project using React and Node.js, how did you handle state management across multiple components?",
      personalized: true,
      resume_reference: "E-commerce platform project",
      topic: "React",
      difficulty: "Medium"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-[#000814] dark:via-[#01030F] dark:to-[#020617] p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white flex items-center justify-center gap-3">
            <Sparkles className="w-10 h-10 text-blue-500" />
            Hackathon Day 1 Features Demo
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            RAG-powered Interview System with Semantic Similarity Scoring
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Score Breakdown Demo */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Phase 1: Semantic Similarity Scoring
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Hybrid scoring: LLM (60%) + Semantic (40%)
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <ScoreBreakdown
                score={exampleResult.score}
                llmScore={exampleResult.llm_score}
                semanticScore={exampleResult.semantic_score}
                showDetails={showScores}
              />

              <button
                onClick={() => setShowScores(!showScores)}
                className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-all"
              >
                {showScores ? 'Hide Details' : 'Show Details'}
              </button>

              {/* Feedback Section */}
              <div className="mt-6 space-y-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                <div className="text-sm">
                  <span className="font-semibold text-green-600 dark:text-green-400">✓ Good:</span>
                  <p className="text-slate-700 dark:text-slate-300 mt-1">{exampleResult.feedback.good}</p>
                </div>
                <div className="text-sm">
                  <span className="font-semibold text-red-600 dark:text-red-400">✗ Missing:</span>
                  <p className="text-slate-700 dark:text-slate-300 mt-1">{exampleResult.feedback.missing}</p>
                </div>
                <div className="text-sm">
                  <span className="font-semibold text-blue-600 dark:text-blue-400">💡 Tip:</span>
                  <p className="text-slate-700 dark:text-slate-300 mt-1">{exampleResult.feedback.tip}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Personalized Questions Demo */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Phase 3: Personalized Questions
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  RAG-based question generation
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {exampleQuestions.map((q) => (
                <div
                  key={q.id}
                  className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Question {q.id}
                      </span>
                      <PersonalizedBadge
                        isPersonalized={q.personalized}
                        resumeReference={q.resume_reference}
                      />
                    </div>
                    <div className="flex gap-2">
                      <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                        {q.topic}
                      </span>
                      <span className="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-full">
                        {q.difficulty}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {q.question}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Implementation Status */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-2xl border border-green-200 dark:border-green-800 p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
            ✅ Implementation Status
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-green-600 dark:text-green-400">Phase 1: Semantic Scoring</h4>
              <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1">
                <li>✅ Backend implemented</li>
                <li>✅ ML endpoints working</li>
                <li>✅ Frontend component ready</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-green-600 dark:text-green-400">Phase 2: RAG Resume</h4>
              <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1">
                <li>✅ Backend implemented</li>
                <li>✅ ML endpoints working</li>
                <li>✅ Frontend component ready</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-green-600 dark:text-green-400">Phase 3: Personalized Q's</h4>
              <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1">
                <li>✅ Backend implemented</li>
                <li>✅ ML endpoints working</li>
                <li>✅ Frontend component ready</li>
              </ul>
            </div>
          </div>
        </div>

        {/* API Endpoints */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-xl">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
            🚀 Available API Endpoints
          </h3>
          <div className="space-y-2 text-sm font-mono">
            <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
              <span className="text-green-600 dark:text-green-400">POST</span> /ml/embeddings/generate
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
              <span className="text-green-600 dark:text-green-400">POST</span> /ml/similarity/calculate
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
              <span className="text-green-600 dark:text-green-400">POST</span> /ml/resume/rag-parse
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
              <span className="text-green-600 dark:text-green-400">POST</span> /ml/resume/context
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
              <span className="text-green-600 dark:text-green-400">POST</span> /ml/resume/embeddings
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-800 p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
            📝 Next Steps
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-slate-700 dark:text-slate-300">
            <li>Upload a resume on the Profile page to test RAG parsing</li>
            <li>Start an interview to see personalized questions</li>
            <li>Submit answers to see hybrid scoring breakdown</li>
            <li>Check the interview report for detailed analytics</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
