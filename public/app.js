const state = {
  user:null, subjects:[], currentView:"dashboard", deferredPrompt:null,
  currentSubject:null, currentTopic:null, chatConversation:null, exam:null,
  dueCards:[], cardIndex:0, showingBack:false, visionDataUrl:null
};

const $ = (s,el=document)=>el.querySelector(s);
const $$ = (s,el=document)=>[...el.querySelectorAll(s)];
const root = $("#view-root");

document.addEventListener("DOMContentLoaded", boot);

async function boot(){
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
  $$(".auth-tab").forEach(btn=>btn.addEventListener("click",()=>{
    $$(".auth-tab").forEach(x=>x.classList.remove("active"));btn.classList.add("active");
    const register=btn.dataset.authTab==="register";
    $("#login-form").classList.toggle("hidden",register);
    $("#register-form").classList.toggle("hidden",!register);
    $("#auth-message").textContent="";
  }));

  $("#login-form").addEventListener("submit",async e=>{
    e.preventDefault(); setAuthMessage("Entrando...",false);
    try{
      await api("/api/auth/login",{method:"POST",body:{
        email:$("#login-email").value,password:$("#login-password").value
      }});
      const me=await api("/api/me");state.user=me.user;showApp();await loadSubjects();navigate("dashboard");
    }catch(err){setAuthMessage(err.message,true)}
  });

  $("#register-form").addEventListener("submit",async e=>{
    e.preventDefault();setAuthMessage("Creando tu perfil médico...",false);
    try{
      await api("/api/auth/register",{method:"POST",body:{
        fullName:$("#register-name").value,email:$("#register-email").value,password:$("#register-password").value
      }});
      const me=await api("/api/me");state.user=me.user;showApp();await loadSubjects();navigate("dashboard");
    }catch(err){setAuthMessage(err.message,true)}
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
      exams:renderExams,flashcards:renderFlashcards,patient:()=>renderAIStudio("patient"),
      grand_rounds:()=>renderAIStudio("grand_rounds"),emergency:()=>renderAIStudio("emergency"),
      ecg:()=>renderVisionStudio("ecg"),radiology:()=>renderVisionStudio("radiology"),
      laboratory:()=>renderAIStudio("laboratory"),pharmacology:()=>renderAIStudio("pharmacology"),
      osce:()=>renderAIStudio("osce"),library:renderLibrary,mistakes:renderMistakes,
      plan:renderPlan,stats:renderStats,profile:renderProfile
    };
    await (renderers[view]||renderDashboard)();
  }catch(err){root.innerHTML=`<div class="card"><h3>No se pudo cargar</h3><p>${escapeHtml(err.message)}</p></div>`}
}

async function renderDashboard(){
  const d=await api("/api/dashboard");
  const hours=(Number(d.metrics?.study_seconds||0)/3600).toFixed(1);
  const name=d.profile?.full_name||state.user?.email?.split("@")[0]||"Doctor";
  root.innerHTML=`
    <div class="page-head"><div><div class="eyebrow">TU CENTRO DE ENTRENAMIENTO</div><h2>Buenos días, ${escapeHtml(firstName(name))}</h2><p>Continúa construyendo criterio clínico todos los días.</p></div></div>
    <div class="card resume-card">
      <div class="grow">
        <div class="eyebrow">CONTINUAR DONDE LO DEJASTE</div>
        <h3>${escapeHtml(d.resume?.topic_name||d.resume?.subject_name||"Elige tu próximo tema")}</h3>
        <p style="color:var(--muted);margin:4px 0 12px">${escapeHtml(d.resume?.lesson_title||"Tu progreso se sincroniza entre todos tus dispositivos.")}</p>
        <div class="progress"><i style="width:${Number(d.resume?.progress_percent||0)}%"></i></div>
      </div>
      <button id="continue-btn" class="primary-btn">Continuar estudiando</button>
    </div>
    <div class="grid stats4" style="margin-top:16px">
      ${metric("Precisión general",`${d.accuracy}%`,"Preguntas respondidas: "+d.questionsAnswered)}
      ${metric("Flashcards hoy",d.dueFlashcards,"Pendientes de repaso")}
      ${metric("Tiempo estudiado",`${hours} h`,"Acumulado")}
      ${metric("Nivel médico",d.profile?.current_medical_level||1,`${d.profile?.total_xp||0} XP`)}
    </div>
    <h3 class="section-title">Entrenamiento recomendado</h3>
    <div class="grid three">
      ${modeCard("Tutor IA","Explicaciones adaptativas y modo socrático.","tutor","✦")}
      ${modeCard("Paciente virtual","Anamnesis, examen, pruebas y plan.","patient","♙")}
      ${modeCard("Grand Rounds","Casos complejos de Medicina Interna.","grand_rounds","◆")}
      ${modeCard("Examen IA","Banco dinámico y retroalimentación.","exams","✓")}
      ${modeCard("Repaso inteligente","Repetición espaciada de lo que olvidas.","flashcards","▱")}
      ${modeCard("Emergencias","Decisiones clínicas bajo presión.","emergency","⚡")}
    </div>
    <div class="grid two" style="margin-top:16px">
      <div class="card"><h3>Actividad reciente</h3>${listRecent(d.recentTopics)}</div>
      <div class="card"><h3>Próximas fechas</h3>${listDeadlinesCompact(d.deadlines)}</div>
    </div>`;
  $("#continue-btn").onclick=()=>navigate(d.resume?.mode||"study");
  $$(".mode-card").forEach(c=>c.onclick=()=>navigate(c.dataset.view));
}

async function renderStudy(){
  root.innerHTML=`
    <div class="page-head"><div><div class="eyebrow">CURRÍCULO MÉDICO</div><h2>Estudiar</h2><p>Desde ciencias básicas hasta entrenamiento de Medicina Interna.</p></div></div>
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
    <h3 class="section-title">${escapeHtml(s.name)} — temas</h3>
    ${data.topics.length?`<div class="topic-grid">${data.topics.map(t=>`<button class="topic-btn" data-id="${t.id}"><strong>${escapeHtml(t.name)}</strong><span>${escapeHtml(t.description||"Abrir entrenamiento")}</span></button>`).join("")}</div>`:
    `<div class="card empty">Esta materia ya forma parte del currículo. Puedes estudiarla ahora con el Tutor IA aunque sus subtemas específicos todavía no estén precargados.</div>`}
    <div style="margin-top:14px"><button id="study-subject-ai" class="primary-btn">Estudiar ${escapeHtml(s.name)} con IA</button></div>`;
  $$(".topic-btn",section).forEach(btn=>btn.onclick=()=>{
    state.currentTopic=data.topics.find(x=>x.id===btn.dataset.id);
    saveResume({route:"/study",subject_id:s.id,topic_id:state.currentTopic.id,mode:"tutor",progress_percent:0,context:{subject:s.name,topic:state.currentTopic.name}});
    navigate("tutor");
  });
  $("#study-subject-ai").onclick=()=>{state.currentTopic=null;navigate("tutor")};
  section.scrollIntoView({behavior:"smooth"});
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
          <div class="field"><label>Materia</label><select id="ai-subject">${subjectOptions()}</select></div>
          <div class="field"><label>Nivel</label><select id="ai-level">
            <option>Primeros años</option><option>Ciencias básicas</option><option>Clínico</option>
            <option>Internado</option><option>Médico general</option><option>R1</option><option>R2</option><option>R3</option><option>Internista</option>
          </select></div>
          <button id="new-chat" class="ghost-btn wide">Nueva sesión</button>
        </div>
        <div class="notice">Entrenamiento educativo. En pacientes reales, verifica recomendaciones con fuentes clínicas actuales y supervisión profesional.</div>
      </div>
    </div>`;
  if(state.currentSubject) $("#ai-subject").value=state.currentSubject.id;
  $("#send-chat").onclick=()=>sendChat(mode);
  $("#chat-input").addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendChat(mode)}});
  $("#new-chat").onclick=()=>{state.chatConversation=null;$("#messages").innerHTML=`<div class="message ai">${escapeHtml(cfg.welcome)}</div>`};
  $("#mic-btn").onclick=()=>startSpeechRecognition($("#chat-input"));
}

async function sendChat(mode){
  const input=$("#chat-input"),message=input.value.trim();if(!message)return;
  appendMessage("user",message);input.value="";
  const subjectId=$("#ai-subject")?.value||state.currentSubject?.id||null;
  const subject=state.subjects.find(s=>s.id===subjectId)?.name||"Medicina";
  const level=$("#ai-level")?.value||"Clínico";
  const thinking=appendMessage("ai","Analizando...");
  $("#send-chat").disabled=true;
  try{
    const d=await api("/api/ai/chat",{method:"POST",body:{
      mode,message:`Nivel del estudiante: ${level}. Materia: ${subject}.\n\n${message}`,
      conversation_id:state.chatConversation,subject_id:subjectId,topic_id:state.currentTopic?.id||null,
      title:`${modeConfig(mode).title} — ${subject}`
    }});
    state.chatConversation=d.conversation_id;thinking.textContent=d.answer;
    await saveResume({route:`/${mode}`,subject_id:subjectId,topic_id:state.currentTopic?.id||null,mode,progress_percent:0,context:{subject,level}});
  }catch(err){thinking.textContent=`Error: ${err.message}`}
  finally{$("#send-chat").disabled=false;input.focus()}
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
      <div class="card"><h3>Retroalimentación</h3><div id="vision-answer" class="message ai" style="max-width:100%">${escapeHtml(cfg.welcome)}</div></div>
    </div>`;
  $("#vision-file").onchange=async e=>{
    const file=e.target.files[0];if(!file)return;
    state.visionDataUrl=await resizeImage(file,1600,.82);
    $("#vision-preview").src=state.visionDataUrl;$("#vision-preview").classList.remove("hidden");
  };
  $("#vision-send").onclick=async()=>{
    if(!state.visionDataUrl)return toast("Primero selecciona una imagen.",true);
    const btn=$("#vision-send");btn.disabled=true;$("#vision-answer").textContent="Analizando...";
    try{
      const d=await api("/api/ai/vision",{method:"POST",body:{mode,image_data_url:state.visionDataUrl,prompt:$("#vision-prompt").value||cfg.placeholder}});
      $("#vision-answer").textContent=d.answer;
    }catch(err){$("#vision-answer").textContent=`Error: ${err.message}`}finally{btn.disabled=false}
  };
}

async function renderExams(){
  root.innerHTML=`
    <div class="page-head"><div><div class="eyebrow">EVALUACIÓN ADAPTATIVA</div><h2>Exámenes IA</h2><p>Genera preguntas nuevas y recibe explicación de cada error.</p></div></div>
    <div class="grid two">
      <div class="card">
        <div class="field"><label>Materia</label><select id="exam-subject">${subjectOptions()}</select></div>
        <div class="field"><label>Tema específico</label><input id="exam-topic" placeholder="Ej. insuficiencia cardíaca, ácido-base..."></div>
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
  const btn=$("#generate-exam");btn.disabled=true;$("#exam-area").innerHTML=`<div class="card empty">Generando examen médico...</div>`;
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
    <div class="page-head"><div><div class="eyebrow">REPETICIÓN ESPACIADA</div><h2>Flashcards</h2><p>Refuerza exactamente lo que estás a punto de olvidar.</p></div><button id="generate-cards" class="primary-btn">Generar con IA</button></div>
    <div id="flash-area"></div>
    <div class="card" id="card-generator" style="margin-top:16px">
      <div class="grid two">
        <div class="field"><label>Tema</label><input id="card-topic" placeholder="Ej. glomerulopatías"></div>
        <div class="field"><label>Cantidad</label><select id="card-count"><option>5</option><option selected>10</option><option>15</option><option>20</option></select></div>
      </div>
    </div>`;
  $("#generate-cards").onclick=generateCardsAI;
  renderCurrentCard();
}
function renderCurrentCard(){
  const area=$("#flash-area");if(!area)return;
  if(!state.dueCards.length){area.innerHTML=`<div class="card empty">No tienes tarjetas pendientes. Genera nuevas flashcards con IA o vuelve más tarde.</div>`;return}
  const c=state.dueCards[state.cardIndex%state.dueCards.length];
  area.innerHTML=`<div class="card flashcard-stage"><div>
    <div class="flashcard" id="flip-card">${state.showingBack?`<div class="back">${escapeHtml(c.back)}</div>`:`<div><div class="eyebrow">FRENTE</div><h2>${escapeHtml(c.front)}</h2><p style="color:var(--muted)">Toca para mostrar respuesta</p></div>`}</div>
    ${state.showingBack?`<div class="grade-row" style="margin-top:14px">${[["0","Otra vez"],["2","Difícil"],["4","Bien"],["5","Fácil"]].map(([g,t])=>`<button class="grade-btn" data-grade="${g}">${t}</button>`).join("")}</div>`:""}
  </div></div>`;
  $("#flip-card").onclick=()=>{state.showingBack=true;renderCurrentCard()};
  $$(".grade-btn").forEach(b=>b.onclick=async e=>{
    e.stopPropagation();await api("/api/flashcards/review",{method:"POST",body:{flashcard_id:c.id,grade:Number(b.dataset.grade)}}).catch(()=>{});
    state.dueCards.splice(state.cardIndex%state.dueCards.length,1);state.cardIndex=0;state.showingBack=false;renderCurrentCard();
  });
}
async function generateCardsAI(){
  const topic=$("#card-topic").value.trim();if(!topic)return toast("Escribe un tema.",true);
  const btn=$("#generate-cards");btn.disabled=true;
  try{
    const d=await api("/api/ai/flashcards",{method:"POST",body:{topic,count:Number($("#card-count").value)}});
    for(const c of d.cards){
      await api("/api/flashcards",{method:"POST",body:{front:c.front,back:c.back,hint:c.hint,source_type:"ai"}});
    }
    toast(`${d.cards.length} flashcards creadas.`);await renderFlashcards();
  }catch(err){toast(err.message,true)}finally{btn.disabled=false}
}

async function renderLibrary(){
  const notes=await api("/api/notes");
  root.innerHTML=`
    <div class="page-head"><div><div class="eyebrow">BIBLIOTECA PERSONAL</div><h2>Apuntes y documentos</h2><p>Tus notas quedan sincronizadas con tu perfil.</p></div></div>
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
  root.innerHTML=`<div class="page-head"><div><div class="eyebrow">PLANIFICADOR</div><h2>Plan de estudio</h2><p>Registra parciales, finales y objetivos para priorizar tus sesiones.</p></div></div>
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
  root.innerHTML=`<div class="page-head"><div><div class="eyebrow">ANALÍTICA DE APRENDIZAJE</div><h2>Estadísticas</h2><p>Tu progreso medido en actividad y dominio.</p></div></div>
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
  root.innerHTML=`<div class="page-head"><div><div class="eyebrow">PERFIL MÉDICO</div><h2>Mi perfil</h2><p>Esta identidad acompaña tu progreso en todos tus dispositivos.</p></div></div>
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
    patient:{kicker:"SIMULACIÓN CLÍNICA",title:"Paciente virtual",subtitle:"Entrena la consulta desde cero.",welcome:"Solicita un caso o dime el sistema que quieres practicar. Yo actuaré como paciente y solo revelaré lo que preguntes.",placeholder:"Inicia un paciente con dolor torácico, dificultad intermedia."},
    grand_rounds:{kicker:"MEDICINA INTERNA AVANZADA",title:"Grand Rounds",subtitle:"Casos complejos con múltiples problemas.",welcome:"Te presentaré un caso de alta complejidad. Organiza problemas, diferenciales, estudios y tratamiento.",placeholder:"Dame un Grand Round de nefrología nivel R2."},
    emergency:{kicker:"SIMULACIÓN DE URGENCIAS",title:"Emergencias",subtitle:"Prioriza y decide bajo presión.",welcome:"Elige una emergencia o pide una aleatoria. Evalúo prioridades y decisiones críticas.",placeholder:"Simula un paciente con shock sin decirme la causa."},
    laboratory:{kicker:"INTERPRETACIÓN",title:"Laboratorios",subtitle:"Integra patrones, fisiopatología y decisiones.",welcome:"Puedo darte paneles de laboratorio para que los interpretes o analizar resultados educativos que escribas.",placeholder:"Dame una gasometría difícil y no me digas el diagnóstico."},
    pharmacology:{kicker:"FARMACOLOGÍA CLÍNICA",title:"Farmacología",subtitle:"Mecanismos, indicaciones, seguridad y razonamiento.",welcome:"Dime un fármaco, una familia o un escenario clínico.",placeholder:"Pregúntame sobre IECA y corrige mis errores."},
    osce:{kicker:"ESTACIONES CLÍNICAS",title:"OSCE",subtitle:"Historia, comunicación, examen y cierre.",welcome:"Puedo actuar como paciente estandarizado y examinador.",placeholder:"Inicia una estación OSCE de disnea de 8 minutos."},
    ecg:{kicker:"ELECTROCARDIOGRAFÍA",title:"ECG",subtitle:"Interpretación sistemática y correlación clínica.",welcome:"Sube un ECG educativo y primero intenta interpretarlo. Luego te daré retroalimentación.",placeholder:"Esta es mi interpretación: ritmo..., frecuencia..., eje... ¿qué me falta?"},
    radiology:{kicker:"IMAGENOLOGÍA",title:"Radiología",subtitle:"Describe antes de diagnosticar.",welcome:"Sube una imagen educativa y escribe tu interpretación. Te guiaré sistemáticamente.",placeholder:"Describe hallazgos, diagnóstico probable y diferenciales."}
  }[mode]||{kicker:"MED AI",title:"Entrenamiento",subtitle:"",welcome:"Empecemos.",placeholder:"Escribe aquí..."};
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
  if("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(()=>{});
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

function metric(label,value,sub){return `<div class="card"><div class="metric-label">${escapeHtml(label)}</div><div class="metric-value">${escapeHtml(String(value))}</div><div class="metric-sub">${escapeHtml(sub)}</div></div>`}
function modeCard(title,p,view,icon){return `<div class="card mode-card" data-view="${view}"><div style="font-size:24px">${icon}</div><h3>${escapeHtml(title)}</h3><p>${escapeHtml(p)}</p></div>`}
function subjectCard(s){return `<div class="card subject-card" data-id="${s.id}"><div class="category">${escapeHtml(s.category||"Medicina")}</div><h3>${escapeHtml(s.name)}</h3><p>${escapeHtml(s.description||"Abrir materia y comenzar entrenamiento.")}</p></div>`}
function subjectOptions(includeBlank=false){return `${includeBlank?'<option value="">Sin especificar</option>':""}${state.subjects.map(s=>`<option value="${s.id}">${escapeHtml(s.name)}</option>`).join("")}`}
function listRecent(items){return items?.length?`<div class="list">${items.map(x=>`<div class="list-item"><div class="grow"><strong>${escapeHtml(x.topic_name)}</strong><span>${escapeHtml(x.subject_name)}</span></div><span class="badge">${Math.round(x.mastery||0)}%</span></div>`).join("")}</div>`:`<div class="empty">Tu actividad aparecerá aquí.</div>`}
function listDeadlinesCompact(items){return items?.length?`<div class="list">${items.map(x=>`<div class="list-item"><div class="grow"><strong>${escapeHtml(x.title)}</strong><span>${formatDate(x.due_at)}</span></div><span class="badge">P${x.importance}</span></div>`).join("")}</div>`:`<div class="empty">No hay fechas pendientes.</div>`}
function noteItem(n){return `<div class="list-item"><div class="grow"><strong>${escapeHtml(n.title)}</strong><span>${formatDate(n.updated_at)}</span><p style="white-space:pre-wrap">${escapeHtml((n.body||"").slice(0,260))}</p></div><button class="danger-btn delete-note" data-id="${n.id}">Eliminar</button></div>`}
function profileField(label,id,value){return `<div class="field"><label>${escapeHtml(label)}</label><input id="${id}" value="${escapeAttr(value)}"></div>`}
function appendMessage(role,text){const m=document.createElement("div");m.className=`message ${role}`;m.textContent=text;$("#messages").appendChild(m);$("#messages").scrollTop=$("#messages").scrollHeight;return m}
function toast(text,error=false){const t=document.createElement("div");t.className=`toast ${error?"error":""}`;t.textContent=text;$("#toast-root").appendChild(t);setTimeout(()=>t.remove(),3300)}
function firstName(n){return String(n||"").trim().split(/\s+/)[0]}
function formatDate(v){if(!v)return"Sin fecha";const d=new Date(v);return isNaN(d)?String(v):d.toLocaleString("es-GT",{dateStyle:"medium",timeStyle:"short"})}
function escapeHtml(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function escapeAttr(s){return escapeHtml(s).replace(/`/g,"&#96;")}
function debounce(fn,ms){let t;return(...a)=>{clearTimeout(t);t=setTimeout(()=>fn(...a),ms)}}

function startSpeechRecognition(target){
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR)return toast("El reconocimiento de voz no está disponible en este navegador.",true);
  const r=new SR();r.lang="es-GT";r.interimResults=false;r.maxAlternatives=1;
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
