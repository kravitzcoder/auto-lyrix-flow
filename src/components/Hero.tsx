import { Button } from "@/components/ui/button";
import { Music, Sparkles, Zap } from "lucide-react";

export const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-hero opacity-20 blur-3xl" />
      
      {/* Animated circles */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse-glow delay-1000" />
      
      <div className="container relative z-10 px-4 mx-auto text-center animate-fade-in">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Music className="w-8 h-8 text-primary" />
          <Sparkles className="w-6 h-6 text-accent animate-pulse" />
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
          AutoLyrixAlign
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground mb-4 max-w-3xl mx-auto">
          AI-Powered Lyrics Alignment Tool
        </p>
        
        <p className="text-base md:text-lg text-muted-foreground/80 mb-12 max-w-2xl mx-auto leading-relaxed">
          Automatically synchronize song lyrics with audio tracks at word-level precision. 
          Perfect for musicians, content creators, and audio engineers.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            variant="hero" 
            size="lg"
            className="group"
            onClick={() => document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <Zap className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            Get Started
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => document.getElementById('demo-section')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Try Demo
          </Button>
        </div>
        
        {/* Feature Pills */}
        <div className="flex flex-wrap gap-3 justify-center mt-12">
          {[
            "Word-Level Precision",
            "Multiple Export Formats",
            "Real-time Preview",
            "AI-Powered"
          ].map((feature) => (
            <div 
              key={feature}
              className="px-4 py-2 rounded-full bg-card/50 backdrop-blur-sm border border-border text-sm text-muted-foreground"
            >
              {feature}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
