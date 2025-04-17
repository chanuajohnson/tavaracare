import{E as G,ax as Y,r as n,y as K,j as e,m as X,B as u,A as P,at as Z,M as k,J as _}from"./index-DJLxKxLh.js";import{C as b,a as V,b as ee,c as ae,d as j}from"./card-D_7FTKKp.js";import{B as h}from"./badge-DECBeW9l.js";import{A as se,b as re}from"./avatar-B3QLvAcn.js";import{C as F}from"./checkbox-DiK0xR4V.js";import{D as le}from"./DashboardHeader-CBm4zgpp.js";import{P as A}from"./plus-kaIAhkhY.js";import{A as ie}from"./arrow-left-DqYzjq2P.js";import{S as te}from"./search-BP3qj1YG.js";import{F as ne}from"./filter-CGilGy8j.js";import{C as ce}from"./clock-BEkkcdqT.js";import{M as oe}from"./map-pin-nhmjCZR0.js";import"./index-BMoCI8hB.js";import"./breadcrumb-Dp9ivPGv.js";const Ce=()=>{const{user:d}=G(),[M,q]=Y(),[c,D]=n.useState("all"),[o,R]=n.useState("all"),[p,$]=n.useState(""),[O,m]=n.useState(!1),[i,g]=n.useState("need"),C=K(),[l,y]=n.useState({title:"",location:"Trinidad and Tobago",urgency:"Regular",details:"",careNeeds:[],specialties:[]}),[w,B]=n.useState([]),L=()=>{const a=M.get("action");a==="post-need"?(m(!0),g("need")):a==="post-availability"&&(m(!0),g("availability"))};n.useState(()=>{L()});const U=[{label:"Professional Dashboard",path:"/dashboard/professional"},{label:"Message Board",path:"/professional/message-board"}],N=w.filter(a=>!(c!=="all"&&a.type!==c||o!=="all"&&a.urgency!==o||p&&!a.title.toLowerCase().includes(p.toLowerCase())&&!a.details.toLowerCase().includes(p.toLowerCase()))),v=(a,s,r)=>e.jsx(h,{variant:r===s?"default":"outline",className:`cursor-pointer ${r===s?"bg-primary":"hover:bg-primary/10"}`,onClick:()=>D(s),children:a}),x=(a,s,r)=>e.jsx(h,{variant:r===s?"default":"outline",className:`cursor-pointer ${r===s?"bg-primary":"hover:bg-primary/10"}`,onClick:()=>R(s),children:a}),f=a=>{const{id:s,value:r}=a.target;y(t=>({...t,[s]:r}))},S=(a,s,r)=>{y(t=>{const T=[...t[r]];if(s){if(!T.includes(a))return{...t,[r]:[...T,a]}}else return{...t,[r]:T.filter(Q=>Q!==a)};return t})},I=a=>{var r;a.preventDefault();const s={id:w.length+1,type:i==="need"?"family":"professional",author:(d==null?void 0:d.email)||"Anonymous User",authorInitial:(((r=d==null?void 0:d.email)==null?void 0:r[0])||"A").toUpperCase(),title:l.title,timePosted:"Just now",urgency:l.urgency,location:l.location,details:l.details,...i==="need"?{careNeeds:l.careNeeds}:{specialties:l.specialties}};B(t=>[s,...t]),y({title:"",location:"Trinidad and Tobago",urgency:"Regular",details:"",careNeeds:[],specialties:[]}),m(!1),_.success(`Successfully posted ${i==="need"?"care need":"availability"}`),q({})},W=["Medication Management","Meal Preparation","Personal Care","Transportation","Mobility Assistance","Companion Care","Child Care"],H=["Senior Care","Special Needs","Dementia Care","Post-Surgery","Respite Care","Overnight Care","Child Care"],E=["Port of Spain, Trinidad and Tobago","San Fernando, Trinidad and Tobago","Arima, Trinidad and Tobago","Chaguanas, Trinidad and Tobago","Couva, Trinidad and Tobago","Point Fortin, Trinidad and Tobago","Princes Town, Trinidad and Tobago","Sangre Grande, Trinidad and Tobago","San Juan, Trinidad and Tobago","Scarborough, Tobago","Other area, Trinidad and Tobago"],J=a=>{C("/subscription",{state:{returnPath:`/professional/message/${a}/contact`,featureType:"Requesting Service"}})},z=a=>{C("/subscription",{state:{returnPath:`/professional/message/${a}/contact`,featureType:"Offering Help"}})};return e.jsx("div",{className:"min-h-screen bg-background",children:e.jsxs("div",{className:"container px-4 py-8",children:[e.jsx(le,{breadcrumbItems:U}),e.jsxs(X.div,{initial:{opacity:0,y:20},animate:{opacity:1,y:0},transition:{duration:.5},className:"space-y-6",children:[e.jsxs("div",{className:"flex flex-col sm:flex-row sm:items-center justify-between gap-4",children:[e.jsx("h1",{className:"text-3xl font-bold",children:"Message Board"}),e.jsxs("div",{className:"flex gap-2",children:[e.jsxs(u,{onClick:()=>{m(!0),g("need")},className:"bg-blue-600 hover:bg-blue-700",children:[e.jsx(A,{className:"h-4 w-4 mr-1"}),"Post Care Need"]}),e.jsxs(u,{onClick:()=>{m(!0),g("availability")},className:"bg-green-600 hover:bg-green-700",children:[e.jsx(A,{className:"h-4 w-4 mr-1"}),"Post Availability"]})]})]}),O?e.jsxs(b,{children:[e.jsxs(V,{children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx(ee,{children:i==="need"?"Post a Care Need":"Post Your Availability"}),e.jsx(u,{variant:"ghost",size:"sm",onClick:()=>m(!1),className:"h-8 w-8 p-0",children:e.jsx(ie,{className:"h-4 w-4"})})]}),e.jsx(ae,{children:i==="need"?"Share your care requirements to find suitable care providers in Trinidad and Tobago":"Let families know when you're available to provide care in Trinidad and Tobago"})]}),e.jsx(j,{children:e.jsxs("form",{onSubmit:I,className:"space-y-4",children:[e.jsxs("div",{children:[e.jsx("label",{htmlFor:"title",className:"block text-sm font-medium mb-1",children:"Title"}),e.jsx(P,{id:"title",placeholder:"Enter a clear, descriptive title",value:l.title,onChange:f,required:!0})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4",children:[e.jsxs("div",{children:[e.jsx("label",{htmlFor:"location",className:"block text-sm font-medium mb-1",children:"Location"}),e.jsx("select",{id:"location",className:"w-full h-10 px-3 rounded-md border border-input bg-background",value:l.location,onChange:f,required:!0,children:E.map(a=>e.jsx("option",{value:a,children:a},a))})]}),e.jsxs("div",{children:[e.jsx("label",{htmlFor:"urgency",className:"block text-sm font-medium mb-1",children:"Urgency/Timing"}),e.jsxs("select",{id:"urgency",className:"w-full h-10 px-3 rounded-md border border-input bg-background",value:l.urgency,onChange:f,required:!0,children:[e.jsx("option",{value:"Today",children:"Today (Urgent)"}),e.jsx("option",{value:"Short Notice",children:"Short Notice (Within 48 hours)"}),e.jsx("option",{value:"This Weekend",children:"This Weekend"}),e.jsx("option",{value:"Regular",children:"Regular (Planned in advance)"})]})]})]}),e.jsxs("div",{children:[e.jsx("label",{htmlFor:"details",className:"block text-sm font-medium mb-1",children:"Details"}),e.jsx(Z,{id:"details",placeholder:i==="need"?"Describe care needs, schedule, requirements, etc.":"Describe your experience, availability, services offered, etc.",className:"min-h-[120px]",value:l.details,onChange:f,required:!0})]}),i==="need"?e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium mb-1",children:"Care Needs (select all that apply)"}),e.jsx("div",{className:"grid grid-cols-2 md:grid-cols-3 gap-2",children:W.map(a=>e.jsxs("div",{className:"flex items-center space-x-2",children:[e.jsx(F,{id:`need-${a}`,onCheckedChange:s=>S(a,s===!0,"careNeeds"),checked:l.careNeeds.includes(a)}),e.jsx("label",{htmlFor:`need-${a}`,className:"text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",children:a})]},a))})]}):e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium mb-1",children:"Specialties (select all that apply)"}),e.jsx("div",{className:"grid grid-cols-2 md:grid-cols-3 gap-2",children:H.map(a=>e.jsxs("div",{className:"flex items-center space-x-2",children:[e.jsx(F,{id:`specialty-${a}`,onCheckedChange:s=>S(a,s===!0,"specialties"),checked:l.specialties.includes(a)}),e.jsx("label",{htmlFor:`specialty-${a}`,className:"text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",children:a})]},a))})]}),e.jsx("div",{className:"pt-2",children:e.jsx(u,{type:"submit",className:"w-full",children:i==="need"?"Post Care Need":"Post Availability"})})]})})]}):e.jsxs(e.Fragment,{children:[e.jsx(b,{className:"mb-6",children:e.jsxs(j,{className:"pt-6",children:[e.jsxs("div",{className:"flex flex-col md:flex-row gap-4",children:[e.jsx("div",{className:"flex-1",children:e.jsxs("div",{className:"relative",children:[e.jsx(te,{className:"absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4"}),e.jsx(P,{placeholder:"Search by keyword or care type...",className:"pl-10",value:p,onChange:a=>$(a.target.value)})]})}),e.jsxs("div",{className:"flex gap-2 items-center",children:[e.jsx(ne,{className:"h-4 w-4 text-gray-500"}),e.jsx("span",{className:"text-sm font-medium mr-1",children:"Filter:"}),e.jsxs("div",{className:"flex flex-wrap gap-2",children:[v("All Types","all",c),v("Family","family",c),v("Professional","professional",c)]})]})]}),e.jsxs("div",{className:"mt-4",children:[e.jsx("span",{className:"text-sm font-medium mr-2",children:"Urgency:"}),e.jsxs("div",{className:"flex flex-wrap gap-2 mt-1",children:[x("All","all",o),x("Today","Today",o),x("Short Notice","Short Notice",o),x("This Weekend","This Weekend",o),x("Regular","Regular",o)]})]})]})}),e.jsxs("div",{className:"space-y-4",children:[e.jsxs("h2",{className:"text-xl font-semibold flex items-center gap-2",children:[e.jsx(k,{className:"h-5 w-5 text-primary"}),c==="family"?"Family Care Needs":c==="professional"?"Professional Availability":"All Messages",e.jsx(h,{className:"ml-2",children:N.length})]}),N.length===0?e.jsx(b,{children:e.jsxs(j,{className:"flex flex-col items-center justify-center py-12",children:[e.jsx(k,{className:"h-12 w-12 text-gray-300 mb-4"}),e.jsx("h3",{className:"text-xl font-medium text-gray-500",children:"No messages found"}),e.jsx("p",{className:"text-gray-400 mt-2",children:"Try adjusting your filters or search query"})]})}):N.map(a=>e.jsx(b,{className:`hover:shadow-md transition-shadow ${a.type==="family"?"border-l-4 border-l-blue-400":"border-l-4 border-l-green-400"}`,children:e.jsx(j,{className:"p-4 md:p-6",children:e.jsxs("div",{className:"flex flex-col md:flex-row md:items-start justify-between gap-4",children:[e.jsxs("div",{className:"flex-1",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx(se,{className:a.type==="family"?"bg-blue-100":"bg-green-100",children:e.jsx(re,{className:a.type==="family"?"text-blue-700":"text-green-700",children:a.authorInitial})}),e.jsxs("div",{children:[e.jsx("h3",{className:"font-medium text-lg",children:a.title}),e.jsx("p",{className:"text-sm text-gray-500",children:a.author})]})]}),e.jsx("div",{className:"mt-4",children:e.jsx("p",{className:"text-gray-700",children:a.details})}),e.jsx("div",{className:"flex flex-wrap gap-2 mt-4",children:a.type==="family"&&a.careNeeds?a.careNeeds.map((s,r)=>e.jsx(h,{variant:"outline",className:"bg-blue-50 text-blue-700",children:s},r)):a.specialties?a.specialties.map((s,r)=>e.jsx(h,{variant:"outline",className:"bg-green-50 text-green-700",children:s},r)):null})]}),e.jsxs("div",{className:"flex flex-col items-end gap-3 mt-4 md:mt-0",children:[e.jsx(h,{className:`${a.urgency==="Today"?"bg-red-100 text-red-700":a.urgency==="Short Notice"?"bg-orange-100 text-orange-700":a.urgency==="This Weekend"?"bg-amber-100 text-amber-700":"bg-blue-100 text-blue-700"}`,children:a.urgency}),e.jsxs("div",{className:"flex flex-col gap-2 text-xs text-gray-500 items-end",children:[e.jsxs("div",{className:"flex items-center gap-1",children:[e.jsx(ce,{className:"h-3 w-3"}),e.jsxs("span",{children:["Posted ",a.timePosted]})]}),e.jsxs("div",{className:"flex items-center gap-1",children:[e.jsx(oe,{className:"h-3 w-3"}),e.jsx("span",{children:a.location})]})]}),e.jsx(u,{variant:"outline",size:"sm",className:"mt-2",onClick:()=>a.type==="family"?z(a.id):J(a.id),children:a.type==="family"?"Offer Help":"Request Service"})]})]})})},a.id))]})]})]})]})})};export{Ce as default};
