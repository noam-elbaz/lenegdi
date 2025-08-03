import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { getAudioClasses } from '../lib/supabase';

function DataTest() {
  const [testResult, setTestResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testAudioClassesTable = async () => {
    setLoading(true);
    setTestResult('Testing audio_classes_public table...');
    
    try {
      const data = await getAudioClasses();
      if (data && data.length > 0) {
        setTestResult(`✅ Success! Found ${data?.length || 0} audio classes.
        
Sample record structure:
${JSON.stringify(data[0], null, 2)}

Available columns: ${Object.keys(data[0]).join(', ')}`);
      } else {
        setTestResult('✅ Connected but no data found');
      }
    } catch (error) {
      setTestResult(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testDirectQuery = async () => {
    setLoading(true);
    setTestResult('Testing direct table query...');
    
    try {
      // Try different table names
      const tables = ['audio_classes', 'audio_classes_public', 'audio_class'];
      
      for (const tableName of tables) {
        try {
          const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .limit(5);
            
          if (!error) {
            setTestResult(`✅ Found table: ${tableName}\nData: ${JSON.stringify(data, null, 2)}`);
            return;
          }
        } catch (err) {
          console.log(`Table ${tableName} not found:`, err);
        }
      }
      
      setTestResult('❌ No audio classes table found. Available tables might be different.');
    } catch (error) {
      setTestResult(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testInsertSchema = async () => {
    setLoading(true);
    setTestResult('Testing insert table schema...');
    
    try {
      // Try to see what columns the audio_classes table expects
      const { data, error } = await supabase
        .from('audio_classes')
        .select('*')
        .limit(1);
        
      if (error) {
        setTestResult(`❌ Insert table error: ${error.message}`);
      } else {
        setTestResult(`✅ Insert table accessible. Sample record:
${data.length > 0 ? JSON.stringify(data[0], null, 2) : 'No records found'}

Available columns: ${data.length > 0 ? Object.keys(data[0]).join(', ') : 'Unknown'}`);
      }
    } catch (error) {
      setTestResult(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const createMockData = () => {
    const mockData = [
      {
        id: 1,
        title: "Torah Study - Introduction",
        description: "Basic principles of Torah interpretation and study methods",
        category: "Torah Study",
        tags: ["beginner", "torah", "study"],
        created_at: "2024-01-15T10:00:00Z",
        duration: 30,
        audio_url: "https://www.w3schools.com/html/horse.mp3"
      },
      {
        id: 2,
        title: "Morning Prayer Guide",
        description: "Step-by-step guide to morning prayers",
        category: "Prayer",
        tags: ["prayer", "morning", "guide"],
        created_at: "2024-01-10T15:30:00Z",
        duration: 30,
        audio_url: "https://www.w3schools.com/html/horse.ogg"
      }
    ];
    
    setTestResult(`📝 Mock data that should work:\n${JSON.stringify(mockData, null, 2)}`);
  };

  return (
    <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-6">
      <h3 className="text-lg font-bold mb-4">📊 Data Connection Test</h3>
      
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={testAudioClassesTable}
            disabled={loading}
            className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Test getAudioClasses()
          </button>
          
          <button
            onClick={testDirectQuery}
            disabled={loading}
            className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            Test Table Names
          </button>
          
          <button
            onClick={testInsertSchema}
            disabled={loading}
            className="px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
          >
            Check Insert Schema
          </button>
          
          <button
            onClick={createMockData}
            className="px-3 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
          >
            Show Mock Data
          </button>
        </div>
        
        {testResult && (
          <div className="p-3 bg-white rounded border">
            <pre className="text-xs whitespace-pre-wrap overflow-auto max-h-64">{testResult}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default DataTest;