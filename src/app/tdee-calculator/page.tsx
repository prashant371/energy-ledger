"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Zap, Droplet, Camera, Microscope, Trash2, Utensils, Activity, Dumbbell, Upload, AlertTriangle, CheckCircle, XCircle, Loader2, Plus } from 'lucide-react';
import Link from 'next/link';

// ─── Types ───────────────────────────────────────────────────────────────────
type Tab = "calculator" | "ledger" | "meal" | "machine" | "scanner";

interface MealResult {
  mealName: string; totalCalories: number; protein: number; carbs: number; fat: number;
  fiber: number; servingSize: string; healthScore: number; healthLabel: string;
  ingredients: string[]; tips: string[];
}
interface MachineResult {
  machineName: string; category: string; primaryMuscles: string[]; secondaryMuscles: string[];
  metValue: number; caloriesBurnedPerHour: number; difficultyLevel: string;
  formTips: string[]; commonMistakes: string[]; safetyNotes: string;
}
interface LabelResult {
  productName: string; overallGrade: string; gradeColor: string; gradeExplanation: string;
  totalCalories: number; servingSize: string;
  harmfulIngredients: { name: string; reason: string; severity: string }[];
  goodIngredients: string[]; allergens: string[];
  additives: { name: string; type: string; safe: boolean }[];
  verdict: string; recommendation: string;
}
interface LedgerEntry { id: string; name: string; calories: number; type: 'meal' | 'workout'; time: string; }

// ─── Helper: image file → base64 ─────────────────────────────────────────────
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = (reader.result as string).split(',')[1];
      resolve(result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ─── Scanner Drop Zone ────────────────────────────────────────────────────────
function ScanDropzone({ onFile, accentColor, icon: Icon, label }: {
  onFile: (f: File) => void;
  accentColor: string;
  icon: any;
  label: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) onFile(file);
  }, [onFile]);

  return (
    <div
      className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all relative group min-h-[260px] ${dragging ? `border-${accentColor}-400 bg-${accentColor}-500/10` : 'border-white/10 bg-[#0a0a0f] hover:border-white/30'}`}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
      <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-white/20 group-hover:border-white/50 transition-colors" />
      <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-white/20 group-hover:border-white/50 transition-colors" />
      <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-white/20 group-hover:border-white/50 transition-colors" />
      <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-white/20 group-hover:border-white/50 transition-colors" />
      <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform bg-white/5">
        <Icon className="w-6 h-6 text-white/50" />
      </div>
      <p className="font-mono text-xs text-white/50 uppercase tracking-widest mb-1">{label}</p>
      <p className="font-mono text-[10px] text-white/30 uppercase tracking-widest">Tap to upload or drag & drop</p>
      <div className="mt-4 flex items-center gap-2 text-xs text-white/30">
        <Upload className="w-3 h-3" /> JPG, PNG, WEBP supported
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function TDEECalculatorPage() {
  const [activeTab, setActiveTab] = useState<Tab>("calculator");

  // TDEE calculator state
  const [name, setName] = useState("Aarav");
  const [sex, setSex] = useState<"male" | "female">("male");
  const [age, setAge] = useState(25);
  const [weight, setWeight] = useState(80);
  const [height, setHeight] = useState(178);
  const [activity, setActivity] = useState(1.55);
  const [goal, setGoal] = useState("maintain");
  const [results, setResults] = useState<{ bmr: number; tdee: number; protein: number; carbs: number; fat: number; water: number; } | null>(null);

  // Scanner states
  const [mealImage, setMealImage] = useState<string | null>(null);
  const [mealLoading, setMealLoading] = useState(false);
  const [mealResult, setMealResult] = useState<MealResult | null>(null);
  const [mealError, setMealError] = useState<string | null>(null);

  const [machineImage, setMachineImage] = useState<string | null>(null);
  const [machineLoading, setMachineLoading] = useState(false);
  const [machineResult, setMachineResult] = useState<MachineResult | null>(null);
  const [machineError, setMachineError] = useState<string | null>(null);

  const [labelImage, setLabelImage] = useState<string | null>(null);
  const [labelLoading, setLabelLoading] = useState(false);
  const [labelResult, setLabelResult] = useState<LabelResult | null>(null);
  const [labelError, setLabelError] = useState<string | null>(null);

  // Energy Ledger state (persisted in localStorage)
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab && ["calculator", "ledger", "scanner", "meal", "machine"].includes(tab)) {
      setActiveTab(tab as Tab);
    }
    // Load ledger from localStorage
    try {
      const saved = localStorage.getItem('ironlog_ledger');
      if (saved) {
        const parsed = JSON.parse(saved);
        setLedger(Array.isArray(parsed) ? parsed : []);
      }
    } catch {
      setLedger([]);
    }
  }, []);

  const saveLedger = (entries: LedgerEntry[]) => {
    setLedger(entries);
    localStorage.setItem('ironlog_ledger', JSON.stringify(entries));
  };

  // TDEE calculation
  const calculate = () => {
    let bmr = sex === "male"
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161;
    let tdee = bmr * activity;
    if (goal === "cut") tdee -= 500;
    if (goal === "bulk") tdee += 500;
    setResults({
      bmr: Math.round(bmr), tdee: Math.round(tdee),
      protein: Math.round((tdee * 0.3) / 4), carbs: Math.round((tdee * 0.4) / 4),
      fat: Math.round((tdee * 0.3) / 9), water: Number((weight * 0.035).toFixed(1))
    });
  };

  // ─── Meal Scanner ───────────────────────────────────────────────────────────
  const handleMealFile = async (file: File) => {
    const previewUrl = URL.createObjectURL(file);
    setMealImage(previewUrl);
    setMealLoading(true);
    setMealError(null);
    setMealResult(null);
    try {
      const base64 = await fileToBase64(file);
      const res = await fetch('/api/scan-meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mimeType: file.type })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Scan failed');
      setMealResult(data);
    } catch (e: any) {
      setMealError(e.message);
    } finally {
      setMealLoading(false);
    }
  };

  const logMealToLedger = () => {
    if (!mealResult) return;
    const entry: LedgerEntry = {
      id: Date.now().toString(),
      name: mealResult.mealName,
      calories: mealResult.totalCalories,
      type: 'meal',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    saveLedger([...ledger, entry]);
  };

  // ─── Machine Scanner ────────────────────────────────────────────────────────
  const handleMachineFile = async (file: File) => {
    const previewUrl = URL.createObjectURL(file);
    setMachineImage(previewUrl);
    setMachineLoading(true);
    setMachineError(null);
    setMachineResult(null);
    try {
      const base64 = await fileToBase64(file);
      const res = await fetch('/api/scan-machine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mimeType: file.type })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Scan failed');
      setMachineResult(data);
    } catch (e: any) {
      setMachineError(e.message);
    } finally {
      setMachineLoading(false);
    }
  };

  const logWorkoutToLedger = () => {
    if (!machineResult) return;
    const entry: LedgerEntry = {
      id: Date.now().toString(),
      name: `${machineResult.machineName} (1hr)`,
      calories: machineResult.caloriesBurnedPerHour,
      type: 'workout',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    saveLedger([...ledger, entry]);
  };

  // ─── Label Scanner ──────────────────────────────────────────────────────────
  const handleLabelFile = async (file: File) => {
    const previewUrl = URL.createObjectURL(file);
    setLabelImage(previewUrl);
    setLabelLoading(true);
    setLabelError(null);
    setLabelResult(null);
    try {
      const base64 = await fileToBase64(file);
      const res = await fetch('/api/scan-label', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mimeType: file.type })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Scan failed');
      setLabelResult(data);
    } catch (e: any) {
      setLabelError(e.message);
    } finally {
      setLabelLoading(false);
    }
  };

  // ─── Ledger helpers ─────────────────────────────────────────────────────────
  const mealsIn = ledger.filter(e => e.type === 'meal').reduce((s, e) => s + e.calories, 0);
  const workoutBurn = ledger.filter(e => e.type === 'workout').reduce((s, e) => s + e.calories, 0);
  const netCalories = mealsIn - workoutBurn;
  const budget = results?.tdee || 2000;
  const budgetPct = Math.min(100, Math.round((mealsIn / budget) * 100));

  const gradeColorMap: Record<string, string> = {
    green: 'text-emerald-400', yellow: 'text-yellow-400',
    orange: 'text-orange-400', red: 'text-red-400'
  };
  const recommendationBg: Record<string, string> = {
    'Eat Freely': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    'Eat Occasionally': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    'Eat Rarely': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    'Avoid': 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  return (
    <main className="min-h-screen bg-[#020205] text-white font-sans p-6 md:p-10 overflow-x-hidden">
      <Link href="/" className="inline-flex items-center text-cyan-500 hover:text-cyan-400 mb-8 transition-colors text-sm">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
      </Link>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto mb-10 border-b border-white/10 flex flex-wrap gap-1">
        {([
          { id: 'calculator', label: '⚡ Calculator' },
          { id: 'ledger', label: '📊 Energy Ledger' },
          { id: 'meal', label: '🥗 Meal Scanner' },
          { id: 'machine', label: '🏋️ Machine Scanner' },
          { id: 'scanner', label: '🔬 Label Scanner' },
        ] as { id: Tab; label: string }[]).map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-3 text-sm font-mono uppercase tracking-wider border-b-2 transition-all ${activeTab === tab.id ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-white/40 hover:text-white/70'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="max-w-7xl mx-auto">
        <AnimatePresence mode="wait">

          {/* ─── CALCULATOR TAB ─── */}
          {activeTab === "calculator" && (
            <motion.div key="calculator" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div>
                <h1 className="text-3xl font-bold uppercase tracking-tight mb-1">Your Numbers</h1>
                <p className="text-white/40 text-sm mb-8">Calculate your precise daily energy budget</p>
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs text-white/40 font-mono mb-2 uppercase tracking-wider">Athlete Name</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-[#0a0a0f] border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-500 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 font-mono mb-2 uppercase tracking-wider">Sex</label>
                    <div className="flex gap-2">
                      {(['male', 'female'] as const).map(s => (
                        <button key={s} onClick={() => setSex(s)} className={`flex-1 py-3 rounded-lg font-medium transition-colors capitalize ${sex === s ? 'bg-cyan-600 text-white' : 'bg-[#0a0a0f] border border-white/10 text-white/50'}`}>{s === 'male' ? '♂' : '♀'} {s}</button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-white/40 font-mono mb-2 uppercase tracking-wider">Age</label>
                      <input type="number" value={age} onChange={(e) => setAge(+e.target.value)} className="w-full bg-[#0a0a0f] border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-500 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs text-white/40 font-mono mb-2 uppercase tracking-wider">Weight (kg)</label>
                      <input type="number" value={weight} onChange={(e) => setWeight(+e.target.value)} className="w-full bg-[#0a0a0f] border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-500 transition-colors" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 font-mono mb-2 uppercase tracking-wider">Height (cm)</label>
                    <input type="number" value={height} onChange={(e) => setHeight(+e.target.value)} className="w-full bg-[#0a0a0f] border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-500 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 font-mono mb-2 uppercase tracking-wider">Activity Level</label>
                    <select value={activity} onChange={(e) => setActivity(+e.target.value)} className="w-full bg-[#0a0a0f] border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-500 transition-colors appearance-none">
                      <option value={1.2}>Sedentary — Little/no exercise</option>
                      <option value={1.375}>Light — 1–2 days/week</option>
                      <option value={1.55}>Moderate — 3–5 days/week</option>
                      <option value={1.725}>Active — 6–7 days/week</option>
                      <option value={1.9}>Very Active — 2× per day</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 font-mono mb-2 uppercase tracking-wider">Goal</label>
                    <select value={goal} onChange={(e) => setGoal(e.target.value)} className="w-full bg-[#0a0a0f] border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-500 transition-colors appearance-none">
                      <option value="cut">Cut — Deficit (−500 kcal)</option>
                      <option value="maintain">Maintain — Eat at TDEE</option>
                      <option value="bulk">Bulk — Surplus (+500 kcal)</option>
                    </select>
                  </div>
                  <button onClick={calculate} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-4 rounded-lg flex items-center justify-center gap-2 transition-colors uppercase tracking-wider">
                    <Zap className="w-5 h-5" /> Calculate My Budget
                  </button>
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold uppercase tracking-tight mb-1">Energy Profile</h1>
                <p className="text-white/40 text-sm mb-8">Your personalized macro targets</p>
                <div className="border border-white/10 rounded-2xl bg-[#0a0a0f] overflow-hidden">
                  <div className="p-6 border-b border-white/5">
                    <p className="text-cyan-500 text-xs font-mono uppercase tracking-widest mb-1">Iron Log</p>
                    <h2 className="text-3xl font-bold uppercase">{name || 'Athlete'}</h2>
                    <p className="text-white/40 text-sm font-mono mt-1">{weight}kg · {height}cm · {age}y</p>
                  </div>
                  {results ? (
                    <div className="p-8">
                      <div className="flex flex-col items-center mb-10">
                        <div className="relative w-44 h-44 flex items-center justify-center rounded-full border-[10px] border-cyan-500/20 shadow-[0_0_30px_rgba(6,182,212,0.2)]">
                          <svg className="absolute inset-0 w-full h-full -rotate-90">
                            <circle cx="88" cy="88" r="78" stroke="currentColor" strokeWidth="10" fill="none" className="text-cyan-500" strokeDasharray="490" strokeDashoffset="120" strokeLinecap="round" />
                          </svg>
                          <div className="text-center z-10">
                            <div className="text-3xl font-bold text-cyan-400">{results.tdee.toLocaleString()}</div>
                            <div className="text-xs text-white/40 font-mono mt-1">KCAL/DAY</div>
                          </div>
                        </div>
                        <p className="text-white/40 text-xs font-mono tracking-widest mt-4 uppercase">{goal} target</p>
                      </div>
                      <div className="space-y-3 mb-8">
                        {[
                          { label: 'Protein', val: results.protein, color: 'bg-red-500', total: results.protein + results.carbs + results.fat },
                          { label: 'Carbs', val: results.carbs, color: 'bg-yellow-500', total: results.protein + results.carbs + results.fat },
                          { label: 'Fat', val: results.fat, color: 'bg-cyan-500', total: results.protein + results.carbs + results.fat },
                        ].map(m => (
                          <div key={m.label}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-white/60">{m.label}</span>
                              <span className="font-mono font-bold">{m.val}g</span>
                            </div>
                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                              <div className={`h-full ${m.color} rounded-full`} style={{ width: `${(m.val / m.total) * 100}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-3 border-t border-white/5 pt-5 text-sm">
                        <div className="flex justify-between"><span className="text-white/50">BMR</span><span className="font-mono text-emerald-400 font-bold">{results.bmr.toLocaleString()} kcal</span></div>
                        <div className="flex justify-between"><span className="text-white/50">TDEE ({goal})</span><span className="font-mono text-emerald-400 font-bold">{results.tdee.toLocaleString()} kcal</span></div>
                        <div className="flex justify-between"><span className="text-white/50">Daily Water</span><span className="font-mono text-blue-400 font-bold flex items-center gap-1"><Droplet className="w-3 h-3 fill-blue-400" />{results.water}L</span></div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-12 flex flex-col items-center justify-center text-center text-white/30 min-h-[400px]">
                      <Zap className="w-12 h-12 mb-4 opacity-30" />
                      <p className="text-sm">Fill out your numbers above<br />and calculate to see results.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── ENERGY LEDGER TAB ─── */}
          {activeTab === "ledger" && (
            <motion.div key="ledger" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <h1 className="text-3xl font-bold uppercase tracking-tight mb-1">Energy Ledger</h1>
              <p className="text-white/40 text-sm mb-8">Today's calorie balance — meals scanned automatically log here</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { title: 'Budget', value: budget, sub: 'kcal target', color: 'text-cyan-400' },
                  { title: 'Calories In', value: mealsIn, sub: `${ledger.filter(e=>e.type==='meal').length} meal(s)`, color: 'text-yellow-400' },
                  { title: 'Burned', value: workoutBurn, sub: `${ledger.filter(e=>e.type==='workout').length} workout(s)`, color: 'text-emerald-400' },
                  { title: 'Net Balance', value: netCalories, sub: netCalories <= 0 ? '✓ On track' : `${netCalories - budget > 0 ? '▲ Over' : '~'}`, color: netCalories > budget ? 'text-red-400' : 'text-cyan-400' },
                ].map(c => (
                  <div key={c.title} className="bg-[#0a0a0f] border border-white/10 rounded-xl p-5">
                    <p className="text-xs text-white/40 font-mono uppercase tracking-widest mb-2">{c.title}</p>
                    <p className={`text-2xl font-bold ${c.color}`}>{c.value.toLocaleString()}</p>
                    <p className="text-xs text-white/30 mt-1">{c.sub}</p>
                  </div>
                ))}
              </div>

              <div className="bg-[#0a0a0f] border border-white/10 rounded-xl p-4 mb-6">
                <div className="flex justify-between text-xs font-mono text-white/40 mb-2 uppercase">
                  <span>Budget Usage</span>
                  <span className={budgetPct > 100 ? 'text-red-400' : 'text-cyan-400'}>{budgetPct}%</span>
                </div>
                <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${budgetPct > 100 ? 'bg-red-500' : budgetPct > 80 ? 'bg-yellow-500' : 'bg-cyan-500'}`} style={{ width: `${Math.min(budgetPct, 100)}%` }} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#0a0a0f] border border-white/10 rounded-xl p-5 min-h-[220px] flex flex-col">
                  <div className="flex justify-between items-center mb-4 pb-3 border-b border-white/5">
                    <div className="flex items-center gap-2 font-bold uppercase text-sm"><Utensils className="w-4 h-4 text-yellow-400" /> Meals</div>
                    <span className="text-yellow-400 font-mono font-bold text-sm">{mealsIn} KCAL</span>
                  </div>
                  {ledger.filter(e => e.type === 'meal').length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-white/20 text-sm">Scan a meal to log it here</div>
                  ) : (
                    <div className="flex-1 space-y-2">
                      {ledger.filter(e => e.type === 'meal').map(e => (
                        <div key={e.id} className="flex justify-between items-center py-2 border-b border-white/5">
                          <div>
                            <p className="text-sm font-medium">{e.name}</p>
                            <p className="text-xs text-white/30 font-mono">{e.time}</p>
                          </div>
                          <span className="text-yellow-400 font-mono text-sm">{e.calories} kcal</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="bg-[#0a0a0f] border border-white/10 rounded-xl p-5 min-h-[220px] flex flex-col">
                  <div className="flex justify-between items-center mb-4 pb-3 border-b border-white/5">
                    <div className="flex items-center gap-2 font-bold uppercase text-sm"><Activity className="w-4 h-4 text-emerald-400" /> Workouts</div>
                    <span className="text-emerald-400 font-mono font-bold text-sm">{workoutBurn} KCAL</span>
                  </div>
                  {ledger.filter(e => e.type === 'workout').length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-white/20 text-sm">Scan a machine to log a workout</div>
                  ) : (
                    <div className="flex-1 space-y-2">
                      {ledger.filter(e => e.type === 'workout').map(e => (
                        <div key={e.id} className="flex justify-between items-center py-2 border-b border-white/5">
                          <div>
                            <p className="text-sm font-medium">{e.name}</p>
                            <p className="text-xs text-white/30 font-mono">{e.time}</p>
                          </div>
                          <span className="text-emerald-400 font-mono text-sm">{e.calories} kcal</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {ledger.length > 0 && (
                <div className="mt-4 flex justify-end">
                  <button onClick={() => saveLedger([])} className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-white/10 hover:bg-red-500/10 hover:border-red-500/30 transition-colors text-white/40 hover:text-red-400 text-sm font-mono uppercase">
                    <Trash2 className="w-4 h-4" /> Reset Today's Log
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* ─── MEAL SCANNER TAB ─── */}
          {activeTab === "meal" && (
            <motion.div key="meal" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div>
                <h1 className="text-3xl font-bold uppercase tracking-tight mb-1">Meal Scanner</h1>
                <p className="text-white/40 text-sm mb-8">Snap your meal — Gemini AI breaks down every macro instantly.</p>
                <ScanDropzone onFile={handleMealFile} accentColor="emerald" icon={Utensils} label="Drop meal photo here" />
                {mealImage && (
                  <div className="mt-4 rounded-xl overflow-hidden border border-white/10">
                    <img src={mealImage} alt="Meal preview" className="w-full max-h-48 object-cover" />
                  </div>
                )}
              </div>

              <div>
                <h1 className="text-3xl font-bold uppercase tracking-tight mb-1">Macro Analysis</h1>
                <p className="text-white/40 text-sm mb-8">AI food identification & nutritional breakdown</p>
                <div className="border border-white/10 bg-[#0a0a0f] rounded-2xl min-h-[300px] p-6">
                  {mealLoading && (
                    <div className="flex flex-col items-center justify-center h-full min-h-[250px] gap-3">
                      <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
                      <p className="text-white/40 text-sm font-mono">Gemini is analyzing your meal...</p>
                    </div>
                  )}
                  {mealError && (
                    <div className="flex flex-col items-center justify-center h-full min-h-[250px] gap-3 text-red-400">
                      <XCircle className="w-10 h-10" />
                      <p className="text-sm">{mealError}</p>
                    </div>
                  )}
                  {!mealLoading && !mealError && !mealResult && (
                    <div className="flex flex-col items-center justify-center h-full min-h-[250px] gap-3 text-white/20">
                      <Utensils className="w-12 h-12" />
                      <p className="text-sm">Upload a meal photo to get started</p>
                    </div>
                  )}
                  {mealResult && (
                    <div className="space-y-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-bold">{mealResult.mealName}</h3>
                          <p className="text-white/40 text-xs mt-1">{mealResult.servingSize}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold border ${mealResult.healthScore >= 7 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : mealResult.healthScore >= 5 ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                          {mealResult.healthLabel} {mealResult.healthScore}/10
                        </div>
                      </div>

                      <div className="text-center py-4 border border-white/5 rounded-xl bg-white/[0.02]">
                        <div className="text-4xl font-bold text-cyan-400">{mealResult.totalCalories}</div>
                        <div className="text-xs text-white/40 font-mono mt-1">TOTAL CALORIES</div>
                      </div>

                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { label: 'Protein', val: mealResult.protein, color: 'text-red-400' },
                          { label: 'Carbs', val: mealResult.carbs, color: 'text-yellow-400' },
                          { label: 'Fat', val: mealResult.fat, color: 'text-cyan-400' },
                          { label: 'Fiber', val: mealResult.fiber, color: 'text-emerald-400' },
                        ].map(m => (
                          <div key={m.label} className="bg-white/5 rounded-lg p-3 text-center">
                            <div className={`text-lg font-bold ${m.color}`}>{m.val}g</div>
                            <div className="text-xs text-white/40">{m.label}</div>
                          </div>
                        ))}
                      </div>

                      {mealResult.tips.length > 0 && (
                        <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-lg p-3 space-y-1">
                          {mealResult.tips.map((tip, i) => <p key={i} className="text-xs text-cyan-200/70">💡 {tip}</p>)}
                        </div>
                      )}

                      <button onClick={logMealToLedger} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors uppercase tracking-wider text-sm">
                        <Plus className="w-4 h-4" /> Log to Energy Ledger
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── MACHINE SCANNER TAB ─── */}
          {activeTab === "machine" && (
            <motion.div key="machine" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div>
                <h1 className="text-3xl font-bold uppercase tracking-tight mb-1">Machine Scanner</h1>
                <p className="text-white/40 text-sm mb-8">Point at any gym machine — Gemini identifies it and gives you full form instructions.</p>
                <ScanDropzone onFile={handleMachineFile} accentColor="indigo" icon={Dumbbell} label="Drop machine photo here" />
                {machineImage && (
                  <div className="mt-4 rounded-xl overflow-hidden border border-white/10">
                    <img src={machineImage} alt="Machine preview" className="w-full max-h-48 object-cover" />
                  </div>
                )}
              </div>

              <div>
                <h1 className="text-3xl font-bold uppercase tracking-tight mb-1">Machine ID</h1>
                <p className="text-white/40 text-sm mb-8">AI equipment analysis, MET values & form tips</p>
                <div className="border border-white/10 bg-[#0a0a0f] rounded-2xl min-h-[300px] p-6">
                  {machineLoading && (
                    <div className="flex flex-col items-center justify-center h-full min-h-[250px] gap-3">
                      <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
                      <p className="text-white/40 text-sm font-mono">Gemini is identifying the machine...</p>
                    </div>
                  )}
                  {machineError && (
                    <div className="flex flex-col items-center justify-center h-full min-h-[250px] gap-3 text-red-400">
                      <XCircle className="w-10 h-10" />
                      <p className="text-sm">{machineError}</p>
                    </div>
                  )}
                  {!machineLoading && !machineError && !machineResult && (
                    <div className="flex flex-col items-center justify-center h-full min-h-[250px] gap-3 text-white/20">
                      <Dumbbell className="w-12 h-12" />
                      <p className="text-sm">Upload a machine photo to get started</p>
                    </div>
                  )}
                  {machineResult && (
                    <div className="space-y-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-bold">{machineResult.machineName}</h3>
                          <p className="text-white/40 text-xs mt-1">{machineResult.category} · {machineResult.difficultyLevel}</p>
                        </div>
                        <div className="text-center bg-indigo-500/20 border border-indigo-500/30 px-3 py-2 rounded-lg">
                          <div className="text-lg font-bold text-indigo-400">{machineResult.caloriesBurnedPerHour}</div>
                          <div className="text-[10px] text-white/40 font-mono">KCAL/HR</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/5 rounded-lg p-3">
                          <p className="text-xs text-white/40 font-mono mb-2 uppercase">Primary Muscles</p>
                          <div className="flex flex-wrap gap-1">
                            {machineResult.primaryMuscles.map(m => <span key={m} className="text-xs bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full">{m}</span>)}
                          </div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3">
                          <p className="text-xs text-white/40 font-mono mb-2 uppercase">Secondary Muscles</p>
                          <div className="flex flex-wrap gap-1">
                            {machineResult.secondaryMuscles.map(m => <span key={m} className="text-xs bg-white/10 text-white/50 px-2 py-0.5 rounded-full">{m}</span>)}
                          </div>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-white/40 font-mono uppercase mb-2">Form Tips</p>
                        <div className="space-y-1.5">
                          {machineResult.formTips.map((tip, i) => (
                            <div key={i} className="flex gap-2 text-sm text-white/70">
                              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> {tip}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-white/40 font-mono uppercase mb-2">Common Mistakes</p>
                        <div className="space-y-1.5">
                          {machineResult.commonMistakes.map((m, i) => (
                            <div key={i} className="flex gap-2 text-sm text-white/70">
                              <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" /> {m}
                            </div>
                          ))}
                        </div>
                      </div>

                      <button onClick={logWorkoutToLedger} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors uppercase tracking-wider text-sm">
                        <Plus className="w-4 h-4" /> Log Workout to Ledger
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── LABEL SCANNER TAB ─── */}
          {activeTab === "scanner" && (
            <motion.div key="scanner" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div>
                <h1 className="text-3xl font-bold uppercase tracking-tight mb-1">Label Scanner</h1>
                <p className="text-white/40 text-sm mb-4">Scan any packed food label to get an instant safety grade.</p>
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 mb-6 text-sm text-orange-200/70 flex gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                  <span>Packed food only — make sure the ingredients list is clearly visible.</span>
                </div>
                <ScanDropzone onFile={handleLabelFile} accentColor="cyan" icon={Microscope} label="Drop food label photo here" />
                {labelImage && (
                  <div className="mt-4 rounded-xl overflow-hidden border border-white/10">
                    <img src={labelImage} alt="Label preview" className="w-full max-h-48 object-cover" />
                  </div>
                )}
              </div>

              <div>
                <h1 className="text-3xl font-bold uppercase tracking-tight mb-1">Grade Result</h1>
                <p className="text-white/40 text-sm mb-8">AI ingredient safety analysis</p>
                <div className="border border-white/10 bg-[#0a0a0f] rounded-2xl min-h-[300px] p-6">
                  {labelLoading && (
                    <div className="flex flex-col items-center justify-center h-full min-h-[250px] gap-3">
                      <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
                      <p className="text-white/40 text-sm font-mono">Gemini is analyzing the label...</p>
                    </div>
                  )}
                  {labelError && (
                    <div className="flex flex-col items-center justify-center h-full min-h-[250px] gap-3 text-red-400">
                      <XCircle className="w-10 h-10" />
                      <p className="text-sm">{labelError}</p>
                    </div>
                  )}
                  {!labelLoading && !labelError && !labelResult && (
                    <div className="flex flex-col items-center justify-center h-full min-h-[250px] gap-3 text-white/20">
                      <Microscope className="w-12 h-12" />
                      <p className="text-sm">Upload a food label to get a safety grade</p>
                    </div>
                  )}
                  {labelResult && (
                    <div className="space-y-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-xl font-bold">{labelResult.productName}</h3>
                          <p className="text-white/40 text-xs mt-1">{labelResult.servingSize} · {labelResult.totalCalories} kcal</p>
                        </div>
                        <div className="text-center shrink-0">
                          <div className={`text-5xl font-black ${gradeColorMap[labelResult.gradeColor] || 'text-white'}`}>{labelResult.overallGrade}</div>
                          <div className="text-[10px] text-white/30 font-mono uppercase">Grade</div>
                        </div>
                      </div>

                      <div className={`px-3 py-2 rounded-lg border text-xs font-medium w-fit ${recommendationBg[labelResult.recommendation] || 'bg-white/10 text-white/50 border-white/10'}`}>
                        {labelResult.recommendation}
                      </div>

                      <p className="text-sm text-white/60 leading-relaxed">{labelResult.verdict}</p>

                      {labelResult.harmfulIngredients.length > 0 && (
                        <div>
                          <p className="text-xs text-white/40 font-mono uppercase mb-2">⚠ Harmful Ingredients</p>
                          <div className="space-y-2">
                            {labelResult.harmfulIngredients.map((h, i) => (
                              <div key={i} className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                                <div className="flex justify-between mb-1">
                                  <span className="text-sm font-medium text-red-300">{h.name}</span>
                                  <span className="text-xs text-red-400 font-mono">{h.severity}</span>
                                </div>
                                <p className="text-xs text-white/40">{h.reason}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {labelResult.goodIngredients.length > 0 && (
                        <div>
                          <p className="text-xs text-white/40 font-mono uppercase mb-2">✓ Good Ingredients</p>
                          <div className="flex flex-wrap gap-1.5">
                            {labelResult.goodIngredients.map((g, i) => (
                              <span key={i} className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">{g}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {labelResult.allergens.length > 0 && (
                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                          <p className="text-xs text-yellow-400 font-mono uppercase mb-1">Allergens</p>
                          <p className="text-sm text-yellow-200/70">{labelResult.allergens.join(', ')}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </main>
  );
}
