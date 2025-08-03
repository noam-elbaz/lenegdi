import { useState } from 'react';
import { supabase } from '../lib/supabase';

function SupabaseTest() {
  const [testResult, setTestResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setTestResult('Testing connection...');
    
    try {
      // Test basic connection
      const { error } = await supabase.from('audio_classes').select('count').limit(1);
      
      if (error) {
        setTestResult(`❌ Connection failed: ${error.message}`);
      } else {
        setTestResult('✅ Supabase connection successful!');
      }
    } catch (err) {
      setTestResult(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testAuth = async () => {
    setLoading(true);
    setTestResult('Testing authentication...');
    
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        setTestResult(`❌ Auth failed: ${error.message}`);
      } else if (session) {
        setTestResult(`✅ User logged in: ${session.user.email}`);
      } else {
        setTestResult('ℹ️ No active session (not logged in)');
      }
    } catch (err) {
      setTestResult(`❌ Auth error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
      <h3 className="text-lg font-bold mb-4">🔗 Supabase Connection Test</h3>
      
      <div className="space-y-3">
        <div className="flex space-x-3">
          <button
            onClick={testConnection}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Test Database Connection
          </button>
          
          <button
            onClick={testAuth}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            Test Authentication
          </button>
        </div>
        
        {testResult && (
          <div className="p-3 bg-white rounded border">
            <pre className="text-sm whitespace-pre-wrap">{testResult}</pre>
          </div>
        )}
        
        <div className="text-sm text-gray-600">
          <div>Environment Check:</div>
          <div>• VITE_SUPABASE_URL: {import.meta.env.VITE_SUPABASE_URL ? '✅ Set' : '❌ Missing'}</div>
          <div>• VITE_SUPABASE_ANON_KEY: {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}</div>
        </div>
      </div>
    </div>
  );
}

export default SupabaseTest;