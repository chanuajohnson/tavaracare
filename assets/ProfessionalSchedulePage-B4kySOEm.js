import{E as W,y as q,r as m,J as _,j as e,B as o,N as J,ao as x,L as P,Q,U as R,x as H}from"./index-DJLxKxLh.js";import{D as G}from"./DashboardHeader-CBm4zgpp.js";import{C as K}from"./calendar-DCxcEz8F.js";import{C as j,a as y,b as w,c as U,d as N}from"./card-D_7FTKKp.js";import{B as Y}from"./badge-DECBeW9l.js";import{A as E,a as O,b as T}from"./avatar-B3QLvAcn.js";import{u as X}from"./useJourneyTracking-TaZ1Bxct.js";import{A as Z}from"./arrow-left-DqYzjq2P.js";import{C as b}from"./clipboard-list-BNYzzE8N.js";import{C as D}from"./clock-BEkkcdqT.js";import{M as ee}from"./map-pin-nhmjCZR0.js";import"./breadcrumb-Dp9ivPGv.js";import"./chevron-left-DQIOBpC8.js";import"./useTracking-D3R_beIG.js";const pe=()=>{const{user:u}=W(),p=q(),[r,$]=m.useState(new Date),[S,C]=m.useState(!0),[h,z]=m.useState([]),[k,B]=m.useState([]),[I,A]=m.useState(!0),[d,v]=m.useState("day");X({journeyStage:"schedule_management",additionalData:{page:"professional_schedule"},trackOnce:!0});const V=[{label:"Professional Dashboard",path:"/dashboard/professional"},{label:"Schedule",path:"/professional/schedule"}],F=t=>{if(!t)return"";const a=t.split(" ");return a.length===1?a[0].charAt(0).toUpperCase():a[0].charAt(0).toUpperCase()+a[a.length-1].charAt(0).toUpperCase()};m.useEffect(()=>{if(!u)return;(async()=>{try{A(!0);const{data:a,error:s}=await H.from("care_team_members").select(`
            id, 
            status,
            role,
            care_plan_id,
            family_id,
            care_plans:care_plans(
              id,
              title,
              description,
              status,
              profiles:profiles!care_plans_family_id_fkey(
                id,
                full_name,
                avatar_url
              )
            )
          `).eq("caregiver_id",u.id).order("created_at",{ascending:!1});if(s)throw console.error("Error fetching care assignments:",s),s;console.log("Care assignments loaded:",a),B(a||[])}catch(a){console.error("Failed to load care assignments:",a),_.error("Failed to load your care assignments")}finally{A(!1)}})()},[u]),m.useEffect(()=>{if(!u){_.info("Authentication Required",{description:"Please log in to view your schedule."}),p("/auth",{state:{returnPath:"/professional/schedule"}});return}(async()=>{try{C(!0);let a,s;if(d==="day"&&r)a=new Date(r),a.setHours(0,0,0,0),s=new Date(r),s.setHours(23,59,59,999);else if(d==="week"&&r){a=new Date(r);const c=a.getDay(),i=a.getDate()-c+(c===0?-6:1);a=new Date(a.setDate(i)),a.setHours(0,0,0,0),s=new Date(a),s.setDate(s.getDate()+6),s.setHours(23,59,59,999)}else d==="month"&&r?(a=new Date(r.getFullYear(),r.getMonth(),1),s=new Date(r.getFullYear(),r.getMonth()+1,0,23,59,59,999)):(a=new Date,a.setHours(0,0,0,0),s=new Date,s.setHours(23,59,59,999));const{data:l,error:n}=await H.from("care_shifts").select(`
            id,
            title,
            description,
            location,
            status,
            start_time,
            end_time,
            care_plan_id,
            family_id,
            care_plans:care_plans(
              id,
              title,
              status,
              profiles:profiles!care_plans_family_id_fkey(
                full_name,
                avatar_url
              )
            )
          `).eq("caregiver_id",u.id).gte("start_time",a.toISOString()).lte("start_time",s.toISOString()).order("start_time",{ascending:!0});if(n)throw console.error("Error fetching shifts:",n),n;console.log("Loaded shifts:",l),z(l||[])}catch(a){console.error("Failed to load shifts:",a),_.error("Failed to load your schedule")}finally{C(!1)}})()},[u,p,r,d]);const L=t=>new Date(t).toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit",hour12:!0}),M=h.reduce((t,a)=>{const s=new Date(a.start_time).toDateString();return t[s]||(t[s]=[]),t[s].push(a),t},{});return e.jsx("div",{className:"min-h-screen bg-background",children:e.jsxs("div",{className:"container px-4 py-8",children:[e.jsx(G,{breadcrumbItems:V}),e.jsxs("div",{className:"flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6",children:[e.jsxs("div",{children:[e.jsxs(o,{variant:"outline",size:"sm",className:"mb-4",onClick:()=>p("/professional/profile"),children:[e.jsx(Z,{className:"mr-2 h-4 w-4"}),"Back to Profile"]}),e.jsx("h1",{className:"text-3xl font-bold",children:"Your Schedule"}),e.jsx("p",{className:"text-muted-foreground",children:"Manage your care assignments and shifts"})]}),e.jsxs("div",{className:"flex gap-2",children:[e.jsx(o,{variant:d==="day"?"default":"outline",size:"sm",onClick:()=>v("day"),children:"Day"}),e.jsx(o,{variant:d==="week"?"default":"outline",size:"sm",onClick:()=>v("week"),children:"Week"}),e.jsx(o,{variant:d==="month"?"default":"outline",size:"sm",onClick:()=>v("month"),children:"Month"})]})]}),e.jsx("div",{className:"mb-6",children:e.jsxs(j,{children:[e.jsxs(y,{children:[e.jsxs(w,{className:"flex items-center gap-2",children:[e.jsx(J,{className:"h-5 w-5 text-primary"}),"Your Care Assignments"]}),e.jsx(U,{children:"Families and care plans you are assigned to"})]}),e.jsx(N,{children:I?e.jsxs("div",{className:"space-y-4",children:[e.jsx(x,{className:"h-16 w-full"}),e.jsx(x,{className:"h-16 w-full"})]}):k.length>0?e.jsx("div",{className:"space-y-4",children:k.map(t=>{var a,s,l,n,c,i,f,g;return e.jsxs("div",{className:"border rounded-md p-4 hover:shadow-sm transition-shadow",children:[e.jsxs("div",{className:"flex justify-between items-start",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsxs(E,{className:"h-10 w-10",children:[e.jsx(O,{src:((s=(a=t.care_plans)==null?void 0:a.profiles)==null?void 0:s.avatar_url)||""}),e.jsx(T,{className:"bg-primary text-primary-foreground",children:F((n=(l=t.care_plans)==null?void 0:l.profiles)==null?void 0:n.full_name)})]}),e.jsxs("div",{children:[e.jsx("h3",{className:"font-medium text-lg",children:((c=t.care_plans)==null?void 0:c.title)||"Unnamed Plan"}),e.jsx("p",{className:"text-sm text-muted-foreground",children:((f=(i=t.care_plans)==null?void 0:i.profiles)==null?void 0:f.full_name)||"Family"})]})]}),e.jsx(Y,{className:t.status==="active"?"bg-green-100 text-green-800":t.status==="pending"?"bg-amber-100 text-amber-800":"bg-gray-100 text-gray-800",children:t.status||"Unknown"})]}),((g=t.care_plans)==null?void 0:g.description)&&e.jsx("p",{className:"text-sm mt-2 text-gray-600",children:t.care_plans.description}),e.jsx("div",{className:"flex gap-2 mt-4",children:e.jsx(P,{to:`/professional/assignments/${t.care_plan_id}`,children:e.jsx(o,{size:"sm",variant:"outline",children:"View Plan Details"})})})]},t.id)})}):e.jsxs("div",{className:"text-center py-12",children:[e.jsx(b,{className:"h-12 w-12 text-gray-300 mx-auto mb-4"}),e.jsx("h3",{className:"text-lg font-medium mb-1",children:"No care assignments yet"}),e.jsx("p",{className:"text-gray-500 mb-6",children:"You'll see care plans here once families assign you to their care team"})]})})]})}),e.jsxs("div",{className:"grid grid-cols-1 lg:grid-cols-3 gap-6",children:[e.jsx("div",{className:"lg:col-span-2",children:S?e.jsxs(j,{children:[e.jsxs(y,{children:[e.jsx(x,{className:"h-8 w-1/4 mb-2"}),e.jsx(x,{className:"h-4 w-1/3"})]}),e.jsx(N,{children:e.jsxs("div",{className:"space-y-4",children:[e.jsx(x,{className:"h-24 w-full"}),e.jsx(x,{className:"h-24 w-full"}),e.jsx(x,{className:"h-24 w-full"})]})})]}):e.jsxs(j,{children:[e.jsxs(y,{children:[e.jsxs(w,{className:"flex items-center gap-2",children:[e.jsx(b,{className:"h-5 w-5 text-primary"}),d==="day"&&r?`Schedule for ${r.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}`:d==="week"&&r?"Weekly Schedule":"Monthly Schedule"]}),e.jsx(U,{children:h.length?`You have ${h.length} shift${h.length===1?"":"s"} scheduled`:"No shifts scheduled for this period"})]}),e.jsx(N,{children:Object.keys(M).length>0?e.jsx("div",{className:"space-y-6",children:Object.entries(M).map(([t,a])=>e.jsxs("div",{className:"space-y-3",children:[e.jsx("h3",{className:"font-medium text-gray-700",children:new Date(t).toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}),e.jsx("div",{className:"space-y-3",children:a.map(s=>{var l,n,c,i,f,g;return e.jsxs("div",{className:"border rounded-md p-4 space-y-3 bg-card hover:shadow-sm transition-shadow",children:[e.jsxs("div",{className:"flex items-start justify-between",children:[e.jsxs("div",{children:[e.jsx("h3",{className:"font-medium",children:s.title}),s.description&&e.jsx("p",{className:"text-sm text-gray-600 mt-1",children:s.description})]}),e.jsx(Y,{className:`
                                    ${s.status==="assigned"?"bg-green-100 text-green-800":s.status==="open"?"bg-amber-100 text-amber-800":s.status==="cancelled"?"bg-red-100 text-red-800":"bg-blue-100 text-blue-800"}
                                  `,children:s.status==="assigned"?"Assigned":s.status==="open"?"Open":s.status==="cancelled"?"Cancelled":s.status})]}),e.jsxs("div",{className:"flex items-center gap-2 text-sm",children:[e.jsx(D,{className:"h-4 w-4 text-gray-500"}),e.jsxs("span",{children:[L(s.start_time)," - ",L(s.end_time)]})]}),s.location&&e.jsxs("div",{className:"flex items-center gap-2 text-sm",children:[e.jsx(ee,{className:"h-4 w-4 text-gray-500"}),e.jsx("span",{children:s.location})]}),e.jsxs("div",{className:"flex justify-between items-center pt-2",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsxs(E,{className:"h-6 w-6",children:[e.jsx(O,{src:((n=(l=s.care_plans)==null?void 0:l.profiles)==null?void 0:n.avatar_url)||""}),e.jsx(T,{className:"bg-primary text-white text-xs",children:F((i=(c=s.care_plans)==null?void 0:c.profiles)==null?void 0:i.full_name)})]}),e.jsx("span",{className:"text-sm",children:((g=(f=s.care_plans)==null?void 0:f.profiles)==null?void 0:g.full_name)||"Family"})]}),e.jsx(P,{to:`/professional/assignments/${s.care_plan_id}`,children:e.jsx(o,{variant:"outline",size:"sm",children:"View Plan"})})]})]},s.id)})})]},t))}):e.jsxs("div",{className:"text-center py-12",children:[e.jsx(D,{className:"h-12 w-12 text-gray-300 mx-auto mb-4"}),e.jsx("h3",{className:"text-lg font-medium mb-1",children:"No shifts scheduled"}),e.jsx("p",{className:"text-gray-500 mb-6",children:"You don't have any shifts scheduled for this time period"}),e.jsx(o,{variant:"outline",onClick:()=>p("/professional/profile"),children:"View Care Assignments"})]})})]})}),e.jsxs("div",{className:"space-y-6",children:[e.jsxs(j,{children:[e.jsx(y,{children:e.jsxs(w,{className:"flex items-center gap-2",children:[e.jsx(Q,{className:"h-5 w-5 text-primary"}),"Calendar"]})}),e.jsxs(N,{children:[e.jsx(K,{mode:"single",selected:r,onSelect:$,className:"rounded-md border shadow-sm"}),e.jsxs("div",{className:"mt-6 space-y-4",children:[e.jsx("h3",{className:"font-medium text-sm text-gray-700",children:"Quick Links"}),e.jsxs("div",{className:"space-y-2",children:[e.jsxs(o,{variant:"outline",className:"w-full justify-start",onClick:()=>p("/professional/profile"),children:[e.jsx(R,{className:"mr-2 h-4 w-4"}),"Care Assignments"]}),e.jsxs(o,{variant:"outline",className:"w-full justify-start",onClick:()=>p("/dashboard/professional"),children:[e.jsx(b,{className:"mr-2 h-4 w-4"}),"Dashboard"]})]})]})]})]}),!S&&e.jsxs(j,{children:[e.jsx(y,{children:e.jsxs(w,{className:"flex items-center gap-2",children:[e.jsx(D,{className:"h-5 w-5 text-primary"}),"Schedule Summary"]})}),e.jsx(N,{className:"space-y-4",children:e.jsxs("div",{className:"space-y-2",children:[e.jsxs("div",{className:"flex justify-between",children:[e.jsx("span",{className:"text-sm text-gray-600",children:"Today"}),e.jsx("span",{className:"font-medium",children:h.filter(t=>new Date(t.start_time).toDateString()===new Date().toDateString()).length})]}),e.jsxs("div",{className:"flex justify-between",children:[e.jsx("span",{className:"text-sm text-gray-600",children:"This Week"}),e.jsx("span",{className:"font-medium",children:h.filter(t=>{const a=new Date(t.start_time),s=new Date,l=new Date(s),n=l.getDay(),c=l.getDate()-n+(n===0?-6:1);l.setDate(c),l.setHours(0,0,0,0);const i=new Date(l);return i.setDate(i.getDate()+6),i.setHours(23,59,59,999),a>=l&&a<=i}).length})]}),e.jsxs("div",{className:"flex justify-between",children:[e.jsx("span",{className:"text-sm text-gray-600",children:"This Month"}),e.jsx("span",{className:"font-medium",children:h.filter(t=>{const a=new Date(t.start_time),s=new Date;return a.getMonth()===s.getMonth()&&a.getFullYear()===s.getFullYear()}).length})]})]})})]})]})]})]})})};export{pe as default};
