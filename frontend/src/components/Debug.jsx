import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Debug = () => {
  const [showDebug, setShowDebug] = useState(false);
  const [apiResponse, setApiResponse] = useState(null);
  const { user, token } = useAuth();
  
  // Get API URL from environment variables with fallback
  const apiUrl = 
    (window.ENV_CONFIG?.VITE_API_URL) || 
    import.meta.env.VITE_API_URL || 
    'http://localhost:5000';
  
  // Test API connection
  const testApiConnection = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/auth/me`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        }
      });
      const data = await response.json();
      setApiResponse({
        status: response.status,
        ok: response.ok,
        data
      });
    } catch (error) {
      setApiResponse({
        error: error.message
      });
    }
  };
  
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
    <div className="fixed bottom-2 right-2 bg-gray-800 text-white p-3 rounded-md text-xs max-w-xs z-50 max-h-[80vh] overflow-auto">
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
          <span className="font-semibold">Auth State: </span>
          <span className="text-yellow-400">
            {user ? 'Logged in ✓' : 'Not logged in ✗'}
          </span>
        </div>
        
        <div>
          <span className="font-semibold">User ID: </span>
          <span className="text-blue-400">
            {user?._id || 'N/A'}
          </span>
        </div>
        
        <div>
          <span className="font-semibold">Token: </span>
          <span className="text-yellow-400">
            {token ? 'Present ✓' : 'Missing ✗'}
          </span>
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
        
        <div className="mt-4">
          <button 
            onClick={testApiConnection}
            className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs"
          >
            Test API Connection
          </button>
          
          {apiResponse && (
            <div className="mt-2 p-2 bg-gray-700 rounded">
              <div>Status: {apiResponse.status || 'Error'}</div>
              {apiResponse.error && <div className="text-red-400">Error: {apiResponse.error}</div>}
              {apiResponse.data && (
                <div className="mt-1">
                  <div>Response: {apiResponse.ok ? '✓' : '✗'}</div>
                  <pre className="text-xs mt-1 overflow-auto max-h-20">
                    {JSON.stringify(apiResponse.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Debug; 