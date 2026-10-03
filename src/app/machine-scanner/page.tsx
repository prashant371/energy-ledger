export default function MachineScannerPage() {
  return (
    <main className="min-h-screen bg-[#020205] text-white p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">🏋️ Machine Scanner</h1>
        <p className="text-white/60 mb-8">Point your camera at any gym machine to identify it and get MET burn estimates.</p>
        
        <div className="border border-white/10 rounded-2xl p-12 text-center bg-white/5 flex flex-col items-center justify-center">
           <div className="w-24 h-24 rounded-full bg-indigo-600/20 flex items-center justify-center mb-4">
             <span className="text-4xl">📷</span>
           </div>
           <h3 className="text-xl font-bold">Scan Equipment</h3>
           <p className="text-white/60 mt-2">Feature coming next!</p>
        </div>
      </div>
    </main>
  )
}
