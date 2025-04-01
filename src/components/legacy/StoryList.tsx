import { useState, useEffect } from "react";
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { StoryCard } from "./StoryCard";
import { StoryDetailModal } from "./StoryDetailModal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Search, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

// Define the Story type based on the care_recipient_profiles table
// This type needs to be compatible with the data coming from Supabase
export interface Story {
  id: string;
  full_name: string;
  birth_year: string;
  personality_traits: string[] | null;
  career_fields: string[] | null;
  hobbies_interests: string[] | null;
  life_story: string | null;
  created_at: string | null;
  // Include other fields from care_recipient_profiles to satisfy TypeScript
  caregiver_personality: string[] | null;
  challenges: string[] | null;
  cultural_preferences: string | null;
  daily_routines: string | null;
  family_social_info: string | null;
  joyful_things: string | null;
  last_updated: string | null;
  notable_events: string | null;
  sensitivities: string | null;
  specific_requests: string | null;
  unique_facts: string | null;
  user_id: string;
}

// Sample dummy data to ensure we have at least 10 stories
const dummyStories: Story[] = [
  {
    id: "dummy-1",
    full_name: "Robert Kingston",
    birth_year: "1944",
    personality_traits: ["Analytical", "Meticulous", "Reserved"],
    career_fields: ["Engineer", "Educator"],
    hobbies_interests: ["Technology", "Cooking", "Sports"],
    life_story: "Robert spent his early years developing innovative solutions for manufacturing companies. After a successful career as an engineer, he transitioned to education, teaching the next generation of engineers at a local university. His methodical approach to problem-solving influenced hundreds of students who went on to successful careers.",
    created_at: "2023-04-15T10:30:00Z",
    caregiver_personality: null,
    challenges: null, 
    cultural_preferences: null,
    daily_routines: null,
    family_social_info: null,
    joyful_things: null,
    last_updated: null,
    notable_events: null,
    sensitivities: null,
    specific_requests: null,
    unique_facts: null,
    user_id: "dummy-user-1"
  },
  {
    id: "dummy-2",
    full_name: "Eleanor Williams",
    birth_year: "1938",
    personality_traits: ["Compassionate", "Patient", "Creative"],
    career_fields: ["Nurse", "Community Organizer"],
    hobbies_interests: ["Gardening", "Painting", "Reading"],
    life_story: "Eleanor dedicated her life to caring for others, first as a pediatric nurse and later organizing health initiatives in underserved communities. Her garden was her sanctuary, and she spent weekends painting landscapes inspired by her travels. Her book collection featured novels from authors around the world, reflecting her curiosity about different cultures and histories.",
    created_at: "2023-05-12T14:20:00Z",
    caregiver_personality: null,
    challenges: null, 
    cultural_preferences: null,
    daily_routines: null,
    family_social_info: null,
    joyful_things: null,
    last_updated: null,
    notable_events: null,
    sensitivities: null,
    specific_requests: null,
    unique_facts: null,
    user_id: "dummy-user-2"
  },
  {
    id: "dummy-3",
    full_name: "James Roberts",
    birth_year: "1950",
    personality_traits: ["Adventurous", "Optimistic", "Resourceful"],
    career_fields: ["Journalist", "Photographer"],
    hobbies_interests: ["Travel", "Hiking", "Jazz Music"],
    life_story: "James traveled to over 50 countries as a photojournalist, documenting both natural wonders and human stories. His photographs appeared in leading magazines, capturing moments of both joy and struggle. When not on assignment, he explored hiking trails and became known in his community for hosting jazz listening sessions where he shared stories behind the music and the artists who created it.",
    created_at: "2023-06-22T09:15:00Z",
    caregiver_personality: null,
    challenges: null, 
    cultural_preferences: null,
    daily_routines: null,
    family_social_info: null,
    joyful_things: null,
    last_updated: null,
    notable_events: null,
    sensitivities: null,
    specific_requests: null,
    unique_facts: null,
    user_id: "dummy-user-3"
  },
  {
    id: "dummy-4",
    full_name: "Margaret Chen",
    birth_year: "1955",
    personality_traits: ["Determined", "Generous", "Diplomatic"],
    career_fields: ["Entrepreneur", "Consultant"],
    hobbies_interests: ["Chess", "Cooking", "Economics"],
    life_story: "Margaret built a successful consulting business helping small businesses navigate international markets. After selling her company, she mentored young entrepreneurs and funded scholarships for business students. She was a formidable chess player who enjoyed teaching strategy through the game, and her dinner parties featuring fusion cuisine were legendary in her social circle.",
    created_at: "2023-07-18T16:45:00Z",
    caregiver_personality: null,
    challenges: null, 
    cultural_preferences: null,
    daily_routines: null,
    family_social_info: null,
    joyful_things: null,
    last_updated: null,
    notable_events: null,
    sensitivities: null,
    specific_requests: null,
    unique_facts: null,
    user_id: "dummy-user-4"
  },
  {
    id: "dummy-5",
    full_name: "David Thompson",
    birth_year: "1942",
    personality_traits: ["Witty", "Dedicated", "Thoughtful"],
    career_fields: ["Architect", "Urban Planner"],
    hobbies_interests: ["Classical Music", "Woodworking", "History"],
    life_story: "David's architectural designs transformed several urban spaces, balancing functionality with beauty. He was particularly proud of his work on affordable housing projects that created vibrant communities. His woodworking shop became his second office after retirement, where he crafted furniture combining traditional techniques with modern design. His knowledge of architectural history made him a sought-after speaker at community events.",
    created_at: "2023-08-05T11:30:00Z",
    caregiver_personality: null,
    challenges: null, 
    cultural_preferences: null,
    daily_routines: null,
    family_social_info: null,
    joyful_things: null,
    last_updated: null,
    notable_events: null,
    sensitivities: null,
    specific_requests: null,
    unique_facts: null,
    user_id: "dummy-user-5"
  },
  {
    id: "dummy-6",
    full_name: "Sarah Johnson",
    birth_year: "1935",
    personality_traits: ["Resilient", "Nurturing", "Pragmatic"],
    career_fields: ["Farmer", "Local Politician"],
    hobbies_interests: ["Birdwatching", "Quilting", "Community Service"],
    life_story: "Sarah managed her family farm through decades of changing agricultural practices, eventually transitioning to sustainable methods that became a model for the region. She served three terms on the county council, advocating for rural infrastructure. Her detailed journals of local bird migrations were donated to a conservation society, and the quilts she made for family members preserved stories and traditions for generations.",
    created_at: "2023-09-10T13:20:00Z",
    caregiver_personality: null,
    challenges: null, 
    cultural_preferences: null,
    daily_routines: null,
    family_social_info: null,
    joyful_things: null,
    last_updated: null,
    notable_events: null,
    sensitivities: null,
    specific_requests: null,
    unique_facts: null,
    user_id: "dummy-user-6"
  },
  {
    id: "dummy-7",
    full_name: "Michael Okafor",
    birth_year: "1960",
    personality_traits: ["Charismatic", "Innovative", "Persistent"],
    career_fields: ["Medical Researcher", "Professor"],
    hobbies_interests: ["Soccer", "Chess", "Documentary Films"],
    life_story: "Michael's research team made breakthrough discoveries in treating tropical diseases, work that started during his childhood in Nigeria and continued through his career at research institutions in Europe and America. He mentored dozens of young scientists, emphasizing the importance of relating laboratory work to real-world needs. His passion for soccer never diminished, and he organized faculty matches well into his sixties.",
    created_at: "2023-10-20T15:40:00Z",
    caregiver_personality: null,
    challenges: null, 
    cultural_preferences: null,
    daily_routines: null,
    family_social_info: null,
    joyful_things: null,
    last_updated: null,
    notable_events: null,
    sensitivities: null,
    specific_requests: null,
    unique_facts: null,
    user_id: "dummy-user-7"
  },
  {
    id: "dummy-8",
    full_name: "Linda Martinez",
    birth_year: "1948",
    personality_traits: ["Organized", "Adaptable", "Visionary"],
    career_fields: ["Librarian", "Digital Archivist"],
    hobbies_interests: ["Photography", "Genealogy", "Hiking"],
    life_story: "Linda transformed her local library into a community hub, introducing digital resources and programs that bridged generational gaps. She pioneered efforts to digitize local historical records, preserving them for future researchers. Her personal photography project documented changing landscapes in her region over decades, and her genealogical research connected families separated by migration and historical events.",
    created_at: "2023-11-15T10:10:00Z",
    caregiver_personality: null,
    challenges: null, 
    cultural_preferences: null,
    daily_routines: null,
    family_social_info: null,
    joyful_things: null,
    last_updated: null,
    notable_events: null,
    sensitivities: null,
    specific_requests: null,
    unique_facts: null,
    user_id: "dummy-user-8"
  },
  {
    id: "dummy-9",
    full_name: "Thomas Wright",
    birth_year: "1940",
    personality_traits: ["Methodical", "Curious", "Modest"],
    career_fields: ["Mechanical Engineer", "Inventor"],
    hobbies_interests: ["Astronomy", "Model Building", "Physics"],
    life_story: "Thomas held numerous patents for mechanical components that improved efficiency in manufacturing processes. His greatest pride came from designing water pumps that could be easily maintained in remote locations. After retirement, he built an observatory in his backyard and volunteered at science education programs, helping children build working models that demonstrated physical principles.",
    created_at: "2023-12-05T14:30:00Z",
    caregiver_personality: null,
    challenges: null, 
    cultural_preferences: null,
    daily_routines: null,
    family_social_info: null,
    joyful_things: null,
    last_updated: null,
    notable_events: null,
    sensitivities: null,
    specific_requests: null,
    unique_facts: null,
    user_id: "dummy-user-9"
  }
];

for (let i = 1; i < dummyStories.length; i++) {
  dummyStories[i] = {
    ...dummyStories[i],
    caregiver_personality: null,
    challenges: null, 
    cultural_preferences: null,
    daily_routines: null,
    family_social_info: null,
    joyful_things: null,
    last_updated: null,
    notable_events: null,
    sensitivities: null,
    specific_requests: null,
    unique_facts: null,
    user_id: `dummy-user-${i+1}`
  };
}

export const StoryList = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [filteredStories, setFilteredStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const storiesPerPage = 5; // Changed from 12 to 5 for single column layout
  
  // Selected story for detail modal
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  // Search state
  const [searchTerm, setSearchTerm] = useState("");
  
  // Fetch stories from Supabase
  const fetchStories = async () => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from("care_recipient_profiles")
        .select("*")
        .not("life_story", "is", null)
        .order("created_at", { ascending: false });
      
      if (error) {
        throw error;
      }
      
      // Cast the data to make TypeScript happy
      let allStories = data as unknown as Story[];
      
      // If we have fewer than 10 stories, add dummy data
      if (allStories.length < 10) {
        // Only add enough dummy stories to reach 10 total
        const dummyToAdd = dummyStories.slice(0, Math.max(0, 10 - allStories.length));
        allStories = [...allStories, ...dummyToAdd];
      }
      
      setStories(allStories);
      applySearch(allStories, searchTerm);
      
    } catch (err: any) {
      console.error("Error fetching stories:", err);
      setError(err.message);
      toast({
        title: "Error fetching stories",
        description: "There was an error loading the legacy stories. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Apply search to stories
  const applySearch = (allStories: Story[], term: string) => {
    if (!term.trim()) {
      setFilteredStories(allStories);
      setTotalPages(Math.max(1, Math.ceil(allStories.length / storiesPerPage)));
      return;
    }
    
    const searchLower = term.toLowerCase();
    const result = allStories.filter(story => 
      (story.life_story && story.life_story.toLowerCase().includes(searchLower)) ||
      (story.full_name && story.full_name.toLowerCase().includes(searchLower)) ||
      (story.career_fields && Array.isArray(story.career_fields) && story.career_fields.some(c => c.toLowerCase().includes(searchLower))) ||
      (story.hobbies_interests && Array.isArray(story.hobbies_interests) && story.hobbies_interests.some(h => h.toLowerCase().includes(searchLower)))
    );
    
    setFilteredStories(result);
    setTotalPages(Math.max(1, Math.ceil(result.length / storiesPerPage)));
    setCurrentPage(1);
  };
  
  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    applySearch(stories, value);
  };
  
  // Handle story selection for detail modal
  const openStoryDetail = (story: Story) => {
    setSelectedStory(story);
    setModalOpen(true);
  };
  
  // Calculate current page stories
  const getCurrentPageStories = () => {
    const startIndex = (currentPage - 1) * storiesPerPage;
    const endIndex = startIndex + storiesPerPage;
    return filteredStories.slice(startIndex, endIndex);
  };
  
  // Pagination controls
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Load stories on component mount and when search term changes
  useEffect(() => {
    fetchStories();
  }, []);
  
  return (
    <div className="space-y-6">
      {/* Search bar */}
      <div className="relative w-full md:w-1/2">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          type="search"
          placeholder="Search stories..."
          className="pl-9"
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
      </div>
      
      {/* Results count */}
      <div className="text-sm text-gray-500">
        {loading ? (
          "Loading stories..."
        ) : (
          `Showing ${filteredStories.length} ${filteredStories.length === 1 ? 'story' : 'stories'}`
        )}
      </div>
      
      {/* Loading state */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="mt-2 text-gray-600">Loading stories...</p>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-500">{error}</p>
          <Button 
            onClick={fetchStories} 
            className="mt-4"
          >
            Try Again
          </Button>
        </div>
      ) : filteredStories.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No stories found matching your search.</p>
          {searchTerm && (
            <Button 
              onClick={() => handleSearchChange("")} 
              className="mt-4"
            >
              Clear Search
            </Button>
          )}
        </div>
      ) : (
        <>
          {/* Story grid - changed to a single column layout */}
          <div className="space-y-8">
            {getCurrentPageStories().map((story) => (
              <StoryCard
                key={story.id}
                story={story}
                onReadMore={() => openStoryDetail(story)}
              />
            ))}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination className="mt-8">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => handlePageChange(currentPage - 1)}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    aria-disabled={currentPage === 1}
                  />
                </PaginationItem>
                
                {/* Generate page numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Show first page, last page, current page, and pages adjacent to current
                  let pageToShow: number | null = null;
                  
                  if (totalPages <= 5) {
                    // If 5 or fewer pages, show all pages
                    pageToShow = i + 1;
                  } else if (currentPage <= 3) {
                    // Near start: show pages 1-4 and last page
                    if (i < 4) {
                      pageToShow = i + 1;
                    } else {
                      pageToShow = totalPages;
                    }
                  } else if (currentPage >= totalPages - 2) {
                    // Near end: show first page and last 4 pages
                    if (i === 0) {
                      pageToShow = 1;
                    } else {
                      pageToShow = totalPages - (4 - i);
                    }
                  } else {
                    // Middle: show first, current-1, current, current+1, last
                    if (i === 0) {
                      pageToShow = 1;
                    } else if (i === 4) {
                      pageToShow = totalPages;
                    } else {
                      pageToShow = currentPage + (i - 2);
                    }
                  }
                  
                  // Add ellipsis indicators
                  if ((pageToShow === 1 && currentPage > 3) || 
                      (pageToShow === totalPages && currentPage < totalPages - 2)) {
                    return (
                      <PaginationItem key={`ellipsis-${i}`}>
                        <span className="px-4 py-2">...</span>
                      </PaginationItem>
                    );
                  }
                  
                  return (
                    <PaginationItem key={pageToShow}>
                      <PaginationLink
                        onClick={() => handlePageChange(pageToShow as number)}
                        isActive={currentPage === pageToShow}
                      >
                        {pageToShow}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => handlePageChange(currentPage + 1)}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    aria-disabled={currentPage === totalPages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
      
      {/* Story detail modal */}
      {selectedStory && (
        <StoryDetailModal
          story={selectedStory}
          open={modalOpen}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
};

