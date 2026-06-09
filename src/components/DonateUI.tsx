import { 
  Heart, ShieldCheck, Lock, Server, ArrowDown, 
  CreditCard, QrCode, Quote, Users, BookOpen, 
  Tag, PieChart, Sparkles, TerminalSquare 
} from 'lucide-react';

export default function DonateUI() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-200 font-sans p-4 sm:p-6 md:p-8 flex justify-center pb-24">
      <div className="max-w-md w-full space-y-6">
        
        {/* Main Hero Card */}
        <div className="bg-gradient-to-b from-[#1a0f14] to-[#0a0a0a] border border-rose-950/50 rounded-[28px] p-8 text-center relative overflow-hidden shadow-2xl">
          <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-rose-500/20 shadow-inner">
            <Heart className="w-8 h-8 text-rose-500 fill-rose-500 opacity-90" />
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-3">
            Fuel Free Education<br/>
            <span className="text-rose-400">Across India 🇮🇳</span>
          </h1>
          
          <p className="text-neutral-400 text-sm leading-relaxed mb-8 px-2">
            Every rupee keeps these platforms free for the student who can't afford ₹50,000 coaching. 
            <strong className="text-white font-semibold"> 244K+ students</strong> rely on this — and on people like <strong className="text-white font-semibold">you</strong>.
          </p>

          <div className="flex flex-wrap justify-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 bg-black/40 border border-white/5 shadow-sm px-3.5 py-1.5 rounded-full text-[11px] font-medium text-neutral-300">
              <ShieldCheck className="w-3.5 h-3.5 text-rose-400/80" /> 100% Transparent
            </span>
            <span className="inline-flex items-center gap-1.5 bg-black/40 border border-white/5 shadow-sm px-3.5 py-1.5 rounded-full text-[11px] font-medium text-neutral-300">
              <Lock className="w-3.5 h-3.5 text-rose-400/80" /> Secure Payment
            </span>
            <span className="inline-flex items-center gap-1.5 bg-black/40 border border-white/5 shadow-sm px-3.5 py-1.5 rounded-full text-[11px] font-medium text-neutral-300 mt-1">
              <Heart className="w-3.5 h-3.5 text-rose-400/80" /> Funds Dev & CDN
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="flex flex-col items-center justify-center gap-3 py-4">
          <div className="flex items-center gap-3 w-full max-w-[220px]">
            <div className="h-[1px] bg-gradient-to-r from-transparent to-rose-900/50 flex-1"></div>
            <span className="text-[10px] font-bold tracking-widest text-rose-400 uppercase flex items-center gap-2">
              👇 Tap to Support
            </span>
            <div className="h-[1px] bg-gradient-to-l from-transparent to-rose-900/50 flex-1"></div>
          </div>
          <ArrowDown className="w-4 h-4 text-rose-500/40 animate-bounce mt-1" />
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button className="w-full bg-gradient-to-r from-[#1c140a] to-[#140e07] hover:from-[#2a1e0f] hover:to-[#1c140a] border border-amber-900/50 text-amber-500 p-4 rounded-2xl flex items-center justify-between transition-all shadow-lg active:scale-[0.98]">
            <div className="flex items-center gap-3 font-bold tracking-wide text-sm">
              <CreditCard className="w-5 h-5 opacity-80" />
              DONATE WITH NAME / UPI
            </div>
            <span className="text-lg opacity-60">→</span>
          </button>
          
          <button className="w-full bg-gradient-to-r from-[#1a0f12] to-[#120a0d] hover:from-[#25151a] hover:to-[#1a0f12] border border-rose-900/50 text-rose-400 p-4 rounded-2xl flex items-center justify-between transition-all shadow-lg active:scale-[0.98]">
            <div className="flex items-center gap-3 font-bold tracking-wide text-sm">
              <QrCode className="w-5 h-5 opacity-80" />
              DONATE ANONYMOUSLY — QR
            </div>
            <span className="text-lg opacity-60">→</span>
          </button>
          <p className="text-center text-[11px] text-neutral-500 tracking-wide pt-1">QR: no name • no email • no login needed 🙏</p>
        </div>

        {/* Quote Section */}
        <div className="bg-[#111111] border border-neutral-800/80 rounded-3xl p-7 relative shadow-md mt-8">
          <Quote className="absolute top-5 left-5 w-10 h-10 text-white/5 rotate-180" />
          <p className="text-sm text-neutral-400 leading-relaxed relative z-10 font-medium">
            "I started Skill n East with one belief — <strong className="text-neutral-200">no student should fail because they couldn't afford a ₹50,000 coaching fee.</strong> Every server bill, every hour of development — it's all to keep this promise alive. If this platform helped you even once, please help it stay alive for the next person."
          </p>
          <div className="mt-6 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-rose-500 p-[2px]">
               <div className="w-full h-full bg-black rounded-full flex items-center justify-center text-white font-bold text-[10px] shadow-lg">
                 S&E
               </div>
            </div>
            <span className="text-[12px] font-semibold text-rose-400 tracking-wide">— Fahad, Founder • Skill n East</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[#111111] border border-neutral-800/80 rounded-[20px] p-5 text-center flex flex-col items-center justify-center shadow-sm hover:bg-[#161616] transition-colors">
            <Users className="w-5 h-5 text-blue-400 mb-2.5 opacity-80" />
            <div className="font-bold text-white text-lg tracking-tight">244K+</div>
            <div className="text-[9px] text-neutral-500 font-bold mt-1 uppercase tracking-wider">Students<br/>Helped</div>
          </div>
          <div className="bg-[#111111] border border-neutral-800/80 rounded-[20px] p-5 text-center flex flex-col items-center justify-center shadow-sm hover:bg-[#161616] transition-colors">
            <BookOpen className="w-5 h-5 text-amber-400 mb-2.5 opacity-80" />
            <div className="font-bold text-white text-lg tracking-tight">100+</div>
            <div className="text-[9px] text-neutral-500 font-bold mt-1 uppercase tracking-wider">Free<br/>Courses</div>
          </div>
          <div className="bg-[#111111] border border-neutral-800/80 rounded-[20px] p-5 text-center flex flex-col items-center justify-center shadow-sm hover:bg-[#161616] transition-colors">
            <Tag className="w-5 h-5 text-emerald-400 mb-2.5 opacity-80" />
            <div className="font-bold text-emerald-400 text-lg tracking-tight">₹0</div>
            <div className="text-[9px] text-neutral-500 font-bold mt-1 uppercase tracking-wider">Cost To<br/>Users</div>
          </div>
        </div>

        {/* Distribution Section */}
        <div className="bg-[#111111] border border-neutral-800/80 rounded-3xl p-7 shadow-md">
          <h3 className="flex items-center gap-2.5 text-sm font-semibold text-neutral-300 mb-7">
            <PieChart className="w-4 h-4 text-amber-400" />
            Where does your donation go?
          </h3>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-xs font-medium text-neutral-400 mb-2.5">
                <span className="flex items-center gap-2"><Server className="w-3.5 h-3.5 opacity-70"/> Server & Hosting</span>
                <span className="text-amber-400 font-bold">45%</span>
              </div>
              <div className="h-1.5 w-full bg-black rounded-full overflow-hidden border border-neutral-800/50">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-neutral-400 mb-2.5">
                <span className="flex items-center gap-2"><TerminalSquare className="w-3.5 h-3.5 opacity-70"/> New features & dev</span>
                <span className="text-amber-400 font-bold">35%</span>
              </div>
              <div className="h-1.5 w-full bg-black rounded-full overflow-hidden border border-neutral-800/50">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '35%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-neutral-400 mb-2.5">
                <span className="flex items-center gap-2"><Lock className="w-3.5 h-3.5 opacity-70"/> CDN & App bandwidth</span>
                <span className="text-amber-400 font-bold">20%</span>
              </div>
              <div className="h-1.5 w-full bg-black rounded-full overflow-hidden border border-neutral-800/50">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '20%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="bg-gradient-to-r from-[#111111] to-[#0a0a0a] border border-neutral-800/80 rounded-[20px] p-5 flex items-start gap-4 shadow-sm">
          <Sparkles className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5 opacity-90" />
          <p className="text-[12px] text-neutral-400 leading-relaxed font-medium">
            Even <strong className="text-white">₹10</strong> makes a real difference. Your support lives on in every student whose life this platform touches. 🙏
          </p>
        </div>

      </div>
    </div>
  );
}
