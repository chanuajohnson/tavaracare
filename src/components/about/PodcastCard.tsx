
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Headphones, PlayCircle, PauseCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const PodcastCard = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeEpisode, setActiveEpisode] = useState<number | null>(null);
  const { toast } = useToast();

  const episodes = [
    {
      id: 1,
      title: "The Caregiving Journey: Stories of Challenge and Triumph",
      date: "June 15, 2024",
      duration: "32:47",
      description: "In our debut episode, we explore personal stories from caregivers who have transformed challenges into opportunities for growth and connection."
    }
  ];

  const showPodcastMessage = () => {
    toast({
      title: "Podcast Request Received!",
      description: "We have your request logged and you will receive an email when this feature is live and launched.",
      duration: 5000, // 5 seconds auto-dismiss
      variant: "success", // Using success variant for positive feedback
    });
  };

  const togglePlay = (episodeId: number) => {
    showPodcastMessage();
    
    if (activeEpisode === episodeId && isPlaying) {
      setIsPlaying(false);
    } else {
      setActiveEpisode(episodeId);
      setIsPlaying(true);
    }
  };

  return (
    <Card className="overflow-hidden border-primary-100 hover:shadow-lg transition-shadow">
      <CardHeader className="bg-gradient-to-r from-primary-50 to-purple-50">
        <CardTitle className="flex items-center gap-2 text-primary-700 text-xl">
          <Headphones className="h-6 w-6" /> Tavara Talks Podcast
        </CardTitle>
        <CardDescription>
          Conversations about caregiving, community, and connection
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <p className="text-gray-600 mb-6">
          Join us for insightful conversations with caregivers, care recipients, industry experts, and 
          community builders. Each episode explores different aspects of the caregiving journey, 
          sharing wisdom, practical advice, and inspiring stories.
        </p>

        <div className="space-y-6">
          <h3 className="font-medium text-primary-700">Latest Episodes</h3>
          
          {episodes.map((episode) => (
            <div 
              key={episode.id} 
              className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-start gap-4">
                <button 
                  onClick={() => togglePlay(episode.id)}
                  className="mt-1 text-primary-600 hover:text-primary-700 transition-colors"
                  aria-label={isPlaying && activeEpisode === episode.id ? "Pause episode" : "Play episode"}
                >
                  {isPlaying && activeEpisode === episode.id ? (
                    <PauseCircle className="h-10 w-10" />
                  ) : (
                    <PlayCircle className="h-10 w-10" />
                  )}
                </button>
                
                <div>
                  <h4 className="font-medium text-primary-800">{episode.title}</h4>
                  <div className="flex text-sm text-gray-500 mt-1 mb-2">
                    <span>{episode.date}</span>
                    <span className="mx-2">•</span>
                    <span>{episode.duration}</span>
                  </div>
                  <p className="text-gray-600 text-sm">{episode.description}</p>
                </div>
              </div>
              
              {isPlaying && activeEpisode === episode.id && (
                <div className="mt-4 w-full bg-gray-200 rounded-full h-1.5">
                  <div className="bg-primary-600 h-1.5 rounded-full w-1/3"></div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-8 text-center">
          <button 
            onClick={showPodcastMessage}
            className="text-primary-600 hover:text-primary-700 transition-colors font-medium"
          >
            Subscribe to Tavara Talks on your favorite platform
          </button>
        </div>
      </CardContent>
    </Card>
  );
};
