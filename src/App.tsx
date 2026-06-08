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
  Users
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
              Open Frontend Application
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

        {/* API Endpoint Reference Table */}
        <div className="mt-8">
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2 text-white">
            <TerminalSquare className="w-5 h-5 text-indigo-400" />
            Mounted RESTful Endpoints
          </h3>
          <p className="text-sm text-neutral-500 mb-6 max-w-2xl">
            Only the registered React frontend application can invoke these endpoints. Any external Curl/Postman hits are rejected at the firewall gateway level by pre-flight CORS protocols.
          </p>
          
          <div className="border border-neutral-800 rounded-xl overflow-hidden bg-[#111111]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-[#0a0a0a] border-b border-neutral-800 font-medium text-neutral-400 text-xs uppercase tracking-wider font-mono">
                  <tr>
                    <th className="px-6 py-4">Protocol</th>
                    <th className="px-6 py-4 w-full">Endpoint Path URI</th>
                    <th className="px-6 py-4">Security Policy / Middleware</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/50 text-neutral-300 font-mono text-xs">
                  <tr className="hover:bg-neutral-900 transition-colors">
                    <td className="px-6 py-4"><span className="text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded font-bold">GET</span></td>
                    <td className="px-6 py-4 text-neutral-200">/api/health</td>
                    <td className="px-6 py-4"><span className="text-neutral-500">Global RateLimit</span></td>
                  </tr>
                  <tr className="hover:bg-neutral-900 transition-colors">
                    <td className="px-6 py-4"><span className="text-amber-400 bg-amber-400/10 px-2 py-1 rounded font-bold">POST</span></td>
                    <td className="px-6 py-4 text-neutral-200">/api/admin/keys/generate</td>
                    <td className="px-6 py-4"><span className="text-rose-400 bg-rose-400/10 border border-rose-400/20 px-2 py-1 rounded">requireAdmin</span></td>
                  </tr>
                  <tr className="hover:bg-neutral-900 transition-colors">
                    <td className="px-6 py-4"><span className="text-amber-400 bg-amber-400/10 px-2 py-1 rounded font-bold">POST</span></td>
                    <td className="px-6 py-4 text-neutral-200">/api/user/activate-key</td>
                    <td className="px-6 py-4"><span className="text-indigo-400 bg-indigo-400/10 border border-indigo-400/20 px-2 py-1 rounded">requireAuth</span></td>
                  </tr>
                  <tr className="hover:bg-neutral-900 transition-colors">
                    <td className="px-6 py-4"><span className="text-amber-400 bg-amber-400/10 px-2 py-1 rounded font-bold">POST</span></td>
                    <td className="px-6 py-4 text-neutral-200">/api/stream/request/:videoId</td>
                    <td className="px-6 py-4 flex items-center gap-2">
                      <span className="text-indigo-400 bg-indigo-400/10 border border-indigo-400/20 px-2 py-1 rounded">requireAuth</span>
                      <span className="text-fuchsia-400 bg-fuchsia-400/10 border border-fuchsia-400/20 px-2 py-1 rounded">monitorDevice</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-neutral-900 transition-colors">
                    <td className="px-6 py-4"><span className="text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded font-bold">GET</span></td>
                    <td className="px-6 py-4 text-neutral-200">/api/stream/proxy/:proxyId</td>
                    <td className="px-6 py-4"><span className="text-indigo-400 bg-indigo-400/10 border border-indigo-400/20 px-2 py-1 rounded">requireAuth</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Security & Compliance Notice Block */}
        <div className="mt-12 bg-red-950/20 border border-red-900/50 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="mt-1 p-2 bg-red-500/10 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-red-400 mb-2">Security & Compliance Notice</h3>
              <p className="text-sm text-neutral-400 leading-relaxed max-w-4xl mb-4">
                This API infrastructure is specifically built for internal application use. We enforce a strictly regulated CORS origin policy locked entirely to <code className="bg-black/50 px-1.5 py-0.5 rounded text-neutral-300 font-mono text-xs">https://skillneast.vercel.app/</code>.
              </p>
              
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-sm text-neutral-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                  <p><strong className="text-red-300">Misuse & Scraping Prohibited:</strong> Direct API hits via terminal, scripts, unauthorized mobile applications, or third-party web clients are automatically blocked. Aggressive scraping or fuzzing will result in immediate IP blacklisting across the firewall.</p>
                </li>
                <li className="flex items-start gap-3 text-sm text-neutral-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                  <p><strong className="text-red-300">Rate Limiting Enforced:</strong> Global rate limiters are active on all endpoints. Bursty traffic triggering DDoS protection protocols will drop packets silently without standard HTTP error responses.</p>
                </li>
                <li className="flex items-start gap-3 text-sm text-neutral-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                  <p><strong className="text-red-300">Session Proxies:</strong> All media streams utilize securely signed, expiring, one-time proxy URIs tied strictly to the requesting device footprint to prevent piracy and direct stream dumping.</p>
                </li>
              </ul>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}

