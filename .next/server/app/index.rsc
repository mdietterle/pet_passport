2:I[231,["231","static/chunks/231-e158308e2170ab20.js","931","static/chunks/app/page-5daa4461c746a04e.js"],""]
4:I[9275,[],""]
5:I[1343,[],""]
3:T1024,
        .landing {
          min-height: 100vh;
          background: radial-gradient(ellipse at 50% 0%, var(--color-bg-secondary) 0%, var(--color-bg) 60%);
        }
        .landing-nav {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--color-border);
        }
        .landing-nav-inner {
          max-width: 1100px;
          margin: 0 auto;
          padding: var(--space-4) var(--space-6);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .landing-logo {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }
        .landing-logo-icon {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, var(--color-teal), var(--color-teal-dark));
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }
        .landing-logo-text {
          font-size: 1.1rem;
          font-weight: 700;
          background: linear-gradient(135deg, var(--color-teal-light), white);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .landing-nav-links {
          display: flex;
          gap: var(--space-3);
          align-items: center;
        }
        .landing-hero {
          max-width: 800px;
          margin: 0 auto;
          padding: var(--space-16) var(--space-6);
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-6);
        }
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
          background: rgba(13, 148, 136, 0.1);
          border: 1px solid rgba(13, 148, 136, 0.3);
          color: var(--color-teal-light);
          padding: 6px 16px;
          border-radius: var(--radius-full);
          font-size: 0.85rem;
          font-weight: 500;
        }
        .hero-title {
          font-size: 3.5rem;
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -0.02em;
        }
        .hero-title-accent {
          background: linear-gradient(135deg, var(--color-teal-light), var(--color-amber));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hero-subtitle {
          font-size: 1.1rem;
          color: var(--color-text-secondary);
          line-height: 1.7;
        }
        .hero-cta {
          display: flex;
          gap: var(--space-4);
          flex-wrap: wrap;
          justify-content: center;
        }
        .landing-features {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 var(--space-6) var(--space-16);
        }
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: var(--space-5);
        }
        .feature-card {
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: var(--space-6);
          transition: all var(--transition-base);
        }
        .feature-card:hover {
          border-color: var(--color-teal);
          transform: translateY(-4px);
          box-shadow: 0 8px 32px var(--color-teal-glow);
        }
        .feature-icon {
          font-size: 2rem;
          margin-bottom: var(--space-3);
        }
        .feature-card h3 {
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: var(--space-2);
        }
        .feature-card p {
          font-size: 0.9rem;
          color: var(--color-text-secondary);
          line-height: 1.6;
        }
        @media (max-width: 600px) {
          .hero-title { font-size: 2.2rem; }
        }
      0:["dmDe28qwl8xdchwhJCWMM",[[["",{"children":["__PAGE__",{}]},"$undefined","$undefined",true],["",{"children":["__PAGE__",{},[["$L1",["$","div",null,{"className":"landing","children":[["$","nav",null,{"className":"landing-nav","children":["$","div",null,{"className":"landing-nav-inner","children":[["$","div",null,{"className":"landing-logo","children":[["$","div",null,{"className":"landing-logo-icon","children":["$","svg",null,{"xmlns":"http://www.w3.org/2000/svg","width":20,"height":20,"viewBox":"0 0 24 24","fill":"none","stroke":"currentColor","strokeWidth":2,"strokeLinecap":"round","strokeLinejoin":"round","className":"lucide lucide-paw-print","children":[["$","circle","vol9p0",{"cx":"11","cy":"4","r":"2"}],["$","circle","17gozi",{"cx":"18","cy":"8","r":"2"}],["$","circle","1v9bxh",{"cx":"20","cy":"16","r":"2"}],["$","path","1ydw1z",{"d":"M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z"}],"$undefined"]}]}],["$","span",null,{"className":"landing-logo-text","children":"Pet Passport"}]]}],["$","div",null,{"className":"landing-nav-links","children":[["$","$L2",null,{"href":"/login","className":"btn btn-ghost btn-sm","children":"Entrar"}],["$","$L2",null,{"href":"/register","className":"btn btn-primary btn-sm","children":"Começar grátis"}]]}]]}]}],["$","section",null,{"className":"landing-hero","children":[["$","div",null,{"className":"hero-badge","children":[["$","svg",null,{"xmlns":"http://www.w3.org/2000/svg","width":12,"height":12,"viewBox":"0 0 24 24","fill":"none","stroke":"currentColor","strokeWidth":2,"strokeLinecap":"round","strokeLinejoin":"round","className":"lucide lucide-star","children":[["$","polygon","8f66p6",{"points":"12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"}],"$undefined"]}]," Mais de 1.000 pets cadastrados"]}],["$","h1",null,{"className":"hero-title","children":["A saúde do seu pet",["$","br",null,{}],["$","span",null,{"className":"hero-title-accent","children":"em um só lugar"}]]}],["$","p",null,{"className":"hero-subtitle","children":["Registre vacinas, consultas veterinárias e ocorrências dos seus pets.",["$","br",null,{}],"Nunca mais perca uma dose de vacina ou consulta importante."]}],["$","div",null,{"className":"hero-cta","children":[["$","$L2",null,{"href":"/register","className":"btn btn-primary btn-lg","children":"Criar conta gratuita"}],["$","$L2",null,{"href":"/login","className":"btn btn-secondary btn-lg","children":"Já tenho conta"}]]}]]}],["$","section",null,{"className":"landing-features","children":["$","div",null,{"className":"features-grid","children":[["$","div",null,{"className":"feature-card","children":[["$","div",null,{"className":"feature-icon","children":"🐾"}],["$","h3",null,{"children":"Múltiplos Pets"}],["$","p",null,{"children":"Cadastre todos os seus pets e acesse o histórico de cada um facilmente."}]]}],["$","div",null,{"className":"feature-card","children":[["$","div",null,{"className":"feature-icon","children":"💉"}],["$","h3",null,{"children":"Controle de Vacinas"}],["$","p",null,{"children":"Registre vacinas e receba alertas quando a próxima dose estiver chegando."}]]}],["$","div",null,{"className":"feature-card","children":[["$","div",null,{"className":"feature-icon","children":"🩺"}],["$","h3",null,{"children":"Histórico Veterinário"}],["$","p",null,{"children":"Mantenha o histórico completo de consultas, diagnósticos e prescrições."}]]}],["$","div",null,{"className":"feature-card","children":[["$","div",null,{"className":"feature-icon","children":"📋"}],["$","h3",null,{"children":"Ocorrências Gerais"}],["$","p",null,{"children":"Registre compras de ração, tosas, banhos, vômitos e muito mais."}]]}]]}]}],["$","style",null,{"children":"$3"}]]}]],null],null]},[["$","html",null,{"lang":"pt-BR","children":["$","body",null,{"children":["$","$L4",null,{"parallelRouterKey":"children","segmentPath":["children"],"error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L5",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":[["$","title",null,{"children":"404: This page could not be found."}],["$","div",null,{"style":{"fontFamily":"system-ui,\"Segoe UI\",Roboto,Helvetica,Arial,sans-serif,\"Apple Color Emoji\",\"Segoe UI Emoji\"","height":"100vh","textAlign":"center","display":"flex","flexDirection":"column","alignItems":"center","justifyContent":"center"},"children":["$","div",null,{"children":[["$","style",null,{"dangerouslySetInnerHTML":{"__html":"body{color:#000;background:#fff;margin:0}.next-error-h1{border-right:1px solid rgba(0,0,0,.3)}@media (prefers-color-scheme:dark){body{color:#fff;background:#000}.next-error-h1{border-right:1px solid rgba(255,255,255,.3)}}"}}],["$","h1",null,{"className":"next-error-h1","style":{"display":"inline-block","margin":"0 20px 0 0","padding":"0 23px 0 0","fontSize":24,"fontWeight":500,"verticalAlign":"top","lineHeight":"49px"},"children":"404"}],["$","div",null,{"style":{"display":"inline-block"},"children":["$","h2",null,{"style":{"fontSize":14,"fontWeight":400,"lineHeight":"49px","margin":0},"children":"This page could not be found."}]}]]}]}]],"notFoundStyles":[],"styles":null}]}]}],null],null],[[["$","link","0",{"rel":"stylesheet","href":"/_next/static/css/5962c189e5bec17d.css","precedence":"next","crossOrigin":"$undefined"}]],[null,"$L6"]]]]]
6:[["$","meta","0",{"name":"viewport","content":"width=device-width, initial-scale=1"}],["$","meta","1",{"charSet":"utf-8"}],["$","title","2",{"children":"Pet Passport — Saúde do seu pet em um só lugar"}],["$","meta","3",{"name":"description","content":"Gerencie vacinas, consultas veterinárias e ocorrências dos seus pets com facilidade."}]]
1:null
