/**
 * AutoLyrixAlign API Integration Hook - REAL Progress Tracking
 * Fixed to show actual GitHub Actions workflow progress
 */
import { useState, useCallback } from 'react';

// Types
export interface AlignmentJob {
  jobId: string;
  status: 'starting' | 'processing' | 'completed' | 'failed' | 'timeout';
  progress: number;
  message: string;
  results?: any[];
  error?: string;
  workflowRunId?: number;
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
   * Test GitHub token
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      if (!GITHUB_CONFIG.token) {
        return { 
          success: false, 
          error: 'GitHub token not found. Please check VITE_GITHUB_TOKEN in Netlify environment variables.' 
        };
      }

      const response = await fetch(
        `${GITHUB_CONFIG.baseUrl}/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}`,
        {
          headers: {
            'Authorization': `token ${GITHUB_CONFIG.token}`,
            'Accept': 'application/vnd.github.v3+json',
          }
        }
      );

      return { success: response.ok };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Connection failed' };
    }
  }

  /**
   * Trigger GitHub Actions workflow
   */
  async startAlignment(
    audioFile: File,
    lyricsText: string,
    outputFormat: 'lrc' | 'json' | 'srt' = 'lrc'
  ): Promise<string> {
    const connectionTest = await this.testConnection();
    if (!connectionTest.success) {
      throw new Error(connectionTest.error);
    }

    const jobId = this.generateJobId();
    
    // Process file metadata only (not actual content)
    const fileInfo = {
      filename: audioFile.name,
      size: audioFile.size,
      type: audioFile.type,
      demo_note: "Demo mode - actual audio processing would happen in production"
    };
    
    // Truncate lyrics if too long
    const truncatedLyrics = lyricsText.length > 1000 
      ? lyricsText.substring(0, 1000) + "..." 
      : lyricsText;
    
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

    return jobId;
  }

  /**
   * Get workflow runs since a specific time
   */
  async getWorkflowRuns(since: Date): Promise<any[]> {
    const response = await fetch(
      `${GITHUB_CONFIG.baseUrl}/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/actions/runs?per_page=20&created=${since.toISOString()}`,
      {
        headers: {
          'Authorization': `token ${GITHUB_CONFIG.token}`,
          'Accept': 'application/vnd.github.v3+json',
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch workflow runs: ${response.status}`);
    }

    const data = await response.json();
    return data.workflow_runs.filter((run: any) => 
      run.name === 'AutoLyrixAlign Processing'
    );
  }

  /**
   * Get workflow artifacts
   */
  async getWorkflowArtifacts(runId: number): Promise<any[]> {
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
      throw new Error(`Failed to fetch artifacts: ${response.status}`);
    }

    const data = await response.json();
    return data.artifacts;
  }
}

/**
 * React Hook for AutoLyrixAlign processing with REAL progress tracking
 */
export function useAutoLyrixAlign() {
  const [currentJob, setCurrentJob] = useState<AlignmentJob | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const api = new AutoLyrixAPI();

  /**
   * Start alignment process with REAL progress tracking
   */
  const startAlignment = useCallback(async (
    audioFile: File,
    lyricsText: string,
    outputFormat: 'lrc' | 'json' | 'srt' = 'lrc'
  ) => {
    console.log('🚀 Starting alignment process...');
    setIsProcessing(true);
    
    const job: AlignmentJob = {
      jobId: '',
      status: 'starting',
      progress: 0,
      message: 'Initializing...'
    };
    setCurrentJob(job);

    try {
      // Step 1: Test connection
      job.message = 'Testing GitHub connection...';
      job.progress = 5;
      setCurrentJob({ ...job });
      
      // Step 2: Trigger workflow
      job.message = 'Triggering GitHub Actions workflow...';
      job.progress = 15;
      setCurrentJob({ ...job });
      
      const jobId = await api.startAlignment(audioFile, lyricsText, outputFormat);
      console.log('✅ Workflow triggered, Job ID:', jobId);
      
      job.jobId = jobId;
      job.status = 'processing';
      job.message = 'Workflow started! Waiting for processing...';
      job.progress = 25;
      setCurrentJob({ ...job });

      // Step 3: Poll for completion with REAL GitHub Actions status
      const startTime = Date.now();
      const maxWaitTime = 8 * 60 * 1000; // 8 minutes
      const pollInterval = 10000; // 10 seconds

      const pollForCompletion = async (): Promise<void> => {
        const elapsedTime = Date.now() - startTime;
        
        if (elapsedTime > maxWaitTime) {
          job.status = 'timeout';
          job.message = 'Processing timed out. Check GitHub Actions for results.';
          job.progress = 95;
          setCurrentJob({ ...job });
          setIsProcessing(false);
          return;
        }

        try {
          console.log('🔍 Polling for workflow status...');
          
          // Get recent workflow runs
          const workflows = await api.getWorkflowRuns(new Date(startTime - 30000)); // 30 seconds before start
          console.log('📊 Found workflows:', workflows.length);
          
          // Find the most recent workflow (should be ours)
          const recentRun = workflows.find((run: any) => {
            const runCreatedAt = new Date(run.created_at).getTime();
            return runCreatedAt >= startTime - 60000; // Within 1 minute of start
          });

          if (recentRun) {
            console.log('🎯 Found matching workflow run:', recentRun.id, 'Status:', recentRun.status, 'Conclusion:', recentRun.conclusion);
            
            job.workflowRunId = recentRun.id;
            
            // Update progress based on actual workflow status
            if (recentRun.status === 'in_progress') {
              job.progress = Math.min(job.progress + 10, 80); // Gradually increase to 80%
              job.message = 'GitHub Actions is processing your request...';
              setCurrentJob({ ...job });
              
            } else if (recentRun.status === 'completed') {
              if (recentRun.conclusion === 'success') {
                console.log('✅ Workflow completed successfully!');
                
                // Get artifacts
                job.message = 'Fetching results...';
                job.progress = 90;
                setCurrentJob({ ...job });
                
                try {
                  const artifacts = await api.getWorkflowArtifacts(recentRun.id);
                  console.log('📦 Found artifacts:', artifacts.length);
                  
                  job.status = 'completed';
                  job.progress = 100;
                  job.message = 'Alignment completed successfully!';
                  job.results = artifacts;
                  setCurrentJob({ ...job });
                  setIsProcessing(false);
                  return;
                  
                } catch (artifactError) {
                  console.error('❌ Failed to fetch artifacts:', artifactError);
                  job.status = 'completed';
                  job.progress = 100;
                  job.message = 'Processing completed! Check GitHub Actions for files.';
                  setCurrentJob({ ...job });
                  setIsProcessing(false);
                  return;
                }
                
              } else {
                console.error('❌ Workflow failed with conclusion:', recentRun.conclusion);
                job.status = 'failed';
                job.error = `GitHub Actions workflow failed: ${recentRun.conclusion}`;
                job.message = 'Processing failed. Check GitHub Actions for details.';
                setCurrentJob({ ...job });
                setIsProcessing(false);
                return;
              }
            }
          } else {
            // No workflow found yet, keep waiting
            job.message = `Waiting for workflow to start... (${Math.round(elapsedTime/1000)}s)`;
            setCurrentJob({ ...job });
          }

          // Continue polling
          setTimeout(pollForCompletion, pollInterval);
          
        } catch (pollError) {
          console.error('❌ Polling error:', pollError);
          // Continue polling despite errors
          setTimeout(pollForCompletion, pollInterval);
        }
      };

      // Start polling after a short delay
      setTimeout(pollForCompletion, 5000);

    } catch (error) {
      console.error('❌ Alignment failed:', error);
      const failedJob: AlignmentJob = {
        jobId: '',
        status: 'failed',
        progress: 0,
        message: 'Failed to start alignment',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
      setCurrentJob(failedJob);
      setIsProcessing(false);
      throw error;
    }
  }, []);

  /**
   * Reset job state
   */
  const reset = useCallback(() => {
    console.log('🔄 Resetting job state');
    setCurrentJob(null);
    setIsProcessing(false);
  }, []);

  // Return the expected API for FileUpload component
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
      downloadUrl: currentJob.workflowRunId 
        ? `https://github.com/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/actions/runs/${currentJob.workflowRunId}`
        : `https://github.com/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/actions`,
      artifacts: currentJob.results || []
    } : null,
    reset,
    
    // Additional debug properties
    currentJob,
    status: currentJob?.status || 'idle',
    isCompleted: currentJob?.status === 'completed',
    isFailed: currentJob?.status === 'failed'
  };
}

export default useAutoLyrixAlign;
