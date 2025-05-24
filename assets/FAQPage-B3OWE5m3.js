import{r as c,j as e,I as g,F as l,Q as f,B as t,V as h,M as y}from"./index-CL68a71s.js";import{A as v,a as b,b as x,c as w}from"./accordion-D4Aac4zr.js";import{S as q}from"./search-hFi0v8Fx.js";import"./index-DkddS5fw.js";const d=[{id:"faq-1",question:"What is Tavara.care?",answer:"Tavara.care is a care coordination platform designed to help families, care professionals, and communities connect for better caregiving solutions. We provide tools for care matching, task management, messaging, and professional networking, ensuring quality care experiences.",category:"General"},{id:"faq-2",question:"Who can use Tavara.care?",answer:`Tavara.care is designed for three primary user groups:

- Families seeking caregivers for their loved ones
- Care Professionals looking for job opportunities and tools to manage their schedules
- Community Organizations sharing resources and events related to caregiving`,category:"General"},{id:"faq-3",question:"How do I create a family care account?",answer:`To create a family care account:

1. Click on the 'Sign In' button in the top navigation bar.
2. Select the 'Sign Up' tab.
3. Choose 'Family' as your role and complete the registration process.
4. After email verification, you can set up your family profile and start searching for care professionals.`,category:"Account Management"},{id:"faq-4",question:"What information do care professionals need to provide when signing up?",answer:`Care professionals must submit:

- Contact information
- Professional credentials (certifications, licenses, etc.)
- Areas of expertise
- Service areas and availability
- References and background verification (required for profile visibility to families)`,category:"Account Management"},{id:"faq-5",question:"How do I find a qualified care professional?",answer:`Families can search for caregivers by:

1. Navigating to 'Find Care' from the Family Dashboard.
2. Using filters for care type, location, and availability.
3. Viewing caregiver profiles, ratings, and reviews before making a selection.

Premium Feature: Priority Matching allows families to get automatically connected with top-rated caregivers.`,category:"Care Matching & Services"},{id:"faq-6",question:"Can I invite other family members to help manage care?",answer:`Yes! You can invite family members to collaborate on care management by:

1. Going to 'Team Management' in your dashboard.
2. Selecting 'Invite Family Member'.
3. Entering their email address to send an invitation.

This feature is free for all users.`,category:"Care Management"},{id:"faq-7",question:"How does the message board work?",answer:`The message board allows users to:

- Post and respond to caregiver listings.
- Receive direct messages from interested professionals.
- Engage with the caregiver community.

Premium Feature: Unlimited Messaging allows families to send and receive unlimited messages.`,category:"Messaging & Communication"},{id:"faq-8",question:"What should I do if I need immediate support?",answer:`For immediate assistance:

1. Click the 'Help' button (question mark icon) at the bottom right of any page.
2. Choose from:
   - WhatsApp Support (fastest response time)
   - Submit a Support Ticket
   - Browse FAQs`,category:"Support"},{id:"faq-9",question:"What features are free on Tavara.care?",answer:`Free Features Include:

✔ Basic caregiver search and profile browsing
✔ Posting a limited number of care requests
✔ Accessing community resources and events
✔ Participating in forums and discussions
✔ Sending a limited number of messages
✔ Viewing task management (without advanced tools)`,category:"Subscription & Pricing"},{id:"faq-10",question:"What features require a paid subscription?",answer:`Premium Features Include:

🚀 Professional Matching - Get priority recommendations for top caregivers
🚀 Unlimited Messaging - Send and receive unlimited messages
🚀 Task Management Tools - Advanced features for scheduling and tracking care tasks
🚀 Priority Support - Get faster responses from the Tavara.care team
🚀 Enhanced Profile Visibility - For care professionals looking to get more job opportunities`,category:"Subscription & Pricing"},{id:"faq-11",question:"What are the subscription plans and pricing?",answer:`Plan Name | Features Included | Price

---|---|---
Family Basic | Limited access to caregiver search and messaging | Free
Family Care | Unlimited profile views, direct messaging, and posting care needs | $14.99/month
Family Premium | All 'Family Care' features + personalized matching and priority support | $29.99/month
Professional Pro | Enhanced profile visibility and unlimited job applications | $19.99/month
Professional Expert | Complete feature access, priority matching, and advanced analytics | $34.99/month`,category:"Subscription & Pricing"},{id:"faq-12",question:"How do I upgrade my subscription?",answer:`To upgrade:

1. Go to 'Subscription & Pricing' in your account settings.
2. Select the plan that best fits your needs.
3. Enter payment details and confirm your upgrade.`,category:"Subscription & Pricing"},{id:"faq-13",question:"How can I update my availability as a care professional?",answer:`To update your availability:

1. Log into your Professional Dashboard.
2. Navigate to 'Schedule Management'.
3. Modify recurring availability or block off specific dates and times.

Changes will be reflected to families in real-time.`,category:"Professional Users & Job Management"},{id:"faq-14",question:"How does task management work for professionals?",answer:`The Task Management feature allows care professionals to:

✔ Organize care responsibilities
✔ Set reminders for appointments
✔ Track completed and upcoming tasks

Premium Feature: Advanced task tracking with automated scheduling is available in 'Professional Expert' plans.`,category:"Professional Users & Job Management"},{id:"faq-15",question:"How do professionals receive payments?",answer:"Care professionals are paid directly by families. Tavara.care does not process caregiver payments but provides an invoicing tool to help manage payments and earnings.",category:"Professional Users & Job Management"},{id:"faq-16",question:"Can community organizations post resources and events?",answer:`Yes! Community organizations can:

✔ Create a Community Account (verification required)
✔ Post events, resources, and services
✔ Engage with families and professionals

This feature is free for verified community organizations.`,category:"Community & Support"},{id:"faq-17",question:"How do I report an issue with the platform?",answer:`To report an issue:

1. Click the 'Help' button in the bottom right corner.
2. Select 'Contact Support'.
3. Provide details and screenshots (if applicable).

Our support team will review and respond as soon as possible.`,category:"Support"},{id:"faq-18",question:"Is my personal and health information secure?",answer:`Yes, Tavara.care prioritizes data security. We:

✔ Encrypt all personal and health information
✔ Comply with relevant data protection regulations
✔ Implement strict access controls
✔ Allow users to control who sees their data`,category:"Privacy & Security"},{id:"faq-19",question:"Still have questions?",answer:`If you couldn't find what you're looking for, feel free to:

✔ Visit our Help Center
✔ Reach out via WhatsApp Support
✔ Submit a Support Ticket`,category:"Support"}];function N(){const[s,r]=c.useState(""),[n,i]=c.useState(null),m=Array.from(new Set(d.map(a=>a.category))),o=d.filter(a=>{const u=a.question.toLowerCase().includes(s.toLowerCase())||a.answer.toLowerCase().includes(s.toLowerCase()),p=n?a.category===n:!0;return u&&p});return e.jsxs("div",{className:"container mx-auto py-8 px-4 max-w-4xl",children:[e.jsxs("div",{className:"text-center mb-8",children:[e.jsx("h1",{className:"text-3xl font-bold mb-2",children:"Frequently Asked Questions"}),e.jsx("p",{className:"text-muted-foreground",children:"Find answers to common questions about the Tavara.care"})]}),e.jsxs("div",{className:"mb-8",children:[e.jsxs("div",{className:"relative mb-4",children:[e.jsx(q,{className:"absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4"}),e.jsx(g,{type:"text",placeholder:"Search for questions or answers...",value:s,onChange:a=>r(a.target.value),className:"pl-10"})]}),e.jsxs("div",{className:"flex flex-wrap gap-2",children:[e.jsx(l,{variant:n===null?"default":"outline",className:"cursor-pointer",onClick:()=>i(null),children:"All"}),m.map(a=>e.jsx(l,{variant:n===a?"default":"outline",className:"cursor-pointer",onClick:()=>i(a===n?null:a),children:a},a))]})]}),o.length>0?e.jsx(v,{type:"single",collapsible:!0,className:"w-full",children:o.map(a=>e.jsxs(b,{value:a.id,children:[e.jsx(x,{className:"text-left",children:a.question}),e.jsx(w,{children:e.jsx("p",{className:"text-muted-foreground whitespace-pre-line",children:a.answer})})]},a.id))}):e.jsxs("div",{className:"text-center py-8",children:[e.jsx(f,{className:"mx-auto h-12 w-12 text-muted-foreground mb-4"}),e.jsx("h3",{className:"font-medium text-lg mb-1",children:"No results found"}),e.jsx("p",{className:"text-muted-foreground mb-4",children:"We couldn't find any FAQs matching your search criteria"}),e.jsx(t,{onClick:()=>{r(""),i(null)},children:"Clear filters"})]}),e.jsxs("div",{className:"mt-12 bg-muted rounded-lg p-6",children:[e.jsx("h2",{className:"text-xl font-semibold mb-4",children:"Still need help?"}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4",children:[e.jsxs("div",{className:"flex items-start space-x-3",children:[e.jsx("div",{className:"bg-primary/10 p-2 rounded-full",children:e.jsx(h,{className:"h-5 w-5 text-primary"})}),e.jsxs("div",{children:[e.jsx("h3",{className:"font-medium",children:"WhatsApp Support"}),e.jsx("p",{className:"text-sm text-muted-foreground mb-2",children:"Get quick support via WhatsApp"}),e.jsx(t,{variant:"outline",size:"sm",onClick:()=>{window.open(`https://wa.me/18687865357?text=${encodeURIComponent("Hello, I need support with Tavara.care platform.")}`,"_blank")},children:"Connect on WhatsApp"})]})]}),e.jsxs("div",{className:"flex items-start space-x-3",children:[e.jsx("div",{className:"bg-primary/10 p-2 rounded-full",children:e.jsx(y,{className:"h-5 w-5 text-primary"})}),e.jsxs("div",{children:[e.jsx("h3",{className:"font-medium",children:"Contact Form"}),e.jsx("p",{className:"text-sm text-muted-foreground mb-2",children:"Submit a detailed support request"}),e.jsx(t,{variant:"outline",size:"sm",onClick:()=>{alert("Contact form would open here")},children:"Open Contact Form"})]})]})]})]})]})}export{N as default};
