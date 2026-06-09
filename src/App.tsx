import { useState, useEffect } from "react";
import DonateUI from "./components/DonateUI";
import { 
  ShieldCheck, 
  TerminalSquare, 
  Server, 
  Activity,
  AlertTriangle,
  Globe,
  Database,
  Lock,
  ExternalLink,
  Cpu,
  Users,
  ShieldAlert,
  Network,
  Ban,
  Zap,
  Fingerprint,
  Sparkles,
  ArrowRight
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

interface SystemMetrics {
  timestamp: string;
  cpu: number;
  memory: number;
  activeUsers: number;
  latency: number;
}

const MAX_HISTORY = 15; // Keep last 15 points

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'donate'>('dashboard');
  const [healthStatus, setHealthStatus] = useState<string>("Checking...");
  const [metricsHistory, setMetricsHistory] = useState<SystemMetrics[]>([]);
  const [currentMetrics, setCurrentMetrics] = useState<SystemMetrics | null>(null);

  useEffect(() => {
    // Health check
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => setHealthStatus(data.status === "ok" ? "Online" : "Offline"))
      .catch(() => setHealthStatus("Offline"));

    // Poll System Metrics
    const fetchMetrics = () => {
      fetch("/api/system/metrics")
        .then((res) => res.json())
        .then((data: SystemMetrics) => {
          setCurrentMetrics(data);
          setMetricsHistory(prev => {
            const newHistory = [...prev, data];
            if (newHistory.length > MAX_HISTORY) return newHistory.slice(1);
            return newHistory;
          });
        })
        .catch(console.error);
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 3000);
    return () => clearInterval(interval);
  }, []);

  // Fake static visual data for Storage (Server videos storage vs used)
  const storageData = [
    { name: 'Media Blocks', value: 850, color: '#6366f1' },
    { name: 'Cache Layer', value: 300, color: '#10b981' },
    { name: 'Available', value: 850, color: '#262626' }
  ];

  return (
    <div className="min-h-screen bg-[#000000] text-neutral-200 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Sleek Floating Navbar */}
      <div className="sticky top-0 z-50 pt-4 px-4 sm:px-6 flex justify-center">
        <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-full px-2 py-1.5 flex items-center gap-1 shadow-2xl">
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'dashboard' 
                ? 'bg-white/10 text-white shadow-sm' 
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Activity className="w-4 h-4" />
            Gateway Matrix
          </button>
          <button 
            onClick={() => setActiveTab('donate')} 
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'donate' 
                ? 'bg-rose-500/20 text-rose-300 shadow-sm border border-rose-500/20' 
                : 'text-neutral-400 hover:text-rose-300 hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Mission Support
          </button>
        </div>
      </div>

      {activeTab === 'donate' ? (
        <DonateUI />
      ) : (
        <div className="pb-24 relative overflow-hidden">
          {/* Subtle Ambient Background Glows */}
          <div className="absolute top-[10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none"></div>
          <div className="absolute top-[40%] right-[-10%] w-[600px] h-[600px] bg-emerald-600/5 blur-[150px] rounded-full pointer-events-none"></div>

          <main className="max-w-6xl mx-auto px-6 py-12 relative z-10 mt-4">
        
            {/* Header Section */}
            <header className="mb-12 flex flex-col md:flex-row md:justify-between md:items-start gap-6">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-emerald-500/30 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                    <span className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#111111] to-[#050505] border border-white/10 shadow-xl relative z-10">
                      <ShieldCheck className="w-7 h-7 text-emerald-400" />
                    </span>
                  </div>
                  <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
                      Core Operations
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                    </h1>
                    <p className="text-sm text-neutral-500 font-mono mt-1 tracking-wide">SN-ENGINE // NODE_V18 // DISTRIBUTED_ROUTING</p>
                  </div>
                </div>
                
                <div className="mt-6 flex flex-wrap items-center gap-3 text-xs font-mono text-neutral-400">
                  <span className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg text-emerald-300">
                    <Activity className="w-3.5 h-3.5" />
                    {healthStatus.toUpperCase()}
                  </span>
                  <span className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-lg text-indigo-300">
                    <Server className="w-3.5 h-3.5" />
                    REGION: AP-SOUTHEAST
                  </span>
                  <span className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-lg text-rose-300">
                    <Lock className="w-3.5 h-3.5 shadow-rose-500/50" />
                    WAF: ENGAGED
                  </span>
                </div>
              </div>

              <div className="flex-shrink-0">
                <a 
                  href="https://skillneast.vercel.app/" 
                  target="_blank" 
                  rel="noreferrer"
                  className="group relative inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  <Globe className="w-4 h-4 text-indigo-400" />
                  Skill n East Portal
                  <ArrowRight className="w-4 h-4 opacity-50 ml-1 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </header>

            {/* Live Metrics Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              <div className="bg-gradient-to-b from-indigo-500/5 to-transparent border border-white/5 hover:border-indigo-500/30 transition-colors rounded-2xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500"><Cpu className="w-12 h-12 text-indigo-400" /></div>
                <Cpu className="w-6 h-6 text-indigo-400 mb-4 relative z-10" />
                <p className="text-xs text-neutral-500 font-semibold tracking-wider uppercase relative z-10">Compute Load</p>
                <div className="flex items-baseline gap-1 relative z-10">
                  <p className="text-3xl font-black text-white mt-1 tracking-tight">{currentMetrics?.cpu.toFixed(1) || 0}</p>
                  <span className="text-sm font-medium text-indigo-400">%</span>
                </div>
              </div>
              
              <div className="bg-gradient-to-b from-emerald-500/5 to-transparent border border-white/5 hover:border-emerald-500/30 transition-colors rounded-2xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500"><Database className="w-12 h-12 text-emerald-400" /></div>
                <Database className="w-6 h-6 text-emerald-400 mb-4 relative z-10" />
                <p className="text-xs text-neutral-500 font-semibold tracking-wider uppercase relative z-10">Heap Allocation</p>
                <div className="flex items-baseline gap-1 relative z-10">
                  <p className="text-3xl font-black text-white mt-1 tracking-tight">{currentMetrics?.memory.toFixed(1) || 0}</p>
                  <span className="text-sm font-medium text-emerald-400">MB</span>
                </div>
              </div>

              <div className="bg-gradient-to-b from-amber-500/5 to-transparent border border-white/5 hover:border-amber-500/30 transition-colors rounded-2xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500"><Users className="w-12 h-12 text-amber-400" /></div>
                <Users className="w-6 h-6 text-amber-400 mb-4 relative z-10" />
                <p className="text-xs text-neutral-500 font-semibold tracking-wider uppercase relative z-10">Socket Streams</p>
                <div className="flex items-baseline gap-1 relative z-10">
                  <p className="text-3xl font-black text-white mt-1 tracking-tight">{currentMetrics?.activeUsers || 0}</p>
                  <span className="text-sm font-medium text-amber-400">USR</span>
                </div>
              </div>

              <div className="bg-gradient-to-b from-rose-500/5 to-transparent border border-white/5 hover:border-rose-500/30 transition-colors rounded-2xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500"><Activity className="w-12 h-12 text-rose-400" /></div>
                <Activity className="w-6 h-6 text-rose-400 mb-4 relative z-10" />
                <p className="text-xs text-neutral-500 font-semibold tracking-wider uppercase relative z-10">Edge Ping</p>
                <div className="flex items-baseline gap-1 relative z-10">
                  <p className="text-3xl font-black text-white mt-1 tracking-tight">{currentMetrics?.latency || 0}</p>
                  <span className="text-sm font-medium text-rose-400">MS</span>
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-16">
              
              {/* CPU & Memory Time Chart (takes 2 cols) */}
              <div className="lg:col-span-2 bg-[#050505] border border-white/5 shadow-2xl rounded-3xl p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 opacity-20"></div>
                <h3 className="text-base font-bold mb-8 flex items-center gap-3 text-white">
                  <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                    <Activity className="w-4 h-4 text-emerald-400" />
                  </div>
                  System Telemetry Stream
                </h3>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={metricsHistory} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#818cf8" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#34d399" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" strokeOpacity={0.05} vertical={false} />
                      <XAxis 
                        dataKey="timestamp" 
                        tick={{ fill: '#737373', fontSize: 10, fontWeight: 500 }} 
                        axisLine={false} 
                        tickLine={false} 
                        dy={10}
                      />
                      <YAxis 
                        yAxisId="left" 
                        tick={{ fill: '#737373', fontSize: 10, fontWeight: 500 }} 
                        axisLine={false} 
                        tickLine={false} 
                        dx={-10}
                      />
                      <YAxis 
                        yAxisId="right" 
                        orientation="right" 
                        tick={{ fill: '#737373', fontSize: 10, fontWeight: 500 }} 
                        axisLine={false} 
                        tickLine={false} 
                        dx={10}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(10, 10, 10, 0.95)', backdropFilter: 'blur(10px)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}
                        itemStyle={{ color: '#ffffff', fontWeight: 600 }}
                      />
                      <Area yAxisId="left" type="monotone" dataKey="cpu" stroke="#818cf8" strokeWidth={3} fillOpacity={1} fill="url(#colorCpu)" name="CPU (%)" />
                      <Area yAxisId="right" type="monotone" dataKey="memory" stroke="#34d399" strokeWidth={3} fillOpacity={1} fill="url(#colorMem)" name="Memory (MB)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Storage Bar Chart */}
              <div className="bg-[#050505] border border-white/5 shadow-2xl rounded-3xl p-8 flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-3xl rounded-full"></div>
                <h3 className="text-base font-bold mb-2 flex items-center gap-3 text-white">
                  <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <Database className="w-4 h-4 text-amber-400" />
                  </div>
                  Volume Blocks
                </h3>
                <p className="text-xs text-neutral-500 mb-8 font-mono tracking-wide">MAPPINGS: /dev/sda1 (2TB)</p>
                
                <div className="flex-1 w-full h-full min-h-[200px] mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={storageData} layout="vertical" margin={{ top: 0, right: 0, left: 10, bottom: 0 }}>
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#a3a3a3', fontSize: 11, fontWeight: 500 }} width={90} />
                      <Tooltip cursor={{fill: 'rgba(255,255,255,0.02)'}} contentStyle={{ backgroundColor: 'rgba(10, 10, 10, 0.95)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }} itemStyle={{color: '#fff', fontWeight: 600}} />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                        {storageData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>



            {/* Security Architecture & Compliance Notice Block */}
            <div className="space-y-8 bg-gradient-to-b from-[#150505] to-[#0a0202] -mx-6 px-6 py-16 sm:rounded-[40px] sm:mx-0 border border-red-900/20 relative overflow-hidden shadow-2xl">
              {/* Background accent */}
              <div className="absolute top-0 right-0 w-[800px] h-1 bg-gradient-to-l from-red-500 to-transparent opacity-20"></div>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-red-900/30 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="relative">
                     <span className="animate-ping absolute inset-0 rounded-full bg-red-500 opacity-20"></span>
                     <div className="bg-red-500/10 border border-red-500/20 w-12 h-12 rounded-2xl flex items-center justify-center relative shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                       <ShieldAlert className="w-6 h-6 text-red-500" />
                     </div>
                  </div>
                  <div>
                    <h2 className="text-2xl font-extrabold text-white tracking-tight">Active Security Posture</h2>
                    <p className="text-sm text-red-400 font-mono mt-1">THREAT_LEVEL: NOMINAL • FAIL2BAN: ACTIVE</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                
                {/* CORS Policy */}
                <div className="bg-black/40 backdrop-blur-sm border border-red-900/30 rounded-2xl p-8 relative group hover:bg-black/60 hover:border-red-500/40 transition-all duration-300">
                  <div className="absolute top-6 right-6 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Network className="w-20 h-20 text-red-500" />
                  </div>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-2.5 bg-red-500/10 rounded-xl border border-red-500/20">
                      <Network className="w-5 h-5 text-red-400" />
                    </div>
                    <h3 className="text-lg font-bold text-red-100">Origin Firewall Validation</h3>
                  </div>
                  <p className="text-sm text-neutral-400 leading-relaxed z-10 relative mb-6">
                    API ingress is strictly validated. Requests originating outside of explicitly whitelisted domains will face immediate socket termination to prevent unauthorized embedding and lateral exploitation.
                  </p>
                  <div className="bg-red-950/20 border border-red-900/30 p-3 rounded-xl flex items-center justify-between z-10 relative">
                    <span className="text-[11px] text-red-400/70 font-mono font-bold tracking-wider">SECURE_ORIGIN</span>
                    <code className="text-xs text-red-300 font-mono font-bold tracking-wider bg-red-950/50 px-2 py-1 rounded">https://skillneast.vercel.app/</code>
                  </div>
                </div>

                {/* Anti-Scraping */}
                <div className="bg-black/40 backdrop-blur-sm border border-red-900/30 rounded-2xl p-8 relative group hover:bg-black/60 hover:border-red-500/40 transition-all duration-300">
                  <div className="absolute top-6 right-6 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Ban className="w-20 h-20 text-red-500" />
                  </div>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-2.5 bg-red-500/10 rounded-xl border border-red-500/20">
                      <Ban className="w-5 h-5 text-red-400" />
                    </div>
                    <h3 className="text-lg font-bold text-red-100">Automated Bot Blackhole</h3>
                  </div>
                  <p className="text-sm text-neutral-400 leading-relaxed z-10 relative">
                    Detection heuristics identify and block headless browsers (Puppeteer/Selenium), cURL scripts, and non-standard user agents. Fuzzing attempts immediately trigger a routing null-route (blackhole) at the edge CDN for the offending subnet.
                  </p>
                </div>

                {/* Rate Limiting */}
                <div className="bg-black/40 backdrop-blur-sm border border-red-900/30 rounded-2xl p-8 relative group hover:bg-black/60 hover:border-red-500/40 transition-all duration-300">
                  <div className="absolute top-6 right-6 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Zap className="w-20 h-20 text-red-500" />
                  </div>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-2.5 bg-red-500/10 rounded-xl border border-red-500/20">
                      <Zap className="w-5 h-5 text-red-400" />
                    </div>
                    <h3 className="text-lg font-bold text-red-100">L7 Mitigation Engine</h3>
                  </div>
                  <p className="text-sm text-neutral-400 leading-relaxed z-10 relative">
                    Advanced token-bucket algorithms restrict burst requests. Instead of broadcasting 429 status codes, excess packets are dropped silently during volumetric attacks, maximizing the cost for adversarial actors.
                  </p>
                </div>

                {/* Sub-resource Integrity & Proxies */}
                <div className="bg-black/40 backdrop-blur-sm border border-red-900/30 rounded-2xl p-8 relative group hover:bg-black/60 hover:border-red-500/40 transition-all duration-300">
                  <div className="absolute top-6 right-6 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Fingerprint className="w-20 h-20 text-red-500" />
                  </div>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-2.5 bg-red-500/10 rounded-xl border border-red-500/20">
                      <Fingerprint className="w-5 h-5 text-red-400" />
                    </div>
                    <h3 className="text-lg font-bold text-red-100">Stream Tokenization (DRM)</h3>
                  </div>
                  <p className="text-sm text-neutral-400 leading-relaxed z-10 relative">
                    Media assets are protected by cryptographic JWT tokens validated every 10 seconds. Concurrent sessions are automatically evicted to prevent credential sharing and digital stream pirating via direct <span className="font-mono text-red-400/80 text-xs">.m3u8</span> dumping.
                  </p>
                </div>
              </div>
            </div>

          </main>
        </div>
      )}
    </div>
  );
}


