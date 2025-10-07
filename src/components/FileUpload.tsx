import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileAudio, FileText, X } from "lucide-react";
import { toast } from "sonner";

export const FileUpload = () => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [lyrics, setLyrics] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  
  const audioInputRef = useRef<HTMLInputElement>(null);
  const lyricsInputRef = useRef<HTMLInputElement>(null);

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

  const handleStartAlignment = () => {
    if (!audioFile) {
      toast.error("Please upload an audio file first");
      return;
    }
    if (!lyrics.trim()) {
      toast.error("Please enter or upload lyrics");
      return;
    }
    
    toast.success("Starting alignment process...", {
      description: "This is a demo. Backend integration coming soon!"
    });
  };

  return (
    <section id="upload-section" className="py-20 px-4 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Upload Your Files
          </h2>
          <p className="text-muted-foreground text-lg">
            Get started by uploading your audio and lyrics
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Audio Upload */}
          <div className="animate-slide-up">
            <div className="bg-card/50 backdrop-blur-sm border-2 border-dashed border-border rounded-2xl p-8 hover:border-primary/50 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <FileAudio className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-semibold">Audio File</h3>
              </div>
              
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
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-2 text-primary">
                      <FileAudio className="w-8 h-8" />
                      <span className="font-medium">{audioFile.name}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {(audioFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAudioFile(null)}
                      className="gap-2"
                    >
                      <X className="w-4 h-4" />
                      Remove
                    </Button>
                  </div>
                ) : (
                  <>
                    <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg mb-2">Drop your audio file here</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      or click to browse
                    </p>
                    <Button
                      variant="secondary"
                      onClick={() => audioInputRef.current?.click()}
                    >
                      Select Audio File
                    </Button>
                    <p className="text-xs text-muted-foreground mt-4">
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
                />
              </div>
            </div>
          </div>

          {/* Lyrics Upload */}
          <div className="animate-slide-up" style={{ animationDelay: '150ms' }}>
            <div className="bg-card/50 backdrop-blur-sm border-2 border-dashed border-border rounded-2xl p-8 hover:border-accent/50 transition-all duration-300 h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-accent" />
                  <h3 className="text-xl font-semibold">Lyrics</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => lyricsInputRef.current?.click()}
                >
                  Upload File
                </Button>
                <input
                  ref={lyricsInputRef}
                  type="file"
                  accept=".txt,.lrc"
                  onChange={handleLyricsFileSelect}
                  className="hidden"
                />
              </div>
              
              <Textarea
                placeholder="Paste or type your lyrics here...

Example:
Verse 1:
This is the first line
This is the second line..."
                value={lyrics}
                onChange={(e) => setLyrics(e.target.value)}
                className="min-h-[250px] resize-none bg-background/50 border-border focus:border-accent/50"
              />
              
              <p className="text-xs text-muted-foreground mt-3">
                Plain text or LRC format supported
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="text-center mt-12 animate-fade-in">
          <Button
            variant="hero"
            size="lg"
            onClick={handleStartAlignment}
            className="px-12"
          >
            Start Alignment
          </Button>
        </div>
      </div>
    </section>
  );
};
