import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "What audio formats are supported?",
    answer: "AutoLyrixAlign supports MP3, WAV, and M4A audio formats. Files should be under 20MB for optimal processing."
  },
  {
    question: "How accurate is the alignment?",
    answer: "Our AI-powered system provides word-level precision with typical accuracy rates above 95% for clear audio recordings. Accuracy may vary based on audio quality, background noise, and vocal clarity."
  },
  {
    question: "What export formats are available?",
    answer: "You can export your aligned lyrics in LRC (Lyric file), JSON (for developers), and SRT (subtitle) formats, making them compatible with various media players and applications."
  },
  {
    question: "How long does processing take?",
    answer: "Processing time depends on the length of your audio file. Typically, a 3-4 minute song takes 30-60 seconds to process. You'll see real-time progress updates during alignment."
  },
  {
    question: "Can I edit the timestamps after alignment?",
    answer: "Yes! Once the alignment is complete, you can preview the results and make manual adjustments to any timestamps before downloading your final file."
  },
  {
    question: "Is my data secure?",
    answer: "Absolutely. Your audio files and lyrics are processed securely and are not stored permanently on our servers. All uploaded content is automatically deleted after processing."
  }
];

export const HelpSection = () => {
  return (
    <section className="py-20 px-4 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex items-center justify-center gap-2 mb-4">
            <HelpCircle className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground text-lg">
            Everything you need to know about AutoLyrixAlign
          </p>
        </div>

        <div className="animate-slide-up">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-card/50 backdrop-blur-sm border border-border rounded-xl px-6 hover:border-primary/30 transition-colors"
              >
                <AccordionTrigger className="text-left hover:no-underline py-6">
                  <span className="font-semibold">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};
