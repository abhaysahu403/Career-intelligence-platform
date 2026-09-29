"use client";

import { motion } from "framer-motion";
import {
  Brain,
  Zap,
  Target,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI Interview Coach",
    description:
      "Practice with realistic AI interviews. The system analyzes tone, content, confidence, and pacing, then gives focused feedback after every answer.",
    color: "#38BDF8",
    gradient: "from-sky/20 to-sky/5",
    tag: "Core Module",
    bullets: ["Voice recognition", "Sentiment analysis", "Adaptive difficulty"],
  },
  {
    icon: Zap,
    title: "Skill Intelligence",
    description:
      "Upload your resume and get an instant 360° skill audit. AI identifies your gaps, maps learning paths, and shows exactly what companies want.",
    color: "#818CF8",
    gradient: "from-[#818CF8]/20 to-[#818CF8]/5",
    tag: "Smart Analysis",
    bullets: ["Resume parsing", "Gap mapping", "Learning paths"],
  },
  {
    icon: Target,
    title: "Smart Job Matching",
    description:
      "AI cross-references your skill DNA against 400+ live job postings and surfaces only roles where your match score exceeds 75%. No noise.",
    color: "#4ADE80",
    gradient: "from-mint/20 to-mint/5",
    tag: "Live Jobs",
    bullets: ["400+ companies", "Real-time sync", "Match scoring"],
  },
  {
    icon: ShieldCheck,
    title: "Certificate Validator",
    description:
      "ML-powered OCR verifies certificate authenticity instantly. Detect tampering, confirm credentials, and build a verified portfolio employers trust.",
    color: "#34D399",
    gradient: "from-[#34D399]/20 to-[#34D399]/5",
    tag: "Trust Layer",
    bullets: ["OCR scanning", "Tamper detection", "Verified badges"],
  },
];

export default function Features() {
  return (
    <section id="features" className="py-28 px-6 relative overflow-hidden">
      {/* Section background & ambient glows */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0B1120]/60 to-transparent pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-sky/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-mint/10 border border-mint/20 mb-5 shadow-[0_0_10px_rgba(74,222,128,0.1)]"
          >
            <Sparkles className="w-3.5 h-3.5 text-mint" />
            <span className="text-xs font-black text-mint uppercase tracking-widest">
              Four Powerful Modules
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-syne text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4"
          >
            Everything You Need to{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky to-mint">Land Your Dream Job</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-[#A1A1AA] text-lg max-w-2xl mx-auto"
          >
            Each module is independently powerful. Together, they form an
            unstoppable career OS.
          </motion.p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              whileHover={{ scale: 1.03, y: -6 }}
              className="group relative p-6 rounded-[32px] bg-[rgba(8,12,20,0.7)] border backdrop-blur-[40px] saturate-150 transition-all duration-500 cursor-pointer overflow-hidden hover:-translate-y-2"
              style={{
                boxShadow: `0 8px 30px -10px ${f.color}30, inset 0 0 30px ${f.color}15`,
                borderColor: `${f.color}40`
              }}
            >
              {/* Permanent subtle inner glow */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${f.gradient} opacity-40 group-hover:opacity-100 transition-opacity duration-500`} />

              {/* Top shimmer line - constant glow */}
              <div
                className="absolute top-0 left-0 right-0 h-[2px] opacity-70 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: `linear-gradient(90deg, transparent, ${f.color}, transparent)`,
                  boxShadow: `0 0 15px ${f.color}`,
                }}
              />

              <div className="relative z-10">
                {/* Tag */}
                <div
                  className="inline-block px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider mb-4"
                  style={{
                    background: `${f.color}15`,
                    color: f.color,
                    border: `1px solid ${f.color}30`,
                  }}
                >
                  {f.tag}
                </div>

                {/* Icon */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-300"
                  style={{
                    background: `linear-gradient(135deg, ${f.color}30, ${f.color}10)`,
                    border: `1px solid ${f.color}25`,
                  }}
                >
                  <f.icon className="w-6 h-6" style={{ color: f.color }} />
                </div>

                {/* Title */}
                <h3 className="font-syne text-xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
                  {f.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-[#A1A1AA] leading-relaxed mb-4">
                  {f.description}
                </p>

                {/* Bullets */}
                <ul className="space-y-1.5 mb-4">
                  {f.bullets.map((b) => (
                    <li
                      key={b}
                      className="flex items-center gap-2 text-xs text-[#71717A]"
                    >
                      <span
                        className="w-1 h-1 rounded-full"
                        style={{ background: f.color }}
                      />
                      {b}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <div
                  className="flex items-center gap-1.5 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ color: f.color }}
                >
                  Explore module
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-[#4F46E5]/10 via-[#06B6D4]/10 to-[#22C55E]/10 border border-white/[0.06] flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <div>
            <div className="font-syne text-lg font-bold text-slate-900 dark:text-white mb-1">
              All modules included in every plan
            </div>
            <div className="text-sm text-[#A1A1AA]">
              No feature gates. Full access from day one.
            </div>
          </div>
          <motion.a
            href="#cta"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="flex-shrink-0 px-8 py-3.5 rounded-full bg-gradient-to-r from-sky to-mint text-[#020617] text-xs font-black shadow-[0_0_20px_rgba(74,222,128,0.3)] hover:shadow-[0_0_30px_rgba(56,189,248,0.5)] transition-all uppercase tracking-widest"
          >
            Start for Free →
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
