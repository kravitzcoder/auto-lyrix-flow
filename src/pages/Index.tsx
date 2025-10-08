import { Hero } from "@/components/Hero";
import { ProcessSteps } from "@/components/ProcessSteps";
import { FileUpload } from "@/components/FileUpload";
import { DemoSection } from "@/components/DemoSection";
import { HelpSection } from "@/components/HelpSection";
import { Footer } from "@/components/Footer";
import { GitHubTokenTest } from "@/components/GitHubTokenTest";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Hero />
            
      <ProcessSteps />
      
      <section className="py-20">
        <div className="container max-w-4xl mx-auto px-4">
          <FileUpload />
        </div>
      </section>
      
      <DemoSection />
      <HelpSection />
      <Footer />
    </div>
  );
};

export default Index;
