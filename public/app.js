const state = {
  user:null, subjects:[], currentView:"dashboard", deferredPrompt:null,
  currentSubject:null, currentTopic:null, chatConversation:null, exam:null,
  dueCards:[], cardIndex:0, showingBack:false, visionDataUrl:null,
  patientConversation:null, patientActive:false, caseSolverConversation:null,
  scienceConversation:null, languageConversation:null, lastLanguageAnswer:""
};

const $ = (s,el=document)=>el.querySelector(s);
const $$ = (s,el=document)=>[...el.querySelectorAll(s)];
const root = $("#view-root");

document.addEventListener("DOMContentLoaded", boot);

async function boot(){
  applySavedTheme();
  bindAuth();
  bindShell();
  setupPWA();
  updateNetworkBadge();

  try{
    const me=await api("/api/me");
    state.user=me.user;
    showApp();
    await loadSubjects();
    navigate("dashboard");
  }catch(err){
    $("#auth-screen").classList.remove("hidden");
    $(".auth-card").innerHTML = `
      <div class="brand-lockup">
        <div class="brand-mark">M+</div>
        <div><h1>MED AI DALTON</h1><p>Entrenamiento médico inteligente</p></div>
      </div>
      <div class="notice" style="margin-top:24px">
        No se pudo abrir tu perfil personal. ${escapeHtml(err.message)}
      </div>`;
  }
}

function bindAuth(){
  // MED AI funciona en modo personal sin pantalla de login.
  // Si en el futuro vuelven a existir formularios de acceso, este bloque
  // puede activarlos sin impedir el arranque de la aplicación.
  const loginForm=$("#login-form");
  const registerForm=$("#register-form");
  if(!loginForm || !registerForm) return;

  $$(".auth-tab").forEach(btn=>btn.addEventListener("click",()=>{
    $$(".auth-tab").forEach(x=>x.classList.remove("active"));btn.classList.add("active");
    const register=btn.dataset.authTab==="register";
    loginForm.classList.toggle("hidden",register);
    registerForm.classList.toggle("hidden",!register);
    const msg=$("#auth-message"); if(msg) msg.textContent="";
  }));

  loginForm.addEventListener("submit",async e=>{
    e.preventDefault();
  });
  registerForm.addEventListener("submit",async e=>{
    e.preventDefault();
  });
}

function bindShell(){
  $("#main-nav").addEventListener("click",e=>{
    const btn=e.target.closest("[data-view]"); if(!btn)return;
    navigate(btn.dataset.view);
    $(".sidebar").classList.remove("open");
  });
  $("#menu-btn").addEventListener("click",()=>$(".sidebar").classList.toggle("open"));
  $("#logout-btn").addEventListener("click",()=>location.reload());
  $("#quick-study").addEventListener("click",()=>navigate("study"));
  $("#user-chip").addEventListener("click",()=>navigate("profile"));
  $("#theme-toggle")?.addEventListener("click",toggleTheme);
  $("#global-search").addEventListener("input",debounce(searchGlobal,250));
  document.addEventListener("click",e=>{
    if(!e.target.closest(".global-search")) $("#search-results").classList.add("hidden");
  });
  window.addEventListener("online",()=>{updateNetworkBadge();flushOfflineQueue()});
  window.addEventListener("offline",updateNetworkBadge);
}

function showAuth(){
  $("#auth-screen").classList.remove("hidden");$("#app-shell").classList.add("hidden");
}
function showApp(){
  $("#auth-screen").classList.add("hidden");$("#app-shell").classList.remove("hidden");
  const name=state.user?.full_name||state.user?.email||"D";
  $("#user-chip").textContent=name.trim()[0]?.toUpperCase()||"D";
}
function setAuthMessage(t,isError){$("#auth-message").textContent=t;$("#auth-message").style.color=isError?"var(--danger)":"var(--muted)"}

async function loadSubjects(){
  const data=await api("/api/subjects");state.subjects=data.subjects||[];
}

async function navigate(view){
  state.currentView=view;
  $$(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.view===view));
  root.innerHTML=`<div class="empty">Cargando...</div>`;
  try{
    const renderers={
      dashboard:renderDashboard,study:renderStudy,tutor:()=>renderAIStudio("tutor"),
      exams:renderExams,flashcards:renderFlashcards,patient:renderPatientVirtual,
      case_solver:renderCaseSolver,
      grand_rounds:()=>renderAIStudio("grand_rounds"),emergency:()=>renderAIStudio("emergency"),
      ecg:()=>renderVisionStudio("ecg"),radiology:()=>renderVisionStudio("radiology"),
      laboratory:()=>renderAIStudio("laboratory"),pharmacology:()=>renderAIStudio("pharmacology"),
      osce:()=>renderAIStudio("osce"),library:renderLibrary,mistakes:renderMistakes,
      plan:renderPlan,stats:renderStats,profile:renderProfile,
      mathematics:()=>renderScienceStudio("MATH"),physics:()=>renderScienceStudio("PHYS"),
      astronomy:()=>renderScienceStudio("ASTRO"),languages:renderLanguageLab
    };
    await (renderers[view]||renderDashboard)();
  }catch(err){root.innerHTML=`<div class="card"><h3>No se pudo cargar</h3><p>${escapeHtml(err.message)}</p></div>`}
}

async function renderDashboard(){
  const d=await api("/api/dashboard");
  const hours=(Number(d.metrics?.study_seconds||0)/3600).toFixed(1);
  const name=d.profile?.full_name||state.user?.email?.split("@")[0]||"Doctor";
  const resumeTitle=d.resume?.topic_name||d.resume?.subject_name||"Selecciona una materia para comenzar";
  const resumeSub=d.resume?.lesson_title||"Tu sesión académica queda sincronizada entre todos tus dispositivos.";
  const progress=Math.round(Number(d.resume?.progress_percent||0));
  root.innerHTML=`
    <section class="institution-header">
      <div class="institution-main">
        <div class="institution-code">MED AI DALTON / ACADEMIC MEDICAL TRAINING SYSTEM</div>
        <h1>Centro de entrenamiento clínico</h1>
        <p>Buenos días, <strong>${escapeHtml(firstName(name))}</strong>. Continúa tu formación médica desde un entorno estructurado y sin distracciones.</p>
      </div>
      <div class="institution-id">
        <span>PERFIL</span>
        <strong>${escapeHtml(firstName(name)).toUpperCase()}</strong>
        <small>Nivel ${d.profile?.current_medical_level||1} · ${d.profile?.total_xp||0} XP</small>
      </div>
    </section>

    <section class="clinical-console">
      <article class="clinical-resume">
        <div class="panel-header">
          <div><span class="panel-code">SESIÓN ACTIVA</span><strong>Continuar formación</strong></div>
          <span class="panel-progress">${progress}% COMPLETADO</span>
        </div>
        <div class="clinical-resume-body">
          <div class="session-number">01</div>
          <div class="session-copy">
            <span class="session-label">MATERIA / TEMA ACTUAL</span>
            <h2>${escapeHtml(resumeTitle)}</h2>
            <p>${escapeHtml(resumeSub)}</p>
          </div>
        </div>
        <div class="progress institutional-progress"><i style="width:${progress}%"></i></div>
        <div class="console-actions">
          <button id="continue-btn" class="primary-btn console-primary">CONTINUAR ESTUDIO</button>
          <button id="open-tutor-btn" class="secondary-btn">TUTOR IA</button>
          <button id="open-exam-btn" class="secondary-btn">EXAMEN RÁPIDO</button>
        </div>
      </article>

      <aside class="academic-summary">
        <div class="panel-header"><div><span class="panel-code">RESUMEN ACADÉMICO</span><strong>Estado actual</strong></div></div>
        <div class="summary-table">
          <div class="summary-row"><span>Flashcards pendientes</span><strong>${d.dueFlashcards}</strong></div>
          <div class="summary-row"><span>Precisión general</span><strong>${d.accuracy}%</strong></div>
          <div class="summary-row"><span>Preguntas respondidas</span><strong>${d.questionsAnswered}</strong></div>
          <div class="summary-row"><span>Tiempo acumulado</span><strong>${hours} h</strong></div>
          <div class="summary-row"><span>Nivel médico</span><strong>${d.profile?.current_medical_level||1}</strong></div>
          <div class="summary-row"><span>Experiencia</span><strong>${d.profile?.total_xp||0} XP</strong></div>
        </div>
      </aside>
    </section>

    <div class="institution-section-head">
      <div><span>ACCESOS PRINCIPALES</span><h3>Entrenamiento médico</h3></div>
      <small>Selecciona un módulo para comenzar</small>
    </div>
    <section class="clinical-modules">
      <button class="clinical-module" data-view="tutor"><span class="module-no">01</span><div class="module-symbol">✦</div><div><strong>Tutor IA</strong><small>Estudio guiado y explicación adaptativa</small></div><b>ABRIR</b></button>
      <button class="clinical-module" data-view="patient"><span class="module-no">02</span><div class="module-symbol">♙</div><div><strong>Paciente virtual</strong><small>Entrevista clínica progresiva sin revelar el caso</small></div><b>ABRIR</b></button>
      <button class="clinical-module" data-view="case_solver"><span class="module-no">03</span><div class="module-symbol">▣</div><div><strong>Resolver caso clínico</strong><small>Pega un caso completo y recibe la solución razonada</small></div><b>ABRIR</b></button>
      <button class="clinical-module" data-view="exams"><span class="module-no">04</span><div class="module-symbol">✓</div><div><strong>Exámenes</strong><small>Evaluación adaptativa del conocimiento</small></div><b>ABRIR</b></button>
      <button class="clinical-module" data-view="flashcards"><span class="module-no">05</span><div class="module-symbol">▱</div><div><strong>Flashcards</strong><small>Repetición espaciada y memoria activa</small></div><b>ABRIR</b></button>
      <button class="clinical-module" data-view="grand_rounds"><span class="module-no">06</span><div class="module-symbol">◆</div><div><strong>Grand Rounds</strong><small>Casos complejos de Medicina Interna</small></div><b>ABRIR</b></button>
      <button class="clinical-module" data-view="emergency"><span class="module-no">07</span><div class="module-symbol">⚡</div><div><strong>Emergencias</strong><small>Priorización y decisiones clínicas</small></div><b>ABRIR</b></button>
    </section>

    <div class="institution-section-head">
      <div><span>FORMACIÓN COMPLEMENTARIA</span><h3>Ciencias e idiomas</h3></div>
      <small>Amplía tu formación más allá de medicina</small>
    </div>
    <section class="clinical-modules academic-expansion">
      <button class="clinical-module" data-view="mathematics"><span class="module-no">M1</span><div class="module-symbol">∑</div><div><strong>Matemática</strong><small>Desde fundamentos hasta cálculo y estadística</small></div><b>ABRIR</b></button>
      <button class="clinical-module" data-view="physics"><span class="module-no">F1</span><div class="module-symbol">Φ</div><div><strong>Física</strong><small>Conceptos, problemas y razonamiento paso a paso</small></div><b>ABRIR</b></button>
      <button class="clinical-module" data-view="astronomy"><span class="module-no">A1</span><div class="module-symbol">✧</div><div><strong>Astronomía</strong><small>Sistema Solar, estrellas, galaxias y cosmología</small></div><b>ABRIR</b></button>
      <button class="clinical-module" data-view="languages"><span class="module-no">L1</span><div class="module-symbol">文</div><div><strong>Idiomas</strong><small>Curso progresivo A1–C2 con conversación y corrección</small></div><b>ABRIR</b></button>
    </section>

    <section class="institution-lower-grid">
      <div class="record-panel">
        <div class="panel-header"><div><span class="panel-code">HISTORIAL ACADÉMICO</span><strong>Actividad reciente</strong></div></div>
        ${listRecent(d.recentTopics)}
      </div>
      <div class="record-panel">
        <div class="panel-header"><div><span class="panel-code">PLANIFICACIÓN</span><strong>Próximas fechas</strong></div></div>
        ${listDeadlinesCompact(d.deadlines)}
      </div>
    </section>`;
  $("#continue-btn").onclick=()=>navigate(d.resume?.mode||"study");
  $("#open-tutor-btn").onclick=()=>navigate("tutor");
  $("#open-exam-btn").onclick=()=>navigate("exams");
  $$(".clinical-module").forEach(c=>c.onclick=()=>navigate(c.dataset.view));
}

async function renderStudy(){
  root.innerHTML=`
    <div class="page-head"><div><div class="eyebrow">CURRÍCULO ACADÉMICO</div><h2>Estudiar</h2><p>Explora medicina, ciencias e idiomas desde un mismo entorno. Abre una materia, selecciona un tema y continúa con IA, exámenes o flashcards.</p></div></div>
    <div class="card" style="margin-bottom:16px"><div class="info-box">Consejo: abre una materia, selecciona un tema y MED AI recordará tu ruta para que continúes luego desde cualquier dispositivo.</div></div>
    <div class="grid three" id="subject-grid">
      ${state.subjects.map(subjectCard).join("")}
    </div>
    <div id="topic-section"></div>`;
  $$(".subject-card").forEach(c=>c.onclick=()=>openSubject(c.dataset.id));
}
async function openSubject(id){
  const s=state.subjects.find(x=>x.id===id);state.currentSubject=s;
  const data=await api(`/api/topics?subject_id=${encodeURIComponent(id)}`);
  const section=$("#topic-section");
  section.innerHTML=`
    <div class="section-stack">
      <h3 class="section-title">${escapeHtml(s.name)} — temas</h3>
      ${data.topics.length?`<div class="topic-grid">${data.topics.map(t=>`<button class="topic-btn" data-id="${t.id}"><strong>${escapeHtml(t.name)}</strong><span>${escapeHtml(t.description||"Abrir entrenamiento")}</span></button>`).join("")}</div>`:
      `<div class="card empty">Esta materia ya forma parte del currículo. Puedes estudiarla ahora con el Tutor IA aunque sus subtemas específicos todavía no estén precargados.</div>`}
      <div><button id="study-subject-ai" class="primary-btn">Estudiar ${escapeHtml(s.name)} con IA</button></div>
    </div>`;
  const specialView={MATH:"mathematics",PHYS:"physics",ASTRO:"astronomy",LANG:"languages"}[s.code]||null;
  $$(".topic-btn",section).forEach(btn=>btn.onclick=()=>{
    state.currentTopic=data.topics.find(x=>x.id===btn.dataset.id);
    const target=specialView||"tutor";
    saveResume({route:`/${target}`,subject_id:s.id,topic_id:state.currentTopic.id,mode:target,progress_percent:0,context:{subject:s.name,topic:state.currentTopic.name}});
    navigate(target);
  });
  $("#study-subject-ai").onclick=()=>{state.currentTopic=null;navigate(specialView||"tutor")};
  section.scrollIntoView({behavior:"smooth"});
}


const SCIENCE_CONFIG={
  MATH:{code:"MATH",title:"Matemática",symbol:"∑",kicker:"RAZONAMIENTO MATEMÁTICO",subtitle:"Aprende conceptos, procedimientos y resolución de problemas sin saltos.",topics:["Aritmética y proporciones","Álgebra","Ecuaciones e inecuaciones","Funciones y gráficas","Geometría","Trigonometría","Geometría analítica","Límites y continuidad","Derivadas","Integrales","Probabilidad y estadística","Vectores y matrices","Ecuaciones diferenciales"]},
  PHYS:{code:"PHYS",title:"Física",symbol:"Φ",kicker:"CIENCIAS FÍSICAS",subtitle:"Comprende las leyes físicas y aprende a resolver problemas justificando cada paso.",topics:["Unidades, medición y vectores","Cinemática","Leyes de Newton","Trabajo y energía","Cantidad de movimiento","Rotación y torque","Fluidos","Termodinámica","Ondas y sonido","Electricidad","Magnetismo","Óptica","Relatividad","Física cuántica y moderna"]},
  ASTRO:{code:"ASTRO",title:"Astronomía",symbol:"✧",kicker:"CIENCIA DEL UNIVERSO",subtitle:"Estudia desde el cielo observable hasta estrellas, galaxias y cosmología moderna.",topics:["Esfera celeste y coordenadas","Gravedad y órbitas","Sistema Solar","El Sol","Propiedades de las estrellas","Evolución estelar","Exoplanetas","Vía Láctea","Galaxias","Cosmología","Telescopios y observación","Astrobiología"]}
};

function getSubjectByCode(code){return state.subjects.find(s=>s.code===code)||null}

async function renderScienceStudio(code){
  const cfg=SCIENCE_CONFIG[code];
  const subject=getSubjectByCode(code);
  const presetTopic=state.currentTopic?.subject_id===subject?.id?state.currentTopic.name:null;
  state.scienceConversation=null;
  state.currentSubject=subject;
  root.innerHTML=`
    <div class="page-head"><div><div class="eyebrow">${cfg.kicker}</div><h2>${cfg.symbol} ${cfg.title}</h2><p>${cfg.subtitle}</p></div></div>
    <div class="science-layout">
      <aside class="card science-controls">
        <div class="panel-code">CONFIGURACIÓN DE ESTUDIO</div>
        <div class="field"><label>Tema</label><select id="science-topic">${cfg.topics.map(t=>`<option>${escapeHtml(t)}</option>`).join("")}<option>Otro tema...</option></select></div>
        <div class="field"><label>Nivel</label><select id="science-level"><option>Desde cero</option><option>Secundaria</option><option>Diversificado / Bachillerato</option><option selected>Universitario básico</option><option>Universitario avanzado</option></select></div>
        <div class="field"><label>Modo</label><select id="science-mode"><option>Aprender desde cero</option><option>Explicación conceptual</option><option>Resolver problemas paso a paso</option><option>Práctica guiada</option><option>Modo socrático</option><option>Preparación para examen</option></select></div>
        <div class="field"><label>Tema personalizado</label><input id="science-custom" placeholder="Opcional: escribe un tema exacto"></div>
        <button id="science-start" class="primary-btn wide">INICIAR LECCIÓN GUIADA</button>
        <button id="science-new" class="secondary-btn wide" style="margin-top:8px">NUEVA SESIÓN</button>
      </aside>
      <div class="card chat-panel science-chat">
        <div id="science-messages" class="messages"><div class="message ai">Selecciona el tema y pulsa <strong>Iniciar lección guiada</strong>. También puedes preguntarme directamente cualquier duda de ${cfg.title}.</div></div>
        <div class="composer"><textarea id="science-input" rows="2" placeholder="Escribe una pregunta o un problema de ${cfg.title}..."></textarea><button id="science-send" class="primary-btn">Enviar</button></div>
      </div>
    </div>
    <div class="learning-pillar-grid" style="margin-top:16px">
      <div class="learning-pillar"><span>01</span><strong>Comprender</strong><small>Conceptos antes de memorizar fórmulas.</small></div>
      <div class="learning-pillar"><span>02</span><strong>Derivar</strong><small>Justificar de dónde sale cada relación.</small></div>
      <div class="learning-pillar"><span>03</span><strong>Practicar</strong><small>Problemas progresivos y corrección de errores.</small></div>
      <div class="learning-pillar"><span>04</span><strong>Dominar</strong><small>Exámenes y flashcards del tema estudiado.</small></div>
    </div>`;
  if(presetTopic && [...$("#science-topic").options].some(o=>o.value===presetTopic)) $("#science-topic").value=presetTopic;
  const start=()=>{
    const topic=$("#science-custom").value.trim() || $("#science-topic").value;
    const level=$("#science-level").value,mode=$("#science-mode").value;
    sendScienceMessage(code,`[INICIAR_LECCION] Tema: ${topic}. Nivel: ${level}. Modalidad: ${mode}. Empieza evaluando brevemente lo que necesito saber y luego enséñame paso a paso.`,true);
  };
  $("#science-start").onclick=start;
  $("#science-send").onclick=()=>sendScienceMessage(code);
  $("#science-input").addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendScienceMessage(code)}});
  $("#science-new").onclick=()=>{state.scienceConversation=null;$("#science-messages").innerHTML=`<div class="message ai">Nueva sesión de ${cfg.title}. Elige un tema o escribe tu pregunta.</div>`};
}

async function sendScienceMessage(code,forcedMessage=null,hideForced=false){
  const cfg=SCIENCE_CONFIG[code],input=$("#science-input");
  const message=(forcedMessage||input.value.trim()); if(!message)return;
  if(!hideForced)appendMessageTo("#science-messages","user",message); else appendMessageTo("#science-messages","user","Iniciar lección guiada");
  input.value="";
  const topic=$("#science-custom")?.value.trim() || $("#science-topic")?.value || "General";
  const level=$("#science-level")?.value||"Universitario básico";
  const studyMode=$("#science-mode")?.value||"Explicación conceptual";
  const subject=getSubjectByCode(code);
  const thinking=appendMessageTo("#science-messages","ai","Preparando explicación..."); thinking.classList.add("loading");
  $("#science-send").disabled=true;
  try{
    const result=await streamSpecialAI({mode:"science",message:`Área: ${cfg.title}. Tema: ${topic}. Nivel: ${level}. Modalidad: ${studyMode}.\n\n${message}`,conversationId:state.scienceConversation,subjectId:subject?.id||null,title:`${cfg.title} — ${topic}`,context:{area:cfg.title,topic,level,studyMode},target:thinking});
    state.scienceConversation=result.conversationId;
    if(subject)await saveResume({route:`/${code.toLowerCase()}`,subject_id:subject.id,topic_id:null,mode:code==="MATH"?"mathematics":code==="PHYS"?"physics":"astronomy",progress_percent:0,context:{subject:cfg.title,topic,level}}).catch(()=>{});
  }catch(err){thinking.classList.remove("loading");thinking.textContent=`Error: ${err.message}`}
  finally{$("#science-send").disabled=false;input.focus()}
}

const LANGUAGE_OPTIONS=[
  ["en-US","Inglés"],["fr-FR","Francés"],["pt-BR","Portugués"],["it-IT","Italiano"],["de-DE","Alemán"],["ja-JP","Japonés"],["ko-KR","Coreano"],["zh-CN","Chino mandarín"]
];

async function renderLanguageLab(){
  state.languageConversation=null; state.lastLanguageAnswer="";
  const subject=getSubjectByCode("LANG"); const presetLevel=state.currentTopic?.subject_id===subject?.id?state.currentTopic.name:null; state.currentSubject=subject;
  root.innerHTML=`
    <div class="page-head"><div><div class="eyebrow">LABORATORIO DE IDIOMAS</div><h2>Aprender idiomas</h2><p>Un curso progresivo que combina comprensión, conversación, vocabulario, gramática, pronunciación y escritura. No se limita a traducir o memorizar palabras.</p></div></div>
    <div class="language-course-grid">
      <aside class="card language-controls">
        <div class="panel-code">PLAN DE APRENDIZAJE</div>
        <div class="field"><label>Idioma objetivo</label><select id="lang-target">${LANGUAGE_OPTIONS.map(([c,n])=>`<option value="${c}">${n}</option>`).join("")}</select></div>
        <div class="field"><label>Nivel actual</label><select id="lang-level"><option>Empezar desde cero</option><option selected>A1 — Principiante</option><option>A2 — Elemental</option><option>B1 — Intermedio</option><option>B2 — Intermedio alto</option><option>C1 — Avanzado</option><option>C2 — Dominio</option></select></div>
        <div class="field"><label>Objetivo de la sesión</label><select id="lang-focus"><option>Curso completo equilibrado</option><option>Conversación</option><option>Comprensión auditiva</option><option>Pronunciación</option><option>Gramática en contexto</option><option>Vocabulario útil</option><option>Lectura</option><option>Escritura</option><option>Viajes y situaciones reales</option><option>Académico / profesional</option></select></div>
        <div class="field"><label>Inmersión</label><select id="lang-immersion"><option value="30">30% idioma objetivo — muchas explicaciones en español</option><option value="60" selected>60% idioma objetivo — equilibrio</option><option value="85">85% idioma objetivo — inmersión alta</option><option value="100">100% idioma objetivo — inmersión total</option></select></div>
        <button id="lang-start" class="primary-btn wide">INICIAR LECCIÓN</button>
        <button id="lang-placement" class="secondary-btn wide" style="margin-top:8px">PRUEBA DE NIVEL</button>
        <button id="lang-new" class="secondary-btn wide" style="margin-top:8px">NUEVA SESIÓN</button>
      </aside>
      <div class="card chat-panel language-chat">
        <div class="language-toolbar"><span id="language-session-label">Curso de idiomas</span><div><button id="lang-listen" class="secondary-btn">Escuchar respuesta</button></div></div>
        <div id="language-messages" class="messages"><div class="message ai">Selecciona el idioma y tu nivel. Empezaremos con una lección corta y activa, y ajustaré la dificultad según tus respuestas.</div></div>
        <div class="composer"><button id="lang-mic" class="icon-btn" title="Practicar hablando">🎙</button><textarea id="language-input" rows="2" placeholder="Escribe o habla en el idioma que estás aprendiendo..."></textarea><button id="language-send" class="primary-btn">Enviar</button></div>
      </div>
    </div>
    <div class="learning-pillar-grid language-pillars" style="margin-top:16px">
      <div class="learning-pillar"><span>01</span><strong>Comprensión</strong><small>Lectura y escucha con dificultad progresiva.</small></div>
      <div class="learning-pillar"><span>02</span><strong>Producción</strong><small>Hablar y escribir desde la primera sesión.</small></div>
      <div class="learning-pillar"><span>03</span><strong>Corrección</strong><small>Errores explicados sin interrumpir la fluidez.</small></div>
      <div class="learning-pillar"><span>04</span><strong>Retención</strong><small>Vocabulario en contexto y repaso espaciado.</small></div>
      <div class="learning-pillar"><span>05</span><strong>Pronunciación</strong><small>Modelos de frases, ritmo y sonidos difíciles.</small></div>
      <div class="learning-pillar"><span>06</span><strong>Uso real</strong><small>Conversaciones y situaciones auténticas.</small></div>
    </div>`;
  $("#lang-start").onclick=()=>startLanguageLesson(false);
  $("#lang-placement").onclick=()=>startLanguageLesson(true);
  $("#language-send").onclick=()=>sendLanguageMessage();
  $("#language-input").addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendLanguageMessage()}});
  $("#lang-new").onclick=()=>{state.languageConversation=null;state.lastLanguageAnswer="";$("#language-messages").innerHTML=`<div class="message ai">Nueva sesión lista. Elige tu objetivo y comienza.</div>`};
  $("#lang-mic").onclick=()=>startSpeechRecognition($("#language-input"),$("#lang-target").value);
  $("#lang-listen").onclick=()=>{if(!state.lastLanguageAnswer)return toast("Todavía no hay una respuesta para escuchar.",true);speakText(state.lastLanguageAnswer,$("#lang-target").value)};
  $("#lang-target").onchange=()=>updateLanguageLabel();
  $("#lang-level").onchange=()=>updateLanguageLabel();
  if(presetLevel){const prefix=presetLevel.slice(0,2);const option=[...$("#lang-level").options].find(o=>o.text.startsWith(prefix));if(option)$("#lang-level").value=option.value}
  updateLanguageLabel();
}

function updateLanguageLabel(){
  const sel=$("#lang-target"); if(!sel)return; const name=sel.options[sel.selectedIndex]?.text||"Idioma";
  $("#language-session-label").textContent=`${name} · ${$("#lang-level")?.value||"A1"}`;
}

function startLanguageLesson(placement=false){
  const lang=$("#lang-target").options[$("#lang-target").selectedIndex].text;
  const level=$("#lang-level").value,focus=$("#lang-focus").value,immersion=$("#lang-immersion").value;
  const prompt=placement
    ? `[PRUEBA_DE_NIVEL] Idioma objetivo: ${lang}. Evalúa mi nivel de manera progresiva, una pregunta o tarea por turno. No reveles todas las respuestas. Al terminar estima CEFR A1-C2 y explica qué debo reforzar.`
    : `[INICIAR_CURSO] Idioma objetivo: ${lang}. Nivel declarado: ${level}. Objetivo: ${focus}. Inmersión: ${immersion}%. Empieza una lección breve y activa. Presenta una sola actividad por turno, espera mi respuesta, corrige y continúa.`;
  sendLanguageMessage(prompt,true);
}

async function sendLanguageMessage(forcedMessage=null,hideForced=false){
  const input=$("#language-input"),message=forcedMessage||input.value.trim(); if(!message)return;
  if(!hideForced)appendMessageTo("#language-messages","user",message); else appendMessageTo("#language-messages","user",forcedMessage?.startsWith("[PRUEBA")?"Iniciar prueba de nivel":"Iniciar lección");
  input.value="";
  const langSel=$("#lang-target"),lang=langSel.options[langSel.selectedIndex].text,langCode=langSel.value;
  const level=$("#lang-level").value,focus=$("#lang-focus").value,immersion=$("#lang-immersion").value;
  const subject=getSubjectByCode("LANG");
  const thinking=appendMessageTo("#language-messages","ai","Preparando actividad...");thinking.classList.add("loading");
  $("#language-send").disabled=true;
  try{
    const result=await streamSpecialAI({mode:"language",message:`Idioma objetivo: ${lang} (${langCode}). Nivel: ${level}. Objetivo: ${focus}. Inmersión: ${immersion}%. Idioma nativo del estudiante: español.\n\n${message}`,conversationId:state.languageConversation,subjectId:subject?.id||null,title:`${lang} — ${level}`,context:{language:lang,languageCode:langCode,level,focus,immersion},target:thinking});
    state.languageConversation=result.conversationId;state.lastLanguageAnswer=result.answer;
    if(subject)await saveResume({route:"/languages",subject_id:subject.id,topic_id:null,mode:"languages",progress_percent:0,context:{subject:"Idiomas",language:lang,level,focus}}).catch(()=>{});
  }catch(err){thinking.classList.remove("loading");thinking.textContent=`Error: ${err.message}`}
  finally{$("#language-send").disabled=false;input.focus()}
}

function appendMessageTo(selector,role,text){
  const box=$(selector);const d=document.createElement("div");d.className=`message ${role}`;setMessageContent(d,role,text);box.appendChild(d);box.scrollTop=box.scrollHeight;return d;
}

async function streamSpecialAI({mode,message,conversationId,subjectId,title,context,target}){
  const response=await fetch("/api/ai/chat/stream",{method:"POST",credentials:"include",headers:{"content-type":"application/json"},body:JSON.stringify({mode,message,conversation_id:conversationId,subject_id:subjectId,title,context})});
  if(!response.ok){const d=await response.json().catch(()=>({}));throw new Error(d.error||`Error ${response.status}`)}
  const newConversation=response.headers.get("x-medai-conversation-id")||conversationId;
  target.classList.remove("loading");target.textContent="";
  const reader=response.body.getReader(),decoder=new TextDecoder();let buffer="",answer="";
  while(true){const {done,value}=await reader.read();if(done)break;buffer+=decoder.decode(value,{stream:true});const lines=buffer.split(/\r?\n/);buffer=lines.pop()||"";for(const line of lines){const t=line.trim();if(!t.startsWith("data:"))continue;const payload=t.slice(5).trim();if(!payload||payload==="[DONE]")continue;try{const obj=JSON.parse(payload),piece=extractStreamPieceClient(obj);if(piece){answer=smartAppendClient(answer,piece);target.textContent=answer;target.classList.add("streaming");target.parentElement.scrollTop=target.parentElement.scrollHeight}}catch{}}}
  target.classList.remove("streaming");if(!answer.trim()){answer="No pude generar la respuesta en este momento.";target.textContent=answer}
  return {conversationId:newConversation,answer};
}

function speakText(text,lang="en-US"){
  if(!("speechSynthesis" in window))return toast("La lectura en voz alta no está disponible en este navegador.",true);
  speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang=lang;u.rate=.92;speechSynthesis.speak(u);
}


async function renderPatientVirtual(){
  state.patientConversation=null;
  state.patientActive=false;
  root.innerHTML=`
    <div class="page-head"><div><div class="eyebrow">SIMULACIÓN CLÍNICA INTERACTIVA</div><h2>Paciente virtual</h2><p>Aquí tú realizas la entrevista. MED AI mantiene el caso oculto y solo revela la información que preguntes o explores.</p></div></div>
    <div class="patient-training-grid">
      <aside class="patient-setup card">
        <div class="panel-code">CONFIGURACIÓN DEL CASO</div>
        <h3>Preparar paciente</h3>
        <div class="field"><label>Sistema</label><select id="patient-system">
          <option value="aleatorio">Aleatorio</option><option>Cardiovascular</option><option>Respiratorio</option><option>Gastrointestinal</option><option>Neurológico</option><option>Renal</option><option>Endocrino</option><option>Hematológico</option><option>Infeccioso</option><option>Reumatológico</option>
        </select></div>
        <div class="field"><label>Dificultad</label><select id="patient-difficulty"><option>Básica</option><option selected>Intermedia</option><option>Avanzada</option><option>Residencia / Internista</option></select></div>
        <div class="field"><label>Escenario</label><select id="patient-setting"><option>Consulta externa</option><option>Urgencias</option><option>Hospitalización</option></select></div>
        <button id="start-patient" class="primary-btn wide">INICIAR ENTREVISTA</button>
        <div class="simulation-rules">
          <strong>Reglas de la simulación</strong>
          <span>01 · El diagnóstico permanece oculto.</span>
          <span>02 · El paciente no regala antecedentes.</span>
          <span>03 · El examen solo aparece si lo solicitas.</span>
          <span>04 · Los estudios solo aparecen si los ordenas.</span>
        </div>
      </aside>
      <section class="patient-workspace card">
        <div class="simulation-status"><div><i></i><span id="patient-status">SIMULACIÓN NO INICIADA</span></div><small id="patient-status-detail">Configura el caso y pulsa “Iniciar entrevista”.</small></div>
        <div id="patient-messages" class="messages patient-messages">
          <div class="message ai">Cuando inicies, recibirás únicamente la presentación inicial del paciente y su motivo de consulta. A partir de ahí, tú conduces la anamnesis.</div>
        </div>
        <div class="patient-command-strip hidden" id="patient-command-strip">
          <button data-patient-command="Quiero realizar el examen físico general. Dame únicamente los hallazgos que corresponden a lo que estoy examinando, sin interpretar ni revelar el diagnóstico.">Examen físico</button>
          <button data-patient-command="Quiero solicitar estudios. Espera a que yo indique exactamente cuáles antes de entregar resultados.">Solicitar estudios</button>
          <button id="evaluate-patient">Finalizar y evaluar</button>
        </div>
        <div class="composer patient-composer">
          <button id="patient-mic" class="icon-btn" title="Hablar">🎙</button>
          <textarea id="patient-input" rows="2" disabled placeholder="Primero inicia la entrevista..."></textarea>
          <button id="patient-send" class="primary-btn" disabled>ENVIAR</button>
        </div>
      </section>
    </div>`;

  $("#start-patient").onclick=startPatientInterview;
  $("#patient-send").onclick=sendPatientMessage;
  $("#patient-input").addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendPatientMessage()}});
  $("#patient-mic").onclick=()=>startSpeechRecognition($("#patient-input"));
}

async function startPatientInterview(){
  state.patientConversation=null;
  state.patientActive=true;
  const system=$("#patient-system").value;
  const difficulty=$("#patient-difficulty").value;
  const setting=$("#patient-setting").value;
  $("#start-patient").disabled=true;
  $("#patient-input").disabled=false;
  $("#patient-send").disabled=true;
  $("#patient-input").placeholder="Ej. Buenos días, ¿qué lo trae hoy a consulta?";
  $("#patient-status").textContent="GENERANDO PACIENTE...";
  $("#patient-status-detail").textContent="El diagnóstico se mantiene oculto.";
  $("#patient-messages").innerHTML="";

  const startPrompt=`[INICIAR_SIMULACION_PACIENTE]\nSistema: ${system}.\nDificultad: ${difficulty}.\nEscenario: ${setting}.\n\nCrea internamente un caso clínico coherente, pero NO reveles la solución. En este primer turno responde únicamente como el paciente: nombre ficticio, edad, sexo y motivo de consulta expresado en lenguaje natural del paciente. No entregues antecedentes, signos vitales, examen físico, laboratorios, diagnóstico, diferenciales ni tratamiento. Termina y espera mi primera pregunta.`;
  try{
    await streamClinicalMessage({mode:"patient",message:startPrompt,conversationKey:"patientConversation",container:"#patient-messages",thinkingText:"Preparando paciente..."});
    $("#patient-status").textContent="ENTREVISTA ACTIVA";
    $("#patient-status-detail").textContent="Pregunta como en una consulta real. MED AI solo revelará lo solicitado.";
    $("#patient-command-strip").classList.remove("hidden");
    $("#patient-send").disabled=false;
    $("#patient-input").focus();
    $$("[data-patient-command]").forEach(b=>b.onclick=()=>{$("#patient-input").value=b.dataset.patientCommand;sendPatientMessage()});
    $("#evaluate-patient").onclick=finishPatientInterview;
  }catch(err){
    $("#patient-status").textContent="NO SE PUDO INICIAR";
    $("#patient-status-detail").textContent=err.message;
    $("#start-patient").disabled=false;
  }
}

async function sendPatientMessage(){
  if(!state.patientActive)return;
  const input=$("#patient-input");
  const message=input.value.trim();if(!message)return;
  appendToContainer("#patient-messages","user",message);input.value="";
  $("#patient-send").disabled=true;
  try{
    await streamClinicalMessage({mode:"patient",message,conversationKey:"patientConversation",container:"#patient-messages",thinkingText:"El paciente responde..."});
  }catch(err){toast(err.message,true)}
  finally{$("#patient-send").disabled=false;input.focus()}
}

async function finishPatientInterview(){
  if(!state.patientActive)return;
  const prompt=`[FINALIZAR_Y_EVALUAR_SIMULACION]\nSal del papel de paciente. Ahora actúa como docente clínico. Revela el caso completo y evalúa mi desempeño en: anamnesis, examen físico solicitado, estudios, diagnóstico diferencial, diagnóstico principal y manejo. Señala qué pregunté bien, qué omití y cómo podría mejorar. Califica de 0 a 100.`;
  $("#patient-send").disabled=true;
  $("#evaluate-patient").disabled=true;
  appendToContainer("#patient-messages","user","Finalizar entrevista y evaluar mi desempeño.");
  try{
    await streamClinicalMessage({mode:"patient",message:prompt,conversationKey:"patientConversation",container:"#patient-messages",thinkingText:"Evaluando la entrevista..."});
    state.patientActive=false;
    $("#patient-status").textContent="SIMULACIÓN FINALIZADA";
    $("#patient-status-detail").textContent="Revisa la retroalimentación y luego inicia un nuevo paciente.";
    $("#patient-input").disabled=true;
    $("#patient-command-strip").classList.add("hidden");
    $("#start-patient").disabled=false;
    $("#start-patient").textContent="INICIAR NUEVO PACIENTE";
  }catch(err){toast(err.message,true);$("#evaluate-patient").disabled=false}
  finally{$("#patient-send").disabled=false}
}

async function renderCaseSolver(){
  state.caseSolverConversation=null;
  root.innerHTML=`
    <div class="page-head"><div><div class="eyebrow">RAZONAMIENTO CLÍNICO ASISTIDO</div><h2>Resolver caso clínico</h2><p>Pega aquí un caso completo. En este módulo MED AI sí puede analizarlo y darte la solución explicada paso a paso.</p></div></div>
    <div class="case-solver-grid">
      <section class="card case-input-panel">
        <div class="panel-code">CASO PROPORCIONADO POR EL ESTUDIANTE</div>
        <h3>Información clínica</h3>
        <div class="grid two compact-fields">
          <div class="field"><label>Materia</label><select id="case-subject">${subjectOptions(false,true)}</select></div>
          <div class="field"><label>Nivel de profundidad</label><select id="case-level"><option>Estudiante clínico</option><option>Internado</option><option>Médico general</option><option selected>Residencia</option><option>Internista</option></select></div>
        </div>
        <div class="field"><label>Caso clínico completo</label><textarea id="case-text" class="case-textarea" placeholder="Pega aquí el motivo de consulta, historia, antecedentes, examen físico, laboratorios, imágenes y cualquier otra información del caso..."></textarea></div>
        <div class="field"><label>Pregunta específica (opcional)</label><input id="case-question" placeholder="Ej. ¿Cuál es el diagnóstico más probable y por qué?"></div>
        <div class="case-actions"><button id="solve-case" class="primary-btn">ANALIZAR Y RESOLVER</button><button id="clear-case" class="secondary-btn">LIMPIAR</button></div>
        <div class="notice" style="margin-top:14px">Este módulo es para aprendizaje. Si introduces información de un paciente real, evita datos identificables y verifica las decisiones clínicas con supervisión y fuentes actuales.</div>
      </section>
      <section class="card case-output-panel">
        <div class="simulation-status"><div><i></i><span>ANÁLISIS CLÍNICO</span></div><small>La solución aparecerá progresivamente.</small></div>
        <div id="case-answer" class="case-answer"><div class="empty">Pega un caso y pulsa “Analizar y resolver”.</div></div>
      </section>
    </div>`;
  $("#solve-case").onclick=solveClinicalCase;
  $("#clear-case").onclick=()=>{$("#case-text").value="";$("#case-question").value="";$("#case-answer").innerHTML='<div class="empty">Pega un caso y pulsa “Analizar y resolver”.</div>';state.caseSolverConversation=null};
}

async function solveClinicalCase(){
  const caseText=$("#case-text").value.trim();if(!caseText)return toast("Pega primero el caso clínico.",true);
  const subjectId=$("#case-subject").value;
  const subject=state.subjects.find(s=>s.id===subjectId)?.name||"Medicina";
  const level=$("#case-level").value;
  const question=$("#case-question").value.trim();
  const prompt=`[RESOLVER_CASO_CLINICO]\nMateria: ${subject}.\nNivel: ${level}.\n\nCASO:\n${caseText}\n\n${question?`PREGUNTA DEL ESTUDIANTE: ${question}\n`:""}\nResuelve el caso de forma docente y estructurada. Incluye: 1) resumen clínico, 2) lista de problemas, 3) diagnóstico más probable y argumentos, 4) diferenciales priorizados con datos a favor/en contra, 5) estudios adicionales que pedirías y por qué, 6) manejo inicial y definitivo, 7) alertas o complicaciones, 8) puntos de aprendizaje. Señala incertidumbres y no inventes datos que no estén en el caso.`;
  $("#solve-case").disabled=true;
  $("#case-answer").innerHTML="";
  try{
    await streamClinicalMessage({mode:"case_solver",message:prompt,conversationKey:"caseSolverConversation",container:"#case-answer",thinkingText:"Analizando el caso...",appendUser:false});
  }catch(err){$("#case-answer").innerHTML=`<div class="notice">${escapeHtml(err.message)}</div>`}
  finally{$("#solve-case").disabled=false}
}

async function streamClinicalMessage({mode,message,conversationKey,container,thinkingText="Analizando...",appendUser=false}){
  const holder=$(container);
  const thinking=document.createElement("div");
  thinking.className="message ai loading";
  thinking.textContent=thinkingText;
  holder.appendChild(thinking);holder.scrollTop=holder.scrollHeight;
  const response=await fetch("/api/ai/chat/stream",{method:"POST",credentials:"include",headers:{"content-type":"application/json"},body:JSON.stringify({mode,message,conversation_id:state[conversationKey]||null,title:mode==="patient"?"Paciente virtual":"Resolver caso clínico"})});
  if(!response.ok){const e=await response.json().catch(()=>({}));thinking.remove();throw new Error(e.error||`Error ${response.status}`)}
  state[conversationKey]=response.headers.get("x-medai-conversation-id")||state[conversationKey];
  thinking.classList.remove("loading");thinking.textContent="";
  const reader=response.body.getReader();const decoder=new TextDecoder();let buffer="",answer="";
  while(true){
    const {done,value}=await reader.read();if(done)break;
    buffer+=decoder.decode(value,{stream:true});const lines=buffer.split(/\r?\n/);buffer=lines.pop()||"";
    for(const line of lines){const t=line.trim();if(!t.startsWith("data:"))continue;const payload=t.slice(5).trim();if(!payload||payload==="[DONE]")continue;try{const obj=JSON.parse(payload);const piece=extractStreamPieceClient(obj);if(piece){answer=smartAppendClient(answer,piece);thinking.textContent=answer;holder.scrollTop=holder.scrollHeight}}catch{}}
  }
  if(!answer.trim())thinking.textContent="No pude generar una respuesta en este momento.";
  return answer;
}

function appendToContainer(selector,role,text){
  const el=$(selector),m=document.createElement("div");m.className=`message ${role}`;setMessageContent(m,role,text);el.appendChild(m);el.scrollTop=el.scrollHeight;return m;
}

async function renderAIStudio(mode){
  const cfg=modeConfig(mode);
  state.chatConversation=null;
  root.innerHTML=`
    <div class="page-head"><div><div class="eyebrow">${escapeHtml(cfg.kicker)}</div><h2>${escapeHtml(cfg.title)}</h2><p>${escapeHtml(cfg.subtitle)}</p></div></div>
    <div class="chat-layout">
      <div class="card chat-panel">
        <div id="messages" class="messages">
          <div class="message ai">${escapeHtml(cfg.welcome)}</div>
        </div>
        <div class="composer">
          <button id="mic-btn" class="icon-btn" title="Hablar">🎙</button>
          <textarea id="chat-input" rows="2" placeholder="${escapeHtml(cfg.placeholder)}"></textarea>
          <button id="send-chat" class="primary-btn">Enviar</button>
        </div>
      </div>
      <div class="side-tools">
        <div class="card">
          <div class="eyebrow" style="margin-bottom:10px">CONFIGURACIÓN DE LA SESIÓN</div>
          <div class="field"><label>Materia</label><select id="ai-subject">${subjectOptions(false,true)}</select></div>
          <div class="field"><label>Nivel</label><select id="ai-level">
            <option>Primeros años</option><option>Ciencias básicas</option><option>Clínico</option>
            <option>Internado</option><option>Médico general</option><option>R1</option><option>R2</option><option>R3</option><option>Internista</option>
          </select></div>
          <button id="new-chat" class="ghost-btn wide">Nueva sesión</button>
        </div>
        <div class="info-box">Para que responda más rápido, procura hacer preguntas concretas. Ejemplo: “Explícame insuficiencia cardíaca en pasos” o “Hazme 5 preguntas de nefrología”.</div>
        <div class="notice">Entrenamiento educativo. En pacientes reales, verifica recomendaciones con fuentes clínicas actuales y supervisión profesional.</div>
      </div>
    </div>`;
  if(state.currentSubject) $("#ai-subject").value=state.currentSubject.id;
  $("#send-chat").onclick=()=>sendChat(mode);
  $("#chat-input").addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendChat(mode)}});
  $("#new-chat").onclick=()=>{state.chatConversation=null;$("#messages").innerHTML="";appendMessage("ai",cfg.welcome)};
  $("#mic-btn").onclick=()=>startSpeechRecognition($("#chat-input"));
}

async function sendChat(mode){
  const input=$("#chat-input"),message=input.value.trim();if(!message)return;
  appendMessage("user",message);input.value="";
  const subjectId=$("#ai-subject")?.value||state.currentSubject?.id||null;
  const subject=state.subjects.find(s=>s.id===subjectId)?.name||"Medicina";
  const level=$("#ai-level")?.value||"Clínico";
  const thinking=appendMessage("ai","Conectando con MED AI...");
  thinking.classList.add("loading");
  $("#send-chat").disabled=true;

  try{
    const response=await fetch("/api/ai/chat/stream",{
      method:"POST",
      credentials:"include",
      headers:{"content-type":"application/json"},
      body:JSON.stringify({
        mode,
        message:`Nivel del estudiante: ${level}. Materia: ${subject}.

${message}`,
        conversation_id:state.chatConversation,
        subject_id:subjectId,
        topic_id:state.currentTopic?.id||null,
        title:`${modeConfig(mode).title} — ${subject}`
      })
    });

    if(!response.ok){
      const errorData=await response.json().catch(()=>({}));
      throw new Error(errorData.error||`Error ${response.status}`);
    }

    state.chatConversation=response.headers.get("x-medai-conversation-id")||state.chatConversation;
    const speedMode=response.headers.get("x-medai-speed-mode")||"advanced";
    const model=response.headers.get("x-medai-model")||"Workers AI";

    thinking.classList.remove("loading");
    thinking.textContent="";
    thinking.title=speedMode==="fast"?`Respuesta rápida · ${model}`:`Razonamiento avanzado · ${model}`;

    const reader=response.body.getReader();
    const decoder=new TextDecoder();
    let sseBuffer="";
    let answer="";
    let gotFirstToken=false;

    while(true){
      const {done,value}=await reader.read();
      if(done)break;
      sseBuffer+=decoder.decode(value,{stream:true});
      const lines=sseBuffer.split(/\r?\n/);
      sseBuffer=lines.pop()||"";

      for(const line of lines){
        const trimmed=line.trim();
        if(!trimmed.startsWith("data:"))continue;
        const payload=trimmed.slice(5).trim();
        if(!payload||payload==="[DONE]")continue;
        try{
          const obj=JSON.parse(payload);
          const piece=extractStreamPieceClient(obj);
          if(piece){
            answer=smartAppendClient(answer,piece);
            thinking.textContent=answer;
            if(!gotFirstToken){
              gotFirstToken=true;
              thinking.classList.add("streaming");
            }
            $("#messages").scrollTop=$("#messages").scrollHeight;
          }
        }catch{}
      }
    }

    if(!answer.trim()) answer="No pude generar una respuesta en este momento.";
    thinking.classList.remove("streaming");
    setMessageContent(thinking,"ai",answer);
    await saveResume({route:`/${mode}`,subject_id:subjectId,topic_id:state.currentTopic?.id||null,mode,progress_percent:0,context:{subject,level}});
  }catch(err){
    thinking.classList.remove("loading","streaming");
    setMessageContent(thinking,"ai",`Error: ${err.message}`);
  }finally{
    $("#send-chat").disabled=false;input.focus();
  }
}

function extractStreamPieceClient(obj){
  if(!obj)return"";
  if(typeof obj.response==="string")return obj.response;
  if(typeof obj.text==="string")return obj.text;
  if(typeof obj.token==="string")return obj.token;
  const delta=obj.choices?.[0]?.delta?.content;
  if(typeof delta==="string")return delta;
  const content=obj.choices?.[0]?.message?.content;
  if(typeof content==="string")return content;
  return"";
}

function smartAppendClient(current,piece){
  if(!piece)return current;
  if(!current)return piece;
  if(piece.startsWith(current))return piece;
  if(current.endsWith(piece))return current;
  return current+piece;
}

async function renderVisionStudio(mode){
  const cfg=modeConfig(mode);
  root.innerHTML=`
    <div class="page-head"><div><div class="eyebrow">${escapeHtml(cfg.kicker)}</div><h2>${escapeHtml(cfg.title)}</h2><p>${escapeHtml(cfg.subtitle)}</p></div></div>
    <div class="grid two">
      <div class="card">
        <div class="upload-zone">
          <strong>Sube una imagen para entrenar interpretación</strong>
          <p>PNG, JPG o WEBP. La imagen se reduce localmente antes de enviarse a la IA.</p>
          <input id="vision-file" type="file" accept="image/*">
          <img id="vision-preview" class="preview-img hidden">
        </div>
        <div class="field" style="margin-top:16px"><label>Tu interpretación / pregunta</label><textarea id="vision-prompt" placeholder="${escapeHtml(cfg.placeholder)}"></textarea></div>
        <button id="vision-send" class="primary-btn wide">Analizar con tutor IA</button>
      </div>
      <div class="card"><h3>Retroalimentación</h3><div id="vision-answer" class="message ai" style="max-width:100%">${escapeHtml(cfg.welcome)}</div><div class="info-box" style="margin-top:12px">Escribe primero tu interpretación y luego pide corrección. Así aprenderás mucho más.</div></div>
    </div>`;
  $("#vision-file").onchange=async e=>{
    const file=e.target.files[0];if(!file)return;
    state.visionDataUrl=await resizeImage(file,1600,.82);
    $("#vision-preview").src=state.visionDataUrl;$("#vision-preview").classList.remove("hidden");
  };
  $("#vision-send").onclick=async()=>{
    if(!state.visionDataUrl)return toast("Primero selecciona una imagen.",true);
    const btn=$("#vision-send");btn.disabled=true;setMessageContent($("#vision-answer"),"ai","Analizando imagen...");
    try{
      const d=await api("/api/ai/vision",{method:"POST",body:{mode,image_data_url:state.visionDataUrl,prompt:$("#vision-prompt").value||cfg.placeholder}});
      setMessageContent($("#vision-answer"),"ai",d.answer);
    }catch(err){setMessageContent($("#vision-answer"),"ai",`Error: ${err.message}`)}finally{btn.disabled=false}
  };
}

async function renderExams(){
  root.innerHTML=`
    <div class="page-head"><div><div class="eyebrow">EVALUACIÓN ADAPTATIVA</div><h2>Exámenes IA</h2><p>Genera preguntas nuevas, en un formato limpio y con retroalimentación clara.</p></div></div>
    <div class="card" style="margin-bottom:16px"><div class="info-box">Si quieres más rapidez, usa 5 o 10 preguntas. Si quieres más profundidad, usa 15 o 20.</div></div>
    <div class="grid two">
      <div class="card">
        <div class="field"><label>Materia</label><select id="exam-subject">${subjectOptions()}</select></div>
        <div class="field"><label>Tema específico</label><input id="exam-topic" placeholder="Ej. insuficiencia cardíaca, derivadas, cinemática, inglés A1..."></div>
        <div class="field"><label>Número de preguntas</label><select id="exam-count"><option>5</option><option selected>10</option><option>15</option><option>20</option></select></div>
        <div class="field"><label>Dificultad</label><select id="exam-difficulty">${[1,2,3,4,5,6,7,8,9,10].map(n=>`<option ${n===5?"selected":""}>${n}</option>`).join("")}</select></div>
        <button id="generate-exam" class="primary-btn wide">Generar examen</button>
      </div>
      <div class="card"><h3>Cómo se evalúa</h3><p style="color:var(--muted);line-height:1.6">Selecciona una opción por pregunta. Al finalizar verás puntuación, respuesta correcta y explicación. El resultado queda registrado en tu perfil.</p></div>
    </div>
    <div id="exam-area" style="margin-top:16px"></div>`;
  $("#generate-exam").onclick=generateExam;
}
async function generateExam(){
  const btn=$("#generate-exam");btn.disabled=true;$("#exam-area").innerHTML=`<div class="card empty">Generando examen... esto puede tardar unos segundos.</div>`;
  const subjectId=$("#exam-subject").value,subject=state.subjects.find(s=>s.id===subjectId)?.name||"Medicina";
  const topic=$("#exam-topic").value.trim()||"general";
  try{
    const d=await api("/api/ai/exam",{method:"POST",body:{subject,topic,count:Number($("#exam-count").value),difficulty:Number($("#exam-difficulty").value)}});
    state.exam={questions:d.questions,answers:{},subject,topic,started_at:new Date().toISOString()};
    renderExamQuestions();
  }catch(err){$("#exam-area").innerHTML=`<div class="card"><p>${escapeHtml(err.message)}</p></div>`}
  finally{btn.disabled=false}
}
function renderExamQuestions(){
  const e=state.exam;
  $("#exam-area").innerHTML=`<div class="card">
    ${e.questions.map((q,i)=>`<div class="exam-question" data-q="${i}">
      <div class="eyebrow">PREGUNTA ${i+1}</div><h4>${escapeHtml(q.stem)}</h4>
      ${q.options.map((op,j)=>`<label class="option"><input type="radio" name="q${i}" value="${j}"><span>${escapeHtml(op)}</span></label>`).join("")}
      <div class="explanation hidden"></div>
    </div>`).join("")}
    <button id="finish-exam" class="primary-btn">Finalizar y calificar</button>
  </div>`;
  $$('input[type="radio"]',$("#exam-area")).forEach(r=>r.onchange=()=>{state.exam.answers[r.name]=Number(r.value)});
  $("#finish-exam").onclick=finishExam;
}
async function finishExam(){
  const e=state.exam;let score=0;
  e.questions.forEach((q,i)=>{
    const chosen=e.answers[`q${i}`],block=$(`.exam-question[data-q="${i}"]`);
    $$(".option",block).forEach((o,j)=>{if(j===q.correctIndex)o.classList.add("correct");if(j===chosen&&j!==q.correctIndex)o.classList.add("wrong")});
    const exp=$(".explanation",block);exp.classList.remove("hidden");exp.innerHTML=`<div class="notice">${escapeHtml(q.explanation)}</div>`;
    if(chosen===q.correctIndex)score++;
  });
  const pct=Math.round(score/e.questions.length*100);
  $("#finish-exam").replaceWith(Object.assign(document.createElement("div"),{innerHTML:`<h3>Resultado: ${score}/${e.questions.length} — ${pct}%</h3>`}));
  await api("/api/exams/record",{method:"POST",body:{
    title:`${e.subject} — ${e.topic}`,score,max_score:e.questions.length,percentage:pct,started_at:e.started_at,
    settings:{subject:e.subject,topic:e.topic},questions:e.questions,answers:e.answers
  }}).catch(()=>{});
  toast(`Examen registrado: ${pct}%`);
}

async function renderFlashcards(){
  const data=await api("/api/flashcards?due=1");state.dueCards=data.flashcards||[];state.cardIndex=0;state.showingBack=false;
  root.innerHTML=`
    <div class="page-head"><div><div class="eyebrow">REPETICIÓN ESPACIADA</div><h2>Flashcards enfocadas</h2><p>Ahora MED AI separa la materia del tema para evitar mezclar contenidos.</p></div><button id="generate-cards" class="primary-btn">Generar flashcards</button></div>
    <div class="card" style="margin-bottom:16px"><div class="info-box"><strong>Para mejores tarjetas:</strong> elige la materia y escribe un tema concreto. Por ejemplo: <em>Anatomía → huesos del cráneo</em>, en lugar de escribir solamente “Anatomía”.</div></div>
    <div id="flash-area"></div>
    <div class="card" id="card-generator" style="margin-top:16px">
      <div class="eyebrow" style="margin-bottom:12px">CREAR NUEVO BLOQUE DE FLASHCARDS</div>
      <div class="grid two">
        <div class="field"><label>Materia</label><select id="card-subject">${subjectOptions()}</select></div>
        <div class="field"><label>Tema específico</label><input id="card-topic" placeholder="Ej. huesos del cráneo, derivadas, leyes de Newton, inglés A1"></div>
        <div class="field"><label>Nivel</label><select id="card-level"><option>Fundamentos</option><option>Secundaria</option><option>Diversificado / Bachillerato</option><option selected>Universitario básico</option><option>Universitario avanzado</option><option>Clínico</option><option>Residencia médica</option><option>A1</option><option>A2</option><option>B1</option><option>B2</option><option>C1</option><option>C2</option></select></div>
        <div class="field"><label>Enfoque</label><select id="card-focus"><option value="fundamentos">Fundamentos esenciales</option><option value="definiciones y relaciones">Definiciones y relaciones</option><option value="memorización exacta">Memorización exacta</option><option value="aplicación práctica dentro del tema">Aplicación práctica</option><option value="problemas y ejercicios dentro del tema">Problemas y ejercicios</option><option value="preguntas tipo examen sin salir del tema">Tipo examen</option></select></div>
        <div class="field"><label>Cantidad</label><select id="card-count"><option>5</option><option selected>10</option><option>15</option><option>20</option></select></div>
      </div>
      <div class="info-box">La IA recibirá un alcance estricto: <strong>Materia + Tema + Nivel + Enfoque</strong>. Esto reduce muchísimo las mezclas entre contenidos.</div>
    </div>`;
  if(state.currentSubject) $("#card-subject").value=state.currentSubject.id;
  $("#generate-cards").onclick=generateCardsAI;
  renderCurrentCard();
}
function renderCurrentCard(){
  const area=$("#flash-area");if(!area)return;
  if(!state.dueCards.length){area.innerHTML=`<div class="card empty">No tienes tarjetas pendientes. Crea un bloque nuevo con materia y tema específico.</div>`;return}
  const c=state.dueCards[state.cardIndex%state.dueCards.length];
  let tags=[];try{tags=JSON.parse(c.tags_json||"[]")}catch{}
  const tagLine=tags.length?`<div style="display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin-bottom:12px">${tags.slice(0,4).map(t=>`<span class="badge">${escapeHtml(t)}</span>`).join("")}</div>`:"";
  area.innerHTML=`<div class="card flashcard-stage"><div style="width:100%">
    ${tagLine}
    <div class="flashcard" id="flip-card">${state.showingBack?`<div class="back">${escapeHtml(c.back)}</div>`:`<div><div class="eyebrow">FRENTE</div><h2>${escapeHtml(c.front)}</h2><p style="color:var(--text-soft)">Toca para mostrar respuesta</p></div>`}</div>
    <div class="grade-row" style="margin-top:14px">
      ${state.showingBack?[["0","Otra vez"],["2","Difícil"],["4","Bien"],["5","Fácil"]].map(([g,t])=>`<button class="grade-btn" data-grade="${g}">${t}</button>`).join(""):""}
      <button id="discard-card" class="grade-btn" style="color:var(--danger)">Descartar tarjeta</button>
    </div>
  </div></div>`;
  $("#flip-card").onclick=()=>{state.showingBack=true;renderCurrentCard()};
  $$(".grade-btn[data-grade]").forEach(b=>b.onclick=async e=>{
    e.stopPropagation();await api("/api/flashcards/review",{method:"POST",body:{flashcard_id:c.id,grade:Number(b.dataset.grade)}}).catch(()=>{});
    state.dueCards.splice(state.cardIndex%state.dueCards.length,1);state.cardIndex=0;state.showingBack=false;renderCurrentCard();
  });
  $("#discard-card").onclick=async e=>{
    e.stopPropagation();
    try{await api(`/api/flashcards?id=${encodeURIComponent(c.id)}`,{method:"DELETE"});state.dueCards.splice(state.cardIndex%state.dueCards.length,1);state.cardIndex=0;state.showingBack=false;toast("Tarjeta descartada.");renderCurrentCard()}catch(err){toast(err.message,true)}
  };
}
async function generateCardsAI(){
  const subjectId=$("#card-subject").value;
  const subject=state.subjects.find(s=>s.id===subjectId)?.name||"Medicina";
  const topic=$("#card-topic").value.trim();
  const level=$("#card-level").value;
  const focus=$("#card-focus").value;
  if(topic.length<3)return toast("Escribe un tema específico, por ejemplo: huesos del cráneo.",true);
  const btn=$("#generate-cards");btn.disabled=true;btn.textContent="Generando tarjetas enfocadas...";
  try{
    const d=await api("/api/ai/flashcards",{method:"POST",body:{subject,topic,level,focus,count:Number($("#card-count").value)}});
    for(const c of d.cards){
      await api("/api/flashcards",{method:"POST",body:{
        front:c.front,back:c.back,hint:c.hint,source_type:"ai_focused",
        tags:[subject,topic,level],metadata:{subject,topic,level,focus,provider:d.provider,model:d.model}
      }});
    }
    toast(`${d.cards.length} flashcards enfocadas creadas sobre ${topic}.`);await renderFlashcards();
  }catch(err){toast(err.message,true)}finally{btn.disabled=false;btn.textContent="Generar flashcards"}
}

async function renderLibrary(){
  const notes=await api("/api/notes");
  root.innerHTML=`
    <div class="page-head"><div><div class="eyebrow">BIBLIOTECA PERSONAL</div><h2>Apuntes y documentos</h2><p>Un espacio limpio y ordenado para guardar tus notas importantes.</p></div></div>
    <div class="grid two">
      <div class="card">
        <h3>Nuevo apunte</h3>
        <div class="field"><label>Título</label><input id="note-title"></div>
        <div class="field"><label>Contenido</label><textarea id="note-body" style="min-height:220px"></textarea></div>
        <button id="save-note" class="primary-btn">Guardar apunte</button>
      </div>
      <div class="card">
        <h3>Mis apuntes</h3><div id="notes-list" class="list">${notes.notes.length?notes.notes.map(noteItem).join(""):`<div class="empty">Aún no tienes apuntes.</div>`}</div>
      </div>
    </div>
    <div class="notice" style="margin-top:16px">La estructura de D1 ya incluye documentos y fragmentos. Los PDFs completos se conectarán a Cloudflare R2 para no llenar D1 con archivos binarios.</div>`;
  $("#save-note").onclick=async()=>{
    try{await api("/api/notes",{method:"POST",body:{title:$("#note-title").value,body:$("#note-body").value}});toast("Apunte guardado.");renderLibrary()}catch(err){toast(err.message,true)}
  };
  $$(".delete-note").forEach(b=>b.onclick=async()=>{await api(`/api/notes?id=${encodeURIComponent(b.dataset.id)}`,{method:"DELETE"});renderLibrary()});
}

async function renderMistakes(){
  const d=await api("/api/mistakes");
  root.innerHTML=`<div class="page-head"><div><div class="eyebrow">CUADERNO DE ERRORES</div><h2>Errores que debes dominar</h2><p>Tu aprendizaje mejora cuando conviertes cada fallo en una fortaleza.</p></div></div>
  <div class="list">${d.mistakes.length?d.mistakes.map(m=>`<div class="list-item"><div class="grow"><strong>${escapeHtml(m.prompt)}</strong><span>${escapeHtml(m.topic_name||m.error_category||"Error registrado")}</span>${m.explanation?`<p>${escapeHtml(m.explanation)}</p>`:""}</div><span class="badge">${Math.round(m.mastery_score||0)}%</span></div>`).join(""):`<div class="card empty">Aún no hay errores registrados.</div>`}</div>`;
}

async function renderPlan(){
  const [d]=await Promise.all([api("/api/deadlines")]);
  root.innerHTML=`<div class="page-head"><div><div class="eyebrow">PLANIFICADOR</div><h2>Plan de estudio</h2><p>Registra parciales, finales y objetivos en una vista más clara y organizada.</p></div></div>
  <div class="grid two">
    <div class="card"><h3>Nueva fecha importante</h3>
      <div class="field"><label>Título</label><input id="deadline-title" placeholder="Parcial de fisiología"></div>
      <div class="field"><label>Fecha y hora</label><input id="deadline-date" type="datetime-local"></div>
      <div class="field"><label>Materia</label><select id="deadline-subject">${subjectOptions(true)}</select></div>
      <div class="field"><label>Importancia</label><select id="deadline-importance"><option>1</option><option>2</option><option selected>3</option><option>4</option><option>5</option></select></div>
      <button id="save-deadline" class="primary-btn">Guardar</button>
    </div>
    <div class="card"><h3>Próximas fechas</h3><div class="list">${d.deadlines.length?d.deadlines.map(x=>`<div class="list-item"><div class="grow"><strong>${escapeHtml(x.title)}</strong><span>${escapeHtml(x.subject_name||x.deadline_type)} · ${formatDate(x.due_at)}</span></div><span class="badge">P${x.importance}</span></div>`).join(""):`<div class="empty">Sin fechas registradas.</div>`}</div></div>
  </div>`;
  $("#save-deadline").onclick=async()=>{
    const local=$("#deadline-date").value;if(!local)return toast("Selecciona la fecha.",true);
    try{await api("/api/deadlines",{method:"POST",body:{title:$("#deadline-title").value,due_at:new Date(local).toISOString(),subject_id:$("#deadline-subject").value||null,importance:Number($("#deadline-importance").value)}});toast("Fecha guardada.");renderPlan()}catch(err){toast(err.message,true)}
  };
}

async function renderStats(){
  const d=await api("/api/stats");const daily=[...(d.daily||[])].reverse();
  const max=Math.max(1,...daily.map(x=>Number(x.study_seconds||0)));
  root.innerHTML=`<div class="page-head"><div><div class="eyebrow">ANALÍTICA DE APRENDIZAJE</div><h2>Estadísticas</h2><p>Tu progreso medido con una vista más limpia y fácil de entender.</p></div></div>
  <div class="grid stats4">
    ${metric("Preguntas",d.totals?.questions||0,"Respondidas")}
    ${metric("Casos",d.totals?.cases||0,"Completados")}
    ${metric("Repasos",d.totals?.reviews||0,"Flashcards")}
    ${metric("Sesiones",d.totals?.sessions||0,"De estudio")}
  </div>
  <div class="grid two" style="margin-top:16px">
    <div class="card"><h3>Tiempo de estudio — últimos 30 días</h3><div class="chart-bars">${daily.length?daily.map(x=>`<div class="bar" title="${x.metric_date}: ${Math.round(x.study_seconds/60)} min" style="height:${Math.max(3,Number(x.study_seconds)/max*100)}%"></div>`).join(""):`<div class="empty">Todavía no hay datos.</div>`}</div>${daily.length?`<div class="bar-labels"><span>${daily[0]?.metric_date||""}</span><span>${daily.at(-1)?.metric_date||""}</span></div>`:""}</div>
    <div class="card"><h3>Temas a reforzar</h3><div class="list">${d.mastery?.length?d.mastery.slice(0,10).map(x=>`<div class="list-item"><div class="grow"><strong>${escapeHtml(x.topic_name)}</strong><span>${escapeHtml(x.subject_name)}</span></div><span class="badge">${Math.round(x.mastery||0)}%</span></div>`).join(""):`<div class="empty">Estudia temas para construir tu mapa de dominio.</div>`}</div></div>
  </div>`;
}

async function renderProfile(){
  const d=await api("/api/me"),u=d.user;
  root.innerHTML=`<div class="page-head"><div><div class="eyebrow">PERFIL MÉDICO</div><h2>Mi perfil</h2><p>Tu información académica y de estudio sincronizada en todos tus dispositivos.</p></div></div>
  <div class="grid two">
    <div class="card">
      ${profileField("Nombre","pf-name",u.full_name||"")}
      ${profileField("Universidad","pf-university",u.university||"")}
      ${profileField("Nivel académico","pf-level",u.academic_level||"estudiante")}
      ${profileField("Especialidad objetivo","pf-specialty",u.target_specialty||"Medicina Interna")}
      ${profileField("País","pf-country",u.country||"Guatemala")}
      <div class="field"><label>Biografía / objetivo</label><textarea id="pf-bio">${escapeHtml(u.bio||"")}</textarea></div>
      <button id="save-profile" class="primary-btn">Guardar perfil</button>
    </div>
    <div class="card">
      <h3>Cuenta</h3><p style="color:var(--muted)">${escapeHtml(u.email||"")}</p>
      <div class="field"><label>Contraseña actual</label><input id="old-pass" type="password"></div>
      <div class="field"><label>Nueva contraseña</label><input id="new-pass" type="password" minlength="10"></div>
      <button id="change-pass" class="ghost-btn">Cambiar contraseña</button>
      <div class="notice" style="margin-top:16px">Al cambiar la contraseña se cerrarán todas las sesiones por seguridad.</div>
    </div>
  </div>`;
  $("#save-profile").onclick=async()=>{
    try{const r=await api("/api/profile",{method:"PUT",body:{full_name:$("#pf-name").value,university:$("#pf-university").value,academic_level:$("#pf-level").value,target_specialty:$("#pf-specialty").value,country:$("#pf-country").value,bio:$("#pf-bio").value}});state.user=r.user;toast("Perfil actualizado.")}catch(err){toast(err.message,true)}
  };
  $("#change-pass").onclick=async()=>{
    try{await api("/api/auth/change-password",{method:"POST",body:{currentPassword:$("#old-pass").value,newPassword:$("#new-pass").value}});alert("Contraseña cambiada. Inicia sesión nuevamente.");location.reload()}catch(err){toast(err.message,true)}
  };
}

function modeConfig(mode){
  return {
    tutor:{kicker:"TUTOR PERSONAL",title:"Tutor médico IA",subtitle:"Aprende cualquier tema a tu nivel.",welcome:"¿Qué quieres dominar hoy? Puedo explicarlo, preguntarte y cambiar a modo socrático.",placeholder:"Ej. Enséñame insuficiencia cardíaca como estudiante clínico."},
    patient:{kicker:"SIMULACIÓN CLÍNICA",title:"Paciente virtual",subtitle:"Entrevista clínica progresiva.",welcome:"El caso permanece oculto y solo se revela lo que preguntes.",placeholder:"Pregunta al paciente como en una consulta real."},
    case_solver:{kicker:"RAZONAMIENTO CLÍNICO",title:"Resolver caso clínico",subtitle:"Análisis completo de un caso proporcionado por ti.",welcome:"Pega un caso para resolverlo.",placeholder:"Pega el caso clínico completo."},
    grand_rounds:{kicker:"MEDICINA INTERNA AVANZADA",title:"Grand Rounds",subtitle:"Casos complejos con múltiples problemas.",welcome:"Te presentaré un caso de alta complejidad. Organiza problemas, diferenciales, estudios y tratamiento.",placeholder:"Dame un Grand Round de nefrología nivel R2."},
    emergency:{kicker:"SIMULACIÓN DE URGENCIAS",title:"Emergencias",subtitle:"Prioriza y decide bajo presión.",welcome:"Elige una emergencia o pide una aleatoria. Evalúo prioridades y decisiones críticas.",placeholder:"Simula un paciente con shock sin decirme la causa."},
    laboratory:{kicker:"INTERPRETACIÓN",title:"Laboratorios",subtitle:"Integra patrones, fisiopatología y decisiones.",welcome:"Puedo darte paneles de laboratorio para que los interpretes o analizar resultados educativos que escribas.",placeholder:"Dame una gasometría difícil y no me digas el diagnóstico."},
    pharmacology:{kicker:"FARMACOLOGÍA CLÍNICA",title:"Farmacología",subtitle:"Mecanismos, indicaciones, seguridad y razonamiento.",welcome:"Dime un fármaco, una familia o un escenario clínico.",placeholder:"Pregúntame sobre IECA y corrige mis errores."},
    osce:{kicker:"ESTACIONES CLÍNICAS",title:"OSCE",subtitle:"Historia, comunicación, examen y cierre.",welcome:"Puedo actuar como paciente estandarizado y examinador.",placeholder:"Inicia una estación OSCE de disnea de 8 minutos."},
    ecg:{kicker:"ELECTROCARDIOGRAFÍA",title:"ECG",subtitle:"Interpretación sistemática y correlación clínica.",welcome:"Sube un ECG educativo y primero intenta interpretarlo. Luego te daré retroalimentación.",placeholder:"Esta es mi interpretación: ritmo..., frecuencia..., eje... ¿qué me falta?"},
    radiology:{kicker:"IMAGENOLOGÍA",title:"Radiología",subtitle:"Describe antes de diagnosticar.",welcome:"Sube una imagen educativa y escribe tu interpretación. Te guiaré sistemáticamente.",placeholder:"Describe hallazgos, diagnóstico probable y diferenciales."}
  }[mode]||{kicker:"MED AI",title:"Entrenamiento",subtitle:"",welcome:"Empecemos.",placeholder:"Escribe aquí..."};
}


function applySavedTheme(){
  const saved=localStorage.getItem("medai_theme");
  const prefersLight=window.matchMedia?.("(prefers-color-scheme: light)")?.matches;
  const theme=saved || (prefersLight?"light":"dark");
  document.documentElement.dataset.theme=theme;
  updateThemeButton(theme);
}
function toggleTheme(){
  const current=document.documentElement.dataset.theme||"dark";
  const next=current==="dark"?"light":"dark";
  document.documentElement.dataset.theme=next;
  localStorage.setItem("medai_theme",next);
  updateThemeButton(next);
}
function updateThemeButton(theme){
  const btn=$("#theme-toggle");
  if(!btn)return;
  btn.textContent=theme==="dark"?"☀":"☾";
  btn.title=theme==="dark"?"Usar modo claro suave":"Usar modo oscuro suave";
  btn.setAttribute("aria-label",btn.title);
}

// -------------------- PWA / SEARCH / OFFLINE --------------------

async function searchGlobal(){
  const q=$("#global-search").value.trim(),box=$("#search-results");
  if(q.length<2){box.classList.add("hidden");return}
  try{
    const d=await api(`/api/search?q=${encodeURIComponent(q)}`);
    box.innerHTML=d.results.length?d.results.map(r=>`<div class="search-item"><strong>${escapeHtml(r.title)}</strong><span>${escapeHtml(r.subtitle||r.type)}</span></div>`).join(""):`<div class="search-item"><span>Sin resultados.</span></div>`;
    box.classList.remove("hidden");
  }catch{}
}

function setupPWA(){
  if("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js?v=4.0.0").catch(()=>{});
  window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();state.deferredPrompt=e;$("#install-btn").classList.remove("hidden")});
  $("#install-btn").onclick=async()=>{if(state.deferredPrompt){state.deferredPrompt.prompt();await state.deferredPrompt.userChoice;state.deferredPrompt=null;$("#install-btn").classList.add("hidden")}};
}

async function api(url,opts={}){
  const config={credentials:"include",...opts,headers:{"content-type":"application/json",...(opts.headers||{})}};
  if(opts.body && typeof opts.body!=="string") config.body=JSON.stringify(opts.body);
  try{
    const res=await fetch(url,config);
    const data=await res.json().catch(()=>({}));
    if(!res.ok) throw new Error(data.error||`Error ${res.status}`);
    return data;
  }catch(err){
    if(!navigator.onLine && ["POST","PUT","DELETE"].includes((opts.method||"GET").toUpperCase()) && !url.includes("/auth/")){
      queueOffline({url,opts:{...opts,body:typeof opts.body==="string"?JSON.parse(opts.body):opts.body}});
      toast("Sin internet: cambio guardado para sincronizar.",false);
      return {ok:true,queued:true};
    }
    throw err;
  }
}
function queueOffline(item){const q=JSON.parse(localStorage.getItem("medai_queue")||"[]");q.push({...item,id:crypto.randomUUID(),at:new Date().toISOString()});localStorage.setItem("medai_queue",JSON.stringify(q))}
async function flushOfflineQueue(){
  const q=JSON.parse(localStorage.getItem("medai_queue")||"[]");if(!q.length)return;
  const pending=[];
  for(const item of q){try{await api(item.url,item.opts)}catch{pending.push(item)}}
  localStorage.setItem("medai_queue",JSON.stringify(pending));
  if(!pending.length)toast("Cambios sin conexión sincronizados.");
}
function updateNetworkBadge(){
  const b=$("#sync-badge");if(!b)return;
  b.textContent=navigator.onLine?"● Sincronizado":"● Sin conexión";b.classList.toggle("offline",!navigator.onLine);
}
async function saveResume(data){return api("/api/resume",{method:"PUT",body:{...data,device_id:getDeviceId()}})}
function getDeviceId(){let id=localStorage.getItem("medai_device");if(!id){id=crypto.randomUUID();localStorage.setItem("medai_device",id)}return id}

// -------------------- UI HELPERS --------------------

function metric(label,value,sub,icon="◦"){return `<div class="card metric-card"><div class="metric-icon">${icon}</div><div class="metric-label">${escapeHtml(label)}</div><div class="metric-value">${escapeHtml(String(value))}</div><div class="metric-sub">${escapeHtml(sub)}</div></div>`}
function modeCard(title,p,view,icon){return `<div class="card mode-card" data-view="${view}"><div class="metric-icon">${icon}</div><h3>${escapeHtml(title)}</h3><p>${escapeHtml(p)}</p></div>`}
function subjectCard(s){return `<div class="card subject-card" data-id="${s.id}"><div class="category">${escapeHtml(s.category||"Medicina")}</div><h3>${escapeHtml(s.name)}</h3><p>${escapeHtml(s.description||"Abrir materia y comenzar entrenamiento.")}</p><span class="badge" style="margin-top:10px">Abrir materia</span></div>`}
function setMessageContent(el,role,text){
  const value=String(text??"");
  if(role==="ai"){
    el.classList.add("rich");
    el.innerHTML=renderRichResponse(value);
  }else{
    el.classList.remove("rich");
    el.textContent=value;
  }
}

function renderRichResponse(text){
  const clean=String(text??"").replace(/\r/g, "").trim();
  if(!clean) return '<div class="rich-response"><p></p></div>';
  const lines=clean.split("\n");
  const blocks=[];
  let paragraph=[];
  let listItems=[];
  let listType='';

  function flushParagraph(){
    if(!paragraph.length) return;
    blocks.push(`<p>${formatInline(paragraph.join(" "))}</p>`);
    paragraph=[];
  }
  function flushList(){
    if(!listItems.length) return;
    const tag=listType==='ol'?'ol':'ul';
    blocks.push(`<${tag}>${listItems.map(i=>`<li>${formatInline(i)}</li>`).join("")}</${tag}>`);
    listItems=[];
    listType='';
  }

  for(const rawLine of lines){
    const line=rawLine.trim();
    if(!line){ flushParagraph(); flushList(); continue; }

    const heading=line.match(/^(#{1,4})\s+(.+)$/);
    if(heading){
      flushParagraph(); flushList();
      const level=Math.min(4, heading[1].length+1);
      blocks.push(`<h${level}>${formatInline(heading[2])}</h${level}>`);
      continue;
    }

    if(/^(-{3,}|_{3,}|\*{3,})$/.test(line)){
      flushParagraph(); flushList(); blocks.push('<hr>'); continue;
    }

    const bullet=line.match(/^[-*•]\s+(.+)$/);
    if(bullet){
      flushParagraph();
      if(listType && listType!=="ul") flushList();
      listType="ul";
      listItems.push(bullet[1]);
      continue;
    }

    const ordered=line.match(/^\d+[.)]\s+(.+)$/);
    if(ordered){
      flushParagraph();
      if(listType && listType!=="ol") flushList();
      listType="ol";
      listItems.push(ordered[1]);
      continue;
    }

    const callout=line.match(/^>\s+(.+)$/);
    if(callout){
      flushParagraph(); flushList();
      blocks.push(`<blockquote>${formatInline(callout[1])}</blockquote>`);
      continue;
    }

    if(/^[A-ZÁÉÍÓÚÑ0-9 ]{3,40}:$/.test(line) || /^[A-Z][A-Za-zÁÉÍÓÚÑáéíóúñ ]{2,36}:$/.test(line)){
      flushParagraph(); flushList();
      blocks.push(`<h4>${formatInline(line.replace(/:$/, ""))}</h4>`);
      continue;
    }

    paragraph.push(line);
  }

  flushParagraph();
  flushList();
  return `<div class="rich-response">${blocks.join("") || `<p>${formatInline(clean)}</p>`}</div>`;
}

function formatInline(text){
  let s=escapeHtml(String(text??""));
  s=s.replace(/`([^`]+)`/g,'<code>$1</code>');
  s=s.replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>');
  s=s.replace(/__(.+?)__/g,'<strong>$1</strong>');
  s=s.replace(/\*([^*]+)\*/g,'<em>$1</em>');
  s=s.replace(/_([^_]+)_/g,'<em>$1</em>');
  return s;
}

function subjectOptions(includeBlank=false,medicalOnly=false){
  const list=medicalOnly?state.subjects.filter(s=>!['MATH','PHYS','ASTRO','LANG'].includes(s.code)):state.subjects;
  return `${includeBlank?'<option value="">Sin especificar</option>':""}${list.map(s=>`<option value="${s.id}">${escapeHtml(s.name)}</option>`).join("")}`
}
function listRecent(items){return items?.length?`<div class="list">${items.map(x=>`<div class="list-item"><div class="grow"><strong>${escapeHtml(x.topic_name)}</strong><span>${escapeHtml(x.subject_name)}</span></div><span class="badge">${Math.round(x.mastery||0)}%</span></div>`).join("")}</div>`:`<div class="empty">Tu actividad aparecerá aquí.</div>`}
function listDeadlinesCompact(items){return items?.length?`<div class="list">${items.map(x=>`<div class="list-item"><div class="grow"><strong>${escapeHtml(x.title)}</strong><span>${formatDate(x.due_at)}</span></div><span class="badge">P${x.importance}</span></div>`).join("")}</div>`:`<div class="empty">No hay fechas pendientes.</div>`}
function noteItem(n){return `<div class="list-item"><div class="grow"><strong>${escapeHtml(n.title)}</strong><span>${formatDate(n.updated_at)}</span><p style="white-space:pre-wrap">${escapeHtml((n.body||"").slice(0,260))}</p></div><button class="danger-btn delete-note" data-id="${n.id}">Eliminar</button></div>`}
function profileField(label,id,value){return `<div class="field"><label>${escapeHtml(label)}</label><input id="${id}" value="${escapeAttr(value)}"></div>`}
function appendMessage(role,text){const m=document.createElement("div");m.className=`message ${role}`;setMessageContent(m,role,text);$("#messages").appendChild(m);$("#messages").scrollTop=$("#messages").scrollHeight;return m}
function toast(text,error=false){const t=document.createElement("div");t.className=`toast ${error?"error":""}`;t.textContent=text;$("#toast-root").appendChild(t);setTimeout(()=>t.remove(),3300)}
function firstName(n){return String(n||"").trim().split(/\s+/)[0]}
function formatDate(v){if(!v)return"Sin fecha";const d=new Date(v);return isNaN(d)?String(v):d.toLocaleString("es-GT",{dateStyle:"medium",timeStyle:"short"})}
function escapeHtml(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function escapeAttr(s){return escapeHtml(s).replace(/`/g,"&#96;")}
function debounce(fn,ms){let t;return(...a)=>{clearTimeout(t);t=setTimeout(()=>fn(...a),ms)}}

function startSpeechRecognition(target,lang="es-GT"){
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR)return toast("El reconocimiento de voz no está disponible en este navegador.",true);
  const r=new SR();r.lang=lang;r.interimResults=false;r.maxAlternatives=1;
  r.onresult=e=>{target.value=(target.value+" "+e.results[0][0].transcript).trim();target.focus()};
  r.onerror=()=>toast("No se pudo reconocer la voz.",true);r.start();
}

async function resizeImage(file,maxDim=1600,quality=.82){
  const bitmap=await createImageBitmap(file);
  const scale=Math.min(1,maxDim/Math.max(bitmap.width,bitmap.height));
  const canvas=document.createElement("canvas");canvas.width=Math.round(bitmap.width*scale);canvas.height=Math.round(bitmap.height*scale);
  canvas.getContext("2d").drawImage(bitmap,0,0,canvas.width,canvas.height);
  return canvas.toDataURL("image/jpeg",quality);
}
