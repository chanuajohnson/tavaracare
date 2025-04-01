
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

interface ContentBlock {
  id: string;
  content_type: 'text' | 'image' | 'video' | 'pdf' | 'audio';
  content: string;
  order_index: number;
}

interface LessonContentProps {
  lessonId: string;
}

export const LessonContent = ({ lessonId }: LessonContentProps) => {
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log("Fetching lesson content for lesson ID:", lessonId);
        
        const { data, error } = await supabase
          .from('lesson_content_blocks')
          .select('*')
          .eq('lesson_id', lessonId)
          .order('order_index');

        if (error) {
          console.error('Error fetching lesson content:', error);
          setError('Failed to load lesson content');
          return;
        }

        console.log(`Retrieved ${data?.length || 0} content blocks`);
        setContentBlocks(data || []);
      } catch (err) {
        console.error('Error in content fetching:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [lessonId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 text-primary-600 animate-spin" />
        <span className="ml-2 text-primary-600">Loading content...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
        <h3 className="font-medium mb-2">Error loading content</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (contentBlocks.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-md">
        <p>No content available for this lesson yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {contentBlocks.map((block) => (
        <div key={block.id} className="prose max-w-none">
          {block.content_type === 'text' && (
            <div className="text-gray-700" dangerouslySetInnerHTML={{ __html: block.content }} />
          )}
          
          {block.content_type === 'image' && (
            <div className="my-4">
              <img
                src={block.content}
                alt="Lesson content"
                className="rounded-lg shadow-sm max-w-full h-auto"
              />
            </div>
          )}
          
          {block.content_type === 'video' && (
            <div className="my-4 aspect-video">
              <iframe
                src={block.content}
                title="Video content"
                className="w-full h-full rounded-lg shadow-sm"
                allowFullScreen
              />
            </div>
          )}
          
          {block.content_type === 'pdf' && (
            <div className="my-4">
              <a 
                href={block.content}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Download PDF Resource
              </a>
            </div>
          )}
          
          {block.content_type === 'audio' && (
            <div className="my-4">
              <audio
                src={block.content}
                controls
                className="w-full"
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
