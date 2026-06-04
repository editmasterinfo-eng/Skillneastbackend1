import { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  Database, 
  TerminalSquare, 
  Server, 
  Lock, 
  Activity,
  PlaySquare
} from "lucide-react";

export default function App() {
  const [healthStatus, setHealthStatus] = useState<string>("Checking...");

  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => setHealthStatus(data.status === "ok" ? "Online" : "Offline"))
      .catch((_) => setHealthStatus("Offline"));
  }, []);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-neutral-800">
      <main className="max-w-5xl mx-auto px-6 py-20">
        
        {/* Header Section */}
        <header className="mb-16 border-b border-neutral-800 pb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-neutral-900 border border-neutral-800 shadow-sm">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </span>
            <h1 className="text-2xl font-medium tracking-tight">Secure Course API System</h1>
          </div>
          <p className="text-neutral-400 max-w-2xl text-lg leading-relaxed">
            Enterprise-grade backend architecture established. Configured with strict CORS, rate-limiting, and Telegram Bot stream proxying to protect digital assets.
          </p>
          
          <div className="mt-8 flex items-center gap-4 text-sm font-mono text-neutral-500">
            <span className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-md">
              <Activity className="w-4 h-4" />
              API Status: <span className={healthStatus === "Online" ? "text-emerald-400" : "text-amber-400"}>{healthStatus}</span>
            </span>
            <span className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-md">
              <Server className="w-4 h-4" />
              Port: 3000
            </span>
          </div>
        </header>

        {/* Core Architecture Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <div className="p-6 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-colors">
            <Database className="w-6 h-6 text-indigo-400 mb-4" />
            <h2 className="text-base font-medium mb-2">Firestore Admin Gateway</h2>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Client-side DB access explicitly disabled. All read/writes proxy through Node.js Express controllers enforcing strict CRUD limits.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-colors">
            <PlaySquare className="w-6 h-6 text-blue-400 mb-4" />
            <h2 className="text-base font-medium mb-2">Telegram Stream Proxy</h2>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Original Telegram source URLs (m3u8/mp4) are never exposed. Short-lived proxy endpoints are generated per user device.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-colors">
            <Lock className="w-6 h-6 text-amber-400 mb-4" />
            <h2 className="text-base font-medium mb-2">License & Progress Guard</h2>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Anti-cheat mechanisms block rapid progress scrubbing. License key activations wrapped in transactional writes to prevent double-redeem.
            </p>
          </div>

        </div>

        {/* API Endpoint Reference Table */}
        <div className="mt-16">
          <h3 className="text-lg font-medium mb-6 flex items-center gap-2">
            <TerminalSquare className="w-5 h-5 text-neutral-400" />
            Mounted API Endpoints
          </h3>
          
          <div className="border border-neutral-800 rounded-xl overflow-hidden bg-neutral-900/50">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-neutral-900 border-b border-neutral-800 font-medium text-neutral-300">
                <tr>
                  <th className="px-6 py-4">Method</th>
                  <th className="px-6 py-4 w-full">Endpoint Path</th>
                  <th className="px-6 py-4">Middleware</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800 text-neutral-400 font-mono text-xs">
                <tr className="hover:bg-neutral-900/80 transition-colors">
                  <td className="px-6 py-4"><span className="text-emerald-400">GET</span></td>
                  <td className="px-6 py-4 text-emerald-100">/api/health</td>
                  <td className="px-6 py-4">Global RateLimit</td>
                </tr>
                <tr className="hover:bg-neutral-900/80 transition-colors">
                  <td className="px-6 py-4"><span className="text-amber-400">POST</span></td>
                  <td className="px-6 py-4 text-emerald-100">/api/admin/keys/generate</td>
                  <td className="px-6 py-4 text-rose-400">requireAdmin</td>
                </tr>
                <tr className="hover:bg-neutral-900/80 transition-colors">
                  <td className="px-6 py-4"><span className="text-amber-400">POST</span></td>
                  <td className="px-6 py-4 text-emerald-100">/api/user/activate-key</td>
                  <td className="px-6 py-4 text-indigo-400">requireAuth</td>
                </tr>
                <tr className="hover:bg-neutral-900/80 transition-colors">
                  <td className="px-6 py-4"><span className="text-amber-400">POST</span></td>
                  <td className="px-6 py-4 text-emerald-100">/api/stream/request/:videoId</td>
                  <td className="px-6 py-4 flex gap-2"><span className="text-indigo-400">requireAuth</span> <span className="text-orange-400">monitorDevice</span></td>
                </tr>
                <tr className="hover:bg-neutral-900/80 transition-colors">
                  <td className="px-6 py-4"><span className="text-emerald-400">GET</span></td>
                  <td className="px-6 py-4 text-emerald-100">/api/stream/proxy/:proxyId</td>
                  <td className="px-6 py-4 text-indigo-400">requireAuth</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}
