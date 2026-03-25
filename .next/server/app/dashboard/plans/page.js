(()=>{var e={};e.id=726,e.ids=[726],e.modules={47849:e=>{"use strict";e.exports=require("next/dist/client/components/action-async-storage.external")},72934:e=>{"use strict";e.exports=require("next/dist/client/components/action-async-storage.external.js")},55403:e=>{"use strict";e.exports=require("next/dist/client/components/request-async-storage.external")},54580:e=>{"use strict";e.exports=require("next/dist/client/components/request-async-storage.external.js")},94749:e=>{"use strict";e.exports=require("next/dist/client/components/static-generation-async-storage.external")},45869:e=>{"use strict";e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},20399:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},90060:(e,r,a)=>{"use strict";a.r(r),a.d(r,{GlobalError:()=>n.a,__next_app__:()=>u,originalPathname:()=>p,pages:()=>d,routeModule:()=>m,tree:()=>c}),a(88124),a(40968),a(4906),a(32029),a(35866);var t=a(23191),s=a(88716),o=a(37922),n=a.n(o),l=a(95231),i={};for(let e in l)0>["default","tree","pages","GlobalError","originalPathname","__next_app__","routeModule"].indexOf(e)&&(i[e]=()=>l[e]);a.d(r,i);let c=["",{children:["dashboard",{children:["plans",{children:["__PAGE__",{},{page:[()=>Promise.resolve().then(a.bind(a,88124)),"C:\\Users\\martim.dietterle\\Documents\\pet_passport\\src\\app\\dashboard\\plans\\page.tsx"]}]},{}]},{layout:[()=>Promise.resolve().then(a.bind(a,40968)),"C:\\Users\\martim.dietterle\\Documents\\pet_passport\\src\\app\\dashboard\\layout.tsx"],error:[()=>Promise.resolve().then(a.bind(a,4906)),"C:\\Users\\martim.dietterle\\Documents\\pet_passport\\src\\app\\dashboard\\error.tsx"]}]},{layout:[()=>Promise.resolve().then(a.bind(a,32029)),"C:\\Users\\martim.dietterle\\Documents\\pet_passport\\src\\app\\layout.tsx"],"not-found":[()=>Promise.resolve().then(a.t.bind(a,35866,23)),"next/dist/client/components/not-found-error"]}],d=["C:\\Users\\martim.dietterle\\Documents\\pet_passport\\src\\app\\dashboard\\plans\\page.tsx"],p="/dashboard/plans/page",u={require:a,loadChunk:()=>Promise.resolve()},m=new t.AppPageRouteModule({definition:{kind:s.x.APP_PAGE,page:"/dashboard/plans/page",pathname:"/dashboard/plans",bundlePath:"",filename:"",appPaths:[]},userland:{loaderTree:c}})},35303:()=>{},27162:(e,r,a)=>{"use strict";a.d(r,{Z:()=>i});var t=a(71159);/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),o=(...e)=>e.filter((e,r,a)=>!!e&&a.indexOf(e)===r).join(" ");/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var n={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let l=(0,t.forwardRef)(({color:e="currentColor",size:r=24,strokeWidth:a=2,absoluteStrokeWidth:s,className:l="",children:i,iconNode:c,...d},p)=>(0,t.createElement)("svg",{ref:p,...n,width:r,height:r,stroke:e,strokeWidth:s?24*Number(a)/Number(r):a,className:o("lucide",l),...d},[...c.map(([e,r])=>(0,t.createElement)(e,r)),...Array.isArray(i)?i:[i]])),i=(e,r)=>{let a=(0,t.forwardRef)(({className:a,...n},i)=>(0,t.createElement)(l,{ref:i,iconNode:r,className:o(`lucide-${s(e)}`,a),...n}));return a.displayName=`${e}`,a}},88124:(e,r,a)=>{"use strict";a.r(r),a.d(r,{default:()=>p});var t=a(19510),s=a(58585),o=a(65655),n=a(27162);/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let l=(0,n.Z)("Zap",[["path",{d:"M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z",key:"1xq2db"}]]),i=(0,n.Z)("Check",[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]]),c={free:"var(--color-gray)",basic:"var(--color-orange)",pro:"var(--color-gold-dark)",premium:"var(--color-primary)"},d={free:"\uD83D\uDC3E",basic:"⭐",pro:"\uD83D\uDE80",premium:"\uD83D\uDC51"};async function p({searchParams:e}){let r=(0,o.e)(),{data:{user:a}}=await r.auth.getUser();a||(0,s.redirect)("/login");let{data:n}=await r.from("profiles").select("*, plans(*)").eq("id",a.id).single(),{data:p}=await r.from("plans").select("*").order("sort_order",{ascending:!0}),u=n?.plans;return(0,t.jsxs)("div",{className:"page-container",children:[(0,t.jsxs)("div",{className:"page-header",style:{textAlign:"center"},children:[t.jsx("h1",{className:"page-title",children:"Escolha seu Plano"}),(0,t.jsxs)("p",{className:"page-subtitle",children:["Plano atual: ",t.jsx("strong",{style:{color:"var(--color-orange-light)"},children:u?.display_name||"Gratuito"})]}),"true"===e.stripe_success&&t.jsx("div",{style:{background:"rgba(74, 222, 128, 0.1)",color:"#4ade80",padding:"1rem",borderRadius:"8px",marginTop:"1rem",border:"1px solid #4ade80"},children:"\uD83C\uDF89 Checkout iniciado. Seu plano ser\xe1 atualizado assim que o pagamento for confirmado!"}),"true"===e.stripe_canceled&&t.jsx("div",{style:{background:"rgba(239, 68, 68, 0.1)",color:"#ef4444",padding:"1rem",borderRadius:"8px",marginTop:"1rem",border:"1px solid #ef4444"},children:"⚠️ Pagamento cancelado ou n\xe3o conclu\xeddo."})]}),t.jsx("div",{className:"plans-grid",children:(p||[]).map(e=>{let r=u?.id===e.id;c[e.name];let a=Array.isArray(e.features)?e.features:[];return(0,t.jsxs)("div",{className:`plan-card ${r?"plan-card-current":""} ${"pro"===e.name?"plan-card-featured":""}`,children:["pro"===e.name&&(0,t.jsxs)("div",{className:"plan-badge-popular",children:[t.jsx(l,{size:12})," Mais popular"]}),r&&t.jsx("div",{className:"plan-badge-current",children:"Plano atual"}),t.jsx("div",{className:"plan-icon",children:d[e.name]}),t.jsx("h2",{className:"plan-name",children:e.display_name}),t.jsx("div",{className:"plan-price",children:0===e.price_brl?t.jsx("span",{className:"plan-price-value",children:"Gr\xe1tis"}):(0,t.jsxs)(t.Fragment,{children:[t.jsx("span",{className:"plan-price-currency",children:"R$"}),t.jsx("span",{className:"plan-price-value",children:e.price_brl.toFixed(2).replace(".",",")}),t.jsx("span",{className:"plan-price-period",children:"/m\xeas"})]})}),t.jsx("ul",{className:"plan-features",children:a.map((e,r)=>(0,t.jsxs)("li",{className:"plan-feature",children:[t.jsx(i,{size:14,className:"plan-feature-check"}),t.jsx("span",{children:e})]},r))}),t.jsx("div",{className:"plan-cta",children:r?t.jsx("button",{className:"btn btn-secondary",style:{width:"100%",justifyContent:"center"},disabled:!0,children:"Plano atual"}):0===e.price_brl?t.jsx("button",{className:"btn btn-secondary",style:{width:"100%",justifyContent:"center"},disabled:!0,children:"Plano gratuito"}):t.jsx("div",{style:{display:"flex",flexDirection:"column",gap:"var(--space-2)",width:"100%"},children:(0,t.jsxs)("form",{action:"/api/stripe/checkout",method:"POST",style:{width:"100%"},children:[t.jsx("input",{type:"hidden",name:"planId",value:e.id}),t.jsx("button",{type:"submit",className:"btn btn-secondary",style:{width:"100%",justifyContent:"center",borderColor:"var(--color-indigo)",color:"var(--color-indigo)",padding:"10px 4px",fontSize:"1rem",fontWeight:"bold"},children:"\uD83D\uDCB3 Assinar com Stripe"})]})})})]},e.id)})}),t.jsx("div",{className:"plans-note",children:t.jsx("p",{children:"✨ Pagamentos de PIX e Cart\xe3o processados com seguran\xe7a pelo Stripe."})}),t.jsx("style",{children:`
        .plans-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: var(--space-5);
          margin-bottom: var(--space-8);
        }
        .plan-card {
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-xl);
          padding: var(--space-6);
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
          position: relative;
          transition: all var(--transition-base);
        }
        .plan-card:hover {
          border-color: var(--color-border-hover);
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
        }
        .plan-card-current {
          border-color: var(--color-orange);
          box-shadow: 0 0 24px var(--color-orange-glow);
        }
        .plan-card-featured {
          border-color: var(--color-gold);
          background: linear-gradient(180deg, rgba(245,158,11,0.05) 0%, var(--color-bg-secondary) 100%);
        }
        .plan-badge-popular {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, var(--color-gold-dark), var(--color-gold));
          color: #000;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 4px 14px;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          gap: 4px;
          white-space: nowrap;
        }
        .plan-badge-current {
          position: absolute;
          top: -12px;
          right: var(--space-4);
          background: var(--color-orange);
          color: white;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: var(--radius-full);
        }
        .plan-icon {
          font-size: 2rem;
          text-align: center;
        }
        .plan-name {
          font-size: 1.2rem;
          font-weight: 700;
          text-align: center;
        }
        .plan-price {
          text-align: center;
          display: flex;
          align-items: baseline;
          justify-content: center;
          gap: 2px;
        }
        .plan-price-currency {
          font-size: 1rem;
          color: var(--color-text-secondary);
        }
        .plan-price-value {
          font-size: 2rem;
          font-weight: 800;
          color: var(--color-text);
        }
        .plan-price-period {
          font-size: 0.85rem;
          color: var(--color-text-muted);
        }
        .plan-features {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          flex: 1;
        }
        .plan-feature {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: 0.85rem;
          color: var(--color-text-secondary);
        }
        .plan-feature-check {
          color: var(--color-orange-light);
          flex-shrink: 0;
        }
        .plan-cta { margin-top: auto; }
        .plans-note {
          text-align: center;
          color: var(--color-text-muted);
          font-size: 0.85rem;
        }
      `})]})}}};var r=require("../../../webpack-runtime.js");r.C(e);var a=e=>r(r.s=e),t=r.X(0,[948,336,355,471,404,127,706,268],()=>a(90060));module.exports=t})();