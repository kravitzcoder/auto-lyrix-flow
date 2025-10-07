import { Upload, Cpu, Download } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Upload",
    description: "Upload your audio file and lyrics",
    color: "text-primary"
  },
  {
    icon: Cpu,
    title: "Align",
    description: "AI processes and syncs lyrics to audio",
    color: "text-secondary"
  },
  {
    icon: Download,
    title: "Export",
    description: "Download in LRC, JSON, or SRT format",
    color: "text-accent"
  }
];

export const ProcessSteps = () => {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            How It Works
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Three simple steps to perfectly aligned lyrics
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div 
              key={step.title}
              className="relative animate-slide-up"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Connector Line (hidden on mobile) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
              )}
              
              <div className="relative bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-8 text-center hover:border-primary/50 transition-all duration-300 group hover:shadow-glow">
                {/* Step Number */}
                <div className="absolute -top-4 -right-4 w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center text-primary-foreground font-bold shadow-lg">
                  {index + 1}
                </div>
                
                {/* Icon */}
                <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-card to-muted flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <step.icon className={`w-10 h-10 ${step.color}`} />
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-semibold mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
