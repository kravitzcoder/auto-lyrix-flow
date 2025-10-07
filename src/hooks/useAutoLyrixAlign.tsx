/**
 * AutoLyrixAlign API Integration Hook
 * Connects the frontend to GitHub Actions backend processing
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

export interface AlignmentMetadata {
  job_id: string;
  status: string;
  output_format: string;
  word_count: number;
  duration: number;
  average_confidence: number;
  output_file: string;
}

// Configuration
const GITHUB_CONFIG = {
  owner: 'kravitzcoder',
  repo: 'auto-lyrix-flow',
  token: import.meta.env.VITE_GITHUB_TOKEN, // Set in Netlify env vars
  baseUrl: 'https://api.github.com'
};

class AutoLyrixAPI {
  private generateJobId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `job_${timestamp}_${random}`;
  }

  /**
   * Upload file to temporary storage
   * In this example, we'll use a data URL for small files
   * For production, integrate with Cloudinary, AWS S3, etc.
   */
  private async uploadFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        reject(new Error('File too large. Maximum size is 50MB.'));
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        // For demo purposes, we'll use data URLs
        // In production, upload to actual file storage
        resolve(reader.result as string);
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
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
      const jobId = this.generateJobId();
      
      // Upload audio file (or get URL)
      const audioUrl = await this.uploadFile(audioFile);
      
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
          body: JSON.stringify({
            event_type: 'align-lyrics',
            client_payload: {
              audio_url: audioUrl,
              lyrics_text: lyricsText,
              format: outputFormat,
              job_id: jobId
            }
          })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`GitHub API error: ${response.status} - ${errorText}`);
      }

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

      // Start the alignment
      job.message = 'Starting alignment process...';
      job.progress = 10;
      setCurrentJob({ ...job });
      
      const jobId = await api.startAlignment(audioFile, lyricsText, outputFormat);
      job.jobId = jobId;
      job.status = 'processing';
      job.message = 'AI is analyzing audio and aligning lyrics...';
      job.progress = 30;
      setCurrentJob({ ...job });

      // Poll for completion
      const startTime = Date.now();
      const maxWaitTime = 10 * 60 * 1000; // 10 minutes
      const pollInterval = 10000; // 10 seconds
      
      const pollForCompletion = async (): Promise<void> => {
        if (Date.now() - startTime > maxWaitTime) {
          job.status = 'timeout';
          job.message = 'Processing timed out. Please try again with a smaller file.';
          setCurrentJob({ ...job });
          return;
        }

        try {
          // Check recent workflow runs
          const workflows = await api.checkWorkflowStatus(new Date(startTime));
          const relevantRun = workflows.find((run: any) => 
            run.created_at > new Date(startTime - 60000).toISOString() && // Within last minute of start
            (run.status === 'completed' || run.status === 'in_progress')
          );

          if (relevantRun) {
            job.progress = relevantRun.status === 'in_progress' ? 70 : 90;
            job.message = relevantRun.status === 'in_progress' 
              ? 'Processing audio and lyrics...' 
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
              job.error = 'Processing failed. Please check your audio file and try again.';
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
      const job: AlignmentJob = {
        jobId: '',
        status: 'failed',
        progress: 0,
        message: 'Failed to start alignment',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
      setCurrentJob(job);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  /**
   * Reset current job
   */
  const resetJob = useCallback(() => {
    setCurrentJob(null);
    setIsProcessing(false);
  }, []);

  /**
   * Download result file
   */
  const downloadResult = useCallback(async (artifact: any) => {
    try {
      // Note: GitHub artifact download requires authentication
      // For now, we'll open the GitHub Actions page
      const runUrl = `https://github.com/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/actions`;
      window.open(runUrl, '_blank');
    } catch (error) {
      console.error('Download failed:', error);
    }
  }, []);

  return {
    currentJob,
    isProcessing,
    startAlignment,
    resetJob,
    downloadResult,
    
    // Computed properties for easy UI binding
    progress: currentJob?.progress || 0,
    status: currentJob?.status || 'idle',
    message: currentJob?.message || '',
    error: currentJob?.error,
    results: currentJob?.results,
    isCompleted: currentJob?.status === 'completed',
    isFailed: currentJob?.status === 'failed',
    hasResults: Boolean(currentJob?.results?.length)
  };
}

export default useAutoLyrixAlign;