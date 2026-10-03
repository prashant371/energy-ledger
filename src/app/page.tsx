"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Dumbbell, Activity, LineChart, Brain, TrendingUp } from 'lucide-react';
import { AnimatedButton } from '@/components/ui/animated-button';
import { useRouter } from 'next/navigation';

export default function Page() {
  const router = useRouter();
  return (
    <main className="min-h-screen bg-[#020205] text-white selection:bg-cyan-500/30 overflow-hidden font-sans">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[120px]" />
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full bg-cyan-600/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[50%] rounded-full bg-indigo-800/10 blur-[150px]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Activity className="w-6 h-6 text-cyan-500" />
          <span className="font-bold text-xl tracking-tight">IRON LOG</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/70">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#insights" className="hover:text-cyan-400 transition-colors">Insights</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
        </div>
        <AnimatedButton>Get Early Access</AnimatedButton>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 w-full flex flex-col items-center justify-center pt-32 pb-20 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm"
        >
          <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
          <span className="text-xs font-medium text-white/80">The future of fitness tracking is here</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="font-bold text-6xl md:text-8xl tracking-tighter max-w-4xl"
        >
          TRACK <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">SMARTER.</span><br />
          LIFT HEAVIER.
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 text-lg md:text-xl text-white/60 max-w-2xl font-light"
        >
          IRON LOG is the elite AI-powered calorie and fitness tracker that adapts to your metabolism and training style in real-time.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 flex flex-wrap justify-center gap-4 max-w-4xl"
        >
          <AnimatedButton onClick={() => router.push('/tdee-calculator?tab=meal')} className="px-6 py-3 text-md" style={{ background: '#2563eb' }}>
            🥗 Scan Meal
          </AnimatedButton>
          <AnimatedButton onClick={() => router.push('/tdee-calculator?tab=machine')} className="px-6 py-3 text-md" style={{ background: '#4f46e5' }}>
            🏋️ Scan Machine
          </AnimatedButton>
          <AnimatedButton onClick={() => router.push('/tdee-calculator?tab=calculator')} className="px-6 py-3 text-md" style={{ background: '#0891b2' }}>
            ⚡ TDEE Calculator
          </AnimatedButton>
          <AnimatedButton onClick={() => router.push('/tdee-calculator?tab=scanner')} className="px-6 py-3 text-md" style={{ background: '#ea580c' }}>
            🔬 Label Scanner
          </AnimatedButton>
          <button onClick={() => router.push('/ai-coach')} className="px-6 py-3 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 transition-colors backdrop-blur-sm">
            🤖 AI Coach
          </button>
        </motion.div>
      </section>

      {/* Features Grid Preview */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-4 py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard 
            icon={<Dumbbell className="w-8 h-8 text-cyan-500" />}
            title="AI Workout Generation"
            description="Personalized routines that evolve as you get stronger, breaking plateaus automatically."
            delay={0.4}
          />
          <FeatureCard 
            icon={<Brain className="w-8 h-8 text-cyan-500" />}
            title="Metabolic Adaptation"
            description="Calorie goals that adjust dynamically based on your daily activity and progress."
            delay={0.5}
          />
          <FeatureCard 
            icon={<LineChart className="w-8 h-8 text-cyan-500" />}
            title="Advanced Analytics"
            description="Deep insights into your recovery, muscle volume, and macro efficiency."
            delay={0.6}
          />
        </div>
      </section>

      {/* Insights Section */}
      <section id="insights" className="relative z-10 w-full bg-[#0a0a0f] border-t border-white/5 py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="flex-1 space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                Deep <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">Insights</span> into your biology.
              </h2>
              <p className="text-lg text-white/60">
                Stop guessing. Our AI analyzes your training volume, sleep patterns, and caloric intake to predict your exact metabolic rate and muscle growth potential.
              </p>
              <ul className="space-y-4 pt-4">
                {[
                  "Real-time Total Daily Energy Expenditure (TDEE) calculation.",
                  "Muscle recovery tracking per muscle group.",
                  "Micro-nutrient optimization for peak performance."
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="p-1 rounded-full bg-cyan-500/20">
                      <TrendingUp className="w-4 h-4 text-cyan-500" />
                    </div>
                    <span className="text-white/80">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1 w-full relative">
              <div className="absolute inset-0 bg-blue-600/10 blur-[80px] rounded-full" />
              <div className="relative border border-white/10 bg-[#050505]/80 backdrop-blur-md rounded-2xl p-6 shadow-2xl">
                {/* Mock Chart UI */}
                <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                  <div>
                    <h4 className="font-semibold text-white/90">Metabolic Rate</h4>
                    <p className="text-sm text-cyan-500">Trending up +2.4%</p>
                  </div>
                  <div className="text-right">
                    <h4 className="font-bold text-xl">2,840</h4>
                    <p className="text-sm text-white/50">kcal / day</p>
                  </div>
                </div>
                <div className="h-48 w-full flex items-end gap-2 pt-4">
                  {[40, 55, 45, 70, 65, 80, 95].map((h, i) => (
                    <div key={i} className="flex-1 bg-white/5 rounded-t-md relative group">
                      <div 
                        className="absolute bottom-0 w-full bg-gradient-to-t from-blue-600 to-cyan-400 rounded-t-md transition-all duration-500"
                        style={{ height: `${h}%` }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function FeatureCard({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-cyan-500/30 transition-colors group backdrop-blur-sm"
    >
      <div className="mb-4 p-3 rounded-lg bg-cyan-500/10 w-fit group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-white/60 leading-relaxed">{description}</p>
    </motion.div>
  );
}
