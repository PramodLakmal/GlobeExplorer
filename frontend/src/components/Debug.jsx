import { useState } from 'react';

const Debug = () => {
  const [showDebug, setShowDebug] = useState(false);
  
  // Get API URL from environment variables with fallback
  const apiUrl = 
    (window.ENV_CONFIG?.VITE_API_URL) || 
    import.meta.env.VITE_API_URL || 
    'http://localhost:5000';
  
  if (!showDebug) {
    return (
      <button 
        onClick={() => setShowDebug(true)}
        className="fixed bottom-2 right-2 bg-gray-800 text-xs text-white p-1 rounded-md opacity-50 hover:opacity-100"
      >
        Debug
      </button>
    );
  }
  
  return (
    <div className="fixed bottom-2 right-2 bg-gray-800 text-white p-3 rounded-md text-xs max-w-xs z-50">
      <div className="flex justify-between mb-2">
        <h3 className="font-bold">Debug Info</h3>
        <button onClick={() => setShowDebug(false)} className="text-gray-400 hover:text-white">
          ×
        </button>
      </div>
      
      <div className="space-y-2">
        <div>
          <span className="font-semibold">API URL: </span>
          <span className="text-green-400 break-all">{apiUrl}</span>
        </div>
        
        <div>
          <span className="font-semibold">window.ENV_CONFIG: </span>
          <span className="text-yellow-400">
            {window.ENV_CONFIG ? 'Loaded ✓' : 'Not found ✗'}
          </span>
        </div>
        
        <div>
          <span className="font-semibold">import.meta.env: </span>
          <span className="text-yellow-400">
            {import.meta.env.VITE_API_URL ? 'Found ✓' : 'Not found ✗'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Debug; 