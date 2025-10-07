import { Hero } from "@/components/Hero";
import { ProcessSteps } from "@/components/ProcessSteps";
import { FileUpload } from "@/components/FileUpload";
import { DemoSection } from "@/components/DemoSection";
import { HelpSection } from "@/components/HelpSection";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <ProcessSteps />
      <FileUpload />
      <DemoSection />
      <HelpSection />
      <Footer />
    </div>
  );
};

export default Index;
