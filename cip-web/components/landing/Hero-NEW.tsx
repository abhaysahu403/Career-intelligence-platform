"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles, CheckCircle, Zap, Shield, Target } from "lucide-react";

export default function HeroNew() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A]">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Orbs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-1/4 -left-48 w-96 h-96 bg-gradient-to-r from-[#6366F1] to-[#3B82F6] rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity, delay: 1 }}
          className="absolute bottom-1/4 -right-48 w-96 h-96 bg-gradient-to-r from-[#06B6D4] to-[#14B8A6] rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{ duration: 12, repeat: Infinity, delay: 2 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] rounded-full blur-3xl"
        />

        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }} />
        </div>
        
        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="w-4 h-4 text-[#06B6D4]" />
          </motion.div>
          <span className="text-sm font-semibold text-white">
            AI-Powered Hiring Intelligence Platform
          </span>
          <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-[#10B981] to-[#06B6D4] text-xs font-bold text-white">
            LIVE
          </span>
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-6xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight"
        >
          <span className="block text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
            We Don't Just
          </span>
          <span className="block mt-2 bg-gradient-to-r from-[#6366F1] via-[#06B6D4] to-[#10B981] bg-clip-text text-transparent" style={{ fontFamily: 'Syne, sans-serif' }}>
            Prepare Candidates
          </span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="text-xl md:text-2xl text-gray-300 font-medium max-w-3xl mx-auto mb-4"
        >
          We <span className="text-[#06B6D4] font-bold">evaluate them like a real hiring system</span>
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="text-lg text-gray-400 max-w-2xl mx-auto mb-12"
        >
          AI interviews + Certificate validation + Career intelligence = Your hiring decision in 5 minutes
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
        >
          <motion.a
            href="/auth/signup"
            whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(99, 102, 241, 0.5)" }}
            whileTap={{ scale: 0.98 }}
            className="group relative px-8 py-4 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#3B82F6] text-white font-bold text-lg overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#3B82F6] to-[#6366F1] opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative flex items-center justify-center gap-2">
              Get Your Hiring Verdict
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </motion.a>
          
          <motion.a
            href="#demo"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="px-8 py-4 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 text-white font-bold text-lg hover:bg-white/20 transition-all"
          >
            Watch Demo
          </motion.a>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-20"
        >
          {[
            { icon: Zap, label: "Instant Evaluation", value: "< 5 min", color: "#6366F1" },
            { icon: Shield, label: "Trust Score", value: "95%", color: "#06B6D4" },
            { icon: Target, label: "Hiring Accuracy", value: "98%", color: "#10B981" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1 + i * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/30 transition-all"
            >
              <div className="flex items-center justify-center mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center">
                  <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
                </div>
              </div>
              <div className="text-3xl font-bold mb-1" style={{ color: stat.color, fontFamily: 'Syne, sans-serif' }}>
                {stat.value}
              </div>
              <div className="text-sm text-gray-400 font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Visual Demo */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="max-w-5xl mx-auto"
        >
          <div className="relative p-8 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 shadow-2xl">
            {/* Browser Bar */}
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-white/10">
              <div className="flex gap-2">
                {['#EF4444', '#F59E0B', '#10B981'].map((color) => (
                  <div key={color} className="w-3 h-3 rounded-full" style={{ background: color }} />
                ))}
              </div>
              <div className="flex-1 text-center">
                <span className="text-sm text-gray-400 font-mono">cip.ai/dashboard</span>
              </div>
            </div>

            {/* Final Verdict Display */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-[#10B981]/20 to-[#06B6D4]/10 border-2 border-[#10B981]/30 mb-6">
              <div className="text-center">
                <p className="text-xs font-bold text-[#10B981] mb-2 uppercase tracking-widest">FINAL VERDICT</p>
                <h2 className="text-6xl font-bold mb-3 flex items-center justify-center gap-4" style={{ fontFamily: 'Syne, sans-serif' }}>
                  <span className="text-5xl">✅</span>
                  <span className="text-[#10B981]">HIRE</span>
                </h2>
                <p className="text-sm text-gray-300">Candidate approved for hiring. Proceed with offer.</p>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'SIGNAL', value: 'STRONG', icon: '🟢', color: '#10B981' },
                { label: 'TRUST', value: '90', icon: '🛡️', color: '#06B6D4' },
                { label: 'RISK', value: 'LOW', icon: '✓', color: '#10B981' },
              ].map((metric) => (
                <div key={metric.label} className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                  <p className="text-xs text-gray-400 mb-2 font-semibold">{metric.label}</p>
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <span className="text-2xl">{metric.icon}</span>
                    <span className="text-2xl font-bold" style={{ color: metric.color, fontFamily: 'Syne, sans-serif' }}>
                      {metric.value}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Floating Labels */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute -top-4 -left-4 px-4 py-2 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#3B82F6] text-white text-sm font-bold shadow-lg"
          >
            AI Decision Engine
          </motion.div>
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
            className="absolute -bottom-4 -right-4 px-4 py-2 rounded-xl bg-gradient-to-r from-[#10B981] to-[#06B6D4] text-white text-sm font-bold shadow-lg"
          >
            Real-time Evaluation
          </motion.div>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-16 flex flex-wrap items-center justify-center gap-8 text-gray-400"
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-[#10B981]" />
            <span className="text-sm font-medium">Enterprise-grade Security</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-[#10B981]" />
            <span className="text-sm font-medium">GDPR Compliant</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-[#10B981]" />
            <span className="text-sm font-medium">99.9% Uptime</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
