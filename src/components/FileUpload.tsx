import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileAudio, FileText, X, Download, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useAutoLyrixAlign } from "@/hooks/useAutoLyrixAlign";

export const FileUpload = () => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [lyrics, setLyrics] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const lyricsInputRef = useRef<HTMLInputElement>(null);

  // Backend integration hook
  const {
    startAlignment,
    isProcessing,
    progress,
    error,
    result,
    reset
  } = useAutoLyrixAlign();

  const handleAudioDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.type.includes('audio') || file.name.match(/\.(mp3|wav|m4a)$/i))) {
      setAudioFile(file);
      toast.success(`Audio file "${file.name}" uploaded successfully!`);
    } else {
      toast.error("Please upload a valid audio file (MP3, WAV, M4A)");
    }
  };

  const handleAudioSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
      toast.success(`Audio file "${file.name}" uploaded successfully!`);
    }
  };

  const handleLyricsFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setLyrics(e.target?.result as string);
        toast.success("Lyrics file loaded successfully!");
      };
      reader.readAsText(file);
    }
  };

  const handleStartAlignment = async () => {
    if (!audioFile) {
      toast.error("Please upload an audio file first");
      return;
    }
    if (!lyrics.trim()) {
      toast.error("Please enter or upload lyrics");
      return;
    }

    // Reset any previous state
    reset();

    try {
      await startAlignment(audioFile, lyrics, 'lrc');
      toast.success("Alignment completed successfully!");
    } catch (error) {
      toast.error("Alignment failed. Please try again.");
    }
  };

  const handleNewAlignment = () => {
    reset();
    setAudioFile(null);
    setLyrics("");
    if (audioInputRef.current) audioInputRef.current.value = "";
    if (lyricsInputRef.current) lyricsInputRef.current.value = "";
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gradient">Upload Your Files</h2>
        <p className="text-muted-foreground">Get started by uploading your audio and lyrics</p>
      </div>

      {/* Processing Status */}
      {(isProcessing || error || result) && (
        <div className="bg-card border rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            {isProcessing && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
            {error && <AlertCircle className="h-5 w-5 text-destructive" />}
            {result && <CheckCircle className="h-5 w-5 text-green-500" />}
            
            {isProcessing && "Processing Alignment..."}
            {error && "Processing Failed"}
            {result && "Alignment Complete!"}
          </h3>

          {/* Progress Display */}
          {isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{progress.stage}</span>
                <span>{progress.percentage}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
              {progress.message && (
                <p className="text-sm text-muted-foreground">{progress.message}</p>
              )}
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="text-destructive">
              <p className="font-medium">Error:</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Success Display */}
          {result && (
            <div className="space-y-3">
              <p className="text-green-600">Your aligned lyrics are ready for download!</p>
              <div className="flex gap-3">
                <Button 
                  onClick={() => window.open(result.downloadUrl, '_blank')}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download LRC File
                </Button>
                <Button variant="outline" onClick={handleNewAlignment}>
                  Start New Alignment
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Audio Upload */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <FileAudio className="h-5 w-5" />
          Audio File
        </h3>
        
        <div
          onDrop={handleAudioDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
            isDragging
              ? 'border-primary bg-primary/5 scale-105'
              : 'border-border hover:border-primary/30'
          }`}
        >
          {audioFile ? (
            <div className="space-y-3">
              <FileAudio className="h-12 w-12 mx-auto text-primary" />
              <div>
                <p className="font-medium">{audioFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(audioFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setAudioFile(null)}
                className="gap-2"
                disabled={isProcessing}
              >
                <X className="h-4 w-4" />
                Remove
              </Button>
            </div>
          ) : (
            <>
              <Upload className="h-12 w-12 mx-auto text-primary mb-4" />
              <div className="space-y-2">
                <p className="text-lg font-medium">Drop your audio file here</p>
                <p className="text-muted-foreground">or click to browse</p>
              </div>
              <Button
                onClick={() => audioInputRef.current?.click()}
                className="mt-4"
                disabled={isProcessing}
              >
                Select Audio File
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                Supports MP3, WAV, M4A (Max 20MB)
              </p>
            </>
          )}
          
          <input
            ref={audioInputRef}
            type="file"
            accept=".mp3,.wav,.m4a,audio/*"
            onChange={handleAudioSelect}
            className="hidden"
            disabled={isProcessing}
          />
        </div>
      </div>

      {/* Lyrics Upload */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Lyrics
        </h3>
        
        <div className="flex gap-2 mb-4">
          <Button
            variant="outline"
            onClick={() => lyricsInputRef.current?.click()}
            className="gap-2"
            disabled={isProcessing}
          >
            <Upload className="h-4 w-4" />
            Upload File
          </Button>
        </div>
        
        <Textarea
          placeholder="Enter your lyrics here or upload a text file above..."
          value={lyrics}
          onChange={(e) => setLyrics(e.target.value)}
          className="min-h-[250px] resize-none bg-background/50 border-border focus:border-accent/50"
          disabled={isProcessing}
        />
        
        <p className="text-sm text-muted-foreground">
          Plain text or LRC format supported
        </p>
        
        <input
          ref={lyricsInputRef}
          type="file"
          accept=".txt,.lrc"
          onChange={handleLyricsFileSelect}
          className="hidden"
          disabled={isProcessing}
        />
      </div>

      {/* Action Button */}
      {!result && (
        <div className="pt-4">
          <Button
            onClick={handleStartAlignment}
            size="lg"
            className="w-full text-lg py-6"
            disabled={!audioFile || !lyrics.trim() || isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Processing...
              </>
            ) : (
              "Start Alignment"
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
