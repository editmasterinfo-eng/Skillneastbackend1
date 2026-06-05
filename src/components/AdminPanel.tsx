import React, { useState, useEffect } from 'react';
import { 
  Users, Database, Settings, Key, Activity, 
  Map, ShieldCheck, Plus, Trash2, Send, Globe,
  Server, AlertTriangle, CheckCircle2, Info, FileText,
  Music, Clock, Coins, Lock, Unlock, Wifi, RefreshCw
} from 'lucide-react';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [adminToken, setAdminToken] = useState(localStorage.getItem('adminToken') || '');
  const [users, setUsers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [keys, setKeys] = useState<any[]>([]);
  const [filesCatalog, setFilesCatalog] = useState<any[]>([]);
  const [behaviorLogs, setBehaviorLogs] = useState<any[]>([]);
  const [liveAnalytics, setLiveAnalytics] = useState<any>(null);
  const [systemSettings, setSystemSettings] = useState<any>({
    storageLimit: 250,
    backupDomain: 'https://backup.securecourseapi.com',
    maintenanceMode: false
  });
  const [activePopup, setActivePopup] = useState<any>({
    message: '',
    active: false,
    type: 'info'
  });

  // CMS modal/form states
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    category: 'Programming',
    imageUrl: ''
  });
  const [fileForm, setFileForm] = useState({
    fileName: '',
    url: '',
    size: 2048576, // ~2MB
    fileType: 'pdf'
  });
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    coins: 50,
    isPremium: false,
    country: 'India',
    city: 'Delhi',
    lastIp: '103.241.12.89'
  });

  // Status/Alert state
  const [alertMsg, setAlertMsg] = useState<{ text: string; type: 'success' | 'detail' | 'error' | null }>({ text: '', type: null });

  const showNotification = (text: string, type: 'success' | 'detail' | 'error' = 'success') => {
    setAlertMsg({ text, type });
    setTimeout(() => {
      setAlertMsg({ text: '', type: null });
    }, 4000);
  };

  // Central fetcher
  const fetchAPI = async (endpoint: string, method: string = 'GET', body: any = null) => {
    try {
      const headers: any = { 'Content-Type': 'application/json' };
      if (adminToken) headers['Authorization'] = `Bearer ${adminToken}`;
      
      const config: any = { method, headers };
      if (body) config.body = JSON.stringify(body);

      const res = await fetch(`/api/admin/${endpoint}`, config);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Server error experienced');
      return data;
    } catch (err: any) {
      showNotification(`Error: ${err.message}`, 'error');
      return null;
    }
  };

  const loadData = async () => {
    if (!adminToken) return;
    
    // Load whichever tab is active
    if (activeTab === 'dashboard') {
      const analytics = await fetchAPI('analytics/live');
      if (analytics) setLiveAnalytics(analytics);
      
      const logs = await fetchAPI('analytics/behavior');
      if (logs) setBehaviorLogs(logs);

      const cmsCourses = await fetchAPI('cms/courses');
      if (cmsCourses) setCourses(cmsCourses);
    } else if (activeTab === 'users') {
      const data = await fetchAPI('users');
      if (data) setUsers(data);
    } else if (activeTab === 'cms') {
      const cmsCourses = await fetchAPI('cms/courses');
      if (cmsCourses) setCourses(cmsCourses);

      const files = await fetchAPI('cms/files');
      if (files) setFilesCatalog(files);

      const activePop = await fetchAPI('cms/popups');
      if (activePop) setActivePopup(activePop);
    } else if (activeTab === 'keys') {
      const keyList = await fetchAPI('keys');
      if (keyList) setKeys(keyList);
    } else if (activeTab === 'settings') {
      const sys = await fetchAPI('settings');
      if (sys) setSystemSettings(sys);

      const activePop = await fetchAPI('cms/popups');
      if (activePop) setActivePopup(activePop);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab, adminToken]);

  // Auth Submit
  const handleAuthSubmit = (token: string) => {
    if (token) {
      localStorage.setItem('adminToken', token);
      setAdminToken(token);
      showNotification('Admin authorization logged successfully', 'success');
    }
  };

  // 1. Users Actions & Coins Handlers
  const handleUserAction = async (id: string, action: string) => {
    const data = await fetchAPI(`users/${id}/action`, 'POST', { action });
    if (data?.success) {
      showNotification(`User updated to: ${action}`, 'success');
      loadData();
    }
  };

  const handleCustomCoin = async (id: string, amountStr: string, mode: 'add' | 'deduct') => {
    const amount = parseInt(amountStr, 10);
    if (isNaN(amount) || amount <= 0) {
      showNotification('Please provide a valid positive coin value', 'error');
      return;
    }
    const data = await fetchAPI(`users/${id}/coins`, 'POST', { amount, type: mode });
    if (data?.success) {
      showNotification(`Successfully adjusted user by ${mode === 'add' ? '+' : '-'}${amount} coins`, 'success');
      loadData();
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = await fetchAPI('users', 'POST', userForm);
    if (data?.success) {
      showNotification('New simulation user record created!', 'success');
      setUserForm({
        name: '',
        email: '',
        coins: 50,
        isPremium: false,
        country: 'India',
        city: 'Delhi',
        lastIp: '103.241.12.89'
      });
      loadData();
    }
  };

  // 2. CMS Course & Files Catalog Handlers
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = await fetchAPI('cms/courses', 'POST', courseForm);
    if (data?.success) {
      showNotification('Educational Content Asset Created!', 'success');
      setCourseForm({ title: '', description: '', category: 'Programming', imageUrl: '' });
      loadData();
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    const data = await fetchAPI(`cms/courses/${id}`, 'DELETE');
    if (data?.success) {
      showNotification('Course catalog deleted successfully', 'success');
      loadData();
    }
  };

  const handleRegisterFile = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = await fetchAPI('cms/files', 'POST', fileForm);
    if (data?.success) {
      showNotification('Resource asset catalog registered!', 'success');
      setFileForm({ fileName: '', url: '', size: 2048576, fileType: 'pdf' });
      loadData();
    }
  };

  const handleDeleteFile = async (id: string) => {
    if (!confirm('Are you sure you want to unregister this file?')) return;
    const data = await fetchAPI(`cms/files/${id}`, 'DELETE');
    if (data?.success) {
      showNotification('Resource asset metadata deleted', 'success');
      loadData();
    }
  };

  const handleUpdatePopupAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = await fetchAPI('cms/popups', 'POST', activePopup);
    if (data?.success) {
      showNotification('Welcome popup banner updated globally', 'success');
      loadData();
    }
  };

  // 3. License Creator Handlers
  const handleGenerateBatchKeys = async (e: React.FormEvent, countVal: string, keyType: string) => {
    e.preventDefault();
    const count = parseInt(countVal, 10);
    if (isNaN(count) || count < 1 || count > 50) {
      showNotification('Limit key ranges to 1 - 50 keys at a time', 'error');
      return;
    }
    const data = await fetchAPI('keys/generate', 'POST', { type: keyType, count });
    if (data?.success) {
      showNotification(`Dispatched ${data.keys.length} fresh alpha activation credentials`, 'success');
      loadData();
    }
  };

  const handleRevokeKey = async (keyPlain: string) => {
    if (!confirm(`Are you sure you want to revoke key: ${keyPlain}?`)) return;
    const data = await fetchAPI(`keys/${keyPlain}`, 'DELETE');
    if (data?.success) {
      showNotification('Activation key revoked from system catalog', 'success');
      loadData();
    }
  };

  // 4. Site Configuration & Communications Handlers
  const handleSaveSystemSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = await fetchAPI('settings', 'POST', systemSettings);
    if (data?.success) {
      showNotification('Global configurations saved successfully', 'success');
      loadData();
    }
  };

  const handlePushSystemNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as any;
    const title = form.notiTitle.value;
    const body = form.notiBody.value;
    const target = form.notiTarget.value;

    if (!title || !body) {
      showNotification('Notification fields are required', 'error');
      return;
    }

    const data = await fetchAPI('notifications', 'POST', { title, body, target });
    if (data?.success) {
      showNotification(`System notification broadcasted to subset: ${target}`, 'success');
      form.reset();
      loadData();
    }
  };

  if (!adminToken) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[65vh] text-neutral-100">
        <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 p-8 rounded-2xl shadow-xl flex flex-col items-center">
          <span className="flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-6">
            <ShieldCheck className="w-8 h-8 text-emerald-400" />
          </span>
          <h2 className="text-2xl font-semibold mb-2">Platform Control Hub</h2>
          <p className="text-neutral-500 text-sm mb-6 text-center">
            Provide the administrative verification credential key to unlock backend REST APIs and secure metrics.
          </p>
          <input 
            type="password" 
            placeholder="Type master pass (default: admin123)"
            className="px-4 py-3 bg-neutral-950 border border-neutral-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl w-full text-center mb-4 text-white font-mono placeholder:text-neutral-700 outline-none transition-all"
            onKeyDown={(e: any) => {
              if (e.key === 'Enter') {
                handleAuthSubmit(e.target.value);
              }
            }}
          />
          <button 
            onClick={(e: any) => {
              const input = e.target.previousSibling as HTMLInputElement;
              handleAuthSubmit(input.value);
            }} 
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-semibold py-2.5 rounded-xl transition-colors cursor-pointer"
          >
            Authenticate Control Suite
          </button>
          <p className="text-xs text-neutral-600 mt-4 font-mono">Press Enter or click to submit.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="text-neutral-100 max-w-6xl mx-auto space-y-6">
      
      {/* Alert Header Banner */}
      {alertMsg.text && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 transition-opacity duration-300 ${alertMsg.type === 'error' ? 'bg-red-950/20 border-red-800/30 text-red-400' : 'bg-emerald-950/20 border-emerald-800/20 text-emerald-400'}`}>
          {alertMsg.type === 'error' ? <AlertTriangle className="w-5 h-5 flex-shrink-0" /> : <CheckCircle2 className="w-5 h-5 flex-shrink-0" />}
          <p className="text-sm font-medium">{alertMsg.text}</p>
        </div>
      )}

      <div className="flex bg-neutral-900/60 backdrop-blur-md rounded-2xl border border-neutral-800/70 overflow-hidden shadow-2xl min-h-[750px]">
        {/* Sidebar Controls */}
        <div className="w-64 bg-neutral-955 border-r border-neutral-800 p-6 flex flex-col gap-1">
          <div className="flex items-center gap-2 mb-8 px-2 align-middle">
            <span className="w-8 h-8 flex items-center justify-center bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </span>
            <div>
              <p className="text-sm font-bold text-neutral-100 tracking-wide font-mono">ROOT CONTROL</p>
              <p className="text-[10px] text-emerald-400 font-mono tracking-wider">SECURE BACKEND V1.4</p>
            </div>
          </div>
          
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/40'}`}
          >
            <Activity className="w-4 h-4" /> Live Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('users')} 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'users' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/40'}`}
          >
            <Users className="w-4 h-4" /> Users & Coins
          </button>
          <button 
            onClick={() => setActiveTab('cms')} 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'cms' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/40'}`}
          >
            <Database className="w-4 h-4" /> CMS & Audio Files
          </button>
          <button 
            onClick={() => setActiveTab('keys')} 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'keys' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/40'}`}
          >
            <Key className="w-4 h-4" /> License Keys
          </button>
          <button 
            onClick={() => setActiveTab('settings')} 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'settings' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/40'}`}
          >
            <Settings className="w-4 h-4" /> Configurations
          </button>
          
          <div className="mt-auto border-t border-neutral-800 pt-4 px-2">
            <div className="flex items-center gap-2 mb-4 text-[11px] text-neutral-500 font-mono">
              <Wifi className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              API Gateway: Connected
            </div>
            <button 
              onClick={() => { setAdminToken(''); localStorage.removeItem('adminToken'); showNotification('Logged out', 'detail'); }} 
              className="text-xs text-red-400 hover:text-red-300 font-medium transition-colors border border-red-900/20 bg-red-950/10 px-3 py-1.5 rounded-lg w-full block text-center"
            >
              Sign out Admin System
            </button>
          </div>
        </div>

        {/* Workspace Panels */}
        <div className="flex-1 p-8 overflow-y-auto">
          
          {/* ======================================= */}
          {/* A. DASHBOARD VIEW                       */}
          {/* ======================================= */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold flex items-center gap-2 text-white">
                    <Activity className="text-emerald-400" /> Active System Telemetry
                  </h3>
                  <p className="text-neutral-400 text-sm">Real-time status metrics and event tracking proxy logs.</p>
                </div>
                <button 
                  onClick={loadData} 
                  className="p-2 border border-neutral-800 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-lg transition-colors flex items-center gap-2 text-xs font-mono"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Refresh Live
                </button>
              </div>

              {/* Bento Diagnostics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-neutral-950 border border-neutral-800/80 p-5 rounded-xl shadow-sm relative overflow-hidden">
                  <p className="text-neutral-500 text-xs font-mono tracking-wider">ACTIVE CLIENT MONITORS</p>
                  <div className="text-4xl font-bold text-white mt-2 font-mono flex items-baseline gap-1.5">
                    {liveAnalytics?.activeCount || 2}
                    <span className="text-xs text-emerald-400 font-medium animate-pulse font-sans">● Live Synced</span>
                  </div>
                  <p className="text-neutral-400 text-xs mt-3 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> WebSockets routing steady
                  </p>
                  <div className="absolute right-3.5 bottom-3.5 opacity-10">
                    <Users className="w-16 h-16 text-white" />
                  </div>
                </div>

                <div className="bg-neutral-950 border border-neutral-800/80 p-5 rounded-xl shadow-sm relative overflow-hidden">
                  <p className="text-neutral-500 text-xs font-mono tracking-wider">CURRENT STREAM GATEWAY LOAD</p>
                  <div className="text-4xl font-bold text-amber-400 mt-2 font-mono">
                    {liveAnalytics?.serverCpuUsage || '12%'}
                  </div>
                  <p className="text-neutral-400 text-xs mt-3 flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5 text-amber-400" /> CPU Core Multi-threads: Peak Stable
                  </p>
                  <div className="absolute right-3.5 bottom-3.5 opacity-10">
                    <Activity className="w-16 h-16 text-white" />
                  </div>
                </div>

                <div className="bg-neutral-950 border border-neutral-800/80 p-5 rounded-xl shadow-sm relative overflow-hidden">
                  <p className="text-neutral-500 text-xs font-mono tracking-wider">PLATFORM API THROUGHPUT</p>
                  <div className="text-4xl font-bold text-cyan-400 mt-2 font-mono">
                    {liveAnalytics?.apiThroughput || '14 req/sec'}
                  </div>
                  <p className="text-neutral-400 text-xs mt-3 flex items-center gap-1.5">
                    <Wifi className="w-3.5 h-3.5 text-cyan-400" /> Strict rate-limit shields enabled
                  </p>
                  <div className="absolute right-3.5 bottom-3.5 opacity-10">
                    <Globe className="w-16 h-16 text-white" />
                  </div>
                </div>
              </div>

              {/* Push System Dispatch Card */}
              <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-6 relative">
                <div className="max-w-xl">
                  <h4 className="font-semibold text-white mb-1.5 flex items-center gap-2">
                    <Send className="w-4 h-4 text-emerald-400 font-bold" /> Dispatch Network Broadcast
                  </h4>
                  <p className="text-xs text-neutral-400 mb-4">
                    Send real-time, zero-latency system notification banners directly to client dashboards dynamically.
                  </p>
                </div>
                <form onSubmit={handlePushSystemNotification} className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-2">
                  <div className="md:col-span-4">
                    <input 
                      type="text" 
                      name="notiTitle" 
                      placeholder="Notification Title / Header"
                      className="w-full px-3.5 py-2 BG-transparent bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none hover:border-neutral-700 transition-all font-sans"
                    />
                  </div>
                  <div className="md:col-span-5">
                    <input 
                      type="text" 
                      name="notiBody" 
                      placeholder="Message context body..."
                      className="w-full px-3.5 py-2 BG-transparent bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none hover:border-neutral-700 transition-all font-sans"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <select 
                      name="notiTarget" 
                      className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-neutral-400 focus:border-indigo-500 outline-none cursor-pointer"
                    >
                      <option value="all">Broad range: All</option>
                      <option value="premium">Premium users</option>
                      <option value="vip">Standard users</option>
                    </select>
                  </div>
                  <div className="md:col-span-1 flex">
                    <button 
                      type="submit" 
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-semibold rounded-lg flex items-center justify-center cursor-pointer transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </div>

              {/* Behavior Logs Activity Audit */}
              <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-white">System Events & Retention Registry</h4>
                    <p className="text-xs text-neutral-500 mt-0.5">Real-time audit trails detailing user behavior events.</p>
                  </div>
                  <span className="px-2.5 py-1 text-[10px] uppercase font-bold font-mono tracking-wider text-emerald-400 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                    Live Session Stream Active
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-neutral-300 font-mono">
                    <thead className="bg-[#0b0c10] border-b border-neutral-800 text-neutral-400 uppercase tracking-widest text-[10px]">
                      <tr>
                        <th className="px-4 py-3 font-medium">Session IP</th>
                        <th className="px-4 py-3 font-medium">Event User Entity</th>
                        <th className="px-4 py-3 font-medium">Operational Type</th>
                        <th className="px-4 py-3 font-medium">Log Action Context</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800/60">
                      {behaviorLogs.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-4 py-6 text-center text-neutral-500">
                            No behavior events logged yet. Users are currently passive.
                          </td>
                        </tr>
                      ) : (
                        behaviorLogs.slice(0, 8).map((log: any) => (
                          <tr key={log.id} className="hover:bg-neutral-800/10 transition-colors">
                            <td className="px-4 py-3 text-neutral-400">{log.ip || '127.0.0.1'}</td>
                            <td className="px-4 py-3 font-sans text-neutral-200 font-medium">{log.email || 'SYSTEM_DAEMON'}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 text-[9px] uppercase font-bold tracking-wider rounded ${log.type === 'key_activate' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : log.type === 'login' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : log.type === 'block' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-neutral-800 text-neutral-400'}`}>
                                {log.type || 'SYSTEM'}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-sans text-neutral-400 text-xs">
                              {log.event || 'Operations routine'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================= */}
          {/* B. USERS AND COINS VIEW                  */}
          {/* ======================================= */}
          {activeTab === 'users' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold flex items-center gap-2 text-white font-sans">
                    <Users className="text-emerald-400" /> Users & Coins Database
                  </h3>
                  <p className="text-neutral-400 text-sm">Control account privileges, subscription levels, and balance assets manually.</p>
                </div>
                <span className="p-2 border border-neutral-800 text-neutral-400 rounded-lg text-xs font-mono">
                  Total Users: {users.length}
                </span>
              </div>

              {/* Create User Sandbox Form */}
              <div className="bg-neutral-950 border border-neutral-800/80 p-5 rounded-xl shadow-lg">
                <h4 className="font-semibold text-white mb-2 flex items-center gap-2 text-sm">
                  <Plus className="w-4 h-4 text-emerald-400" /> Provision Virtual Sim User Account
                </h4>
                <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                  <div>
                    <label className="block text-[10px] text-neutral-500 font-mono uppercase mb-1">Human Name</label>
                    <input 
                      type="text" 
                      placeholder="Jane Doe" 
                      value={userForm.name}
                      onChange={(e) => setUserForm({...userForm, name: e.target.value})}
                      required
                      className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-white focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-neutral-500 font-mono uppercase mb-1">Email ID</label>
                    <input 
                      type="email" 
                      placeholder="jane@example.com" 
                      value={userForm.email}
                      onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                      required
                      className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-white focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-neutral-500 font-mono uppercase mb-1">IP Gateway</label>
                    <input 
                      type="text" 
                      placeholder="210.15.89.5" 
                      value={userForm.lastIp}
                      onChange={(e) => setUserForm({...userForm, lastIp: e.target.value})}
                      required
                      className="w-full px-3 py-2 bg-[#121216] border border-neutral-800 rounded-lg text-sm font-mono text-neutral-300 focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div className="flex items-end">
                    <button 
                      type="submit" 
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-semibold py-2 rounded-lg text-sm transition-colors cursor-pointer"
                    >
                      Create Account
                    </button>
                  </div>
                </form>
              </div>

              {/* Main Users Registry */}
              <div className="bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden shadow-md">
                <table className="w-full text-left text-xs font-sans">
                  <thead className="bg-[#0b0c10] border-b border-neutral-800 text-neutral-400 uppercase font-mono tracking-widest text-[9px]">
                    <tr>
                      <th className="px-6 py-4">User Details</th>
                      <th className="px-6 py-4">Tiers & Boundaries</th>
                      <th className="px-6 py-4 font-mono">Current Coins</th>
                      <th className="px-6 py-4">Update Coins</th>
                      <th className="px-6 py-4 text-center">Identity Blockers</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/70 text-neutral-300">
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-neutral-500 font-mono">
                          No simulated user records found. Creating one is recommended.
                        </td>
                      </tr>
                    ) : (
                      users.map((u: any) => (
                        <tr key={u.id} className="hover:bg-neutral-800/10 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-semibold text-white flex items-center gap-1.5">
                              {u.name || 'Anonymous User'}
                              {u.isOnline && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />}
                            </div>
                            <div className="text-neutral-400 text-xs mt-0.5">{u.email || u.id}</div>
                            <div className="text-[10px] text-neutral-500 font-mono mt-1 flex items-center gap-1.5">
                              <Globe className="w-3 h-3 text-neutral-600" /> {u.country || 'India'}, {u.city || 'Delhi'} ({u.lastIp || '127.0.0.1'})
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              {u.isPremium ? (
                                <button 
                                  onClick={() => handleUserAction(u.id, 'standard')}
                                  className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] uppercase font-bold rounded hover:bg-neutral-800 flex items-center gap-1 cursor-pointer"
                                >
                                  Premium Active
                                </button>
                              ) : (
                                <button 
                                  onClick={() => handleUserAction(u.id, 'premium')}
                                  className="px-2 py-0.5 bg-neutral-900 text-neutral-400 text-[10px] uppercase font-medium rounded hover:bg-emerald-500/20 hover:text-emerald-400 transition-colors cursor-pointer"
                                >
                                  Assign Premium
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-emerald-400 font-mono font-bold text-sm">
                            {u.coins || 0}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1">
                              <input 
                                type="number" 
                                placeholder="50" 
                                id={`coinInput-${u.id}`}
                                className="w-16 px-2 py-1 bg-neutral-900 border border-neutral-800 rounded font-mono text-xs text-white"
                              />
                              <button 
                                onClick={() => {
                                  const val = (document.getElementById(`coinInput-${u.id}`) as HTMLInputElement).value;
                                  handleCustomCoin(u.id, val, 'add');
                                }}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-medium rounded text-[10px] cursor-pointer"
                              >
                                + Add
                              </button>
                              <button 
                                onClick={() => {
                                  const val = (document.getElementById(`coinInput-${u.id}`) as HTMLInputElement).value;
                                  handleCustomCoin(u.id, val, 'deduct');
                                }}
                                className="px-2 py-1 bg-red-650/40 hover:bg-red-600 text-red-400 border border-red-900/40 rounded text-[10px] cursor-pointer"
                              >
                                - Ded
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-3">
                              {u.isBlocked ? (
                                <button 
                                  onClick={() => handleUserAction(u.id, 'unblock')}
                                  title="Unblock User Account"
                                  className="text-red-400 hover:text-red-300 p-2 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                                >
                                  <Lock className="w-3.5 h-3.5" />
                                </button>
                              ) : (
                                <button 
                                  onClick={() => handleUserAction(u.id, 'block')}
                                  title="Suspend / Block User Account"
                                  className="text-neutral-500 hover:text-red-400 p-2 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
                                >
                                  <Unlock className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button 
                                onClick={() => handleUserAction(u.id, 'delete')}
                                title="Delete user securely"
                                className="text-neutral-600 hover:text-red-400 p-2 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ======================================= */}
          {/* C. CMS & FILES VIEW                     */}
          {/* ======================================= */}
          {activeTab === 'cms' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold flex items-center gap-2 text-white">
                    <Database className="text-emerald-400" /> CMS & Audio Files Catalog
                  </h3>
                  <p className="text-neutral-400 text-sm">Design courses, curate digital assets, register streaming files, and set user welcome banners.</p>
                </div>
              </div>

              {/* Inner Tabs Navigation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* 1. Add course batch */}
                <div className="bg-neutral-950 border border-neutral-800 p-6 rounded-xl">
                  <h4 className="font-semibold text-white mb-2 flex items-center gap-2 text-sm">
                    <Plus className="w-4 h-4 text-emerald-400 font-bold" /> Register Educational Course
                  </h4>
                  <form onSubmit={handleCreateCourse} className="space-y-3.5 mt-4">
                    <div>
                      <label className="block text-[10px] text-neutral-500 font-mono uppercase mb-0.5">Course Header Title</label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. Agency Navigator 2026"
                        value={courseForm.title}
                        onChange={(e) => setCourseForm({...courseForm, title: e.target.value})}
                        className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white focus:border-emerald-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-neutral-500 font-mono uppercase mb-0.5">Summary Context</label>
                      <textarea 
                        required
                        placeholder="Comprehensive sales funnel and agency strategy blueprint guide"
                        value={courseForm.description}
                        rows={2}
                        onChange={(e) => setCourseForm({...courseForm, description: e.target.value})}
                        className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white focus:border-emerald-500 outline-none resize-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] text-neutral-500 font-mono uppercase mb-0.5">Theme Category</label>
                        <select 
                          value={courseForm.category}
                          onChange={(e) => setCourseForm({...courseForm, category: e.target.value})}
                          className="w-full px-3 py-2 bg-[#121216] border border-neutral-800 rounded-lg text-xs text-neutral-400 outline-none"
                        >
                          <option value="Programming">Programming</option>
                          <option value="Agency SMMA">Agency SMMA</option>
                          <option value="Finance & Trading">Finance & Trading</option>
                          <option value="E-Commerce">E-Commerce</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] text-neutral-500 font-mono uppercase mb-0.5">Image Cover URL</label>
                        <input 
                          type="text" 
                          placeholder="https://example.com/cover.jpg"
                          value={courseForm.imageUrl}
                          onChange={(e) => setCourseForm({...courseForm, imageUrl: e.target.value})}
                          className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white focus:border-emerald-500 outline-none"
                        />
                      </div>
                    </div>
                    <button 
                      type="submit" 
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-semibold py-2 rounded-lg text-xs transition-colors cursor-pointer"
                    >
                      Publish Course Catalog
                    </button>
                  </form>
                </div>

                {/* 2. File Download catalog */}
                <div className="bg-neutral-950 border border-neutral-800 p-6 rounded-xl">
                  <h4 className="font-semibold text-white mb-2 flex items-center gap-2 text-sm">
                    <FileText className="w-4 h-4 text-emerald-400" /> Register Streaming / PDF Download File
                  </h4>
                  <form onSubmit={handleRegisterFile} className="space-y-3.5 mt-4">
                    <div>
                      <label className="block text-[10px] text-neutral-500 font-mono uppercase mb-0.5">File System Alphanumeric Name</label>
                      <input 
                        type="text" 
                        required
                        placeholder="agency_manifesto_blueprint_v1.pdf"
                        value={fileForm.fileName}
                        onChange={(e) => setFileForm({...fileForm, fileName: e.target.value})}
                        className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white focus:border-emerald-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-neutral-500 font-mono uppercase mb-0.5">Secure CDN Storage URL</label>
                      <input 
                        type="text" 
                        required
                        placeholder="https://secure-cdn.com/assets/file.pdf"
                        value={fileForm.url}
                        onChange={(e) => setFileForm({...fileForm, url: e.target.value})}
                        className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white focus:border-emerald-500 outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] text-neutral-500 font-mono uppercase mb-0.5">File Asset Type</label>
                        <select 
                          value={fileForm.fileType}
                          onChange={(e) => setFileForm({...fileForm, fileType: e.target.value})}
                          className="w-full px-3 py-2 bg-[#121216] border border-neutral-800 rounded-lg text-xs text-neutral-400 outline-none"
                        >
                          <option value="pdf">Document Standard (PDF)</option>
                          <option value="audio">Audio Resource (MP3)</option>
                          <option value="video">Secure Stream (MP4)</option>
                          <option value="zip">Archive Bundle (ZIP)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] text-neutral-500 font-mono uppercase mb-0.5">File Size (Bytes)</label>
                        <input 
                          type="number" 
                          required
                          value={fileForm.size}
                          onChange={(e) => setFileForm({...fileForm, size: Number(e.target.value)})}
                          className="w-full px-3 py-2 bg-[#121216] border border-neutral-800 rounded-lg text-xs text-white font-mono focus:border-emerald-500 outline-none"
                        />
                      </div>
                    </div>
                    <button 
                      type="submit" 
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-semibold py-2 rounded-lg text-xs transition-colors cursor-pointer"
                    >
                      Publish Resource Asset Metadata
                    </button>
                  </form>
                </div>
              </div>

              {/* Data lists: Courses and Files catalog */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Courses Listing */}
                <div className="bg-neutral-950 border border-neutral-800 p-6 rounded-xl">
                  <h4 className="font-semibold text-white mb-4 text-xs font-mono uppercase tracking-wider text-neutral-400">Published Active Courses</h4>
                  <div className="space-y-3 max-h-[350px] overflow-y-auto">
                    {courses.length === 0 ? (
                      <p className="text-xs text-neutral-500 italic">No courses created yet.</p>
                    ) : (
                      courses.map((c: any) => (
                        <div key={c.id} className="p-3 bg-neutral-900 border border-neutral-800/80 rounded-lg flex items-center justify-between">
                          <div>
                            <p className="text-xs font-semibold text-neutral-200">{c.title}</p>
                            <span className="inline-block mt-1 px-1.5 py-0.5 bg-neutral-800 text-neutral-400 text-[9px] uppercase font-bold rounded">
                              {c.category}
                            </span>
                          </div>
                          <button 
                            onClick={() => handleDeleteCourse(c.id)}
                            className="p-1 px-2 border border-red-950 text-red-400 hover:bg-red-500/10 rounded transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Stored Files Catalog */}
                <div className="bg-neutral-950 border border-neutral-800 p-6 rounded-xl">
                  <h4 className="font-semibold text-white mb-4 text-xs font-mono uppercase tracking-wider text-neutral-400">Active File System Assets</h4>
                  <div className="space-y-3 max-h-[350px] overflow-y-auto">
                    {filesCatalog.length === 0 ? (
                      <p className="text-xs text-neutral-500 italic">No resource files cataloged yet.</p>
                    ) : (
                      filesCatalog.map((f: any) => (
                        <div key={f.id} className="p-3 bg-neutral-900 border border-neutral-800/80 rounded-lg flex items-center justify-between">
                          <div className="truncate pr-4">
                            <p className="text-xs font-semibold text-neutral-200 truncate">{f.fileName}</p>
                            <p className="text-[10px] text-neutral-500 truncate mt-0.5 font-mono">{f.url}</p>
                            <span className="inline-block mt-1 px-1.5 py-0.5 bg-indigo-500/10 text-indigo-400 text-[8px] uppercase font-bold rounded font-mono">
                              {f.fileType || 'file'} ({(f.size / (1024 * 1024)).toFixed(1)} MB)
                            </span>
                          </div>
                          <button 
                            onClick={() => handleDeleteFile(f.id)}
                            className="p-1 px-2 border border-red-950 text-red-400 hover:bg-red-500/10 rounded transition-colors cursor-pointer flex-shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ======================================= */}
          {/* D. LICENSE KEYS VIEW                    */}
          {/* ======================================= */}
          {activeTab === 'keys' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold flex items-center gap-2 text-white">
                    <Key className="text-emerald-400" /> Premium Access Keys System
                  </h3>
                  <p className="text-neutral-400 text-sm">Review, dispatch, block, and index alpha license access coupons for users.</p>
                </div>
              </div>

              {/* Key generator panel */}
              <div className="bg-neutral-950 border border-neutral-800 p-6 rounded-xl">
                <h4 className="font-semibold text-white mb-3 text-sm flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-emerald-400" /> Generate Fresh License Voucher Credentials
                </h4>
                <form 
                  onSubmit={(e) => {
                    const selector = e.currentTarget as any;
                    handleGenerateBatchKeys(e, selector.keyCount.value, selector.keyType.value);
                  }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4 align-bottom"
                >
                  <div>
                    <label className="block text-[10px] text-neutral-500 font-mono uppercase mb-1">Redeem Type Tier</label>
                    <select 
                      name="keyType" 
                      className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-neutral-400 outline-none"
                    >
                      <option value="premium">Premium Course Tier</option>
                      <option value="ultimate">Ultimate Enterprise Access</option>
                      <option value="weekly_developer">Temporary Developer Key</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-neutral-500 font-mono uppercase mb-1">Batch Coupon Count</label>
                    <input 
                      type="number" 
                      name="keyCount" 
                      defaultValue="5"
                      min="1"
                      max="50"
                      className="w-full px-3 py-1.5 bg-[#121216] border border-neutral-800 rounded-lg text-xs font-mono text-white outline-none"
                    />
                  </div>
                  <div className="flex items-end">
                    <button 
                      type="submit" 
                      className="w-full bg-emerald-600 hover:bg-emerald-500 hover:text-white text-neutral-950 font-semibold py-2 rounded-lg text-xs transition-all tracking-wider font-mono cursor-pointer"
                    >
                      EXECUTE BATCH GENERATION
                    </button>
                  </div>
                </form>
              </div>

              {/* Verification logs table */}
              <div className="bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden shadow-lg">
                <div className="p-4 bg-neutral-900 border-b border-neutral-800 flex justify-between items-center">
                  <p className="text-xs font-bold text-neutral-400 font-mono">CREDENTIAL KEY LOG REGISTRY</p>
                  <span className="text-[10px] text-neutral-500 font-mono">Audit Log Matches</span>
                </div>
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#0b0c10] border-b border-neutral-800 text-neutral-400 uppercase tracking-widest text-[9px]">
                    <tr>
                      <th className="px-5 py-3">Redeem License Key Code</th>
                      <th className="px-5 py-3">Key Tier Type</th>
                      <th className="px-5 py-3 text-center">Catalog Status</th>
                      <th className="px-5 py-3">Redeemed Consumer UID</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/80 text-neutral-400">
                    {keys.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-5 py-8 text-center text-neutral-500">
                          No active keys detected in Firestore. Launch key synthesis above.
                        </td>
                      </tr>
                    ) : (
                      keys.map((k: any) => (
                        <tr key={k.key} className="hover:bg-neutral-800/10 transition-colors">
                          <td className="px-5 py-3 text-white font-bold tracking-wider">{k.key}</td>
                          <td className="px-5 py-3 uppercase text-[10px] text-neutral-400 font-bold">{k.type}</td>
                          <td className="px-5 py-3 text-center">
                            {k.status === 'fresh' ? (
                              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[9px], font-bold uppercase">
                                Fresh
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full text-[9px], font-bold uppercase">
                                Claimed
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-3 font-sans text-neutral-400 text-xs flex items-center justify-between">
                            <span>{k.usedBy ? k.usedBy : 'Not Activated'}</span>
                            <button 
                              onClick={() => handleRevokeKey(k.key)}
                              title="Delete Key Voucher"
                              className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-500/10 transition-colors cursor-pointer ml-4"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ======================================= */}
          {/* E. SYSTEM CONFIGURATIONS VIEW            */}
          {/* ======================================= */}
          {activeTab === 'settings' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold flex items-center gap-2 text-white">
                    <Settings className="text-emerald-400" /> Platform Configurations
                  </h3>
                  <p className="text-neutral-400 text-sm">Control backend server parameters, sync active announcements, and toggle system limits.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* 1. Edit Overall system settings */}
                <div className="bg-neutral-950 border border-neutral-800 p-6 rounded-xl flex flex-col">
                  <h4 className="font-semibold text-white mb-2 text-sm flex items-center gap-1.5">
                    <Server className="w-4 h-4 text-emerald-400" /> Administrative Constraints
                  </h4>
                  <form onSubmit={handleSaveSystemSettings} className="space-y-4 mt-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] text-neutral-500 font-mono uppercase mb-1">Global Storage Limit Block (GB)</label>
                        <input 
                          type="number" 
                          required
                          value={systemSettings.storageLimit}
                          onChange={(e) => setSystemSettings({...systemSettings, storageLimit: Number(e.target.value)})}
                          className="w-full px-3 py-2 bg-[#121216] border border-neutral-800 rounded-lg text-xs font-mono text-white focus:border-emerald-500 outline-none"
                        />
                        <p className="text-[10px] text-neutral-600 mt-1 leading-normal">Sets warning buffers when streaming large courses catalog bundles.</p>
                      </div>

                      <div>
                        <label className="block text-[10px] text-neutral-500 font-mono uppercase mb-1">Disaster Recovery Proxy Backup Domain</label>
                        <input 
                          type="text" 
                          value={systemSettings.backupDomain}
                          onChange={(e) => setSystemSettings({...systemSettings, backupDomain: e.target.value})}
                          placeholder="https://backup-proxy.io"
                          className="w-full px-3 py-2 bg-[#121216] border border-neutral-800 rounded-lg text-xs font-mono text-white focus:border-emerald-500 outline-none"
                        />
                      </div>

                      <div className="bg-neutral-900 border border-neutral-800/80 p-4 rounded-lg flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-neutral-200">Maintenance Lockout Mode</p>
                          <p className="text-[10px] text-neutral-500 mt-0.5">Toggle standard client blockages with safety shield screens.</p>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={systemSettings.maintenanceMode}
                          onChange={(e) => setSystemSettings({...systemSettings, maintenanceMode: e.target.checked})}
                          className="w-4 h-4 text-emerald-500 border-neutral-800 rounded focus:ring-emerald-500 accent-emerald-500"
                        />
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-semibold py-2.5 rounded-lg text-xs mt-6 transition-colors cursor-pointer"
                    >
                      Save Global Constraints
                    </button>
                  </form>
                </div>

                {/* 2. Welcome Announcement Editor */}
                <div className="bg-neutral-950 border border-neutral-800 p-6 rounded-xl">
                  <h4 className="font-semibold text-white mb-2 text-sm flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-emerald-400" /> Welcome Announcement Settings
                  </h4>
                  <form onSubmit={handleUpdatePopupAnnouncement} className="space-y-4 mt-4">
                    <div>
                      <label className="block text-[10px] text-neutral-500 font-mono uppercase mb-1">Banner Alert Text context</label>
                      <textarea 
                        required
                        value={activePopup.message}
                        onChange={(e) => setActivePopup({...activePopup, message: e.target.value})}
                        rows={4}
                        placeholder="Welcome system message goes here..."
                        className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white focus:border-emerald-500 outline-none resize-none"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] text-neutral-500 font-mono uppercase mb-1">Banner Visual Theme</label>
                        <select 
                          value={activePopup.type}
                          onChange={(e) => setActivePopup({...activePopup, type: e.target.value})}
                          className="w-full px-3 py-2 bg-[#121216] border border-neutral-800 rounded-lg text-xs text-neutral-400 outline-none cursor-pointer"
                        >
                          <option value="info">Info Accent (Blue)</option>
                          <option value="success">Success Affirm (Emerald)</option>
                          <option value="warning">Warning Hazard (Gold)</option>
                        </select>
                      </div>

                      <div className="flex flex-col justify-end">
                        <div className="bg-[#121216] border border-neutral-800 px-3 py-2 rounded-lg flex items-center justify-between h-[38px]">
                          <span className="text-[10px] text-neutral-400 font-mono uppercase">Display Banner</span>
                          <input 
                            type="checkbox" 
                            checked={activePopup.active}
                            onChange={(e) => setActivePopup({...activePopup, active: e.target.checked})}
                            className="w-3.5 h-3.5 text-emerald-500 accent-emerald-500"
                          />
                        </div>
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-semibold py-2.5 rounded-lg text-xs transition-colors cursor-pointer"
                    >
                      Update Banner Setup
                    </button>
                  </form>
                </div>

              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
