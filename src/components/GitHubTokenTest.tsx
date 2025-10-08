import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export const GitHubTokenTest = () => {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const testToken = async () => {
    setTesting(true);
    setResult(null);

    try {
      const token = import.meta.env.VITE_GITHUB_TOKEN;
      
      if (!token) {
        setResult({
          success: false,
          message: 'VITE_GITHUB_TOKEN environment variable not found. Please check your Netlify settings.'
        });
        return;
      }

      console.log('Testing GitHub API with token:', token.substring(0, 10) + '...');
      
      const response = await fetch(
        'https://api.github.com/repos/kravitzcoder/auto-lyrix-flow',
        {
          headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json',
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setResult({
          success: true,
          message: `GitHub API connection successful! Repository: ${data.full_name}`
        });
      } else {
        const errorText = await response.text();
        setResult({
          success: false,
          message: `GitHub API error: ${response.status} - ${errorText}`
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="bg-card border rounded-xl p-6 space-y-4">
      <h3 className="text-lg font-semibold">GitHub Token Test</h3>
      <p className="text-sm text-muted-foreground">
        Test if your GitHub token is properly configured
      </p>
      
      <Button 
        onClick={testToken} 
        disabled={testing}
        className="gap-2"
      >
        {testing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Testing...
          </>
        ) : (
          'Test GitHub Connection'
        )}
      </Button>
      
      {result && (
        <div className={`flex items-start gap-2 p-3 rounded-lg ${
          result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {result.success ? (
            <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          )}
          <div>
            <p className="font-medium">
              {result.success ? 'Success!' : 'Failed'}
            </p>
            <p className="text-sm">{result.message}</p>
          </div>
        </div>
      )}
    </div>
  );
};
