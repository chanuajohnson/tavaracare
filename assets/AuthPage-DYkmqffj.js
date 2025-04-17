import{r as o,j as e,A as F,B as C,D as T,J as d,y as q,E as _,x as L}from"./index-DJLxKxLh.js";import{C as I,a as D,b as Y,c as M,d as B,e as V}from"./card-D_7FTKKp.js";import{T as W,a as z,b as R,c as E}from"./tabs-BdhHB47H.js";import{L as S}from"./label-Cm4w0K58.js";import{E as U,a as $,R as H}from"./ResetPasswordForm-go-ercTK.js";import{S as J,a as G,b as O,c as K,d as k}from"./select-BTpJB_dt.js";import{M as Q}from"./mail-CkKKsUcH.js";import{e as X}from"./profile-utils-BxuMhmW_.js";import"./arrow-left-DqYzjq2P.js";import"./index-BMoCI8hB.js";import"./chevron-up-wbhlpt7D.js";function Z({onSubmit:w,isLoading:t,onForgotPassword:x}){const[u,h]=o.useState(""),[g,p]=o.useState(""),[j,f]=o.useState(!1),[v,i]=o.useState(!1),A=async a=>{if(a.preventDefault(),!u||!g){d.error("Please enter both email and password");return}try{i(!0),console.log("[LoginForm] Submitting login form..."),await w(u,g),console.log("[LoginForm] Login form submission completed")}catch(r){console.error("[LoginForm] Error during form submission:",r),d.error(r.message||"Failed to log in")}finally{i(!1)}},y=()=>{if(!u){d.error("Please enter your email address");return}x(u)},m=t||v;return e.jsxs("form",{onSubmit:A,className:"space-y-4",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsx(S,{htmlFor:"email",children:"Email"}),e.jsx(F,{id:"email",type:"email",placeholder:"Your email address",value:u,onChange:a=>h(a.target.value),required:!0,autoComplete:"email",disabled:m})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(S,{htmlFor:"password",children:"Password"}),e.jsxs("div",{className:"relative",children:[e.jsx(F,{id:"password",type:j?"text":"password",placeholder:"Your password",value:g,onChange:a=>p(a.target.value),required:!0,autoComplete:"current-password",disabled:m}),e.jsx(C,{type:"button",variant:"ghost",size:"icon",className:"absolute right-0 top-0 h-full px-3",onClick:()=>f(!j),disabled:m,children:j?e.jsx(U,{className:"h-4 w-4"}):e.jsx($,{className:"h-4 w-4"})})]})]}),e.jsx("div",{className:"flex justify-end",children:e.jsx(C,{type:"button",variant:"link",className:"p-0 h-auto text-sm text-muted-foreground",onClick:y,disabled:m,children:"Forgot password?"})}),e.jsx(C,{type:"submit",className:"w-full mt-6",disabled:m,children:m?e.jsxs(e.Fragment,{children:[e.jsx(T,{className:"mr-2 h-4 w-4 animate-spin"}),"Logging in..."]}):"Log in"})]})}function ee({onSubmit:w,isLoading:t}){const[x,u]=o.useState(""),[h,g]=o.useState(""),[p,j]=o.useState(""),[f,v]=o.useState(""),[i,A]=o.useState("family"),[y,m]=o.useState(!1),[a,r]=o.useState(!1),[n,l]=o.useState("idle"),b=async s=>{if(s.preventDefault(),!x||!h||!p||!f||!i){d.error("Please fill in all required fields");return}if(h.length<6){d.error("Password must be at least 6 characters long");return}try{r(!0),l("submitting"),console.log("SignupForm submitting with role:",i),localStorage.setItem("registeringAs",i),localStorage.setItem("registrationRole",i);const c={first_name:p,last_name:f,full_name:`${p} ${f}`.trim(),role:i};console.log("Setting user metadata:",c),await w(x,h,p,f,i),d.success("Account created successfully! Please check your email to confirm your account."),l("success")}catch(c){console.error("Signup error:",c),d.error(c.message||"Failed to create account. Please try again."),r(!1),l("error")}};return n==="success"?e.jsxs("div",{className:"space-y-4 text-center py-8",children:[e.jsx("div",{className:"flex justify-center",children:e.jsxs("div",{className:"bg-primary-100 text-primary-800 p-4 rounded-md",children:[e.jsx("h3",{className:"font-medium text-lg",children:"Registration Started!"}),e.jsxs("div",{className:"mt-2 space-y-4",children:[e.jsxs("p",{children:["Your account has been created successfully. We've sent a confirmation email to ",e.jsx("strong",{children:x}),"."]}),e.jsxs("div",{className:"bg-amber-50 border border-amber-200 p-3 rounded-md text-amber-800 text-sm",children:[e.jsxs("h4",{className:"font-medium mb-1 flex items-center",children:[e.jsx(Q,{className:"h-4 w-4 mr-1"})," Next Steps:"]}),e.jsxs("ol",{className:"list-decimal list-inside text-left space-y-1",children:[e.jsx("li",{children:"Check your email inbox for a confirmation link"}),e.jsx("li",{children:"Click the confirmation link to verify your email"}),e.jsxs("li",{children:["You'll be redirected to complete your ",i," profile"]})]})]}),e.jsx("p",{className:"text-sm text-gray-600 mt-2",children:"If you don't see the email, please check your spam folder."})]})]})}),e.jsx(C,{className:"mt-4",onClick:()=>{r(!1),l("idle");const s=document.querySelector('[role="tablist"]'),c=s==null?void 0:s.querySelector('[value="login"]');c&&c.click()},children:"Go to Login"})]}):e.jsxs("form",{onSubmit:b,className:"space-y-4",children:[e.jsxs("div",{className:"grid grid-cols-2 gap-4",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsx(S,{htmlFor:"firstName",children:"First Name"}),e.jsx(F,{id:"firstName",placeholder:"First Name",value:p,onChange:s=>j(s.target.value),required:!0,disabled:t||a})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(S,{htmlFor:"lastName",children:"Last Name"}),e.jsx(F,{id:"lastName",placeholder:"Last Name",value:f,onChange:s=>v(s.target.value),required:!0,disabled:t||a})]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(S,{htmlFor:"email",children:"Email"}),e.jsx(F,{id:"email",type:"email",placeholder:"Your email address",value:x,onChange:s=>u(s.target.value),required:!0,disabled:t||a,autoComplete:"email"})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(S,{htmlFor:"password",children:"Password"}),e.jsxs("div",{className:"relative",children:[e.jsx(F,{id:"password",type:y?"text":"password",placeholder:"Create a password",value:h,onChange:s=>g(s.target.value),required:!0,disabled:t||a,autoComplete:"new-password",minLength:6}),e.jsx(C,{type:"button",variant:"ghost",size:"icon",className:"absolute right-0 top-0 h-full px-3",onClick:()=>m(!y),disabled:t||a,children:y?e.jsx(U,{className:"h-4 w-4"}):e.jsx($,{className:"h-4 w-4"})})]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(S,{htmlFor:"role",children:"Role"}),e.jsxs(J,{value:i,onValueChange:s=>{console.log("Role selected:",s),A(s)},disabled:t||a,children:[e.jsx(G,{id:"role",children:e.jsx(O,{placeholder:"Select your role"})}),e.jsxs(K,{children:[e.jsx(k,{value:"family",children:"Family Member"}),e.jsx(k,{value:"professional",children:"Care Professional"}),e.jsx(k,{value:"community",children:"Community Member"})]})]})]}),e.jsx(C,{type:"submit",className:"w-full mt-6",disabled:t||a,children:t||a?e.jsxs(e.Fragment,{children:[e.jsx(T,{className:"mr-2 h-4 w-4 animate-spin"}),"Creating account..."]}):"Create account"})]})}function me(){const[w,t]=o.useState(!1),x=q(),{user:u}=_(),[h,g]=o.useState(!1),[p,j]=o.useState(""),[f,v]=o.useState("login");o.useEffect(()=>{if(u){console.log("[AuthPage] User already logged in, AuthProvider will handle redirection");return}new URLSearchParams(window.location.search).get("action")==="verification-pending"&&(v("login"),d.info("Please check your email and click the verification link to continue."))},[u,x]);const i=async(a,r)=>{try{console.log("[AuthPage] Starting login process..."),t(!0);const{data:n,error:l}=await L.auth.signInWithPassword({email:a,password:r});if(l)throw console.error("[AuthPage] Login error:",l.message),l;console.log("[AuthPage] Login successful:",n.session?"Has session":"No session")}catch(n){throw console.error("[AuthPage] Login error:",n),d.error(n.message||"Failed to log in"),n}finally{t(!1),console.log("[AuthPage] Login process completed")}},A=async(a,r,n,l,b)=>{try{console.log("[AuthPage] Starting signup process..."),t(!0);const s=`${n} ${l}`,{data:c,error:P}=await L.auth.signUp({email:a,password:r,options:{data:{role:b,full_name:s,first_name:n,last_name:l}}});if(P)throw console.error("[AuthPage] Signup error:",P.message),P;if(console.log("[AuthPage] Signup successful:",c.user?"User created":"No user created"),c.session&&c.user){console.log("[AuthPage] Session created after signup - auto-confirm must be enabled");const N=b;return await X(c.user.id,N),await L.auth.updateUser({data:{role:N,full_name:s,first_name:n,last_name:l}}),d.success("Account created successfully! You'll be redirected to your dashboard shortly."),!0}else return console.log("[AuthPage] No session after signup - auto-confirm may be disabled"),localStorage.setItem("registeringAs",b),!0}catch(s){throw console.error("[AuthPage] Signup error:",s),d.error(s.message||"Failed to create account"),s}finally{t(!1),console.log("[AuthPage] Signup process completed")}},y=async a=>{try{console.log("[AuthPage] Starting password reset process..."),t(!0);const r=window.location.hostname,n=r.includes("preview--")?r.replace("preview--",""):r,l=window.location.protocol,b=window.location.port?`:${window.location.port}`:"",P=`${`${l}//${n}${b}`}/auth/reset-password`;console.log("[AuthPage] Using reset password redirect URL:",P);const{error:N}=await L.auth.resetPasswordForEmail(a,{redirectTo:P});if(N)throw console.error("[AuthPage] Password reset error:",N.message),N;console.log("[AuthPage] Password reset email sent successfully"),d.success("Password reset email sent. Please check your inbox."),g(!1)}catch(r){throw console.error("[AuthPage] Password reset error:",r),d.error(r.message||"Failed to send password reset email"),r}finally{t(!1),console.log("[AuthPage] Password reset process completed")}},m=a=>{j(a),g(!0)};return u?null:e.jsx("div",{className:"container flex items-center justify-center py-20",children:e.jsxs(I,{className:"w-full max-w-md",children:[e.jsxs(D,{children:[e.jsx(Y,{className:"text-2xl text-center",children:"Welcome"}),e.jsx(M,{className:"text-center",children:h?"Reset your password":"Sign in to your account or create a new one"})]}),e.jsx(B,{children:h?e.jsx(H,{onSubmit:y,onBack:()=>g(!1),email:p,isLoading:w}):e.jsxs(W,{value:f,onValueChange:v,className:"w-full",children:[e.jsxs(z,{className:"grid w-full grid-cols-2 mb-6",children:[e.jsx(R,{value:"login",children:"Login"}),e.jsx(R,{value:"signup",children:"Sign Up"})]}),e.jsx(E,{value:"login",children:e.jsx(Z,{onSubmit:i,isLoading:w,onForgotPassword:m})}),e.jsx(E,{value:"signup",children:e.jsx(ee,{onSubmit:A,isLoading:w})})]})}),e.jsxs(V,{className:"flex justify-center text-sm text-muted-foreground",children:["Tavara © ",new Date().getFullYear()]})]})})}export{me as default};
