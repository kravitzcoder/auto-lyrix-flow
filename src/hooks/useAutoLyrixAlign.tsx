/**
 * AutoLyrixAlign API Integration Hook
 * Connects the frontend to GitHub Actions backend processing
 * Updated to handle file size limitations
 */
import { useState, useCallback } from 'react';

// Types
export interface AlignmentJob {
  jobId: string;
  status: 'starting' | 'processing' | 'completed' | 'failed' | 'timeout';
  progress: number;
  message: string;
  results?: AlignmentResult[];
  error?: string;
}

export interface AlignmentResult {
  word: string;
  start: number;
  end: number;
  confidence?: number;
}

// Configuration
const GITHUB_CONFIG = {
  owner: 'kravitzcoder',
  repo: 'auto-lyrix-flow',
  token: import.meta.env.VITE_GITHUB_TOKEN,
  baseUrl: 'https://api.github.com'
};

class AutoLyrixAPI {
  private generateJobId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `job_${timestamp}_${random}`;
  }

  /**
   * Test GitHub token and repository access
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      if (!GITHUB_CONFIG.token) {
        return { 
          success: false, 
          error: 'GitHub token not found. Please check VITE_GITHUB_TOKEN in Netlify environment variables.' 
        };
      }

      console.log('Testing GitHub connection...');
      const response = await fetch(
        `${GITHUB_CONFIG.baseUrl}/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}`,
        {
          headers: {
            'Authorization': `token ${GITHUB_CONFIG.token}`,
            'Accept': 'application/vnd.github.v3+json',
          }
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        return { 
          success: false, 
          error: `GitHub API error: ${response.status} - ${errorText}` 
        };
      }

      console.log('GitHub connection successful!');
      return { success: true };
    } catch (error) {
      console.error('GitHub connection test failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown connection error' 
      };
    }
  }

  /**
   * Process file metadata for demo
   * In production, this would upload to cloud storage
   */
  private processFileForDemo(file: File): { filename: string; size: number; type: string; demo_note: string } {
    return {
      filename: file.name,
      size: file.size,
      type: file.type,
      demo_note: "In production, file would be uploaded to cloud storage (AWS S3, Cloudinary, etc.) and URL sent to workflow"
    };
  }

  /**
   * Trigger GitHub Actions workflow
   */
  async startAlignment(
    audioFile: File,
    lyricsText: string,
    outputFormat: 'lrc' | 'json' | 'srt' = 'lrc'
  ): Promise<string> {
    try {
      // Test connection first
      const connectionTest = await this.testConnection();
      if (!connectionTest.success) {
        throw new Error(connectionTest.error);
      }

      const jobId = this.generateJobId();
      console.log('Generated job ID:', jobId);
      
      // Process file metadata (not the actual file content)
      console.log('Processing file metadata...');
      const fileInfo = this.processFileForDemo(audioFile);
      
      // Truncate lyrics if too long for demo
      const truncatedLyrics = lyricsText.length > 1000 
        ? lyricsText.substring(0, 1000) + "..." 
        : lyricsText;
      
      console.log('Triggering GitHub Actions workflow...');
      
      // Create a payload that fits within GitHub's size limits
      const payload = {
        event_type: 'align-lyrics',
        client_payload: {
          job_id: jobId,
          audio_file_info: fileInfo,
          lyrics_text: truncatedLyrics,
          format: outputFormat,
          demo_mode: true,
          timestamp: new Date().toISOString()
        }
      };
      
      console.log('Payload size check:', JSON.stringify(payload).length, 'characters');
      
      // Trigger GitHub Actions workflow via repository dispatch
      const response = await fetch(
        `${GITHUB_CONFIG.baseUrl}/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/dispatches`,
        {
          method: 'POST',
          headers: {
            'Authorization': `token ${GITHUB_CONFIG.token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`GitHub API error: ${response.status} - ${errorText}`);
      }

      console.log('Workflow triggered successfully!');
      return jobId;
    } catch (error) {
      console.error('Failed to start alignment:', error);
      throw error;
    }
  }

  /**
   * Check workflow status
   */
  async checkWorkflowStatus(since?: Date): Promise<any[]> {
    try {
      const sinceParam = since ? `&created=${since.toISOString()}` : '';
      const response = await fetch(
        `${GITHUB_CONFIG.baseUrl}/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/actions/runs?per_page=10${sinceParam}`,
        {
          headers: {
            'Authorization': `token ${GITHUB_CONFIG.token}`,
            'Accept': 'application/vnd.github.v3+json',
          }
        }
      );

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const data = await response.json();
      return data.workflow_runs.filter((run: any) => 
        run.name === 'AutoLyrixAlign Processing'
      );
    } catch (error) {
      console.error('Failed to check workflow status:', error);
      throw error;
    }
  }

  /**
   * Get workflow artifacts (results)
   */
  async getWorkflowArtifacts(runId: number): Promise<any[]> {
    try {
      const response = await fetch(
        `${GITHUB_CONFIG.baseUrl}/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/actions/runs/${runId}/artifacts`,
        {
          headers: {
            'Authorization': `token ${GITHUB_CONFIG.token}`,
            'Accept': 'application/vnd.github.v3+json',
          }
        }
      );

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const data = await response.json();
      return data.artifacts;
    } catch (error) {
      console.error('Failed to get artifacts:', error);
      throw error;
    }
  }
}

/**
 * React Hook for AutoLyrixAlign processing
 */
export function useAutoLyrixAlign() {
  const [currentJob, setCurrentJob] = useState<AlignmentJob | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const api = new AutoLyrixAPI();

  /**
   * Start alignment process
   */
  const startAlignment = useCallback(async (
    audioFile: File,
    lyricsText: string,
    outputFormat: 'lrc' | 'json' | 'srt' = 'lrc'
  ) => {
    try {
      setIsProcessing(true);
      
      // Initialize job
      const job: AlignmentJob = {
        jobId: '',
        status: 'starting',
        progress: 0,
        message: 'Preparing to start alignment...'
      };
      setCurrentJob(job);

      // Validate file size for demo
      if (audioFile.size > 50 * 1024 * 1024) { // 50MB limit for demo
        throw new Error('File too large for demo. Please use a file under 50MB.');
      }

      // Start the alignment
      job.message = 'Testing connection...';
      job.progress = 5;
      setCurrentJob({ ...job });

      job.message = 'Processing file metadata...';
      job.progress = 15;
      setCurrentJob({ ...job });
      
      const jobId = await api.startAlignment(audioFile, lyricsText, outputFormat);
      
      job.jobId = jobId;
      job.status = 'processing';
      job.message = 'Workflow triggered! Waiting for GitHub Actions to process...';
      job.progress = 30;
      setCurrentJob({ ...job });

      // Poll for completion
      const startTime = Date.now();
      const maxWaitTime = 5 * 60 * 1000; // 5 minutes for demo
      const pollInterval = 15000; // 15 seconds

      const pollForCompletion = async (): Promise<void> => {
        if (Date.now() - startTime > maxWaitTime) {
          job.status = 'timeout';
          job.message = 'Demo timeout reached. Check GitHub Actions for results.';
          job.progress = 95;
          setCurrentJob({ ...job });
          return;
        }

        try {
          // Check recent workflow runs
          const workflows = await api.checkWorkflowStatus(new Date(startTime));
          const relevantRun = workflows.find((run: any) => 
            run.created_at > new Date(startTime - 60000).toISOString()
          );

          if (relevantRun) {
            job.progress = relevantRun.status === 'in_progress' ? 70 : 85;
            job.message = relevantRun.status === 'in_progress' 
              ? 'GitHub Actions is processing your request...' 
              : 'Finalizing results...';
            setCurrentJob({ ...job });

            if (relevantRun.conclusion === 'success') {
              // Get artifacts
              const artifacts = await api.getWorkflowArtifacts(relevantRun.id);
              job.status = 'completed';
              job.progress = 100;
              job.message = 'Alignment completed successfully!';
              job.results = artifacts;
              setCurrentJob({ ...job });
              return;
            } else if (relevantRun.conclusion === 'failure') {
              job.status = 'failed';
              job.error = 'GitHub Actions workflow failed. Check the Actions tab for details.';
              job.message = 'Processing failed';
              setCurrentJob({ ...job });
              return;
            }
          }

          // Continue polling
          setTimeout(pollForCompletion, pollInterval);
        } catch (error) {
          console.error('Polling error:', error);
          setTimeout(pollForCompletion, pollInterval);
        }
      };

      // Start polling after a short delay
      setTimeout(pollForCompletion, 5000);

    } catch (error) {
      console.error('Alignment failed:', error);
      const job: AlignmentJob = {
        jobId: '',
        status: 'failed',
        progress: 0,
        message: 'Failed to start alignment',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
      setCurrentJob(job);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  /**
   * Reset current job
   */
  const reset = useCallback(() => {
    setCurrentJob(null);
    setIsProcessing(false);
  }, []);

  // Match the API expected by FileUpload component
  return {
    startAlignment,
    isProcessing,
    progress: {
      stage: currentJob?.message || '',
      percentage: currentJob?.progress || 0,
      message: currentJob?.message || ''
    },
    error: currentJob?.error,
    result: currentJob?.status === 'completed' ? {
      downloadUrl: `https://github.com/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/actions`,
      artifacts: currentJob.results
    } : null,
    reset,
    
    // Additional properties
    currentJob,
    status: currentJob?.status || 'idle',
    isCompleted: currentJob?.status === 'completed',
    isFailed: currentJob?.status === 'failed',
    hasResults: Boolean(currentJob?.results?.length)
  };
}

export default useAutoLyrixAlign;
