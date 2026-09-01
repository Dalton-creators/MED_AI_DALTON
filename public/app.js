const state = {
  user:null, subjects:[], currentView:"dashboard", deferredPrompt:null,
  currentSubject:null, currentTopic:null, chatConversation:null, exam:null,
  dueCards:[], cardIndex:0, showingBack:false, visionDataUrl:null,
  patientConversation:null, patientActive:false, caseSolverConversation:null,
  scienceConversation:null, languageConversation:null, lastLanguageAnswer:"",
  currentCourse:null,currentLesson:null,courseConversation:null,courseLanguage:(()=>{const v=localStorage.getItem("medai_course_language")||"en-US";return ["he-IL","la","en-US","ru-RU","fr-FR"].includes(v)?v:"en-US"})(),
  tutorTranscript:[],tutorSessionTitle:"",courseExam:null,
  languageCourse:null,languageStats:null,languageGame:null,languageLessonSession:null
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
  $("#logout-btn").addEventListener("click",hardRefreshApplication);
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
  const navView=["course","course_lesson"].includes(view)?"study":view;
  $$(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.view===navView));
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
      astronomy:()=>renderScienceStudio("ASTRO"),languages:renderLanguageLabV17,
      course:renderCourse,course_lesson:renderCourseLesson
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
    <section class="learning-home-hero">
      <div class="learning-home-copy">
        <div class="learning-home-chip"><span></span> MED AI DALTON · LEARNING PLATFORM V17</div>
        <h1>Aprende practicando, no solo leyendo.</h1>
        <p>Hola, <strong>${escapeHtml(firstName(name))}</strong>. Tu plataforma combina cursos progresivos, Tutor IA, práctica clínica, ciencias e idiomas interactivos en un mismo espacio.</p>
        <div class="learning-home-actions">
          <button id="home-course-btn" class="primary-btn">▶ CONTINUAR CURSO</button>
          <button id="home-language-btn" class="home-color-btn language">🌍 IDIOMAS</button>
          <button id="home-tutor-btn" class="home-color-btn tutor">✦ TUTOR IA</button>
        </div>
        <div class="learning-home-metrics">
          <div><b>⚡</b><span><strong>${d.profile?.total_xp||0}</strong><small>XP acumulados</small></span></div>
          <div><b>◎</b><span><strong>${progress}%</strong><small>sesión actual</small></span></div>
          <div><b>✓</b><span><strong>${d.accuracy}%</strong><small>precisión</small></span></div>
        </div>
      </div>
      <div class="learning-home-art" aria-label="NOVA y LUMI, compañeros de aprendizaje">
        <div class="learning-orbit-ring ring-one"></div>
        <div class="learning-orbit-ring ring-two"></div>
        <div class="v17-mascot nova-mascot">
          <span class="mascot-ear left"></span><span class="mascot-ear right"></span>
          <div class="mascot-head"><i class="mascot-eye left"></i><i class="mascot-eye right"></i><b class="mascot-mouth"></b></div>
          <div class="mascot-body"><span>✦</span></div>
          <i class="mascot-arm left"></i><i class="mascot-arm right"></i>
        </div>
        <div class="v17-mascot lumi-mascot small">
          <span class="mascot-ear left"></span><span class="mascot-ear right"></span>
          <div class="mascot-head"><i class="mascot-eye left"></i><i class="mascot-eye right"></i><b class="mascot-mouth"></b></div>
          <div class="mascot-body"><span>●</span></div>
        </div>
        <div class="mascot-dialog"><strong>NOVA</strong><span>¿Qué habilidad subimos hoy?</span></div>
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
  $("#continue-btn").onclick=()=>{
    if(d.resume?.mode==="course"&&d.resume?.subject_id){
      state.currentSubject=state.subjects.find(s=>s.id===d.resume.subject_id)||null;
      state.currentTopic=null;state.currentLesson=null;state.currentCourse=null;
      navigate(state.currentSubject?"course":"study");
      return;
    }
    navigate(d.resume?.mode||"study");
  };
  $("#open-tutor-btn").onclick=()=>navigate("tutor");
  $("#open-exam-btn").onclick=()=>navigate("exams");
  $("#home-course-btn")?.addEventListener("click",()=>$("#continue-btn")?.click());
  $("#home-language-btn")?.addEventListener("click",()=>navigate("languages"));
  $("#home-tutor-btn")?.addEventListener("click",()=>navigate("tutor"));
  $$(".clinical-module").forEach(c=>c.onclick=()=>navigate(c.dataset.view));
}

async function renderStudy(){
  const progressData=await api(`/api/course-summaries?language=${encodeURIComponent(state.courseLanguage)}`).catch(()=>({summaries:{}}));
  const summaries=progressData.summaries||{};
  root.innerHTML=`
    <div class="page-head"><div><div class="eyebrow">CURSOS ESTRUCTURADOS</div><h2>Ruta académica con progreso fijo</h2><p>Todos los cursos, incluyendo Matemática, Física, Astronomía e Idiomas, guardan el avance tema por tema. Cada tema termina con examen y el siguiente se habilita al aprobar.</p></div></div>
    <div class="course-intro card">
      <div><strong>Curso fijo + Tutor libre</strong><span>CURSOS · siguen una secuencia académica y guardan tu avance. &nbsp;&nbsp; TUTOR IA · puedes estudiar cualquier tema, en cualquier orden, sin alterar el progreso del curso.</span></div>
      <div class="course-intro-badge">PROGRESO EN D1</div>
    </div>
    <div class="hybrid-progress-note fixed-progress-note">
      <div><b>01</b><span><strong>Lección</strong><small>Estudia el tema completo con MED AI.</small></span></div>
      <div><b>02</b><span><strong>Práctica</strong><small>Comprueba que entiendes antes del examen.</small></span></div>
      <div><b>03</b><span><strong>Examen final</strong><small>Aprueba 4 de 5 para desbloquear el siguiente tema.</small></span></div>
    </div>
    <h3 class="section-title">Selecciona un curso</h3>
    <div class="grid three" id="subject-grid">${state.subjects.map(s=>courseSubjectCard(s,summaries[s.id])).join("")}</div>`;
  $$(".subject-card").forEach(c=>c.onclick=()=>openSubject(c.dataset.id));
}

function courseSubjectCard(s,summary={}){
  const special={MATH:"MATEMÁTICA",PHYS:"FÍSICA",ASTRO:"ASTRONOMÍA",LANG:"IDIOMAS"}[s.code]||s.category||"MEDICINA";
  const progress=Math.max(0,Math.min(100,Number(summary.progress_percent||0)));
  const done=Number(summary.completed||0);
  const total=Number(summary.total||0);
  const languageName=s.code==="LANG"?(LANGUAGE_OPTIONS.find(x=>x[0]===state.courseLanguage)?.[1]||"Inglés"):null;
  return `<div class="card subject-card course-subject-card" data-id="${s.id}" data-code="${escapeAttr(s.code||"")}">
    <div class="course-card-head"><div class="category">${escapeHtml(special)}</div><span class="course-card-percent">${progress}%</span></div>
    <h3>${escapeHtml(s.name)}</h3>
    <p>${escapeHtml(s.description||"Curso progresivo guiado por MED AI.")}</p>
    <div class="course-card-progress"><i style="width:${progress}%"></i></div>
    <div class="course-card-stats"><span>${done} / ${total||"—"} temas aprobados</span>${languageName?`<span>${escapeHtml(languageName)}</span>`:""}</div>
    <div class="course-card-footer"><span>Ruta fija · examen por tema</span><b>ABRIR →</b></div>
  </div>`;
}

async function openSubject(id){
  state.currentSubject=state.subjects.find(x=>x.id===id)||null;
  state.currentTopic=null;state.currentLesson=null;state.currentCourse=null;state.courseConversation=null;state.courseExam=null;
  if(!state.currentSubject)return;
  navigate("course");
}

async function renderCourse(){
  const s=state.currentSubject;
  if(!s){navigate("study");return}
  let language=state.courseLanguage;
  const languagePicker=s.code==="LANG"?`<div class="field course-language-field"><label>Idioma del curso</label><select id="course-language">${LANGUAGE_OPTIONS.map(([code,name])=>`<option value="${code}" ${code===language?"selected":""}>${escapeHtml(name)}</option>`).join("")}</select></div>`:"";
  root.innerHTML=`<div class="empty">Preparando curso de ${escapeHtml(s.name)}...</div>`;
  const data=await api(`/api/course?subject_id=${encodeURIComponent(s.id)}${s.code==="LANG"?`&language=${encodeURIComponent(language)}`:""}`);
  state.currentCourse=data;
  const currentIndex=Math.max(0,Number(data.next_index||0));
  const next=data.items[currentIndex];
  root.innerHTML=`
    <div class="course-page-head">
      <button id="back-courses" class="ghost-btn">← CURSOS</button>
      <div class="course-page-title"><div class="eyebrow">RUTA ACADÉMICA FIJA</div><h2>${escapeHtml(s.name)}</h2><p>Avanza tema por tema. Los temas futuros se desbloquean al aprobar el examen del tema actual.</p></div>
      ${languagePicker}
    </div>
    <section class="course-overview card">
      <div class="course-overview-main"><span>PROGRESO OFICIAL DEL CURSO</span><strong>${data.progress_percent}%</strong><div class="progress"><i style="width:${data.progress_percent}%"></i></div><small>${data.completed} de ${data.total} temas aprobados</small></div>
      <div class="course-next"><span>TEMA ACTUAL</span><strong>${escapeHtml(next?.topic_name||"Curso completado")}</strong><small>${next?`Tema ${currentIndex+1} de ${data.total} · debes aprobar su examen para continuar`:"Has aprobado toda la ruta."}</small>${next?`<button id="continue-course" class="primary-btn">CONTINUAR CURSO</button>`:""}</div>
    </section>
    <div class="course-legend"><span><i class="legend recommended"></i> Tema actual</span><span><i class="legend done"></i> Aprobado</span><span><i class="legend locked"></i> Bloqueado</span></div>
    <div class="course-track" id="course-track">
      ${data.items.map((item,i)=>courseStep(item,i,data)).join("")}
    </div>
    <div class="course-free card"><div><strong>Tutor IA permanece completamente libre</strong><span>Si quieres estudiar un tema que todavía no toca en el curso, abre Tutor IA. Puedes preguntar cualquier cosa sin adelantar ni modificar el progreso oficial de esta ruta.</span></div><button id="free-study-course" class="secondary-btn">ABRIR TUTOR IA</button></div>`;
  $("#back-courses").onclick=()=>navigate("study");
  $("#continue-course")?.addEventListener("click",()=>openCourseLesson(currentIndex));
  $$(".course-step[data-open='1']").forEach(el=>el.onclick=()=>openCourseLesson(Number(el.dataset.index)));
  $$(".course-step[data-open='0']").forEach(el=>el.onclick=()=>toast("Primero aprueba el tema anterior para desbloquear este tema.",true));
  $("#free-study-course").onclick=()=>navigate("tutor");
  $("#course-language")?.addEventListener("change",async e=>{state.courseLanguage=e.target.value;localStorage.setItem("medai_course_language",state.courseLanguage);state.currentCourse=null;await renderCourse()});
}

function courseStep(item,index,data){
  const completed=Number(item.completed)===1;
  const current=index===Number(data.next_index) && !completed;
  const unlocked=completed || current;
  const progress=Number(item.progress_percent||0);
  const status=completed?"APROBADO":current?(progress>0?"EN PROGRESO":"TEMA ACTUAL"):"BLOQUEADO";
  const stateClass=completed?"completed":current?"active":"locked";
  return `<article class="course-step ${stateClass}" data-index="${index}" data-open="${unlocked?1:0}">
    <div class="course-step-number">${String(index+1).padStart(2,"0")}</div>
    <div class="course-step-body"><div class="course-step-meta"><span>${status}</span><small>${Number(item.estimated_minutes||35)} min · Nivel ${Number(item.difficulty||1)}</small></div><h3>${escapeHtml(item.topic_name)}</h3><p>${escapeHtml(item.summary||item.description||"")}</p><div class="course-step-progress"><i style="width:${completed?100:progress}%"></i></div><small class="topic-progress-label">${completed?"Examen aprobado":current?`${Math.round(progress)}% del tema estudiado`:"Completa el tema anterior"}</small></div>
    <div class="course-step-state">${completed?"✓":current?"→":"🔒"}</div>
  </article>`;
}

function openCourseLesson(index){
  const course=state.currentCourse;
  const item=course?.items?.[index];
  if(!item)return;
  const unlocked=Number(item.completed)===1 || index===Number(course.next_index);
  if(!unlocked){toast("Este tema todavía está bloqueado. Aprueba primero el tema actual.",true);return}
  state.currentLesson={...item,index};state.currentTopic={id:item.topic_id,name:item.topic_name,subject_id:state.currentSubject.id};state.courseConversation=null;state.courseExam=null;navigate("course_lesson");
}

async function renderCourseLesson(){
  const item=state.currentLesson,s=state.currentSubject,course=state.currentCourse;
  if(!item||!s||!course){navigate("course");return}
  const objectives=safeJson(item.learning_objectives_json,[]);
  const noteData=await api(`/api/course-note?topic_id=${encodeURIComponent(item.topic_id)}`).catch(()=>({note:null}));
  const completed=Number(item.completed)===1;
  root.innerHTML=`
    <div class="lesson-course-head"><button id="back-course" class="ghost-btn">← ${escapeHtml(s.name.toUpperCase())}</button><div><span>LECCIÓN ${String(item.index+1).padStart(2,"0")} / ${course.total}</span><strong>${escapeHtml(item.topic_name)}</strong></div><div class="lesson-course-percent">${completed?"100":Math.round(Number(item.progress_percent||0))}%</div></div>
    <div class="lesson-course-grid">
      <main class="card lesson-main">
        <div class="eyebrow">LECCIÓN OBLIGATORIA · EXAMEN AL FINAL</div>
        <h2>${escapeHtml(item.topic_name)}</h2>
        <p class="lesson-summary">${escapeHtml(item.summary||item.description||"")}</p>
        <div class="lesson-objectives"><strong>Objetivos de esta lección</strong><ul>${objectives.map(o=>`<li>${escapeHtml(o)}</li>`).join("")}</ul></div>
        <div class="lesson-actions"><button id="start-guided-lesson" class="primary-btn">INICIAR CLASE COMPLETA</button><button id="practice-guided-lesson" class="secondary-btn">PRACTICAR TEMA</button><button id="course-final-exam" class="${completed?"secondary-btn":"primary-btn"}">${completed?"REPETIR EXAMEN":"EXAMEN FINAL DEL TEMA"}</button></div>
        <div id="course-messages" class="messages course-messages"><div class="message ai rich"><div class="rich-response"><p>Estudia la clase, practica tus dudas y al finalizar realiza el <strong>examen del tema</strong>. Necesitas acertar al menos <strong>4 de 5 preguntas</strong> para aprobar y desbloquear la siguiente lección.</p></div></div></div>
        <div class="composer"><textarea id="course-input" rows="2" placeholder="Pregunta algo sobre esta lección..."></textarea><button id="course-send" class="primary-btn">ENVIAR</button></div>
        <div id="course-exam-area" class="course-exam-area"></div>
      </main>
      <aside class="lesson-side">
        <section class="card lesson-progress-card"><div class="panel-code">PROGRESO DEL TEMA</div><div class="lesson-progress-number" id="lesson-progress-number">${completed?100:Math.round(Number(item.progress_percent||0))}%</div><div class="progress"><i id="lesson-progress-bar" style="width:${completed?100:Number(item.progress_percent||0)}%"></i></div><p>${completed?"Tema aprobado. Puedes repasarlo cuando quieras.":"El tema solo se marca como completado después de aprobar su examen final."}</p><div class="course-pass-status ${completed?"passed":""}" id="course-pass-status">${completed?"EXAMEN APROBADO ✓":"PENDIENTE DE EXAMEN"}</div><button id="next-course-topic" class="secondary-btn wide ${completed?"":"hidden"}" style="margin-top:8px">SIGUIENTE TEMA →</button></section>
        <section class="card"><div class="panel-code">MIS NOTAS DEL TEMA</div><textarea id="course-note" class="course-note" placeholder="Escribe aquí lo que quieras recordar...">${escapeHtml(noteData.note?.body||"")}</textarea><button id="save-course-note" class="secondary-btn wide">GUARDAR NOTAS</button><small id="course-note-status">${noteData.note?.updated_at?`Último guardado: ${formatDate(noteData.note.updated_at)}`:"Tus notas quedan sincronizadas en D1."}</small></section>
      </aside>
    </div>`;
  $("#back-course").onclick=()=>navigate("course");
  $("#start-guided-lesson").onclick=()=>sendCourseLessonMessage("[INICIAR_CURSO_GUIADO] Imparte esta clase de forma completa y progresiva. Antes de explicar, crea un índice de todos los subtemas esenciales que pertenecen a esta lección según el currículo académico actual. Luego desarrolla cada subtema desde fundamentos hasta aplicación, sin omitir conceptos nucleares. Termina con un resumen y preguntas de comprobación.",true,false);
  $("#practice-guided-lesson").onclick=()=>sendCourseLessonMessage("[PRACTICA_CURSO] Evalúame sobre esta lección con preguntas progresivas, una por una. Cubre distintos subtemas de la clase y corrige mi razonamiento.",true,true);
  $("#course-final-exam").onclick=startCourseFinalExam;
  $("#course-send").onclick=()=>sendCourseLessonMessage();
  $("#course-input").addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendCourseLessonMessage()}});
  $("#next-course-topic").onclick=()=>{const ni=item.index+1;if(ni<course.items.length)openCourseLesson(ni);else navigate("course")};
  $("#save-course-note").onclick=saveCourseNote;
}

async function sendCourseLessonMessage(forced=null,hide=false,practice=false){
  const input=$("#course-input"),raw=forced||input.value.trim();if(!raw)return;
  if(!hide)appendMessageTo("#course-messages","user",raw);else appendMessageTo("#course-messages","user",practice?"Practicar esta lección":"Iniciar clase completa");
  input.value="";
  const item=state.currentLesson,s=state.currentSubject;
  const target=appendMessageTo("#course-messages","ai","Preparando la lección...");target.classList.add("loading");
  const mode=["MATH","PHYS","ASTRO"].includes(s.code)?"science":s.code==="LANG"?"language":"tutor";
  const lang=s.code==="LANG"?` Idioma objetivo: ${LANGUAGE_OPTIONS.find(x=>x[0]===state.courseLanguage)?.[1]||"Inglés"}.`:"";
  const message=`CURSO OFICIAL GUIADO. Materia: ${s.name}. Tema actual: ${item.topic_name}. Lección ${item.index+1} de ${state.currentCourse.total}.${lang}\n\n${raw}\n\nREGLAS: mantente estrictamente dentro del tema. Enséñalo de lo fácil a lo difícil. Cubre el temario esencial de forma completa antes de considerar finalizada la clase.`;
  try{
    const r=await streamSpecialAI({mode,message,conversationId:state.courseConversation,subjectId:s.id,title:`Curso — ${item.topic_name}`,context:{course:true,topic:item.topic_name,language:state.courseLanguage},target});
    state.courseConversation=r.conversationId;
    const nextProgress=Math.max(Number(item.progress_percent||0),practice?80:60);
    if(!Number(item.completed))await updateCourseLessonProgress(nextProgress,false,{stage:practice?"practice":"lesson"});
  }catch(err){target.classList.remove("loading");setMessageContent(target,"ai",`Error: ${err.message}`)}
}

async function updateCourseLessonProgress(progress,completed=false,lastPosition={},updateUI=true){
  const item=state.currentLesson;if(!item)return null;
  const r=await api("/api/lesson-progress",{method:"PUT",body:{lesson_id:item.lesson_id,progress_percent:progress,completed,last_position:lastPosition}});
  item.progress_percent=Math.max(Number(item.progress_percent||0),Number(r.progress_percent||0));item.completed=r.completed?1:item.completed;
  if(state.currentCourse){const ci=item.index;state.currentCourse.items[ci]={...state.currentCourse.items[ci],...item};state.currentCourse.progress_percent=r.course_progress;if(r.completed)state.currentCourse.next_index=Math.min(ci+1,state.currentCourse.items.length-1)}
  if(updateUI){if($("#lesson-progress-number"))$("#lesson-progress-number").textContent=`${Math.round(item.progress_percent)}%`;if($("#lesson-progress-bar"))$("#lesson-progress-bar").style.width=`${item.progress_percent}%`}
  return r;
}

async function startCourseFinalExam(){
  const item=state.currentLesson,s=state.currentSubject;
  const area=$("#course-exam-area");
  area.innerHTML=`<div class="course-exam-loading">Generando el examen final de <strong>${escapeHtml(item.topic_name)}</strong>...</div>`;
  $("#course-final-exam").disabled=true;
  try{
    const d=await api("/api/ai/exam",{method:"POST",body:{subject:s.name,topic:item.topic_name,count:5,difficulty:Number(item.difficulty||item.difficulty_min||5)}});
    state.courseExam={questions:d.questions,answers:{},started_at:new Date().toISOString(),subject:s.name,topic:item.topic_name};
    renderCourseFinalExam();
  }catch(err){area.innerHTML=`<div class="notice">${escapeHtml(err.message)}</div>`}
  finally{$("#course-final-exam").disabled=false}
}

function renderCourseFinalExam(){
  const e=state.courseExam;if(!e)return;
  $("#course-exam-area").innerHTML=`<section class="course-final-exam"><div class="panel-code">EXAMEN FINAL DEL TEMA</div><h3>${escapeHtml(e.topic)}</h3><p>Responde las 5 preguntas. Apruebas con 4 respuestas correctas.</p>
    ${e.questions.map((q,i)=>`<div class="exam-question course-exam-question" data-cq="${i}"><div class="eyebrow">PREGUNTA ${i+1}</div><h4>${escapeHtml(q.stem)}</h4>${q.options.map((op,j)=>`<label class="option"><input type="radio" name="cq${i}" value="${j}"><span>${escapeHtml(op)}</span></label>`).join("")}<div class="explanation hidden"></div></div>`).join("")}
    <button id="finish-course-exam" class="primary-btn">CALIFICAR EXAMEN</button></section>`;
  $$('input[type="radio"]',$("#course-exam-area")).forEach(r=>r.onchange=()=>{state.courseExam.answers[r.name]=Number(r.value)});
  $("#finish-course-exam").onclick=finishCourseFinalExam;
}

async function finishCourseFinalExam(){
  const e=state.courseExam;if(!e)return;
  let score=0;
  e.questions.forEach((q,i)=>{
    const chosen=e.answers[`cq${i}`];
    const block=$(`.course-exam-question[data-cq="${i}"]`);
    const labels=$$(".option",block);
    labels.forEach((lab,j)=>{lab.classList.toggle("correct",j===Number(q.correctIndex));lab.classList.toggle("wrong",chosen===j&&j!==Number(q.correctIndex))});
    if(chosen===Number(q.correctIndex))score++;
    const exp=$(".explanation",block);exp.classList.remove("hidden");exp.innerHTML=`<strong>Respuesta correcta:</strong> ${escapeHtml(q.options[q.correctIndex]||"")}<br>${escapeHtml(q.explanation||"")}`;
  });
  const pct=Math.round(score/e.questions.length*100);
  const passed=score>=4;
  await api("/api/exams/record",{method:"POST",body:{title:`Curso · ${e.subject} · ${e.topic}`,settings:{course:true,topic_id:state.currentLesson.topic_id,lesson_id:state.currentLesson.lesson_id},started_at:e.started_at,score,max_score:e.questions.length,percentage:pct,questions:e.questions,answers:Object.fromEntries(Object.entries(e.answers).map(([k,v])=>[k.replace("cq","q"),v]))}}).catch(()=>{});
  if(passed){
    await updateCourseLessonProgress(100,true,{stage:"exam_passed",score,max_score:e.questions.length,percentage:pct});
    $("#course-pass-status").textContent=`APROBADO · ${score}/${e.questions.length} ✓`;
    $("#course-pass-status").classList.add("passed");
    $("#next-course-topic").classList.remove("hidden");
    $("#course-final-exam").textContent="REPETIR EXAMEN";
    $("#course-exam-area").insertAdjacentHTML("afterbegin",`<div class="course-exam-result passed"><strong>APROBADO · ${pct}%</strong><span>Has desbloqueado el siguiente tema.</span></div>`);
    toast("Examen aprobado. Siguiente tema desbloqueado.");
  }else{
    await updateCourseLessonProgress(Math.max(Number(state.currentLesson.progress_percent||0),80),false,{stage:"exam_retry",score,max_score:e.questions.length,percentage:pct});
    $("#course-exam-area").insertAdjacentHTML("afterbegin",`<div class="course-exam-result failed"><strong>AÚN NO APROBADO · ${pct}%</strong><span>Repasa la explicación y vuelve a intentarlo. Necesitas 4 de 5.</span></div>`);
    toast("Repasa el tema y vuelve a intentar el examen.",true);
  }
  $("#finish-course-exam")?.setAttribute("disabled","disabled");
}

async function saveCourseNote(){
  try{const r=await api("/api/course-note",{method:"PUT",body:{topic_id:state.currentLesson.topic_id,body:$("#course-note").value}});$("#course-note-status").textContent=`Guardado: ${formatDate(r.updated_at)}`;toast("Notas guardadas.")}catch(err){toast(err.message,true)}
}

function safeJson(value,fallback){try{return Array.isArray(value)?value:JSON.parse(value||"null")||fallback}catch{return fallback}}


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
  ["he-IL","Hebreo"],
  ["la","Latín"],
  ["en-US","Inglés"],
  ["ru-RU","Ruso"],
  ["fr-FR","Francés"]
];

const LANGUAGE_META={
  "he-IL":{name:"Hebreo",mark:"ע",hello:"שלום!",dir:"rtl",accent:"blue"},
  "la":{name:"Latín",mark:"L",hello:"Salve!",dir:"ltr",accent:"gold"},
  "en-US":{name:"Inglés",mark:"EN",hello:"Hello!",dir:"ltr",accent:"violet"},
  "ru-RU":{name:"Ruso",mark:"Я",hello:"Привет!",dir:"ltr",accent:"coral"},
  "fr-FR":{name:"Francés",mark:"FR",hello:"Bonjour!",dir:"ltr",accent:"cyan"}
};

const LANGUAGE_CHALLENGES={"he-IL":[{"target":"שלום","es":"Hola","roman":"shalom"},{"target":"תודה","es":"Gracias","roman":"todá"},{"target":"בבקשה","es":"Por favor / de nada","roman":"bevakashá"},{"target":"מה שלומך?","es":"¿Cómo estás?","roman":"ma shlomjá / ma shlomej"},{"target":"קוראים לי דלטון","es":"Me llamo Dalton","roman":"korím li Dalton"},{"target":"אני לומד עברית","es":"Estoy aprendiendo hebreo","roman":"aní lomed ivrít"},{"target":"איפה בית החולים?","es":"¿Dónde está el hospital?","roman":"eifó beit hajolím"},{"target":"אני מבין קצת","es":"Entiendo un poco","roman":"aní mevín ktsat"},{"target":"אפשר לחזור בבקשה?","es":"¿Puede repetir, por favor?","roman":"efshár lajzor bevakashá"},{"target":"היום אני לומד","es":"Hoy estudio","roman":"hayóm aní lomed"}],"la":[{"target":"Salve!","es":"¡Hola!","roman":"sal-we"},{"target":"Gratias tibi ago.","es":"Te doy las gracias.","roman":"grá-ti-as tí-bi á-go"},{"target":"Quid agis?","es":"¿Cómo estás?","roman":"kwid á-gis"},{"target":"Nomen mihi Dalton est.","es":"Me llamo Dalton.","roman":"nó-men mí-hi Dalton est"},{"target":"Latine disco.","es":"Aprendo latín.","roman":"lá-ti-ne dís-ko"},{"target":"Aqua vita est.","es":"El agua es vida.","roman":"á-kwa wí-ta est"},{"target":"Medicus aegrotum curat.","es":"El médico cuida al enfermo.","roman":"mé-di-kus ae-gró-tum kú-rat"},{"target":"Corpus humanum mirabile est.","es":"El cuerpo humano es admirable.","roman":"kór-pus hu-má-num mi-rá-bi-le est"},{"target":"Scientia potentia est.","es":"El conocimiento es poder.","roman":"ski-én-ti-a po-tén-ti-a est"},{"target":"Per aspera ad astra.","es":"Por las dificultades hacia las estrellas.","roman":"per ás-pe-ra ad ás-tra"}],"en-US":[{"target":"Hello, how are you?","es":"Hola, ¿cómo estás?"},{"target":"My name is Dalton.","es":"Me llamo Dalton."},{"target":"I am learning English.","es":"Estoy aprendiendo inglés."},{"target":"Could you repeat that, please?","es":"¿Podrías repetir eso, por favor?"},{"target":"Where is the hospital?","es":"¿Dónde está el hospital?"},{"target":"I would like a glass of water.","es":"Quisiera un vaso de agua."},{"target":"What does this word mean?","es":"¿Qué significa esta palabra?"},{"target":"I understand, but I need more practice.","es":"Entiendo, pero necesito más práctica."},{"target":"The patient has chest pain.","es":"El paciente tiene dolor en el pecho."},{"target":"I study every day to improve.","es":"Estudio todos los días para mejorar."}],"ru-RU":[{"target":"Привет!","es":"¡Hola!","roman":"privet"},{"target":"Спасибо.","es":"Gracias.","roman":"spasíbo"},{"target":"Как дела?","es":"¿Cómo estás?","roman":"kak dilá"},{"target":"Меня зовут Далтон.","es":"Me llamo Dalton.","roman":"menyá zavút Dalton"},{"target":"Я изучаю русский язык.","es":"Estoy aprendiendo ruso.","roman":"ya izucháyu rússkiy yazýk"},{"target":"Повторите, пожалуйста.","es":"Repita, por favor.","roman":"pavtaríte pazhálusta"},{"target":"Где находится больница?","es":"¿Dónde está el hospital?","roman":"gde najóditsa balnítsa"},{"target":"Я немного понимаю.","es":"Entiendo un poco.","roman":"ya nimnóga panimáyu"},{"target":"Сегодня я учусь.","es":"Hoy estudio.","roman":"sivódnya ya uchús"},{"target":"Практика очень важна.","es":"La práctica es muy importante.","roman":"práktika óchen vazhná"}],"fr-FR":[{"target":"Bonjour, comment allez-vous ?","es":"Hola, ¿cómo está?"},{"target":"Je m'appelle Dalton.","es":"Me llamo Dalton."},{"target":"J'apprends le français.","es":"Estoy aprendiendo francés."},{"target":"Pouvez-vous répéter, s'il vous plaît ?","es":"¿Puede repetir, por favor?"},{"target":"Où est l'hôpital ?","es":"¿Dónde está el hospital?"},{"target":"Je voudrais un verre d'eau.","es":"Quisiera un vaso de agua."},{"target":"Qu'est-ce que ce mot veut dire ?","es":"¿Qué significa esta palabra?"},{"target":"Je comprends un peu.","es":"Entiendo un poco."},{"target":"Le patient a mal à la poitrine.","es":"El paciente tiene dolor en el pecho."},{"target":"Je pratique tous les jours.","es":"Practico todos los días."}]};

async function renderLanguageLab(){
  state.languageConversation=null;state.lastLanguageAnswer="";
  state.languageGame={mode:null,current:null,score:0,attempts:0,selectedWords:[]};
  const subject=getSubjectByCode("LANG");state.currentSubject=subject;
  const saved=LANGUAGE_OPTIONS.some(x=>x[0]===state.courseLanguage)?state.courseLanguage:"en-US";
  state.courseLanguage=saved;
  root.innerHTML=`
    <div class="page-head language-page-head"><div><div class="eyebrow">LANGUAGE LAB · APRENDIZAJE ACTIVO</div><h2>Idiomas que se practican de verdad</h2><p>Ruta progresiva, retos cortos, pronunciación, escucha, escritura y conversación con IA. Tu progreso del curso sigue guardándose tema por tema.</p></div></div>

    <section class="language-next-hero card">
      <div class="language-hero-copy">
        <div class="language-kicker">ELIGE TU IDIOMA</div>
        <div class="language-selector" id="language-selector">
          ${LANGUAGE_OPTIONS.map(([code,name])=>{const m=LANGUAGE_META[code];return `<button class="language-choice ${code===saved?"active":""}" data-lang="${code}"><span class="language-mark ${m.accent}">${m.mark}</span><strong>${name}</strong></button>`}).join("")}
        </div>
        <h3 id="language-hero-title">${LANGUAGE_META[saved].hello} Vamos a aprender ${LANGUAGE_META[saved].name}.</h3>
        <p id="language-hero-copy">Combina tu ruta académica con práctica diaria. Los retos mejoran tu dominio del tema actual, pero solo el examen final desbloquea el siguiente.</p>
        <div class="language-hero-actions"><button id="lang-continue-course" class="primary-btn">CONTINUAR RUTA</button><button id="lang-start-mix" class="secondary-btn">⚡ RETO RÁPIDO</button></div>
      </div>
      <div class="language-buddy-zone">
        <div class="language-orbit" aria-hidden="true"><i></i><i></i><i></i></div>
        <div class="nova-buddy large" aria-label="NOVA, guía de aprendizaje"><span class="nova-antenna"></span><div class="nova-face"><i></i><i></i><b></b></div><span class="nova-glow"></span></div>
        <div class="nova-speech" id="nova-speech"><strong>NOVA</strong><span>Hoy vamos a hablar, escuchar y pensar en el idioma.</span></div>
      </div>
      <div class="language-stats-strip">
        <div><span>🔥</span><strong id="lang-streak">—</strong><small>racha</small></div>
        <div><span>⚡</span><strong id="lang-today-xp">—</strong><small>XP hoy</small></div>
        <div><span>◆</span><strong id="lang-total-xp">—</strong><small>XP total</small></div>
        <div><span>◎</span><strong id="lang-course-progress">—</strong><small>curso</small></div>
      </div>
    </section>

    <section class="language-path card">
      <div class="language-section-title"><div><span>RUTA DEL IDIOMA</span><h3 id="lang-route-title">Preparando tu siguiente tema…</h3></div><button id="lang-open-course" class="ghost-btn">VER CURSO COMPLETO →</button></div>
      <div id="language-route" class="language-route"><div class="route-loading"><i></i><span>Cargando progreso…</span></div></div>
    </section>

    <section class="language-game-shell">
      <aside class="language-modes card">
        <div class="panel-code">ENTRENAMIENTO RÁPIDO</div>
        <h3>Elige un reto</h3>
        <button class="language-mode" data-challenge="listen"><span>🎧</span><div><strong>Escuchar</strong><small>Comprende lo que oyes</small></div><b>+10 XP</b></button>
        <button class="language-mode" data-challenge="order"><span>🧩</span><div><strong>Ordenar</strong><small>Construye la frase</small></div><b>+10 XP</b></button>
        <button class="language-mode" data-challenge="speak"><span>🎙</span><div><strong>Pronunciar</strong><small>Habla con el micrófono</small></div><b>+15 XP</b></button>
        <button class="language-mode" data-challenge="translate"><span>✍</span><div><strong>Traducir</strong><small>Produce el idioma</small></div><b>+10 XP</b></button>
        <div class="language-game-score"><span>SESIÓN</span><strong><b id="lang-session-score">0</b> XP</strong><small id="lang-session-attempts">0 retos realizados</small></div>
      </aside>
      <main class="language-challenge card" id="language-challenge">
        <div class="challenge-welcome">
          <div class="challenge-icon">✦</div>
          <div class="eyebrow">PRÁCTICA GAMIFICADA</div>
          <h3>Entrena una habilidad a la vez</h3>
          <p>Escucha, ordena, habla o traduce. Al acertar ganas XP y tu práctica queda registrada.</p>
          <button id="challenge-welcome-start" class="primary-btn">EMPEZAR RETO MIXTO</button>
        </div>
      </main>
    </section>

    <section class="language-ai-section">
      <div class="language-section-title"><div><span>PROFESOR IA</span><h3>Clase interactiva y conversación</h3></div><small>Una actividad por turno · corrección activa · vocabulario reciclado</small></div>
      <div class="language-course-grid">
        <aside class="card language-controls">
          <div class="panel-code">CONFIGURAR CLASE</div>
          <div class="field"><label>Nivel actual</label><select id="lang-level"><option>Empezar desde cero</option><option selected>A1 — Principiante</option><option>A2 — Elemental</option><option>B1 — Intermedio</option><option>B2 — Intermedio alto</option><option>C1 — Avanzado</option><option>C2 — Dominio</option></select></div>
          <div class="field"><label>Objetivo</label><select id="lang-focus"><option>Curso completo equilibrado</option><option>Conversación</option><option>Comprensión auditiva</option><option>Pronunciación</option><option>Gramática en contexto</option><option>Vocabulario útil</option><option>Lectura</option><option>Escritura</option><option>Viajes y situaciones reales</option><option>Académico / profesional</option><option>Idioma médico / científico</option></select></div>
          <div class="field"><label>Inmersión</label><select id="lang-immersion"><option value="30">30% · explicación amplia en español</option><option value="60" selected>60% · equilibrio</option><option value="85">85% · inmersión alta</option><option value="100">100% · inmersión total</option></select></div>
          <button id="lang-start" class="primary-btn wide">INICIAR CLASE DEL TEMA ACTUAL</button>
          <button id="lang-placement" class="secondary-btn wide" style="margin-top:8px">PRUEBA DE NIVEL</button>
          <button id="lang-new" class="secondary-btn wide" style="margin-top:8px">NUEVA SESIÓN</button>
        </aside>
        <div class="card chat-panel language-chat">
          <div class="language-toolbar"><span id="language-session-label">Profesor de ${LANGUAGE_META[saved].name}</span><div><button id="lang-listen" class="secondary-btn">🔊 Escuchar respuesta</button></div></div>
          <div id="language-messages" class="messages"><div class="message ai">Selecciona una actividad o inicia la clase del tema actual. Voy a enseñarte con práctica, corrección y repetición activa.</div></div>
          <div class="composer"><button id="lang-mic" class="icon-btn" title="Hablar">🎙</button><textarea id="language-input" rows="2" placeholder="Escribe o habla en el idioma que estás aprendiendo..."></textarea><button id="language-send" class="primary-btn">Enviar</button></div>
        </div>
      </div>
    </section>

    <div class="learning-pillar-grid language-pillars premium-pillars">
      <div class="learning-pillar"><span>01 · INPUT</span><strong>Comprender</strong><small>Escucha y lectura con dificultad progresiva.</small></div>
      <div class="learning-pillar"><span>02 · OUTPUT</span><strong>Producir</strong><small>Hablar y escribir desde el inicio.</small></div>
      <div class="learning-pillar"><span>03 · FEEDBACK</span><strong>Corregir</strong><small>Errores explicados y transformados en práctica.</small></div>
      <div class="learning-pillar"><span>04 · RETRIEVAL</span><strong>Recordar</strong><small>Recuperación activa y repaso espaciado.</small></div>
      <div class="learning-pillar"><span>05 · SPEAK</span><strong>Pronunciar</strong><small>Modelo de voz, micrófono y comparación.</small></div>
      <div class="learning-pillar"><span>06 · REAL USE</span><strong>Usar</strong><small>Conversaciones y situaciones auténticas.</small></div>
    </div>`;

  $$(".language-choice").forEach(btn=>btn.onclick=()=>selectLanguage(btn.dataset.lang));
  $$(".language-mode").forEach(btn=>btn.onclick=()=>startLanguageChallenge(btn.dataset.challenge));
  $("#challenge-welcome-start").onclick=()=>startLanguageChallenge(["listen","order","speak","translate"][Math.floor(Math.random()*4)]);
  $("#lang-start-mix").onclick=()=>startLanguageChallenge(["listen","order","speak","translate"][Math.floor(Math.random()*4)]);
  $("#lang-continue-course").onclick=openSelectedLanguageCourse;
  $("#lang-open-course").onclick=openSelectedLanguageCourse;
  $("#lang-start").onclick=()=>startLanguageLesson(false);
  $("#lang-placement").onclick=()=>startLanguageLesson(true);
  $("#language-send").onclick=()=>sendLanguageMessage();
  $("#language-input").addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendLanguageMessage()}});
  $("#lang-new").onclick=()=>{state.languageConversation=null;state.lastLanguageAnswer="";$("#language-messages").innerHTML=`<div class="message ai">Nueva sesión lista. Vamos a trabajar una habilidad concreta.</div>`};
  $("#lang-mic").onclick=()=>startSpeechRecognition($("#language-input"),state.courseLanguage);
  $("#lang-listen").onclick=()=>{if(!state.lastLanguageAnswer)return toast("Todavía no hay una respuesta para escuchar.",true);speakLanguageText(state.lastLanguageAnswer,state.courseLanguage)};
  $("#lang-level").onchange=updateLanguageLabel;
  updateLanguageLabel();
  await refreshLanguageOverview();
}

async function selectLanguage(code){
  if(!LANGUAGE_META[code])return;
  state.courseLanguage=code;localStorage.setItem("medai_course_language",code);state.languageConversation=null;state.lastLanguageAnswer="";state.languageGame={mode:null,current:null,score:0,attempts:0,selectedWords:[]};
  $$(".language-choice").forEach(b=>b.classList.toggle("active",b.dataset.lang===code));
  const m=LANGUAGE_META[code];$("#language-hero-title").textContent=`${m.hello} Vamos a aprender ${m.name}.`;
  $("#language-session-label").textContent=`Profesor de ${m.name}`;
  $("#language-messages").innerHTML=`<div class="message ai">Idioma cambiado a ${escapeHtml(m.name)}. Tu progreso es independiente del resto de idiomas.</div>`;
  $("#language-challenge").innerHTML=`<div class="challenge-welcome"><div class="challenge-icon">${m.mark}</div><div class="eyebrow">${escapeHtml(m.name.toUpperCase())}</div><h3>Listo para practicar</h3><p>Elige Escuchar, Ordenar, Pronunciar o Traducir.</p><button id="challenge-welcome-start" class="primary-btn">EMPEZAR RETO MIXTO</button></div>`;
  $("#challenge-welcome-start").onclick=()=>startLanguageChallenge(["listen","order","speak","translate"][Math.floor(Math.random()*4)]);
  updateLanguageLabel();await refreshLanguageOverview();
}

async function refreshLanguageOverview(){
  const subject=getSubjectByCode("LANG");if(!subject)return;
  const code=state.courseLanguage;
  try{
    const [course,stats]=await Promise.all([api(`/api/course?subject_id=${encodeURIComponent(subject.id)}&language=${encodeURIComponent(code)}`),api("/api/language-stats")]);
    state.languageCourse=course;state.languageStats=stats;
    if($("#lang-streak"))$("#lang-streak").textContent=stats.streak||0;
    if($("#lang-today-xp"))$("#lang-today-xp").textContent=stats.today_xp||0;
    if($("#lang-total-xp"))$("#lang-total-xp").textContent=stats.total_xp||0;
    if($("#lang-course-progress"))$("#lang-course-progress").textContent=`${course.progress_percent||0}%`;
    renderLanguageRoute(course);
  }catch(err){
    if($("#language-route"))$("#language-route").innerHTML=`<div class="notice">No pude cargar el progreso: ${escapeHtml(err.message)}</div>`;
  }
}

function renderLanguageRoute(course){
  const box=$("#language-route");if(!box||!course)return;
  const items=course.items||[];const current=Math.max(0,Number(course.next_index||0));
  const start=Math.max(0,current-2),end=Math.min(items.length,start+7),slice=items.slice(start,end);
  const currentItem=items[current];
  if($("#lang-route-title"))$("#lang-route-title").textContent=currentItem?`Siguiente: ${currentItem.topic_name}`:"Ruta completada";
  box.innerHTML=`<div class="route-line"></div>${slice.map((item,offset)=>{const idx=start+offset;const done=Number(item.completed)===1;const active=idx===current&&!done;const locked=!done&&!active;return `<button class="route-node ${done?"done":active?"active":"locked"}" data-index="${idx}" ${locked?"disabled":""}><span>${done?"✓":String(idx+1).padStart(2,"0")}</span><div><strong>${escapeHtml(item.topic_name)}</strong><small>${done?"Aprobado":active?`${Math.round(Number(item.progress_percent||0))}% estudiado · examen pendiente`:"Bloqueado"}</small></div></button>`}).join("")}`;
  $$(".route-node:not([disabled])",box).forEach(btn=>btn.onclick=()=>openLanguageCourseLesson(Number(btn.dataset.index)));
}

function openSelectedLanguageCourse(){
  const subject=getSubjectByCode("LANG");if(!subject)return;state.currentSubject=subject;state.currentCourse=state.languageCourse;state.currentLesson=null;navigate("course");
}

function openLanguageCourseLesson(index){
  const subject=getSubjectByCode("LANG");if(!subject||!state.languageCourse)return;state.currentSubject=subject;state.currentCourse=state.languageCourse;openCourseLesson(index);
}

function updateLanguageLabel(){
  const m=LANGUAGE_META[state.courseLanguage]||LANGUAGE_META["en-US"];
  if($("#language-session-label"))$("#language-session-label").textContent=`Profesor de ${m.name} · ${$("#lang-level")?.value||"A1"}`;
}

function startLanguageLesson(placement=false){
  const m=LANGUAGE_META[state.courseLanguage];const level=$("#lang-level").value,focus=$("#lang-focus").value,immersion=$("#lang-immersion").value;
  const item=state.languageCourse?.items?.[Number(state.languageCourse?.next_index||0)];
  const currentTopic=item?.topic_name||"fundamentos del idioma";
  const prompt=placement
    ? `[PRUEBA_DE_NIVEL] Idioma objetivo: ${m.name}. Evalúa mi nivel de manera progresiva, una actividad por turno. Mezcla comprensión, producción, gramática, vocabulario y una breve tarea oral cuando sea posible. Al final estima el nivel y explica exactamente qué debo reforzar.`
    : `[INICIAR_CURSO_ACTIVO] Idioma objetivo: ${m.name}. Tema actual de mi ruta: ${currentTopic}. Nivel declarado: ${level}. Objetivo: ${focus}. Inmersión: ${immersion}%. Enséñame este tema con método activo: explicación breve, ejemplo, una actividad, espera mi respuesta, corrige y continúa. Recicla vocabulario anterior y termina con producción propia.`;
  sendLanguageMessage(prompt,true);
}

async function sendLanguageMessage(forcedMessage=null,hideForced=false){
  const input=$("#language-input"),message=forcedMessage||input.value.trim();if(!message)return;
  if(!hideForced)appendMessageTo("#language-messages","user",message);else appendMessageTo("#language-messages","user",forcedMessage?.startsWith("[PRUEBA")?"Iniciar prueba de nivel":"Iniciar clase del tema actual");
  input.value="";
  const m=LANGUAGE_META[state.courseLanguage],level=$("#lang-level").value,focus=$("#lang-focus").value,immersion=$("#lang-immersion").value;
  const subject=getSubjectByCode("LANG");const currentTopic=state.languageCourse?.items?.[Number(state.languageCourse?.next_index||0)]?.topic_name||"Práctica libre";
  const thinking=appendMessageTo("#language-messages","ai","Preparando actividad...");thinking.classList.add("loading");$("#language-send").disabled=true;
  try{
    const result=await streamSpecialAI({mode:"language",message:`Idioma objetivo: ${m.name} (${state.courseLanguage}). Tema de ruta: ${currentTopic}. Nivel: ${level}. Objetivo: ${focus}. Inmersión: ${immersion}%. Idioma nativo: español.\n\n${message}`,conversationId:state.languageConversation,subjectId:subject?.id||null,title:`${m.name} — ${currentTopic}`,context:{language:m.name,languageCode:state.courseLanguage,level,focus,immersion,currentTopic},target:thinking});
    state.languageConversation=result.conversationId;state.lastLanguageAnswer=result.answer;
    await recordLanguagePractice(3,0,0,60).catch(()=>{});
  }catch(err){thinking.classList.remove("loading");setMessageContent(thinking,"ai",`Error: ${err.message}`)}finally{$("#language-send").disabled=false;input.focus()}
}

function startLanguageChallenge(mode){
  const bank=LANGUAGE_CHALLENGES[state.courseLanguage]||LANGUAGE_CHALLENGES["en-US"];
  const item=bank[Math.floor(Math.random()*bank.length)];state.languageGame.mode=mode;state.languageGame.current=item;state.languageGame.selectedWords=[];
  const m=LANGUAGE_META[state.courseLanguage];const dir=m.dir;const box=$("#language-challenge");
  const common=`<div class="challenge-top"><span class="challenge-type">${mode==="listen"?"🎧 ESCUCHAR":mode==="order"?"🧩 ORDENAR":mode==="speak"?"🎙 PRONUNCIAR":"✍ TRADUCIR"}</span><span class="challenge-xp">+${mode==="speak"?15:10} XP</span></div>`;
  if(mode==="listen"){
    const answers=languageShuffle([item,...languageShuffle(bank.filter(x=>x!==item)).slice(0,3)]).map(x=>x.es);
    box.innerHTML=`${common}<div class="challenge-body"><h3>Escucha y elige el significado</h3><p>No leas la respuesta: escucha primero y vuelve a reproducir si lo necesitas.</p><button id="challenge-play" class="sound-orb">▶</button><div class="challenge-options">${answers.map((a,i)=>`<button class="challenge-option" data-answer="${escapeAttr(a)}"><span>${String.fromCharCode(65+i)}</span>${escapeHtml(a)}</button>`).join("")}</div><div id="challenge-feedback" class="challenge-feedback hidden"></div></div>`;
    $("#challenge-play").onclick=()=>speakLanguageText(item.target,state.courseLanguage);$$(".challenge-option").forEach(b=>b.onclick=()=>finishChoiceChallenge(b,b.dataset.answer===item.es,item));setTimeout(()=>speakLanguageText(item.target,state.courseLanguage),350);
  }else if(mode==="translate"){
    box.innerHTML=`${common}<div class="challenge-body"><h3>Escribe la frase en ${m.name}</h3><div class="translation-prompt">${escapeHtml(item.es)}</div><input id="challenge-translation" class="challenge-input" autocomplete="off" placeholder="Escribe tu respuesta…" dir="${dir}"><button id="challenge-check-translation" class="primary-btn">COMPROBAR</button><div id="challenge-feedback" class="challenge-feedback hidden"></div></div>`;
    $("#challenge-check-translation").onclick=()=>{const val=$("#challenge-translation").value;const ok=languageSimilarity(val,item.target)>=.78;finishTypedChallenge(ok,item,val)};$("#challenge-translation").addEventListener("keydown",e=>{if(e.key==="Enter")$("#challenge-check-translation").click()});$("#challenge-translation").focus();
  }else if(mode==="order"){
    const words=item.target.replace(/[.!?؟]+$/g,"").split(/\s+/).filter(Boolean);let shuffled=languageShuffle(words);if(words.length>2&&shuffled.join(" ")===words.join(" "))shuffled=[...shuffled.slice(1),shuffled[0]];state.languageGame.orderTarget=words;
    box.innerHTML=`${common}<div class="challenge-body"><h3>Construye la frase</h3><div class="translation-prompt">${escapeHtml(item.es)}</div><div id="order-built" class="order-built" dir="${dir}"><span>Selecciona las palabras…</span></div><div id="order-bank" class="word-bank" dir="${dir}">${shuffled.map((w,i)=>`<button class="word-chip" data-word="${escapeAttr(w)}" data-token="${i}">${escapeHtml(w)}</button>`).join("")}</div><div class="challenge-actions"><button id="order-reset" class="ghost-btn">REINICIAR</button><button id="order-check" class="primary-btn">COMPROBAR</button></div><div id="challenge-feedback" class="challenge-feedback hidden"></div></div>`;
    $$(".word-chip").forEach(b=>b.onclick=()=>{b.disabled=true;state.languageGame.selectedWords.push({word:b.dataset.word,token:b.dataset.token});renderOrderBuilt(dir)});$("#order-reset").onclick=()=>{state.languageGame.selectedWords=[];$$(".word-chip").forEach(b=>b.disabled=false);renderOrderBuilt(dir)};$("#order-check").onclick=()=>{const value=state.languageGame.selectedWords.map(x=>x.word).join(" ");finishTypedChallenge(languageSimilarity(value,words.join(" "))>.97,item,value)};
  }else{
    box.innerHTML=`${common}<div class="challenge-body pronunciation-body"><h3>Di esta frase en voz alta</h3><div class="pronunciation-target" dir="${dir}">${escapeHtml(item.target)}</div>${item.roman?`<div class="pronunciation-guide">${escapeHtml(item.roman)}</div>`:""}<p>${escapeHtml(item.es)}</p><div class="pronunciation-actions"><button id="pronunciation-listen" class="secondary-btn">🔊 ESCUCHAR MODELO</button><button id="pronunciation-mic" class="mic-main">🎙<span>HABLAR</span></button></div><div id="pronunciation-live" class="pronunciation-live">Pulsa HABLAR y concede permiso al micrófono.</div><div id="challenge-feedback" class="challenge-feedback hidden"></div></div>`;
    $("#pronunciation-listen").onclick=()=>speakLanguageText(item.target,state.courseLanguage);$("#pronunciation-mic").onclick=()=>runPronunciationChallenge(item);
  }
  updateNovaMessage(mode==="speak"?"Escucha primero y luego imita el ritmo, no solo cada palabra.":mode==="listen"?"Concéntrate en captar el significado general antes de traducir palabra por palabra.":mode==="order"?"Busca primero el verbo y la estructura de la oración.":"Piensa en la idea completa y luego construye la frase.");
}

function renderOrderBuilt(dir){
  const built=$("#order-built");if(!built)return;const items=state.languageGame.selectedWords||[];built.dir=dir;built.innerHTML=items.length?items.map((x,i)=>`<button class="built-chip" data-built="${i}">${escapeHtml(x.word)}</button>`).join(""):`<span>Selecciona las palabras…</span>`;$$(".built-chip",built).forEach(b=>b.onclick=()=>{const idx=Number(b.dataset.built);const [removed]=state.languageGame.selectedWords.splice(idx,1);const original=$(`.word-chip[data-token="${removed.token}"]`);if(original)original.disabled=false;renderOrderBuilt(dir)});
}

function finishChoiceChallenge(button,ok,item){
  $$(".challenge-option").forEach(b=>b.disabled=true);button.classList.add(ok?"correct":"wrong");if(!ok){const correct=$$(".challenge-option").find(b=>b.dataset.answer===item.es);correct?.classList.add("correct")}showChallengeFeedback(ok,item);completeLanguageChallenge(ok,ok?10:1);
}

function finishTypedChallenge(ok,item,value){
  showChallengeFeedback(ok,item,value);completeLanguageChallenge(ok,ok?10:1);
}

function showChallengeFeedback(ok,item,value=""){
  const f=$("#challenge-feedback");if(!f)return;f.className=`challenge-feedback ${ok?"success":"retry"}`;f.innerHTML=`<strong>${ok?"¡Excelente!":"Casi. Repásalo y vuelve a intentarlo."}</strong><span><b>${escapeHtml(item.target)}</b> · ${escapeHtml(item.es)}</span>${item.roman?`<small>Pronunciación aproximada: ${escapeHtml(item.roman)}</small>`:""}`;
}

async function completeLanguageChallenge(ok,xp){
  state.languageGame.attempts=(state.languageGame.attempts||0)+1;state.languageGame.score=(state.languageGame.score||0)+xp;if($("#lang-session-score"))$("#lang-session-score").textContent=state.languageGame.score;if($("#lang-session-attempts"))$("#lang-session-attempts").textContent=`${state.languageGame.attempts} reto${state.languageGame.attempts===1?"":"s"} realizado${state.languageGame.attempts===1?"":"s"}`;
  if(ok){showLanguageCelebration();updateNovaMessage("¡Muy bien! Acabas de recuperar la información activamente. Eso fortalece la memoria.");await syncLanguagePracticeToCourse().catch(()=>{})}else updateNovaMessage("El error también enseña. Mira la corrección y prueba otra vez antes de seguir.");
  await recordLanguagePractice(xp,ok?1:0,1,45).catch(()=>{});await refreshLanguageStatsOnly().catch(()=>{});
}

async function syncLanguagePracticeToCourse(){
  const course=state.languageCourse;if(!course)return;const idx=Number(course.next_index||0),item=course.items?.[idx];if(!item||Number(item.completed)===1)return;const next=Math.min(80,Math.max(10,Number(item.progress_percent||0)+8));const r=await api("/api/lesson-progress",{method:"PUT",body:{lesson_id:item.lesson_id,progress_percent:next,completed:false,last_position:{stage:"language_game",language:state.courseLanguage}}});item.progress_percent=Number(r.progress_percent||next);if($("#lang-course-progress"))$("#lang-course-progress").textContent=`${course.progress_percent||0}%`;renderLanguageRoute(course);
}

async function recordLanguagePractice(xp,correct,answered,seconds){
  return api("/api/language-practice",{method:"POST",body:{xp,correct,answered,study_seconds:seconds,language:state.courseLanguage}});
}

async function refreshLanguageStatsOnly(){
  const stats=await api("/api/language-stats");state.languageStats=stats;if($("#lang-streak"))$("#lang-streak").textContent=stats.streak||0;if($("#lang-today-xp"))$("#lang-today-xp").textContent=stats.today_xp||0;if($("#lang-total-xp"))$("#lang-total-xp").textContent=stats.total_xp||0;
}

function runPronunciationChallenge(item){
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;const live=$("#pronunciation-live");if(!SR){live.innerHTML=`<strong>Micrófono no disponible en este navegador.</strong><span>Puedes usar “Escuchar modelo” y repetir en voz alta; la aplicación seguirá funcionando.</span>`;toast("Este navegador no ofrece reconocimiento de voz.",true);return}
  const r=new SR();r.lang=state.courseLanguage;r.interimResults=true;r.continuous=false;r.maxAlternatives=3;let final="";const mic=$("#pronunciation-mic");mic.classList.add("listening");live.textContent="Escuchando… habla ahora.";
  r.onresult=e=>{let interim="";for(let i=e.resultIndex;i<e.results.length;i++){const t=e.results[i][0].transcript;if(e.results[i].isFinal)final+=t;else interim+=t}live.textContent=final||interim||"Escuchando…"};
  r.onerror=e=>{mic.classList.remove("listening");const msg=e.error==="not-allowed"?"Permite el acceso al micrófono para practicar pronunciación.":e.error==="language-not-supported"?"Tu navegador no ofrece reconocimiento para este idioma. Usa Escuchar modelo y repite manualmente.":"No pude reconocer la voz. Inténtalo nuevamente.";live.textContent=msg;toast(msg,true)};
  r.onend=()=>{mic.classList.remove("listening");if(!final.trim())return;const score=Math.round(languageSimilarity(final,item.target)*100);const ok=score>=68;live.innerHTML=`<span>Escuché:</span><strong>${escapeHtml(final)}</strong><b class="pronunciation-score ${ok?"good":"practice"}">${score}%</b>`;showChallengeFeedback(ok,item,final);completeLanguageChallenge(ok,ok?15:2)};
  try{r.start()}catch{live.textContent="El micrófono ya está activo."}
}

function speakLanguageText(text,lang){
  if(!("speechSynthesis" in window))return toast("La voz no está disponible en este navegador.",true);speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(stripMarkdownForSpeech(text));u.lang=lang;u.rate=lang==="he-IL"?.82:lang==="ru-RU"?.82:.88;const voices=speechSynthesis.getVoices();const exact=voices.find(v=>String(v.lang||"").toLowerCase().startsWith(lang.split("-")[0].toLowerCase()));if(exact)u.voice=exact;u.onerror=()=>toast("Este dispositivo no tiene una voz adecuada para ese idioma.",true);speechSynthesis.speak(u);
}

function stripMarkdownForSpeech(text){return String(text||"").replace(/[#*_`>]/g," ").replace(/\s+/g," ").trim()}
function languageShuffle(arr){const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function normalizeLanguageText(value){return String(value||"").normalize("NFD").replace(/[\u0300-\u036f\u0591-\u05C7]/g,"").toLowerCase().replace(/[^\p{L}\p{N}\s']/gu," ").replace(/\s+/g," ").trim()}
function languageSimilarity(a,b){a=normalizeLanguageText(a);b=normalizeLanguageText(b);if(!a&&!b)return 1;if(!a||!b)return 0;const m=a.length,n=b.length,dp=Array.from({length:m+1},()=>Array(n+1).fill(0));for(let i=0;i<=m;i++)dp[i][0]=i;for(let j=0;j<=n;j++)dp[0][j]=j;for(let i=1;i<=m;i++)for(let j=1;j<=n;j++)dp[i][j]=Math.min(dp[i-1][j]+1,dp[i][j-1]+1,dp[i-1][j-1]+(a[i-1]===b[j-1]?0:1));return Math.max(0,1-dp[m][n]/Math.max(m,n))}
function updateNovaMessage(text){const el=$("#nova-speech span");if(el)el.textContent=text}
function showLanguageCelebration(){const host=$("#language-challenge");if(!host)return;const c=document.createElement("div");c.className="language-confetti";c.innerHTML=Array.from({length:14},(_,i)=>`<i style="--i:${i}"></i>`).join("");host.appendChild(c);setTimeout(()=>c.remove(),1100)}

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



/* ============================================================
   V17 · LANGUAGE LEARNING PLATFORM
   Curso + mini-lección + ejercicios + pronunciación + IA
   ============================================================ */

async function renderLanguageLabV17(){
  state.languageConversation=null;
  state.lastLanguageAnswer="";
  state.languageGame={mode:null,current:null,score:0,attempts:0,selectedWords:[]};
  state.languageLessonSession=null;

  const subject=getSubjectByCode("LANG");
  state.currentSubject=subject;
  const code=LANGUAGE_META[state.courseLanguage]?state.courseLanguage:"en-US";
  state.courseLanguage=code;
  const meta=LANGUAGE_META[code];

  root.innerHTML=`
    <div class="v17-language-page">
      <section class="v17-lang-hero">
        <div class="v17-lang-hero-copy">
          <div class="v17-live-label"><i></i> LANGUAGE WORLD · APRENDIZAJE ACTIVO</div>
          <h1><span id="v17-lang-hello">${escapeHtml(meta.hello)}</span> Aprende ${escapeHtml(meta.name)} haciendo.</h1>
          <p>Lecciones cortas, explicación antes de practicar, escucha, escritura, pronunciación, conversación y repaso. Tu ruta y progreso siguen guardados por tema.</p>
          <div class="v17-language-picker" id="v17-language-picker">
            ${LANGUAGE_OPTIONS.map(([lang,name])=>{
              const m=LANGUAGE_META[lang];
              return `<button class="v17-language-pill ${lang===code?"active":""}" data-lang="${lang}">
                <span class="v17-language-symbol ${m.accent}">${m.mark}</span>
                <strong>${escapeHtml(name)}</strong>
              </button>`;
            }).join("")}
          </div>
          <div class="v17-lang-main-actions">
            <button id="v17-start-lesson" class="v17-big-action primary"><span>▶</span><div><strong>LECCIÓN DEL TEMA ACTUAL</strong><small>Aprender → practicar → comprobar</small></div></button>
            <button id="v17-pronunciation" class="v17-big-action violet"><span>🎙</span><div><strong>LAB. DE PRONUNCIACIÓN</strong><small>Escucha y habla con micrófono</small></div></button>
          </div>
        </div>

        <div class="v17-coach-zone">
          <div class="v17-coach-spark s1">✦</div><div class="v17-coach-spark s2">●</div><div class="v17-coach-spark s3">✧</div>
          <div class="v17-mascot nova-mascot language-mascot" id="v17-coach-mascot">
            <span class="mascot-ear left"></span><span class="mascot-ear right"></span>
            <div class="mascot-head"><i class="mascot-eye left"></i><i class="mascot-eye right"></i><b class="mascot-mouth"></b></div>
            <div class="mascot-body"><span>文</span></div>
            <i class="mascot-arm left"></i><i class="mascot-arm right"></i>
          </div>
          <div class="v17-coach-bubble" id="v17-coach-bubble"><strong>NOVA</strong><span>Primero entiendo contigo, luego te hago practicar.</span></div>
        </div>

        <div class="v17-stats-bar">
          <div><span class="stat-icon fire">🔥</span><b id="lang-streak">—</b><small>racha</small></div>
          <div><span class="stat-icon bolt">⚡</span><b id="lang-today-xp">—</b><small>XP hoy</small></div>
          <div><span class="stat-icon gem">◆</span><b id="lang-total-xp">—</b><small>XP total</small></div>
          <div><span class="stat-icon target">◎</span><b id="lang-course-progress">—</b><small>curso</small></div>
        </div>
      </section>

      <section class="v17-daily-plan">
        <div class="v17-section-heading">
          <div><span>PLAN DE HOY</span><h2>Tu sesión de aprendizaje</h2></div>
          <small>Diseñada para combinar comprensión, memoria y producción.</small>
        </div>
        <div class="v17-mission-grid">
          <button class="v17-mission green" id="v17-mission-lesson"><span class="mission-icon">📘</span><div><b>1</b><strong>Aprende el tema</strong><small>Mini-clase + ejemplos + vocabulario</small></div><em>10–15 min</em></button>
          <button class="v17-mission blue" id="v17-mission-practice"><span class="mission-icon">🧠</span><div><b>2</b><strong>Práctica adaptativa</strong><small>Retos variados con corrección inmediata</small></div><em>8–10 min</em></button>
          <button class="v17-mission purple" id="v17-mission-speak"><span class="mission-icon">🎙</span><div><b>3</b><strong>Habla en voz alta</strong><small>Pronunciación y producción real</small></div><em>5 min</em></button>
          <button class="v17-mission coral" id="v17-mission-converse"><span class="mission-icon">💬</span><div><b>4</b><strong>Conversa con IA</strong><small>Usa lo aprendido en contexto</small></div><em>libre</em></button>
        </div>
      </section>

      <section class="v17-learning-path card">
        <div class="v17-section-heading compact">
          <div><span>RUTA PROGRESIVA</span><h2 id="lang-route-title">Cargando tu ruta…</h2></div>
          <button id="lang-open-course" class="ghost-btn">VER CURSO COMPLETO →</button>
        </div>
        <div id="language-route" class="language-route"><div class="route-loading"><i></i><span>Preparando progreso…</span></div></div>
      </section>

      <section class="v17-practice-studio">
        <aside class="v17-skill-rail">
          <div class="v17-skill-title"><span>ENTRENAR</span><strong>Habilidades</strong></div>
          <button class="v17-skill active" data-v17-challenge="mixed"><span class="skill-icon green">✦</span><div><b>Lección completa</b><small>Explicación + 8 retos</small></div></button>
          <button class="v17-skill" data-v17-challenge="listen"><span class="skill-icon blue">🎧</span><div><b>Escuchar</b><small>Comprensión auditiva</small></div></button>
          <button class="v17-skill" data-v17-challenge="order"><span class="skill-icon yellow">🧩</span><div><b>Construir frases</b><small>Orden y sintaxis</small></div></button>
          <button class="v17-skill" data-v17-challenge="speak"><span class="skill-icon purple">🎙</span><div><b>Pronunciar</b><small>Micrófono + comparación</small></div></button>
          <button class="v17-skill" data-v17-challenge="translate"><span class="skill-icon coral">✍</span><div><b>Escribir</b><small>Producción activa</small></div></button>
          <div class="v17-session-mini">
            <span>SESIÓN RÁPIDA</span>
            <strong><b id="lang-session-score">0</b> XP</strong>
            <small id="lang-session-attempts">0 retos realizados</small>
          </div>
        </aside>

        <main class="v17-lesson-stage" id="language-challenge">
          <div class="v17-stage-welcome">
            <div class="v17-stage-orb"><span>${escapeHtml(meta.mark)}</span></div>
            <div class="eyebrow">AULA INTERACTIVA</div>
            <h2>Tu próxima lección está lista.</h2>
            <p id="v17-current-topic">Cargando el tema actual…</p>
            <div class="v17-stage-benefits">
              <span>✓ explicación breve</span><span>✓ ejemplos</span><span>✓ 8 ejercicios</span><span>✓ pronunciación</span>
            </div>
            <button id="v17-stage-start" class="primary-btn">COMENZAR LECCIÓN</button>
          </div>
        </main>
      </section>

      <section class="v17-coach-ai" id="v17-coach-ai">
        <div class="v17-section-heading">
          <div><span>COACH IA</span><h2>Conversa, pregunta y corrige tus errores</h2></div>
          <small>El Coach IA no sustituye la ruta: la complementa con práctica libre.</small>
        </div>
        <div class="language-course-grid">
          <aside class="card language-controls">
            <div class="panel-code">CONFIGURAR SESIÓN</div>
            <div class="field"><label>Nivel</label><select id="lang-level"><option>Empezar desde cero</option><option selected>A1 — Principiante</option><option>A2 — Elemental</option><option>B1 — Intermedio</option><option>B2 — Intermedio alto</option><option>C1 — Avanzado</option><option>C2 — Dominio</option></select></div>
            <div class="field"><label>Objetivo</label><select id="lang-focus"><option>Curso completo equilibrado</option><option>Conversación</option><option>Comprensión auditiva</option><option>Pronunciación</option><option>Gramática en contexto</option><option>Vocabulario</option><option>Lectura</option><option>Escritura</option><option>Idioma médico y científico</option></select></div>
            <div class="field"><label>Inmersión</label><select id="lang-immersion"><option value="30">30% · mucha explicación en español</option><option value="60" selected>60% · equilibrio</option><option value="85">85% · mucha práctica</option><option value="100">100% · inmersión</option></select></div>
            <button id="lang-start" class="primary-btn wide">INICIAR CLASE GUIADA</button>
            <button id="lang-placement" class="secondary-btn wide" style="margin-top:8px">PRUEBA DE NIVEL</button>
            <button id="lang-new" class="ghost-btn wide" style="margin-top:8px">NUEVA CONVERSACIÓN</button>
          </aside>
          <div class="card chat-panel language-chat">
            <div class="language-toolbar"><span id="language-session-label">Coach de ${escapeHtml(meta.name)}</span><div><button id="lang-listen" class="secondary-btn">🔊 Escuchar respuesta</button></div></div>
            <div id="language-messages" class="messages"><div class="message ai">Estoy listo para ayudarte a usar el idioma de forma real. Pregunta, escribe o habla y corregiremos juntos.</div></div>
            <div class="composer"><button id="lang-mic" class="icon-btn" title="Hablar">🎙</button><textarea id="language-input" rows="2" placeholder="Escribe o habla en el idioma que estás aprendiendo..."></textarea><button id="language-send" class="primary-btn">Enviar</button></div>
          </div>
        </div>
      </section>
    </div>`;

  $$(".v17-language-pill").forEach(btn=>btn.onclick=()=>selectLanguageV17(btn.dataset.lang));
  $("#v17-start-lesson").onclick=()=>startV17LanguageLesson();
  $("#v17-mission-lesson").onclick=()=>startV17LanguageLesson();
  $("#v17-mission-practice").onclick=()=>startV17LanguageLesson(true);
  $("#v17-pronunciation").onclick=()=>startLanguageChallenge("speak");
  $("#v17-mission-speak").onclick=()=>startLanguageChallenge("speak");
  $("#v17-mission-converse").onclick=()=>$("#v17-coach-ai")?.scrollIntoView({behavior:"smooth",block:"start"});
  $("#v17-stage-start").onclick=()=>startV17LanguageLesson();

  $$(".v17-skill").forEach(btn=>btn.onclick=()=>{
    $$(".v17-skill").forEach(x=>x.classList.toggle("active",x===btn));
    const type=btn.dataset.v17Challenge;
    if(type==="mixed") startV17LanguageLesson(true);
    else startLanguageChallenge(type);
  });

  $("#lang-open-course").onclick=openSelectedLanguageCourse;
  $("#lang-start").onclick=()=>startLanguageLesson(false);
  $("#lang-placement").onclick=()=>startLanguageLesson(true);
  $("#language-send").onclick=()=>sendLanguageMessage();
  $("#language-input").addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendLanguageMessage()}});
  $("#lang-new").onclick=()=>{state.languageConversation=null;state.lastLanguageAnswer="";$("#language-messages").innerHTML=`<div class="message ai">Nueva sesión lista. Vamos a trabajar una habilidad concreta.</div>`};
  $("#lang-mic").onclick=()=>startSpeechRecognition($("#language-input"),state.courseLanguage);
  $("#lang-listen").onclick=()=>{if(!state.lastLanguageAnswer)return toast("Todavía no hay una respuesta para escuchar.",true);speakLanguageText(state.lastLanguageAnswer,state.courseLanguage)};
  $("#lang-level").onchange=updateLanguageLabel;
  updateLanguageLabel();

  await refreshLanguageOverview();
  updateV17LanguageCurrentTopic();
}

async function selectLanguageV17(code){
  if(!LANGUAGE_META[code])return;
  state.courseLanguage=code;
  localStorage.setItem("medai_course_language",code);
  state.languageConversation=null;
  state.lastLanguageAnswer="";
  state.languageLessonSession=null;
  state.languageGame={mode:null,current:null,score:0,attempts:0,selectedWords:[]};

  $$(".v17-language-pill").forEach(b=>b.classList.toggle("active",b.dataset.lang===code));
  const m=LANGUAGE_META[code];
  if($("#v17-lang-hello"))$("#v17-lang-hello").textContent=m.hello;
  if($(".v17-lang-hero h1"))$(".v17-lang-hero h1").innerHTML=`<span id="v17-lang-hello">${escapeHtml(m.hello)}</span> Aprende ${escapeHtml(m.name)} haciendo.`;
  if($("#language-session-label"))$("#language-session-label").textContent=`Coach de ${m.name}`;
  if($("#language-messages"))$("#language-messages").innerHTML=`<div class="message ai">Idioma cambiado a ${escapeHtml(m.name)}. Su progreso se guarda de forma independiente.</div>`;
  if($("#language-challenge"))$("#language-challenge").innerHTML=`<div class="v17-stage-welcome"><div class="v17-stage-orb"><span>${escapeHtml(m.mark)}</span></div><div class="eyebrow">AULA INTERACTIVA</div><h2>Tu próxima lección está lista.</h2><p id="v17-current-topic">Cargando el tema actual…</p><div class="v17-stage-benefits"><span>✓ explicación breve</span><span>✓ ejemplos</span><span>✓ 8 ejercicios</span><span>✓ pronunciación</span></div><button id="v17-stage-start" class="primary-btn">COMENZAR LECCIÓN</button></div>`;
  $("#v17-stage-start").onclick=()=>startV17LanguageLesson();

  updateV17Coach(`¡${m.hello.replace(/[!！]/g,"")}! Vamos a construir ${m.name} paso a paso.`);
  await refreshLanguageOverview();
  updateV17LanguageCurrentTopic();
}

function updateV17LanguageCurrentTopic(){
  const course=state.languageCourse;
  const idx=Math.max(0,Number(course?.next_index||0));
  const item=course?.items?.[idx];
  const text=item?`Tema actual: ${item.topic_name} · ${Math.round(Number(item.progress_percent||0))}% estudiado`:"Preparando tu ruta del idioma…";
  if($("#v17-current-topic"))$("#v17-current-topic").textContent=text;
}

async function startV17LanguageLesson(practiceFirst=false){
  const subject=getSubjectByCode("LANG");
  if(!subject)return toast("No pude encontrar la materia Idiomas.",true);
  if(!state.languageCourse){
    await refreshLanguageOverview();
  }
  const course=state.languageCourse;
  const idx=Math.max(0,Number(course?.next_index||0));
  const item=course?.items?.[idx];
  if(!item)return toast("No hay un tema disponible en este curso.",true);

  const stage=$("#language-challenge");
  stage.innerHTML=`<div class="v17-pack-loading"><div class="v17-loading-orb"><i></i><i></i><i></i></div><strong>Preparando una lección interactiva</strong><span>${escapeHtml(item.topic_name)}</span><small>Explicación + ejemplos + práctica variada</small></div>`;
  updateV17Coach("Estoy preparando una clase corta y ejercicios distintos para que realmente practiques.");

  let pack;
  try{
    pack=await api("/api/language/lesson-pack",{method:"POST",body:{
      language:state.courseLanguage,
      topic:item.topic_name,
      level:$("#lang-level")?.value||"A1 — Principiante",
      practice_first:practiceFirst
    }});
  }catch(err){
    pack=buildV17FallbackLesson(item.topic_name);
    toast("Usando una lección local de respaldo para evitar interrumpir el estudio.",false);
  }

  const exercises=Array.isArray(pack.exercises)&&pack.exercises.length?pack.exercises:buildV17FallbackLesson(item.topic_name).exercises;
  state.languageLessonSession={
    pack:{...pack,exercises},
    item,
    index:0,
    hearts:5,
    xp:0,
    correct:0,
    answered:false,
    built:[]
  };
  if(practiceFirst) renderV17Exercise();
  else renderV17LessonIntro();
}

function buildV17FallbackLesson(topic){
  const bank=LANGUAGE_CHALLENGES[state.courseLanguage]||LANGUAGE_CHALLENGES["en-US"];
  const items=languageShuffle(bank).slice(0,6);
  const m=LANGUAGE_META[state.courseLanguage]||LANGUAGE_META["en-US"];
  const first=items[0]||bank[0];
  return {
    title:topic,
    goal:`Comprender y usar expresiones esenciales relacionadas con ${topic}.`,
    coach_tip:"Lee los ejemplos en voz alta. Después intenta responder sin mirar la solución.",
    vocabulary:items.slice(0,5).map(x=>({target:x.target,es:x.es,pronunciation:x.roman||""})),
    mini_lesson:[
      {title:"Idea clave",body:`Hoy trabajarás ${topic} mediante comprensión, recuperación activa y producción.`,example:first?.target||""},
      {title:"Cómo estudiar",body:"Observa el patrón, repítelo, oculta la respuesta y trata de producirlo por tu cuenta.",example:first?.es||""}
    ],
    exercises:[
      {type:"choice",instruction:"Elige el significado correcto.",prompt:items[0]?.target||first.target,options:languageShuffle([items[0]?.es||first.es,...languageShuffle(bank.filter(x=>x!==items[0])).slice(0,3).map(x=>x.es)]),answer:items[0]?.es||first.es,explanation:"Relaciona la frase completa con su significado."},
      {type:"listen",instruction:"Escucha y elige lo que significa.",target:items[1]?.target||first.target,options:languageShuffle([items[1]?.es||first.es,...languageShuffle(bank.filter(x=>x!==items[1])).slice(0,3).map(x=>x.es)]),answer:items[1]?.es||first.es,explanation:"Escucha primero el ritmo general y después identifica las palabras clave."},
      {type:"order",instruction:"Ordena las palabras.",prompt_es:items[2]?.es||first.es,words:String(items[2]?.target||first.target).replace(/[.,!?¿¡]/g,"").split(/\s+/),answer:String(items[2]?.target||first.target).replace(/[.,!?¿¡]/g,""),explanation:"Reconstruir la frase obliga a recordar el orden sintáctico."},
      {type:"translate",instruction:"Escribe la frase en el idioma objetivo.",prompt_es:items[3]?.es||first.es,answer:items[3]?.target||first.target,explanation:"No busques traducir palabra por palabra: recupera la expresión completa."},
      {type:"fill",instruction:"Completa la expresión.",prompt:`${String(items[4]?.target||first.target).split(/\s+/).slice(0,-1).join(" ")} ____`,answer:String(items[4]?.target||first.target).split(/\s+/).slice(-1)[0],explanation:"Recuerda qué palabra completa naturalmente la expresión."},
      {type:"speak",instruction:"Escucha y repite.",target:items[4]?.target||first.target,pronunciation:items[4]?.roman||"",explanation:"Hablar en voz alta fortalece la producción y el reconocimiento auditivo."},
      {type:"choice",instruction:"Selecciona la traducción correcta.",prompt:items[5]?.target||first.target,options:languageShuffle([items[5]?.es||first.es,...languageShuffle(bank.filter(x=>x!==items[5])).slice(0,3).map(x=>x.es)]),answer:items[5]?.es||first.es,explanation:"Comprueba el significado en contexto."},
      {type:"translate",instruction:"Último reto: produce la frase sin ayuda.",prompt_es:first.es,answer:first.target,explanation:"La producción libre es la mejor comprobación de recuerdo."}
    ]
  };
}

function renderV17LessonIntro(){
  const session=state.languageLessonSession;if(!session)return;
  const p=session.pack;
  const stage=$("#language-challenge");
  stage.innerHTML=`
    <div class="v17-lesson-intro">
      <div class="v17-lesson-top">
        <div><span>MINI-LECCIÓN</span><h2>${escapeHtml(p.title||session.item.topic_name)}</h2><p>${escapeHtml(p.goal||"Comprender el tema y usarlo activamente.")}</p></div>
        <div class="v17-intro-badge">ANTES DE PRACTICAR</div>
      </div>
      <div class="v17-teach-grid">
        ${(p.mini_lesson||[]).slice(0,3).map((x,i)=>`<article class="v17-teach-card"><span>${String(i+1).padStart(2,"0")}</span><h3>${escapeHtml(x.title||"Concepto")}</h3><p>${escapeHtml(x.body||"")}</p>${x.example?`<blockquote dir="${LANGUAGE_META[state.courseLanguage]?.dir||"ltr"}">${escapeHtml(x.example)}</blockquote>`:""}</article>`).join("")}
      </div>
      <div class="v17-vocab-board">
        <div class="v17-vocab-head"><div><span>VOCABULARIO / PATRONES</span><strong>Recuerda estas piezas</strong></div><button id="v17-hear-vocab" class="secondary-btn">🔊 ESCUCHAR EJEMPLOS</button></div>
        <div class="v17-vocab-list">${(p.vocabulary||[]).slice(0,8).map(v=>`<div class="v17-vocab-chip"><strong dir="${LANGUAGE_META[state.courseLanguage]?.dir||"ltr"}">${escapeHtml(v.target||"")}</strong><span>${escapeHtml(v.es||"")}</span>${v.pronunciation?`<small>${escapeHtml(v.pronunciation)}</small>`:""}</div>`).join("")}</div>
      </div>
      <div class="v17-coach-tip"><div class="mini-coach-face">✦</div><div><strong>Consejo de NOVA</strong><span>${escapeHtml(p.coach_tip||"Intenta responder antes de mirar la explicación.")}</span></div></div>
      <button id="v17-begin-exercises" class="v17-continue-btn">EMPEZAR 8 RETOS <span>→</span></button>
    </div>`;
  $("#v17-begin-exercises").onclick=renderV17Exercise;
  $("#v17-hear-vocab").onclick=()=>{
    const text=(p.vocabulary||[]).slice(0,5).map(v=>v.target).filter(Boolean).join(". ");
    if(text)speakLanguageText(text,state.courseLanguage);
  };
  updateV17Coach("Primero comprende el patrón. Después vamos a hacerte recuperar la información sin mirar.");
}

function renderV17Exercise(){
  const s=state.languageLessonSession;if(!s)return;
  if(s.index>=s.pack.exercises.length){renderV17LessonSummary();return}
  s.answered=false;s.built=[];
  const ex=s.pack.exercises[s.index];
  const total=s.pack.exercises.length;
  const progress=Math.round((s.index/total)*100);
  const stage=$("#language-challenge");
  const dir=LANGUAGE_META[state.courseLanguage]?.dir||"ltr";

  stage.innerHTML=`
    <div class="v17-exercise-shell">
      <div class="v17-exercise-topbar">
        <button id="v17-exit-lesson" class="v17-exit-btn">×</button>
        <div class="v17-exercise-progress"><i style="width:${progress}%"></i></div>
        <div class="v17-hearts" aria-label="${s.hearts} oportunidades">${Array.from({length:5},(_,i)=>`<span class="${i<s.hearts?"full":""}">♥</span>`).join("")}</div>
        <div class="v17-live-xp">⚡ ${s.xp}</div>
      </div>
      <div class="v17-exercise-count">RETO ${s.index+1} DE ${total}</div>
      <div id="v17-exercise-body" class="v17-exercise-body">${renderV17ExerciseBody(ex,dir)}</div>
      <div id="v17-answer-feedback" class="v17-answer-feedback hidden"></div>
    </div>`;

  $("#v17-exit-lesson").onclick=()=>renderLanguageLabV17();
  bindV17Exercise(ex);
}

function renderV17ExerciseBody(ex,dir){
  const type=String(ex.type||"choice").toLowerCase();
  const instruction=escapeHtml(ex.instruction||"Resuelve el ejercicio.");
  if(type==="choice"){
    const options=(ex.options||[]).slice(0,4);
    return `<div class="v17-exercise-icon green">✓</div><h2>${instruction}</h2><div class="v17-target-text" dir="${dir}">${escapeHtml(ex.prompt||ex.target||"")}</div><div class="v17-choice-grid">${options.map((o,i)=>`<button class="v17-choice" data-answer="${escapeAttr(o)}"><span>${String.fromCharCode(65+i)}</span><strong>${escapeHtml(o)}</strong></button>`).join("")}</div>`;
  }
  if(type==="listen"){
    return `<div class="v17-exercise-icon blue">🎧</div><h2>${instruction}</h2><button id="v17-play-audio" class="v17-audio-orb">▶<small>ESCUCHAR</small></button><div class="v17-choice-grid">${(ex.options||[]).slice(0,4).map((o,i)=>`<button class="v17-choice" data-answer="${escapeAttr(o)}"><span>${String.fromCharCode(65+i)}</span><strong>${escapeHtml(o)}</strong></button>`).join("")}</div>`;
  }
  if(type==="order"){
    const words=languageShuffle((ex.words||String(ex.answer||"").split(/\s+/)).filter(Boolean));
    return `<div class="v17-exercise-icon yellow">🧩</div><h2>${instruction}</h2>${ex.prompt_es?`<p class="v17-prompt-es">${escapeHtml(ex.prompt_es)}</p>`:""}<div id="v17-order-built" class="v17-order-built"><span>Toca las palabras para construir la frase</span></div><div id="v17-word-bank" class="v17-word-bank">${words.map((w,i)=>`<button class="v17-word" data-word="${escapeAttr(w)}" data-wid="${i}">${escapeHtml(w)}</button>`).join("")}</div><button id="v17-check-order" class="primary-btn" disabled>COMPROBAR</button>`;
  }
  if(type==="translate"){
    return `<div class="v17-exercise-icon coral">✍</div><h2>${instruction}</h2><div class="v17-translate-prompt">${escapeHtml(ex.prompt_es||ex.prompt||"")}</div><input id="v17-text-answer" class="v17-answer-input" autocomplete="off" placeholder="Escribe tu respuesta..."><button id="v17-check-text" class="primary-btn">COMPROBAR</button>`;
  }
  if(type==="fill"){
    return `<div class="v17-exercise-icon yellow">▱</div><h2>${instruction}</h2><div class="v17-target-text" dir="${dir}">${escapeHtml(ex.prompt||"")}</div><input id="v17-text-answer" class="v17-answer-input" autocomplete="off" placeholder="Completa la palabra o expresión..."><button id="v17-check-text" class="primary-btn">COMPROBAR</button>`;
  }
  if(type==="speak"){
    return `<div class="v17-exercise-icon purple">🎙</div><h2>${instruction}</h2><button id="v17-speak-model" class="secondary-btn">🔊 ESCUCHAR MODELO</button><div class="v17-pronounce-target" dir="${dir}">${escapeHtml(ex.target||ex.answer||"")}</div>${ex.pronunciation?`<div class="v17-pronounce-guide">${escapeHtml(ex.pronunciation)}</div>`:""}<button id="v17-speak-now" class="v17-mic-orb">🎙<small>HABLAR</small></button><div id="v17-speech-live" class="v17-speech-live">Pulsa el micrófono y repite la frase.</div><button id="v17-manual-speak" class="ghost-btn">NO TENGO MICRÓFONO · YA LA REPETÍ</button>`;
  }
  return `<div class="v17-exercise-icon green">✦</div><h2>${instruction}</h2><p>${escapeHtml(ex.prompt||"")}</p>`;
}

function bindV17Exercise(ex){
  const type=String(ex.type||"choice").toLowerCase();

  $$(".v17-choice").forEach(btn=>btn.onclick=()=>finishV17Exercise(btn.dataset.answer,ex));

  $("#v17-play-audio")?.addEventListener("click",()=>speakLanguageText(ex.target||ex.prompt||"",state.courseLanguage));

  if(type==="order"){
    $$(".v17-word").forEach(btn=>btn.onclick=()=>{
      if(btn.disabled)return;
      btn.disabled=true;
      state.languageLessonSession.built.push({word:btn.dataset.word,id:btn.dataset.wid});
      renderV17BuiltWords();
    });
    $("#v17-check-order").onclick=()=>finishV17Exercise(state.languageLessonSession.built.map(x=>x.word).join(" "),ex);
  }

  $("#v17-check-text")?.addEventListener("click",()=>finishV17Exercise($("#v17-text-answer").value.trim(),ex));
  $("#v17-text-answer")?.addEventListener("keydown",e=>{if(e.key==="Enter")finishV17Exercise(e.currentTarget.value.trim(),ex)});

  if(type==="speak"){
    $("#v17-speak-model").onclick=()=>speakLanguageText(ex.target||ex.answer||"",state.courseLanguage);
    $("#v17-speak-now").onclick=()=>runV17SpeechExercise(ex);
    $("#v17-manual-speak").onclick=()=>finishV17Exercise("manual",ex,{manual:true});
  }
}

function renderV17BuiltWords(){
  const built=state.languageLessonSession.built;
  const box=$("#v17-order-built");
  box.innerHTML=built.length?built.map((x,i)=>`<button class="v17-built-word" data-index="${i}">${escapeHtml(x.word)} ×</button>`).join(""):`<span>Toca las palabras para construir la frase</span>`;
  $$(".v17-built-word",box).forEach(btn=>btn.onclick=()=>{
    const [removed]=built.splice(Number(btn.dataset.index),1);
    const original=$(`.v17-word[data-wid="${removed.id}"]`);
    if(original)original.disabled=false;
    renderV17BuiltWords();
  });
  $("#v17-check-order").disabled=!built.length;
}

async function finishV17Exercise(userAnswer,ex,opts={}){
  const s=state.languageLessonSession;
  if(!s||s.answered)return;
  s.answered=true;

  let similarity=0,correct=false,evaluated=true;
  const type=String(ex.type||"choice").toLowerCase();
  const expected=String(ex.answer||ex.target||"").trim();

  if(opts.manual){
    evaluated=false;correct=true;similarity=.75;
  }else if(type==="choice"||type==="listen"){
    correct=normalizeLanguageText(userAnswer)===normalizeLanguageText(expected);
    similarity=correct?1:0;
  }else{
    similarity=languageSimilarity(userAnswer,expected);
    const threshold=type==="speak"?.64:type==="fill"?.72:.68;
    correct=similarity>=threshold;
  }

  const xp=opts.manual?2:correct?(type==="speak"?15:10):1;
  s.xp+=xp;
  if(correct&&evaluated)s.correct++;
  if(!correct)s.hearts=Math.max(0,s.hearts-1);

  const feedback=$("#v17-answer-feedback");
  feedback.classList.remove("hidden");
  feedback.className=`v17-answer-feedback ${correct?"success":"retry"}`;
  feedback.innerHTML=`
    <div class="v17-feedback-icon">${correct?"✓":"↻"}</div>
    <div class="v17-feedback-copy">
      <strong>${correct?(opts.manual?"Práctica oral registrada":"¡Muy bien!"): "Todavía no. Revísalo."}</strong>
      ${!correct?`<span><b>Respuesta esperada:</b> <span dir="${LANGUAGE_META[state.courseLanguage]?.dir||"ltr"}">${escapeHtml(expected)}</span></span>`:""}
      ${ex.explanation?`<small>${escapeHtml(ex.explanation)}</small>`:""}
      ${!opts.manual&&type!=="choice"&&type!=="listen"?`<small>Coincidencia aproximada: ${Math.round(similarity*100)}%</small>`:""}
    </div>
    <button id="v17-next-exercise" class="v17-feedback-next">${s.index+1>=s.pack.exercises.length?"VER RESULTADO":"CONTINUAR →"}</button>`;

  disableV17ExerciseControls();

  try{
    await recordLanguagePractice(xp,correct&&evaluated?1:0,evaluated?1:0,45);
    if(correct)await syncLanguagePracticeToCourse().catch(()=>{});
    await refreshLanguageStatsOnly().catch(()=>{});
  }catch{}

  if(correct){
    showLanguageCelebration();
    updateV17Coach(["¡Exacto! Ahora tu cerebro tuvo que recuperar la respuesta.","Bien hecho. Esa recuperación activa vale más que releer.","¡Excelente! Vamos aumentando la dificultad."][Math.floor(Math.random()*3)],"happy");
  }else{
    updateV17Coach("Mira la corrección, compárala con lo que respondiste y vuelve a producirla mentalmente antes de continuar.","thinking");
  }

  $("#v17-next-exercise").onclick=()=>{s.index++;renderV17Exercise()};
}

function disableV17ExerciseControls(){
  $$("#v17-exercise-body button,#v17-exercise-body input").forEach(el=>el.disabled=true);
}

function runV17SpeechExercise(ex){
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  const live=$("#v17-speech-live"),mic=$("#v17-speak-now");
  if(!SR){
    live.innerHTML=`<strong>Tu navegador no ofrece reconocimiento de voz para esta sesión.</strong><span>Escucha el modelo, repite en voz alta y usa el botón de práctica manual.</span>`;
    return;
  }
  const rec=new SR();
  rec.lang=state.courseLanguage;
  rec.interimResults=true;
  rec.continuous=false;
  rec.maxAlternatives=3;
  let final="";
  mic.classList.add("listening");
  live.textContent="Escuchando… habla ahora.";

  rec.onresult=e=>{
    let interim="";
    for(let i=e.resultIndex;i<e.results.length;i++){
      const t=e.results[i][0].transcript;
      if(e.results[i].isFinal)final+=t;else interim+=t;
    }
    live.textContent=final||interim||"Escuchando…";
  };
  rec.onerror=e=>{
    mic.classList.remove("listening");
    const msg=e.error==="not-allowed"?"Necesito permiso del micrófono para evaluar tu pronunciación.":e.error==="language-not-supported"?"El navegador no admite reconocimiento para este idioma. Puedes practicar escuchando y repitiendo.":"No pude reconocer la voz. Inténtalo otra vez.";
    live.textContent=msg;
  };
  rec.onend=()=>{
    mic.classList.remove("listening");
    if(final.trim()){
      live.innerHTML=`<span>Escuché:</span><strong>${escapeHtml(final)}</strong>`;
      finishV17Exercise(final,ex);
    }
  };
  try{rec.start()}catch{live.textContent="El micrófono ya está activo."}
}

function renderV17LessonSummary(){
  const s=state.languageLessonSession;if(!s)return;
  const total=s.pack.exercises.length;
  const pct=total?Math.round((s.correct/total)*100):0;
  const passed=pct>=70;
  $("#language-challenge").innerHTML=`
    <div class="v17-lesson-summary">
      <div class="v17-summary-character ${passed?"celebrate":"encourage"}">
        <div class="v17-mascot nova-mascot">
          <span class="mascot-ear left"></span><span class="mascot-ear right"></span>
          <div class="mascot-head"><i class="mascot-eye left"></i><i class="mascot-eye right"></i><b class="mascot-mouth"></b></div>
          <div class="mascot-body"><span>${passed?"★":"✦"}</span></div>
        </div>
      </div>
      <span class="v17-summary-label">LECCIÓN TERMINADA</span>
      <h2>${passed?"¡Gran sesión!":"Buen trabajo: ahora refuerza lo difícil."}</h2>
      <p>${escapeHtml(s.item.topic_name)}</p>
      <div class="v17-summary-stats">
        <div><strong>${pct}%</strong><small>precisión</small></div>
        <div><strong>+${s.xp}</strong><small>XP</small></div>
        <div><strong>${s.hearts}/5</strong><small>oportunidades</small></div>
      </div>
      <div class="v17-summary-note">${passed?"Ya practicaste el tema. El curso oficial se completa únicamente cuando apruebas su examen final.":"Repite la práctica o conversa con el Coach IA antes de ir al examen."}</div>
      <div class="v17-summary-actions">
        <button id="v17-repeat-lesson" class="secondary-btn">REPETIR PRÁCTICA</button>
        <button id="v17-go-course-exam" class="primary-btn">IR AL TEMA Y EXAMEN →</button>
      </div>
    </div>`;
  $("#v17-repeat-lesson").onclick=()=>startV17LanguageLesson(true);
  $("#v17-go-course-exam").onclick=()=>openLanguageCourseLesson(Number(state.languageCourse?.next_index||0));
  updateV17Coach(passed?"Terminaste la práctica. Cuando te sientas listo, aprueba el examen del tema para avanzar.":"Tus errores ya nos dicen qué repasar. Eso también es progreso.",passed?"happy":"thinking");
}

function updateV17Coach(text,mood="normal"){
  const bubble=$("#v17-coach-bubble span");
  if(bubble)bubble.textContent=text;
  const mascot=$("#v17-coach-mascot");
  if(mascot){
    mascot.classList.remove("happy","thinking");
    if(mood!=="normal")mascot.classList.add(mood);
  }
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
  if(mode==="tutor"){state.tutorTranscript=[];state.tutorSessionTitle="";}
  root.innerHTML=`
    <div class="page-head"><div><div class="eyebrow">${escapeHtml(cfg.kicker)}</div><h2>${escapeHtml(cfg.title)}</h2><p>${escapeHtml(cfg.subtitle)}</p></div></div>
    <div class="chat-layout">
      <div class="card chat-panel">
        <div id="messages" class="messages"></div>
        <div class="composer">
          <button id="mic-btn" class="icon-btn" title="Hablar">🎙</button>
          <textarea id="chat-input" rows="2" placeholder="${escapeHtml(cfg.placeholder)}"></textarea>
          <button id="send-chat" class="primary-btn">Enviar</button>
        </div>
      </div>
      <div class="side-tools">
        <div class="card">
          <div class="eyebrow" style="margin-bottom:10px">CONFIGURACIÓN DE LA SESIÓN</div>
          <div class="field"><label>Materia</label><select id="ai-subject">${subjectOptions()}</select></div>
          <div class="field"><label>Nivel</label><select id="ai-level">
            <option>Primeros años</option><option>Ciencias básicas</option><option>Clínico</option>
            <option>Internado</option><option>Médico general</option><option>R1</option><option>R2</option><option>R3</option><option>Internista</option>
          </select></div>
          <button id="new-chat" class="ghost-btn wide">Nueva sesión</button>
        </div>
        ${mode==="tutor"?`
        <div class="card tutor-save-card">
          <div class="eyebrow">GUARDAR CLASE</div>
          <div class="field"><label>Título</label><input id="tutor-class-title" placeholder="Ej. Fisiología del corazón"></div>
          <button id="save-tutor-class" class="primary-btn wide">GUARDAR EN BIBLIOTECA</button>
          <button id="download-tutor-word" class="secondary-btn wide" style="margin-top:8px">DESCARGAR WORD</button>
          <p class="tutor-auto-note">Las conversaciones del Tutor también se archivan automáticamente en tu perfil para que puedas reabrirlas después.</p>
        </div>
        <div class="card tutor-history-card">
          <div class="eyebrow">HISTORIAL DEL TUTOR</div>
          <div id="tutor-history" class="tutor-history"><div class="empty">Cargando clases anteriores...</div></div>
        </div>`:""}
        <div class="info-box">Tutor IA es libre: puedes estudiar cualquier tema, aunque no corresponda todavía al curso estructurado. Esto no altera el progreso oficial de los cursos.</div>
        <div class="notice">Entrenamiento educativo. En pacientes reales, verifica recomendaciones con fuentes clínicas actuales y supervisión profesional.</div>
      </div>
    </div>`;
  appendMessage("ai",cfg.welcome);
  if(state.currentSubject && [...$("#ai-subject").options].some(o=>o.value===state.currentSubject.id)) $("#ai-subject").value=state.currentSubject.id;
  $("#send-chat").onclick=()=>sendChat(mode);
  $("#chat-input").addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendChat(mode)}});
  $("#new-chat").onclick=()=>{state.chatConversation=null;if(mode==="tutor")state.tutorTranscript=[];$("#messages").innerHTML="";appendMessage("ai",cfg.welcome);if($("#tutor-class-title"))$("#tutor-class-title").value=""};
  $("#mic-btn").onclick=()=>startSpeechRecognition($("#chat-input"));
  if(mode==="tutor"){
    $("#save-tutor-class").onclick=saveTutorClassToLibrary;
    $("#download-tutor-word").onclick=downloadTutorWord;
    loadTutorHistory();
  }
}

async function sendChat(mode){
  const input=$("#chat-input"),message=input.value.trim();if(!message)return;
  appendMessage("user",message);input.value="";
  if(mode==="tutor") state.tutorTranscript.push({role:"user",content:message});
  const subjectId=$("#ai-subject")?.value||state.currentSubject?.id||null;
  const subject=state.subjects.find(s=>s.id===subjectId)?.name||"Tema libre";
  const level=$("#ai-level")?.value||"Clínico";
  if(mode==="tutor" && $("#tutor-class-title") && !$("#tutor-class-title").value.trim()) $("#tutor-class-title").value=`${subject} · ${firstWords(message,6)}`;
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
        message:`Nivel del estudiante: ${level}. Materia: ${subject}.\n\n${message}`,
        conversation_id:state.chatConversation,
        subject_id:subjectId,
        topic_id:null,
        title:mode==="tutor"?($("#tutor-class-title")?.value.trim()||`Tutor IA — ${subject}`):`${modeConfig(mode).title} — ${subject}`
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
            if(!gotFirstToken){gotFirstToken=true;thinking.classList.add("streaming")}
            $("#messages").scrollTop=$("#messages").scrollHeight;
          }
        }catch{}
      }
    }

    if(!answer.trim()) answer="No pude generar una respuesta en este momento.";
    thinking.classList.remove("streaming");
    setMessageContent(thinking,"ai",answer);
    if(mode==="tutor"){
      state.tutorTranscript.push({role:"assistant",content:answer});
      loadTutorHistory().catch(()=>{});
    }
  }catch(err){
    thinking.classList.remove("loading","streaming");
    setMessageContent(thinking,"ai",`Error: ${err.message}`);
  }finally{
    $("#send-chat").disabled=false;input.focus();
  }
}

async function loadTutorHistory(){
  const box=$("#tutor-history");if(!box)return;
  try{
    const d=await api("/api/tutor-sessions");
    const sessions=d.sessions||[];
    box.innerHTML=sessions.length?sessions.map(s=>`<button class="tutor-history-item" data-session="${s.id}"><strong>${escapeHtml(s.title||"Clase de Tutor IA")}</strong><span>${escapeHtml(s.subject_name||"Tema libre")} · ${formatDate(s.last_message_at||s.created_at)}</span></button>`).join(""):`<div class="empty">Aún no hay clases anteriores.</div>`;
    $$(".tutor-history-item",box).forEach(b=>b.onclick=()=>openTutorSession(b.dataset.session));
  }catch{box.innerHTML=`<div class="empty">No se pudo cargar el historial.</div>`}
}

async function openTutorSession(id){
  try{
    const d=await api(`/api/tutor-session?id=${encodeURIComponent(id)}`);
    state.chatConversation=d.conversation.id;
    state.tutorTranscript=[];
    $("#messages").innerHTML="";
    (d.messages||[]).forEach(m=>{
      if(!["user","assistant"].includes(m.role))return;
      const content=m.role==="user"?cleanTutorStoredUserMessage(m.content):m.content;
      appendMessage(m.role==="assistant"?"ai":"user",content);
      state.tutorTranscript.push({role:m.role,content});
    });
    if($("#tutor-class-title"))$("#tutor-class-title").value=d.conversation.title||"Clase Tutor IA";
    if(d.conversation.subject_id && [...$("#ai-subject").options].some(o=>o.value===d.conversation.subject_id))$("#ai-subject").value=d.conversation.subject_id;
    toast("Clase anterior abierta.");
  }catch(err){toast(err.message,true)}
}

function cleanTutorStoredUserMessage(text){
  return String(text||"").replace(/^Nivel del estudiante:[^\n]*\. Materia:[^\n]*\.\s*/,"").trim();
}

async function saveTutorClassToLibrary(){
  const transcript=state.tutorTranscript||[];
  if(!transcript.length)return toast("Primero estudia algo con Tutor IA.",true);
  const subjectId=$("#ai-subject")?.value||null;
  const subject=state.subjects.find(s=>s.id===subjectId)?.name||"Tema libre";
  const title=$("#tutor-class-title")?.value.trim()||`Tutor IA · ${subject} · ${new Date().toLocaleDateString("es-GT")}`;
  const body=transcript.map(m=>`${m.role==="user"?"PREGUNTA / APUNTE":"MED AI"}\n${m.content}`).join("\n\n--------------------------------\n\n");
  try{
    await api("/api/notes",{method:"POST",body:{title,body,subject_id:subjectId,tags:["tutor_ia","clase"],metadata:{conversation_id:state.chatConversation,source:"tutor"}}});
    toast("Clase guardada en Biblioteca.");
  }catch(err){toast(err.message,true)}
}

function downloadTutorWord(){
  const transcript=state.tutorTranscript||[];
  if(!transcript.length)return toast("Primero estudia algo con Tutor IA.",true);
  const subjectId=$("#ai-subject")?.value||null;
  const subject=state.subjects.find(s=>s.id===subjectId)?.name||"Tema libre";
  const title=$("#tutor-class-title")?.value.trim()||`Tutor IA · ${subject}`;
  const content=transcript.map(m=>m.role==="user"
    ?`<section class="question"><h3>Pregunta / apunte</h3><p>${escapeHtml(m.content).replace(/\n/g,"<br>")}</p></section>`
    :`<section class="answer"><h3>MED AI</h3>${renderRichResponse(m.content)}</section>`).join("");
  const doc=`<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title><style>body{font-family:Arial,sans-serif;color:#1d2935;line-height:1.55;margin:38px}h1{font-size:24px;border-bottom:2px solid #456f78;padding-bottom:10px}h2,h3,h4{color:#234d57}section{margin:20px 0}.question{background:#f2f5f7;padding:14px;border-left:4px solid #6d8790}.answer{padding:4px 0}.rich-response p{margin:8px 0}.rich-response li{margin:5px 0}blockquote{border-left:3px solid #5f8f89;padding-left:12px;color:#4b5f67}</style></head><body><h1>MED AI DALTON</h1><h2>${escapeHtml(title)}</h2><p><strong>Materia:</strong> ${escapeHtml(subject)}<br><strong>Fecha:</strong> ${escapeHtml(new Date().toLocaleString("es-GT"))}</p>${content}</body></html>`;
  const blob=new Blob(["\ufeff",doc],{type:"application/msword;charset=utf-8"});
  const url=URL.createObjectURL(blob),a=document.createElement("a");
  a.href=url;a.download=`${safeFilename(title)}.doc`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
  toast("Archivo Word generado.");
}

function safeFilename(value){return String(value||"clase-med-ai").replace(/[\\/:*?"<>|]+/g,"-").replace(/\s+/g," ").trim().slice(0,100)}
function firstWords(value,n=6){return String(value||"").trim().split(/\s+/).slice(0,n).join(" ")}

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

async function hardRefreshApplication(){
  try{
    if("caches" in window){
      const keys=await caches.keys();
      await Promise.all(keys.map(k=>caches.delete(k)));
    }
    if("serviceWorker" in navigator){
      const regs=await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map(r=>r.unregister()));
    }
  }catch{}
  const url=new URL(location.href);
  url.searchParams.set("v17",Date.now().toString());
  location.replace(url.toString());
}

function setupPWA(){
  if("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js?v=17.0.0",{updateViaCache:"none"}).catch(()=>{});
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
  const clean=String(text??"").replace(/\r/g,"").trim();
  if(!clean) return '<div class="rich-response"><p></p></div>';
  const lines=clean.split("\n");
  const blocks=[];
  let paragraph=[];
  let listItems=[];
  let listType="";
  let i=0;

  const flushParagraph=()=>{
    if(!paragraph.length)return;
    blocks.push(`<p>${formatInline(paragraph.join(" "))}</p>`);
    paragraph=[];
  };
  const flushList=()=>{
    if(!listItems.length)return;
    const tag=listType==="ol"?"ol":"ul";
    blocks.push(`<${tag}>${listItems.map(x=>`<li>${formatInline(x)}</li>`).join("")}</${tag}>`);
    listItems=[];listType="";
  };

  while(i<lines.length){
    const raw=lines[i];
    const line=raw.trim();
    const next=(lines[i+1]||"").trim();

    if(!line){flushParagraph();flushList();i++;continue;}

    // Markdown Setext headings: Title + ===== or -----
    if(next && /^={3,}$/.test(next)){
      flushParagraph();flushList();
      blocks.push(`<h2>${formatInline(line)}</h2>`);i+=2;continue;
    }
    if(next && /^-{3,}$/.test(next)){
      flushParagraph();flushList();
      blocks.push(`<h3>${formatInline(line)}</h3>`);i+=2;continue;
    }

    // ATX headings
    const heading=line.match(/^(#{1,4})\s+(.+)$/);
    if(heading){
      flushParagraph();flushList();
      const h=heading[1].length===1?2:Math.min(4,heading[1].length+1);
      blocks.push(`<h${h}>${formatInline(heading[2].replace(/\s+#+$/,""))}</h${h}>`);
      i++;continue;
    }

    // Horizontal rule
    if(/^(-{3,}|_{3,}|\*{3,})$/.test(line)){
      flushParagraph();flushList();blocks.push('<hr>');i++;continue;
    }

    // Bullets
    const bullet=line.match(/^[-*•]\s+(.+)$/);
    if(bullet){
      flushParagraph();
      if(listType&&listType!=="ul")flushList();
      listType="ul";listItems.push(bullet[1]);i++;continue;
    }

    // Numbered list
    const ordered=line.match(/^\d+[.)]\s+(.+)$/);
    if(ordered){
      flushParagraph();
      if(listType&&listType!=="ol")flushList();
      listType="ol";listItems.push(ordered[1]);i++;continue;
    }

    // Blockquote / important note
    const quote=line.match(/^>\s?(.+)$/);
    if(quote){
      flushParagraph();flushList();
      blocks.push(`<blockquote>${formatInline(quote[1])}</blockquote>`);i++;continue;
    }

    // Label-like subsection, e.g. "Puntos clave:"
    if(/^[A-ZÁÉÍÓÚÑ][A-Za-zÁÉÍÓÚÑáéíóúñ0-9 /()\-]{2,46}:$/.test(line)){
      flushParagraph();flushList();
      blocks.push(`<h4>${formatInline(line.slice(0,-1))}</h4>`);i++;continue;
    }

    paragraph.push(line);i++;
  }

  flushParagraph();flushList();
  return `<div class="ai-response-head"><span class="ai-response-mark">M+</span><span>MED AI</span></div><div class="rich-response">${blocks.join("")||`<p>${formatInline(clean)}</p>`}</div>`;
}

function formatInline(text){
  let s=escapeHtml(String(text??""));
  s=s.replace(/`([^`]+)`/g,'<code>$1</code>');
  s=s.replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>');
  s=s.replace(/__(.+?)__/g,'<strong>$1</strong>');
  s=s.replace(/~~(.+?)~~/g,'<del>$1</del>');
  s=s.replace(/\*([^*]+)\*/g,'<em>$1</em>');
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
