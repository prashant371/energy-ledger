"use client";
import React, { useState } from 'react';
import { ArrowLeft, Send, Brain, Bot, User } from 'lucide-react';
import Link from 'next/link';

export default function AICoachPage() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hello! I'm your Iron Log AI coach powered by Gemini. How can I help you crush your fitness goals today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })) })
      });

      const data = await res.json();
      
      if (res.ok) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${data.error}` }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Failed to connect to the server." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#020205] text-white p-6 md:p-12 font-sans flex flex-col">
      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
        <Link href="/" className="inline-flex items-center text-cyan-500 hover:text-cyan-400 mb-8 transition-colors w-fit">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Link>
        
        <div className="mb-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <Brain className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold uppercase tracking-tight">AI Coach</h1>
            <p className="text-white/50 text-sm font-mono tracking-widest uppercase">Powered by Gemini</p>
          </div>
        </div>
        
        <div className="border border-white/10 rounded-2xl bg-[#0a0a0f] flex-1 flex flex-col overflow-hidden max-h-[70vh]">
           <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-indigo-600' : 'bg-cyan-600'}`}>
                    {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                  </div>
                  <div className={`p-4 rounded-2xl max-w-[80%] whitespace-pre-wrap ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600/20 border border-indigo-500/30 text-indigo-50 rounded-tr-sm' 
                      : 'bg-white/5 border border-white/10 text-white/90 rounded-tl-sm'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-cyan-600 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-white/50 rounded-tl-sm flex items-center gap-2">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse delay-75"></div>
                    <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse delay-150"></div>
                  </div>
                </div>
              )}
           </div>
           <div className="p-4 border-t border-white/10 bg-white/[0.02]">
             <form onSubmit={sendMessage} className="flex gap-2">
               <input 
                 type="text" 
                 value={input}
                 onChange={(e) => setInput(e.target.value)}
                 className="flex-1 bg-black border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 transition-colors" 
                 placeholder="Ask for workout advice, diet tips..." 
                 disabled={loading}
               />
               <button 
                 type="submit" 
                 disabled={loading || !input.trim()}
                 className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:hover:bg-cyan-600 text-white px-6 rounded-xl flex items-center justify-center transition-colors"
               >
                 <Send className="w-5 h-5" />
               </button>
             </form>
           </div>
        </div>
      </div>
    </main>
  );
}
