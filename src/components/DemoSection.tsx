import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Music2 } from "lucide-react";
import { toast } from "sonner";

const sampleSongs = [
  {
    title: "Sample Song 1",
    artist: "Demo Artist",
    duration: "3:45",
    description: "Pop song with clear vocals"
  },
  {
    title: "Sample Song 2",
    artist: "Demo Artist",
    duration: "4:12",
    description: "Rock ballad with guitar"
  },
  {
    title: "Sample Song 3",
    artist: "Demo Artist",
    duration: "2:58",
    description: "Acoustic indie track"
  }
];

export const DemoSection = () => {
  const handleTryDemo = (title: string) => {
    toast.success(`Loading "${title}" demo...`, {
      description: "Demo functionality will be available soon!"
    });
  };

  return (
    <section id="demo-section" className="py-20 px-4 bg-muted/20">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Try a Demo
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Explore our pre-loaded samples to see AutoLyrixAlign in action
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sampleSongs.map((song, index) => (
            <Card 
              key={song.title}
              className="bg-card/50 backdrop-blur-sm border-border hover:border-primary/50 transition-all duration-300 hover:shadow-glow group animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader>
                <div className="w-full aspect-square rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300">
                  <Music2 className="w-16 h-16 text-primary" />
                </div>
                <CardTitle className="text-lg">{song.title}</CardTitle>
                <CardDescription>{song.artist} • {song.duration}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {song.description}
                </p>
                <Button
                  variant="secondary"
                  className="w-full gap-2"
                  onClick={() => handleTryDemo(song.title)}
                >
                  <Play className="w-4 h-4" />
                  Try Demo
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
