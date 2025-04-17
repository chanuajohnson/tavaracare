import{E as N,r as f,j as e,m as s,U as v,B as i,J as m,x as w}from"./index-DJLxKxLh.js";import{C as l,a as n,b as o,c as d,d as c}from"./card-D_7FTKKp.js";import{C}from"./container-54FCgr9u.js";import{B as h}from"./badge-DECBeW9l.js";import{u as S}from"./useJourneyTracking-TaZ1Bxct.js";import{B as k}from"./Breadcrumb-C4hOkgaw.js";import{H as y}from"./heart-DjyRX8v9.js";import{F as j,S as q,H}from"./shopping-bag-DxruYh4E.js";import{M as B}from"./mail-CkKKsUcH.js";import{A as b}from"./arrow-right-DQ_A9s3j.js";import{M}from"./message-circle-wuNhphbO.js";import"./useTracking-D3R_beIG.js";const J=()=>{const{user:x}=N(),[r,p]=f.useState(null);S({journeyStage:"caregiver_support",additionalData:{page:"caregiver_health_hub"},trackOnce:!0});const a=async t=>{if(!x){m.info("Please log in or register",{description:`You need to be logged in to request ${t} support.`,duration:5e3});return}try{p(t);const{data:u,error:g}=await w.from("support_requests").insert({user_id:x.id,request_type:t,message:`Support request for ${t}`});if(g)throw g;m.success("Request sent successfully",{description:`We've received your ${t} request and will be in touch soon.`,duration:5e3})}catch(u){console.error("Error sending support request:",u),m.error("Couldn't send request",{description:`There was a problem sending your ${t} request. Please try again.`,duration:5e3})}finally{p(null)}};return e.jsx("div",{className:"min-h-screen bg-gradient-to-b from-primary-50 to-white",children:e.jsxs(C,{className:"py-6",children:[e.jsx(k,{}),e.jsxs(s.div,{initial:{opacity:0,y:20},animate:{opacity:1,y:0},transition:{duration:.6},className:"text-center mb-12",children:[e.jsx("div",{className:"inline-flex items-center justify-center rounded-full bg-primary-100 p-3 mb-4",children:e.jsx(y,{className:"h-8 w-8 text-primary-600"})}),e.jsx("h1",{className:"text-4xl font-bold text-primary-900 mb-3",children:"Caregiver Health & Support"}),e.jsx("p",{className:"text-xl text-primary-700 max-w-2xl mx-auto",children:"Because caring for others shouldn't mean losing yourself."}),e.jsxs("div",{className:"mt-8 max-w-3xl mx-auto text-gray-600 leading-relaxed",children:[e.jsx("p",{className:"mb-4",children:"The truth is, caregiving is beautiful — and it's also brutal. It can pull you apart, leave you unseen, and take a toll on your body, mind, and spirit."}),e.jsx("p",{className:"font-medium text-primary-800",children:"This is where we begin to change that."})]})]}),e.jsxs("div",{className:"mb-16",children:[e.jsxs("h2",{className:"text-2xl font-bold text-primary-800 mb-6 flex items-center",children:[e.jsx("div",{className:"bg-primary-100 rounded-full p-1.5 mr-2",children:e.jsx(j,{className:"h-5 w-5 text-primary-600"})}),"What Support Can Look Like Here"]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-6",children:[e.jsx(s.div,{initial:{opacity:0,y:20},animate:{opacity:1,y:0},transition:{duration:.5,delay:.1},children:e.jsxs(l,{className:"h-full border-l-4 border-l-blue-400 shadow-sm",children:[e.jsx(n,{children:e.jsxs("div",{className:"flex items-start gap-3",children:[e.jsx("div",{className:"rounded-full bg-blue-100 p-2 text-blue-600 mt-1",children:e.jsx(v,{className:"h-5 w-5"})}),e.jsxs("div",{children:[e.jsx(o,{children:"Presence Support"}),e.jsx(d,{className:"text-gray-600 mt-1",children:"Need someone to simply be there while you do something hard?"})]})]})}),e.jsxs(c,{className:"space-y-4",children:[e.jsx("p",{className:"text-gray-600",children:"We'll match you with a volunteer, peer caregiver, or support companion to sit with you — emotionally, physically, or even silently."}),e.jsx("div",{className:"bg-blue-50 p-3 rounded-md border border-blue-100",children:e.jsx("p",{className:"text-blue-700 font-medium italic",children:`"You do the work. I'll hold the space."`})}),e.jsx(i,{className:"w-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2",onClick:()=>a("Presence Support"),disabled:r==="Presence Support",children:r==="Presence Support"?e.jsx(e.Fragment,{children:"Sending Request..."}):e.jsxs(e.Fragment,{children:[e.jsx(B,{className:"h-4 w-4"}),"Request Support"]})})]})]})}),e.jsx(s.div,{initial:{opacity:0,y:20},animate:{opacity:1,y:0},transition:{duration:.5,delay:.2},children:e.jsxs(l,{className:"h-full border-l-4 border-l-green-400 shadow-sm",children:[e.jsx(n,{children:e.jsxs("div",{className:"flex items-start gap-3",children:[e.jsx("div",{className:"rounded-full bg-green-100 p-2 text-green-600 mt-1",children:e.jsx(q,{className:"h-5 w-5"})}),e.jsxs("div",{children:[e.jsx(o,{children:"Errand & Relief Circle"}),e.jsx(d,{className:"text-gray-600 mt-1",children:"You don't need to do it all."})]})]})}),e.jsxs(c,{className:"space-y-4",children:[e.jsx("p",{className:"text-gray-600",children:"Whether it's a food drop, pharmacy run, or someone to walk with — we help you connect with others who are nearby and ready to share the load."}),e.jsx("div",{className:"bg-green-50 p-3 rounded-md border border-green-100",children:e.jsx("p",{className:"text-green-700 font-medium italic",children:"Helping each other helps us all."})}),e.jsxs("div",{className:"grid grid-cols-2 gap-3",children:[e.jsx(i,{variant:"outline",className:"border-green-200 text-green-700 hover:bg-green-50",onClick:()=>a("Browse Helpers"),children:"Browse Helpers"}),e.jsx(i,{className:"bg-green-600 hover:bg-green-700",onClick:()=>a("Post a Need"),children:"Post a Need"})]})]})]})}),e.jsx(s.div,{initial:{opacity:0,y:20},animate:{opacity:1,y:0},transition:{duration:.5,delay:.3},children:e.jsxs(l,{className:"h-full border-l-4 border-l-amber-400 shadow-sm",children:[e.jsx(n,{children:e.jsxs("div",{className:"flex items-start gap-3",children:[e.jsx("div",{className:"rounded-full bg-amber-100 p-2 text-amber-600 mt-1",children:e.jsx(j,{className:"h-5 w-5"})}),e.jsxs("div",{children:[e.jsx(o,{children:"Companion Matching"}),e.jsx(d,{className:"text-gray-600 mt-1",children:"Some people are just... longing to go to the beach. Or sit on a porch. Or talk."})]})]})}),e.jsxs(c,{className:"space-y-4",children:[e.jsx("p",{className:"text-gray-600",children:"You're not the only one. We'll help you find someone who needs the company just as much as you do."}),e.jsx(i,{className:"w-full bg-amber-600 hover:bg-amber-700",onClick:()=>a("Companion Matching"),disabled:r==="Companion Matching",children:r==="Companion Matching"?e.jsx(e.Fragment,{children:"Sending Request..."}):e.jsxs(e.Fragment,{children:["See Companion Matches",e.jsx(b,{className:"h-4 w-4 ml-2"})]})})]})]})}),e.jsx(s.div,{initial:{opacity:0,y:20},animate:{opacity:1,y:0},transition:{duration:.5,delay:.4},children:e.jsxs(l,{className:"h-full border-l-4 border-l-purple-400 shadow-sm",children:[e.jsx(n,{children:e.jsxs("div",{className:"flex items-start gap-3",children:[e.jsx("div",{className:"rounded-full bg-purple-100 p-2 text-purple-600 mt-1",children:e.jsx(H,{className:"h-5 w-5"})}),e.jsxs("div",{children:[e.jsx(o,{children:"Emotional Co-Care"}),e.jsx(d,{className:"text-gray-600 mt-1",children:"You carry so much — sometimes you just need someone to witness it."})]})]})}),e.jsxs(c,{className:"space-y-4",children:[e.jsx("p",{className:"text-gray-600",children:"Whether you're managing grief, exhaustion, or something you can't even name… you don't have to do it alone."}),e.jsx("div",{className:"bg-purple-50 p-3 rounded-md border border-purple-100",children:e.jsx("p",{className:"text-purple-700 font-medium italic",children:`"Let's be in this moment, together."`})}),e.jsx(i,{className:"w-full bg-purple-600 hover:bg-purple-700",onClick:()=>a("Emotional Co-Care"),disabled:r==="Emotional Co-Care",children:r==="Emotional Co-Care"?e.jsx(e.Fragment,{children:"Sending Request..."}):e.jsxs(e.Fragment,{children:["Schedule Emotional Presence",e.jsx(b,{className:"h-4 w-4 ml-2"})]})})]})]})})]})]}),e.jsx(s.div,{initial:{opacity:0,y:20},animate:{opacity:1,y:0},transition:{duration:.5,delay:.5},className:"mb-16",children:e.jsxs(l,{className:"bg-gradient-to-br from-primary-50 to-white border-primary-200",children:[e.jsx(n,{children:e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("div",{className:"rounded-full bg-primary-100 p-2 text-primary-700",children:e.jsx(y,{className:"h-5 w-5"})}),e.jsxs("div",{children:[e.jsx(o,{children:"Why This Matters"}),e.jsx(d,{children:"The reality of caregiver health & burnout"})]})]})}),e.jsxs(c,{children:[e.jsx("p",{className:"text-gray-600 mb-4",children:"Studies show caregivers are:"}),e.jsxs("div",{className:"space-y-3 mb-6",children:[e.jsxs("div",{className:"flex items-start gap-3",children:[e.jsx(h,{className:"bg-red-100 text-red-700 border-red-200 hover:bg-red-200",children:"33%"}),e.jsx("span",{className:"text-gray-700",children:"More likely to develop mental health challenges within one year of caregiving"})]}),e.jsxs("div",{className:"flex items-start gap-3",children:[e.jsx(h,{className:"bg-red-100 text-red-700 border-red-200 hover:bg-red-200",children:"25%"}),e.jsx("span",{className:"text-gray-700",children:"More likely to experience physical health deterioration"})]}),e.jsxs("div",{className:"flex items-start gap-3",children:[e.jsx(h,{className:"bg-red-100 text-red-700 border-red-200 hover:bg-red-200",children:"Higher Risk"}),e.jsx("span",{className:"text-gray-700",children:"Often more at risk than the person they're caring for"})]})]}),e.jsxs("div",{className:"bg-primary-50 p-4 rounded-md border border-primary-100",children:[e.jsx("p",{className:"text-primary-800 text-lg font-medium mb-2",children:"We're building a platform that changes this."}),e.jsxs("p",{className:"text-primary-700",children:["That protects the people doing the protecting.",e.jsx("br",{}),"That sees you — and shows up with you."]})]})]})]})}),e.jsxs(s.div,{initial:{opacity:0,y:20},animate:{opacity:1,y:0},transition:{duration:.5,delay:.6},className:"bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center",children:[e.jsx("div",{className:"inline-flex items-center justify-center rounded-full bg-primary-100 p-2 mb-4",children:e.jsx(M,{className:"h-5 w-5 text-primary-700"})}),e.jsx("h2",{className:"text-2xl font-bold text-primary-800 mb-3",children:"Built for You, Built by You"}),e.jsxs("p",{className:"text-gray-600 mb-6 max-w-2xl mx-auto",children:["Have ideas for the kind of support that would actually help you?",e.jsx("br",{}),"We're listening — and co-creating this space together."]}),e.jsx(i,{size:"lg",className:"bg-primary-600 hover:bg-primary-700",onClick:()=>a("Share Story or Suggestion"),children:"Share Your Story or Suggest a Feature"})]})]})})};export{J as default};
