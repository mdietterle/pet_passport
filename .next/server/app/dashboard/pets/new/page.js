(()=>{var e={};e.id=454,e.ids=[454],e.modules={47849:e=>{"use strict";e.exports=require("next/dist/client/components/action-async-storage.external")},72934:e=>{"use strict";e.exports=require("next/dist/client/components/action-async-storage.external.js")},55403:e=>{"use strict";e.exports=require("next/dist/client/components/request-async-storage.external")},54580:e=>{"use strict";e.exports=require("next/dist/client/components/request-async-storage.external.js")},94749:e=>{"use strict";e.exports=require("next/dist/client/components/static-generation-async-storage.external")},45869:e=>{"use strict";e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},20399:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},34639:(e,a,r)=>{"use strict";r.r(a),r.d(a,{GlobalError:()=>i.a,__next_app__:()=>m,originalPathname:()=>p,pages:()=>d,routeModule:()=>u,tree:()=>c}),r(54086),r(40968),r(4906),r(32029),r(35866);var s=r(23191),t=r(88716),n=r(37922),i=r.n(n),l=r(95231),o={};for(let e in l)0>["default","tree","pages","GlobalError","originalPathname","__next_app__","routeModule"].indexOf(e)&&(o[e]=()=>l[e]);r.d(a,o);let c=["",{children:["dashboard",{children:["pets",{children:["new",{children:["__PAGE__",{},{page:[()=>Promise.resolve().then(r.bind(r,54086)),"C:\\Users\\martim.dietterle\\Documents\\pet_passport\\src\\app\\dashboard\\pets\\new\\page.tsx"]}]},{}]},{}]},{layout:[()=>Promise.resolve().then(r.bind(r,40968)),"C:\\Users\\martim.dietterle\\Documents\\pet_passport\\src\\app\\dashboard\\layout.tsx"],error:[()=>Promise.resolve().then(r.bind(r,4906)),"C:\\Users\\martim.dietterle\\Documents\\pet_passport\\src\\app\\dashboard\\error.tsx"]}]},{layout:[()=>Promise.resolve().then(r.bind(r,32029)),"C:\\Users\\martim.dietterle\\Documents\\pet_passport\\src\\app\\layout.tsx"],"not-found":[()=>Promise.resolve().then(r.t.bind(r,35866,23)),"next/dist/client/components/not-found-error"]}],d=["C:\\Users\\martim.dietterle\\Documents\\pet_passport\\src\\app\\dashboard\\pets\\new\\page.tsx"],p="/dashboard/pets/new/page",m={require:r,loadChunk:()=>Promise.resolve()},u=new s.AppPageRouteModule({definition:{kind:t.x.APP_PAGE,page:"/dashboard/pets/new/page",pathname:"/dashboard/pets/new",bundlePath:"",filename:"",appPaths:[]},userland:{loaderTree:c}})},62449:(e,a,r)=>{Promise.resolve().then(r.bind(r,43932))},86333:(e,a,r)=>{"use strict";r.d(a,{Z:()=>s});/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,r(62881).Z)("ArrowLeft",[["path",{d:"m12 19-7-7 7-7",key:"1l729n"}],["path",{d:"M19 12H5",key:"x3x0zl"}]])},77506:(e,a,r)=>{"use strict";r.d(a,{Z:()=>s});/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,r(62881).Z)("LoaderCircle",[["path",{d:"M21 12a9 9 0 1 1-6.219-8.56",key:"13zald"}]])},43932:(e,a,r)=>{"use strict";r.r(a),r.d(a,{default:()=>m});var s=r(10326),t=r(17577),n=r(35047),i=r(90434),l=r(69701),o=r(86333),c=r(77506),d=r(86810),p=r(66941);function m(){let e=(0,n.useRouter)(),a=(0,l.e)(),[r,m]=(0,t.useState)(!1),[u,h]=(0,t.useState)(""),[x,g]=(0,t.useState)({name:"",species:"dog",breed:"",birth_date:"",sex:"unknown",weight_kg:"",microchip:"",color:"",notes:""});function b(e){g(a=>({...a,[e.target.name]:e.target.value}))}async function f(r){r.preventDefault(),m(!0),h("");let{data:{user:s}}=await a.auth.getUser();if(!s){e.push("/login");return}let{data:t}=await a.from("profiles").select("*, plans(*)").eq("id",s.id).single();if(!t){let{data:e}=await a.from("plans").select("id").eq("name","free").single();await a.from("profiles").insert({id:s.id,full_name:s.user_metadata?.full_name||null,plan_id:e?.id||null});let{data:r}=await a.from("profiles").select("*, plans(*)").eq("id",s.id).single();t=r}let n=t?.plans;if(n&&null!==n.max_pets){let{count:e}=await a.from("pets").select("*",{count:"exact",head:!0}).eq("owner_id",s.id).eq("is_active",!0);if(null!==e&&e>=n.max_pets){h(`Limite de ${n.max_pets} pet(s) atingido no seu plano. Fa\xe7a upgrade para adicionar mais.`),m(!1);return}}let{data:i,error:l}=await a.from("pets").insert({owner_id:s.id,name:x.name,species:x.species,breed:x.breed||null,birth_date:x.birth_date||null,sex:x.sex,weight_kg:x.weight_kg?parseFloat(x.weight_kg):null,microchip:x.microchip||null,color:x.color||null,notes:x.notes||null}).select().single();l?(h("Erro ao cadastrar pet. Tente novamente."),m(!1)):e.push(`/dashboard/pets/${i.id}`)}return(0,s.jsxs)("div",{className:"page-container",children:[(0,s.jsxs)("div",{className:"page-header",children:[(0,s.jsxs)(i.default,{href:"/dashboard/pets",className:"btn btn-ghost btn-sm",style:{marginBottom:"var(--space-3)"},children:[s.jsx(o.Z,{size:16})," Voltar"]}),s.jsx("h1",{className:"page-title",children:"Cadastrar Novo Pet"}),s.jsx("p",{className:"page-subtitle",children:"Preencha as informa\xe7\xf5es b\xe1sicas do seu pet"})]}),s.jsx("div",{className:"card",style:{maxWidth:640},children:(0,s.jsxs)("form",{onSubmit:f,style:{display:"flex",flexDirection:"column",gap:"var(--space-5)"},children:[u&&(0,s.jsxs)("div",{className:"alert alert-error",children:[s.jsx("span",{children:"⚠️"}),s.jsx("span",{children:u})]}),(0,s.jsxs)("div",{className:"form-grid",children:[(0,s.jsxs)("div",{className:"form-group form-full",children:[s.jsx("label",{className:"form-label",htmlFor:"name",children:"Nome do pet *"}),s.jsx("input",{id:"name",name:"name",className:"form-input",placeholder:"Ex: Rex, Mimi...",value:x.name,onChange:b,required:!0})]}),(0,s.jsxs)("div",{className:"form-group",children:[s.jsx("label",{className:"form-label",htmlFor:"species",children:"Esp\xe9cie *"}),s.jsx("select",{id:"species",name:"species",className:"form-select",value:x.species,onChange:b,required:!0,children:Object.entries(d.$9).map(([e,a])=>s.jsx("option",{value:e,children:a},e))})]}),(0,s.jsxs)("div",{className:"form-group",children:[s.jsx("label",{className:"form-label",htmlFor:"breed",children:"Ra\xe7a"}),s.jsx("input",{id:"breed",name:"breed",className:"form-input",placeholder:"Ex: Labrador, Siam\xeas...",value:x.breed,onChange:b})]}),(0,s.jsxs)("div",{className:"form-group",children:[s.jsx("label",{className:"form-label",htmlFor:"birth_date",children:"Data de nascimento"}),s.jsx("input",{id:"birth_date",name:"birth_date",type:"date",className:"form-input",value:x.birth_date,onChange:b,max:new Date().toISOString().split("T")[0]})]}),(0,s.jsxs)("div",{className:"form-group",children:[s.jsx("label",{className:"form-label",htmlFor:"sex",children:"Sexo"}),s.jsx("select",{id:"sex",name:"sex",className:"form-select",value:x.sex,onChange:b,children:Object.entries(d.Zn).map(([e,a])=>s.jsx("option",{value:e,children:a},e))})]}),(0,s.jsxs)("div",{className:"form-group",children:[s.jsx("label",{className:"form-label",htmlFor:"weight_kg",children:"Peso (kg)"}),s.jsx("input",{id:"weight_kg",name:"weight_kg",type:"number",step:"0.1",min:"0",className:"form-input",placeholder:"Ex: 4.5",value:x.weight_kg,onChange:b})]}),(0,s.jsxs)("div",{className:"form-group",children:[s.jsx("label",{className:"form-label",htmlFor:"color",children:"Cor / pelagem"}),s.jsx("input",{id:"color",name:"color",className:"form-input",placeholder:"Ex: Caramelo, Preto e branco...",value:x.color,onChange:b})]}),(0,s.jsxs)("div",{className:"form-group",children:[s.jsx("label",{className:"form-label",htmlFor:"microchip",children:"Microchip"}),s.jsx("input",{id:"microchip",name:"microchip",className:"form-input",placeholder:"N\xfamero do microchip",value:x.microchip,onChange:b})]}),(0,s.jsxs)("div",{className:"form-group form-full",children:[s.jsx("label",{className:"form-label",htmlFor:"notes",children:"Observa\xe7\xf5es"}),s.jsx("textarea",{id:"notes",name:"notes",className:"form-textarea",placeholder:"Informa\xe7\xf5es adicionais sobre o pet...",value:x.notes,onChange:b,rows:3})]})]}),(0,s.jsxs)("div",{style:{display:"flex",gap:"var(--space-3)",justifyContent:"flex-end"},children:[s.jsx(i.default,{href:"/dashboard/pets",className:"btn btn-secondary",children:"Cancelar"}),s.jsx("button",{type:"submit",className:"btn btn-primary",disabled:r,children:r?(0,s.jsxs)(s.Fragment,{children:[s.jsx(c.Z,{size:16,className:"animate-spin"})," Salvando..."]}):"Cadastrar Pet"})]})]})}),s.jsx("div",{style:{maxWidth:640,marginTop:"var(--space-4)"},children:s.jsx(p.Z,{})})]})}},66941:(e,a,r)=>{"use strict";r.d(a,{Z:()=>i});var s=r(10326);r(17577);var t=r(60763);/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let n=(0,r(62881).Z)("ExternalLink",[["path",{d:"M15 3h6v6",key:"1q9fwt"}],["path",{d:"M10 14 21 3",key:"gplh6r"}],["path",{d:"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",key:"a6xqqp"}]]);function i(){return(0,s.jsxs)("div",{className:"rg-animal-banner",children:[s.jsx("div",{className:"rg-banner-icon",children:s.jsx(t.Z,{size:28})}),(0,s.jsxs)("div",{className:"rg-banner-content",children:[s.jsx("h3",{className:"rg-banner-title",children:"RG Animal Oficial (Sinpatinhas)"}),s.jsx("p",{className:"rg-banner-desc",children:"O Governo Federal oferece a emiss\xe3o oficial do RG do seu pet pelo sistema Sinpatinhas. Aproveite para manter a documenta\xe7\xe3o do seu melhor amigo em dia."})]}),(0,s.jsxs)("a",{href:"https://sinpatinhas.mma.gov.br/login",target:"_blank",rel:"noopener noreferrer",className:"btn btn-primary btn-sm rg-banner-btn",children:[s.jsx("span",{children:"Emitir no Sinpatinhas"}),s.jsx(n,{size:14})]}),s.jsx("style",{children:`
        .rg-animal-banner {
          display: flex;
          align-items: center;
          gap: var(--space-4);
          background: linear-gradient(to right, rgba(16, 185, 129, 0.1), rgba(4, 120, 87, 0.05));
          border: 1px solid rgba(16, 185, 129, 0.3);
          border-radius: var(--radius-lg);
          padding: var(--space-4);
          margin-bottom: var(--space-5);
        }
        .rg-banner-icon {
          color: var(--color-orange);
          background: rgba(16, 185, 129, 0.15);
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .rg-banner-content {
          flex: 1;
        }
        .rg-banner-title {
          font-size: 1rem;
          font-weight: 600;
          color: var(--color-orange-dark);
          margin-bottom: 2px;
        }
        .rg-banner-desc {
          font-size: 0.85rem;
          line-height: 1.4;
          color: var(--color-text-secondary);
        }
        .rg-banner-btn {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
        }
        
        @media (max-width: 600px) {
          .rg-animal-banner {
            flex-direction: column;
            text-align: center;
            padding: var(--space-5) var(--space-4);
          }
          .rg-banner-btn {
            width: 100%;
            justify-content: center;
            margin-top: var(--space-2);
          }
        }
      `})]})}},86810:(e,a,r)=>{"use strict";function s(e,a,r,s,t){let n=null===e.max_pets||a<e.max_pets;return{canAddPet:n,canAddVaccination:null===e.max_vaccinations_per_pet||r<e.max_vaccinations_per_pet,canAddConsultation:null===e.max_consultations_per_pet||s<e.max_consultations_per_pet,canAddOccurrence:null===e.max_occurrences_per_pet||t<e.max_occurrences_per_pet,petsRemaining:null===e.max_pets?null:Math.max(0,e.max_pets-a),vaccinationsRemaining:null===e.max_vaccinations_per_pet?null:Math.max(0,e.max_vaccinations_per_pet-r),consultationsRemaining:null===e.max_consultations_per_pet?null:Math.max(0,e.max_consultations_per_pet-s),occurrencesRemaining:null===e.max_occurrences_per_pet?null:Math.max(0,e.max_occurrences_per_pet-t)}}r.d(a,{$9:()=>n,Hr:()=>t,Zn:()=>i,hH:()=>s});let t={food_purchase:"\uD83D\uDED2 Compra de Ra\xe7\xe3o",grooming:"✂️ Tosa",bath:"\uD83D\uDEC1 Banho",vomit:"\uD83E\uDD22 V\xf4mito",diarrhea:"\uD83D\uDC8A Diarreia",injury:"\uD83E\uDE79 Machucado",medication:"\uD83D\uDC89 Medica\xe7\xe3o",other:"\uD83D\uDCDD Outro"},n={dog:"\uD83D\uDC36 Cachorro",cat:"\uD83D\uDC31 Gato",bird:"\uD83D\uDC26 P\xe1ssaro",rabbit:"\uD83D\uDC30 Coelho",fish:"\uD83D\uDC1F Peixe",reptile:"\uD83E\uDD8E R\xe9ptil",other:"\uD83D\uDC3E Outro"},i={male:"Macho",female:"F\xeamea",unknown:"N\xe3o informado"}},54086:(e,a,r)=>{"use strict";r.r(a),r.d(a,{$$typeof:()=>i,__esModule:()=>n,default:()=>l});var s=r(68570);let t=(0,s.createProxy)(String.raw`C:\Users\martim.dietterle\Documents\pet_passport\src\app\dashboard\pets\new\page.tsx`),{__esModule:n,$$typeof:i}=t;t.default;let l=(0,s.createProxy)(String.raw`C:\Users\martim.dietterle\Documents\pet_passport\src\app\dashboard\pets\new\page.tsx#default`)}};var a=require("../../../../webpack-runtime.js");a.C(e);var r=e=>a(a.s=e),s=a.X(0,[948,336,355,471,404,127,706,268],()=>r(34639));module.exports=s})();