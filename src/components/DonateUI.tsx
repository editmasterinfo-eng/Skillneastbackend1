import { 
  Heart, ShieldCheck, Lock, Server, Sparkles, 
  CreditCard, QrCode, Quote, Users, Code, 
  Activity, CheckCircle2, ArrowRight
} from 'lucide-react';

export default function DonateUI() {
  return (
    <div className="min-h-[calc(100vh-56px)] text-neutral-200 font-sans p-4 sm:p-8 flex justify-center pb-24 relative overflow-hidden z-10 w-full animate-in fade-in duration-700">
      <div className="max-w-4xl w-full space-y-10 relative z-10 mt-8">
        
        {/* Header Section */}
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="relative group">
             <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-emerald-500 blur-xl opacity-30 group-hover:opacity-60 transition-opacity duration-500 rounded-full"></div>
             <img 
               src="https://i.postimg.cc/hPhF7CyJ/file-00000000c5547208bf8ac5280a6e09e9.png" 
               alt="Skill n East Founder" 
               referrerPolicy="no-referrer"
               className="w-24 h-24 rounded-full border border-white/20 shadow-2xl relative z-10 object-cover"
             />
          </div>
          
          <div className="space-y-4 max-w-2xl flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-indigo-300 backdrop-blur-md shadow-lg shadow-indigo-500/10 tracking-widest uppercase mb-4">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Skill n East Mission</span>
            </div>
            
            <h1 className="text-4xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/40 tracking-tight leading-[1.1] pb-2 drop-shadow-sm">
              Empower the <br/> next generation.
            </h1>
            
            <p className="text-neutral-400 text-base md:text-lg leading-relaxed max-w-xl mx-auto font-medium mt-4">
              We are breaking down the financial walls of the tech industry. Skill n East provides elite curriculum, tools, and mentorship — <strong className="text-emerald-400">completely free</strong>.
            </p>
          </div>
        </div>

        {/* Action Blocks (Donation Buttons) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl mx-auto w-full">
          <button className="group relative w-full rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-indigo-500/50 p-6 sm:p-8 text-left transition-all duration-300 hover:shadow-[0_0_40px_rgba(99,102,241,0.15)] hover:bg-white/[0.07] overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-all duration-700">
              <CreditCard className="w-32 h-32 text-indigo-400" />
            </div>
            <div className="flex justify-between items-center mb-6 relative z-10">
              <div className="p-3.5 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                <CreditCard className="w-7 h-7" />
              </div>
              <ArrowRight className="w-6 h-6 text-indigo-500/50 group-hover:text-indigo-400 transition-colors group-hover:translate-x-2" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 relative z-10 tracking-tight">Direct Contribution</h3>
            <p className="text-sm text-neutral-400 font-medium relative z-10 leading-relaxed max-w-[85%]">Support development and server bandwidth directly using secure UPI or card gateways.</p>
          </button>
          
          <button className="group relative w-full rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-emerald-500/50 p-6 sm:p-8 text-left transition-all duration-300 hover:shadow-[0_0_40px_rgba(52,211,153,0.15)] hover:bg-white/[0.07] overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-700">
               <QrCode className="w-32 h-32 text-emerald-400" />
             </div>
             <div className="flex justify-between items-center mb-6 relative z-10">
              <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.2)]">
                <QrCode className="w-7 h-7" />
              </div>
              <ArrowRight className="w-6 h-6 text-emerald-500/50 group-hover:text-emerald-400 transition-colors group-hover:translate-x-2" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 relative z-10 tracking-tight">Crypto & Anonymous</h3>
            <p className="text-sm text-neutral-400 font-medium relative z-10 leading-relaxed max-w-[85%]">Privacy-first funding via decentralized smart contracts or direct QR code scans.</p>
          </button>
        </div>

        {/* Global Impact Grid (Bento) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 relative overflow-hidden group hover:border-indigo-500/30 transition-all shadow-lg">
            <div className="absolute -top-4 -right-4 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-500 group-hover:scale-110"><Users className="w-32 h-32" /></div>
            <div className="text-4xl lg:text-5xl font-black text-white tracking-tighter mb-2 relative z-10 drop-shadow-sm">5000+</div>
            <div className="text-xs text-neutral-400 font-bold uppercase tracking-widest relative z-10 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span> Global Learners
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 relative overflow-hidden group hover:border-blue-500/30 transition-all shadow-lg">
             <div className="absolute -top-4 -right-4 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-500 group-hover:scale-110"><Lock className="w-32 h-32" /></div>
            <div className="text-4xl lg:text-5xl font-black text-blue-400 tracking-tighter mb-2 relative z-10 drop-shadow-sm">100%</div>
            <div className="text-xs text-neutral-400 font-bold uppercase tracking-widest relative z-10 flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-blue-500"></span> Open Source
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 relative overflow-hidden group hover:border-emerald-500/30 transition-all shadow-lg">
            <div className="absolute -top-4 -right-4 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-500 group-hover:scale-110"><Activity className="w-32 h-32" /></div>
            <div className="text-4xl lg:text-5xl font-black text-emerald-400 tracking-tighter mb-2 relative z-10 drop-shadow-sm">₹0</div>
            <div className="text-xs text-neutral-400 font-bold uppercase tracking-widest relative z-10 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Cost to User
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 relative overflow-hidden group hover:border-rose-500/30 transition-all shadow-lg">
             <div className="absolute -top-4 -right-4 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-500 group-hover:scale-110"><Code className="w-32 h-32" /></div>
            <div className="text-4xl lg:text-5xl font-black text-white tracking-tighter mb-2 relative z-10 drop-shadow-sm">150+</div>
            <div className="text-xs text-neutral-400 font-bold uppercase tracking-widest relative z-10 flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-rose-500"></span> Tech Modules
            </div>
          </div>
        </div>

        {/* Details & Quote Section */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          
          {/* Allocation Breakdown */}
          <div className="md:col-span-3 bg-gradient-to-br from-[#0f0f0f] to-[#050505] border border-white/5 rounded-3xl p-8 relative shadow-2xl">
            <h3 className="flex items-center gap-3 text-lg font-bold text-white mb-6">
              <Server className="w-5 h-5 text-indigo-400" />
              Resource Allocation Matrix
            </h3>
            
            <div className="space-y-6">
              {/* Item 1 */}
              <div className="group">
                <div className="flex justify-between items-end mb-2">
                  <div>
                     <span className="text-sm font-semibold text-neutral-200 block">Cloud Infrastructure & CDN</span>
                     <span className="text-[10px] text-neutral-500 font-medium">Video streaming, low-latency APIs</span>
                  </div>
                  <span className="text-indigo-400 font-bold text-sm">45%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full w-[45%] group-hover:bg-indigo-400 transition-colors"></div>
                </div>
              </div>

              {/* Item 2 */}
              <div className="group">
                <div className="flex justify-between items-end mb-2">
                  <div>
                     <span className="text-sm font-semibold text-neutral-200 block">Platform R&D</span>
                     <span className="text-[10px] text-neutral-500 font-medium">Engineering new tools & architectures</span>
                  </div>
                  <span className="text-indigo-400 font-bold text-sm">35%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full opacity-80 w-[35%] group-hover:bg-indigo-400 transition-colors"></div>
                </div>
              </div>

              {/* Item 3 */}
              <div className="group">
                <div className="flex justify-between items-end mb-2">
                  <div>
                     <span className="text-sm font-semibold text-neutral-200 block">Community & Bandwidth</span>
                     <span className="text-[10px] text-neutral-500 font-medium">Student support, global edge routing</span>
                  </div>
                  <span className="text-indigo-400 font-bold text-sm">20%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full opacity-60 w-[20%] group-hover:bg-indigo-400 transition-colors"></div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-white/5 flex flex-wrap gap-3">
               <span className="inline-flex items-center gap-1.5 bg-black/40 border border-white/5 shadow-sm px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Fully Transparent
              </span>
               <span className="inline-flex items-center gap-1.5 bg-black/40 border border-white/5 shadow-sm px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Community Audited
              </span>
            </div>
          </div>

          {/* Testimonial / Philosophy block */}
          <div className="md:col-span-2 bg-[#050505] border border-white/10 rounded-3xl p-8 relative flex flex-col justify-between overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full"></div>
            <Quote className="absolute top-6 left-6 w-12 h-12 text-white/5 rotate-180" />
            
            <div className="relative z-10 pt-4">
              <p className="text-sm text-neutral-300 leading-relaxed font-medium italic">
                "Skill n East was built on a simple vision: high-tier tech education must be accessible to everyone, regardless of their financial background. Every line of code funded by you helps a student build their future without the burden of expensive tuition paywalls."
              </p>
            </div>
            
            <div className="mt-8 flex items-center justify-between gap-4 relative z-10 border-t border-white/5 pt-6">
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <div className="absolute inset-0 bg-indigo-500/50 blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <img 
                    src="https://i.postimg.cc/hPhF7CyJ/file-00000000c5547208bf8ac5280a6e09e9.png" 
                    alt="Void Pablo" 
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-full border border-white/20 relative z-10 object-cover"
                  />
                </div>
                <div>
                  <div className="text-sm font-bold text-white tracking-wide">Void Pablo</div>
                  <div className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Founder & Lead Engineer</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                 <a href="https://t.me/skillneast1" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all hover:scale-110">
                   <svg className="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                     <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                   </svg>
                 </a>
                 <a href="https://www.instagram.com/voidd_zy?igsh=MWs0OGxmemcwdDZ0NA==" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all hover:scale-110">
                    <svg className="w-4 h-4 text-rose-400" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                    </svg>
                 </a>
              </div>
            </div>
          </div>

        </div>
        
        {/* Footer */}
        <div className="text-center pt-8 border-t border-white/5">
          <p className="text-xs text-neutral-600 font-medium inline-flex items-center justify-center gap-2">
            Skill n East Open Matrix <Heart className="w-3 h-3 text-red-500 fill-red-500" /> Built for the community
          </p>
        </div>

      </div>
    </div>
  );
}
