'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';

interface Question {
  questionText: string;
  expectedAnswer: string;
  topic: string;
  difficulty: string;
  points: number;
}

export default function CreateInterviewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Interview details
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [difficulty, setDifficulty] = useState('MEDIUM');
  
  // Questions
  const [questions, setQuestions] = useState<Question[]>([
    { questionText: '', expectedAnswer: '', topic: '', difficulty: 'MEDIUM', points: 10 }
  ]);

  const addQuestion = () => {
    setQuestions([...questions, { 
      questionText: '', 
      expectedAnswer: '', 
      topic: '', 
      difficulty: 'MEDIUM', 
      points: 10 
    }]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const updateQuestion = (index: number, field: keyof Question, value: string | number) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!title.trim()) {
      toast.error('Please enter interview title');
      return;
    }
    
    const validQuestions = questions.filter(q => q.questionText.trim());
    if (validQuestions.length === 0) {
      toast.error('Please add at least one question');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/custom-interview/create', {
        title,
        description,
        durationMinutes,
        difficulty,
        questions: validQuestions
      });

      const interview = response.data.data;
      toast.success(`Interview created! Code: ${interview.interviewCode}`);
      router.push('/faculty/dashboard');
    } catch (error: any) {
      console.error('Failed to create interview:', error);
      toast.error(error.response?.data?.message || 'Failed to create interview');
    } finally {
      setLoading(false);
    }
  };

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
            Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold text-white mb-2">Create Custom Interview</h1>
          <p className="text-gray-400">Design your own interview with custom questions</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Interview Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
          >
            <h2 className="text-2xl font-bold text-white mb-4">Interview Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Interview Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Java Backend Developer Interview"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#38BDF8]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the interview..."
                  rows={3}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#38BDF8]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(parseInt(e.target.value))}
                    min="10"
                    max="120"
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#38BDF8]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Difficulty
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#38BDF8]"
                  >
                    <option value="EASY" className="bg-[#01030F]">Easy</option>
                    <option value="MEDIUM" className="bg-[#01030F]">Medium</option>
                    <option value="HARD" className="bg-[#01030F]">Hard</option>
                  </select>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Questions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">Questions</h2>
              <button
                type="button"
                onClick={addQuestion}
                className="flex items-center gap-2 px-4 py-2 bg-[#38BDF8] text-white rounded-lg hover:bg-[#0EA5E9] transition-colors"
              >
                <Plus size={20} />
                Add Question
              </button>
            </div>

            <div className="space-y-6">
              {questions.map((question, index) => (
                <div
                  key={index}
                  className="bg-white/5 rounded-xl border border-white/10 p-4"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Question {index + 1}</h3>
                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuestion(index)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Question Text *
                      </label>
                      <textarea
                        value={question.questionText}
                        onChange={(e) => updateQuestion(index, 'questionText', e.target.value)}
                        placeholder="Enter your question..."
                        rows={3}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#38BDF8]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Expected Answer (for AI evaluation)
                      </label>
                      <textarea
                        value={question.expectedAnswer}
                        onChange={(e) => updateQuestion(index, 'expectedAnswer', e.target.value)}
                        placeholder="Key points that should be covered in the answer..."
                        rows={2}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#38BDF8]"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Topic
                        </label>
                        <input
                          type="text"
                          value={question.topic}
                          onChange={(e) => updateQuestion(index, 'topic', e.target.value)}
                          placeholder="e.g., Java, DSA"
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#38BDF8]"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Difficulty
                        </label>
                        <select
                          value={question.difficulty}
                          onChange={(e) => updateQuestion(index, 'difficulty', e.target.value)}
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#38BDF8]"
                        >
                          <option value="EASY" className="bg-[#01030F]">Easy</option>
                          <option value="MEDIUM" className="bg-[#01030F]">Medium</option>
                          <option value="HARD" className="bg-[#01030F]">Hard</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Points
                        </label>
                        <input
                          type="number"
                          value={question.points}
                          onChange={(e) => updateQuestion(index, 'points', parseInt(e.target.value))}
                          min="1"
                          max="100"
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#38BDF8]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex justify-end gap-4"
          >
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#38BDF8] to-[#0EA5E9] text-white rounded-lg hover:shadow-lg hover:shadow-[#38BDF8]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Create Interview
                </>
              )}
            </button>
          </motion.div>
        </form>
      </div>
    </div>
  );
}
