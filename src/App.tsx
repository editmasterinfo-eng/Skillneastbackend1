import React, { useEffect } from 'react';

export default function App() {
  useEffect(() => {
    document.title = "403 Forbidden";
  }, []);

  const rayId = React.useMemo(() => {
    const chars = '0123456789abcdef';
    let result = '';
    for (let i = 0; i < 16; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  }, []);

  const ip = React.useMemo(() => {
    return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans p-8 flex flex-col">
      <div className="max-w-4xl mx-auto w-full mt-12 flex-1">
        <h1 className="text-4xl font-semibold text-gray-900 mb-2">403 Forbidden</h1>
        <h2 className="text-xl font-normal text-gray-600 mb-8">Access to this resource on the server is denied!</h2>
        
        <p className="text-base text-gray-700 mb-4">
          Either the client certificate was rejected, or you don't have the appropriate privileges to view the requested URL. 
          The Web Application Firewall (WAF) has blocked this request.
        </p>
        
        <div className="mt-16 border-t border-gray-200 pt-6 text-sm text-gray-500 font-mono space-y-1.5">
          <p>Error reference number: {rayId}</p>
          <p>Client IP: {ip}</p>
          <p>Edge Server ID: ap-southeast-1-fw-09</p>
          <p>Date: {new Date().toUTCString()}</p>
        </div>
      </div>
    </div>
  );
}


