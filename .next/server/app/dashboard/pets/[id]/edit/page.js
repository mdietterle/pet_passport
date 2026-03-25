(()=>{var e={};e.id=829,e.ids=[829],e.modules={47849:e=>{"use strict";e.exports=require("next/dist/client/components/action-async-storage.external")},72934:e=>{"use strict";e.exports=require("next/dist/client/components/action-async-storage.external.js")},55403:e=>{"use strict";e.exports=require("next/dist/client/components/request-async-storage.external")},54580:e=>{"use strict";e.exports=require("next/dist/client/components/request-async-storage.external.js")},94749:e=>{"use strict";e.exports=require("next/dist/client/components/static-generation-async-storage.external")},45869:e=>{"use strict";e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},20399:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},95570:(e,a,t)=>{"use strict";t.r(a),t.d(a,{GlobalError:()=>i.a,__next_app__:()=>m,originalPathname:()=>p,pages:()=>d,routeModule:()=>u,tree:()=>c}),t(76689),t(40968),t(4906),t(32029),t(35866);var s=t(23191),r=t(88716),n=t(37922),i=t.n(n),o=t(95231),l={};for(let e in o)0>["default","tree","pages","GlobalError","originalPathname","__next_app__","routeModule"].indexOf(e)&&(l[e]=()=>o[e]);t.d(a,l);let c=["",{children:["dashboard",{children:["pets",{children:["[id]",{children:["edit",{children:["__PAGE__",{},{page:[()=>Promise.resolve().then(t.bind(t,76689)),"C:\\Users\\martim.dietterle\\Documents\\pet_passport\\src\\app\\dashboard\\pets\\[id]\\edit\\page.tsx"]}]},{}]},{}]},{}]},{layout:[()=>Promise.resolve().then(t.bind(t,40968)),"C:\\Users\\martim.dietterle\\Documents\\pet_passport\\src\\app\\dashboard\\layout.tsx"],error:[()=>Promise.resolve().then(t.bind(t,4906)),"C:\\Users\\martim.dietterle\\Documents\\pet_passport\\src\\app\\dashboard\\error.tsx"]}]},{layout:[()=>Promise.resolve().then(t.bind(t,32029)),"C:\\Users\\martim.dietterle\\Documents\\pet_passport\\src\\app\\layout.tsx"],"not-found":[()=>Promise.resolve().then(t.t.bind(t,35866,23)),"next/dist/client/components/not-found-error"]}],d=["C:\\Users\\martim.dietterle\\Documents\\pet_passport\\src\\app\\dashboard\\pets\\[id]\\edit\\page.tsx"],p="/dashboard/pets/[id]/edit/page",m={require:t,loadChunk:()=>Promise.resolve()},u=new s.AppPageRouteModule({definition:{kind:r.x.APP_PAGE,page:"/dashboard/pets/[id]/edit/page",pathname:"/dashboard/pets/[id]/edit",bundlePath:"",filename:"",appPaths:[]},userland:{loaderTree:c}})},52687:(e,a,t)=>{Promise.resolve().then(t.bind(t,79920))},86333:(e,a,t)=>{"use strict";t.d(a,{Z:()=>s});/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,t(62881).Z)("ArrowLeft",[["path",{d:"m12 19-7-7 7-7",key:"1l729n"}],["path",{d:"M19 12H5",key:"x3x0zl"}]])},51896:(e,a,t)=>{"use strict";t.d(a,{Z:()=>s});/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,t(62881).Z)("Camera",[["path",{d:"M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z",key:"1tc9qg"}],["circle",{cx:"12",cy:"13",r:"3",key:"1vg3eu"}]])},77506:(e,a,t)=>{"use strict";t.d(a,{Z:()=>s});/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,t(62881).Z)("LoaderCircle",[["path",{d:"M21 12a9 9 0 1 1-6.219-8.56",key:"13zald"}]])},98091:(e,a,t)=>{"use strict";t.d(a,{Z:()=>s});/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,t(62881).Z)("Trash2",[["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6",key:"4alrt4"}],["path",{d:"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2",key:"v07s0e"}],["line",{x1:"10",x2:"10",y1:"11",y2:"17",key:"1uufr5"}],["line",{x1:"14",x2:"14",y1:"11",y2:"17",key:"xtxkd"}]])},79920:(e,a,t)=>{"use strict";t.r(a),t.d(a,{default:()=>x});var s=t(10326),r=t(17577),n=t(35047),i=t(90434),o=t(69701),l=t(86333),c=t(51896),d=t(77506),p=t(94019),m=t(98091),u=t(86810),h=t(66941);function x({params:e}){let a=(0,n.useRouter)(),t=(0,o.e)(),[x,g]=(0,r.useState)(!1),[b,f]=(0,r.useState)(!0),[v,j]=(0,r.useState)(""),[y,_]=(0,r.useState)(null),[D,N]=(0,r.useState)(!1),k=(0,r.useRef)(null),[w,C]=(0,r.useState)({name:"",species:"dog",breed:"",birth_date:"",sex:"unknown",weight_kg:"",microchip:"",color:"",notes:""});function P(e){C(a=>({...a,[e.target.name]:e.target.value}))}async function M(a){let s=a.target.files?.[0];if(!s)return;if(!["image/jpeg","image/png","image/webp","image/heic"].includes(s.type)){j("Formato n\xe3o suportado. Use JPG, PNG ou WEBP.");return}if(s.size>5242880){j("Foto muito grande (m\xe1x. 5 MB).");return}N(!0),j("");let r=new FormData;r.append("file",s),r.append("pet_id",e.id);let n=await fetch("/api/upload",{method:"POST",body:r});if(n.ok){let a=await n.json();_(a.url),await t.from("pets").update({photo_url:a.url}).eq("id",e.id)}else j("Erro ao enviar foto. Tente novamente.");N(!1)}async function q(){_(null),await t.from("pets").update({photo_url:null}).eq("id",e.id)}async function E(s){s.preventDefault(),g(!0),j("");let{error:r}=await t.from("pets").update({name:w.name,species:w.species,breed:w.breed||null,birth_date:w.birth_date||null,sex:w.sex,weight_kg:w.weight_kg?parseFloat(w.weight_kg):null,microchip:w.microchip||null,color:w.color||null,notes:w.notes||null}).eq("id",e.id);r?(j("Erro ao salvar. Tente novamente."),g(!1)):a.push(`/dashboard/pets/${e.id}`)}async function Z(){confirm("Tem certeza que deseja remover este pet? Esta a\xe7\xe3o n\xe3o pode ser desfeita.")&&(await t.from("pets").update({is_active:!1}).eq("id",e.id),a.push("/dashboard/pets"))}return b?s.jsx("div",{className:"page-container",children:s.jsx("div",{className:"skeleton",style:{height:400,borderRadius:"var(--radius-lg)"}})}):(0,s.jsxs)("div",{className:"page-container",children:[(0,s.jsxs)("div",{className:"page-header",children:[(0,s.jsxs)(i.default,{href:`/dashboard/pets/${e.id}`,className:"btn btn-ghost btn-sm",style:{marginBottom:"var(--space-3)"},children:[s.jsx(l.Z,{size:16})," Voltar"]}),s.jsx("h1",{className:"page-title",children:"Editar Pet"})]}),s.jsx("div",{className:"card",style:{maxWidth:640},children:(0,s.jsxs)("form",{onSubmit:E,style:{display:"flex",flexDirection:"column",gap:"var(--space-5)"},children:[v&&(0,s.jsxs)("div",{className:"alert alert-error",children:[s.jsx("span",{children:"⚠️"}),s.jsx("span",{children:v})]}),(0,s.jsxs)("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",gap:"var(--space-3)"},children:[(0,s.jsxs)("div",{className:"pet-photo-upload-wrap",children:[y?s.jsx("img",{src:y,alt:"Foto do pet",className:"pet-photo-upload-img"}):s.jsx("div",{className:"pet-photo-upload-placeholder",children:s.jsx(c.Z,{size:32,style:{color:"var(--color-text-muted)"}})}),D&&s.jsx("div",{className:"pet-photo-upload-overlay",children:s.jsx(d.Z,{size:24,className:"animate-spin"})})]}),(0,s.jsxs)("div",{style:{display:"flex",gap:"var(--space-2)"},children:[(0,s.jsxs)("label",{className:"btn btn-secondary btn-sm",style:{cursor:"pointer"},children:[s.jsx(c.Z,{size:14})," ",y?"Trocar foto":"Adicionar foto",s.jsx("input",{ref:k,type:"file",accept:"image/jpeg,image/png,image/webp,image/heic",style:{display:"none"},onChange:M,disabled:D})]}),y&&(0,s.jsxs)("button",{type:"button",className:"btn btn-ghost btn-sm",onClick:q,disabled:D,children:[s.jsx(p.Z,{size:14})," Remover"]})]}),s.jsx("span",{style:{fontSize:"0.75rem",color:"var(--color-text-muted)"},children:"JPG, PNG ou WEBP \xb7 m\xe1x. 5 MB"})]}),(0,s.jsxs)("div",{className:"form-grid",children:[(0,s.jsxs)("div",{className:"form-group form-full",children:[s.jsx("label",{className:"form-label",children:"Nome *"}),s.jsx("input",{name:"name",className:"form-input",value:w.name,onChange:P,required:!0})]}),(0,s.jsxs)("div",{className:"form-group",children:[s.jsx("label",{className:"form-label",children:"Esp\xe9cie *"}),s.jsx("select",{name:"species",className:"form-select",value:w.species,onChange:P,children:Object.entries(u.$9).map(([e,a])=>s.jsx("option",{value:e,children:a},e))})]}),(0,s.jsxs)("div",{className:"form-group",children:[s.jsx("label",{className:"form-label",children:"Ra\xe7a"}),s.jsx("input",{name:"breed",className:"form-input",value:w.breed,onChange:P})]}),(0,s.jsxs)("div",{className:"form-group",children:[s.jsx("label",{className:"form-label",children:"Data de nascimento"}),s.jsx("input",{name:"birth_date",type:"date",className:"form-input",value:w.birth_date,onChange:P,max:new Date().toISOString().split("T")[0]})]}),(0,s.jsxs)("div",{className:"form-group",children:[s.jsx("label",{className:"form-label",children:"Sexo"}),s.jsx("select",{name:"sex",className:"form-select",value:w.sex,onChange:P,children:Object.entries(u.Zn).map(([e,a])=>s.jsx("option",{value:e,children:a},e))})]}),(0,s.jsxs)("div",{className:"form-group",children:[s.jsx("label",{className:"form-label",children:"Peso (kg)"}),s.jsx("input",{name:"weight_kg",type:"number",step:"0.1",min:"0",className:"form-input",value:w.weight_kg,onChange:P})]}),(0,s.jsxs)("div",{className:"form-group",children:[s.jsx("label",{className:"form-label",children:"Cor / pelagem"}),s.jsx("input",{name:"color",className:"form-input",value:w.color,onChange:P})]}),(0,s.jsxs)("div",{className:"form-group",children:[s.jsx("label",{className:"form-label",children:"Microchip"}),s.jsx("input",{name:"microchip",className:"form-input",value:w.microchip,onChange:P})]}),(0,s.jsxs)("div",{className:"form-group form-full",children:[s.jsx("label",{className:"form-label",children:"Observa\xe7\xf5es"}),s.jsx("textarea",{name:"notes",className:"form-textarea",rows:3,value:w.notes,onChange:P})]})]}),(0,s.jsxs)("div",{style:{display:"flex",gap:"var(--space-3)",justifyContent:"space-between",alignItems:"center"},children:[(0,s.jsxs)("button",{type:"button",className:"btn btn-danger btn-sm",onClick:Z,children:[s.jsx(m.Z,{size:14})," Remover pet"]}),(0,s.jsxs)("div",{style:{display:"flex",gap:"var(--space-3)"},children:[s.jsx(i.default,{href:`/dashboard/pets/${e.id}`,className:"btn btn-secondary",children:"Cancelar"}),s.jsx("button",{type:"submit",className:"btn btn-primary",disabled:x,children:x?(0,s.jsxs)(s.Fragment,{children:[s.jsx(d.Z,{size:16,className:"animate-spin"})," Salvando..."]}):"Salvar altera\xe7\xf5es"})]})]})]})}),s.jsx("div",{style:{maxWidth:640,marginTop:"var(--space-4)"},children:s.jsx(h.Z,{})}),s.jsx("style",{children:`
                .pet-photo-upload-wrap {
                    position: relative;
                    width: 120px;
                    height: 120px;
                    border-radius: 50%;
                    overflow: hidden;
                    border: 3px solid var(--color-border);
                    background: var(--color-bg-tertiary);
                    flex-shrink: 0;
                }
                .pet-photo-upload-img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .pet-photo-upload-placeholder {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .pet-photo-upload-overlay {
                    position: absolute;
                    inset: 0;
                    background: rgba(0,0,0,0.45);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                }
            `})]})}},66941:(e,a,t)=>{"use strict";t.d(a,{Z:()=>i});var s=t(10326);t(17577);var r=t(60763);/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let n=(0,t(62881).Z)("ExternalLink",[["path",{d:"M15 3h6v6",key:"1q9fwt"}],["path",{d:"M10 14 21 3",key:"gplh6r"}],["path",{d:"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",key:"a6xqqp"}]]);function i(){return(0,s.jsxs)("div",{className:"rg-animal-banner",children:[s.jsx("div",{className:"rg-banner-icon",children:s.jsx(r.Z,{size:28})}),(0,s.jsxs)("div",{className:"rg-banner-content",children:[s.jsx("h3",{className:"rg-banner-title",children:"RG Animal Oficial (Sinpatinhas)"}),s.jsx("p",{className:"rg-banner-desc",children:"O Governo Federal oferece a emiss\xe3o oficial do RG do seu pet pelo sistema Sinpatinhas. Aproveite para manter a documenta\xe7\xe3o do seu melhor amigo em dia."})]}),(0,s.jsxs)("a",{href:"https://sinpatinhas.mma.gov.br/login",target:"_blank",rel:"noopener noreferrer",className:"btn btn-primary btn-sm rg-banner-btn",children:[s.jsx("span",{children:"Emitir no Sinpatinhas"}),s.jsx(n,{size:14})]}),s.jsx("style",{children:`
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
      `})]})}},86810:(e,a,t)=>{"use strict";function s(e,a,t,s,r){let n=null===e.max_pets||a<e.max_pets;return{canAddPet:n,canAddVaccination:null===e.max_vaccinations_per_pet||t<e.max_vaccinations_per_pet,canAddConsultation:null===e.max_consultations_per_pet||s<e.max_consultations_per_pet,canAddOccurrence:null===e.max_occurrences_per_pet||r<e.max_occurrences_per_pet,petsRemaining:null===e.max_pets?null:Math.max(0,e.max_pets-a),vaccinationsRemaining:null===e.max_vaccinations_per_pet?null:Math.max(0,e.max_vaccinations_per_pet-t),consultationsRemaining:null===e.max_consultations_per_pet?null:Math.max(0,e.max_consultations_per_pet-s),occurrencesRemaining:null===e.max_occurrences_per_pet?null:Math.max(0,e.max_occurrences_per_pet-r)}}t.d(a,{$9:()=>n,Hr:()=>r,Zn:()=>i,hH:()=>s});let r={food_purchase:"\uD83D\uDED2 Compra de Ra\xe7\xe3o",grooming:"✂️ Tosa",bath:"\uD83D\uDEC1 Banho",vomit:"\uD83E\uDD22 V\xf4mito",diarrhea:"\uD83D\uDC8A Diarreia",injury:"\uD83E\uDE79 Machucado",medication:"\uD83D\uDC89 Medica\xe7\xe3o",other:"\uD83D\uDCDD Outro"},n={dog:"\uD83D\uDC36 Cachorro",cat:"\uD83D\uDC31 Gato",bird:"\uD83D\uDC26 P\xe1ssaro",rabbit:"\uD83D\uDC30 Coelho",fish:"\uD83D\uDC1F Peixe",reptile:"\uD83E\uDD8E R\xe9ptil",other:"\uD83D\uDC3E Outro"},i={male:"Macho",female:"F\xeamea",unknown:"N\xe3o informado"}},76689:(e,a,t)=>{"use strict";t.r(a),t.d(a,{$$typeof:()=>i,__esModule:()=>n,default:()=>o});var s=t(68570);let r=(0,s.createProxy)(String.raw`C:\Users\martim.dietterle\Documents\pet_passport\src\app\dashboard\pets\[id]\edit\page.tsx`),{__esModule:n,$$typeof:i}=r;r.default;let o=(0,s.createProxy)(String.raw`C:\Users\martim.dietterle\Documents\pet_passport\src\app\dashboard\pets\[id]\edit\page.tsx#default`)}};var a=require("../../../../../webpack-runtime.js");a.C(e);var t=e=>a(a.s=e),s=a.X(0,[948,336,355,471,404,127,706,268],()=>t(95570));module.exports=s})();