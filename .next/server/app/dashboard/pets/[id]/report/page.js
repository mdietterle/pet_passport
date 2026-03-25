(()=>{var e={};e.id=978,e.ids=[978],e.modules={47849:e=>{"use strict";e.exports=require("next/dist/client/components/action-async-storage.external")},72934:e=>{"use strict";e.exports=require("next/dist/client/components/action-async-storage.external.js")},55403:e=>{"use strict";e.exports=require("next/dist/client/components/request-async-storage.external")},54580:e=>{"use strict";e.exports=require("next/dist/client/components/request-async-storage.external.js")},94749:e=>{"use strict";e.exports=require("next/dist/client/components/static-generation-async-storage.external")},45869:e=>{"use strict";e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},20399:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},95260:(e,t,s)=>{"use strict";s.r(t),s.d(t,{GlobalError:()=>n.a,__next_app__:()=>m,originalPathname:()=>p,pages:()=>c,routeModule:()=>x,tree:()=>d}),s(74979),s(40968),s(4906),s(32029),s(35866);var r=s(23191),a=s(88716),i=s(37922),n=s.n(i),l=s(95231),o={};for(let e in l)0>["default","tree","pages","GlobalError","originalPathname","__next_app__","routeModule"].indexOf(e)&&(o[e]=()=>l[e]);s.d(t,o);let d=["",{children:["dashboard",{children:["pets",{children:["[id]",{children:["report",{children:["__PAGE__",{},{page:[()=>Promise.resolve().then(s.bind(s,74979)),"C:\\Users\\martim.dietterle\\Documents\\pet_passport\\src\\app\\dashboard\\pets\\[id]\\report\\page.tsx"]}]},{}]},{}]},{}]},{layout:[()=>Promise.resolve().then(s.bind(s,40968)),"C:\\Users\\martim.dietterle\\Documents\\pet_passport\\src\\app\\dashboard\\layout.tsx"],error:[()=>Promise.resolve().then(s.bind(s,4906)),"C:\\Users\\martim.dietterle\\Documents\\pet_passport\\src\\app\\dashboard\\error.tsx"]}]},{layout:[()=>Promise.resolve().then(s.bind(s,32029)),"C:\\Users\\martim.dietterle\\Documents\\pet_passport\\src\\app\\layout.tsx"],"not-found":[()=>Promise.resolve().then(s.t.bind(s,35866,23)),"next/dist/client/components/not-found-error"]}],c=["C:\\Users\\martim.dietterle\\Documents\\pet_passport\\src\\app\\dashboard\\pets\\[id]\\report\\page.tsx"],p="/dashboard/pets/[id]/report/page",m={require:s,loadChunk:()=>Promise.resolve()},x=new r.AppPageRouteModule({definition:{kind:a.x.APP_PAGE,page:"/dashboard/pets/[id]/report/page",pathname:"/dashboard/pets/[id]/report",bundlePath:"",filename:"",appPaths:[]},userland:{loaderTree:d}})},23812:(e,t,s)=>{Promise.resolve().then(s.t.bind(s,79404,23)),Promise.resolve().then(s.bind(s,47557))},47557:(e,t,s)=>{"use strict";s.d(t,{default:()=>p});var r=s(10326),a=s(17577);/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let i=(0,s(62881).Z)("Printer",[["path",{d:"M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2",key:"143wyd"}],["path",{d:"M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6",key:"1itne7"}],["rect",{x:"6",y:"14",width:"12",height:"8",rx:"1",key:"1ue0tg"}]]);var n=s(40927);let l={dog:"C\xe3o",cat:"Gato",bird:"Ave",rabbit:"Coelho",fish:"Peixe",reptile:"R\xe9ptil",other:"Outro"},o={male:"Macho",female:"F\xeamea",unknown:"N\xe3o informado"},d={grooming:"Banho/Tosa",injury:"Les\xe3o",surgery:"Cirurgia",hospitalization:"Interna\xe7\xe3o",medication:"Medica\xe7\xe3o",other:"Outro"};function c(e,t){return e.filter(e=>e.reference_id===t&&e.file_type?.startsWith("image/"))}function p({pet:e,ownerName:t,vaccinations:s,consultations:p,occurrences:m,treatments:x,documents:h,generatedAt:u}){let g=(0,a.useRef)(null);return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)("div",{className:"report-toolbar no-print",children:[(0,r.jsxs)("button",{className:"btn btn-primary",onClick:function(){window.print()},children:[r.jsx(i,{size:16})," Imprimir / Salvar PDF"]}),r.jsx("span",{style:{color:"var(--color-text-muted)",fontSize:"0.85rem"},children:'O navegador vai abrir o di\xe1logo de impress\xe3o. Escolha "Salvar como PDF" para exportar.'})]}),(0,r.jsxs)("div",{ref:g,className:"report-page",children:[(0,r.jsxs)("div",{className:"rpt-header",children:[(0,r.jsxs)("div",{className:"rpt-header-left",children:[r.jsx("div",{className:"rpt-logo",children:"\uD83D\uDC3E"}),(0,r.jsxs)("div",{children:[r.jsx("div",{className:"rpt-title",children:"Passaporte de Sa\xfade Animal"}),r.jsx("div",{className:"rpt-subtitle",children:"Documento de sa\xfade para apresenta\xe7\xe3o em servi\xe7os veterin\xe1rios e hotelaria pet"})]})]}),(0,r.jsxs)("div",{className:"rpt-date",children:["Emitido em ",u]})]}),(0,r.jsxs)("section",{className:"rpt-section",children:[r.jsx("h2",{className:"rpt-section-title",children:"\uD83D\uDC36 Identifica\xe7\xe3o do Animal"}),(0,r.jsxs)("div",{className:"rpt-info-grid",children:[(0,r.jsxs)("div",{className:"rpt-info-item",children:[r.jsx("span",{className:"rpt-label",children:"Nome"}),r.jsx("span",{className:"rpt-value",children:e.name})]}),(0,r.jsxs)("div",{className:"rpt-info-item",children:[r.jsx("span",{className:"rpt-label",children:"Esp\xe9cie"}),r.jsx("span",{className:"rpt-value",children:l[e.species]||e.species})]}),e.breed&&(0,r.jsxs)("div",{className:"rpt-info-item",children:[r.jsx("span",{className:"rpt-label",children:"Ra\xe7a"}),r.jsx("span",{className:"rpt-value",children:e.breed})]}),e.sex&&(0,r.jsxs)("div",{className:"rpt-info-item",children:[r.jsx("span",{className:"rpt-label",children:"Sexo"}),r.jsx("span",{className:"rpt-value",children:o[e.sex]||e.sex})]}),e.birth_date&&(0,r.jsxs)("div",{className:"rpt-info-item",children:[r.jsx("span",{className:"rpt-label",children:"Data de Nascimento"}),r.jsx("span",{className:"rpt-value",children:(0,n.p6)(e.birth_date)})]}),e.weight_kg&&(0,r.jsxs)("div",{className:"rpt-info-item",children:[r.jsx("span",{className:"rpt-label",children:"Peso"}),(0,r.jsxs)("span",{className:"rpt-value",children:[e.weight_kg," kg"]})]}),e.color&&(0,r.jsxs)("div",{className:"rpt-info-item",children:[r.jsx("span",{className:"rpt-label",children:"Pelagem / Cor"}),r.jsx("span",{className:"rpt-value",children:e.color})]}),e.microchip&&(0,r.jsxs)("div",{className:"rpt-info-item",children:[r.jsx("span",{className:"rpt-label",children:"Microchip"}),r.jsx("span",{className:"rpt-value rpt-mono",children:e.microchip})]}),(0,r.jsxs)("div",{className:"rpt-info-item",children:[r.jsx("span",{className:"rpt-label",children:"Tutor"}),r.jsx("span",{className:"rpt-value",children:t})]})]}),e.notes&&(0,r.jsxs)("p",{className:"rpt-notes",children:["Obs: ",e.notes]})]}),(0,r.jsxs)("section",{className:"rpt-section",children:[r.jsx("h2",{className:"rpt-section-title",children:"\uD83D\uDC89 Carteira de Vacina\xe7\xe3o"}),0===s.length?r.jsx("p",{className:"rpt-empty",children:"Nenhuma vacina registrada."}):s.map(e=>{let t=c(h,e.id);return(0,r.jsxs)("div",{className:"rpt-record-block",children:[(0,r.jsxs)("div",{className:"rpt-record-header",children:[r.jsx("span",{className:"rpt-record-title",children:e.vaccine_name}),r.jsx("span",{className:"rpt-record-date",children:(0,n.p6)(e.date)})]}),(0,r.jsxs)("div",{className:"rpt-info-grid rpt-info-grid-sm",children:[e.vet_name&&(0,r.jsxs)("div",{className:"rpt-info-item",children:[r.jsx("span",{className:"rpt-label",children:"Veterin\xe1rio"}),r.jsx("span",{className:"rpt-value",children:e.vet_name})]}),e.clinic&&(0,r.jsxs)("div",{className:"rpt-info-item",children:[r.jsx("span",{className:"rpt-label",children:"Cl\xednica"}),r.jsx("span",{className:"rpt-value",children:e.clinic})]}),e.batch&&(0,r.jsxs)("div",{className:"rpt-info-item",children:[r.jsx("span",{className:"rpt-label",children:"Lote"}),r.jsx("span",{className:"rpt-value rpt-mono",children:e.batch})]}),e.manufacturer&&(0,r.jsxs)("div",{className:"rpt-info-item",children:[r.jsx("span",{className:"rpt-label",children:"Fabricante"}),r.jsx("span",{className:"rpt-value",children:e.manufacturer})]}),e.next_due_date&&(0,r.jsxs)("div",{className:"rpt-info-item",children:[r.jsx("span",{className:"rpt-label",children:"Pr\xf3xima Dose"}),(0,r.jsxs)("span",{className:"rpt-value rpt-next-dose",children:["\uD83D\uDCC5 ",(0,n.p6)(e.next_due_date)]})]})]}),e.notes&&(0,r.jsxs)("p",{className:"rpt-notes",children:["Obs: ",e.notes]}),t.length>0&&r.jsx("div",{className:"rpt-img-row",children:t.map((e,t)=>r.jsx("img",{src:e.file_url,alt:e.file_name,className:"rpt-img"},t))})]},e.id)})]}),(0,r.jsxs)("section",{className:"rpt-section",children:[r.jsx("h2",{className:"rpt-section-title",children:"\uD83E\uDE7A Consultas Veterin\xe1rias"}),0===p.length?r.jsx("p",{className:"rpt-empty",children:"Nenhuma consulta registrada."}):p.map(e=>{let t=c(h,e.id);return(0,r.jsxs)("div",{className:"rpt-record-block",children:[(0,r.jsxs)("div",{className:"rpt-record-header",children:[r.jsx("span",{className:"rpt-record-title",children:e.reason}),r.jsx("span",{className:"rpt-record-date",children:(0,n.p6)(e.date)})]}),(0,r.jsxs)("div",{className:"rpt-info-grid rpt-info-grid-sm",children:[e.vet_name&&(0,r.jsxs)("div",{className:"rpt-info-item",children:[r.jsx("span",{className:"rpt-label",children:"Veterin\xe1rio"}),r.jsx("span",{className:"rpt-value",children:e.vet_name})]}),e.clinic&&(0,r.jsxs)("div",{className:"rpt-info-item",children:[r.jsx("span",{className:"rpt-label",children:"Cl\xednica"}),r.jsx("span",{className:"rpt-value",children:e.clinic})]}),e.follow_up_date&&(0,r.jsxs)("div",{className:"rpt-info-item",children:[r.jsx("span",{className:"rpt-label",children:"Retorno"}),r.jsx("span",{className:"rpt-value",children:(0,n.p6)(e.follow_up_date)})]})]}),e.diagnosis&&(0,r.jsxs)("div",{className:"rpt-text-block",children:[r.jsx("span",{className:"rpt-label",children:"Diagn\xf3stico"}),r.jsx("p",{children:e.diagnosis})]}),e.prescription&&(0,r.jsxs)("div",{className:"rpt-text-block rpt-prescription",children:[r.jsx("span",{className:"rpt-label",children:"\uD83D\uDC8A Prescri\xe7\xe3o / Medicamentos"}),r.jsx("p",{children:e.prescription})]}),e.notes&&(0,r.jsxs)("p",{className:"rpt-notes",children:["Obs: ",e.notes]}),(()=>{let t=x.filter(t=>t.consultation_id===e.id);return 0===t.length?null:(0,r.jsxs)("div",{className:"rpt-text-block",style:{marginTop:"10px"},children:[r.jsx("span",{className:"rpt-label",children:"\uD83D\uDC8A Tratamentos Indicados"}),r.jsx("div",{style:{marginTop:"4px"},children:t.map(e=>(0,r.jsxs)("div",{style:{padding:"6px 0",borderBottom:"1px solid #f0f0f0"},children:[(0,r.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:"8px"},children:[r.jsx("strong",{children:e.name}),r.jsx("span",{style:{fontSize:"0.7rem",padding:"1px 6px",borderRadius:"4px",background:"active"===e.status?"#ECFDF5":"completed"===e.status?"#F3F4F6":"#FEF3C7",color:"active"===e.status?"#059669":"completed"===e.status?"#6B7280":"#D97706",fontWeight:600},children:"active"===e.status?"Ativo":"completed"===e.status?"Conclu\xeddo":"Cancelado"})]}),(0,r.jsxs)("div",{style:{fontSize:"0.8rem",color:"#666",display:"flex",flexWrap:"wrap",gap:"6px 12px",marginTop:"2px"},children:[e.dosage&&(0,r.jsxs)("span",{children:["Dose: ",e.dosage]}),e.frequency&&(0,r.jsxs)("span",{children:["Freq: ",e.frequency]}),e.duration&&(0,r.jsxs)("span",{children:["Dura\xe7\xe3o: ",e.duration]}),e.application_method&&(0,r.jsxs)("span",{children:["Aplica\xe7\xe3o: ",e.application_method]}),e.start_date&&(0,r.jsxs)("span",{children:["In\xedcio: ",(0,n.p6)(e.start_date)]}),e.end_date&&(0,r.jsxs)("span",{children:["Fim: ",(0,n.p6)(e.end_date)]})]}),e.notes&&r.jsx("p",{style:{fontSize:"0.78rem",color:"#888",marginTop:"2px",fontStyle:"italic"},children:e.notes})]},e.id))})]})})(),t.length>0&&r.jsx("div",{className:"rpt-img-row",children:t.map((e,t)=>r.jsx("img",{src:e.file_url,alt:e.file_name,className:"rpt-img"},t))})]},e.id)})]}),p.some(e=>e.prescription)&&(0,r.jsxs)("section",{className:"rpt-section rpt-meds-section",children:[r.jsx("h2",{className:"rpt-section-title",children:"\uD83D\uDC8A Resumo de Medicamentos Prescritos"}),(0,r.jsxs)("table",{className:"rpt-table",children:[r.jsx("thead",{children:(0,r.jsxs)("tr",{children:[r.jsx("th",{children:"Data"}),r.jsx("th",{children:"Motivo"}),r.jsx("th",{children:"Medicamentos"}),r.jsx("th",{children:"Veterin\xe1rio"})]})}),r.jsx("tbody",{children:p.filter(e=>e.prescription).map(e=>(0,r.jsxs)("tr",{children:[r.jsx("td",{style:{whiteSpace:"nowrap"},children:(0,n.p6)(e.date)}),r.jsx("td",{children:e.reason}),r.jsx("td",{children:e.prescription}),r.jsx("td",{children:e.vet_name||"—"})]},e.id))})]})]}),m.length>0&&(0,r.jsxs)("section",{className:"rpt-section",children:[r.jsx("h2",{className:"rpt-section-title",children:"\uD83D\uDCCB Ocorr\xeancias e Procedimentos"}),(0,r.jsxs)("table",{className:"rpt-table",children:[r.jsx("thead",{children:(0,r.jsxs)("tr",{children:[r.jsx("th",{children:"Data"}),r.jsx("th",{children:"Tipo"}),r.jsx("th",{children:"Descri\xe7\xe3o"})]})}),r.jsx("tbody",{children:m.map(e=>(0,r.jsxs)("tr",{children:[r.jsx("td",{style:{whiteSpace:"nowrap"},children:(0,n.p6)(e.date)}),r.jsx("td",{children:d[e.type]||e.type}),r.jsx("td",{children:e.description||e.notes||"—"})]},e.id))})]})]}),(0,r.jsxs)("div",{className:"rpt-footer",children:[(0,r.jsxs)("p",{children:["Este documento foi gerado automaticamente pelo sistema ",r.jsx("strong",{children:"Pet Passport"})," em ",u,"."]}),r.jsx("p",{children:"As informa\xe7\xf5es aqui contidas s\xe3o de responsabilidade do tutor do animal."})]})]}),r.jsx("style",{children:`
                /* ── Screen ── */
                .report-toolbar {
                    display: flex;
                    align-items: center;
                    gap: var(--space-4);
                    padding: var(--space-4) var(--space-8);
                    background: var(--color-bg-secondary);
                    border-bottom: 1px solid var(--color-border);
                    position: sticky;
                    top: 0;
                    z-index: 100;
                }
                .report-page {
                    max-width: 800px;
                    margin: var(--space-8) auto;
                    padding: var(--space-8);
                    background: #fff;
                    color: #1a1a2e;
                    border-radius: var(--radius-lg);
                    box-shadow: var(--shadow-lg);
                    font-family: 'Inter', sans-serif;
                    font-size: 13px;
                    line-height: 1.6;
                }

                /* ── Header ── */
                .rpt-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    padding-bottom: 16px;
                    border-bottom: 3px solid #0D9488;
                    margin-bottom: 24px;
                }
                .rpt-header-left { display: flex; align-items: center; gap: 14px; }
                .rpt-logo { font-size: 2.5rem; }
                .rpt-title { font-size: 1.4rem; font-weight: 800; color: #0D9488; }
                .rpt-subtitle { font-size: 0.78rem; color: #666; margin-top: 2px; }
                .rpt-date { font-size: 0.78rem; color: #888; white-space: nowrap; }

                /* ── Sections ── */
                .rpt-section { margin-bottom: 28px; }
                .rpt-section-title {
                    font-size: 1rem;
                    font-weight: 700;
                    color: #0D9488;
                    border-bottom: 1px solid #e5e7eb;
                    padding-bottom: 6px;
                    margin-bottom: 14px;
                }
                .rpt-empty { color: #999; font-style: italic; font-size: 0.85rem; }

                /* ── Info grid ── */
                .rpt-info-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 10px 16px;
                    margin-bottom: 8px;
                }
                .rpt-info-grid-sm { grid-template-columns: repeat(3, 1fr); }
                .rpt-info-item { display: flex; flex-direction: column; }
                .rpt-label { font-size: 0.7rem; font-weight: 600; color: #888; text-transform: uppercase; letter-spacing: 0.05em; }
                .rpt-value { font-weight: 500; color: #1a1a2e; }
                .rpt-mono { font-family: monospace; }
                .rpt-next-dose { color: #D97706; font-weight: 600; }
                .rpt-notes { font-style: italic; color: #666; font-size: 0.85rem; margin-top: 6px; }

                /* ── Record blocks ── */
                .rpt-record-block {
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    padding: 14px 16px;
                    margin-bottom: 14px;
                    background: #fafafa;
                    page-break-inside: avoid;
                }
                .rpt-record-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 10px;
                }
                .rpt-record-title { font-weight: 700; font-size: 0.95rem; color: #1a1a2e; }
                .rpt-record-date { font-size: 0.82rem; color: #0D9488; font-weight: 600; white-space: nowrap; }

                /* ── Text blocks ── */
                .rpt-text-block { margin: 8px 0; }
                .rpt-text-block p { margin-top: 3px; color: #333; white-space: pre-wrap; }
                .rpt-prescription {
                    background: #f0fdf4;
                    border: 1px solid #bbf7d0;
                    border-radius: 6px;
                    padding: 8px 12px;
                }
                .rpt-prescription .rpt-label { color: #15803d; }

                /* ── Images ── */
                .rpt-img-row {
                    display: flex;
                    gap: 10px;
                    flex-wrap: wrap;
                    margin-top: 12px;
                }
                .rpt-img {
                    width: 120px;
                    height: 90px;
                    object-fit: cover;
                    border-radius: 6px;
                    border: 1px solid #e5e7eb;
                }

                /* ── Table ── */
                .rpt-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 0.82rem;
                }
                .rpt-table th {
                    background: #f3f4f6;
                    padding: 7px 10px;
                    text-align: left;
                    font-weight: 600;
                    color: #555;
                    border-bottom: 2px solid #e5e7eb;
                }
                .rpt-table td {
                    padding: 7px 10px;
                    border-bottom: 1px solid #e5e7eb;
                    color: #333;
                    vertical-align: top;
                }
                .rpt-meds-section .rpt-section-title { color: #15803d; }

                /* ── Footer ── */
                .rpt-footer {
                    border-top: 1px solid #e5e7eb;
                    padding-top: 14px;
                    margin-top: 24px;
                    font-size: 0.75rem;
                    color: #999;
                    text-align: center;
                }

                /* ── Print ── */
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; }
                    .report-page {
                        margin: 0;
                        box-shadow: none;
                        border-radius: 0;
                        max-width: 100%;
                    }
                    .rpt-record-block { page-break-inside: avoid; }
                    .rpt-img { max-width: 110px; }
                    @page { margin: 1.5cm; }
                }
            `})]})}},40927:(e,t,s)=>{"use strict";function r(e){let t=function(e){if(!e)return null;let[t,s,r]=e.split("-").map(Number);return new Date(t,s-1,r)}(e);return t?t.toLocaleDateString("pt-BR"):"—"}s.d(t,{p6:()=>r})},27162:(e,t,s)=>{"use strict";s.d(t,{Z:()=>o});var r=s(71159);/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let a=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),i=(...e)=>e.filter((e,t,s)=>!!e&&s.indexOf(e)===t).join(" ");/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var n={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let l=(0,r.forwardRef)(({color:e="currentColor",size:t=24,strokeWidth:s=2,absoluteStrokeWidth:a,className:l="",children:o,iconNode:d,...c},p)=>(0,r.createElement)("svg",{ref:p,...n,width:t,height:t,stroke:e,strokeWidth:a?24*Number(s)/Number(t):s,className:i("lucide",l),...c},[...d.map(([e,t])=>(0,r.createElement)(e,t)),...Array.isArray(o)?o:[o]])),o=(e,t)=>{let s=(0,r.forwardRef)(({className:s,...n},o)=>(0,r.createElement)(l,{ref:o,iconNode:t,className:i(`lucide-${a(e)}`,s),...n}));return s.displayName=`${e}`,s}},39755:(e,t,s)=>{"use strict";s.d(t,{Z:()=>r});/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,s(27162).Z)("ArrowLeft",[["path",{d:"m12 19-7-7 7-7",key:"1l729n"}],["path",{d:"M19 12H5",key:"x3x0zl"}]])},57371:(e,t,s)=>{"use strict";s.d(t,{default:()=>a.a});var r=s(670),a=s.n(r)},670:(e,t,s)=>{"use strict";let{createProxy:r}=s(68570);e.exports=r("C:\\Users\\martim.dietterle\\Documents\\pet_passport\\node_modules\\next\\dist\\client\\link.js")},74979:(e,t,s)=>{"use strict";s.r(t),s.d(t,{default:()=>h});var r=s(19510),a=s(58585),i=s(57371),n=s(65655),l=s(88336),o=s(39755),d=s(68570);let c=(0,d.createProxy)(String.raw`C:\Users\martim.dietterle\Documents\pet_passport\src\components\pets\PetReport.tsx`),{__esModule:p,$$typeof:m}=c;c.default;let x=(0,d.createProxy)(String.raw`C:\Users\martim.dietterle\Documents\pet_passport\src\components\pets\PetReport.tsx#default`);async function h({params:e}){let t=(0,n.e)(),{data:{user:s}}=await t.auth.getUser();s||(0,a.redirect)("/login");let{data:d}=await t.from("pets").select("*").eq("id",e.id).eq("owner_id",s.id).single();d||(0,a.notFound)();let{data:c}=await t.from("profiles").select("full_name, email:id").eq("id",s.id).single(),p=c?.full_name||s.email||"Tutor",[{data:m},{data:h},{data:u},{data:g}]=await Promise.all([t.from("vaccinations").select("*").eq("pet_id",d.id).order("date",{ascending:!1}),t.from("vet_consultations").select("*").eq("pet_id",d.id).order("date",{ascending:!1}),t.from("occurrences").select("*").eq("pet_id",d.id).order("date",{ascending:!1}),t.from("treatments").select("*").eq("pet_id",d.id).order("created_at",{ascending:!1})]),f=(0,l.eI)("https://enszaudcenhjcwkdqedr.supabase.co",process.env.SUPABASE_SERVICE_ROLE_KEY),{data:j}=await f.from("documents").select("file_url, file_name, file_type, reference_id, reference_type").eq("pet_id",d.id),b=new Date().toLocaleString("pt-BR",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit",timeZone:"America/Sao_Paulo"});return(0,r.jsxs)(r.Fragment,{children:[r.jsx("div",{className:"no-print",style:{padding:"12px 32px",background:"var(--color-bg)"},children:(0,r.jsxs)(i.default,{href:`/dashboard/pets/${d.id}`,className:"btn btn-ghost btn-sm",children:[r.jsx(o.Z,{size:16})," Voltar para ",d.name]})}),r.jsx(x,{pet:d,ownerName:p,vaccinations:m||[],consultations:h||[],occurrences:u||[],treatments:g||[],documents:j||[],generatedAt:b})]})}}};var t=require("../../../../../webpack-runtime.js");t.C(e);var s=e=>t(t.s=e),r=t.X(0,[948,336,355,471,404,127,706,268],()=>s(95260));module.exports=r})();