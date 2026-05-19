// Shared FAQ data — single source of truth for the /support/faq page,
// the homepage FAQ section, and the About page FAQ section. Also used to
// generate FAQPage JSON-LD schema for SEO rich results.

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export const faqs: FAQ[] = [
  {
    id: "faq-model-1",
    question: "Is Tavara a care agency?",
    answer: "No. Tavara is a Care Coordination & Management Platform. Families engage caregivers directly. Tavara coordinates matching, scheduling, training oversight, payroll calculation, and quality oversight — but is not an employment agency, placement agency, or employer of caregivers.",
    category: "About Tavara's Model"
  },
  {
    id: "faq-model-2",
    question: "Who employs the caregiver?",
    answer: "The family is the employer of record for NIS (National Insurance) purposes. Tavara handles NIS calculations, government form generation (NI 184, NI 187), and payroll coordination as a service — but the employment relationship is between the family and the caregiver.",
    category: "About Tavara's Model"
  },
  {
    id: "faq-model-3",
    question: "What does Tavara's coordination fee cover?",
    answer: "Caregiver matching, schedule coordination, payroll calculation, training oversight, dispute resolution, NIS form generation, daily care log oversight, and platform infrastructure. It does not cover caregiver compensation — that flows directly as a transparent pass-through from the family to the caregiver.",
    category: "About Tavara's Model"
  },
  {
    id: "faq-1",
    question: "What is Tavara.care?",
    answer: "Tavara.care is a Care Coordination & Management Platform designed to help families, care professionals, and communities connect for better caregiving solutions. We provide tools for care matching, task management, messaging, and professional networking, ensuring quality care experiences. Tavara is not an employment or placement agency — families engage caregivers directly.",
    category: "General"
  },
  {
    id: "faq-2",
    question: "Who can use Tavara.care?",
    answer: "Tavara.care is designed for three primary user groups:\n\n- Families seeking caregivers for their loved ones\n- Care Professionals looking for job opportunities and tools to manage their schedules\n- Community Organizations sharing resources and events related to caregiving",
    category: "General"
  },
  {
    id: "faq-3",
    question: "How do I create a family care account?",
    answer: "To create a family care account:\n\n1. Click on the 'Sign In' button in the top navigation bar.\n2. Select the 'Sign Up' tab.\n3. Choose 'Family' as your role and complete the registration process.\n4. After email verification, you can set up your family profile and start searching for care professionals.",
    category: "Account Management"
  },
  {
    id: "faq-4",
    question: "What information do care professionals need to provide when signing up?",
    answer: "Care professionals must submit:\n\n- Contact information\n- Professional credentials (certifications, licenses, etc.)\n- Areas of expertise\n- Service areas and availability\n- References and background verification (required for profile visibility to families)",
    category: "Account Management"
  },
  {
    id: "faq-5",
    question: "How do I find a qualified care professional?",
    answer: "Families can search for caregivers by:\n\n1. Navigating to 'Find Care' from the Family Dashboard.\n2. Using filters for care type, location, and availability.\n3. Viewing caregiver profiles, ratings, and reviews before making a selection.\n\nPremium Feature: Priority Matching allows families to get automatically connected with top-rated caregivers.",
    category: "Care Matching & Services"
  },
  {
    id: "faq-6",
    question: "Can I invite other family members to help manage care?",
    answer: "Yes! You can invite family members to collaborate on care management by:\n\n1. Going to 'Team Management' in your dashboard.\n2. Selecting 'Invite Family Member'.\n3. Entering their email address to send an invitation.\n\nThis feature is free for all users.",
    category: "Care Management"
  },
  {
    id: "faq-7",
    question: "How does the message board work?",
    answer: "The message board allows users to:\n\n- Post and respond to caregiver listings.\n- Receive direct messages from interested professionals.\n- Engage with the caregiver community.\n\nPremium Feature: Unlimited Messaging allows families to send and receive unlimited messages.",
    category: "Messaging & Communication"
  },
  {
    id: "faq-8",
    question: "What should I do if I need immediate support?",
    answer: "For immediate assistance:\n\n1. Click the 'Help' button (question mark icon) at the bottom right of any page.\n2. Choose from:\n   - WhatsApp Support (fastest response time)\n   - Submit a Support Ticket\n   - Browse FAQs",
    category: "Support"
  },
  {
    id: "faq-9",
    question: "What features are free on Tavara.care?",
    answer: "Free Features Include:\n\n- Basic caregiver search and profile browsing\n- Posting a limited number of care requests\n- Accessing community resources and events\n- Participating in forums and discussions\n- Sending a limited number of messages\n- Viewing task management (without advanced tools)",
    category: "Subscription & Pricing"
  },
  {
    id: "faq-10",
    question: "What features require a paid subscription?",
    answer: "Premium Features Include:\n\n- Professional Matching - Get priority recommendations for top caregivers\n- Unlimited Messaging - Send and receive unlimited messages\n- Task Management Tools - Advanced features for scheduling and tracking care tasks\n- Priority Support - Get faster responses from the Tavara.care team\n- Enhanced Profile Visibility - For care professionals looking to get more job opportunities\n\nThe right coordination tier for your household is walked through during onboarding rather than printed on a public page.",
    category: "Subscription & Pricing"
  },
  {
    id: "faq-11",
    question: "What are the subscription plans and pricing?",
    answer: "Family Plans:\n\n- Family Basic (Free) — Complete profile & care preferences, initial care needs assessment, Legacy Story for your loved one, instant caregiver matching, medication management & scheduling, meal planning & grocery lists, unlimited caregiver chat, email & community support.\n- Active Care Management — All Basic features plus a dedicated care coordinator, structured weekly care coordination, caregiver oversight, billing support, and managed care.\n- Premium Care Management — All Active Care features plus concierge-level coordination, 24/7 on-call support, priority matching, and complex household care management.\n\nProfessional Plans:\n\n- Professional Basic (Free) — Limited access to essential features.\n- Professional Pro — Enhanced profile visibility and unlimited job applications.\n- Professional Expert — Complete feature access, priority matching, and advanced analytics.\n\nExact subscription pricing is shared privately during onboarding so we can match the right tier to your household. Public care rates are $40/hr Standard, $45/hr Full Service, and $50+/hr Premium; Live-in care starts from $2,400 / week and is quoted by complexity.",
    category: "Subscription & Pricing"
  },
  {
    id: "faq-12",
    question: "How do I upgrade my subscription?",
    answer: "To upgrade:\n\n1. Go to 'Subscription & Pricing' in your account settings.\n2. Select the plan that best fits your needs.\n3. Enter payment details and confirm your upgrade.",
    category: "Subscription & Pricing"
  },
  {
    id: "faq-13",
    question: "How can I update my availability as a care professional?",
    answer: "To update your availability:\n\n1. Log into your Professional Dashboard.\n2. Navigate to 'Schedule Management'.\n3. Modify recurring availability or block off specific dates and times.\n\nChanges will be reflected to families in real-time.",
    category: "Professional Users & Job Management"
  },
  {
    id: "faq-14",
    question: "How does task management work for professionals?",
    answer: "The Task Management feature allows care professionals to:\n\n- Organize care responsibilities\n- Set reminders for appointments\n- Track completed and upcoming tasks\n\nPremium Feature: Advanced task tracking with automated scheduling is available in 'Professional Expert' plans.",
    category: "Professional Users & Job Management"
  },
  {
    id: "faq-15",
    question: "How do professionals receive payments?",
    answer: "Care professionals are paid directly by families. Tavara.care does not process caregiver payments but provides an invoicing tool to help manage payments and earnings.",
    category: "Professional Users & Job Management"
  },
  {
    id: "faq-16",
    question: "Can community organizations post resources and events?",
    answer: "Yes! Community organizations can:\n\n- Create a Community Account (verification required)\n- Post events, resources, and services\n- Engage with families and professionals\n\nThis feature is free for verified community organizations.",
    category: "Community & Support"
  },
  {
    id: "faq-17",
    question: "How do I report an issue with the platform?",
    answer: "To report an issue:\n\n1. Click the 'Help' button in the bottom right corner.\n2. Select 'Contact Support'.\n3. Provide details and screenshots (if applicable).\n\nOur support team will review and respond as soon as possible.",
    category: "Support"
  },
  {
    id: "faq-18",
    question: "Is my personal and health information secure?",
    answer: "Yes, Tavara.care prioritizes data security. We:\n\n- Encrypt all personal and health information\n- Comply with relevant data protection regulations\n- Implement strict access controls\n- Allow users to control who sees their data",
    category: "Privacy & Security"
  },
  {
    id: "faq-19",
    question: "Still have questions?",
    answer: "If you couldn't find what you're looking for, feel free to:\n\n- Visit our Help Center\n- Reach out via WhatsApp Support\n- Submit a Support Ticket",
    category: "Support"
  },
  {
    id: "faq-20",
    question: "What are the caregiver hourly rates?",
    answer: "Tavara Care uses a standardized three-tier pricing structure for caregiver rates:\n\n- Standard Care — $40/hr. For families using Tavara's care coordination platform with their own scheduling and management.\n- Full Service Care — $45/hr. For families on an Active or Premium Care Management plan, where Tavara handles scheduling, coordination, and oversight.\n- Premium/Specialized Care — $50+/hr. For specialized care needs such as dementia care, post-surgical recovery, or palliative support.\n\nRates are set transparently and apply consistently across all families. Legacy families who joined before rate updates may retain their original rates as a loyalty benefit.",
    category: "Care Matching & Services"
  },
  {
    id: "faq-21",
    question: "How does care plan pricing work?",
    answer: "Tavara offers two managed care coordination tiers:\n\n- Active Care Management — A dedicated care coordinator, structured weekly care coordination, caregiver oversight, billing support, and managed care.\n- Premium Care Management — All Active Care features plus concierge-level coordination, 24/7 on-call support, priority matching, and complex household care management.\n\nCaregiver Matching & Placement and Care Assessment & Setup are one-time services quoted at onboarding. Subscription tier pricing is shared privately during onboarding so we can match the right tier to your household.\n\nPublic care rates are $40/hr Standard, $45/hr Full Service, and $50+/hr Premium. Live-in care starts from $2,400 / week and is quoted by complexity.",
    category: "Care Management"
  },
  {
    id: "faq-22",
    question: "Are there discounts for early adopters or legacy families?",
    answer: "Yes. Tavara honors legacy pricing for families who joined during our early growth phase. This means:\n\n- Your original care coordination rate is preserved\n- Your caregiver rate remains at the rate agreed upon at the time of match\n- One-time services such as Caregiver Matching & Placement or Care Assessment & Setup may have been waived\n\nAll legacy pricing is reflected in your private billing summary with 'Discounted' or 'Waived' labels for full transparency. If you were with us early, you keep your rate.",
    category: "Subscription & Pricing"
  }
];

/**
 * Build a Schema.org FAQPage JSON-LD object from a subset of FAQ ids.
 * Pass `undefined` to include all FAQs. Pass an array of ids to scope it.
 *
 * Important: Google requires Q&A content from this schema to be visibly
 * rendered on the same page — only use this alongside a visible FAQ section.
 */
export function buildFaqPageSchema(ids?: string[]) {
  const list = ids ? faqs.filter(f => ids.includes(f.id)) : faqs;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: list.map(f => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer,
      },
    })),
  };
}
