/**
 * Example component showing how to integrate AutoLyrixAlign with your existing Lovable frontend
 * This demonstrates how to add the backend functionality to your current UI
 */

import React, { useState } from 'react';
import { useAutoLyrixAlign } from '@/hooks/useAutoLyrixAlign';

// Assuming you're using shadcn/ui components (which you have installed)
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Icons from lucide-react (which you have installed)
import { Upload, FileAudio, FileText, Download, PlayCircle, AlertCircle, CheckCircle2 } from 'lucide-react';

interface AlignmentInterfaceProps {
  className?: string;
}

export function AlignmentInterface({ className }: AlignmentInterfaceProps) {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [lyricsText, setLyricsText] = useState('');
  const [outputFormat, setOutputFormat] = useState<'lrc' | 'json' | 'srt'>('lrc');
  
  const {
    currentJob,
    isProcessing,
    startAlignment,
    reset,
    progress,
    status,
    error,
    result,
    isCompleted,
    isFailed
  } = useAutoLyrixAlign();

  const hasResults = !!result;

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/mp4', 'audio/m4a'];
      if (!validTypes.includes(file.type)) {
        alert('Please select a valid audio file (MP3, WAV, or M4A)');
        return;
      }
      
      // Validate file size (50MB limit)
      if (file.size > 50 * 1024 * 1024) {
        alert('File too large. Maximum size is 50MB.');
        return;
      }
      
      setAudioFile(file);
    }
  };

  const handleStartAlignment = async () => {
    if (!audioFile || !lyricsText.trim()) {
      alert('Please select an audio file and enter lyrics text');
      return;
    }

    await startAlignment(audioFile, lyricsText, outputFormat);
  };

  const canStart = audioFile && lyricsText.trim() && !isProcessing;

  return (
    <div className={`max-w-4xl mx-auto p-6 space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">AutoLyrix Alignment</h1>
        <p className="text-muted-foreground">
          AI-powered word-level lyrics to audio synchronization
        </p>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Your Files
          </CardTitle>
          <CardDescription>
            Select your audio file and provide the lyrics for alignment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Audio File Upload */}
          <div className="space-y-2">
            <Label htmlFor="audio-upload" className="flex items-center gap-2">
              <FileAudio className="h-4 w-4" />
              Audio File
            </Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <input
                id="audio-upload"
                type="file"
                accept="audio/mp3,audio/wav,audio/m4a"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isProcessing}
              />
              <label htmlFor="audio-upload" className="cursor-pointer">
                {audioFile ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="font-medium">{audioFile.name}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {(audioFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <FileAudio className="h-12 w-12 mx-auto text-gray-400" />
                    <div>
                      <p className="font-medium">Click to upload audio file</p>
                      <p className="text-sm text-muted-foreground">
                        MP3, WAV, or M4A (max 50MB)
                      </p>
                    </div>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Lyrics Text */}
          <div className="space-y-2">
            <Label htmlFor="lyrics-input" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Lyrics Text
            </Label>
            <Textarea
              id="lyrics-input"
              placeholder="Paste your song lyrics here..."
              value={lyricsText}
              onChange={(e) => setLyricsText(e.target.value)}
              disabled={isProcessing}
              rows={8}
              className="resize-none"
            />
          </div>

          {/* Output Format Selection */}
          <div className="space-y-2">
            <Label htmlFor="format-select">Output Format</Label>
            <Select value={outputFormat} onValueChange={(value: 'lrc' | 'json' | 'srt') => setOutputFormat(value)}>
              <SelectTrigger id="format-select" disabled={isProcessing}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lrc">LRC - Lyric File Format</SelectItem>
                <SelectItem value="json">JSON - Structured Data</SelectItem>
                <SelectItem value="srt">SRT - Subtitle Format</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Start Button */}
          <Button 
            onClick={handleStartAlignment}
            disabled={!canStart}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Processing...
              </>
            ) : (
              <>
                <PlayCircle className="h-4 w-4 mr-2" />
                Start Alignment
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Progress Section */}
      {currentJob && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isCompleted && <CheckCircle2 className="h-5 w-5 text-green-600" />}
              {isFailed && <AlertCircle className="h-5 w-5 text-red-600" />}
              {isProcessing && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />}
              Processing Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{progress.percentage}%</span>
              </div>
              <Progress value={progress.percentage} className="w-full" />
            </div>

            {/* Status Message */}
            <div className="flex items-center gap-2">
              <Badge variant={isFailed ? "destructive" : isCompleted ? "default" : "secondary"}>
                {status}
              </Badge>
              <span className="text-sm">{progress.message}</span>
            </div>

            {/* Job ID */}
            {currentJob.jobId && (
              <p className="text-xs text-muted-foreground">
                Job ID: {currentJob.jobId}
              </p>
            )}

            {/* Error Message */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Results */}
            {hasResults && (
              <div className="space-y-3">
                <h4 className="font-semibold text-green-600">Alignment Completed!</h4>
                <p className="text-sm text-muted-foreground">
                  Your aligned lyrics are ready for download.
                </p>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => result?.downloadUrl && window.open(result.downloadUrl, '_blank')}
                    variant="outline"
                    size="sm"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    View Results on GitHub
                  </Button>
                  <Button 
                    onClick={reset}
                    variant="ghost"
                    size="sm"
                  >
                    Start New Alignment
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Features Section */}
      <Card>
        <CardHeader>
          <CardTitle>Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center space-y-2">
              <div className="bg-blue-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
                <PlayCircle className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-semibold">Word-Level Precision</h4>
              <p className="text-sm text-muted-foreground">
                AI-powered alignment with precise timing
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="bg-green-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
                <Download className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-semibold">Multiple Formats</h4>
              <p className="text-sm text-muted-foreground">
                Export as LRC, JSON, or SRT
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="bg-purple-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
                <FileAudio className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="font-semibold">Audio Support</h4>
              <p className="text-sm text-muted-foreground">
                MP3, WAV, and M4A files
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="bg-orange-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-6 w-6 text-orange-600" />
              </div>
              <h4 className="font-semibold">Real-time Progress</h4>
              <p className="text-sm text-muted-foreground">
                Live status updates
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AlignmentInterface;