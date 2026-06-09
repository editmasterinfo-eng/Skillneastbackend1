import { useState, useEffect } from "react";
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
  Fingerprint
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
    { name: 'Used Space (Videos)', value: 850, color: '#f59e0b' },
    { name: 'System Cache', value: 300, color: '#6366f1' },
    { name: 'Free Space', value: 850, color: '#262626' }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-200 font-sans selection:bg-neutral-800 pb-20">

      <main className="max-w-6xl mx-auto px-6 py-12">
        
        {/* Header Section */}
        <header className="mb-10 flex flex-col md:flex-row md:justify-between md:items-start gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="flex items-center justify-center w-12 h-12 rounded-xl bg-neutral-900 border border-neutral-800 shadow-sm relative overflow-hidden">
                <ShieldCheck className="w-6 h-6 text-emerald-400 z-10 relative" />
                <div className="absolute inset-0 bg-emerald-500/10 blur-xl"></div>
              </span>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">Skill n East API Gateway</h1>
                <p className="text-sm text-neutral-500 font-mono mt-1">Node.js Express Engine • Firebase Admin API</p>
              </div>
            </div>
            
            <div className="mt-5 flex flex-wrap items-center gap-3 text-xs font-mono text-neutral-400">
              <span className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-md text-emerald-400">
                <Activity className="w-3.5 h-3.5" />
                STATUS: {healthStatus.toUpperCase()}
              </span>
              <span className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-md">
                <Server className="w-3.5 h-3.5" />
                REGION: ASIA-SOUTHEAST1
              </span>
              <span className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-md">
                <Lock className="w-3.5 h-3.5 text-rose-400" />
                CORS: LOCKED
              </span>
            </div>
          </div>

          <div className="flex-shrink-0">
            <a 
              href="https://skillneast.vercel.app/" 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-white hover:bg-neutral-200 text-black px-5 py-2.5 rounded-lg font-medium transition-all shadow-lg hover:shadow-white/10"
            >
              <Globe className="w-4 h-4" />
              Open Authorized Access Portal
              <ExternalLink className="w-4 h-4 ml-1 opacity-50" />
            </a>
          </div>
        </header>

        {/* Live Metrics Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#111111] border border-neutral-800 rounded-xl p-5 relative overflow-hidden">
            <Cpu className="w-5 h-5 text-indigo-400 mb-3" />
            <p className="text-xs text-neutral-500 font-mono tracking-wider">CPU LOAD</p>
            <p className="text-2xl font-bold text-white mt-1">{currentMetrics?.cpu.toFixed(1) || 0}%</p>
          </div>
          <div className="bg-[#111111] border border-neutral-800 rounded-xl p-5 relative overflow-hidden">
            <Database className="w-5 h-5 text-emerald-400 mb-3" />
            <p className="text-xs text-neutral-500 font-mono tracking-wider">MEMORY USAGE</p>
            <p className="text-2xl font-bold text-white mt-1">{currentMetrics?.memory.toFixed(1) || 0} MB</p>
          </div>
          <div className="bg-[#111111] border border-neutral-800 rounded-xl p-5 relative overflow-hidden">
            <Users className="w-5 h-5 text-amber-400 mb-3" />
            <p className="text-xs text-neutral-500 font-mono tracking-wider">ACTIVE CONNECTIONS</p>
            <p className="text-2xl font-bold text-white mt-1">{currentMetrics?.activeUsers || 0}</p>
          </div>
          <div className="bg-[#111111] border border-neutral-800 rounded-xl p-5 relative overflow-hidden">
            <Activity className="w-5 h-5 text-rose-400 mb-3" />
            <p className="text-xs text-neutral-500 font-mono tracking-wider">AVG LATENCY</p>
            <p className="text-2xl font-bold text-white mt-1">{currentMetrics?.latency || 0} ms</p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          
          {/* CPU & Memory Time Chart (takes 2 cols) */}
          <div className="lg:col-span-2 bg-[#111111] border border-neutral-800 rounded-xl p-6">
            <h3 className="text-sm font-medium mb-6 flex items-center gap-2 text-neutral-300">
              <Activity className="w-4 h-4 text-emerald-400" /> Live Resource Telemetry
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metricsHistory} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#34d399" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                  <XAxis 
                    dataKey="timestamp" 
                    tick={{ fill: '#52525b', fontSize: 10 }} 
                    axisLine={false} 
                    tickLine={false} 
                  />
                  <YAxis 
                    yAxisId="left" 
                    tick={{ fill: '#52525b', fontSize: 10 }} 
                    axisLine={false} 
                    tickLine={false} 
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    tick={{ fill: '#52525b', fontSize: 10 }} 
                    axisLine={false} 
                    tickLine={false} 
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', fontSize: '12px' }}
                    itemStyle={{ color: '#e5e5e5' }}
                  />
                  <Area yAxisId="left" type="monotone" dataKey="cpu" stroke="#818cf8" strokeWidth={2} fillOpacity={1} fill="url(#colorCpu)" name="CPU (%)" />
                  <Area yAxisId="right" type="monotone" dataKey="memory" stroke="#34d399" strokeWidth={2} fillOpacity={1} fill="url(#colorMem)" name="Memory (MB)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Storage Bar Chart */}
          <div className="bg-[#111111] border border-neutral-800 rounded-xl p-6 flex flex-col">
            <h3 className="text-sm font-medium mb-2 flex items-center gap-2 text-neutral-300">
              <Database className="w-4 h-4 text-amber-400" /> Course Videos Storage
            </h3>
            <p className="text-xs text-neutral-500 mb-6 font-mono">(Simulated 2TB Drive Allocation)</p>
            
            <div className="flex-1 w-full h-full min-h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={storageData} layout="vertical" margin={{ top: 0, right: 0, left: 10, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#737373', fontSize: 11 }} width={110} />
                  <Tooltip cursor={{fill: '#1a1a1a'}} contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', fontSize: '12px' }} />
                  <Bar dataKey="value" radius={[4, 4, 4, 4]} barSize={16}>
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
        <div className="mt-12 space-y-6">
          <div className="flex items-center gap-3 border-b border-red-900/30 pb-4">
            <ShieldAlert className="w-6 h-6 text-red-500" />
            <h2 className="text-xl font-semibold text-white tracking-tight">Zero-Trust Security & Compliance Protocols</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* CORS Policy */}
            <div className="bg-[#111111] border border-red-900/40 rounded-xl p-6 relative overflow-hidden group hover:border-red-500/50 transition-colors">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Network className="w-24 h-24 text-red-500" />
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <Network className="w-5 h-5 text-red-400" />
                </div>
                <h3 className="text-base font-medium text-red-200">Strict CORS Firewall gateway</h3>
              </div>
              <p className="text-sm text-neutral-400 leading-relaxed z-10 relative mb-4">
                This API infrastructure is specifically built for internal application use. We enforce a strictly regulated CORS origin policy locked entirely to the authorized access portal.
              </p>
              <div className="bg-black/50 border border-neutral-800 p-3 rounded-lg flex items-center justify-between z-10 relative">
                <span className="text-xs text-neutral-500 font-mono">AUTHORIZED_PORTAL</span>
                <code className="text-xs text-red-300 font-mono bg-red-950/30 px-2 py-1 rounded">https://skillneast.vercel.app/</code>
              </div>
            </div>

            {/* Anti-Scraping */}
            <div className="bg-[#111111] border border-red-900/40 rounded-xl p-6 relative overflow-hidden group hover:border-red-500/50 transition-colors">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Ban className="w-24 h-24 text-red-500" />
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <Ban className="w-5 h-5 text-red-400" />
                </div>
                <h3 className="text-base font-medium text-red-200">Zero-Tolerance Anti-Scraping</h3>
              </div>
              <p className="text-sm text-neutral-400 leading-relaxed z-10 relative">
                Direct API hits via terminal (cURL), automated scripts (Python/Puppeteer), unauthorized mobile applications, or third-party web clients (Postman/Insomnia) are automatically blocked. Aggressive scraping or endpoint fuzzing will trigger our automated WAF, resulting in an immediate, permanent IP and ASN subnet ban at the network edge.
              </p>
            </div>

            {/* Rate Limiting */}
            <div className="bg-[#111111] border border-red-900/40 rounded-xl p-6 relative overflow-hidden group hover:border-red-500/50 transition-colors">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Zap className="w-24 h-24 text-red-500" />
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <Zap className="w-5 h-5 text-red-400" />
                </div>
                <h3 className="text-base font-medium text-red-200">Layer 7 DDoS & Rate Limiting</h3>
              </div>
              <p className="text-sm text-neutral-400 leading-relaxed z-10 relative">
                Global token-bucket rate limiters are active on all RESTful endpoints. Bursty traffic triggering DDoS protection protocols will instruct the proxy layer to drop packets silently without returning standard HTTP error payloads, starving automated attack vectors of system feedback.
              </p>
            </div>

            {/* Sub-resource Integrity & Proxies */}
            <div className="bg-[#111111] border border-red-900/40 rounded-xl p-6 relative overflow-hidden group hover:border-red-500/50 transition-colors">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Fingerprint className="w-24 h-24 text-red-500" />
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <Fingerprint className="w-5 h-5 text-red-400" />
                </div>
                <h3 className="text-base font-medium text-red-200">Device Fingerprinting & Video DRM</h3>
              </div>
              <p className="text-sm text-neutral-400 leading-relaxed z-10 relative">
                All premium media streams utilize securely signed, expiring, one-time proxy URIs tied strictly to the requesting browser's cryptographic fingerprint. Concurrent session detection actively terminates hijacked streams to prevent digital piracy and direct <code className="text-xs bg-black/40 px-1 rounded">.m3u8</code> / <code className="text-xs bg-black/40 px-1 rounded">.mp4</code> stream dumping.
              </p>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}

