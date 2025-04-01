
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.8.0'

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Create a Supabase client with the service key
const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Sample job locations in Trinidad and Tobago
const ttLocations = [
  "Port of Spain", "San Fernando", "Arima", "Chaguanas", 
  "Point Fortin", "Couva", "Sangre Grande", "Princes Town",
  "Diego Martin", "Tunapuna", "San Juan", "Scarborough, Tobago"
]

// Sample job titles
const jobTitles = [
  "Elderly Care Assistant", "Child Care Provider", "Special Needs Caregiver",
  "Home Health Aide", "Registered Nurse", "Personal Care Assistant",
  "Dementia Care Specialist", "Respite Care Provider", "Nursing Assistant",
  "Disability Support Worker", "Caregiver for Post-Surgery Recovery"
]

// Sample employment types
const employmentTypes = ["Full-time", "Part-time", "Contract", "Temporary"]

// Sample urgency types
const urgencyTypes = ["Immediate", "This Weekend", "Short Notice", "Regular"]

// Sample care tags
const careTags = [
  "Elderly Care", "Child Care", "Special Needs", "Dementia Care", 
  "Post-Surgery Care", "Medication Management", "Physical Therapy",
  "Mobility Assistance", "Meal Preparation", "Transportation",
  "Companion Care", "Overnight Care", "Medical Experience"
]

// Sample salary ranges
const salaryRanges = [
  "$15-18/hr", "$18-22/hr", "$20-25/hr", "$25-30/hr", 
  "$30-35/hr", "$3,500-4,000/mo", "$4,000-4,500/mo"
]

// Sample sources
const sources = [
  { name: "CaribbeanJobs", url: "https://www.caribbeanjobs.com" },
  { name: "LinkedIn", url: "https://www.linkedin.com" },
  { name: "Indeed", url: "https://www.indeed.com" },
  { name: "TTARP", url: "https://ttarp.org" },
  { name: "Ministry of Social Development", url: "https://www.social.gov.tt" }
]

// Sample author names
const authors = [
  { name: "Sarah Johnson", initial: "SJ" },
  { name: "Michael Rivera", initial: "MR" },
  { name: "Sophia Chen", initial: "SC" },
  { name: "James Wilson", initial: "JW" },
  { name: "Emily Rodriguez", initial: "ER" },
  { name: "David Thompson", initial: "DT" },
  { name: "Olivia Martinez", initial: "OM" },
  { name: "Daniel Brown", initial: "DB" },
  { name: "Aisha Khan", initial: "AK" },
  { name: "Rachel Lee", initial: "RL" },
  { name: "Marcus Powell", initial: "MP" },
  { name: "Priya Sharma", initial: "PS" }
]

// Generate random job listings for Trinidad and Tobago
function generateJobListings(count = 10) {
  const jobs = []
  
  for (let i = 0; i < count; i++) {
    // Generate random values from sample data
    const title = jobTitles[Math.floor(Math.random() * jobTitles.length)]
    const location = ttLocations[Math.floor(Math.random() * ttLocations.length)] + ", Trinidad and Tobago"
    const type = employmentTypes[Math.floor(Math.random() * employmentTypes.length)]
    const salary = salaryRanges[Math.floor(Math.random() * salaryRanges.length)]
    const urgency = urgencyTypes[Math.floor(Math.random() * urgencyTypes.length)]
    const matchPercentage = Math.floor(Math.random() * 30) + 70 // 70-99%
    
    // Generate 2-3 random tags
    const tagCount = Math.floor(Math.random() * 2) + 2
    const shuffledTags = [...careTags].sort(() => 0.5 - Math.random())
    const tags = shuffledTags.slice(0, tagCount)
    
    // Select a random source
    const source = sources[Math.floor(Math.random() * sources.length)]
    
    // Generate a random job description
    const details = `Looking for a ${title.toLowerCase()} in ${location}. Experience with ${tags.join(", ")} preferred. ${type} position with competitive pay.`
    
    // Create the job object
    jobs.push({
      title,
      location,
      type,
      salary,
      urgency,
      match_percentage: matchPercentage,
      tags,
      source_url: source.url,
      source_name: source.name,
      details,
      posted_at: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)) // Up to 7 days ago
    })
  }
  
  return jobs
}

// Generate random message board posts for Trinidad and Tobago
function generateMessageBoardPosts(count = 10) {
  const posts = []
  
  // Ensure equal distribution of family and professional posts
  const familyCount = Math.ceil(count / 2)
  const professionalCount = count - familyCount
  
  // Generate family posts (care needs)
  for (let i = 0; i < familyCount; i++) {
    const author = authors[Math.floor(Math.random() * authors.length)]
    const location = ttLocations[Math.floor(Math.random() * ttLocations.length)] + ", Trinidad and Tobago"
    const urgency = urgencyTypes[Math.floor(Math.random() * urgencyTypes.length)]
    
    // Generate 2-3 random care needs
    const needCount = Math.floor(Math.random() * 2) + 2
    const shuffledTags = [...careTags].sort(() => 0.5 - Math.random())
    const care_needs = shuffledTags.slice(0, needCount)
    
    // Generate a random title and details
    const title = `Need ${urgency.toLowerCase() === 'regular' ? 'regular' : urgency.toLowerCase()} care in ${location.split(',')[0]}`
    const details = `Looking for assistance with ${care_needs.join(", ")}. Please contact for more details about schedule and requirements.`
    
    posts.push({
      type: 'family',
      author: author.name,
      author_initial: author.initial,
      title,
      urgency,
      location,
      details,
      care_needs,
      specialties: [],
      time_posted: new Date(Date.now() - Math.floor(Math.random() * 3 * 24 * 60 * 60 * 1000)) // Up to 3 days ago
    })
  }
  
  // Generate professional posts (availabilities)
  for (let i = 0; i < professionalCount; i++) {
    const author = authors[Math.floor(Math.random() * authors.length)]
    const location = ttLocations[Math.floor(Math.random() * ttLocations.length)] + ", Trinidad and Tobago"
    const urgency = urgencyTypes[Math.floor(Math.random() * urgencyTypes.length)]
    
    // Generate 2-3 random specialties
    const specialtyCount = Math.floor(Math.random() * 2) + 2
    const shuffledTags = [...careTags].sort(() => 0.5 - Math.random())
    const specialties = shuffledTags.slice(0, specialtyCount)
    
    // Generate a random title and details
    const availability = urgency.toLowerCase() === 'regular' ? 'regularly' : urgency.toLowerCase()
    const title = `Available ${availability} in ${location.split(',')[0]}`
    const details = `Experienced caregiver with expertise in ${specialties.join(", ")}. Available for ${urgency.toLowerCase()} assignments.`
    
    posts.push({
      type: 'professional',
      author: author.name,
      author_initial: author.initial,
      title,
      urgency,
      location,
      details,
      care_needs: [],
      specialties,
      time_posted: new Date(Date.now() - Math.floor(Math.random() * 3 * 24 * 60 * 60 * 1000)) // Up to 3 days ago
    })
  }
  
  return posts
}

// Clear existing data and insert new data
async function refreshData() {
  console.log("Starting data refresh...")
  
  try {
    // Generate new data
    const jobs = generateJobListings(15)  // Generate 15 job listings
    const posts = generateMessageBoardPosts(15)  // Generate 15 message board posts
    
    // Clear existing data
    await supabase.from('job_opportunities').delete().not('id', 'eq', '00000000-0000-0000-0000-000000000000')
    await supabase.from('message_board_posts').delete().not('id', 'eq', '00000000-0000-0000-0000-000000000000')
    
    console.log("Deleted existing data")
    
    // Insert new job listings
    const { error: jobsError } = await supabase.from('job_opportunities').insert(jobs)
    if (jobsError) {
      console.error("Error inserting job listings:", jobsError)
      throw jobsError
    }
    
    console.log("Inserted", jobs.length, "job listings")
    
    // Insert new message board posts
    const { error: postsError } = await supabase.from('message_board_posts').insert(posts)
    if (postsError) {
      console.error("Error inserting message board posts:", postsError)
      throw postsError
    }
    
    console.log("Inserted", posts.length, "message board posts")
    
    return { success: true, jobsCount: jobs.length, postsCount: posts.length }
  } catch (error) {
    console.error("Error refreshing data:", error)
    return { success: false, error: error.message }
  }
}

// Handle requests
Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    })
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  try {
    const result = await refreshData()
    
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
