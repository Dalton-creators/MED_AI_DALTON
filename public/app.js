const APP_VERSION="29.0.0";

const state = {
  user:null, subjects:[], currentView:"dashboard", deferredPrompt:null,
  currentSubject:null, currentTopic:null, chatConversation:null, exam:null,
  dueCards:[], cardIndex:0, showingBack:false, visionDataUrl:null,
  patientConversation:null, patientActive:false, caseSolverConversation:null,
  scienceConversation:null, languageConversation:null, lastLanguageAnswer:"",
  currentCourse:null,currentLesson:null,courseConversation:null,courseLanguage:(()=>{const v=localStorage.getItem("medai_course_language")||"en-US";return ["he-IL","la","en-US","ru-RU","fr-FR"].includes(v)?v:"en-US"})(),
  tutorTranscript:[],tutorSessionTitle:"",courseExam:null,
  languageCourse:null,languageStats:null,languageGame:null,languageLessonSession:null,
  courseLearningPack:null,coursePractice:null,coursePhase:"lesson",
  universitySources:[],universitySourcePack:null,universitySourceRecord:null,
  universityPractice:null,universityExam:null,universityChatConversation:null,
  libraryFolderId:null,libraryData:null,libraryView:"files",
  libraryStudyFile:null,libraryStudyPacks:[],libraryStudyPdf:null,
  libraryStudyDoc:null,libraryStudyRange:null,
  offlineDb:null,offlineReady:false,
  smartDashboard:null,smartReview:null,
  historicalKeysPack:null,historicalKeysSource:null,historicalKeysDraft:[],historicalKeysQuiz:null,
  systemHealth:null,systemIntegrity:null,systemBackups:[],maintenanceMode:false,lastSyncReport:null,
  questionBank:[],adaptiveExam:null,examPrepPlan:null,mediaStudyPack:null,mediaPractice:null,progressOverview:null,
  smartSearchResults:[],smartQuality:localStorage.getItem("medai_smart_quality")||"economy"
};

const $ = (s,el=document)=>el.querySelector(s);
const $$ = (s,el=document)=>[...el.querySelectorAll(s)];
const root = $("#view-root");


/* ============================================================
   V24 · OFFLINE STUDY VAULT
   JSON study data + selected R2 files stored locally in IndexedDB
   ============================================================ */

const OFFLINE_DB_NAME="medai_offline_v24";
const OFFLINE_DB_VERSION=1;

function openOfflineDB(){
  if(state.offlineDb)return Promise.resolve(state.offlineDb);
  if(!("indexedDB" in window))return Promise.reject(new Error("Este navegador no admite almacenamiento offline avanzado."));
  return new Promise((resolve,reject)=>{
    const req=indexedDB.open(OFFLINE_DB_NAME,OFFLINE_DB_VERSION);
    req.onupgradeneeded=()=>{
      const db=req.result;
      if(!db.objectStoreNames.contains("json"))db.createObjectStore("json",{keyPath:"key"});
      if(!db.objectStoreNames.contains("files"))db.createObjectStore("files",{keyPath:"id"});
    };
    req.onsuccess=()=>{state.offlineDb=req.result;state.offlineReady=true;resolve(req.result)};
    req.onerror=()=>reject(req.error||new Error("No pude abrir el almacenamiento offline."));
  });
}

async function offlineStorePut(store,record){
  const db=await openOfflineDB();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(store,"readwrite");
    tx.objectStore(store).put(record);
    tx.oncomplete=()=>resolve(true);
    tx.onerror=()=>reject(tx.error);
  });
}
async function offlineStoreGet(store,key){
  const db=await openOfflineDB();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(store,"readonly"),req=tx.objectStore(store).get(key);
    req.onsuccess=()=>resolve(req.result||null);
    req.onerror=()=>reject(req.error);
  });
}
async function offlineStoreDelete(store,key){
  const db=await openOfflineDB();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(store,"readwrite");
    tx.objectStore(store).delete(key);
    tx.oncomplete=()=>resolve(true);
    tx.onerror=()=>reject(tx.error);
  });
}
async function offlineStoreAll(store){
  const db=await openOfflineDB();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(store,"readonly"),req=tx.objectStore(store).getAll();
    req.onsuccess=()=>resolve(req.result||[]);
    req.onerror=()=>reject(req.error);
  });
}

function offlineApiKey(url){return `api:${url}`}
async function offlinePutJson(key,value){
  try{await offlineStorePut("json",{key,value,updated_at:new Date().toISOString()})}catch{}
}
async function offlineGetJson(key){
  try{return (await offlineStoreGet("json",key))?.value??null}catch{return null}
}
async function offlineAllJson(){
  try{return await offlineStoreAll("json")}catch{return []}
}

async function offlineGetFileRecord(id){
  try{return await offlineStoreGet("files",id)}catch{return null}
}
async function offlineHasFile(id){return !!(await offlineGetFileRecord(id))}
async function offlineRemoveFile(id){
  try{return await offlineStoreDelete("files",id)}catch{}
}
async function offlineAllFiles(){
  try{return await offlineStoreAll("files")}catch{return []}
}

async function cacheLibraryFileOffline(file){
  if(!navigator.onLine)throw new Error("Conéctate a internet una vez para guardar este archivo en el dispositivo.");
  if(navigator.storage?.persist)navigator.storage.persist().catch(()=>{});
  const meta=getLibraryMeta(file);
  const res=await fetch(libraryFileUrl(file.id,true),{credentials:"same-origin"});
  if(!res.ok)throw new Error("No pude descargar el archivo para uso offline.");
  const blob=await res.blob();
  await offlineStorePut("files",{
    id:file.id,
    blob,
    name:meta.original_name||file.title,
    title:file.title,
    mime:meta.mime_type||blob.type||"application/octet-stream",
    size:blob.size,
    updated_at:new Date().toISOString()
  });
  return true;
}

function courseOfflinePackKey(item=state.currentLesson,s=state.currentSubject){
  return `coursepack:${s?.id||""}:${item?.topic_id||""}:${item?.lesson_id||""}:${s?.code==="LANG"?state.courseLanguage:""}`;
}
function courseOfflineExamKey(item=state.currentLesson,s=state.currentSubject){
  return `courseexam:${s?.id||""}:${item?.lesson_id||""}:${s?.code==="LANG"?state.courseLanguage:""}`;
}
function languageOfflinePackKey(language,topic,level){
  return `languagepack:${language}:${topic}:${level}`;
}

async function offlineVaultSummary(){
  const [files,jsonRows]=await Promise.all([offlineAllFiles(),offlineAllJson()]);
  return {
    files,
    coursePacks:jsonRows.filter(x=>x.key.startsWith("coursepack:")),
    exams:jsonRows.filter(x=>x.key.startsWith("courseexam:")),
    languagePacks:jsonRows.filter(x=>x.key.startsWith("languagepack:")),
    preparedBundles:jsonRows.filter(x=>x.key.startsWith("offlinebundle:")),
    apiRows:jsonRows.filter(x=>x.key.startsWith("api:"))
  };
}


/* ============================================================
   V26 · STABILITY & RELIABILITY ENGINE
   Diagnostics · backups · sync visibility · version protection
   ============================================================ */

const SYSTEM_ERROR_KEY="medai_v26_errors";
const SYSTEM_BACKUP_DAY_KEY="medai_v26_last_auto_backup";

function getOfflineQueue(){
  try{
    const q=JSON.parse(localStorage.getItem("medai_queue")||"[]");
    return Array.isArray(q)?q:[];
  }catch{return []}
}
function getSystemErrors(){
  try{
    const rows=JSON.parse(localStorage.getItem(SYSTEM_ERROR_KEY)||"[]");
    return Array.isArray(rows)?rows:[];
  }catch{return []}
}
function logSystemError(context,err,meta={}){
  try{
    const rows=getSystemErrors();
    rows.unshift({
      id:crypto.randomUUID(),
      at:new Date().toISOString(),
      context:String(context||"unknown").slice(0,180),
      message:String(err?.message||err||"Error desconocido").slice(0,1200),
      status:Number(err?.status||meta.status||0)||null,
      url:String(meta.url||"").slice(0,500),
      method:String(meta.method||"").slice(0,20),
      online:navigator.onLine,
      view:state.currentView,
      version:APP_VERSION
    });
    localStorage.setItem(SYSTEM_ERROR_KEY,JSON.stringify(rows.slice(0,60)));
  }catch{}
}
function clearSystemErrors(){
  localStorage.removeItem(SYSTEM_ERROR_KEY);
}
function setupSystemErrorCapture(){
  window.addEventListener("error",e=>logSystemError("window.error",e.error||e.message,{url:e.filename||""}));
  window.addEventListener("unhandledrejection",e=>logSystemError("unhandledrejection",e.reason||"Promesa rechazada"));
}
function ensureSystemBanner(){
  let el=$("#system-status-banner");
  if(el)return el;
  el=document.createElement("div");
  el.id="system-status-banner";
  el.className="system-status-banner hidden";
  const shell=$("#app-shell");
  if(shell)shell.appendChild(el);
  return el;
}
function updateMaintenanceBanner(message=""){
  const el=ensureSystemBanner();if(!el)return;
  if(state.maintenanceMode||!navigator.onLine){
    el.classList.remove("hidden");
    el.classList.toggle("offline",!navigator.onLine);
    el.innerHTML=`<span>${navigator.onLine?"⚠":"●"}</span><strong>${navigator.onLine?"MODO DE CONTINGENCIA":"MODO OFFLINE"}</strong><small>${escapeHtml(message||(navigator.onLine?"Algunos servicios remotos no respondieron. MED AI usará datos guardados cuando sea posible.":"Tus clases y materiales preparados siguen disponibles. La IA se reanudará cuando vuelva internet."))}</small><button id="system-banner-open">VER ESTADO</button>`;
    $("#system-banner-open")?.addEventListener("click",()=>navigate("system"));
  }else{
    el.classList.add("hidden");
    el.innerHTML="";
  }
}
function showVersionBanner(serverVersion){
  if(!serverVersion||serverVersion===APP_VERSION)return;
  const el=ensureSystemBanner();if(!el)return;
  el.classList.remove("hidden","offline");
  el.innerHTML=`<span>↻</span><strong>ACTUALIZACIÓN DISPONIBLE</strong><small>Aplicación instalada ${escapeHtml(APP_VERSION)} · servidor ${escapeHtml(serverVersion)}. Actualiza para evitar usar archivos antiguos de caché.</small><button id="system-version-update">ACTUALIZAR AHORA</button>`;
  $("#system-version-update")?.addEventListener("click",hardRefreshApplication);
}

async function checkSystemVersionInBackground(){
  if(!navigator.onLine)return;
  try{
    const res=await fetch("/api/system/health",{credentials:"include",cache:"no-store"});
    if(!res.ok)return;
    const d=await res.json();
    state.systemHealth=d;
    if(d.server_version!==APP_VERSION)showVersionBanner(d.server_version);
  }catch{}
}
async function ensureDailySystemBackup(){
  if(!navigator.onLine)return;
  const today=new Date().toISOString().slice(0,10);
  if(localStorage.getItem(SYSTEM_BACKUP_DAY_KEY)===today)return;
  try{
    const d=await api("/api/system/backup",{method:"POST",body:{reason:"auto_daily"}});
    if(d.ok)localStorage.setItem(SYSTEM_BACKUP_DAY_KEY,today);
  }catch(err){
    logSystemError("automatic_backup",err,{url:"/api/system/backup",method:"POST"});
  }
}
async function systemStorageEstimate(){
  try{
    const est=await navigator.storage?.estimate?.();
    return {usage:Number(est?.usage||0),quota:Number(est?.quota||0),persisted:await navigator.storage?.persisted?.()};
  }catch{return {usage:0,quota:0,persisted:false}}
}
function systemStatusCard(label,status,detail,icon="✓"){
  const ok=status===true,warning=status==="warning";
  return `<article class="system-health-card ${ok?"ok":warning?"warning":"bad"}"><span>${escapeHtml(icon)}</span><div><strong>${escapeHtml(label)}</strong><small>${escapeHtml(detail||"")}</small></div><b>${ok?"LISTO":warning?"ATENCIÓN":"REVISAR"}</b></article>`;
}
function formatSystemDate(v){
  if(!v)return "Nunca";
  try{return new Date(v).toLocaleString("es-GT")}catch{return String(v)}
}

async function renderSystemCenter(){
  root.innerHTML=`<div class="system-center-loading"><div class="v17-loading-orb"><i></i><i></i><i></i></div><strong>Revisando MED AI…</strong><small>El diagnóstico no utiliza Gemini.</small></div>`;
  const storage=await systemStorageEstimate();
  let health=null,backups=[];
  if(navigator.onLine){
    try{health=await api("/api/system/health?fresh=1");state.systemHealth=health}catch(err){logSystemError("system_health",err);health=null}
    try{const d=await api("/api/system/backups");backups=d.backups||[];state.systemBackups=backups}catch{}
  }else{
    health=state.systemHealth||await offlineGetJson(offlineApiKey("/api/system/health?fresh=1"));
    backups=state.systemBackups||[];
  }
  const queue=getOfflineQueue(),errors=getSystemErrors();
  const swReady=!!navigator.serviceWorker?.controller;
  const localDb=("indexedDB" in window);
  const appMatch=!health?.server_version||health.server_version===APP_VERSION;
  root.innerHTML=`
    <section class="system-center-hero">
      <div>
        <div class="learning-home-chip"><span></span> STABILITY & RELIABILITY CENTER · V29 FINAL</div>
        <h1>MED AI sabe cuándo algo no está bien.</h1>
        <p>Diagnóstico, copias de seguridad, sincronización y recuperación en un solo lugar. Estas comprobaciones están diseñadas para proteger tu estudio sin gastar créditos de IA.</p>
        <div class="system-center-actions"><button id="system-run-diagnostic" class="primary-btn">◉ REVISAR MED AI</button><button id="system-deep-test" class="secondary-btn">✓ PRUEBA PROFUNDA</button><button id="system-sync-now" class="secondary-btn">↻ SINCRONIZAR AHORA</button><button id="system-hard-update" class="secondary-btn">↑ REVISAR ACTUALIZACIÓN</button><button id="system-export-all" class="secondary-btn">⇩ EXPORTAR MI MED AI</button></div>
      </div>
      <div class="system-version-panel ${appMatch?"ok":"warn"}"><span>VERSIÓN</span><strong>${escapeHtml(APP_VERSION)}</strong><small>${health?.server_version?`Servidor ${escapeHtml(health.server_version)}`:"Sin comprobar servidor"}</small><i>${appMatch?"✓":"!"}</i></div>
    </section>

    <section class="system-health-grid">
      ${systemStatusCard("Base de datos D1",health?.db===true,health?.db_detail||(!navigator.onLine?"Sin conexión · datos locales activos":"Sin comprobar"),"DB")}
      ${systemStatusCard("Biblioteca R2",health?.r2===true,health?.r2_detail||(!navigator.onLine?"No requiere R2 para abrir copias offline":"Sin comprobar"),"R2")}
      ${systemStatusCard("Binding de IA",health?.ai===true,health?.ai===true?"Configurado · no se hizo inferencia para probarlo":"Sin comprobar","AI")}
      ${systemStatusCard("Assets / PWA",health?.assets===true&&swReady,swReady?"Service Worker activo":"Service Worker todavía no controla esta pestaña","PWA")}
      ${systemStatusCard("Offline Vault",localDb,"IndexedDB disponible en este dispositivo","↓")}
      ${systemStatusCard("Sincronización",queue.length? "warning":true,queue.length?`${queue.length} cambio(s) pendiente(s)`:"Sin cambios pendientes","↻")}
    </section>

    <section class="system-main-grid">
      <article class="card system-backup-card">
        <div class="system-section-head"><div><span>BACKUP AUTOMÁTICO</span><h2>Puntos de recuperación</h2></div><button id="system-create-backup" class="primary-btn">＋ CREAR BACKUP</button></div>
        <p class="system-help">MED AI crea como máximo un backup automático al día cuando abres la aplicación con internet. Guarda tu progreso, notas, errores, exámenes y metadatos en R2 privado. Los libros grandes permanecen en tu Biblioteca R2 y no se duplican.</p>
        <div id="system-backup-list" class="system-backup-list">
          ${backups.length?backups.slice(0,10).map((b,i)=>`<article><span>${i===0?"ÚLTIMO":"BACKUP"}</span><div><strong>${formatSystemDate(b.created_at)}</strong><small>${escapeHtml(b.reason||"manual")} · ${formatBytes(Number(b.size||0))}</small></div><button class="system-download-backup" data-key="${escapeAttr(b.key)}">DESCARGAR</button><button class="system-restore-backup" data-key="${escapeAttr(b.key)}" data-date="${escapeAttr(b.created_at||"")}">RESTAURAR</button></article>`).join(""):`<div class="system-empty">No hay backups visibles todavía. Pulsa CREAR BACKUP.</div>`}
        </div>
      </article>

      <article class="card system-sync-card">
        <div class="system-section-head"><div><span>COLA OFFLINE</span><h2>Sincronización</h2></div><b>${queue.length}</b></div>
        <div class="system-sync-state ${navigator.onLine?"online":"offline"}"><i></i><div><strong>${navigator.onLine?"Internet disponible":"Sin conexión"}</strong><small>${queue.length?`${queue.length} cambios esperando envío`:"Todo lo compatible está sincronizado"}</small></div></div>
        <div class="system-queue-list">${queue.length?queue.slice(0,8).map(x=>`<div><span>${escapeHtml(String(x.opts?.method||"POST"))}</span><strong>${escapeHtml(x.url||"")}</strong><small>${formatSystemDate(x.at)}</small></div>`).join(""):`<div class="system-empty compact">No hay operaciones pendientes.</div>`}</div>
        ${state.lastSyncReport?`<div class="system-last-sync"><span>ÚLTIMO INTENTO</span><strong>${Number(state.lastSyncReport.sent||0)} enviados · ${Number(state.lastSyncReport.pending||0)} pendientes</strong></div>`:""}
      </article>
    </section>

    <section class="system-main-grid">
      <article class="card system-integrity-card">
        <div class="system-section-head"><div><span>INTEGRIDAD</span><h2>Biblioteca y archivos</h2></div><button id="system-check-integrity" class="secondary-btn">REVISAR R2</button></div>
        <p class="system-help">Comprueba que cada archivo registrado en tu Biblioteca todavía exista físicamente en R2. No abre ni analiza tus documentos.</p>
        <div id="system-integrity-result">${state.systemIntegrity?renderSystemIntegrityResult(state.systemIntegrity):`<div class="system-empty">Todavía no has ejecutado la comprobación.</div>`}</div>
      </article>

      <article class="card system-offline-course">
        <div class="system-section-head"><div><span>PREPARACIÓN OFFLINE</span><h2>Preparar materia para salir</h2></div><span>US$0 IA</span></div>
        <p class="system-help">Guarda en este dispositivo clases ya creadas, flashcards, paquetes de claves y preguntas del banco. Los PDF/libros se incluyen cuando tú los marcaste OFFLINE en Biblioteca.</p>
        <div class="field"><label>Materia</label><select id="system-offline-subject"><option value="">Selecciona…</option>${state.subjects.map(s=>`<option value="${escapeAttr(s.id)}">${escapeHtml(s.name)}</option>`).join("")}</select></div>
        <button id="system-download-course" class="secondary-btn">↓ PREPARAR ESTA MATERIA OFFLINE</button>
        <div id="system-offline-course-result"></div>
      </article>
    </section>

    <section class="system-main-grid">
      <article class="card system-errors-card">
        <div class="system-section-head"><div><span>REGISTRO LOCAL</span><h2>Errores recientes</h2></div><div><button id="system-copy-diagnostic" class="secondary-btn">COPIAR DIAGNÓSTICO</button><button id="system-clear-errors" class="ghost-btn">LIMPIAR</button></div></div>
        <div class="system-error-list">${errors.length?errors.slice(0,12).map(e=>`<article><span>${e.status||"!"}</span><div><strong>${escapeHtml(e.context)}</strong><p>${escapeHtml(e.message)}</p><small>${formatSystemDate(e.at)}${e.url?` · ${escapeHtml(e.url)}`:""}</small></div></article>`).join(""):`<div class="system-empty">No hay errores locales registrados. ✓</div>`}</div>
      </article>

      <article class="card system-storage-card">
        <div class="system-section-head"><div><span>ESTE DISPOSITIVO</span><h2>Almacenamiento local</h2></div><b>${formatBytes(storage.usage)}</b></div>
        <div class="system-storage-bar"><i style="width:${storage.quota?Math.min(100,storage.usage/storage.quota*100):0}%"></i></div>
        <div class="system-storage-meta"><span>Usado <strong>${formatBytes(storage.usage)}</strong></span><span>Disponible aprox. <strong>${storage.quota?formatBytes(Math.max(0,storage.quota-storage.usage)):"—"}</strong></span><span>Persistente <strong>${storage.persisted?"Sí":"Según navegador"}</strong></span></div>
        <p class="system-help">Los archivos que marcaste OFFLINE ocupan espacio solo en este dispositivo. Los originales siguen en R2.</p>
      </article>
    </section>`;

  $("#system-run-diagnostic").onclick=renderSystemCenter;
  $("#system-deep-test").onclick=runDeepSystemTestV29;
  $("#system-sync-now").onclick=async()=>{await flushOfflineQueue();renderSystemCenter()};
  $("#system-hard-update").onclick=async()=>{await checkSystemVersionInBackground();if(state.systemHealth?.server_version===APP_VERSION)toast("Esta aplicación coincide con la versión del servidor.");else showVersionBanner(state.systemHealth?.server_version)};
  $("#system-export-all").onclick=exportAllMedAI;
  $("#system-create-backup").onclick=createManualSystemBackup;
  $$(".system-download-backup").forEach(b=>b.onclick=()=>downloadSystemBackup(b.dataset.key));
  $$(".system-restore-backup").forEach(b=>b.onclick=()=>restoreSystemBackup(b.dataset.key,b.dataset.date));
  $("#system-check-integrity").onclick=runSystemIntegrity;
  $("#system-download-course").onclick=downloadExistingCourseOffline;
  $("#system-copy-diagnostic").onclick=copySystemDiagnostic;
  $("#system-clear-errors").onclick=()=>{if(confirm("¿Limpiar el registro local de errores de este dispositivo?")){clearSystemErrors();renderSystemCenter()}};
}

function renderSystemIntegrityResult(d){
  const total=Number(d.total||0),missing=d.missing||[],checked=Number(d.checked||0);
  return `<div class="system-integrity-summary ${missing.length?"warn":"ok"}"><span>${missing.length?"!":"✓"}</span><div><strong>${missing.length?`${missing.length} archivo(s) necesitan revisión`:"Biblioteca íntegra"}</strong><small>${checked} de ${total} registros comprobados${d.truncated?" · comprobación limitada":""}</small></div></div>
  ${missing.length?`<div class="system-missing-list">${missing.slice(0,15).map(x=>`<div><strong>${escapeHtml(x.title||x.id)}</strong><small>${escapeHtml(x.reason||"No encontrado en R2")}</small></div>`).join("")}</div>`:""}`;
}

async function createManualSystemBackup(){
  if(!navigator.onLine)return toast("Necesitas internet para guardar un backup en R2.",true);
  try{
    toast("Creando punto de recuperación…");
    const d=await api("/api/system/backup",{method:"POST",body:{reason:"manual"}});
    if(d.ok){localStorage.setItem(SYSTEM_BACKUP_DAY_KEY,new Date().toISOString().slice(0,10));toast("Backup creado correctamente.");renderSystemCenter()}
  }catch(err){logSystemError("manual_backup",err);toast(err.message,true)}
}
function downloadSystemBackup(key){
  if(!navigator.onLine)return toast("Necesitas internet para descargar este backup.",true);
  const a=document.createElement("a");
  a.href=`/api/system/backup?key=${encodeURIComponent(key)}&download=1`;
  a.rel="noopener";document.body.appendChild(a);a.click();a.remove();
}
async function restoreSystemBackup(key,date){
  if(!navigator.onLine)return toast("La restauración necesita internet.",true);
  const msg=`¿Restaurar el backup de ${formatSystemDate(date)}?\n\nMED AI creará primero un backup de seguridad del estado actual. La restauración combina los datos del punto elegido y puede reemplazar versiones de registros con el mismo ID.`;
  if(!confirm(msg))return;
  const typed=prompt('Escribe RESTAURAR para confirmar:');
  if(typed!=="RESTAURAR")return toast("Restauración cancelada.");
  try{
    toast("Creando backup previo y restaurando…");
    const d=await api("/api/system/restore",{method:"POST",body:{key,confirm:"RESTAURAR"}});
    toast(`Restauración completada: ${Number(d.rows_restored||0)} registros recuperados.`);
    setTimeout(()=>hardRefreshApplication(),800);
  }catch(err){logSystemError("restore_backup",err);toast(err.message,true)}
}
async function runSystemIntegrity(){
  if(!navigator.onLine)return toast("La comprobación R2 necesita internet.",true);
  const box=$("#system-integrity-result");box.innerHTML=`<div class="system-inline-loading">Comprobando referencias D1 ↔ R2…</div>`;
  try{
    const d=await api("/api/system/integrity?limit=250");
    state.systemIntegrity=d;box.innerHTML=renderSystemIntegrityResult(d);
  }catch(err){logSystemError("integrity_check",err);box.innerHTML=`<div class="masterclass-error"><strong>No pude comprobar R2.</strong><p>${escapeHtml(err.message)}</p></div>`}
}
async function runDeepSystemTestV29(){
  if(!navigator.onLine)return toast("La prueba profunda necesita conexión para comprobar D1 y R2.",true);
  openV29Result("Prueba profunda",`<div class="library-loading"><div class="v17-loading-orb"><i></i><i></i><i></i></div><strong>Probando rutas críticas…</strong><small>No ejecuta Gemini ni consume una inferencia de IA.</small></div>`);
  try{
    const d=await api("/api/system/self-test");
    $("#v29-result-body").innerHTML=`<section class="v29-self-test"><div class="v29-success-mark">${d.ok?"✓":"!"}</div><div class="eyebrow">SELF TEST · ${Number(d.passed||0)}/${Number(d.total||0)}</div><h2>${d.ok?"Sistema listo":"Hay componentes para revisar"}</h2><div class="v29-test-list">${(d.checks||[]).map(x=>`<article class="${x.ok?"ok":"bad"}"><span>${x.ok?"✓":"×"}</span><div><strong>${escapeHtml(x.name)}</strong><small>${escapeHtml(x.detail||"")}</small></div></article>`).join("")}</div></section>`;
  }catch(err){$("#v29-result-body").innerHTML=`<div class="masterclass-error"><strong>No pude completar la prueba.</strong><p>${escapeHtml(err.message)}</p></div>`}
}

function exportAllMedAI(){
  if(!navigator.onLine)return toast("Necesitas internet para preparar la exportación completa.",true);
  const a=document.createElement("a");a.href="/api/system/export";a.rel="noopener";document.body.appendChild(a);a.click();a.remove();
  toast("Preparando exportación ZIP de tus datos de estudio.");
}

async function downloadExistingCourseOffline(){
  const subjectId=$("#system-offline-subject").value,box=$("#system-offline-course-result");
  if(!subjectId)return toast("Selecciona una materia.",true);
  if(!navigator.onLine)return toast("Conéctate una vez para preparar esta materia.",true);
  box.innerHTML=`<div class="system-inline-loading">Reuniendo clases, flashcards, claves y preguntas ya guardadas…</div>`;
  try{
    const d=await api(`/api/system/offline-course?subject_id=${encodeURIComponent(subjectId)}`);
    let classes=0;
    const langCode={"Hebreo":"he-IL","Latín":"la","Inglés":"en-US","Ruso":"ru-RU","Francés":"fr-FR"};
    for(const row of (d.materials||[])){
      const languageKey=langCode[row.language]||row.language||"";
      const key=`coursepack:${row.subject_id||subjectId}:${row.topic_id||""}:${row.lesson_id||""}:${languageKey}`;
      await offlinePutJson(key,row.material);classes++;
    }
    const bundle={version:29,subject:d.subject,flashcards:d.flashcards||[],historical_packs:d.historical_packs||[],question_bank:d.question_bank||[],prepared_at:new Date().toISOString()};
    await offlinePutJson(`offlinebundle:${subjectId}`,bundle);
    box.innerHTML=`<div class="system-offline-success"><span>✓</span><strong>${escapeHtml(d.subject?.name||"Materia")} preparada en este dispositivo.</strong><small>${classes} clases · ${bundle.flashcards.length} flashcards · ${bundle.historical_packs.length} paquetes históricos · ${bundle.question_bank.length} preguntas. ${escapeHtml(d.note||"")}</small></div>`;
  }catch(err){logSystemError("offline_course_download",err);box.innerHTML=`<div class="notice">${escapeHtml(err.message)}</div>`}
}
async function copySystemDiagnostic(){
  const errors=getSystemErrors().slice(0,12),queue=getOfflineQueue(),h=state.systemHealth||{};
  const payload={
    app:"MED AI DALTON",app_version:APP_VERSION,server_version:h.server_version||null,
    generated_at:new Date().toISOString(),online:navigator.onLine,
    user_agent:navigator.userAgent,
    status:{db:h.db,r2:h.r2,ai:h.ai,assets:h.assets,service_worker:!!navigator.serviceWorker?.controller,indexeddb:"indexedDB" in window},
    pending_sync:queue.length,
    integrity:state.systemIntegrity||null,
    recent_errors:errors
  };
  const text=JSON.stringify(payload,null,2);
  try{await navigator.clipboard.writeText(text);toast("Diagnóstico copiado. Puedes pegarlo en el chat cuando necesitemos revisar un problema.")}catch{
    const blob=new Blob([text],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=`MED_AI_DIAGNOSTICO_${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),3000);
  }
}

document.addEventListener("DOMContentLoaded", boot);

async function boot(){
  applySavedTheme();
  setupSystemErrorCapture();
  bindAuth();
  bindShell();
  setupPWA();
  updateNetworkBadge();
  updateMaintenanceBanner();

  try{
    const me=await api("/api/me");
    state.user=me.user;
    showApp();
    await loadSubjects();
    navigate("dashboard");
    checkSystemVersionInBackground();
    ensureDailySystemBackup();
  }catch(err){
    logSystemError("boot",err,{url:"/api/me",method:"GET"});
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
  window.addEventListener("online",async()=>{
    state.maintenanceMode=false;updateNetworkBadge();updateMaintenanceBanner();
    await flushOfflineQueue();checkSystemVersionInBackground();ensureDailySystemBackup();
  });
  window.addEventListener("offline",()=>{state.maintenanceMode=true;updateNetworkBadge();updateMaintenanceBanner()});
}

function showApp(){
  $("#auth-screen").classList.add("hidden");$("#app-shell").classList.remove("hidden");
  const name=state.user?.full_name||state.user?.email||"D";
  $("#user-chip").textContent=name.trim()[0]?.toUpperCase()||"D";
}
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
      exams:renderExams,exam_prep:renderExamPrepCenter,question_bank:renderQuestionBank,flashcards:renderFlashcards,patient:renderPatientVirtual,
      case_solver:renderCaseSolver,
      grand_rounds:()=>renderAIStudio("grand_rounds"),emergency:()=>renderAIStudio("emergency"),
      ecg:()=>renderVisionStudio("ecg"),radiology:()=>renderVisionStudio("radiology"),
      laboratory:()=>renderAIStudio("laboratory"),pharmacology:()=>renderAIStudio("pharmacology"),
      osce:()=>renderAIStudio("osce"),library:renderLibrary,smart:renderSmartStudy,mistakes:renderMistakes,
      plan:renderPlan,stats:renderStats,profile:renderProfile,system:renderSystemCenter,
      mathematics:()=>renderScienceStudio("MATH"),physics:()=>renderScienceStudio("PHYS"),
      astronomy:()=>renderScienceStudio("ASTRO"),languages:renderLanguageLabV17,
      course:renderCourse,course_lesson:renderCourseLesson
    };
    await (renderers[view]||renderDashboard)();
  }catch(err){
    logSystemError(`navigate:${view}`,err);
    root.innerHTML=`<div class="card"><h3>No se pudo cargar</h3><p>${escapeHtml(err.message)}</p><button class="secondary-btn" onclick="navigate('system')">VER ESTADO DEL SISTEMA</button></div>`;
  }
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
      <div><b>01</b><span><strong>Clase</strong><small>Texto completo y guardable en PDF.</small></span></div>
      <div><b>02</b><span><strong>Práctica</strong><small>Ejercicios interactivos con corrección.</small></span></div>
      <div><b>03</b><span><strong>Resumen</strong><small>Repasa lo esencial antes de evaluar.</small></span></div>
      <div><b>04</b><span><strong>Examen</strong><small>10 preguntas · apruebas con 8.</small></span></div>
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
  state.currentLesson={...item,index};state.currentTopic={id:item.topic_id,name:item.topic_name,subject_id:state.currentSubject.id};state.courseConversation=null;state.courseExam=null;state.courseLearningPack=null;state.coursePractice=null;state.coursePhase="lesson";navigate("course_lesson");
}

async function renderCourseLesson(){
  const item=state.currentLesson,s=state.currentSubject,course=state.currentCourse;
  if(!item||!s||!course){navigate("course");return}
  const objectives=safeJson(item.learning_objectives_json,[]);
  const noteData=await api(`/api/course-note?topic_id=${encodeURIComponent(item.topic_id)}`).catch(()=>({note:null}));
  const completed=Number(item.completed)===1;
  const savedPos=safeJson(item.last_position_json,{});
  state.coursePhase=completed?"summary":normalizeSavedCoursePhase(savedPos.stage,Number(item.progress_percent||0));
  root.innerHTML=`
    <div class="lesson-course-head"><button id="back-course" class="ghost-btn">← ${escapeHtml(s.name.toUpperCase())}</button><div><span>LECCIÓN ${String(item.index+1).padStart(2,"0")} / ${course.total}</span><strong>${escapeHtml(item.topic_name)}</strong></div><div class="lesson-course-percent">${completed?"100":Math.round(Number(item.progress_percent||0))}%</div></div>
    <div class="course-master-flow">
      <button class="course-flow-step active" data-phase="lesson"><b>01</b><span>CLASE</span><small>Aprender</small></button>
      <button class="course-flow-step" data-phase="practice"><b>02</b><span>PRÁCTICA</span><small>Aplicar</small></button>
      <button class="course-flow-step" data-phase="summary"><b>03</b><span>RESUMEN</span><small>Recordar</small></button>
      <button class="course-flow-step" data-phase="exam"><b>04</b><span>EXAMEN</span><small>10 preguntas</small></button>
    </div>
    <div class="lesson-course-grid masterclass-grid">
      <main class="card lesson-main masterclass-main">
        <div id="course-learning-body" class="course-learning-body">
          <div class="masterclass-loading"><div class="v17-loading-orb"><i></i><i></i><i></i></div><strong>Preparando tu clase</strong><span>${escapeHtml(item.topic_name)}</span><small>Organizando teoría, diagramas, mapa conceptual, videos, práctica y resumen…</small></div>
        </div>
        <section class="course-question-box">
          <div><div class="panel-code">¿TE QUEDÓ UNA DUDA?</div><strong>Pregunta sobre esta clase</strong><small>MED AI responderá sin sacarte del tema que estás estudiando.</small></div>
          <div id="course-messages" class="messages course-messages compact-course-chat"></div>
          <div class="composer"><textarea id="course-input" rows="2" placeholder="Ej. Explícame otra vez este concepto con un ejemplo más sencillo..."></textarea><button id="course-send" class="primary-btn">PREGUNTAR</button></div>
        </section>
      </main>
      <aside class="lesson-side">
        <section class="card lesson-progress-card"><div class="panel-code">PROGRESO DEL TEMA</div><div class="lesson-progress-number" id="lesson-progress-number">${completed?100:Math.round(Number(item.progress_percent||0))}%</div><div class="progress"><i id="lesson-progress-bar" style="width:${completed?100:Number(item.progress_percent||0)}%"></i></div><div class="master-progress-stages"><span class="${Number(item.progress_percent||0)>=35||completed?'done':''}">✓ Clase</span><span class="${Number(item.progress_percent||0)>=65||completed?'done':''}">✓ Práctica</span><span class="${Number(item.progress_percent||0)>=80||completed?'done':''}">✓ Resumen</span><span class="${completed?'done':''}">✓ Examen</span></div><p>${completed?"Tema aprobado. Puedes volver a estudiar cualquier sección.":"El tema se completa únicamente después de aprobar 8 de 10 preguntas en el examen final."}</p><div class="course-pass-status ${completed?"passed":""}" id="course-pass-status">${completed?"TEMA APROBADO ✓":"RUTA EN PROGRESO"}</div><button id="next-course-topic" class="secondary-btn wide ${completed?"":"hidden"}" style="margin-top:8px">SIGUIENTE TEMA →</button></section>
        <section class="card masterclass-info-card"><div class="panel-code">MATERIAL DE CLASE</div><strong>Tu clase queda guardada</strong><p>El contenido generado para este tema se conserva en tu cuenta. También puedes abrirlo como documento y guardarlo en PDF.</p><button id="course-pdf-side" class="secondary-btn wide" disabled>GUARDAR / IMPRIMIR PDF</button><small id="course-material-status">Cargando material…</small></section>
        <section class="card university-source-card">
          <div class="panel-code">MI MATERIAL DE LA UNIVERSIDAD</div>
          <div class="university-source-card-head"><strong>Estudia desde tus propios archivos</strong><span id="university-source-count">—</span></div>
          <p>Sube PDF, texto, video corto o un enlace público de YouTube. MED AI lo procesa una vez y guarda la clase para futuros repasos.</p>
          <button id="open-university-source" class="university-source-main-btn wide"><span>＋</span><b>ABRIR MIS MATERIALES</b></button>
          <small>Diseñado para ahorrar créditos: volver a abrir una clase guardada no vuelve a analizar el archivo.</small>
        </section>
        <section class="card"><div class="panel-code">MIS NOTAS DEL TEMA</div><textarea id="course-note" class="course-note" placeholder="Escribe aquí lo que quieras recordar...">${escapeHtml(noteData.note?.body||"")}</textarea><button id="save-course-note" class="secondary-btn wide">GUARDAR NOTAS</button><small id="course-note-status">${noteData.note?.updated_at?`Último guardado: ${formatDate(noteData.note.updated_at)}`:"Tus notas quedan sincronizadas en D1."}</small></section>
      </aside>
    </div>`;

  $("#back-course").onclick=()=>navigate("course");
  $("#course-send").onclick=()=>sendCourseLessonMessage();
  $("#course-input").addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendCourseLessonMessage()}});
  $("#next-course-topic").onclick=()=>{const ni=item.index+1;if(ni<course.items.length)openCourseLesson(ni);else navigate("course")};
  $("#save-course-note").onclick=saveCourseNote;
  $("#course-pdf-side").onclick=printCourseMaterialPdf;
  $("#open-university-source").onclick=openUniversitySourceStudio;
  $$(".course-flow-step").forEach(btn=>btn.onclick=()=>openCoursePhase(btn.dataset.phase));
  refreshUniversitySourceCount().catch(()=>{});
  await loadCourseMasterclass();
}

function phaseFromCourseProgress(progress){
  if(progress>=80)return"summary";
  if(progress>=65)return"practice";
  return"lesson";
}

function normalizeSavedCoursePhase(stage,progress){
  if(["lesson","practice","summary","exam"].includes(stage))return stage;
  if(stage==="exam_retry"||stage==="exam_passed")return"summary";
  if(stage==="practice_ready")return"practice";
  return phaseFromCourseProgress(progress);
}

function coursePhaseAllowed(phase){
  const item=state.currentLesson;
  const progress=Number(item?.progress_percent||0);
  const completed=Number(item?.completed)===1;
  if(completed)return true;
  if(phase==="lesson")return true;
  if(phase==="practice")return progress>=35;
  if(phase==="summary")return progress>=65;
  if(phase==="exam")return progress>=80;
  return false;
}

async function openCoursePhase(phase){
  if(!state.courseLearningPack)return;
  if(!coursePhaseAllowed(phase)){
    const msg={practice:"Primero estudia la clase.",summary:"Primero completa los ejercicios de práctica.",exam:"Primero revisa el resumen de la lección."}[phase]||"Completa la etapa anterior.";
    toast(msg,true);return;
  }
  state.coursePhase=phase;
  $$(".course-flow-step").forEach(b=>b.classList.toggle("active",b.dataset.phase===phase));
  if(phase==="lesson")renderCourseMasterclassMaterial();
  if(phase==="practice")renderCoursePracticeStart();
  if(phase==="summary")renderCourseMasterclassSummary();
  if(phase==="exam")startCourseFinalExam();
}

async function loadCourseMasterclass(){
  const item=state.currentLesson,s=state.currentSubject;
  const key=courseOfflinePackKey(item,s);
  const local=await offlineGetJson(key);
  const usePack=async(material,label)=>{
    state.courseLearningPack=material;
    $("#course-pdf-side").disabled=false;
    $("#course-material-status").textContent=label;
    if(!Number(item.completed)&&Number(item.progress_percent||0)<35)await updateCourseLessonProgress(35,false,{stage:"lesson",material_saved:true,offline_ready:true},false);
    const desired=coursePhaseAllowed(state.coursePhase)?state.coursePhase:"lesson";
    openCoursePhase(desired);
  };
  if(!navigator.onLine&&local){
    await usePack(local,"Disponible sin internet · copia local V24 ✓");
    return;
  }
  try{
    const pack=await api("/api/course/material-pack",{method:"POST",body:{subject_id:s.id,topic_id:item.topic_id,lesson_id:item.lesson_id,language:s.code==="LANG"?state.courseLanguage:null}});
    await offlinePutJson(key,pack.material);
    await usePack(pack.material,pack.cached?"Clase recuperada y guardada offline ✓":"Clase creada, guardada en tu cuenta y offline ✓");
  }catch(err){
    if(local){await usePack(local,"Usando copia offline porque la red no respondió ✓");return}
    $("#course-learning-body").innerHTML=`<div class="masterclass-error"><strong>No pude preparar el material de esta clase.</strong><p>${escapeHtml(err.message)}</p><button id="retry-course-pack" class="primary-btn">INTENTAR DE NUEVO</button></div>`;
    $("#retry-course-pack").onclick=loadCourseMasterclass;
    $("#course-material-status").textContent="Material pendiente.";
  }
}

function renderCourseMasterclassMaterial(){
  const p=state.courseLearningPack,item=state.currentLesson,s=state.currentSubject;
  if(!p)return;
  const body=$("#course-learning-body");
  body.innerHTML=`
    <article class="masterclass-document multimedia-masterclass" id="masterclass-document">
      <header class="masterclass-document-head multimedia-doc-head">
        <div><div class="eyebrow">CLASE MULTIMEDIA · ${escapeHtml(s.name.toUpperCase())}</div><h1>${escapeHtml(p.title||item.topic_name)}</h1><p>${escapeHtml(p.overview||item.summary||"")}</p></div>
        <div class="masterclass-doc-actions"><span>${Number(p.estimated_minutes||35)} MIN</span><button id="course-pdf-main" class="secondary-btn">▣ GUARDAR PDF</button></div>
      </header>

      <section class="masterclass-objectives">
        <div class="panel-code">AL TERMINAR PODRÁS</div>
        <ul>${(p.objectives||[]).map(x=>`<li>${escapeHtml(x)}</li>`).join("")}</ul>
      </section>

      <div class="academy-learning-tabs" role="tablist" aria-label="Recursos de la clase">
        <button class="academy-learning-tab active" data-academy-view="read"><span>📖</span><b>LECCIÓN</b><small>Texto completo</small></button>
        <button class="academy-learning-tab" data-academy-view="diagram"><span>◈</span><b>DIAGRAMA</b><small>Ver el proceso</small></button>
        <button class="academy-learning-tab" data-academy-view="map"><span>⌘</span><b>MAPA</b><small>Conectar ideas</small></button>
        <button class="academy-learning-tab" data-academy-view="videos"><span>▶</span><b>VIDEOS</b><small>Recursos web</small></button>
      </div>

      <div id="academy-learning-view" class="academy-learning-view"></div>

      <footer class="masterclass-next">
        <div><strong>¿Terminaste de estudiar y explorar los recursos?</strong><span>Ahora aplica lo aprendido con ejercicios antes del resumen y el examen.</span></div>
        <button id="go-course-practice" class="primary-btn">IR A PRÁCTICA →</button>
      </footer>
    </article>`;

  $("#course-pdf-main").onclick=printCourseMaterialPdf;
  $("#go-course-practice").onclick=async()=>{if(!Number(item.completed)&&Number(item.progress_percent||0)<40)await updateCourseLessonProgress(40,false,{stage:"practice_ready"});openCoursePhase("practice")};

  $$(".academy-learning-tab").forEach(btn=>btn.onclick=()=>{
    $$(".academy-learning-tab").forEach(x=>x.classList.toggle("active",x===btn));
    renderAcademyLearningView(btn.dataset.academyView);
  });
  renderAcademyLearningView("read");
}

function renderAcademyLearningView(view){
  const p=state.courseLearningPack,item=state.currentLesson,s=state.currentSubject;
  const box=$("#academy-learning-view");if(!p||!box)return;

  if(view==="diagram"){
    box.innerHTML=renderCourseDiagram(p.diagram,p.sections||[]);
    $$(".academy-diagram-step",box).forEach(step=>step.onclick=()=>{
      const detail=step.querySelector(".academy-diagram-detail");
      if(detail)detail.classList.toggle("open");
      step.classList.toggle("selected");
    });
    return;
  }

  if(view==="map"){
    box.innerHTML=renderCourseConceptMap(p.concept_map,p);
    $$(".academy-map-branch",box).forEach(branch=>branch.onclick=()=>{
      if(branch.classList.contains("expanded"))branch.classList.remove("expanded");
      else{
        $$(".academy-map-branch",box).forEach(x=>x.classList.remove("expanded"));
        branch.classList.add("expanded");
      }
    });
    return;
  }

  if(view==="videos"){
    box.innerHTML=renderCourseVideoHub(s,item);
    $$(".academy-video-search",box).forEach(btn=>btn.onclick=()=>{
      const url=btn.dataset.url;
      if(url)window.open(url,"_blank","noopener,noreferrer");
    });
    $("#academy-load-video")?.addEventListener("click",loadCourseYoutubeVideo);
    $("#academy-video-url")?.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();loadCourseYoutubeVideo()}});
    return;
  }

  box.innerHTML=`
    <div class="academy-reading-layout">
      <aside class="academy-reading-nav">
        <span>CONTENIDO</span>
        ${(p.sections||[]).map((x,i)=>`<button data-section="${i}"><b>${String(i+1).padStart(2,"0")}</b><small>${escapeHtml(x.title)}</small></button>`).join("")}
        ${p.key_terms?.length?`<button data-section="terms"><b>◆</b><small>Conceptos clave</small></button>`:""}
      </aside>
      <div class="masterclass-sections academy-reading-content">
        ${(p.sections||[]).map((sec,i)=>`
          <section class="masterclass-section academy-study-section" id="mc-section-${i}">
            <div class="masterclass-section-number">${String(i+1).padStart(2,"0")}</div>
            <div class="masterclass-section-content">
              <div class="academy-section-heading">
                <h2>${escapeHtml(sec.title||`Parte ${i+1}`)}</h2>
                <button class="academy-listen-section secondary-btn" data-section="${i}">🔊 ESCUCHAR</button>
              </div>
              <div class="masterclass-prose">${renderStudyParagraphs(sec.content||"")}</div>
              ${sec.key_points?.length?`<div class="masterclass-keypoints"><strong>Puntos clave</strong><ul>${sec.key_points.map(k=>`<li>${escapeHtml(k)}</li>`).join("")}</ul></div>`:""}
              ${sec.example?`<div class="masterclass-example"><span>EJEMPLO</span>${renderStudyParagraphs(sec.example)}</div>`:""}
              ${sec.application?`<div class="masterclass-application"><span>APLICACIÓN</span>${renderStudyParagraphs(sec.application)}</div>`:""}
              <button class="academy-understood-btn" data-understood="${i}">✓ MARCAR COMO REVISADO</button>
            </div>
          </section>`).join("")}
        ${p.key_terms?.length?`<section class="masterclass-terms academy-keyterms" id="mc-terms"><div class="panel-code">CONCEPTOS QUE DEBES DOMINAR</div><div>${p.key_terms.map(t=>`<span>${escapeHtml(t)}</span>`).join("")}</div></section>`:""}
      </div>
    </div>`;

  $$(".academy-reading-nav button",box).forEach(btn=>btn.onclick=()=>{
    const target=btn.dataset.section==="terms"?$("#mc-terms"):$(`#mc-section-${btn.dataset.section}`);
    target?.scrollIntoView({behavior:"smooth",block:"start"});
  });
  $$(".academy-listen-section",box).forEach(btn=>btn.onclick=()=>{
    const sec=p.sections?.[Number(btn.dataset.section)];
    if(!sec)return;
    const lang=s.code==="LANG"?state.courseLanguage:"es-GT";
    speakText(`${sec.title}. ${sec.content}. ${sec.example||""}`,lang);
  });
  $$(".academy-understood-btn",box).forEach(btn=>btn.onclick=()=>{
    btn.classList.toggle("done");
    btn.textContent=btn.classList.contains("done")?"✓ REVISADO":"✓ MARCAR COMO REVISADO";
  });
}

function renderStudyParagraphs(text){
  return String(text||"").split(/\n{2,}|\n/).map(x=>x.trim()).filter(Boolean).map(x=>`<p>${formatInline(x)}</p>`).join("");
}

function renderCourseDiagram(diagram,sections=[]){
  const fallback={
    title:"Secuencia esencial del tema",
    caption:"Toca cada bloque para ampliar la idea.",
    steps:(sections||[]).slice(0,6).map((s,i)=>({label:s.title||`Paso ${i+1}`,detail:(s.key_points||[]).slice(0,2).join(" · ")||String(s.content||"").slice(0,180)}))
  };
  const d=diagram&&Array.isArray(diagram.steps)&&diagram.steps.length?diagram:fallback;
  return `<section class="academy-visual-panel">
    <header class="academy-resource-head"><div><span>DIAGRAMA INTERACTIVO</span><h2>${escapeHtml(d.title||"Diagrama del tema")}</h2><p>${escapeHtml(d.caption||"Selecciona un bloque para ver su explicación.")}</p></div><div class="academy-resource-icon">◈</div></header>
    <div class="academy-diagram-flow">
      ${(d.steps||[]).slice(0,8).map((step,i)=>`
        <div class="academy-diagram-step" tabindex="0">
          <div class="academy-diagram-index">${String(i+1).padStart(2,"0")}</div>
          <strong>${escapeHtml(step.label||`Paso ${i+1}`)}</strong>
          <div class="academy-diagram-detail">${escapeHtml(step.detail||"")}</div>
        </div>
        ${i<(d.steps||[]).slice(0,8).length-1?`<div class="academy-diagram-arrow">→</div>`:""}`).join("")}
    </div>
    <div class="academy-resource-note">Este diagrama resume relaciones del material generado para esta clase. Úsalo para recordar el orden o la lógica general; vuelve al texto para estudiar los detalles.</div>
  </section>`;
}

function renderCourseConceptMap(map,p){
  const fallback={
    center:p.title||state.currentLesson?.topic_name||"Tema",
    branches:(p.sections||[]).slice(0,6).map(s=>({label:s.title,children:(s.key_points||[]).slice(0,3)}))
  };
  const m=map&&Array.isArray(map.branches)&&map.branches.length?map:fallback;
  return `<section class="academy-visual-panel">
    <header class="academy-resource-head"><div><span>MAPA CONCEPTUAL</span><h2>Cómo se conectan las ideas</h2><p>Toca una rama para desplegar sus conceptos relacionados.</p></div><div class="academy-resource-icon map">⌘</div></header>
    <div class="academy-concept-map">
      <div class="academy-map-center"><span>TEMA CENTRAL</span><strong>${escapeHtml(m.center||p.title||"Tema")}</strong></div>
      <div class="academy-map-branches">
        ${(m.branches||[]).slice(0,7).map((branch,i)=>`
          <button class="academy-map-branch branch-${i%5}">
            <span>${String(i+1).padStart(2,"0")}</span>
            <strong>${escapeHtml(branch.label||"Concepto")}</strong>
            <div>${(branch.children||[]).slice(0,4).map(x=>`<small>${escapeHtml(x)}</small>`).join("")}</div>
          </button>`).join("")}
      </div>
    </div>
  </section>`;
}

function courseVideoRecommendations(subject,item){
  const topic=item?.topic_name||"tema";
  const code=subject?.code||"MED";
  const langName=LANGUAGE_OPTIONS.find(x=>x[0]===state.courseLanguage)?.[1]||"Inglés";
  let sources;
  if(code==="MATH")sources=[
    ["Khan Academy","Khan Academy Español",`${topic} Khan Academy Español`,"Fundamentos y práctica guiada."],
    ["3Blue1Brown","3Blue1Brown",`${topic} 3Blue1Brown`,"Intuición visual para ideas matemáticas."],
    ["julioprofe","julioprofe",`${topic} julioprofe`,"Problemas y procedimientos paso a paso."]
  ];
  else if(code==="PHYS")sources=[
    ["Khan Academy","Khan Academy Física",`${topic} física Khan Academy Español`,"Conceptos, ecuaciones y ejercicios."],
    ["QuantumFracture","QuantumFracture",`${topic} QuantumFracture`,"Explicaciones visuales de física."],
    ["Flipping Physics","Flipping Physics",`${topic} Flipping Physics`,"Resolución de problemas y demostraciones."]
  ];
  else if(code==="ASTRO")sources=[
    ["Crash Course Astronomy","Crash Course Astronomy",`${topic} Crash Course Astronomy`,"Curso visual y progresivo de astronomía."],
    ["PBS Space Time","PBS Space Time",`${topic} PBS Space Time`,"Profundización en astrofísica y cosmología."],
    ["Astrum","Astrum",`${topic} Astrum astronomy`,"Visualizaciones y exploración del universo."]
  ];
  else if(code==="LANG"){
    const extra=state.courseLanguage==="la"?"Latintutorial":
      state.courseLanguage==="he-IL"?"HebrewPod101":
      state.courseLanguage==="ru-RU"?"RussianPod101":
      state.courseLanguage==="fr-FR"?"Easy French":"BBC Learning English";
    sources=[
      ["Easy Languages","Easy Languages",`${langName} ${topic} Easy Languages`,"Conversaciones y situaciones reales."],
      [extra,extra,`${topic} ${extra}`,"Explicación específica del idioma."],
      ["Pronunciación","YouTube",`${langName} pronunciation ${topic}`,"Escucha y repetición del tema."]
    ];
  }else sources=[
    ["Khan Academy","Khan Academy",`${topic} medicina Khan Academy`,"Fundamentos visuales de ciencias de la salud."],
    ["Ninja Nerd","Ninja Nerd",`${topic} Ninja Nerd`,"Clases extensas con razonamiento y diagramas."],
    ["Osmosis","Osmosis",`${topic} Osmosis`,"Repaso visual y clínico del tema."]
  ];
  return sources.map(([source,channel,query,description])=>({
    source,channel,query,description,
    url:`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
  }));
}

function renderCourseVideoHub(subject,item){
  const videos=courseVideoRecommendations(subject,item);
  return `<section class="academy-visual-panel">
    <header class="academy-resource-head"><div><span>VIDEOTECA DEL TEMA</span><h2>Complementa la clase con videos</h2><p>Abre búsquedas preparadas para este tema en canales educativos conocidos. Los videos requieren internet y son material complementario.</p></div><div class="academy-resource-icon video">▶</div></header>
    <div class="academy-video-grid">
      ${videos.map((v,i)=>`<article class="academy-video-card">
        <div class="academy-video-thumb thumb-${i%4}"><span>▶</span><small>VIDEO WEB</small></div>
        <div class="academy-video-copy"><span>${escapeHtml(v.source)}</span><h3>${escapeHtml(v.query)}</h3><p>${escapeHtml(v.description)}</p><button class="academy-video-search primary-btn" data-url="${escapeAttr(v.url)}">BUSCAR VIDEOS →</button></div>
      </article>`).join("")}
    </div>
    <div class="academy-embed-box">
      <div><span>REPRODUCTOR DE LA CLASE</span><strong>¿Encontraste un video que te gustó?</strong><p>Pega aquí su enlace de YouTube para verlo dentro de MED AI mientras estudias.</p></div>
      <div class="academy-video-loader"><input id="academy-video-url" type="url" placeholder="https://www.youtube.com/watch?v=..."><button id="academy-load-video" class="secondary-btn">CARGAR VIDEO</button></div>
      <div id="academy-video-player" class="academy-video-player"><div><b>▶</b><span>El reproductor aparecerá aquí.</span></div></div>
    </div>
  </section>`;
}

function extractYoutubeId(value){
  try{
    const url=new URL(String(value||"").trim());
    if(url.hostname==="youtu.be")return url.pathname.slice(1).split("/")[0];
    if(url.hostname.includes("youtube.com")){
      if(url.pathname.startsWith("/shorts/"))return url.pathname.split("/")[2];
      if(url.pathname.startsWith("/embed/"))return url.pathname.split("/")[2];
      return url.searchParams.get("v");
    }
  }catch{}
  return null;
}

function loadCourseYoutubeVideo(){
  const input=$("#academy-video-url"),holder=$("#academy-video-player");
  const id=extractYoutubeId(input?.value);
  if(!id||!/^[A-Za-z0-9_-]{6,20}$/.test(id||""))return toast("Pega un enlace válido de YouTube.",true);
  holder.innerHTML=`<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?rel=0" title="Video educativo de la clase" loading="lazy" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`;
}

function renderCoursePracticeStart(){
  const p=state.courseLearningPack;
  if(!p)return;
  state.coursePractice={index:0,score:0,answers:{},questions:(p.practice||[]).slice(0,8)};
  if(!state.coursePractice.questions.length){
    $("#course-learning-body").innerHTML=`<div class="masterclass-error"><strong>No hay ejercicios disponibles.</strong><button id="back-to-class" class="secondary-btn">VOLVER A LA CLASE</button></div>`;
    $("#back-to-class").onclick=()=>openCoursePhase("lesson");return;
  }
  renderCoursePracticeQuestion();
}

function renderCoursePracticeQuestion(){
  const st=state.coursePractice,q=st?.questions?.[st.index];
  if(!st||!q){finishCoursePractice();return}
  const total=st.questions.length;
  $("#course-learning-body").innerHTML=`<section class="master-practice-shell"><div class="master-practice-top"><button id="practice-back-class" class="ghost-btn">← CLASE</button><div class="master-practice-progress"><i style="width:${Math.round(st.index/total*100)}%"></i></div><span>${st.index+1} / ${total}</span></div><div class="master-practice-card"><div class="master-practice-icon">${q.type==="true_false"?"◐":"?"}</div><div class="eyebrow">PRÁCTICA · SIN CALIFICACIÓN FINAL</div><h2>${escapeHtml(q.question||"")}</h2>${q.context?`<p class="practice-context">${escapeHtml(q.context)}</p>`:""}<div class="master-practice-options">${(q.options||[]).map((o,i)=>`<button class="master-practice-option" data-i="${i}"><span>${String.fromCharCode(65+i)}</span><strong>${escapeHtml(o)}</strong></button>`).join("")}</div><div id="practice-feedback" class="master-practice-feedback hidden"></div></div></section>`;
  $("#practice-back-class").onclick=()=>openCoursePhase("lesson");
  $$(".master-practice-option").forEach(btn=>btn.onclick=()=>answerCoursePractice(Number(btn.dataset.i)));
}

function answerCoursePractice(choice){
  const st=state.coursePractice,q=st.questions[st.index];
  if(st.answers[st.index]!==undefined)return;
  st.answers[st.index]=choice;
  const correct=choice===Number(q.correctIndex);
  if(correct)st.score++;
  $$(".master-practice-option").forEach((btn,i)=>{btn.disabled=true;if(i===Number(q.correctIndex))btn.classList.add("correct");if(i===choice&&!correct)btn.classList.add("wrong")});
  const feedback=$("#practice-feedback");feedback.classList.remove("hidden");feedback.innerHTML=`<div><strong>${correct?"✓ Correcto":"↻ Revisa este concepto"}</strong><p>${escapeHtml(q.explanation||"")}</p></div><button id="practice-next" class="primary-btn">${st.index+1>=st.questions.length?"VER RESULTADO":"SIGUIENTE →"}</button>`;
  $("#practice-next").onclick=()=>{st.index++;if(st.index>=st.questions.length)finishCoursePractice();else renderCoursePracticeQuestion()};
}

async function finishCoursePractice(){
  const st=state.coursePractice,item=state.currentLesson;
  const pct=st?.questions?.length?Math.round(st.score/st.questions.length*100):0;
  if(!Number(item.completed))await updateCourseLessonProgress(65,false,{stage:"practice",practice_score:pct});
  $("#course-learning-body").innerHTML=`<section class="master-stage-complete"><div class="master-stage-check">✓</div><div class="eyebrow">PRÁCTICA COMPLETADA</div><h2>${st.score} de ${st.questions.length} correctas</h2><p>${pct>=75?"Buen dominio inicial. Ahora condensa la información antes del examen.":"La práctica detectó puntos que conviene repasar. Lee el resumen y vuelve a la clase si algo no está claro."}</p><div class="master-result-meter"><i style="width:${pct}%"></i></div><div class="master-stage-actions"><button id="practice-review-class" class="secondary-btn">REPASAR CLASE</button><button id="practice-go-summary" class="primary-btn">VER RESUMEN →</button></div></section>`;
  $("#practice-review-class").onclick=()=>openCoursePhase("lesson");
  $("#practice-go-summary").onclick=()=>openCoursePhase("summary");
}

async function renderCourseMasterclassSummary(){
  const p=state.courseLearningPack,item=state.currentLesson;
  if(!p)return;
  if(!Number(item.completed)&&Number(item.progress_percent||0)<80)await updateCourseLessonProgress(80,false,{stage:"summary"});
  const sm=p.summary||{};
  $("#course-learning-body").innerHTML=`<article class="master-summary"><header><div class="eyebrow">RESUMEN DE LA LECCIÓN</div><h1>${escapeHtml(p.title||item.topic_name)}</h1><p>${escapeHtml(sm.overview||p.overview||"")}</p></header><section class="master-summary-grid"><div class="master-summary-box remember"><span>01</span><strong>Lo que debes recordar</strong><ul>${(sm.must_remember||[]).map(x=>`<li>${escapeHtml(x)}</li>`).join("")}</ul></div><div class="master-summary-box errors"><span>02</span><strong>Errores frecuentes</strong><ul>${(sm.common_errors||[]).map(x=>`<li>${escapeHtml(x)}</li>`).join("")}</ul></div></section>${sm.connection?`<section class="master-summary-connection"><span>CONEXIÓN</span><p>${escapeHtml(sm.connection)}</p></section>`:""}${p.key_terms?.length?`<section class="master-summary-terms"><span>PALABRAS / IDEAS CLAVE</span><div>${p.key_terms.map(x=>`<b>${escapeHtml(x)}</b>`).join("")}</div></section>`:""}<footer class="master-summary-footer"><div><strong>¿Listo para comprobar que lo dominas?</strong><span>El examen tiene 10 preguntas y necesitas 8 correctas.</span></div><button id="summary-go-exam" class="primary-btn">INICIAR EXAMEN DE 10 PREGUNTAS →</button></footer></article>`;
  $("#summary-go-exam").onclick=()=>openCoursePhase("exam");
}

async function sendCourseLessonMessage(){
  const input=$("#course-input"),raw=input.value.trim();if(!raw)return;
  appendMessageTo("#course-messages","user",raw);input.value="";
  const item=state.currentLesson,s=state.currentSubject;
  const target=appendMessageTo("#course-messages","ai","Pensando...");target.classList.add("loading");
  const mode=["MATH","PHYS","ASTRO"].includes(s.code)?"science":s.code==="LANG"?"language":"tutor";
  const lang=s.code==="LANG"?` Idioma objetivo: ${LANGUAGE_OPTIONS.find(x=>x[0]===state.courseLanguage)?.[1]||"Inglés"}.`:"";
  const message=`Duda dentro de un curso oficial. Materia: ${s.name}. Tema: ${item.topic_name}.${lang}\n\nPregunta del estudiante: ${raw}\n\nResponde únicamente sobre este tema. Explica con claridad y ejemplos, pero no adelantes el examen ni reveles sus respuestas.`;
  try{const r=await streamSpecialAI({mode,message,conversationId:state.courseConversation,subjectId:s.id,title:`Dudas — ${item.topic_name}`,context:{course:true,topic:item.topic_name},target});state.courseConversation=r.conversationId}catch(err){target.classList.remove("loading");setMessageContent(target,"ai",`Error: ${err.message}`)}
}

async function updateCourseLessonProgress(progress,completed=false,lastPosition={},updateUI=true){
  const item=state.currentLesson;if(!item)return null;
  const r=await api("/api/lesson-progress",{method:"PUT",body:{lesson_id:item.lesson_id,progress_percent:progress,completed,last_position:lastPosition}});
  item.progress_percent=Math.max(Number(item.progress_percent||0),Number(r.progress_percent||0));item.completed=r.completed?1:item.completed;item.last_position_json=JSON.stringify(lastPosition||{});
  if(state.currentCourse){const ci=item.index;state.currentCourse.items[ci]={...state.currentCourse.items[ci],...item};state.currentCourse.progress_percent=r.course_progress;if(r.completed)state.currentCourse.next_index=Math.min(ci+1,state.currentCourse.items.length-1)}
  if(updateUI){if($("#lesson-progress-number"))$("#lesson-progress-number").textContent=`${Math.round(item.progress_percent)}%`;if($("#lesson-progress-bar"))$("#lesson-progress-bar").style.width=`${item.progress_percent}%`;updateMasterProgressStages()}
  return r;
}

function updateMasterProgressStages(){
  const p=Number(state.currentLesson?.progress_percent||0),done=Number(state.currentLesson?.completed)===1;
  const nodes=$$(".master-progress-stages span");
  const checks=[p>=35||done,p>=65||done,p>=80||done,done];
  nodes.forEach((n,i)=>n.classList.toggle("done",checks[i]));
}

async function startCourseFinalExam(){
  if(!coursePhaseAllowed("exam")){toast("Primero completa clase, práctica y resumen.",true);return}
  const item=state.currentLesson,s=state.currentSubject;
  const area=$("#course-learning-body"),key=courseOfflineExamKey(item,s);
  area.innerHTML=`<div class="course-exam-loading"><div class="v17-loading-orb"><i></i><i></i><i></i></div><strong>Preparando examen final</strong><span>${escapeHtml(item.topic_name)}</span><small>10 preguntas · necesitas 8 correctas para aprobar</small></div>`;
  try{
    let d=await offlineGetJson(key);
    if(!d){
      if(!navigator.onLine)throw new Error("Este examen todavía no se ha preparado. Conéctate una vez para generarlo; después podrás repetirlo sin internet.");
      d=await api("/api/ai/exam",{method:"POST",body:{subject:s.name,topic:item.topic_name,count:10,difficulty:Number(item.difficulty||item.difficulty_min||5),language:s.code==="LANG"?state.courseLanguage:null}});
      if((d.questions||[]).length>=10)await offlinePutJson(key,d);
    }
    state.courseExam={questions:(d.questions||[]).slice(0,10),answers:{},started_at:new Date().toISOString(),subject:s.name,topic:item.topic_name,current:0};
    if(state.courseExam.questions.length<10)throw new Error("El examen no contiene las 10 preguntas completas.");
    renderCourseFinalExam();
  }catch(err){area.innerHTML=`<div class="masterclass-error"><strong>No pude preparar el examen completo.</strong><p>${escapeHtml(err.message)}</p><button id="retry-course-exam" class="primary-btn">INTENTAR DE NUEVO</button></div>`;$("#retry-course-exam").onclick=startCourseFinalExam}
}

function renderCourseFinalExam(){
  const e=state.courseExam;if(!e)return;
  const i=e.current,q=e.questions[i],selected=e.answers[`cq${i}`];
  $("#course-learning-body").innerHTML=`<section class="master-exam-shell"><div class="master-exam-head"><div><div class="eyebrow">EXAMEN FINAL · ${escapeHtml(e.subject.toUpperCase())}</div><strong>${escapeHtml(e.topic)}</strong></div><span>${i+1} / 10</span></div><div class="master-exam-progress"><i style="width:${i*10}%"></i></div><article class="master-exam-question"><div class="master-exam-number">${String(i+1).padStart(2,"0")}</div><h2>${escapeHtml(q.stem)}</h2><div class="master-exam-options">${q.options.map((op,j)=>`<button class="master-exam-option ${selected===j?'selected':''}" data-i="${j}"><span>${String.fromCharCode(65+j)}</span><strong>${escapeHtml(op)}</strong></button>`).join("")}</div></article><footer class="master-exam-footer"><button id="exam-back-summary" class="ghost-btn">← RESUMEN</button><button id="exam-next-question" class="primary-btn" ${selected===undefined?'disabled':''}>${i===9?'CALIFICAR EXAMEN':'SIGUIENTE →'}</button></footer></section>`;
  $$(".master-exam-option").forEach(btn=>btn.onclick=()=>{e.answers[`cq${i}`]=Number(btn.dataset.i);renderCourseFinalExam()});
  $("#exam-back-summary").onclick=()=>openCoursePhase("summary");
  $("#exam-next-question").onclick=()=>{if(e.answers[`cq${i}`]===undefined)return;if(i<9){e.current++;renderCourseFinalExam()}else finishCourseFinalExam()};
}

async function finishCourseFinalExam(){
  const e=state.courseExam;if(!e)return;
  let score=0;
  e.questions.forEach((q,i)=>{if(e.answers[`cq${i}`]===Number(q.correctIndex))score++});
  const pct=Math.round(score/10*100),passed=score>=8;
  await api("/api/exams/record",{method:"POST",body:{title:`Curso · ${e.subject} · ${e.topic}`,settings:{course:true,topic_id:state.currentLesson.topic_id,lesson_id:state.currentLesson.lesson_id,pass_score:80,question_count:10},started_at:e.started_at,score,max_score:10,percentage:pct,questions:e.questions,answers:Object.fromEntries(Object.entries(e.answers).map(([k,v])=>[k.replace("cq","q"),v]))}}).catch(()=>{});
  if(passed){
    await updateCourseLessonProgress(100,true,{stage:"exam_passed",score,max_score:10,percentage:pct});
    $("#course-pass-status").textContent=`APROBADO · ${score}/10 ✓`;$("#course-pass-status").classList.add("passed");$("#next-course-topic").classList.remove("hidden");
  }else await updateCourseLessonProgress(80,false,{stage:"exam_retry",score,max_score:10,percentage:pct});
  const review=e.questions.map((q,i)=>{const chosen=e.answers[`cq${i}`],ok=chosen===Number(q.correctIndex);return `<details class="master-exam-review ${ok?'correct':'wrong'}"><summary><span>${ok?'✓':'×'} Pregunta ${i+1}</span><strong>${escapeHtml(q.stem)}</strong></summary><div><p><b>Tu respuesta:</b> ${escapeHtml(q.options[chosen]||"Sin respuesta")}</p><p><b>Correcta:</b> ${escapeHtml(q.options[q.correctIndex]||"")}</p><p>${escapeHtml(q.explanation||"")}</p></div></details>`}).join("");
  $("#course-learning-body").innerHTML=`<section class="master-exam-result"><div class="master-result-badge ${passed?'passed':'failed'}">${passed?'✓':'↻'}</div><div class="eyebrow">RESULTADO DEL EXAMEN</div><h1>${score} / 10 · ${pct}%</h1><p>${passed?'Aprobaste el tema. El siguiente ya está desbloqueado.':'Aún no alcanzas 8/10. Revisa tus errores, repasa la clase y vuelve a intentarlo.'}</p><div class="master-exam-review-list">${review}</div><div class="master-stage-actions"><button id="result-summary" class="secondary-btn">VOLVER AL RESUMEN</button>${passed?`<button id="result-next-topic" class="primary-btn">SIGUIENTE TEMA →</button>`:`<button id="result-retry-exam" class="primary-btn">REPETIR EXAMEN</button>`}</div></section>`;
  $("#result-summary").onclick=()=>openCoursePhase("summary");
  $("#result-next-topic")?.addEventListener("click",()=>{$("#next-course-topic").click()});
  $("#result-retry-exam")?.addEventListener("click",startCourseFinalExam);
  updateMasterProgressStages();
}

function printCourseMaterialPdf(){
  const p=state.courseLearningPack,item=state.currentLesson,s=state.currentSubject;if(!p)return toast("La clase todavía no está lista.",true);
  const win=window.open("","_blank");if(!win)return toast("El navegador bloqueó la ventana. Permite ventanas emergentes para guardar el PDF.",true);try{win.opener=null}catch{}
  const summary=p.summary||{};
  const sections=(p.sections||[]).map((sec,i)=>`<section><h2>${i+1}. ${escapeHtml(sec.title||"")}</h2>${renderStudyParagraphs(sec.content||"")}${sec.key_points?.length?`<h3>Puntos clave</h3><ul>${sec.key_points.map(x=>`<li>${escapeHtml(x)}</li>`).join("")}</ul>`:""}${sec.example?`<div class="box"><b>Ejemplo</b>${renderStudyParagraphs(sec.example)}</div>`:""}${sec.application?`<div class="box"><b>Aplicación</b>${renderStudyParagraphs(sec.application)}</div>`:""}</section>`).join("");
  const diagram=p.diagram&&p.diagram.steps?.length?p.diagram:{title:"Secuencia esencial del tema",steps:(p.sections||[]).slice(0,6).map(x=>({label:x.title,detail:(x.key_points||[]).slice(0,2).join(" · ")}))};
  const map=p.concept_map&&p.concept_map.branches?.length?p.concept_map:{center:p.title,branches:(p.sections||[]).slice(0,6).map(x=>({label:x.title,children:(x.key_points||[]).slice(0,3)}))};
  const videos=courseVideoRecommendations(s,item);

  const diagramHtml=`<section class="visual"><h2>Diagrama del tema</h2><h3>${escapeHtml(diagram.title||"")}</h3><div class="flow">${(diagram.steps||[]).map((x,i)=>`<div><b>${i+1}. ${escapeHtml(x.label||"")}</b><span>${escapeHtml(x.detail||"")}</span></div>${i<(diagram.steps||[]).length-1?`<em>→</em>`:""}`).join("")}</div></section>`;
  const mapHtml=`<section class="visual"><h2>Mapa conceptual</h2><div class="mapcenter">${escapeHtml(map.center||p.title||"")}</div><div class="mapbranches">${(map.branches||[]).map(b=>`<div><b>${escapeHtml(b.label||"")}</b><ul>${(b.children||[]).map(x=>`<li>${escapeHtml(x)}</li>`).join("")}</ul></div>`).join("")}</div></section>`;
  const videoHtml=`<section><h2>Videos complementarios</h2><p>Estos enlaces abren búsquedas del tema en YouTube. Requieren internet.</p><ul>${videos.map(v=>`<li><b>${escapeHtml(v.source)}:</b> ${escapeHtml(v.query)} — ${escapeHtml(v.url)}</li>`).join("")}</ul></section>`;

  const doc=`<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(p.title||item.topic_name)}</title><style>@page{margin:18mm}body{font-family:Arial,'Noto Sans',sans-serif;color:#17212b;line-height:1.58;font-size:11pt}header{border-bottom:2px solid #168c75;padding-bottom:12px;margin-bottom:20px}.brand{font-size:9pt;letter-spacing:.12em;color:#168c75;font-weight:bold}h1{font-size:25pt;margin:6px 0}h2{font-size:16pt;margin-top:24px;color:#153f47}h3{font-size:11pt;color:#168c75}p{margin:7px 0}li{margin:4px 0}.objectives,.box,.summary,.visual{background:#f5f8f8;border-left:3px solid #168c75;padding:10px 13px;margin:12px 0}.meta{color:#5c6872;font-size:9pt}.terms span{display:inline-block;border:1px solid #ccd6da;border-radius:12px;padding:4px 7px;margin:3px;font-size:9pt}.flow{display:flex;align-items:stretch;gap:5px;flex-wrap:wrap}.flow>div{border:1px solid #cad6da;background:white;padding:8px;min-width:110px;flex:1}.flow span,.flow b{display:block}.flow span{font-size:9pt;margin-top:4px;color:#52616b}.flow em{align-self:center;color:#168c75;font-weight:bold}.mapcenter{text-align:center;background:#153f47;color:white;padding:9px;font-weight:bold}.mapbranches{display:grid;grid-template-columns:repeat(2,1fr);gap:6px;margin-top:7px}.mapbranches>div{background:white;border:1px solid #cad6da;padding:8px}footer{margin-top:24px;padding-top:10px;border-top:1px solid #ccd6da;color:#69767f;font-size:8pt}@media print{button{display:none}}</style></head><body><header><div class="brand">MED AI DALTON · MATERIAL MULTIMEDIA DE ESTUDIO</div><h1>${escapeHtml(p.title||item.topic_name)}</h1><div class="meta">Materia: ${escapeHtml(s.name)} · Tema ${item.index+1} de ${state.currentCourse.total} · ${new Date().toLocaleDateString("es-GT")}</div><p>${escapeHtml(p.overview||"")}</p></header><div class="objectives"><h3>Objetivos</h3><ul>${(p.objectives||[]).map(x=>`<li>${escapeHtml(x)}</li>`).join("")}</ul></div>${sections}${diagramHtml}${mapHtml}${p.key_terms?.length?`<section class="terms"><h2>Conceptos clave</h2>${p.key_terms.map(x=>`<span>${escapeHtml(x)}</span>`).join("")}</section>`:""}<section class="summary"><h2>Resumen de la lección</h2><p>${escapeHtml(summary.overview||"")}</p><h3>Debes recordar</h3><ul>${(summary.must_remember||[]).map(x=>`<li>${escapeHtml(x)}</li>`).join("")}</ul></section>${videoHtml}<footer>Material educativo generado en MED AI DALTON. Los videos son recursos web complementarios y su disponibilidad depende de terceros. Para guardar este documento selecciona “Guardar como PDF” en el cuadro de impresión.</footer><script>window.onload=()=>setTimeout(()=>window.print(),250)<\/script></body></html>`;
  win.document.open();win.document.write(doc);win.document.close();
}


/* ============================================================
   V21 · UNIVERSITY SOURCE STUDIO
   Import once -> save study pack -> revisit without re-inference
   ============================================================ */

async function refreshUniversitySourceCount(){
  const item=state.currentLesson;if(!item)return;
  const data=await api(`/api/course/sources?topic_id=${encodeURIComponent(item.topic_id)}`);
  state.universitySources=data.sources||[];
  const el=$("#university-source-count");
  if(el)el.textContent=`${state.universitySources.length} guardado${state.universitySources.length===1?"":"s"}`;
}

function ensureUniversityOverlay(){
  let overlay=$("#university-source-overlay");
  if(overlay)return overlay;
  overlay=document.createElement("div");
  overlay.id="university-source-overlay";
  overlay.className="university-source-overlay hidden";
  overlay.innerHTML=`<div class="university-source-shell">
    <header class="university-source-shell-head">
      <div><span>MED AI · UNIVERSITY SOURCE STUDIO</span><strong id="uni-shell-title">Mis materiales universitarios</strong></div>
      <button id="close-university-source" class="university-close-btn" aria-label="Cerrar">×</button>
    </header>
    <main id="university-source-body"></main>
  </div>`;
  document.body.appendChild(overlay);
  $("#close-university-source",overlay).onclick=closeUniversitySourceStudio;
  overlay.addEventListener("click",e=>{if(e.target===overlay)closeUniversitySourceStudio()});
  return overlay;
}

async function openUniversitySourceStudio(){
  const overlay=ensureUniversityOverlay();
  overlay.classList.remove("hidden");
  document.body.classList.add("modal-open");
  $("#uni-shell-title").textContent=`${state.currentSubject?.name||"Materia"} · ${state.currentLesson?.topic_name||"Tema"}`;
  $("#university-source-body").innerHTML=`<div class="university-loading"><div class="v17-loading-orb"><i></i><i></i><i></i></div><strong>Cargando tus materiales…</strong></div>`;
  try{
    await refreshUniversitySourceCount();
    renderUniversitySourceLibrary();
  }catch(err){
    $("#university-source-body").innerHTML=`<div class="masterclass-error"><strong>No pude cargar tus materiales.</strong><p>${escapeHtml(err.message)}</p></div>`;
  }
}

function closeUniversitySourceStudio(){
  $("#university-source-overlay")?.classList.add("hidden");
  document.body.classList.remove("modal-open");
  state.universitySourcePack=null;
  state.universitySourceRecord=null;
  state.universityPractice=null;
  state.universityExam=null;
}

function sourceTypeLabel(type){
  return ({pdf:"PDF",text:"TEXTO",video:"VIDEO",youtube:"YOUTUBE"}[type]||"MATERIAL");
}
function sourceTypeIcon(type){
  return ({pdf:"▤",text:"¶",video:"▶",youtube:"▷"}[type]||"◆");
}

function renderUniversitySourceLibrary(){
  const body=$("#university-source-body"),items=state.universitySources||[];
  body.innerHTML=`
    <section class="university-library-hero">
      <div>
        <div class="eyebrow">APRENDE DESDE LO QUE TE DAN EN LA UNIVERSIDAD</div>
        <h2>Convierte tus materiales en clases reutilizables.</h2>
        <p>MED AI analiza cada material una sola vez con Gemini 2.5 Flash, guarda el resultado en tu cuenta y luego puedes repasarlo sin regenerar la clase.</p>
      </div>
      <button id="university-new-source" class="university-import-btn"><span>＋</span><div><strong>AGREGAR MATERIAL</strong><small>PDF · texto · video · YouTube</small></div></button>
    </section>
    <section class="university-saving-strip">
      <div><span>⚡</span><strong>1 análisis inicial</strong><small>La IA procesa el material al importarlo.</small></div>
      <div><span>☁</span><strong>Clase guardada</strong><small>Resumen, mapa, ejercicios y examen quedan en D1.</small></div>
      <div><span>↻</span><strong>Repaso sin regenerar</strong><small>Volver a abrir el material no gasta IA.</small></div>
    </section>
    <section class="university-library-section">
      <div class="university-library-heading"><div><span>MATERIALES DEL TEMA</span><h3>${escapeHtml(state.currentLesson?.topic_name||"")}</h3></div><strong>${items.length}</strong></div>
      <div class="university-source-list">
        ${items.length?items.map(src=>{
          const meta=safeJson(src.metadata_json,{});
          return `<article class="university-source-item">
            <div class="university-source-icon ${escapeAttr(meta.source_type||"text")}">${sourceTypeIcon(meta.source_type)}</div>
            <div class="university-source-info">
              <span>${sourceTypeLabel(meta.source_type)} · ${formatDate(src.updated_at)}</span>
              <strong>${escapeHtml(meta.source_name||src.title||"Material universitario")}</strong>
              <small>${escapeHtml(meta.source_detail||"Clase de estudio guardada")}</small>
            </div>
            <div class="university-source-actions">
              <button class="primary-btn university-open-saved" data-id="${escapeAttr(src.id)}">ESTUDIAR</button>
              <button class="ghost-btn university-delete-saved" data-id="${escapeAttr(src.id)}">ELIMINAR</button>
            </div>
          </article>`;
        }).join(""):`<div class="university-empty">
          <div class="university-empty-art"><span>▤</span><span>▶</span><span>¶</span></div>
          <strong>Aún no has agregado material para este tema.</strong>
          <p>Cuando recibas una guía, PDF, presentación convertida a PDF, texto o video de tu universidad, agrégalo aquí y MED AI lo transformará en una clase de repaso.</p>
        </div>`}
      </div>
    </section>`;
  $("#university-new-source").onclick=renderUniversityImportForm;
  $$(".university-open-saved",body).forEach(btn=>btn.onclick=()=>openSavedUniversitySource(btn.dataset.id));
  $$(".university-delete-saved",body).forEach(btn=>btn.onclick=()=>deleteUniversitySource(btn.dataset.id));
}

function renderUniversityImportForm(){
  const body=$("#university-source-body");
  body.innerHTML=`
    <section class="university-import-page">
      <button id="uni-back-library" class="ghost-btn">← MIS MATERIALES</button>
      <div class="university-import-head">
        <div><span>NUEVO MATERIAL</span><h2>¿Qué te dieron en la universidad?</h2><p>Elige una fuente. MED AI la convertirá en un paquete de estudio que quedará guardado.</p></div>
        <div class="university-credit-badge"><b>⚡</b><span><strong>MODO AHORRO</strong><small>Usa Flash para importar</small></span></div>
      </div>

      <div class="university-source-tabs">
        <button class="university-source-tab active" data-type="pdf"><span>▤</span><b>PDF</b><small>Guías y lecturas</small></button>
        <button class="university-source-tab" data-type="text"><span>¶</span><b>TEXTO</b><small>Apuntes y copias</small></button>
        <button class="university-source-tab" data-type="video"><span>▶</span><b>VIDEO</b><small>Archivo corto</small></button>
        <button class="university-source-tab" data-type="youtube"><span>▷</span><b>YOUTUBE</b><small>Clase pública</small></button>
      </div>

      <div class="university-import-grid">
        <div class="university-import-main">
          <div class="field"><label>Título para identificarlo</label><input id="uni-source-name" placeholder="Ej. Clase 3 — Sistema renina angiotensina"></div>

          <div id="uni-input-pdf" class="uni-source-input">
            <label class="university-file-drop" for="uni-pdf-file">
              <input id="uni-pdf-file" type="file" accept="application/pdf,.pdf" hidden>
              <span>▤</span><strong>SELECCIONAR PDF</strong><small>Máximo recomendado: 10 MB</small>
              <em id="uni-pdf-name">Ningún archivo seleccionado</em>
            </label>
          </div>

          <div id="uni-input-text" class="uni-source-input hidden">
            <div class="field"><label>Pega tus apuntes o texto de la clase</label><textarea id="uni-source-text" rows="14" placeholder="Pega aquí el material que te dieron, tus apuntes, una transcripción o el contenido que deseas estudiar..."></textarea><small>El texto se usa para preparar el material y se guarda únicamente como referencia resumida dentro de la clase.</small></div>
          </div>

          <div id="uni-input-video" class="uni-source-input hidden">
            <label class="university-file-drop video" for="uni-video-file">
              <input id="uni-video-file" type="file" accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov" hidden>
              <span>▶</span><strong>SELECCIONAR VIDEO CORTO</strong><small>MP4 / WebM / MOV · máximo 10 MB</small>
              <em id="uni-video-name">Ningún archivo seleccionado</em>
            </label>
            <div class="university-import-note"><b>¿Es una grabación larga?</b><span>Para no enviar un archivo enorme, súbela a YouTube como video público o utiliza la transcripción de la clase.</span></div>
          </div>

          <div id="uni-input-youtube" class="uni-source-input hidden">
            <div class="field"><label>Enlace público de YouTube</label><input id="uni-source-youtube" type="url" placeholder="https://www.youtube.com/watch?v=..."></div>
            <div class="university-import-note"><b>Importante</b><span>Debe ser un video público. Los videos privados o no listados pueden no estar disponibles para el análisis automático.</span></div>
          </div>

          <div class="university-import-options">
            <label class="form-check"><input id="uni-focus-exam" type="checkbox" checked><span>Destacar lo que probablemente pueda evaluarse</span></label>
            <label class="form-check"><input id="uni-focus-deep" type="checkbox" checked><span>Agregar explicaciones para entender, no solo memorizar</span></label>
          </div>

          <button id="uni-analyze-source" class="university-analyze-btn"><span>✦</span><div><strong>CREAR CLASE DESDE ESTE MATERIAL</strong><small>Un análisis inicial · después queda guardada</small></div></button>
        </div>

        <aside class="university-import-preview">
          <span>MED AI CREARÁ Y GUARDARÁ</span>
          <div><b>01</b><strong>Resumen fiel</strong><small>Qué dice realmente el material</small></div>
          <div><b>02</b><strong>Clase organizada</strong><small>Del concepto básico a la aplicación</small></div>
          <div><b>03</b><strong>Diagrama + mapa</strong><small>Relaciones visuales</small></div>
          <div><b>04</b><strong>8 ejercicios</strong><small>Práctica sin gastar IA después</small></div>
          <div><b>05</b><strong>Examen de 10</strong><small>Autoevaluación reutilizable</small></div>
          <div><b>06</b><strong>Videos para ampliar</strong><small>Búsquedas sugeridas por tema</small></div>
          <div class="university-import-preview-foot">La clase original de MED AI permanece intacta. Este material se agrega como una fuente adicional de estudio.</div>
        </aside>
      </div>
    </section>`;

  let activeType="pdf";
  $("#uni-back-library").onclick=renderUniversitySourceLibrary;
  $$(".university-source-tab").forEach(btn=>btn.onclick=()=>{
    activeType=btn.dataset.type;
    $$(".university-source-tab").forEach(x=>x.classList.toggle("active",x===btn));
    $$(".uni-source-input").forEach(x=>x.classList.add("hidden"));
    $(`#uni-input-${activeType}`).classList.remove("hidden");
  });
  $("#uni-pdf-file").onchange=e=>$("#uni-pdf-name").textContent=e.target.files?.[0]?.name||"Ningún archivo seleccionado";
  $("#uni-video-file").onchange=e=>$("#uni-video-name").textContent=e.target.files?.[0]?.name||"Ningún archivo seleccionado";
  $("#uni-analyze-source").onclick=()=>importUniversitySource(activeType);
}

function readFileAsDataUrl(file){
  return new Promise((resolve,reject)=>{
    const reader=new FileReader();
    reader.onload=()=>resolve(String(reader.result||""));
    reader.onerror=()=>reject(new Error("No pude leer el archivo."));
    reader.readAsDataURL(file);
  });
}
async function importUniversitySource(type){
  if(!navigator.onLine)return toast("Necesitas internet únicamente para el análisis inicial del material.",true);
  const item=state.currentLesson,s=state.currentSubject;
  if(!item||!s)return toast("Abre primero un tema del curso.",true);

  const btn=$("#uni-analyze-source");
  const explicitName=$("#uni-source-name").value.trim();
  const payload={
    subject_id:s.id,topic_id:item.topic_id,lesson_id:item.lesson_id,
    source_type:type,
    source_name:explicitName,
    language:s.code==="LANG"?state.courseLanguage:null,
    exam_focus:$("#uni-focus-exam").checked,
    deep_explanation:$("#uni-focus-deep").checked
  };

  try{
    if(type==="pdf"||type==="video"){
      const file=type==="pdf"?$("#uni-pdf-file").files?.[0]:$("#uni-video-file").files?.[0];
      if(!file)throw new Error(`Selecciona un ${type==="pdf"?"PDF":"video"}.`);
      const limit=10*1024*1024;
      if(file.size>limit)throw new Error("Este archivo supera 10 MB. Para videos largos usa YouTube o pega una transcripción. Para PDF muy grande, divídelo por unidades o capítulos.");
      payload.source_name=explicitName||file.name;
      payload.mime_type=file.type||(type==="pdf"?"application/pdf":"video/mp4");
      payload.size_bytes=file.size;
      const dataUrl=await readFileAsDataUrl(file);
      payload.data_base64=dataUrl.split(",")[1]||"";
    }else if(type==="text"){
      const text=$("#uni-source-text").value.trim();
      if(text.length<80)throw new Error("Pega un poco más de contenido para poder preparar una clase útil.");
      payload.source_name=explicitName||"Apuntes universitarios";
      payload.text=text.slice(0,120000);
      payload.size_bytes=new Blob([payload.text]).size;
    }else if(type==="youtube"){
      const url=$("#uni-source-youtube").value.trim();
      if(!/^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//i.test(url))throw new Error("Pega un enlace válido y público de YouTube.");
      payload.source_name=explicitName||"Video de clase";
      payload.url=url;
    }

    btn.disabled=true;
    btn.innerHTML=`<span class="university-spin">✦</span><div><strong>ANALIZANDO TU MATERIAL…</strong><small>Resumen → clase → mapa → práctica → examen</small></div>`;
    const body=$("#university-source-body");
    const progress=document.createElement("div");
    progress.className="university-analysis-progress";
    progress.innerHTML=`<div><i></i></div><span>Gemini 2.5 Flash está leyendo el material. Esta es la parte que usa IA; el resultado quedará guardado.</span>`;
    btn.after(progress);

    const result=await api("/api/course/source-import",{method:"POST",body:payload});
    await refreshUniversitySourceCount();
    await openSavedUniversitySource(result.id,true);
    toast("Clase universitaria preparada y guardada.");
  }catch(err){
    toast(err.message,true);
    btn.disabled=false;
    btn.innerHTML=`<span>✦</span><div><strong>CREAR CLASE DESDE ESTE MATERIAL</strong><small>Un análisis inicial · después queda guardada</small></div>`;
    $(".university-analysis-progress")?.remove();
  }
}

async function openSavedUniversitySource(id,justCreated=false){
  const body=$("#university-source-body");
  body.innerHTML=`<div class="university-loading"><div class="v17-loading-orb"><i></i><i></i><i></i></div><strong>${justCreated?"Abriendo la clase que acabamos de crear…":"Abriendo clase guardada…"}</strong><small>No se está regenerando con IA.</small></div>`;
  try{
    const data=await api(`/api/course/source?id=${encodeURIComponent(id)}`);
    state.universitySourceRecord=data.source;
    state.universitySourcePack=data.pack;
    state.universityPractice=null;
    state.universityExam=null;
    renderUniversityStudyPack("summary");
  }catch(err){
    body.innerHTML=`<div class="masterclass-error"><strong>No pude abrir esta clase.</strong><p>${escapeHtml(err.message)}</p><button id="uni-back-after-error" class="secondary-btn">VOLVER</button></div>`;
    $("#uni-back-after-error").onclick=renderUniversitySourceLibrary;
  }
}

function renderUniversityStudyPack(tab="summary"){
  const p=state.universitySourcePack,src=state.universitySourceRecord;
  if(!p||!src)return;
  const meta=safeJson(src.metadata_json,{});
  const body=$("#university-source-body");
  body.innerHTML=`
    <section class="university-study-head">
      <button id="uni-study-back" class="ghost-btn">← MIS MATERIALES</button>
      <div class="university-study-title">
        <div class="university-source-icon ${escapeAttr(meta.source_type||"text")}">${sourceTypeIcon(meta.source_type)}</div>
        <div><span>${sourceTypeLabel(meta.source_type)} · CLASE GUARDADA</span><h2>${escapeHtml(p.title||meta.source_name||src.title)}</h2><p>${escapeHtml(p.overview||"")}</p></div>
      </div>
      <div class="university-study-actions"><button id="uni-print-source" class="secondary-btn">▣ GUARDAR PDF</button><span>☁ Guardada · abrir de nuevo no regenera</span></div>
    </section>
    <nav class="university-study-tabs">
      <button data-tab="summary" class="${tab==="summary"?"active":""}"><span>◎</span>RESUMEN</button>
      <button data-tab="lesson" class="${tab==="lesson"?"active":""}"><span>📖</span>CLASE</button>
      <button data-tab="diagram" class="${tab==="diagram"?"active":""}"><span>◈</span>DIAGRAMA</button>
      <button data-tab="map" class="${tab==="map"?"active":""}"><span>⌘</span>MAPA</button>
      <button data-tab="practice" class="${tab==="practice"?"active":""}"><span>✦</span>PRÁCTICA</button>
      <button data-tab="exam" class="${tab==="exam"?"active":""}"><span>✓</span>EXAMEN</button>
      <button data-tab="videos" class="${tab==="videos"?"active":""}"><span>▶</span>VIDEOS</button>
      <button data-tab="ask" class="${tab==="ask"?"active":""}"><span>?</span>PREGUNTAR</button>
    </nav>
    <main id="university-study-content" class="university-study-content"></main>`;
  $("#uni-study-back").onclick=renderUniversitySourceLibrary;
  $("#uni-print-source").onclick=printUniversitySourcePdf;
  $$(".university-study-tabs button").forEach(btn=>btn.onclick=()=>renderUniversityStudyPack(btn.dataset.tab));

  if(tab==="summary")renderUniversitySummary();
  if(tab==="lesson")renderUniversityLesson();
  if(tab==="diagram")renderUniversityDiagram();
  if(tab==="map")renderUniversityMap();
  if(tab==="practice")startUniversityPractice();
  if(tab==="exam")startUniversityExam();
  if(tab==="videos")renderUniversityVideos();
  if(tab==="ask")renderUniversitySourceChat();
}

function renderUniversitySummary(){
  const p=state.universitySourcePack,sm=p.summary||{};
  $("#university-study-content").innerHTML=`
    <article class="university-summary-view">
      <div class="university-summary-hero"><div><span>RESUMEN DEL MATERIAL</span><h3>${escapeHtml(p.title||"")}</h3><p>${escapeHtml(sm.overview||p.overview||"")}</p></div><div class="university-summary-score"><b>${Number(p.estimated_minutes||30)}</b><small>min de estudio</small></div></div>
      <div class="university-summary-grid">
        <section class="remember"><span>01</span><strong>Lo indispensable</strong><ul>${(sm.must_remember||[]).map(x=>`<li>${escapeHtml(x)}</li>`).join("")}</ul></section>
        <section class="exam"><span>02</span><strong>Probable evaluación</strong><ul>${(p.exam_focus||[]).map(x=>`<li>${escapeHtml(x)}</li>`).join("")}</ul></section>
        <section class="errors"><span>03</span><strong>Confusiones frecuentes</strong><ul>${(sm.common_errors||[]).map(x=>`<li>${escapeHtml(x)}</li>`).join("")}</ul></section>
        <section class="connect"><span>04</span><strong>Conexión con el curso</strong><p>${escapeHtml(sm.connection||"Este material complementa el tema actual.")}</p></section>
      </div>
      <section class="university-keyterms"><span>CONCEPTOS QUE DEBES PODER EXPLICAR</span><div>${(p.key_terms||[]).map(x=>`<b>${escapeHtml(x)}</b>`).join("")}</div></section>
      <footer class="university-summary-next"><div><strong>Ahora estudia la clase completa</strong><small>Después podrás practicar y examinarte sin volver a usar IA.</small></div><button id="uni-summary-to-lesson" class="primary-btn">IR A LA CLASE →</button></footer>
    </article>`;
  $("#uni-summary-to-lesson").onclick=()=>renderUniversityStudyPack("lesson");
}

function renderUniversityLesson(){
  const p=state.universitySourcePack;
  $("#university-study-content").innerHTML=`
    <article class="university-lesson-view">
      <aside class="academy-reading-nav university-reading-nav"><span>CONTENIDO</span>${(p.sections||[]).map((s,i)=>`<button data-sec="${i}"><b>${String(i+1).padStart(2,"0")}</b><small>${escapeHtml(s.title||"Sección")}</small></button>`).join("")}</aside>
      <div class="university-lesson-sections">
        <section class="university-objectives"><span>OBJETIVOS</span><ul>${(p.objectives||[]).map(x=>`<li>${escapeHtml(x)}</li>`).join("")}</ul></section>
        ${(p.sections||[]).map((sec,i)=>`<section id="uni-sec-${i}" class="academy-study-section university-study-section">
          <div class="masterclass-section-number">${String(i+1).padStart(2,"0")}</div>
          <div class="masterclass-section-content"><div class="academy-section-heading"><h2>${escapeHtml(sec.title||"")}</h2><button class="secondary-btn uni-listen-sec" data-sec="${i}">🔊 ESCUCHAR</button></div>
          <div class="masterclass-prose">${renderStudyParagraphs(sec.content||"")}</div>
          ${sec.key_points?.length?`<div class="masterclass-keypoints"><strong>Puntos clave</strong><ul>${sec.key_points.map(x=>`<li>${escapeHtml(x)}</li>`).join("")}</ul></div>`:""}
          ${sec.example?`<div class="masterclass-example"><span>EJEMPLO / APLICACIÓN</span>${renderStudyParagraphs(sec.example)}</div>`:""}
          </div></section>`).join("")}
      </div>
    </article>`;
  $$(".university-reading-nav button").forEach(btn=>btn.onclick=()=>$("#uni-sec-"+btn.dataset.sec)?.scrollIntoView({behavior:"smooth",block:"start"}));
  $$(".uni-listen-sec").forEach(btn=>btn.onclick=()=>{
    const sec=p.sections?.[Number(btn.dataset.sec)];
    if(sec)speakText(`${sec.title}. ${sec.content}`,state.currentSubject?.code==="LANG"?state.courseLanguage:"es-GT");
  });
}

function renderUniversityDiagram(){
  const p=state.universitySourcePack;
  $("#university-study-content").innerHTML=renderCourseDiagram(p.diagram,p.sections||[]);
  $$(".academy-diagram-step",$("#university-study-content")).forEach(step=>step.onclick=()=>{
    step.classList.toggle("selected");step.querySelector(".academy-diagram-detail")?.classList.toggle("open");
  });
}

function renderUniversityMap(){
  const p=state.universitySourcePack;
  $("#university-study-content").innerHTML=renderCourseConceptMap(p.concept_map,p);
  $$(".academy-map-branch",$("#university-study-content")).forEach(branch=>branch.onclick=()=>{
    if(branch.classList.contains("expanded"))branch.classList.remove("expanded");
    else{$$(".academy-map-branch",$("#university-study-content")).forEach(x=>x.classList.remove("expanded"));branch.classList.add("expanded")}
  });
}

function startUniversityPractice(){
  const p=state.universitySourcePack;
  state.universityPractice={index:0,score:0,answers:{},questions:(p.practice||[]).slice(0,8)};
  renderUniversityPracticeQuestion();
}
function renderUniversityPracticeQuestion(){
  const st=state.universityPractice,q=st?.questions?.[st.index],box=$("#university-study-content");
  if(!q){renderUniversityPracticeResult();return}
  box.innerHTML=`<section class="master-practice-shell university-practice-shell"><div class="master-practice-top"><span>PRÁCTICA DEL MATERIAL</span><div class="master-practice-progress"><i style="width:${Math.round(st.index/st.questions.length*100)}%"></i></div><span>${st.index+1} / ${st.questions.length}</span></div><div class="master-practice-card"><div class="master-practice-icon">?</div><div class="eyebrow">RECUPERACIÓN ACTIVA · NO CONSUME IA</div><h2>${escapeHtml(q.question||q.stem||"")}</h2>${q.context?`<p class="practice-context">${escapeHtml(q.context)}</p>`:""}<div class="master-practice-options">${(q.options||[]).map((o,i)=>`<button class="master-practice-option" data-i="${i}"><span>${String.fromCharCode(65+i)}</span><strong>${escapeHtml(o)}</strong></button>`).join("")}</div><div id="uni-practice-feedback" class="master-practice-feedback hidden"></div></div></section>`;
  $$(".master-practice-option",box).forEach(btn=>btn.onclick=()=>answerUniversityPractice(Number(btn.dataset.i)));
}
function answerUniversityPractice(choice){
  const st=state.universityPractice,q=st.questions[st.index];
  if(st.answers[st.index]!==undefined)return;
  st.answers[st.index]=choice;
  const correct=choice===Number(q.correctIndex);if(correct)st.score++;
  $$(".master-practice-option",$("#university-study-content")).forEach((b,i)=>{b.disabled=true;if(i===Number(q.correctIndex))b.classList.add("correct");if(i===choice&&!correct)b.classList.add("wrong")});
  const f=$("#uni-practice-feedback");f.classList.remove("hidden");f.innerHTML=`<div><strong>${correct?"✓ Correcto":"↻ Revisa esta idea"}</strong><p>${escapeHtml(q.explanation||"")}</p></div><button id="uni-practice-next" class="primary-btn">${st.index+1>=st.questions.length?"VER RESULTADO":"SIGUIENTE →"}</button>`;
  $("#uni-practice-next").onclick=()=>{st.index++;if(st.index>=st.questions.length)renderUniversityPracticeResult();else renderUniversityPracticeQuestion()};
}
function renderUniversityPracticeResult(){
  const st=state.universityPractice,pct=st.questions.length?Math.round(st.score/st.questions.length*100):0;
  $("#university-study-content").innerHTML=`<section class="master-stage-complete"><div class="master-stage-check">✓</div><div class="eyebrow">PRÁCTICA TERMINADA · SIN IA ADICIONAL</div><h2>${st.score} de ${st.questions.length} correctas</h2><p>${pct>=75?"Buen dominio del material. Puedes ir al examen de repaso.":"Conviene volver al resumen o a la clase antes del examen."}</p><div class="master-result-meter"><i style="width:${pct}%"></i></div><div class="master-stage-actions"><button id="uni-practice-review" class="secondary-btn">REPASAR CLASE</button><button id="uni-practice-exam" class="primary-btn">EXAMEN DE 10 →</button></div></section>`;
  $("#uni-practice-review").onclick=()=>renderUniversityStudyPack("lesson");
  $("#uni-practice-exam").onclick=()=>renderUniversityStudyPack("exam");
}

function startUniversityExam(){
  const p=state.universitySourcePack;
  state.universityExam={questions:(p.exam||[]).slice(0,10),answers:{},current:0,started_at:new Date().toISOString()};
  if(state.universityExam.questions.length<10){
    $("#university-study-content").innerHTML=`<div class="masterclass-error"><strong>Esta clase guardada no contiene 10 preguntas completas.</strong><p>Puedes seguir usando resumen, clase y práctica.</p></div>`;return;
  }
  renderUniversityExamQuestion();
}
function renderUniversityExamQuestion(){
  const e=state.universityExam,i=e.current,q=e.questions[i],selected=e.answers[`q${i}`],box=$("#university-study-content");
  box.innerHTML=`<section class="master-exam-shell"><div class="master-exam-head"><div><div class="eyebrow">EXAMEN DE REPASO · MATERIAL UNIVERSITARIO</div><strong>${escapeHtml(state.universitySourcePack?.title||"")}</strong></div><span>${i+1} / 10</span></div><div class="master-exam-progress"><i style="width:${i*10}%"></i></div><article class="master-exam-question"><div class="master-exam-number">${String(i+1).padStart(2,"0")}</div><h2>${escapeHtml(q.stem||q.question||"")}</h2><div class="master-exam-options">${(q.options||[]).map((op,j)=>`<button class="master-exam-option ${selected===j?"selected":""}" data-i="${j}"><span>${String.fromCharCode(65+j)}</span><strong>${escapeHtml(op)}</strong></button>`).join("")}</div></article><footer class="master-exam-footer"><button id="uni-exam-review" class="ghost-btn">← RESUMEN</button><button id="uni-exam-next" class="primary-btn" ${selected===undefined?"disabled":""}>${i===9?"CALIFICAR":"SIGUIENTE →"}</button></footer></section>`;
  $$(".master-exam-option",box).forEach(btn=>btn.onclick=()=>{e.answers[`q${i}`]=Number(btn.dataset.i);renderUniversityExamQuestion()});
  $("#uni-exam-review").onclick=()=>renderUniversityStudyPack("summary");
  $("#uni-exam-next").onclick=()=>{if(e.answers[`q${i}`]===undefined)return;if(i<9){e.current++;renderUniversityExamQuestion()}else finishUniversityExam()};
}
async function finishUniversityExam(){
  const e=state.universityExam;let score=0;
  e.questions.forEach((q,i)=>{if(e.answers[`q${i}`]===Number(q.correctIndex))score++});
  const pct=score*10,passed=score>=8;
  await api("/api/exams/record",{method:"POST",body:{title:`Repaso universitario · ${state.universitySourcePack?.title||state.currentLesson?.topic_name}`,settings:{university_source:true,source_id:state.universitySourceRecord?.id,topic_id:state.currentLesson?.topic_id,question_count:10},started_at:e.started_at,score,max_score:10,percentage:pct,questions:e.questions,answers:e.answers}}).catch(()=>{});
  const review=e.questions.map((q,i)=>{const chosen=e.answers[`q${i}`],ok=chosen===Number(q.correctIndex);return `<details class="master-exam-review ${ok?"correct":"wrong"}"><summary><span>${ok?"✓":"×"} Pregunta ${i+1}</span><strong>${escapeHtml(q.stem||q.question||"")}</strong></summary><div><p><b>Tu respuesta:</b> ${escapeHtml(q.options?.[chosen]||"Sin respuesta")}</p><p><b>Correcta:</b> ${escapeHtml(q.options?.[q.correctIndex]||"")}</p><p>${escapeHtml(q.explanation||"")}</p></div></details>`}).join("");
  $("#university-study-content").innerHTML=`<section class="master-exam-result"><div class="master-result-badge ${passed?"passed":"failed"}">${passed?"✓":"↻"}</div><div class="eyebrow">RESULTADO DEL REPASO</div><h1>${score} / 10 · ${pct}%</h1><p>${passed?"Dominaste bien este material universitario. Puedes repetirlo cuando quieras sin regenerarlo.":"Revisa las respuestas, vuelve a la clase y repite el examen cuando quieras."}</p><div class="master-exam-review-list">${review}</div><div class="master-stage-actions"><button id="uni-result-summary" class="secondary-btn">RESUMEN</button><button id="uni-result-repeat" class="primary-btn">REPETIR EXAMEN</button></div></section>`;
  $("#uni-result-summary").onclick=()=>renderUniversityStudyPack("summary");
  $("#uni-result-repeat").onclick=()=>renderUniversityStudyPack("exam");
}

function renderUniversityVideos(){
  const p=state.universitySourcePack,searches=p.video_searches||[];
  $("#university-study-content").innerHTML=`<section class="academy-visual-panel university-video-hub">
    <header class="academy-resource-head"><div><span>VIDEOS PARA AMPLIAR</span><h2>Continúa aprendiendo el mismo tema</h2><p>Estas búsquedas fueron preparadas cuando importaste el material; abrirlas después no vuelve a gastar IA.</p></div><div class="academy-resource-icon video">▶</div></header>
    <div class="academy-video-grid">${searches.map((v,i)=>{
      const query=typeof v==="string"?v:(v.query||"");
      const why=typeof v==="string"?"Recurso complementario":(v.why||"");
      const url=`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
      return `<article class="academy-video-card"><div class="academy-video-thumb thumb-${i%4}"><span>▶</span><small>BÚSQUEDA EDUCATIVA</small></div><div class="academy-video-copy"><span>${escapeHtml(v.channel_hint||"YouTube")}</span><h3>${escapeHtml(query)}</h3><p>${escapeHtml(why)}</p><button class="primary-btn uni-video-search" data-url="${escapeAttr(url)}">BUSCAR VIDEOS →</button></div></article>`;
    }).join("")}</div>
    <div class="academy-embed-box"><div><span>REPRODUCTOR</span><strong>Ver un video sin salir de la clase</strong><p>Pega un enlace de YouTube que hayas elegido.</p></div><div class="academy-video-loader"><input id="uni-video-player-url" type="url" placeholder="https://www.youtube.com/watch?v=..."><button id="uni-load-player" class="secondary-btn">CARGAR VIDEO</button></div><div id="uni-video-player" class="academy-video-player"><div><b>▶</b><span>El video aparecerá aquí.</span></div></div></div>
  </section>`;
  $$(".uni-video-search").forEach(btn=>btn.onclick=()=>window.open(btn.dataset.url,"_blank","noopener,noreferrer"));
  $("#uni-load-player").onclick=()=>{
    const id=extractYoutubeId($("#uni-video-player-url").value);
    if(!id)return toast("Pega un enlace válido de YouTube.",true);
    $("#uni-video-player").innerHTML=`<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?rel=0" title="Video educativo" loading="lazy" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`;
  };
}

function renderUniversitySourceChat(){
  const p=state.universitySourcePack;
  $("#university-study-content").innerHTML=`<section class="university-source-chat">
    <div class="university-source-chat-info"><div class="v17-mascot nova-mascot small"><span class="mascot-ear left"></span><span class="mascot-ear right"></span><div class="mascot-head"><i class="mascot-eye left"></i><i class="mascot-eye right"></i><b class="mascot-mouth"></b></div><div class="mascot-body"><span>?</span></div></div><div><span>PREGUNTAR AL MATERIAL</span><h3>Usa IA solamente cuando necesites una explicación adicional</h3><p>MED AI no vuelve a cargar el PDF o video completo: utiliza el resumen estructurado que ya quedó guardado, reduciendo mucho el contexto enviado.</p></div></div>
    <div id="uni-source-chat-messages" class="messages"><div class="message ai">Pregunta algo específico sobre <b>${escapeHtml(p.title||"este material")}</b>. Intentaré responder basándome primero en la clase guardada.</div></div>
    <div class="composer"><textarea id="uni-source-chat-input" rows="2" placeholder="Ej. No entendí esta relación. Explícamela con otro ejemplo..."></textarea><button id="uni-source-chat-send" class="primary-btn">PREGUNTAR</button></div>
  </section>`;
  $("#uni-source-chat-send").onclick=sendUniversitySourceQuestion;
  $("#uni-source-chat-input").addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendUniversitySourceQuestion()}});
}
async function sendUniversitySourceQuestion(){
  const input=$("#uni-source-chat-input"),q=input.value.trim();if(!q)return;
  appendMessageTo("#uni-source-chat-messages","user",q);input.value="";
  const target=appendMessageTo("#uni-source-chat-messages","ai","Consultando la clase guardada…");target.classList.add("loading");
  try{
    const r=await api("/api/course/source-chat",{method:"POST",body:{source_id:state.universitySourceRecord.id,question:q}});
    target.classList.remove("loading");setMessageContent(target,"ai",r.answer||"No pude responder.");
  }catch(err){target.classList.remove("loading");setMessageContent(target,"ai",`Error: ${err.message}`)}
}

async function deleteUniversitySource(id){
  if(!confirm("¿Eliminar esta clase guardada? El archivo original no está almacenado en MED AI, por lo que tendrías que importarlo otra vez si deseas recuperarla."))return;
  try{
    await api(`/api/course/source?id=${encodeURIComponent(id)}`,{method:"DELETE"});
    await refreshUniversitySourceCount();
    renderUniversitySourceLibrary();
    toast("Material eliminado.");
  }catch(err){toast(err.message,true)}
}

function printUniversitySourcePdf(){
  const p=state.universitySourcePack,src=state.universitySourceRecord;
  if(!p||!src)return;
  const win=window.open("","_blank");if(!win)return toast("Permite ventanas emergentes para guardar el PDF.",true);try{win.opener=null}catch{}
  const sm=p.summary||{};
  const diagram=p.diagram||{};
  const cmap=p.concept_map||{};
  const sections=(p.sections||[]).map((s,i)=>`<section><h2>${i+1}. ${escapeHtml(s.title||"")}</h2>${renderStudyParagraphs(s.content||"")}${s.key_points?.length?`<h3>Puntos clave</h3><ul>${s.key_points.map(x=>`<li>${escapeHtml(x)}</li>`).join("")}</ul>`:""}${s.example?`<div class="box"><b>Ejemplo</b>${renderStudyParagraphs(s.example)}</div>`:""}</section>`).join("");
  const diagramHtml=`<section class="visual"><h2>Diagrama</h2><h3>${escapeHtml(diagram.title||"")}</h3><div class="flow">${(diagram.steps||[]).map((x,i)=>`<div><b>${i+1}. ${escapeHtml(x.label||"")}</b><span>${escapeHtml(x.detail||"")}</span></div>`).join("")}</div></section>`;
  const mapHtml=`<section class="visual"><h2>Mapa conceptual</h2><div class="center">${escapeHtml(cmap.center||p.title||"")}</div><div class="branches">${(cmap.branches||[]).map(b=>`<div><b>${escapeHtml(b.label||"")}</b><ul>${(b.children||[]).map(x=>`<li>${escapeHtml(x)}</li>`).join("")}</ul></div>`).join("")}</div></section>`;
  const doc=`<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(p.title||"Clase universitaria")}</title><style>@page{margin:17mm}body{font-family:Arial,sans-serif;color:#17212b;line-height:1.58;font-size:11pt}header{border-bottom:2px solid #168c75;padding-bottom:11px}.brand{font-size:8pt;letter-spacing:.13em;color:#168c75;font-weight:bold}h1{font-size:24pt;margin:6px 0}h2{font-size:16pt;color:#173e47;margin-top:22px}h3{font-size:11pt;color:#168c75}.box,.visual,.summary{background:#f5f8f8;border-left:3px solid #168c75;padding:10px 12px;margin:10px 0}.flow,.branches{display:grid;grid-template-columns:repeat(2,1fr);gap:6px}.flow>div,.branches>div{background:white;border:1px solid #d5dfe2;padding:8px}.flow b,.flow span{display:block}.flow span{font-size:9pt;margin-top:4px}.center{text-align:center;background:#173e47;color:white;padding:9px;font-weight:bold;margin-bottom:7px}.terms span{display:inline-block;border:1px solid #ccd6da;border-radius:12px;padding:4px 7px;margin:3px;font-size:9pt}footer{margin-top:24px;border-top:1px solid #ccd6da;padding-top:8px;color:#64737c;font-size:8pt}</style></head><body><header><div class="brand">MED AI DALTON · MATERIAL UNIVERSITARIO GUARDADO</div><h1>${escapeHtml(p.title||"")}</h1><p>${escapeHtml(p.overview||"")}</p></header><section class="summary"><h2>Resumen</h2><p>${escapeHtml(sm.overview||"")}</p><h3>Lo indispensable</h3><ul>${(sm.must_remember||[]).map(x=>`<li>${escapeHtml(x)}</li>`).join("")}</ul></section>${sections}${diagramHtml}${mapHtml}<section class="terms"><h2>Conceptos clave</h2>${(p.key_terms||[]).map(x=>`<span>${escapeHtml(x)}</span>`).join("")}</section><footer>Clase preparada a partir de material proporcionado por el estudiante. El archivo original no se incrusta en este PDF. Verifica detalles académicos con el material original y las indicaciones de tu docente.</footer><script>window.onload=()=>setTimeout(()=>window.print(),250)<\/script></body></html>`;
  win.document.open();win.document.write(doc);win.document.close();
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
  const langLevel=$("#lang-level")?.value||"A1 — Principiante";
  const offlineKey=languageOfflinePackKey(state.courseLanguage,item.topic_name,langLevel);
  try{
    pack=await offlineGetJson(offlineKey);
    if(!pack){
      if(!navigator.onLine)throw new Error("offline");
      pack=await api("/api/language/lesson-pack",{method:"POST",body:{
        language:state.courseLanguage,
        topic:item.topic_name,
        level:langLevel,
        practice_first:practiceFirst
      }});
      await offlinePutJson(offlineKey,pack);
    }
  }catch(err){
    pack=buildV17FallbackLesson(item.topic_name);
    toast("Usando una lección local de respaldo para no interrumpir el estudio.",false);
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


/* ============================================================
   V29 · PERMANENT QUESTION BANK + ADAPTIVE EXAM
   ============================================================ */

async function renderQuestionBank(){
  root.innerHTML=`<div class="system-center-loading"><div class="v17-loading-orb"><i></i><i></i><i></i></div><strong>Abriendo tu banco permanente…</strong><small>Las preguntas guardadas se reutilizan sin generar IA nueva.</small></div>`;
  try{
    const d=await api("/api/question-bank");
    state.questionBank=d.questions||[];
    const subjects=Object.entries(d.subjects||{}).sort((a,b)=>b[1]-a[1]);
    root.innerHTML=`
      <section class="question-bank-hero">
        <div>
          <div class="learning-home-chip"><span></span> BANCO PERMANENTE · V29</div>
          <h1>Tus buenas preguntas no se desperdician.</h1>
          <p>MED AI guarda automáticamente preguntas útiles de exámenes, claves históricas y clases transcritas. Puedes volver a practicarlas sin pagar otra generación.</p>
          <div class="question-bank-actions">
            <button id="qb-start-adaptive" class="primary-btn">▶ EXAMEN ADAPTATIVO</button>
            <button id="qb-go-exams" class="secondary-btn">＋ GENERAR PREGUNTAS NUEVAS</button>
          </div>
        </div>
        <aside><span>PREGUNTAS GUARDADAS</span><strong>${Number(d.total||0)}</strong><small>${subjects.slice(0,3).map(([s,n])=>`${escapeHtml(s)} ${n}`).join(" · ")||"El banco crecerá mientras estudias"}</small></aside>
      </section>

      <section class="qb-metrics">
        ${[1,2,3,4,5].map(level=>`<article><span>NIVEL ${level}</span><strong>${Number(d.by_difficulty?.[level]||0)}</strong><small>${["Fundamental","Básico","Intermedio","Avanzado","Desafío"][level-1]}</small></article>`).join("")}
      </section>

      <section class="card qb-filter-card">
        <div class="field"><label>Materia / tema</label><input id="qb-filter" placeholder="Ej. Química, ácido-base, cinemática..."></div>
        <div class="field"><label>Materia para examen adaptativo</label><input id="qb-adaptive-subject" list="qb-subject-list" placeholder="Ej. Química"><datalist id="qb-subject-list">${subjects.map(([s])=>`<option value="${escapeAttr(s)}"></option>`).join("")}</datalist></div>
        <div class="field"><label>Preguntas</label><select id="qb-adaptive-count"><option>10</option><option selected>20</option><option>30</option><option>40</option></select></div>
      </section>

      <section class="card">
        <div class="smart-section-head"><div><span>MI BANCO</span><h2>Preguntas disponibles</h2></div><small id="qb-visible-count">${state.questionBank.length} visibles</small></div>
        <div id="qb-list" class="qb-list">${renderQuestionBankList(state.questionBank)}</div>
      </section>`;
    $("#qb-go-exams").onclick=()=>navigate("exams");
    $("#qb-start-adaptive").onclick=startAdaptiveExamV29;
    $("#qb-filter").oninput=e=>{
      const q=e.target.value.trim().toLowerCase();
      const filtered=state.questionBank.filter(x=>`${x.subject||""} ${x.topic||""} ${x.stem||""}`.toLowerCase().includes(q));
      $("#qb-list").innerHTML=renderQuestionBankList(filtered);
      $("#qb-visible-count").textContent=`${filtered.length} visibles`;
      bindQuestionBankDelete();
    };
    bindQuestionBankDelete();
  }catch(err){
    root.innerHTML=`<div class="card masterclass-error"><strong>No pude abrir el banco.</strong><p>${escapeHtml(err.message)}</p></div>`;
  }
}
function renderQuestionBankList(rows){
  if(!rows?.length)return `<div class="system-empty">Aún no hay preguntas guardadas. Haz un examen o crea un paquete en Antes del parcial.</div>`;
  return rows.slice(0,250).map((q,i)=>`<article data-id="${escapeAttr(q.id)}"><span>${String(i+1).padStart(3,"0")}</span><div><strong>${escapeHtml(q.stem)}</strong><small>${escapeHtml(q.subject||"Sin materia")}${q.topic?` · ${escapeHtml(q.topic)}`:""} · dificultad ${Number(q.difficulty||2)}/5</small></div><b>${String.fromCharCode(65+Number(q.correctIndex||0))}</b><button class="qb-delete" data-id="${escapeAttr(q.id)}" title="Quitar del banco">×</button></article>`).join("");
}
function bindQuestionBankDelete(){
  $$(".qb-delete").forEach(b=>b.onclick=async e=>{
    e.stopPropagation();
    if(!confirm("¿Quitar esta pregunta de tu banco permanente?"))return;
    try{await api(`/api/question-bank?id=${encodeURIComponent(b.dataset.id)}`,{method:"DELETE"});state.questionBank=state.questionBank.filter(x=>x.id!==b.dataset.id);b.closest("article")?.remove();toast("Pregunta eliminada del banco.")}catch(err){toast(err.message,true)}
  });
}

async function startAdaptiveExamV29(){
  const subject=$("#qb-adaptive-subject")?.value.trim()||"",count=Number($("#qb-adaptive-count")?.value||20);
  try{
    root.innerHTML=`<div class="system-center-loading"><div class="v17-loading-orb"><i></i><i></i><i></i></div><strong>Preparando examen adaptativo…</strong><small>Seleccionando preguntas ya guardadas.</small></div>`;
    const d=await api(`/api/adaptive-exam/start?subject=${encodeURIComponent(subject)}&count=${count}`);
    state.adaptiveExam={pool:d.pool||[],target:Number(d.target_count||count),subject:d.subject||subject||"Mi banco",used:new Set(),answers:{},questions:[],index:0,level:2,streak:0,score:0,started_at:new Date().toISOString()};
    pickAdaptiveQuestionV29();
  }catch(err){toast(err.message,true);navigate("question_bank")}
}
function pickAdaptiveQuestionV29(){
  const st=state.adaptiveExam;if(!st)return;
  if(st.questions.length>=st.target){finishAdaptiveExamV29();return}
  const available=st.pool.filter(q=>!st.used.has(q.id));
  if(!available.length){finishAdaptiveExamV29();return}
  available.sort((a,b)=>Math.abs(Number(a.difficulty||2)-st.level)-Math.abs(Number(b.difficulty||2)-st.level));
  const closest=available.slice(0,Math.min(6,available.length));
  const q=closest[Math.floor(Math.random()*closest.length)];
  st.used.add(q.id);st.questions.push(q);st.index=st.questions.length-1;
  renderAdaptiveQuestionV29();
}
function renderAdaptiveQuestionV29(){
  const st=state.adaptiveExam,q=st.questions[st.index];
  root.innerHTML=`<section class="adaptive-exam-shell">
    <header><div><span>EXAMEN ADAPTATIVO · ${escapeHtml(st.subject)}</span><strong>Pregunta ${st.index+1} / ${st.target}</strong></div><div class="adaptive-level">NIVEL ACTUAL <b>${st.level}/5</b></div></header>
    <div class="master-exam-progress"><i style="width:${st.index/st.target*100}%"></i></div>
    <article class="answer-key-question adaptive-question">
      <div class="answer-key-question-meta"><span>DIFICULTAD ${Number(q.difficulty||2)}/5</span><b>${escapeHtml(q.topic||"Banco permanente")}</b></div>
      <h1>${escapeHtml(q.stem)}</h1>
      <div class="answer-key-options">${q.options.map((op,i)=>`<button data-i="${i}"><span>${String.fromCharCode(65+i)}</span><strong>${escapeHtml(op)}</strong></button>`).join("")}</div>
      <small class="adaptive-note">La dificultad del siguiente ítem se ajustará según tu respuesta.</small>
    </article>
  </section>`;
  $$(".answer-key-options button").forEach(b=>b.onclick=()=>answerAdaptiveV29(Number(b.dataset.i)));
}
function answerAdaptiveV29(choice){
  const st=state.adaptiveExam,q=st.questions[st.index],correct=choice===Number(q.correctIndex);
  st.answers[`q${st.index}`]=choice;
  if(correct){st.score++;st.streak++;if(st.streak>=2){st.level=Math.min(5,st.level+1);st.streak=0}}
  else{st.level=Math.max(1,st.level-1);st.streak=0}
  pickAdaptiveQuestionV29();
}
async function finishAdaptiveExamV29(){
  const st=state.adaptiveExam;if(!st)return;
  const total=st.questions.length,pct=Math.round(st.score/Math.max(1,total)*100);
  const topics={};
  st.questions.forEach((q,i)=>{
    const name=q.topic||"General";topics[name]??={right:0,total:0};topics[name].total++;
    if(Number(st.answers[`q${i}`])===Number(q.correctIndex))topics[name].right++;
  });
  try{
    await api("/api/exams/record",{method:"POST",body:{
      title:`Examen adaptativo · ${st.subject}`,score:st.score,max_score:total,percentage:pct,started_at:st.started_at,
      settings:{adaptive_exam:true,subject:st.subject,final_difficulty:st.level},questions:st.questions,answers:st.answers
    }});
  }catch{}
  root.innerHTML=`<section class="adaptive-result">
    <div class="answer-key-result-ring"><strong>${pct}%</strong><small>${st.score}/${total}</small></div>
    <div class="eyebrow">EXAMEN ADAPTATIVO TERMINADO</div><h2>Nivel final ${st.level}/5</h2>
    <p>${pct>=80?"Buen dominio. El examen logró llevarte a preguntas más exigentes.":"Tus errores ya pueden alimentar Repaso inteligente."}</p>
    <div class="adaptive-topic-results">${Object.entries(topics).sort((a,b)=>a[1].right/a[1].total-b[1].right/b[1].total).map(([name,x])=>`<div><span>${escapeHtml(name)}</span><strong>${Math.round(x.right/x.total*100)}%</strong></div>`).join("")}</div>
    <div class="answer-key-result-actions"><button id="adaptive-bank" class="secondary-btn">VOLVER AL BANCO</button><button id="adaptive-errors" class="primary-btn">REPASAR ERRORES</button></div>
  </section>`;
  $("#adaptive-bank").onclick=()=>navigate("question_bank");
  $("#adaptive-errors").onclick=()=>navigate("smart").then(()=>startSmartReview());
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
    const difficulty=Number($("#exam-difficulty").value);
    const d=await api("/api/ai/exam",{method:"POST",body:{subject,topic,count:Number($("#exam-count").value),difficulty}});
    state.exam={questions:d.questions,answers:{},subject,topic,difficulty,started_at:new Date().toISOString()};
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
    settings:{subject:e.subject,topic:e.topic,difficulty:e.difficulty},questions:e.questions,answers:e.answers
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
  state.libraryView=state.libraryView||"files";
  root.innerHTML=`
    <section class="study-library-hero">
      <div>
        <div class="learning-home-chip"><span></span> CENTRO DE ESTUDIO · BIBLIOTECA</div>
        <h1>Todo tu material académico, en un solo lugar.</h1>
        <p>Organiza libros, guías, presentaciones, documentos y apuntes en carpetas. Tus archivos quedan separados de la IA y no consumen créditos por almacenarse o abrirse.</p>
      </div>
      <div class="study-library-hero-art" aria-hidden="true">
        <div class="library-stack book-a"><i></i><b>MED</b></div>
        <div class="library-stack book-b"><i></i><b>PDF</b></div>
        <div class="library-stack book-c"><i></i><b>01</b></div>
      </div>
    </section>

    <nav class="study-library-tabs study-library-tabs-v24">
      <button class="${state.libraryView==="files"?"active":""}" data-library-view="files"><span>▥</span><div><b>ARCHIVOS Y CARPETAS</b><small>Libros · PDF · presentaciones</small></div></button>
      <button class="${state.libraryView==="notes"?"active":""}" data-library-view="notes"><span>¶</span><div><b>APUNTES</b><small>Notas rápidas guardadas en D1</small></div></button>
      <button class="${state.libraryView==="offline"?"active":""}" data-library-view="offline"><span>↓</span><div><b>ESTUDIO OFFLINE</b><small>Material disponible sin internet</small></div></button>
    </nav>

    <div id="study-library-content"></div>`;

  $$(".study-library-tabs button").forEach(btn=>btn.onclick=()=>{
    state.libraryView=btn.dataset.libraryView;
    $$(".study-library-tabs button").forEach(x=>x.classList.toggle("active",x===btn));
    if(state.libraryView==="notes")renderLibraryNotes();
    else if(state.libraryView==="offline")renderOfflineStudyVault();
    else loadStudyLibrary(state.libraryFolderId);
  });

  if(state.libraryView==="notes")await renderLibraryNotes();
  else if(state.libraryView==="offline")await renderOfflineStudyVault();
  else await loadStudyLibrary(state.libraryFolderId);
}

async function renderLibraryNotes(){
  const box=$("#study-library-content");
  box.innerHTML=`<div class="library-loading"><div class="v17-loading-orb"><i></i><i></i><i></i></div><strong>Cargando apuntes…</strong></div>`;
  try{
    const notes=await api("/api/notes");
    const cleanNotes=(notes.notes||[]).filter(n=>{
      const tags=safeJson(n.tags_json,[]);
      return !tags.includes("library_file")&&!tags.includes("library_folder")&&!tags.includes("university_source");
    });
    box.innerHTML=`
      <section class="library-notes-layout">
        <div class="card library-note-compose">
          <div class="panel-code">NUEVO APUNTE</div>
          <h3>Escribe una nota rápida</h3>
          <div class="field"><label>Título</label><input id="note-title" placeholder="Ej. Recordatorio de fisiología"></div>
          <div class="field"><label>Contenido</label><textarea id="note-body" style="min-height:260px" placeholder="Escribe aquí tus apuntes..."></textarea></div>
          <button id="save-note" class="primary-btn">GUARDAR APUNTE</button>
        </div>
        <div class="card">
          <div class="library-list-head"><div><div class="panel-code">MIS APUNTES</div><h3>${cleanNotes.length} guardado${cleanNotes.length===1?"":"s"}</h3></div></div>
          <div id="notes-list" class="list">${cleanNotes.length?cleanNotes.map(noteItem).join(""):`<div class="empty">Aún no tienes apuntes.</div>`}</div>
        </div>
      </section>`;
    $("#save-note").onclick=async()=>{
      try{
        await api("/api/notes",{method:"POST",body:{title:$("#note-title").value,body:$("#note-body").value}});
        toast("Apunte guardado.");renderLibraryNotes();
      }catch(err){toast(err.message,true)}
    };
    $$(".delete-note").forEach(b=>b.onclick=async()=>{
      await api(`/api/notes?id=${encodeURIComponent(b.dataset.id)}`,{method:"DELETE"});
      renderLibraryNotes();
    });
  }catch(err){
    box.innerHTML=`<div class="card masterclass-error"><strong>No pude cargar los apuntes.</strong><p>${escapeHtml(err.message)}</p></div>`;
  }
}

async function loadStudyLibrary(folderId=null){
  const box=$("#study-library-content");
  box.innerHTML=`<div class="library-loading"><div class="v17-loading-orb"><i></i><i></i><i></i></div><strong>Abriendo biblioteca…</strong></div>`;
  try{
    const data=await api(`/api/library${folderId?`?folder_id=${encodeURIComponent(folderId)}`:""}`);
    state.libraryFolderId=folderId||null;
    state.libraryData=data;
    renderStudyLibraryFiles();
  }catch(err){
    const missing=/R2|LIBRARY|almacenamiento/i.test(err.message);
    box.innerHTML=missing?renderR2SetupPanel(err.message):`<div class="card masterclass-error"><strong>No pude abrir la Biblioteca.</strong><p>${escapeHtml(err.message)}</p><button id="library-retry" class="primary-btn">REINTENTAR</button></div>`;
    $("#library-retry")?.addEventListener("click",()=>loadStudyLibrary(folderId));
  }
}

function renderR2SetupPanel(message){
  return `<section class="library-r2-setup">
    <div class="library-r2-icon">☁</div>
    <div class="eyebrow">FALTA CONECTAR EL ALMACENAMIENTO</div>
    <h2>La Biblioteca está lista; solo falta vincular Cloudflare R2.</h2>
    <p>R2 guardará los archivos grandes. D1 seguirá guardando solamente la organización y los metadatos. Esto mantiene intacto el resto de MED AI.</p>
    <div class="library-r2-steps">
      <div><b>1</b><span><strong>Crear bucket R2</strong><small>Nombre recomendado: med-ai-dalton-library</small></span></div>
      <div><b>2</b><span><strong>Agregar binding al Worker</strong><small>Variable/binding: LIBRARY</small></span></div>
      <div><b>3</b><span><strong>Volver a desplegar</strong><small>No requiere SQL ni cambios en D1</small></span></div>
    </div>
    <small class="library-r2-error">${escapeHtml(message||"")}</small>
  </section>`;
}

function libraryFileIcon(mime,name){
  const ext=String(name||"").split(".").pop().toLowerCase();
  if(mime==="application/pdf"||ext==="pdf")return {icon:"▤",cls:"pdf",label:"PDF"};
  if(/presentation|powerpoint/.test(mime)||["ppt","pptx","key"].includes(ext))return {icon:"▧",cls:"slides",label:"PRESENTACIÓN"};
  if(/word|document/.test(mime)||["doc","docx","odt"].includes(ext))return {icon:"¶",cls:"doc",label:"DOCUMENTO"};
  if(mime.startsWith("image/"))return {icon:"▣",cls:"image",label:"IMAGEN"};
  if(mime.startsWith("video/"))return {icon:"▶",cls:"video",label:"VIDEO"};
  if(mime.startsWith("audio/")||["mp3","wav","m4a","ogg","mpeg","mpga"].includes(ext))return {icon:"♫",cls:"audio",label:"AUDIO"};
  if(mime.startsWith("text/")||["txt","md","rtf"].includes(ext))return {icon:"≡",cls:"text",label:"TEXTO"};
  return {icon:"◇",cls:"other",label:(ext||"ARCHIVO").toUpperCase()};
}
function formatBytes(bytes){
  const n=Number(bytes||0);if(!n)return "0 B";
  const u=["B","KB","MB","GB"];let i=0,v=n;
  while(v>=1024&&i<u.length-1){v/=1024;i++}
  return `${v>=10||i===0?v.toFixed(0):v.toFixed(1)} ${u[i]}`;
}
function getLibraryMeta(item){return safeJson(item.metadata_json,{})}

function renderStudyLibraryFiles(){
  const box=$("#study-library-content"),d=state.libraryData||{},folders=d.folders||[],files=d.files||[];
  const current=d.current_folder||null;
  const breadcrumb=d.breadcrumb||[];
  box.innerHTML=`
    <section class="study-library-toolbar">
      <div class="library-breadcrumb">
        <button class="library-crumb ${!current?"active":""}" data-folder="">⌂ Mi Biblioteca</button>
        ${breadcrumb.map((x,i)=>`<span>›</span><button class="library-crumb ${i===breadcrumb.length-1?"active":""}" data-folder="${escapeAttr(x.id)}">${escapeHtml(x.name)}</button>`).join("")}
      </div>
      <div class="study-library-toolbar-actions">
        <button id="library-new-folder" class="secondary-btn">＋ CARPETA</button>
        <button id="library-upload" class="primary-btn">↑ SUBIR ARCHIVO</button>
        <input id="library-upload-input" type="file" hidden multiple accept=".pdf,.ppt,.pptx,.doc,.docx,.txt,.md,.rtf,.png,.jpg,.jpeg,.webp,.mp4,.webm,.mp3,.wav,.m4a,.ogg,.mpeg,.mpga,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,image/*,video/mp4,video/webm,audio/mpeg,audio/wav,audio/mp4,audio/ogg,audio/webm">
      </div>
    </section>

    <section class="study-library-overview">
      <div><span class="library-stat-icon folder">▰</span><strong>${Number(d.total_folders||0)}</strong><small>carpetas</small></div>
      <div><span class="library-stat-icon files">▥</span><strong>${Number(d.total_files||0)}</strong><small>archivos</small></div>
      <div><span class="library-stat-icon storage">☁</span><strong>${formatBytes(d.total_bytes||0)}</strong><small>almacenados</small></div>
      <div class="library-search-wrap"><span>⌕</span><input id="library-filter" placeholder="Filtrar esta carpeta..."></div>
    </section>

    <section class="library-current-head">
      <div><div class="panel-code">UBICACIÓN ACTUAL</div><h2>${escapeHtml(current?.name||"Mi Biblioteca")}</h2></div>
      <span>${folders.length} carpeta${folders.length===1?"":"s"} · ${files.length} archivo${files.length===1?"":"s"}</span>
    </section>

    <div id="library-grid" class="library-grid">
      ${folders.map(folder=>{
        const meta=getLibraryMeta(folder);
        return `<article class="library-folder-tile" data-search="${escapeAttr(folder.title.toLowerCase())}">
          <button class="library-folder-open" data-id="${escapeAttr(folder.id)}">
            <div class="library-folder-shape"><i></i><span>▰</span></div>
            <strong>${escapeHtml(folder.title)}</strong>
            <small>${Number(meta.child_count||0)} elemento${Number(meta.child_count||0)===1?"":"s"}</small>
          </button>
          <div class="library-tile-menu">
            <button class="library-rename" data-id="${escapeAttr(folder.id)}" data-type="folder" data-name="${escapeAttr(folder.title)}" title="Renombrar">✎</button>
            <button class="library-delete" data-id="${escapeAttr(folder.id)}" data-type="folder" data-name="${escapeAttr(folder.title)}" title="Eliminar">×</button>
          </div>
        </article>`;
      }).join("")}
      ${files.map(file=>{
        const meta=getLibraryMeta(file),info=libraryFileIcon(meta.mime_type||"",meta.original_name||file.title);
        const mime=String(meta.mime_type||"").toLowerCase(),name=meta.original_name||file.title;
        const canIndex=info.cls==="pdf"||mime.startsWith("image/")||/\.(docx|odt|pptx|txt|md)$/i.test(name);
        const canTranscribe=mime.startsWith("audio/")||mime.startsWith("video/")||/\.(mp3|wav|m4a|ogg|webm|mp4|mpeg|mpga)$/i.test(name);
        const searchable=`${file.title} ${info.label}`.toLowerCase();
        return `<article class="library-file-tile" data-search="${escapeAttr(searchable)}">
          <div class="library-file-preview ${info.cls}"><span>${info.icon}</span><em>${escapeHtml(info.label)}</em></div>
          <div class="library-file-copy"><strong title="${escapeAttr(file.title)}">${escapeHtml(file.title)}</strong><span>${formatBytes(meta.size_bytes)} · ${formatDate(file.updated_at)}</span></div>
          <div class="library-file-actions library-file-actions-v25">
            <button class="library-study-file" data-id="${escapeAttr(file.id)}"><span>✦</span> ESTUDIAR CON MED AI</button>
            ${info.cls==="pdf"?`<button class="library-past-exam" data-id="${escapeAttr(file.id)}"><span>▤</span> CLAVE PASADA</button>`:""}
            ${canIndex?`<button class="library-index-source" data-id="${escapeAttr(file.id)}"><span>⌖</span> OCR + CITAS</button>`:""}
            ${canTranscribe?`<button class="library-transcribe-media" data-id="${escapeAttr(file.id)}"><span>◉</span> TRANSCRIBIR CLASE</button>`:""}
            <button class="library-offline-file" data-id="${escapeAttr(file.id)}"><span>↓</span> OFFLINE</button>
            <button class="library-open-file" data-id="${escapeAttr(file.id)}">ABRIR</button>
            <button class="library-download-file" data-id="${escapeAttr(file.id)}" title="Descargar">↓</button>
            <button class="library-rename" data-id="${escapeAttr(file.id)}" data-type="file" data-name="${escapeAttr(file.title)}" title="Renombrar">✎</button>
            <button class="library-delete" data-id="${escapeAttr(file.id)}" data-type="file" data-name="${escapeAttr(file.title)}" title="Eliminar">×</button>
          </div>
        </article>`;
      }).join("")}
      ${!folders.length&&!files.length?`<div class="library-empty-folder"><div><span>▰</span><span>▤</span></div><strong>Esta carpeta está vacía.</strong><p>Sube un libro, una presentación o crea otra carpeta para comenzar a organizarla.</p><button id="library-empty-upload" class="primary-btn">↑ SUBIR MI PRIMER ARCHIVO</button></div>`:""}
    </div>`;

  $$(".library-crumb").forEach(b=>b.onclick=()=>loadStudyLibrary(b.dataset.folder||null));
  $$(".library-folder-open").forEach(b=>b.onclick=()=>loadStudyLibrary(b.dataset.id));
  $("#library-new-folder").onclick=createStudyLibraryFolder;
  $("#library-upload").onclick=()=>$("#library-upload-input").click();
  $("#library-empty-upload")?.addEventListener("click",()=>$("#library-upload-input").click());
  $("#library-upload-input").onchange=e=>uploadStudyLibraryFiles(e.target.files);
  $("#library-filter").oninput=e=>{
    const q=e.target.value.trim().toLowerCase();
    $$("#library-grid>[data-search]").forEach(x=>x.classList.toggle("hidden",q&&!x.dataset.search.includes(q)));
  };
  $$(".library-study-file").forEach(b=>b.onclick=()=>openLibraryStudyMode(b.dataset.id));
  $$(".library-past-exam").forEach(b=>b.onclick=()=>openHistoricalKeysStudio({libraryFileId:b.dataset.id}));
  $$(".library-index-source").forEach(b=>b.onclick=()=>indexLibrarySourceV29(b.dataset.id));
  $$(".library-transcribe-media").forEach(b=>b.onclick=()=>transcribeLibraryMediaV29(b.dataset.id));
  $$(".library-offline-file").forEach(b=>b.onclick=()=>toggleLibraryFileOffline(b.dataset.id));
  $$(".library-open-file").forEach(b=>b.onclick=()=>openStudyLibraryFile(b.dataset.id));
  $$(".library-download-file").forEach(b=>b.onclick=()=>downloadStudyLibraryFile(b.dataset.id));
  $$(".library-rename").forEach(b=>b.onclick=()=>renameStudyLibraryItem(b.dataset.id,b.dataset.type,b.dataset.name));
  $$(".library-delete").forEach(b=>b.onclick=()=>deleteStudyLibraryItem(b.dataset.id,b.dataset.type,b.dataset.name));
  refreshLibraryOfflineButtons().catch(()=>{});
}



/* ==========================================================
   V29 · OCR, precise source indexing & lecture transcription
   ========================================================== */

function ensureV29StudyResultOverlay(){
  let o=$("#v29-study-result-overlay");
  if(o)return o;
  o=document.createElement("div");
  o.id="v29-study-result-overlay";o.className="library-study-overlay hidden";
  o.innerHTML=`<div class="library-study-shell v29-result-shell">
    <header class="library-study-shell-head"><div><span>MED AI · V29 FINAL</span><strong id="v29-result-title">Resultado</strong></div><button id="v29-result-close" class="library-viewer-close">×</button></header>
    <main id="v29-result-body"></main>
  </div>`;
  document.body.appendChild(o);
  $("#v29-result-close").onclick=()=>{o.classList.add("hidden");document.body.classList.remove("modal-open")};
  o.onclick=e=>{if(e.target===o){o.classList.add("hidden");document.body.classList.remove("modal-open")}};
  return o;
}
function openV29Result(title,html){
  const o=ensureV29StudyResultOverlay();o.classList.remove("hidden");document.body.classList.add("modal-open");
  $("#v29-result-title").textContent=title;$("#v29-result-body").innerHTML=html;
}
async function indexLibrarySourceV29(fileId){
  if(!navigator.onLine)return toast("El OCR/indexado inicial necesita internet. Después las fuentes quedan guardadas.",true);
  const file=(state.libraryData?.files||[]).find(x=>x.id===fileId);
  openV29Result("OCR + citas",`<div class="library-loading"><div class="v17-loading-orb"><i></i><i></i><i></i></div><strong>Extrayendo e indexando ${escapeHtml(file?.title||"el documento")}…</strong><small>MED AI conservará página/diapositiva solo si la extracción realmente la detecta.</small></div>`);
  try{
    const d=await api("/api/library/ocr-index",{method:"POST",body:{file_id:fileId}});
    $("#v29-result-body").innerHTML=`<section class="v29-index-result">
      <div class="v29-success-mark">✓</div><div class="eyebrow">FUENTE INDEXADA</div><h2>${escapeHtml(d.source_name||file?.title||"Documento")}</h2>
      <p>${escapeHtml(d.message||"El documento ya puede participar en búsquedas con localizadores.")}</p>
      <div class="v29-result-metrics"><div><strong>${Number(d.indexed_blocks||0)}</strong><span>bloques</span></div><div><strong>${Number(d.exact_locators||0)}</strong><span>localizadores exactos</span></div><div><strong>${escapeHtml(d.engine||"OCR")}</strong><span>motor</span></div></div>
      ${d.low_quality?`<div class="notice">La extracción fue limitada. Si es un escaneo borroso, una foto/página más clara mejorará el resultado.</div>`:""}
      <button id="v29-go-smart" class="primary-btn">BUSCAR EN ESTA FUENTE →</button>
    </section>`;
    $("#v29-go-smart").onclick=()=>{$("#v29-study-result-overlay").classList.add("hidden");document.body.classList.remove("modal-open");navigate("smart")};
  }catch(err){$("#v29-result-body").innerHTML=`<div class="masterclass-error"><strong>No pude indexar el archivo.</strong><p>${escapeHtml(err.message)}</p></div>`}
}
async function transcribeLibraryMediaV29(fileId){
  if(!navigator.onLine)return toast("La transcripción inicial necesita internet.",true);
  const file=(state.libraryData?.files||[]).find(x=>x.id===fileId);
  const subject=prompt("Materia o contexto de esta clase (opcional):", "")||"";
  openV29Result("Transcribir clase",`<div class="library-loading"><div class="v17-loading-orb"><i></i><i></i><i></i></div><strong>Transcribiendo ${escapeHtml(file?.title||"tu clase")}…</strong><small>Audio → transcripción → clase organizada → preguntas. Se guarda para reutilizar.</small></div>`);
  try{
    const d=await api("/api/library/transcribe",{method:"POST",body:{file_id:fileId,subject}});
    state.mediaStudyPack=d.pack||null;
    const p=d.pack||{};
    $("#v29-result-body").innerHTML=`<section class="v29-transcript-pack">
      <header><div class="eyebrow">${d.cached?"PAQUETE GUARDADO · SIN NUEVA IA":"CLASE TRANSCRITA Y GUARDADA"}</div><h2>${escapeHtml(p.title||file?.title||"Clase")}</h2><p>${escapeHtml(p.overview||"")}</p></header>
      ${(p.sections||[]).map((s,i)=>`<article><span>${String(i+1).padStart(2,"0")}</span><div><h3>${escapeHtml(s.title)}</h3><div class="masterclass-prose">${renderStudyParagraphs(s.explanation||"")}</div>${s.key_points?.length?`<ul>${s.key_points.map(x=>`<li>${escapeHtml(x)}</li>`).join("")}</ul>`:""}</div></article>`).join("")}
      <section class="card"><div class="panel-code">DEBES RECORDAR</div>${(p.must_remember||[]).map(x=>`<p>• ${escapeHtml(x)}</p>`).join("")}</section>
      <div class="v29-transcript-metrics"><span>${(p.flashcards||[]).length} flashcards guardadas</span><span>${(p.questions||[]).length} preguntas guardadas</span></div>
      <div class="v29-pack-actions"><button id="v29-media-practice" class="primary-btn">▶ EXAMEN DE ESTA CLASE</button><button id="v29-bank-from-media" class="secondary-btn">▦ VER BANCO</button><button id="v29-go-flashcards" class="secondary-btn">▱ FLASHCARDS</button><button id="v29-close-media" class="ghost-btn">CERRAR</button></div>
    </section>`;
    $("#v29-media-practice").onclick=()=>startMediaPracticeV29(p,file?.title||"Clase");
    $("#v29-bank-from-media").onclick=()=>{$("#v29-study-result-overlay").classList.add("hidden");document.body.classList.remove("modal-open");navigate("question_bank")};
    $("#v29-go-flashcards").onclick=()=>{$("#v29-study-result-overlay").classList.add("hidden");document.body.classList.remove("modal-open");navigate("flashcards")};
    $("#v29-close-media").onclick=()=>{$("#v29-study-result-overlay").classList.add("hidden");document.body.classList.remove("modal-open")};
  }catch(err){$("#v29-result-body").innerHTML=`<div class="masterclass-error"><strong>No pude transcribir esta clase.</strong><p>${escapeHtml(err.message)}</p><small>Para archivos grandes, divide la grabación en partes de hasta 25 MB.</small></div>`}
}


function startMediaPracticeV29(pack,title){
  const qs=(pack?.questions||[]).slice();
  if(!qs.length)return toast("Esta transcripción no tiene preguntas guardadas.",true);
  state.mediaPractice={questions:qs,index:0,answers:{},score:0,title,started_at:new Date().toISOString()};
  renderMediaPracticeV29();
}
function renderMediaPracticeV29(){
  const st=state.mediaPractice,q=st?.questions?.[st.index],box=$("#v29-result-body");
  if(!q){finishMediaPracticeV29();return}
  box.innerHTML=`<section class="answer-key-session"><header class="answer-key-session-head"><button id="media-practice-exit" class="ghost-btn">← CLASE</button><div><span>EXAMEN DE CLASE TRANSCRITA</span><strong>${st.index+1} / ${st.questions.length}</strong></div><div class="answer-key-session-score">RESPUESTAS OCULTAS</div></header><div class="master-exam-progress"><i style="width:${st.index/st.questions.length*100}%"></i></div><article class="answer-key-question"><div class="answer-key-question-meta"><span>PREGUNTA ${st.index+1}</span><b>${escapeHtml(q.topic||"Clase")}</b></div><h1>${escapeHtml(q.stem)}</h1><div class="answer-key-options">${q.options.map((op,i)=>`<button data-i="${i}"><span>${String.fromCharCode(65+i)}</span><strong>${escapeHtml(op)}</strong></button>`).join("")}</div></article></section>`;
  $("#media-practice-exit").onclick=()=>{$("#v29-study-result-overlay").classList.add("hidden");document.body.classList.remove("modal-open")};
  $$(".answer-key-options button",box).forEach(b=>b.onclick=()=>{st.answers[`q${st.index}`]=Number(b.dataset.i);st.index++;renderMediaPracticeV29()});
}
async function finishMediaPracticeV29(){
  const st=state.mediaPractice;let score=0;
  st.questions.forEach((q,i)=>{if(Number(st.answers[`q${i}`])===Number(q.correctIndex))score++});
  const pct=Math.round(score/Math.max(1,st.questions.length)*100);
  try{await api("/api/exams/record",{method:"POST",body:{title:`Clase transcrita · ${st.title}`,score,max_score:st.questions.length,percentage:pct,started_at:st.started_at,settings:{subject:st.title,transcription:true},questions:st.questions,answers:st.answers}})}catch{}
  $("#v29-result-body").innerHTML=`<section class="answer-key-result"><div class="answer-key-result-ring"><strong>${pct}%</strong><small>${score}/${st.questions.length}</small></div><div class="eyebrow">EXAMEN DE CLASE TERMINADO</div><h2>${pct>=80?"Buen dominio de la clase.":"Repasa los conceptos que fallaste."}</h2><p>Las preguntas ya están en tu banco permanente y los errores del examen quedan registrados.</p><div class="answer-key-result-actions"><button id="media-result-bank" class="primary-btn">BANCO DE PREGUNTAS</button><button id="media-result-close" class="secondary-btn">CERRAR</button></div></section>`;
  $("#media-result-bank").onclick=()=>{$("#v29-study-result-overlay").classList.add("hidden");document.body.classList.remove("modal-open");navigate("question_bank")};
  $("#media-result-close").onclick=()=>{$("#v29-study-result-overlay").classList.add("hidden");document.body.classList.remove("modal-open")};
}

/* ==========================================================
   V23 · LIBRARY STUDY MODE
   Study selected pages/slides -> save once -> reuse for free
   ========================================================== */

function ensureLibraryStudyOverlay(){
  let overlay=$("#library-study-overlay");
  if(overlay)return overlay;
  overlay=document.createElement("div");
  overlay.id="library-study-overlay";
  overlay.className="library-study-overlay hidden";
  overlay.innerHTML=`<div class="library-study-shell">
    <header class="library-study-shell-head">
      <div><span>MED AI · LIBRARY STUDY MODE</span><strong id="library-study-shell-title">Estudiar material</strong></div>
      <button id="library-study-close" class="library-viewer-close">×</button>
    </header>
    <main id="library-study-body"></main>
  </div>`;
  document.body.appendChild(overlay);
  $("#library-study-close",overlay).onclick=closeLibraryStudyMode;
  overlay.onclick=e=>{if(e.target===overlay)closeLibraryStudyMode()};
  return overlay;
}

function closeLibraryStudyMode(){
  $("#library-study-overlay")?.classList.add("hidden");
  document.body.classList.remove("modal-open");
  state.libraryStudyFile=null;
  state.libraryStudyPdf=null;
  state.libraryStudyDoc=null;
  state.libraryStudyRange=null;
}

async function openLibraryStudyMode(fileId){
  const file=(state.libraryData?.files||[]).find(x=>x.id===fileId);
  if(!file)return toast("No pude encontrar ese archivo.",true);
  state.libraryStudyFile=file;
  const overlay=ensureLibraryStudyOverlay();
  overlay.classList.remove("hidden");
  document.body.classList.add("modal-open");
  $("#library-study-shell-title").textContent=file.title;
  $("#library-study-body").innerHTML=`<div class="library-loading"><div class="v17-loading-orb"><i></i><i></i><i></i></div><strong>Preparando modo de estudio…</strong></div>`;
  try{
    const data=await api(`/api/library/study-packs?file_id=${encodeURIComponent(file.id)}`);
    state.libraryStudyPacks=data.packs||[];
    await renderLibraryStudyHome();
  }catch(err){
    $("#library-study-body").innerHTML=`<div class="masterclass-error"><strong>No pude abrir el modo de estudio.</strong><p>${escapeHtml(err.message)}</p></div>`;
  }
}

async function inflateRawBytes(bytes){
  if(!("DecompressionStream" in window))throw new Error("Este navegador no puede descomprimir presentaciones localmente.");
  const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}
async function zipEntriesFromBuffer(buffer){
  const bytes=new Uint8Array(buffer),view=new DataView(buffer);
  let eocd=-1;
  for(let i=bytes.length-22;i>=Math.max(0,bytes.length-66000);i--){
    if(view.getUint32(i,true)===0x06054b50){eocd=i;break}
  }
  if(eocd<0)throw new Error("El archivo Office no parece ser un ZIP válido.");
  const count=view.getUint16(eocd+10,true);
  let pos=view.getUint32(eocd+16,true);
  const entries=[];
  const decoder=new TextDecoder("utf-8");
  for(let n=0;n<count&&pos+46<=bytes.length;n++){
    if(view.getUint32(pos,true)!==0x02014b50)break;
    const method=view.getUint16(pos+10,true);
    const compressedSize=view.getUint32(pos+20,true);
    const nameLen=view.getUint16(pos+28,true);
    const extraLen=view.getUint16(pos+30,true);
    const commentLen=view.getUint16(pos+32,true);
    const localOffset=view.getUint32(pos+42,true);
    const name=decoder.decode(bytes.slice(pos+46,pos+46+nameLen));
    entries.push({name,method,compressedSize,localOffset});
    pos+=46+nameLen+extraLen+commentLen;
  }
  return {
    entries,
    async text(name){
      const entry=entries.find(e=>e.name===name);if(!entry)return null;
      const lp=entry.localOffset;
      if(view.getUint32(lp,true)!==0x04034b50)throw new Error("Cabecera ZIP inválida.");
      const fn=view.getUint16(lp+26,true),ex=view.getUint16(lp+28,true);
      const start=lp+30+fn+ex,end=start+entry.compressedSize;
      let data=bytes.slice(start,end);
      if(entry.method===8)data=await inflateRawBytes(data);
      else if(entry.method!==0)throw new Error("Método ZIP no compatible.");
      return decoder.decode(data);
    }
  };
}
function splitStudyTextIntoBlocks(text,target=9000){
  const paras=String(text||"").replace(/\r/g,"").split(/\n{2,}/).map(x=>x.trim()).filter(Boolean);
  const blocks=[];let current="";
  for(const p of paras){
    if(current && current.length+p.length+2>target){blocks.push(current.trim());current=""}
    current+=(current?"\n\n":"")+p;
  }
  if(current.trim())blocks.push(current.trim());
  if(!blocks.length&&text)blocks.push(String(text).trim());
  return blocks;
}

function libraryStudySupport(file){
  const meta=getLibraryMeta(file),mime=meta.mime_type||"",name=(meta.original_name||file.title||"").toLowerCase(),ext=name.split(".").pop();
  if(mime==="application/pdf"||ext==="pdf")return {type:"pdf",label:"PDF",unit:"bloques",max:3};
  if(ext==="pptx"||mime==="application/vnd.openxmlformats-officedocument.presentationml.presentation")return {type:"pptx",label:"Presentación",unit:"diapositivas",max:30};
  if(ext==="docx"||mime==="application/vnd.openxmlformats-officedocument.wordprocessingml.document")return {type:"docx",label:"Documento",unit:"documento",max:1};
  if(mime.startsWith("text/")||["txt","md","rtf"].includes(ext))return {type:"text",label:"Texto",unit:"documento",max:1};
  return {type:"unsupported",label:"Archivo",unit:"",max:0};
}

async function renderLibraryStudyHome(){
  const file=state.libraryStudyFile,packs=state.libraryStudyPacks||[],support=libraryStudySupport(file),meta=getLibraryMeta(file);
  const body=$("#library-study-body");
  body.innerHTML=`
    <section class="library-study-hero">
      <div class="library-study-file-badge ${escapeAttr(libraryFileIcon(meta.mime_type||"",meta.original_name||file.title).cls)}">${libraryFileIcon(meta.mime_type||"",meta.original_name||file.title).icon}</div>
      <div class="library-study-hero-copy">
        <div class="eyebrow">ESTUDIAR DESDE MI BIBLIOTECA</div>
        <h2>${escapeHtml(file.title)}</h2>
        <p>Selecciona solamente el fragmento que estás viendo en clase. MED AI lo transforma en una sesión reutilizable sin modificar tu curso oficial.</p>
      </div>
      <div class="library-study-save-badge"><span>⚡</span><div><strong>MODO AHORRO</strong><small>Analiza solo lo elegido</small></div></div>
    </section>

    <section class="library-study-choice-grid">
      <button id="library-study-new" class="library-study-choice new" ${support.type==="unsupported"?"disabled":""}>
        <div>✦</div><span><strong>NUEVA SESIÓN DE ESTUDIO</strong><small>${support.type==="unsupported"?"Este formato todavía no se puede analizar directamente":`Elegir ${support.unit} y crear una clase guardada`}</small></span>
      </button>
      <div class="library-study-choice independent">
        <div>∞</div><span><strong>TU CURSO DE MED AI SIGUE APARTE</strong><small>Estas sesiones no alteran el porcentaje ni desbloqueo de tus cursos.</small></span>
      </div>
    </section>

    ${support.type==="docx"?`<div class="library-study-format-note"><b>Documento Word:</b> MED AI extraerá el texto localmente en tu dispositivo y enviará solo el contenido necesario, no el archivo completo.</div>`:""}
    ${support.type==="pptx"?`<div class="library-study-format-note"><b>Presentación:</b> podrás seleccionar un rango de diapositivas. MED AI extraerá el texto de esas diapositivas antes de usar IA.</div>`:""}
    ${support.type==="unsupported"?`<div class="library-study-format-note warning"><b>Formato no compatible para análisis directo.</b> Puedes abrirlo normalmente; si quieres estudiarlo con IA, conviértelo a PDF, PowerPoint, Word o texto.</div>`:""}

    <section class="library-study-saved">
      <div class="library-study-saved-head"><div><span>SESIONES GUARDADAS DE ESTE ARCHIVO</span><h3>${packs.length} sesión${packs.length===1?"":"es"}</h3></div><small>Volver a abrirlas no consume IA</small></div>
      <div class="library-study-pack-list">
        ${packs.length?packs.map(pack=>{
          const m=safeJson(pack.metadata_json,{});
          return `<article>
            <div class="library-pack-icon">✓</div>
            <div><span>${escapeHtml(m.study_scope||"Material seleccionado")} · ${formatDate(pack.updated_at)}</span><strong>${escapeHtml(m.study_title||pack.title)}</strong><small>${escapeHtml(m.study_focus||"Sesión de estudio guardada")}</small></div>
            <button class="primary-btn library-open-pack" data-id="${escapeAttr(pack.id)}">REPASAR</button>
          </article>`;
        }).join(""):`<div class="university-empty"><div class="university-empty-art"><span>✦</span><span>▤</span><span>✓</span></div><strong>Aún no has creado una sesión con este archivo.</strong><p>Selecciona las páginas o diapositivas que estás estudiando y MED AI preparará el material una sola vez.</p></div>`}
      </div>
    </section>`;
  $("#library-study-new")?.addEventListener("click",()=>prepareLibraryStudySource(support));
  $$(".library-open-pack",body).forEach(b=>b.onclick=()=>openLibrarySavedStudyPack(b.dataset.id));
}

async function fetchLibraryFileBuffer(file){
  const local=await offlineGetFileRecord(file.id);
  if(local?.blob)return local.blob.arrayBuffer();
  if(!navigator.onLine)throw new Error("Este archivo no está guardado offline. Conéctate una vez o marca el archivo como OFFLINE.");
  const res=await fetch(libraryFileUrl(file.id,true),{credentials:"same-origin"});
  if(!res.ok)throw new Error("No pude descargar temporalmente el archivo para leerlo.");
  return res.arrayBuffer();
}

async function prepareLibraryStudySource(support){
  const body=$("#library-study-body"),file=state.libraryStudyFile;
  body.innerHTML=`<div class="library-loading"><div class="v17-loading-orb"><i></i><i></i><i></i></div><strong>Preparando ${escapeHtml(file.title)}…</strong><small>${support.type==="pdf"?"La conversión del PDF se guarda para no repetirla.":"Extracción local sin IA."}</small></div>`;
  try{
    if(support.type==="pdf"){
      if(!navigator.onLine)throw new Error("Para crear una NUEVA sesión desde un PDF necesitas internet. Las sesiones ya preparadas y el PDF marcado OFFLINE sí pueden repasarse sin conexión.");
      const converted=await api("/api/library/extract",{method:"POST",body:{file_id:file.id}});
      const blocks=splitStudyTextIntoBlocks(converted.text||"",9000);
      if(!blocks.length)throw new Error("No pude extraer texto utilizable de este PDF.");
      state.libraryStudyDoc={type:"pdf",units:blocks,conversion_cached:!!converted.cached};
      renderLibraryStudyRangeForm({type:"pdf",total:blocks.length,label:"bloques",max:3});
      return;
    }
    if(support.type==="pptx"||support.type==="docx"){
      const buffer=await fetchLibraryFileBuffer(file);
      const zip=await zipEntriesFromBuffer(buffer);
      if(support.type==="pptx"){
        const slideEntries=zip.entries.map(e=>e.name).filter(n=>/^ppt\/slides\/slide\d+\.xml$/i.test(n)).sort((a,b)=>{
          const na=Number(a.match(/slide(\d+)/i)?.[1]||0),nb=Number(b.match(/slide(\d+)/i)?.[1]||0);return na-nb;
        });
        const slides=[];
        for(const name of slideEntries){
          const xml=await zip.text(name);
          const doc=new DOMParser().parseFromString(xml,"application/xml");
          const texts=[...doc.getElementsByTagNameNS("*","t")].map(n=>n.textContent||"").filter(Boolean);
          slides.push(texts.join(" "));
        }
        state.libraryStudyDoc={type:"pptx",units:slides};
        renderLibraryStudyRangeForm({type:"pptx",total:slides.length,label:"diapositivas",max:30});
        return;
      }else{
        const xml=await zip.text("word/document.xml");
        if(!xml)throw new Error("No pude encontrar el texto principal de este documento Word.");
        const doc=new DOMParser().parseFromString(xml,"application/xml");
        const paras=[...doc.getElementsByTagNameNS("*","p")].map(p=>[...p.getElementsByTagNameNS("*","t")].map(t=>t.textContent||"").join(" ")).filter(Boolean);
        state.libraryStudyDoc={type:"docx",text:paras.join("\n\n")};
        renderLibraryStudyRangeForm({type:"docx",total:1,label:"documento",max:1});
        return;
      }
    }
    if(support.type==="text"){
      const local=await offlineGetFileRecord(file.id);
      let text="";
      if(local?.blob)text=await local.blob.text();
      else{
        if(!navigator.onLine)throw new Error("Marca este archivo como OFFLINE antes de desconectarte.");
        const res=await fetch(libraryFileUrl(file.id,true),{credentials:"same-origin"});
        if(!res.ok)throw new Error("No pude leer este archivo.");
        text=await res.text();
      }
      state.libraryStudyDoc={type:"text",text};
      renderLibraryStudyRangeForm({type:"text",total:1,label:"documento",max:1});
    }
  }catch(err){
    body.innerHTML=`<div class="masterclass-error"><strong>No pude preparar este archivo.</strong><p>${escapeHtml(err.message)}</p><button id="library-study-home-again" class="secondary-btn">VOLVER</button></div>`;
    $("#library-study-home-again").onclick=renderLibraryStudyHome;
  }
}

function renderLibraryStudyRangeForm(info){
  const file=state.libraryStudyFile,body=$("#library-study-body");
  const range=info.total>1;
  body.innerHTML=`
    <section class="library-study-range-page">
      <button id="library-study-range-back" class="ghost-btn">← VOLVER</button>
      <div class="library-study-range-head">
        <div><span>PASO 1 DE 2</span><h2>Elige exactamente qué quieres estudiar.</h2><p>${range?`Este archivo tiene ${info.total} ${info.label}. Para ahorrar créditos, MED AI analizará como máximo ${info.max} ${info.label} por sesión.`:"MED AI usará el texto de este documento como base de la sesión."}</p></div>
        <div class="library-study-noai"><b>0</b><span><strong>CRÉDITOS USADOS HASTA AHORA</strong><small>Todo lo anterior ocurrió localmente</small></span></div>
      </div>

      <div class="library-study-range-layout">
        <section class="card">
          ${range?`<div class="library-range-fields">
            <div class="field"><label>Desde ${info.label==="bloques"?"bloque":info.label==="páginas"?"página":"diapositiva"}</label><input id="library-range-start" type="number" min="1" max="${info.total}" value="1"></div>
            <div class="library-range-arrow">→</div>
            <div class="field"><label>Hasta</label><input id="library-range-end" type="number" min="1" max="${info.total}" value="${Math.min(info.total,info.max)}"></div>
          </div>
          <div id="library-range-info" class="library-range-info">${Math.min(info.total,info.max)} ${info.label} seleccionadas</div>
          <div id="library-range-preview" class="library-range-preview"></div>`:""}
          <div class="field"><label>¿Qué tema o enfoque estás viendo?</label><input id="library-study-focus" placeholder="Ej. Regulación de la presión arterial, capítulo 19..." value=""></div>
          <div class="field"><label>Instrucción opcional para MED AI</label><textarea id="library-study-instruction" rows="4" placeholder="Ej. El profesor dijo que esto entra al parcial. Quiero entender especialmente los mecanismos y las diferencias..."></textarea></div>
          <div class="library-study-options">
            <label class="form-check"><input id="library-study-examfocus" type="checkbox" checked><span>Priorizar conceptos de alto rendimiento para examen</span></label>
            <label class="form-check"><input id="library-study-deep" type="checkbox" checked><span>Explicar desde cero cuando el material sea difícil</span></label>
          </div>
          <button id="library-study-extract" class="library-analyze-btn"><span>→</span><div><strong>CONTINUAR Y PREPARAR SESIÓN</strong><small>Primero extraeremos solo el fragmento seleccionado</small></div></button>
        </section>

        <aside class="library-study-budget-card">
          <div class="panel-code">CÓMO AHORRAMOS</div>
          <div><b>01</b><span><strong>No enviamos el libro completo</strong><small>Solo tus páginas o diapositivas.</small></span></div>
          <div><b>02</b><span><strong>Gemini 2.5 Flash</strong><small>El modelo económico prepara la sesión.</small></span></div>
          <div><b>03</b><span><strong>Todo queda guardado</strong><small>Resumen, mapa, ejercicios y examen.</small></span></div>
          <div><b>04</b><span><strong>Repasos sin IA</strong><small>Reabrir y repetir el examen cuesta $0 de IA.</small></span></div>
        </aside>
      </div>
    </section>`;
  $("#library-study-range-back").onclick=renderLibraryStudyHome;
  if(range){
    const update=()=>{
      let a=Number($("#library-range-start").value||1),b=Number($("#library-range-end").value||1);
      a=Math.max(1,Math.min(info.total,a));b=Math.max(a,Math.min(info.total,b));
      const count=b-a+1;
      $("#library-range-info").textContent=count>info.max?`⚠ Máximo ${info.max} ${info.label}. Reduce el rango.`:`${count} ${info.label} seleccionadas`;
      $("#library-range-info").classList.toggle("warning",count>info.max);
      const units=state.libraryStudyDoc?.units||[];
      const preview=units.slice(a-1,Math.min(b,a+2)).map((t,i)=>`<div><b>${escapeHtml(info.label==="diapositivas"?`Diapositiva ${a+i}`:`Bloque ${a+i}`)}</b><span>${escapeHtml(String(t||"").slice(0,240))}${String(t||"").length>240?"…":""}</span></div>`).join("");
      if($("#library-range-preview"))$("#library-range-preview").innerHTML=preview;
    };
    $("#library-range-start").oninput=update;$("#library-range-end").oninput=update;update();
  }
  $("#library-study-extract").onclick=()=>extractAndCreateLibraryStudyPack(info);
}

async function extractAndCreateLibraryStudyPack(info){
  const file=state.libraryStudyFile,focus=$("#library-study-focus").value.trim(),instruction=$("#library-study-instruction").value.trim();
  let start=1,end=1,text="";
  try{
    if(info.total>1){
      start=Number($("#library-range-start").value||1);end=Number($("#library-range-end").value||1);
      if(start<1||end>info.total||end<start)throw new Error("Revisa el rango seleccionado.");
      if(end-start+1>info.max)throw new Error(`Selecciona como máximo ${info.max} ${info.label}.`);
    }
    const btn=$("#library-study-extract");
    btn.disabled=true;btn.innerHTML=`<span class="university-spin">✦</span><div><strong>EXTRAYENDO MATERIAL…</strong><small>Todavía sin IA</small></div>`;

    if(info.type==="pdf"){
      const units=state.libraryStudyDoc.units.slice(start-1,end);
      text=units.map((t,i)=>`===== BLOQUE ${start+i} DEL PDF =====\n${t}`).join("\n\n");
    }else if(info.type==="pptx"){
      const units=state.libraryStudyDoc.units.slice(start-1,end);
      text=units.map((t,i)=>`===== DIAPOSITIVA ${start+i} =====\n${t}`).join("\n\n");
    }else text=state.libraryStudyDoc?.text||"";

    text=text.trim();
    if(text.length<120)throw new Error("El fragmento seleccionado tiene muy poco texto. Prueba otro rango o un PDF con texto seleccionable.");
    if(text.length>85000)text=text.slice(0,85000);

    renderLibraryStudyConfirm({info,start,end,text,focus,instruction});
  }catch(err){
    toast(err.message,true);
    $("#library-study-extract").disabled=false;
    $("#library-study-extract").innerHTML=`<span>→</span><div><strong>CONTINUAR Y PREPARAR SESIÓN</strong><small>Primero extraeremos solo el fragmento seleccionado</small></div>`;
  }
}

function renderLibraryStudyConfirm(ctx){
  const {info,start,end,text,focus,instruction}=ctx,file=state.libraryStudyFile,body=$("#library-study-body");
  const scope=info.total>1?`${info.label==="bloques"?"Bloques":info.label==="páginas"?"Páginas":"Diapositivas"} ${start}–${end}`:"Documento";
  const approx=Math.max(1,Math.round(text.length/4));
  body.innerHTML=`
    <section class="library-study-confirm">
      <button id="library-study-confirm-back" class="ghost-btn">← CAMBIAR SELECCIÓN</button>
      <div class="library-study-confirm-head"><div><span>PASO 2 DE 2</span><h2>Listo para crear tu clase guardada.</h2><p>Ahora sí haremos una única llamada a Gemini 2.5 Flash usando solamente el contenido seleccionado.</p></div><div class="library-confirm-scope"><strong>${escapeHtml(scope)}</strong><small>~${approx.toLocaleString()} tokens aproximados de contexto</small></div></div>
      <div class="library-study-confirm-grid">
        <section class="card">
          <div class="panel-code">SESIÓN</div>
          <h3>${escapeHtml(focus||file.title)}</h3>
          <div class="library-confirm-row"><span>Fuente</span><strong>${escapeHtml(file.title)}</strong></div>
          <div class="library-confirm-row"><span>Fragmento</span><strong>${escapeHtml(scope)}</strong></div>
          <div class="library-confirm-row"><span>Modelo</span><strong>Gemini 2.5 Flash</strong></div>
          <div class="library-confirm-row"><span>Se guardará</span><strong>Resumen · Clase · Diagrama · Mapa · 8 ejercicios · Examen de 10 · Videos</strong></div>
          ${instruction?`<div class="library-confirm-instruction"><span>TU INDICACIÓN</span><p>${escapeHtml(instruction)}</p></div>`:""}
          <button id="library-study-create" class="library-create-study-btn"><span>✦</span><div><strong>CREAR Y GUARDAR ESTA SESIÓN</strong><small>Esta acción sí utiliza IA una vez</small></div></button>
        </section>
        <aside class="library-study-generated-list">
          <div class="panel-code">DESPUÉS PODRÁS</div>
          <div><b>◎</b><span><strong>Repasar el resumen</strong><small>Sin nueva inferencia</small></span></div>
          <div><b>◈</b><span><strong>Abrir diagrama y mapa</strong><small>Ya quedan generados</small></span></div>
          <div><b>✦</b><span><strong>Practicar 8 ejercicios</strong><small>Calificación local</small></span></div>
          <div><b>✓</b><span><strong>Repetir examen de 10</strong><small>Las veces que quieras</small></span></div>
          <div><b>▶</b><span><strong>Buscar videos</strong><small>Consultas guardadas</small></span></div>
        </aside>
      </div>
    </section>`;
  $("#library-study-confirm-back").onclick=()=>renderLibraryStudyRangeForm(info);
  $("#library-study-create").onclick=()=>createLibraryStudyPack({...ctx,scope});
}

async function createLibraryStudyPack(ctx){
  const btn=$("#library-study-create"),file=state.libraryStudyFile;
  btn.disabled=true;btn.innerHTML=`<span class="university-spin">✦</span><div><strong>MED AI ESTÁ PREPARANDO TU SESIÓN…</strong><small>Al terminar quedará guardada</small></div>`;
  try{
    const result=await api("/api/library/study-pack",{method:"POST",body:{
      file_id:file.id,
      extracted_text:ctx.text,
      study_focus:ctx.focus,
      instruction:ctx.instruction,
      study_scope:ctx.scope,
      exam_focus:$("#library-study-examfocus")?.checked??true,
      deep_explanation:$("#library-study-deep")?.checked??true
    }});
    const list=await api(`/api/library/study-packs?file_id=${encodeURIComponent(file.id)}`);
    state.libraryStudyPacks=list.packs||[];
    toast("Sesión de estudio creada y guardada.");
    await openLibrarySavedStudyPack(result.id,true);
  }catch(err){
    btn.disabled=false;btn.innerHTML=`<span>✦</span><div><strong>CREAR Y GUARDAR ESTA SESIÓN</strong><small>Esta acción sí utiliza IA una vez</small></div>`;
    toast(err.message,true);
  }
}

async function openLibrarySavedStudyPack(id,justCreated=false){
  const body=$("#library-study-body");
  body.innerHTML=`<div class="library-loading"><div class="v17-loading-orb"><i></i><i></i><i></i></div><strong>${justCreated?"Guardando y abriendo tu nueva clase…":"Abriendo sesión guardada…"}</strong><small>No se está regenerando con IA.</small></div>`;
  try{
    const data=await api(`/api/course/source?id=${encodeURIComponent(id)}`);
    state.universitySourceRecord=data.source;
    state.universitySourcePack=data.pack;
    state.universityPractice=null;
    state.universityExam=null;
    closeLibraryStudyMode();
    const overlay=ensureUniversityOverlay();
    overlay.classList.remove("hidden");
    document.body.classList.add("modal-open");
    $("#uni-shell-title").textContent=`Biblioteca · ${state.libraryStudyFile?.title||data.pack?.title||"Sesión guardada"}`;
    renderUniversityStudyPack("summary");
    const back=$("#uni-study-back");
    if(back)back.onclick=()=>{
      closeUniversitySourceStudio();
      if(state.libraryStudyFile)openLibraryStudyMode(state.libraryStudyFile.id);
      else navigate("library");
    };
  }catch(err){
    body.innerHTML=`<div class="masterclass-error"><strong>No pude abrir esta sesión.</strong><p>${escapeHtml(err.message)}</p></div>`;
  }
}


async function refreshLibraryOfflineButtons(){
  const buttons=$$(".library-offline-file");
  for(const btn of buttons){
    const saved=await offlineHasFile(btn.dataset.id);
    btn.classList.toggle("saved",saved);
    btn.innerHTML=saved?`<span>✓</span> OFFLINE`:`<span>↓</span> OFFLINE`;
    btn.title=saved?"Guardado en este dispositivo":"Guardar en este dispositivo";
  }
}

async function toggleLibraryFileOffline(id){
  const file=(state.libraryData?.files||[]).find(x=>x.id===id);
  if(!file)return;
  const existing=await offlineGetFileRecord(id);
  if(existing){
    if(!confirm(`¿Quitar "${file.title}" del almacenamiento offline de este dispositivo? El archivo seguirá seguro en tu Biblioteca R2.`))return;
    await offlineRemoveFile(id);
    toast("Copia offline eliminada. El archivo sigue en tu Biblioteca.");
    refreshLibraryOfflineButtons();
    return;
  }
  if(!navigator.onLine)return toast("Necesitas internet una vez para descargar la copia offline.",true);
  const btn=$(`.library-offline-file[data-id="${CSS.escape(id)}"]`);
  if(btn){btn.disabled=true;btn.innerHTML=`<span class="university-spin">↓</span> GUARDANDO…`}
  try{
    await cacheLibraryFileOffline(file);
    toast("Archivo disponible sin internet en este dispositivo.");
    await refreshLibraryOfflineButtons();
  }catch(err){toast(err.message,true)}
  finally{if(btn)btn.disabled=false}
}

async function renderOfflineStudyVault(){
  const box=$("#study-library-content");
  box.innerHTML=`<div class="library-loading"><div class="v17-loading-orb"><i></i><i></i><i></i></div><strong>Revisando material offline…</strong></div>`;
  const summary=await offlineVaultSummary();
  const bytes=summary.files.reduce((a,f)=>a+Number(f.size||f.blob?.size||0),0);
  box.innerHTML=`
    <section class="offline-vault-hero">
      <div>
        <div class="learning-home-chip"><span></span> OFFLINE STUDY VAULT · V29</div>
        <h2>Tu estudio continúa aunque se vaya el internet.</h2>
        <p>Las clases que ya abriste se conservan localmente. Los libros que marques como OFFLINE también quedan en este dispositivo.</p>
      </div>
      <div class="offline-vault-signal ${navigator.onLine?"online":"offline"}"><i></i><strong>${navigator.onLine?"INTERNET DISPONIBLE":"MODO SIN CONEXIÓN"}</strong><small>${navigator.onLine?"La IA está disponible.":"Repaso local activo."}</small></div>
    </section>

    <section class="offline-vault-stats">
      <div><span>▥</span><strong>${summary.files.length}</strong><small>archivos offline</small></div>
      <div><span>📖</span><strong>${summary.coursePacks.length}</strong><small>clases de curso</small></div>
      <div><span>✓</span><strong>${summary.exams.length}</strong><small>exámenes reutilizables</small></div>
      <div><span>文</span><strong>${summary.languagePacks.length}</strong><small>lecciones de idiomas</small></div>
      <div><span>▦</span><strong>${summary.preparedBundles.length}</strong><small>materias preparadas</small></div>
      <div><span>☁</span><strong>${formatBytes(bytes)}</strong><small>en este dispositivo</small></div>
    </section>

    <section class="offline-vault-info">
      <div><b>✓</b><span><strong>Funciona sin internet</strong><small>Clases guardadas, resúmenes, mapas, diagramas, práctica, exámenes reutilizados, apuntes cacheados y archivos marcados OFFLINE.</small></span></div>
      <div><b>✦</b><span><strong>La IA necesita internet</strong><small>Tutor IA, crear una clase nueva o analizar un archivo nuevo vuelve a funcionar automáticamente cuando recuperas conexión.</small></span></div>
      <div><b>↻</b><span><strong>Sincronización posterior</strong><small>Los cambios compatibles hechos sin conexión quedan en cola y se envían cuando regresa internet.</small></span></div>
    </section>

    <section class="offline-vault-list">
      <div class="library-study-saved-head"><div><span>MATERIAS PREPARADAS PARA SALIR</span><h3>${summary.preparedBundles.length} paquete${summary.preparedBundles.length===1?"":"s"}</h3></div><small>Clases · flashcards · claves · preguntas</small></div>
      <div class="v29-offline-bundles">${summary.preparedBundles.length?summary.preparedBundles.map(r=>{const b=r.value||{};return `<button class="v29-offline-bundle-open" data-key="${escapeAttr(r.key)}"><span>↓</span><div><strong>${escapeHtml(b.subject?.name||"Materia preparada")}</strong><small>${(b.flashcards||[]).length} flashcards · ${(b.historical_packs||[]).length} paquetes · ${(b.question_bank||[]).length} preguntas</small></div><b>ABRIR →</b></button>`}).join(""):`<div class="system-empty compact">Prepara una materia desde Estado del sistema para reunir su contenido local.</div>`}</div>
    </section>

    <section class="offline-vault-list">
      <div class="library-study-saved-head"><div><span>ARCHIVOS EN ESTE DISPOSITIVO</span><h3>${summary.files.length} disponible${summary.files.length===1?"":"s"}</h3></div><small>Solo ocupan espacio local los que tú eliges</small></div>
      <div class="library-grid">
        ${summary.files.length?summary.files.map(f=>{
          const info=libraryFileIcon(f.mime||"",f.name||f.title);
          return `<article class="library-file-tile offline-file-tile">
            <div class="library-file-preview ${info.cls}"><span>${info.icon}</span><em>${escapeHtml(info.label)}</em></div>
            <div class="library-file-copy"><strong>${escapeHtml(f.title||f.name)}</strong><span>${formatBytes(f.size||f.blob?.size||0)} · OFFLINE ✓</span></div>
            <div class="offline-file-actions"><button class="primary-btn offline-open-local" data-id="${escapeAttr(f.id)}">ABRIR</button><button class="secondary-btn offline-remove-local" data-id="${escapeAttr(f.id)}">QUITAR OFFLINE</button></div>
          </article>`;
        }).join(""):`<div class="library-empty-folder"><div><span>↓</span><span>▤</span></div><strong>Aún no has marcado archivos para uso offline.</strong><p>Vuelve a Archivos y carpetas y pulsa OFFLINE en los libros o PDFs que quieras llevar contigo.</p></div>`}
      </div>
    </section>`;
  $$(".v29-offline-bundle-open").forEach(b=>b.onclick=()=>openPreparedOfflineBundleV29(b.dataset.key));
  $$(".offline-open-local").forEach(b=>b.onclick=()=>openOfflineFileById(b.dataset.id));
  $$(".offline-remove-local").forEach(b=>b.onclick=async()=>{await offlineRemoveFile(b.dataset.id);renderOfflineStudyVault()});
}

async function openPreparedOfflineBundleV29(key){
  const box=$("#study-library-content"),bundle=await offlineGetJson(key);
  if(!bundle)return toast("Ya no encuentro este paquete offline.",true);
  const bank=bundle.question_bank||[],cards=bundle.flashcards||[],packs=bundle.historical_packs||[];
  box.innerHTML=`<section class="v29-offline-bundle-page">
    <button id="v29-offline-back" class="ghost-btn">← ESTUDIO OFFLINE</button>
    <header><div class="learning-home-chip"><span></span> MODO SOLO OFFLINE · V29</div><h2>${escapeHtml(bundle.subject?.name||"Materia")}</h2><p>Este contenido está almacenado en este dispositivo. No necesita una llamada nueva de IA.</p></header>
    <section class="v29-result-metrics"><div><strong>${cards.length}</strong><span>flashcards</span></div><div><strong>${packs.length}</strong><span>repasos históricos</span></div><div><strong>${bank.length}</strong><span>preguntas</span></div></section>
    <div class="v29-offline-bundle-grid">
      <article class="card"><div class="panel-code">PREGUNTAS</div>${bank.slice(0,20).map((q,i)=>`<div class="v29-offline-question"><span>${i+1}</span><div><strong>${escapeHtml(q.stem||"")}</strong><small>${escapeHtml(q.topic||"")}</small></div></div>`).join("")||`<div class="system-empty compact">Sin preguntas guardadas.</div>`}</article>
      <article class="card"><div class="panel-code">FLASHCARDS</div>${cards.slice(0,20).map((c,i)=>`<details><summary>${escapeHtml(c.front||"Tarjeta")}</summary><p>${escapeHtml(c.back||"")}</p></details>`).join("")||`<div class="system-empty compact">Sin flashcards guardadas.</div>`}</article>
    </div>
    <section class="card"><div class="panel-code">REPASOS DE CLAVES</div>${packs.map(p=>`<details class="v29-offline-pack"><summary>${escapeHtml(p.pack?.title||p.title||"Repaso")}</summary><p>${escapeHtml(p.pack?.overview||"")}</p><div>${(p.pack?.must_remember||[]).slice(0,12).map(x=>`<p>• ${escapeHtml(x)}</p>`).join("")}</div></details>`).join("")||`<div class="system-empty compact">Sin paquetes históricos.</div>`}</section>
  </section>`;
  $("#v29-offline-back").onclick=renderOfflineStudyVault;
}

async function openOfflineFileById(id){
  const rec=await offlineGetFileRecord(id);
  if(!rec)return toast("Ya no encuentro la copia offline.",true);
  const fake={id,title:rec.title||rec.name,metadata_json:JSON.stringify({mime_type:rec.mime,original_name:rec.name,size_bytes:rec.size})};
  const info=libraryFileIcon(rec.mime||"",rec.name||rec.title);
  const type=info.cls==="pdf"?"pdf":info.cls==="image"?"image":info.cls==="text"?"text":"other";
  const url=URL.createObjectURL(rec.blob);
  if(type==="pdf"||type==="image"||type==="text")openLibraryViewer(fake,type,url);
  else{
    const a=document.createElement("a");a.href=url;a.download=rec.name||rec.title||"archivo";a.click();setTimeout(()=>URL.revokeObjectURL(url),5000);
  }
}
async function createStudyLibraryFolder(){
  const name=prompt("Nombre de la nueva carpeta:");
  if(!name?.trim())return;
  try{
    await api("/api/library/folder",{method:"POST",body:{name:name.trim(),parent_id:state.libraryFolderId}});
    toast("Carpeta creada.");
    loadStudyLibrary(state.libraryFolderId);
  }catch(err){toast(err.message,true)}
}

async function uploadStudyLibraryFiles(fileList){
  const files=[...(fileList||[])];if(!files.length)return;
  const max=50*1024*1024;
  const tooBig=files.find(f=>f.size>max);
  if(tooBig)return toast(`${tooBig.name} supera el límite de 50 MB por archivo.`,true);

  const box=$("#study-library-content");
  const progress=document.createElement("section");
  progress.className="library-upload-progress";
  progress.innerHTML=`<div class="library-upload-progress-head"><span>↑</span><div><strong>Subiendo ${files.length} archivo${files.length===1?"":"s"} a tu Biblioteca</strong><small id="library-upload-status">Preparando…</small></div></div><div class="library-upload-bar"><i id="library-upload-bar-fill"></i></div>`;
  box.prepend(progress);

  try{
    let done=0;
    for(const file of files){
      $("#library-upload-status").textContent=`${file.name} · ${done+1} de ${files.length}`;
      const form=new FormData();
      form.append("file",file,file.name);
      if(state.libraryFolderId)form.append("parent_id",state.libraryFolderId);
      const res=await fetch("/api/library/upload",{method:"POST",body:form,credentials:"same-origin"});
      const data=await res.json().catch(()=>({}));
      if(!res.ok)throw new Error(data.error||`No pude subir ${file.name}.`);
      done++;
      $("#library-upload-bar-fill").style.width=`${Math.round(done/files.length*100)}%`;
    }
    toast(`${files.length} archivo${files.length===1?"":"s"} guardado${files.length===1?"":"s"}.`);
    await loadStudyLibrary(state.libraryFolderId);
  }catch(err){
    progress.remove();
    toast(err.message,true);
  }
}

function libraryFileUrl(id,inline=false){
  return `/api/library/file?id=${encodeURIComponent(id)}${inline?"&inline=1":""}`;
}

async function openStudyLibraryFile(id){
  const file=(state.libraryData?.files||[]).find(x=>x.id===id);
  if(!file)return;
  const meta=getLibraryMeta(file),mime=meta.mime_type||"",name=meta.original_name||file.title;
  const ext=String(name).split(".").pop().toLowerCase();
  const local=await offlineGetFileRecord(id);
  let localUrl=null;
  if(local?.blob)localUrl=URL.createObjectURL(local.blob);

  if(mime==="application/pdf"||ext==="pdf"){
    openLibraryViewer(file,"pdf",localUrl);
    return;
  }
  if(mime.startsWith("image/")){
    openLibraryViewer(file,"image",localUrl);
    return;
  }
  if(mime.startsWith("text/")||["txt","md","rtf"].includes(ext)){
    openLibraryViewer(file,"text",localUrl);
    return;
  }
  if(localUrl){
    const a=document.createElement("a");a.href=localUrl;a.download=name||file.title;a.click();setTimeout(()=>URL.revokeObjectURL(localUrl),5000);return;
  }
  if(!navigator.onLine)return toast("Este archivo no fue guardado para uso offline.",true);
  window.open(libraryFileUrl(id,true),"_blank","noopener,noreferrer");
}

function openLibraryViewer(file,type,localUrl=null){
  const meta=getLibraryMeta(file);
  let overlay=$("#library-file-viewer");
  if(!overlay){
    overlay=document.createElement("div");
    overlay.id="library-file-viewer";
    overlay.className="library-file-viewer";
    document.body.appendChild(overlay);
  }
  const url=localUrl||libraryFileUrl(file.id,true);
  overlay.innerHTML=`<div class="library-viewer-shell">
    <header><div><span>${escapeHtml(libraryFileIcon(meta.mime_type||"",meta.original_name||file.title).label)}</span><strong>${escapeHtml(file.title)}</strong></div><div><button id="library-viewer-download" class="secondary-btn">↓ DESCARGAR</button><button id="library-viewer-close" class="library-viewer-close">×</button></div></header>
    <main>${type==="pdf"?`<iframe src="${escapeAttr(url)}" title="${escapeAttr(file.title)}"></iframe>`:type==="image"?`<div class="library-image-view"><img src="${escapeAttr(url)}" alt="${escapeAttr(file.title)}"></div>`:`<iframe src="${escapeAttr(url)}" title="${escapeAttr(file.title)}"></iframe>`}</main>
  </div>`;
  document.body.classList.add("modal-open");
  const close=()=>{overlay.remove();document.body.classList.remove("modal-open");if(localUrl)URL.revokeObjectURL(localUrl)};
  $("#library-viewer-close").onclick=close;
  $("#library-viewer-download").onclick=()=>downloadStudyLibraryFile(file.id);
  overlay.onclick=e=>{if(e.target===overlay)close()};
}

async function downloadStudyLibraryFile(id){
  const local=await offlineGetFileRecord(id);
  const a=document.createElement("a");
  if(local?.blob){
    const url=URL.createObjectURL(local.blob);
    a.href=url;a.download=local.name||local.title||"archivo";
    document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),5000);return;
  }
  if(!navigator.onLine)return toast("Este archivo no está guardado offline.",true);
  a.href=libraryFileUrl(id,false);
  a.rel="noopener";
  document.body.appendChild(a);a.click();a.remove();
}

async function renameStudyLibraryItem(id,type,currentName){
  const name=prompt("Nuevo nombre:",currentName||"");
  if(!name?.trim()||name.trim()===currentName)return;
  try{
    await api("/api/library/item",{method:"PUT",body:{id,type,name:name.trim()}});
    toast("Nombre actualizado.");
    loadStudyLibrary(state.libraryFolderId);
  }catch(err){toast(err.message,true)}
}

async function deleteStudyLibraryItem(id,type,name){
  const folder=type==="folder";
  const msg=folder?`¿Eliminar la carpeta "${name}" y todo lo que contiene?`:`¿Eliminar "${name}" de tu Biblioteca?`;
  if(!confirm(msg))return;
  try{
    await api(`/api/library/item?id=${encodeURIComponent(id)}&type=${encodeURIComponent(type)}`,{method:"DELETE"});
    toast(folder?"Carpeta eliminada.":"Archivo eliminado.");
    loadStudyLibrary(state.libraryFolderId);
  }catch(err){toast(err.message,true)}
}


/* ============================================================
   V26.1 · ANTES DEL PARCIAL
   ============================================================ */

function examPrepDaysLabel(date){
  if(!date)return "SIN FECHA";
  const diff=Math.ceil((new Date(date)-new Date())/86400000);
  if(!Number.isFinite(diff))return "SIN FECHA";
  if(diff<0)return "VENCIDO";
  if(diff===0)return "HOY";
  if(diff===1)return "MAÑANA";
  return `${diff} DÍAS`;
}

async function renderExamPrepCenter(){
  root.innerHTML=`<div class="system-center-loading"><div class="v17-loading-orb"><i></i><i></i><i></i></div><strong>Preparando tu centro para el parcial…</strong><small>Claves históricas + plan + errores + banco de preguntas.</small></div>`;
  try{
    const [dash,keys,planData]=await Promise.all([
      api("/api/smart/dashboard"),
      api("/api/smart/historical-keys?list=1"),
      api("/api/exam-prep/plan")
    ]);
    const packs=keys.packs||dash.historical_keys||[],due=Number(dash.review_due||0),deadline=dash.next_deadline||null;
    const latest=packs[0]||null,trends=dash.historical_key_trends||[],plan=planData.plan||null;
    state.examPrepPlan=plan;

    root.innerHTML=`
      <section class="exam-prep-hero">
        <div>
          <div class="learning-home-chip"><span></span> ANTES DEL PARCIAL · V29 FINAL</div>
          <h1>Tu centro de preparación antes del examen.</h1>
          <p>Claves de años anteriores, clase, repaso, banco permanente, errores y simulacros. MED AI usa la frecuencia histórica para priorizar, nunca como garantía de lo que vendrá.</p>
          <div class="exam-prep-actions">
            <button id="exam-prep-upload" class="primary-btn">▤ SUBIR CLAVES DE AÑOS PASADOS</button>
            <button id="exam-prep-errors" class="secondary-btn">↻ REPASAR ERRORES ${due?`· ${due}`:""}</button>
            <button id="exam-prep-bank" class="secondary-btn">▦ BANCO DE PREGUNTAS</button>
          </div>
        </div>
        <aside class="exam-prep-countdown ${deadline||plan?"active":""}">
          <span>PRÓXIMO PARCIAL</span>
          <strong>${examPrepDaysLabel(plan?.due_at||deadline?.due_at)}</strong>
          <small>${escapeHtml(plan?.title||deadline?.title||"Configura tu próximo parcial abajo")}</small>
        </aside>
      </section>

      <section class="card v29-exam-plan-builder">
        <div class="smart-section-head"><div><span>PARCIAL PRÓXIMO</span><h2>Plan automático hasta el examen</h2></div><small>Sin IA · usa historial + dominio actual</small></div>
        <div class="v29-plan-form">
          <div class="field"><label>Materia</label><input id="v29-plan-subject" placeholder="Ej. Química" value="${escapeAttr(plan?.subject||latest?.subject||"")}"></div>
          <div class="field"><label>Fecha del parcial</label><input id="v29-plan-date" type="date" value="${escapeAttr(String(plan?.due_at||"").slice(0,10))}"></div>
          <div class="field"><label>Minutos diarios</label><select id="v29-plan-minutes">${[30,45,60,90,120].map(n=>`<option value="${n}" ${Number(plan?.daily_minutes||60)===n?"selected":""}>${n} min</option>`).join("")}</select></div>
          <button id="v29-create-plan" class="primary-btn">CREAR / ACTUALIZAR PLAN</button>
        </div>
        <div id="v29-plan-result">${plan?renderExamPrepPlanV29(plan):`<div class="system-empty compact">Agrega materia y fecha para que MED AI distribuya tus prioridades día por día.</div>`}</div>
      </section>

      <section class="exam-prep-step-grid">
        <article><b>01</b><span><strong>CLAVES</strong><small>Sube varios PDF históricos</small></span></article>
        <article><b>02</b><span><strong>CLASE</strong><small>Aprende los temas detectados</small></span></article>
        <article><b>03</b><span><strong>REPASO</strong><small>Fija conceptos y practica</small></span></article>
        <article><b>04</b><span><strong>EXAMEN</strong><small>Final + adaptativo</small></span></article>
      </section>

      ${latest?`
      <section class="card exam-prep-current">
        <div class="exam-prep-current-head">
          <div><span>REPASO MÁS RECIENTE</span><h2>${escapeHtml(latest.study_title||latest.title||"Claves históricas")}</h2><p>${escapeHtml(latest.subject||"")} · ${Number(latest.source_count||0)} PDF históricos</p></div>
          <button id="exam-prep-open-analysis" class="ghost-btn">VER ANÁLISIS →</button>
        </div>
        <div class="exam-prep-stage-buttons">
          <button data-prep-tab="analysis"><span>01</span><div><strong>ANÁLISIS</strong><small>Temas y frecuencia histórica</small></div></button>
          <button data-prep-tab="class"><span>02</span><div><strong>CLASE</strong><small>Explicación completa</small></div></button>
          <button data-prep-tab="review"><span>03</span><div><strong>REPASO</strong><small>Puntos clave + práctica</small></div></button>
          <button data-prep-tab="exam"><span>04</span><div><strong>EXAMEN FINAL</strong><small>Preguntas ya guardadas</small></div></button>
        </div>
      </section>`:`
      <section class="card exam-prep-empty">
        <div>▤</div><h2>Aún no has preparado tus claves históricas.</h2>
        <p>Sube varios PDF de años anteriores de la misma materia. MED AI construirá análisis, clase, repaso y examen final.</p>
        <button id="exam-prep-empty-upload" class="primary-btn">SUBIR MIS PRIMERAS CLAVES</button>
      </section>`}

      <section class="exam-prep-main-grid">
        <article class="card">
          <div class="smart-section-head"><div><span>PATRONES HISTÓRICOS</span><h2>Temas que más se han repetido</h2></div><small>Evidencia de tus PDF</small></div>
          ${trends.length?`<div class="smart-trend-bars">${trends.slice(0,10).map(t=>`<div><span>${escapeHtml(t.topic)}</span><i><b style="width:${Math.min(100,Number(t.score||0))}%"></b></i><strong>${Number(t.count||0)}×</strong></div>`).join("")}</div>`:`<div class="system-empty">Aparecerán después de crear tu primer paquete.</div>`}
        </article>
        <article class="card">
          <div class="smart-section-head"><div><span>LISTOS PARA REPASAR</span><h2>Mis paquetes</h2></div><b>${packs.length}</b></div>
          <div class="exam-prep-pack-list">${packs.length?packs.slice(0,8).map(p=>`<button class="exam-prep-pack" data-id="${escapeAttr(p.id)}"><span>▤</span><div><strong>${escapeHtml(p.study_title||p.title)}</strong><small>${escapeHtml(p.subject||"")} · ${Number(p.source_count||0)} PDF</small></div><b>ESTUDIAR →</b></button>`).join(""):`<div class="system-empty compact">No hay paquetes todavía.</div>`}</div>
        </article>
      </section>`;

    $("#exam-prep-upload").onclick=()=>openHistoricalKeysStudio();
    $("#exam-prep-empty-upload")?.addEventListener("click",()=>openHistoricalKeysStudio());
    $("#exam-prep-errors").onclick=startSmartReview;
    $("#exam-prep-bank").onclick=()=>navigate("question_bank");
    $("#v29-create-plan").onclick=createExamPrepPlanV29;
    if(latest){
      $("#exam-prep-open-analysis").onclick=()=>openHistoricalKeysPack(latest.id,false,"analysis");
      $$(".exam-prep-stage-buttons button").forEach(b=>b.onclick=()=>openHistoricalKeysPack(latest.id,false,b.dataset.prepTab));
    }
    $$(".exam-prep-pack").forEach(b=>b.onclick=()=>openHistoricalKeysPack(b.dataset.id,false,"analysis"));
  }catch(err){
    logSystemError("exam_prep",err);
    root.innerHTML=`<div class="card masterclass-error"><strong>No pude abrir Antes del parcial.</strong><p>${escapeHtml(err.message)}</p><button id="exam-prep-retry" class="primary-btn">REINTENTAR</button></div>`;
    $("#exam-prep-retry").onclick=renderExamPrepCenter;
  }
}
function renderExamPrepPlanV29(plan){
  const sessions=plan?.sessions||[];
  return `<section class="v29-plan-timeline">
    <div class="v29-plan-summary"><span>${Number(plan.days_remaining||sessions.length)} días</span><strong>${escapeHtml(plan.title||"Parcial")}</strong><small>${Number(plan.daily_minutes||60)} min/día · ${escapeHtml(plan.subject||"")}</small></div>
    <div>${sessions.slice(0,16).map(s=>`<article><b>${escapeHtml(String(s.date||"").slice(5))}</b><div><strong>${escapeHtml(s.title)}</strong><small>${escapeHtml(s.task||"")}</small>${s.reason?`<em>${escapeHtml(s.reason)}</em>`:""}</div><span>${Number(s.minutes||0)}m</span></article>`).join("")}</div>
  </section>`;
}
async function createExamPrepPlanV29(){
  const subject=$("#v29-plan-subject").value.trim(),date=$("#v29-plan-date").value,minutes=Number($("#v29-plan-minutes").value);
  if(!subject||!date)return toast("Escribe la materia y selecciona la fecha del parcial.",true);
  const btn=$("#v29-create-plan");btn.disabled=true;btn.textContent="CREANDO PLAN…";
  try{
    const d=await api("/api/exam-prep/plan",{method:"POST",body:{subject,due_at:`${date}T23:59:00`,daily_minutes:minutes,title:`Parcial de ${subject}`}});
    state.examPrepPlan=d.plan;$("#v29-plan-result").innerHTML=renderExamPrepPlanV29(d.plan);toast("Plan del parcial guardado.");
  }catch(err){toast(err.message,true)}
  finally{btn.disabled=false;btn.textContent="CREAR / ACTUALIZAR PLAN"}
}

/* ============================================================
   V25 · SMART STUDY ENGINE
   Retrieval-first + spaced review + past exam intelligence
   ============================================================ */

async function renderSmartStudy(){
  root.innerHTML=`<div class="smart-loading"><div class="v17-loading-orb"><i></i><i></i><i></i></div><strong>Construyendo tu tablero inteligente…</strong><small>Primero usamos tus datos guardados; no estamos llamando a la IA.</small></div>`;
  try{
    const d=await api("/api/smart/dashboard");
    state.smartDashboard=d;
    const weak=d.weaknesses||[],due=Number(d.review_due||0),exams=d.past_exams||[],trend=d.exam_trends||[];
    const historicalKeys=d.historical_keys||[],keyTrend=d.historical_key_trends||[];
    const deadline=d.next_deadline;
    root.innerHTML=`
      <section class="smart-hero">
        <div>
          <div class="learning-home-chip"><span></span> SMART STUDY ENGINE · V29</div>
          <h1>Estudia lo que más necesitas, no lo que ya dominas.</h1>
          <p>MED AI combina tus errores, progreso, clases guardadas, Biblioteca y parciales anteriores. Primero reutiliza tus datos; la IA se reserva para cuando realmente agrega valor.</p>
          <div class="smart-hero-actions">
            <button id="smart-start-review" class="primary-btn">▶ REPASO DE HOY ${due?`· ${due}`:""}</button>
            <button id="smart-upload-exam" class="secondary-btn">▤ CLAVES DE AÑOS PASADOS</button>
            <input id="smart-exam-input" type="file" accept="application/pdf,.pdf" multiple hidden>
          </div>
        </div>
        <div class="smart-brain">
          <div class="smart-brain-core">✦</div>
          <span class="node n1">PDF</span><span class="node n2">✓</span><span class="node n3">D1</span><span class="node n4">R2</span>
        </div>
      </section>

      <section class="smart-metric-grid">
        <article><span class="mint">↻</span><div><b>${due}</b><strong>repasos pendientes</strong><small>${due?"Prioridad para hoy":"Todo al día"}</small></div></article>
        <article><span class="violet">◎</span><div><b>${weak.length?Math.round(Number(weak[0]?.mastery||0)):100}%</b><strong>tema más débil</strong><small>${escapeHtml(weak[0]?.topic_name||"Sin debilidades registradas")}</small></div></article>
        <article><span class="amber">▤</span><div><b>${Number(d.material_count||0)}</b><strong>materiales aprovechables</strong><small>Clases, apuntes y sesiones guardadas</small></div></article>
        <article><span class="blue">▤</span><div><b>${historicalKeys.length}</b><strong>repasos de claves</strong><small>Paquetes guardados para reutilizar</small></div></article>
      </section>

      <section class="smart-grid-main">
        <article class="card smart-today-card">
          <div class="smart-section-head"><div><span>PLAN DE HOY · SIN IA</span><h2>Tu siguiente mejor sesión</h2></div><b>${deadline?smartDaysUntil(deadline.due_at):"∞"}</b></div>
          <div class="smart-recommendations">
            ${(d.recommendations||[]).map((r,i)=>`<div><span>${String(i+1).padStart(2,"0")}</span><div><strong>${escapeHtml(r.title)}</strong><small>${escapeHtml(r.detail)}</small></div><em>${escapeHtml(r.minutes||"")}</em></div>`).join("")||`<div><span>✓</span><div><strong>Buen momento para avanzar curso</strong><small>No hay repasos urgentes registrados.</small></div></div>`}
          </div>
          ${deadline?`<div class="smart-deadline"><span>PRÓXIMA FECHA</span><strong>${escapeHtml(deadline.title)}</strong><small>${formatDate(deadline.due_at)} · importancia ${Number(deadline.importance||3)}/5</small></div>`:""}
        </article>

        <article class="card smart-weak-card">
          <div class="smart-section-head"><div><span>DOMINIO REAL</span><h2>Temas que necesitan trabajo</h2></div><small>Basado en progreso + errores</small></div>
          <div class="smart-weak-list">
            ${weak.length?weak.slice(0,6).map(w=>`<button class="smart-weak-topic" data-topic="${escapeAttr(w.topic_name)}">
              <div><strong>${escapeHtml(w.topic_name)}</strong><small>${escapeHtml(w.subject_name||"")}</small></div>
              <span>${Math.round(Number(w.mastery||0))}%</span><i><b style="width:${Math.max(2,Number(w.mastery||0))}%"></b></i>
            </button>`).join(""):`<div class="empty">Todavía no hay suficiente información de dominio. Sigue realizando prácticas y exámenes.</div>`}
          </div>
        </article>
      </section>

      <section class="card smart-rag-card">
        <div class="smart-rag-head">
          <div><span>PREGUNTA A TODO LO QUE YA HAS ESTUDIADO</span><h2>Busca primero en tus materiales.</h2><p>La búsqueda local en D1 no consume Gemini. Solo pulsa “Responder con IA” si necesitas que MED AI conecte las fuentes.</p></div>
          <label class="smart-quality"><span>CALIDAD IA</span><select id="smart-quality"><option value="economy">Ahorro · Flash</option><option value="balanced">Equilibrado · Flash</option><option value="max">Máxima · Pro</option></select></label>
        </div>
        <div class="smart-searchbar"><span>⌕</span><input id="smart-query" placeholder="Ej. ¿Qué he estudiado sobre sistema renina angiotensina?"><button id="smart-search" class="secondary-btn">BUSCAR SIN IA</button><button id="smart-ask" class="primary-btn">✦ RESPONDER CON IA</button></div>
        <div id="smart-search-results" class="smart-search-results"><div class="smart-search-empty">Escribe un tema para buscar en tus cursos, apuntes, clases universitarias y sesiones de Biblioteca.</div></div>
      </section>

      <section class="smart-grid-main">
        <article class="card smart-exam-trends">
          <div class="smart-section-head"><div><span>CLAVES DE AÑOS PASADOS</span><h2>Qué se ha repetido históricamente</h2></div><button id="smart-open-keys-studio" class="ghost-btn">ABRIR ESTUDIO →</button></div>
          ${keyTrend.length?`<div class="smart-trend-bars">${keyTrend.slice(0,8).map((t,i)=>`<div><span>${escapeHtml(t.topic)}</span><i><b style="width:${Math.min(100,Number(t.score||0))}%"></b></i><strong>${Number(t.count||0)}×</strong></div>`).join("")}</div>`:`<div class="smart-exam-empty"><span>▤</span><strong>Aún no has creado un repaso desde claves pasadas.</strong><p>Sube varios PDF de claves de años anteriores. MED AI detectará los temas históricos, te dará una clase/repaso y guardará un examen final nuevo.</p></div>`}
          <div class="smart-past-exam-list">${historicalKeys.slice(0,5).map(x=>`<button class="smart-open-historical-keys" data-id="${escapeAttr(x.id)}"><span>▤</span><div><strong>${escapeHtml(x.study_title||x.title)}</strong><small>${escapeHtml(x.subject||"Claves históricas")} · ${Number(x.source_count||0)} PDF</small></div><b>ESTUDIAR →</b></button>`).join("")}</div>
        </article>

        <article class="card smart-health">
          <div class="smart-section-head"><div><span>SISTEMA DE ESTUDIO</span><h2>Todo conectado</h2></div><b class="smart-health-ok">●</b></div>
          <div class="smart-health-list">
            <div><span>D1</span><strong>${d.health?.db?"LISTO":"REVISAR"}</strong></div>
            <div><span>R2 · Biblioteca</span><strong>${d.health?.r2?"LISTO":"REVISAR"}</strong></div>
            <div><span>AI Gateway / Workers AI</span><strong>${d.health?.ai?"CONFIGURADO":"REVISAR"}</strong></div>
            <div><span>Offline Vault</span><strong>${state.offlineReady||("indexedDB" in window)?"DISPONIBLE":"NO DISPONIBLE"}</strong></div>
            <div><span>Conexión actual</span><strong>${navigator.onLine?"ONLINE":"OFFLINE"}</strong></div>
          </div>
          <p>Este panel comprueba bindings y capacidades sin hacer una llamada de IA, por lo que no gasta créditos.</p>
        </article>
      </section>`;

    $("#smart-quality").value=state.smartQuality;
    $("#smart-quality").onchange=e=>{state.smartQuality=e.target.value;localStorage.setItem("medai_smart_quality",state.smartQuality)};
    $("#smart-start-review").onclick=startSmartReview;
    $("#smart-upload-exam").onclick=()=>openHistoricalKeysStudio();
    $("#smart-exam-input").onchange=e=>{const files=[...(e.target.files||[])];if(files.length)openHistoricalKeysStudio({files})};
    $("#smart-open-keys-studio").onclick=()=>openHistoricalKeysStudio();
    $("#smart-search").onclick=()=>smartRetrieve(false);
    $("#smart-ask").onclick=()=>smartRetrieve(true);
    $("#smart-query").addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();smartRetrieve(false)}});
    $$(".smart-weak-topic").forEach(b=>b.onclick=()=>{$("#smart-query").value=b.dataset.topic;smartRetrieve(false)});
    $$(".smart-open-past-exam").forEach(b=>b.onclick=()=>openPastExamPack(b.dataset.id));
    $$(".smart-open-historical-keys").forEach(b=>b.onclick=()=>openHistoricalKeysPack(b.dataset.id));
  }catch(err){
    root.innerHTML=`<div class="card masterclass-error"><strong>No pude preparar Repaso inteligente.</strong><p>${escapeHtml(err.message)}</p><button id="smart-retry" class="primary-btn">REINTENTAR</button></div>`;
    $("#smart-retry").onclick=renderSmartStudy;
  }
}

function smartDaysUntil(date){
  const d=Math.ceil((new Date(date)-new Date())/86400000);
  if(!Number.isFinite(d))return "—";
  if(d<0)return "VENCIDO";
  if(d===0)return "HOY";
  return `${d}D`;
}

async function smartRetrieve(useAI=false){
  const q=$("#smart-query")?.value.trim();if(!q)return toast("Escribe qué quieres estudiar.",true);
  const box=$("#smart-search-results");
  box.innerHTML=`<div class="smart-search-loading"><div class="v17-loading-orb"><i></i><i></i><i></i></div><strong>${useAI?"Buscando fuentes antes de responder…":"Buscando en tus materiales sin IA…"}</strong></div>`;
  try{
    if(useAI){
      if(!navigator.onLine)throw new Error("La respuesta nueva con IA necesita internet. La búsqueda de materiales sí funciona offline si ya la hiciste antes.");
      const d=await api("/api/smart/ask",{method:"POST",body:{query:q,quality:state.smartQuality}});
      state.smartSearchResults=d.sources||[];
      box.innerHTML=`<article class="smart-answer">
        <div class="smart-answer-top"><span>✦ RESPUESTA BASADA EN TUS MATERIALES</span><b>${escapeHtml(d.model_label||"Gemini")}</b></div>
        <div class="rich-response">${renderRichResponse(d.answer||"")}</div>
        ${renderSmartSources(d.sources||[])}
      </article>`;
    }else{
      const d=await api(`/api/smart/retrieve?q=${encodeURIComponent(q)}`);
      state.smartSearchResults=d.sources||[];
      box.innerHTML=(d.sources||[]).length?renderSmartSources(d.sources,true):`<div class="smart-search-empty">No encontré material guardado suficientemente relacionado con “${escapeHtml(q)}”. Puedes seguir estudiándolo con Tutor IA o agregar material a Biblioteca.</div>`;
    }
  }catch(err){box.innerHTML=`<div class="masterclass-error"><strong>No pude completar la búsqueda.</strong><p>${escapeHtml(err.message)}</p></div>`}
}

function renderSmartSources(sources,full=false){
  if(!sources?.length)return `<div class="smart-source-note">No se utilizaron fuentes guardadas.</div>`;
  return `<section class="smart-sources"><div class="panel-code">${full?"RESULTADOS · SIN IA":"FUENTES UTILIZADAS"}</div>${sources.map((s,i)=>`<article>
    <span>${i+1}</span><div><strong>${escapeHtml(s.title||"Material")}</strong><small>${escapeHtml(s.label||s.type||"Fuente guardada")}${s.scope?` · ${escapeHtml(s.scope)}`:""}</small>${full?`<p>${escapeHtml(s.snippet||"")}</p>`:""}</div><b>${Math.round(Number(s.score||0))}</b>
  </article>`).join("")}</section>`;
}

/* -------- Adaptive spaced review -------- */

async function startSmartReview(){
  root.innerHTML=`<div class="smart-loading"><div class="v17-loading-orb"><i></i><i></i><i></i></div><strong>Preparando tus preguntas pendientes…</strong><small>Usamos tus errores guardados, no Gemini.</small></div>`;
  try{
    const d=await api("/api/smart/review-set?limit=12");
    state.smartReview={items:d.items||[],index:0,results:[]};
    renderSmartReviewCard();
  }catch(err){root.innerHTML=`<div class="card masterclass-error"><strong>No pude abrir el repaso.</strong><p>${escapeHtml(err.message)}</p><button class="primary-btn" id="back-smart">VOLVER</button></div>`;$("#back-smart").onclick=renderSmartStudy}
}

function renderSmartReviewCard(){
  const st=state.smartReview,item=st?.items?.[st.index];
  if(!item){renderSmartReviewDone();return}
  root.innerHTML=`<section class="smart-review-shell">
    <header><button id="smart-review-exit" class="ghost-btn">← REPASO INTELIGENTE</button><div><span>RECUPERACIÓN ESPACIADA</span><strong>${st.index+1} / ${st.items.length}</strong></div></header>
    <div class="smart-review-progress"><i style="width:${Math.round(st.index/st.items.length*100)}%"></i></div>
    <article class="smart-review-card">
      <div class="smart-review-meta"><span>${escapeHtml(item.topic_name||item.error_category||"Concepto a reforzar")}</span><b>DOMINIO ${Math.round(Number(item.mastery_score||0))}%</b></div>
      <div class="smart-review-icon">?</div>
      <h1>${escapeHtml(item.prompt)}</h1>
      <p>Intenta responder de memoria antes de revelar la solución.</p>
      <button id="smart-reveal" class="primary-btn">MOSTRAR RESPUESTA</button>
      <div id="smart-review-answer" class="smart-review-answer hidden">
        <div><span>RESPUESTA CORRECTA</span><strong>${escapeHtml(item.correct_answer||"")}</strong></div>
        ${item.explanation?`<p>${escapeHtml(item.explanation)}</p>`:""}
        <div class="smart-rating">
          <button data-rating="0" class="again"><b>↻</b><span>NO LO SABÍA<small>Repetir pronto</small></span></button>
          <button data-rating="1" class="hard"><b>~</b><span>DIFÍCIL<small>Necesita refuerzo</small></span></button>
          <button data-rating="2" class="good"><b>✓</b><span>BIEN<small>Ya lo recuerdo</small></span></button>
          <button data-rating="3" class="easy"><b>✦</b><span>FÁCIL<small>Espaciar más</small></span></button>
        </div>
      </div>
    </article>
  </section>`;
  $("#smart-review-exit").onclick=renderSmartStudy;
  $("#smart-reveal").onclick=()=>{$("#smart-review-answer").classList.remove("hidden");$("#smart-reveal").classList.add("hidden")};
  $$(".smart-rating button").forEach(b=>b.onclick=()=>rateSmartReview(item,Number(b.dataset.rating)));
}

async function rateSmartReview(item,rating){
  state.smartReview.results.push({id:item.id,rating});
  try{await api("/api/smart/review",{method:"POST",body:{mistake_id:item.id,rating}})}catch{}
  state.smartReview.index++;
  renderSmartReviewCard();
}

function renderSmartReviewDone(){
  const r=state.smartReview?.results||[];
  const good=r.filter(x=>x.rating>=2).length;
  root.innerHTML=`<section class="master-stage-complete smart-review-complete">
    <div class="master-stage-check">✓</div><div class="eyebrow">REPASO TERMINADO</div>
    <h2>${good} de ${r.length} conceptos recordados bien</h2>
    <p>Las fechas del próximo repaso fueron reajustadas según tus respuestas. No se utilizó IA para esta sesión.</p>
    <div class="master-stage-actions"><button id="smart-review-home" class="secondary-btn">VER TABLERO</button><button id="smart-review-more" class="primary-btn">OTRO REPASO</button></div>
  </section>`;
  $("#smart-review-home").onclick=renderSmartStudy;
  $("#smart-review-more").onclick=startSmartReview;
}


/* -------- V25.2 · Historical Keys Study -------- */

function ensureHistoricalKeysOverlay(){
  let o=$("#historical-keys-overlay");
  if(o)return o;
  o=document.createElement("div");
  o.id="historical-keys-overlay";o.className="historical-keys-overlay hidden";
  o.innerHTML=`<div class="historical-keys-shell">
    <header><div><span>MED AI · HISTORICAL KEYS STUDY</span><strong id="historical-keys-title">Claves de años pasados</strong></div><button id="historical-keys-close" class="library-viewer-close">×</button></header>
    <main id="historical-keys-body"></main>
  </div>`;
  document.body.appendChild(o);
  $("#historical-keys-close").onclick=closeHistoricalKeysStudio;
  o.onclick=e=>{if(e.target===o)closeHistoricalKeysStudio()};
  return o;
}
function closeHistoricalKeysStudio(){
  $("#historical-keys-overlay")?.classList.add("hidden");
  document.body.classList.remove("modal-open");
}
async function openHistoricalKeysStudio(options={}){
  const o=ensureHistoricalKeysOverlay();o.classList.remove("hidden");document.body.classList.add("modal-open");
  if(options.files?.length){
    state.historicalKeysDraft=options.files.map(f=>({kind:"local",file:f,name:f.name,size:f.size}));
  }else if(options.libraryFileId){
    const f=(state.libraryData?.files||[]).find(x=>x.id===options.libraryFileId);
    state.historicalKeysDraft=[{kind:"library",id:options.libraryFileId,name:f?.title||"Clave histórica PDF"}];
  }else if(!state.historicalKeysDraft?.length){
    state.historicalKeysDraft=[];
  }
  $("#historical-keys-body").innerHTML=`<div class="library-loading"><div class="v17-loading-orb"><i></i><i></i><i></i></div><strong>Preparando estudio de claves históricas…</strong></div>`;
  let saved=[];
  try{
    const d=await api("/api/smart/historical-keys?list=1");
    saved=d.packs||[];
  }catch{}
  renderHistoricalKeysHome(saved);
}

function renderHistoricalKeysHome(saved=[]){
  const box=$("#historical-keys-body"),draft=state.historicalKeysDraft||[];
  box.innerHTML=`<section class="historical-keys-home">
    <div class="historical-keys-hero">
      <div class="historical-keys-icon">▤</div>
      <div><span>CLAVES DE AÑOS PASADOS</span><h2>Convierte varios parciales viejos en un solo plan de estudio.</h2><p>Sube los PDF de claves/parciales históricos que tengas. MED AI buscará qué temas aparecieron, cuáles se repiten y qué conceptos conviene dominar. Después guarda una clase, un repaso y un examen final nuevo.</p></div>
      <div class="historical-keys-cost"><b>⚡</b><span><strong>PREPARAR UNA VEZ</strong><small>Repasar después no regenera</small></span></div>
    </div>

    <div class="historical-keys-layout">
      <section class="card">
        <div class="panel-code">1 · AGREGA TUS PDF HISTÓRICOS</div>
        <label class="library-dropzone historical-keys-dropzone" for="historical-keys-files">
          <input id="historical-keys-files" type="file" accept="application/pdf,.pdf" multiple hidden>
          <div>＋</div><strong>AGREGAR VARIOS PDF</strong><span>Puedes seleccionar varios al mismo tiempo · máximo 12 por paquete</span>
        </label>
        <div id="historical-keys-draft-list" class="historical-keys-draft-list">
          ${draft.length?draft.map((x,i)=>`<article><span>PDF</span><div><strong>${escapeHtml(x.name)}</strong><small>${x.kind==="library"?"Ya está en tu Biblioteca":formatBytes(x.size||0)}</small></div><button data-remove="${i}">×</button></article>`).join(""):`<div class="historical-keys-empty">Todavía no has agregado PDF.</div>`}
        </div>
        <div class="field"><label>Materia / curso</label><input id="historical-keys-subject" placeholder="Ej. Fisiología, Química, Física..."></div>
        <div class="field"><label>Indicación opcional</label><textarea id="historical-keys-note" rows="3" placeholder="Ej. Son claves del primer parcial de varios años. Quiero prepararme para mi próximo parcial."></textarea></div>
        <div class="historical-keys-warning"><span>i</span><p>MED AI usa estos archivos como <b>evidencia histórica de estudio</b>, no como garantía de qué vendrá en tu próximo examen. Si una clave contiene únicamente letras como “1-B, 2-C” sin el texto de las preguntas, no hay suficiente información para saber qué tema evaluaba.</p></div>
        <button id="historical-keys-create" class="library-create-study-btn"><span>✦</span><div><strong>CREAR CLASE + REPASO + EXAMEN</strong><small>Analiza el conjunto una sola vez y lo guarda</small></div></button>
      </section>

      <aside class="historical-keys-output">
        <div class="panel-code">MED AI PREPARARÁ</div>
        <div><b>01</b><span><strong>Temas históricos</strong><small>Qué apareció y en cuántos archivos</small></span></div>
        <div><b>02</b><span><strong>Clase maestra</strong><small>Explicación de los conceptos prioritarios</small></span></div>
        <div><b>03</b><span><strong>Repaso de alto rendimiento</strong><small>Puntos clave, trampas y práctica</small></span></div>
        <div><b>04</b><span><strong>Plan de estudio</strong><small>Orden recomendado</small></span></div>
        <div><b>05</b><span><strong>Examen final nuevo</strong><small>20 preguntas · reutilizable</small></span></div>
      </aside>
    </div>

    <section class="historical-keys-saved">
      <div class="library-study-saved-head"><div><span>PAQUETES YA PREPARADOS</span><h3>${saved.length} guardado${saved.length===1?"":"s"}</h3></div><small>Abrirlos no vuelve a usar IA</small></div>
      <div class="smart-past-exam-list">${saved.length?saved.map(x=>`<button class="historical-open-saved" data-id="${escapeAttr(x.id)}"><span>▤</span><div><strong>${escapeHtml(x.study_title||x.title)}</strong><small>${escapeHtml(x.subject||"")} · ${Number(x.source_count||0)} PDF · ${formatDate(x.updated_at)}</small></div><b>ESTUDIAR →</b></button>`).join(""):`<div class="smart-exam-empty"><span>▤</span><strong>Aún no hay paquetes guardados.</strong><p>El primero que crees quedará aquí para volver a estudiarlo.</p></div>`}</div>
    </section>
  </section>`;
  $("#historical-keys-files").onchange=e=>{
    const files=[...(e.target.files||[])].filter(f=>f.type==="application/pdf"||/\.pdf$/i.test(f.name));
    const existing=state.historicalKeysDraft||[];
    state.historicalKeysDraft=[...existing,...files.map(f=>({kind:"local",file:f,name:f.name,size:f.size}))].slice(0,12);
    renderHistoricalKeysHome(saved);
  };
  $$("[data-remove]",box).forEach(b=>b.onclick=()=>{
    state.historicalKeysDraft.splice(Number(b.dataset.remove),1);
    renderHistoricalKeysHome(saved);
  });
  $("#historical-keys-create").onclick=createHistoricalKeysPack;
  $$(".historical-open-saved",box).forEach(b=>b.onclick=()=>openHistoricalKeysPack(b.dataset.id));
}

async function createHistoricalKeysPack(){
  const draft=state.historicalKeysDraft||[],subject=$("#historical-keys-subject").value.trim(),note=$("#historical-keys-note").value.trim(),btn=$("#historical-keys-create");
  if(draft.length<1)return toast("Agrega al menos un PDF de clave pasada.",true);
  if(!subject)return toast("Escribe la materia para organizar la clase.",true);
  if(!navigator.onLine)return toast("La preparación inicial necesita internet. Después podrás repasar el paquete guardado.",true);
  btn.disabled=true;
  const ids=[];
  try{
    for(let i=0;i<draft.length;i++){
      const item=draft[i];
      if(item.kind==="library"){ids.push(item.id);continue}
      btn.innerHTML=`<span class="university-spin">↑</span><div><strong>GUARDANDO PDF ${i+1}/${draft.length}…</strong><small>R2 · todavía sin análisis Gemini</small></div>`;
      const form=new FormData();form.append("file",item.file,item.file.name);
      const res=await fetch("/api/library/upload",{method:"POST",body:form,credentials:"same-origin"});
      const d=await res.json().catch(()=>({}));
      if(!res.ok)throw new Error(d.error||`No pude subir ${item.name}.`);
      ids.push(d.id);
    }
    btn.innerHTML=`<span class="university-spin">✦</span><div><strong>CREANDO TU REPASO HISTÓRICO…</strong><small>Temas → clase → práctica → examen final</small></div>`;
    const result=await api("/api/smart/historical-keys",{method:"POST",body:{file_ids:ids,subject,note}});
    state.historicalKeysDraft=[];
    toast(result.cached?"Este mismo conjunto ya estaba preparado; se reutilizó.":"Clase histórica preparada y guardada.");
    await openHistoricalKeysPack(result.id,true);
  }catch(err){
    toast(err.message,true);
    btn.disabled=false;btn.innerHTML=`<span>✦</span><div><strong>CREAR CLASE + REPASO + EXAMEN</strong><small>Analiza el conjunto una sola vez y lo guarda</small></div>`;
  }
}

async function openHistoricalKeysPack(id,justCreated=false,startTab="analysis"){
  const o=ensureHistoricalKeysOverlay();o.classList.remove("hidden");document.body.classList.add("modal-open");
  const box=$("#historical-keys-body");
  box.innerHTML=`<div class="library-loading"><div class="v17-loading-orb"><i></i><i></i><i></i></div><strong>${justCreated?"Guardando tu nuevo paquete…":"Abriendo paquete guardado…"}</strong><small>No se está regenerando con IA.</small></div>`;
  try{
    const d=await api(`/api/smart/historical-keys?id=${encodeURIComponent(id)}`);
    state.historicalKeysPack=d.pack;state.historicalKeysSource=d.source||null;
    renderHistoricalKeysPack(startTab);
  }catch(err){
    box.innerHTML=`<div class="masterclass-error"><strong>No pude abrir este paquete.</strong><p>${escapeHtml(err.message)}</p></div>`;
  }
}

function renderHistoricalKeysPack(tab="analysis"){
  const p=state.historicalKeysPack,box=$("#historical-keys-body");if(!p)return;
  const topics=p.recurring_topics||[];
  box.innerHTML=`<section class="historical-pack">
    <header class="historical-pack-head">
      <button id="historical-pack-back" class="ghost-btn">← MIS CLAVES</button>
      <div><span>${escapeHtml(p.subject||"")} · ${Number(p.source_count||p.source_files?.length||0)} PDF HISTÓRICOS</span><h2>${escapeHtml(p.title||"Repaso desde claves pasadas")}</h2><p>${escapeHtml(p.overview||"")}</p></div>
      <div class="historical-pack-saved">✓ GUARDADO</div>
    </header>
    <nav class="historical-pack-tabs">
      <button data-historical-tab="analysis" class="${tab==="analysis"?"active":""}"><b>01</b><span>ANÁLISIS</span></button>
      <button data-historical-tab="class" class="${tab==="class"?"active":""}"><b>02</b><span>CLASE</span></button>
      <button data-historical-tab="review" class="${tab==="review"?"active":""}"><b>03</b><span>REPASO</span></button>
      <button data-historical-tab="exam" class="${tab==="exam"?"active":""}"><b>04</b><span>EXAMEN FINAL</span></button>
    </nav>
    <main id="historical-pack-content"></main>
  </section>`;
  $("#historical-pack-back").onclick=()=>openHistoricalKeysStudio();
  $$(".historical-pack-tabs button").forEach(b=>b.onclick=()=>renderHistoricalKeysPack(b.dataset.historicalTab));
  const area=$("#historical-pack-content");

  if(tab==="analysis"){
    area.innerHTML=`<section class="historical-analysis-grid">
      <article class="card">
        <div class="smart-section-head"><div><span>PATRÓN HISTÓRICO</span><h2>Temas que aparecieron en tus claves</h2></div><small>No es una predicción del próximo examen</small></div>
        <div class="historical-topic-list">${topics.map((t,i)=>`<button class="historical-topic-study" data-topic="${escapeAttr(t.name)}">
          <span>${String(i+1).padStart(2,"0")}</span><div><strong>${escapeHtml(t.name)}</strong><small>${escapeHtml((t.concepts||[]).slice(0,4).join(" · "))}</small></div>
          <b>${Number(t.occurrence_count||0)} archivo${Number(t.occurrence_count||0)===1?"":"s"}</b><i><em style="width:${Math.max(4,Number(t.historical_weight||0))}%"></em></i>
        </button>`).join("")}</div>
      </article>
      <aside class="card"><div class="panel-code">LO QUE OBSERVÓ MED AI</div><ul class="historical-pattern-list">${(p.historical_patterns||[]).map(x=>`<li>${escapeHtml(x)}</li>`).join("")}</ul>
        ${p.limitations?.length?`<div class="historical-limitations"><b>LIMITACIONES</b>${p.limitations.map(x=>`<p>${escapeHtml(x)}</p>`).join("")}</div>`:""}
      </aside>
    </section>
    <section class="card historical-plan-card"><div class="panel-code">PLAN DE ESTUDIO RECOMENDADO</div><div class="past-study-plan">${(p.study_plan||[]).map((s,i)=>`<article><b>${i+1}</b><div><strong>${escapeHtml(s.title||`Sesión ${i+1}`)}</strong><p>${escapeHtml(s.focus||"")}</p><small>${Number(s.minutes||25)} min</small></div></article>`).join("")}</div></section>`;
    $$(".historical-topic-study",area).forEach(b=>b.onclick=()=>openOnePastExamTopic(b.dataset.topic));
    return;
  }

  if(tab==="class"){
    area.innerHTML=`<article class="historical-masterclass">
      <header><div class="eyebrow">CLASE MAESTRA · BASADA EN LOS TEMAS HISTÓRICOS</div><h1>${escapeHtml(p.class_title||p.title||"Clase de repaso")}</h1><p>${escapeHtml(p.class_overview||p.overview||"")}</p></header>
      ${(p.lessons||[]).map((l,i)=>`<section class="historical-lesson"><div class="masterclass-section-number">${String(i+1).padStart(2,"0")}</div><div><h2>${escapeHtml(l.title)}</h2><div class="masterclass-prose">${renderStudyParagraphs(l.explanation||"")}</div>${l.key_points?.length?`<div class="masterclass-keypoints"><strong>Puntos clave</strong><ul>${l.key_points.map(x=>`<li>${escapeHtml(x)}</li>`).join("")}</ul></div>`:""}${l.exam_focus?`<div class="masterclass-application"><span>ENFOQUE DE REPASO</span>${renderStudyParagraphs(l.exam_focus)}</div>`:""}</div></section>`).join("")}
    </article>`;
    return;
  }

  if(tab==="review"){
    area.innerHTML=`<section class="historical-review-grid">
      <article class="card"><div class="panel-code">DEBES RECORDAR</div><div class="historical-memory-list">${(p.must_remember||[]).map((x,i)=>`<div><span>${i+1}</span><p>${escapeHtml(x)}</p></div>`).join("")}</div></article>
      <article class="card"><div class="panel-code">ERRORES / TRAMPAS COMUNES</div><div class="historical-memory-list traps">${(p.common_traps||[]).map((x,i)=>`<div><span>!</span><p>${escapeHtml(x)}</p></div>`).join("")}</div></article>
    </section>
    <div class="historical-review-action"><button id="historical-start-practice" class="primary-btn">▶ HACER PRÁCTICA DE ${Number((p.practice_questions||[]).length)}</button><small>Preguntas ya guardadas · no usa IA adicional</small></div>`;
    $("#historical-start-practice").onclick=()=>startHistoricalKeysQuiz("practice");
    return;
  }

  area.innerHTML=`<section class="historical-final-exam">
    <div class="historical-final-icon">✓</div><div class="eyebrow">EXAMEN FINAL NUEVO</div><h2>${Number((p.final_exam||[]).length)} preguntas sobre los temas encontrados</h2><p>Este examen no intenta adivinar tu próximo parcial. Comprueba si dominas los conceptos que aparecieron históricamente en las claves que subiste.</p>
    <div class="historical-exam-rules"><span>80% para aprobar</span><span>Clave oculta hasta terminar</span><span>Repetible sin IA</span></div>
    <button id="historical-start-exam" class="primary-btn">COMENZAR EXAMEN →</button>
  </section>`;
  $("#historical-start-exam").onclick=()=>startHistoricalKeysQuiz("exam");
}

function startHistoricalKeysQuiz(kind){
  const p=state.historicalKeysPack;
  const questions=(kind==="exam"?p.final_exam:p.practice_questions)||[];
  if(!questions.length)return toast("Este paquete no tiene preguntas guardadas.",true);
  state.historicalKeysQuiz={kind,questions,index:0,answers:{},score:0,started_at:new Date().toISOString()};
  renderHistoricalKeysQuestion();
}
function renderHistoricalKeysQuestion(){
  const st=state.historicalKeysQuiz,q=st?.questions?.[st.index],box=$("#historical-keys-body");
  if(!q){finishHistoricalKeysQuiz();return}
  const choice=st.answers[`q${st.index}`],practice=st.kind==="practice";
  box.innerHTML=`<section class="answer-key-session historical-quiz">
    <header class="answer-key-session-head"><button id="historical-quiz-exit" class="ghost-btn">← SALIR</button><div><span>${practice?"PRÁCTICA":"EXAMEN FINAL"} · CLAVES HISTÓRICAS</span><strong>${st.index+1} / ${st.questions.length}</strong></div><div class="answer-key-session-score">${practice?`${st.score} ✓`:"RESPUESTAS OCULTAS"}</div></header>
    <div class="master-exam-progress"><i style="width:${st.index/st.questions.length*100}%"></i></div>
    <article class="answer-key-question"><div class="answer-key-question-meta"><span>PREGUNTA ${st.index+1}</span><b>${escapeHtml(q.topic||"Repaso")}</b></div><h1>${escapeHtml(q.stem||q.question||"")}</h1>
      <div class="answer-key-options">${(q.options||[]).map((op,i)=>`<button data-i="${i}" class="${choice===i?"selected":""}"><span>${String.fromCharCode(65+i)}</span><strong>${escapeHtml(op)}</strong></button>`).join("")}</div>
      ${practice&&choice!==undefined?renderHistoricalPracticeFeedback(q,choice):""}
      <div class="answer-key-question-actions">${st.index>0?`<button id="historical-prev" class="secondary-btn">← ANTERIOR</button>`:"<span></span>"}${choice===undefined?`<small>Selecciona una respuesta.</small>`:`<button id="historical-next" class="primary-btn">${st.index+1===st.questions.length?"TERMINAR":"SIGUIENTE →"}</button>`}</div>
    </article>
  </section>`;
  $("#historical-quiz-exit").onclick=()=>renderHistoricalKeysPack(st.kind==="exam"?"exam":"review");
  $$(".answer-key-options button",box).forEach(b=>b.onclick=()=>selectHistoricalKeysAnswer(Number(b.dataset.i)));
  $("#historical-prev")?.addEventListener("click",()=>{st.index--;renderHistoricalKeysQuestion()});
  $("#historical-next")?.addEventListener("click",()=>{st.index++;renderHistoricalKeysQuestion()});
}
function selectHistoricalKeysAnswer(choice){
  const st=state.historicalKeysQuiz,q=st.questions[st.index],key=`q${st.index}`,prev=st.answers[key];
  if(prev===undefined&&choice===Number(q.correctIndex))st.score++;
  if(prev!==undefined&&prev===Number(q.correctIndex)&&choice!==Number(q.correctIndex))st.score--;
  if(prev!==undefined&&prev!==Number(q.correctIndex)&&choice===Number(q.correctIndex))st.score++;
  st.answers[key]=choice;renderHistoricalKeysQuestion();
}
function renderHistoricalPracticeFeedback(q,choice){
  const ok=choice===Number(q.correctIndex);
  return `<section class="answer-key-feedback ${ok?"correct":"wrong"}"><div class="answer-key-feedback-title"><span>${ok?"✓":"×"}</span><div><strong>${ok?"Correcto":"Revisa este concepto"}</strong><small>Respuesta correcta: ${String.fromCharCode(65+Number(q.correctIndex||0))}</small></div></div><p>${escapeHtml(q.explanation||"")}</p></section>`;
}
async function finishHistoricalKeysQuiz(){
  const st=state.historicalKeysQuiz,p=state.historicalKeysPack;
  let score=0;st.questions.forEach((q,i)=>{if(Number(st.answers[`q${i}`])===Number(q.correctIndex))score++});
  const pct=Math.round(score/Math.max(1,st.questions.length)*100);
  if(st.kind==="exam"){
    try{await api("/api/exams/record",{method:"POST",body:{
      title:`Examen final · Claves históricas · ${p.subject||""}`,
      settings:{smart_study:true,historical_keys:true,historical_keys_pack_id:state.historicalKeysSource?.id,subject:p.subject},
      started_at:st.started_at,score,max_score:st.questions.length,percentage:pct,questions:st.questions,answers:st.answers
    }})}catch{}
  }
  $("#historical-keys-body").innerHTML=`<section class="answer-key-result"><div class="answer-key-result-ring"><strong>${pct}%</strong><small>${score}/${st.questions.length}</small></div><div class="eyebrow">${st.kind==="exam"?"EXAMEN FINAL":"PRÁCTICA"} TERMINADO</div><h2>${pct>=80?"Buen dominio de los temas históricos.":"Conviene reforzar algunos conceptos."}</h2><p>${st.kind==="exam"?"Tus errores se guardan para que Repaso inteligente pueda volver a trabajarlos.":"Puedes repetir esta práctica todas las veces que quieras sin nueva IA."}</p><div class="answer-key-result-actions"><button id="historical-result-back" class="secondary-btn">VOLVER AL PAQUETE</button><button id="historical-result-repeat" class="primary-btn">REPETIR</button></div></section>`;
  $("#historical-result-back").onclick=()=>renderHistoricalKeysPack(st.kind==="exam"?"exam":"review");
  $("#historical-result-repeat").onclick=()=>startHistoricalKeysQuiz(st.kind);
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
  const [d,p]=await Promise.all([api("/api/stats"),api("/api/progress/overview")]);
  state.progressOverview=p;
  const daily=[...(d.daily||[])].reverse(),max=Math.max(1,...daily.map(x=>Number(x.study_seconds||0))),t=p.totals||{};
  root.innerHTML=`<div class="page-head"><div><div class="eyebrow">MAPA DE DOMINIO · V29</div><h2>Progreso académico</h2><p>No solo cuánto estudiaste: qué dominas, qué estás aprendiendo y qué necesita repaso.</p></div></div>
  <section class="v29-mastery-metrics">
    <article class="dominated"><span>✓</span><div><strong>${Number(t.dominated||0)}</strong><small>DOMINADOS</small></div></article>
    <article class="learning"><span>↗</span><div><strong>${Number(t.learning||0)}</strong><small>EN APRENDIZAJE</small></div></article>
    <article class="review"><span>↻</span><div><strong>${Number(t.review||0)}</strong><small>NECESITAN REPASO</small></div></article>
    <article class="not-started"><span>○</span><div><strong>${Number(t.not_started||0)}</strong><small>NO ESTUDIADOS</small></div></article>
  </section>
  <div class="grid stats4" style="margin-top:9px">
    ${metric("Preguntas",d.totals?.questions||0,"Respondidas")}
    ${metric("Casos",d.totals?.cases||0,"Completados")}
    ${metric("Repasos",d.totals?.reviews||0,"Flashcards")}
    ${metric("Sesiones",d.totals?.sessions||0,"De estudio")}
  </div>
  <section class="v29-progress-grid">
    <article class="card"><div class="smart-section-head"><div><span>POR MATERIA</span><h2>Mapa académico</h2></div><small>${(p.subjects||[]).length} materias</small></div>
      <div class="v29-subject-progress">${(p.subjects||[]).map(s=>{
        const total=s.dominated+s.learning+s.review+s.not_started,done=total?Math.round((s.dominated+s.learning*.6)/total*100):0;
        return `<button class="v29-subject-row" data-subject="${escapeAttr(s.id)}"><div><strong>${escapeHtml(s.name)}</strong><small>${s.dominated} dominados · ${s.review} repaso · ${s.not_started} no estudiados</small></div><span>${done}%</span><i><b style="width:${done}%"></b></i></button>`;
      }).join("")||`<div class="system-empty">Aún no hay materias.</div>`}</div>
    </article>
    <article class="card"><div class="smart-section-head"><div><span>30 DÍAS</span><h2>Tiempo de estudio</h2></div></div><div class="chart-bars">${daily.length?daily.map(x=>`<div class="bar" title="${x.metric_date}: ${Math.round(x.study_seconds/60)} min" style="height:${Math.max(3,Number(x.study_seconds)/max*100)}%"></div>`).join(""):`<div class="empty">Todavía no hay datos.</div>`}</div>${daily.length?`<div class="bar-labels"><span>${daily[0]?.metric_date||""}</span><span>${daily.at(-1)?.metric_date||""}</span></div>`:""}</article>
  </section>
  <section class="card" id="v29-subject-detail"><div class="system-empty compact">Toca una materia para ver sus temas por estado.</div></section>`;
  $$(".v29-subject-row").forEach(b=>b.onclick=()=>{
    const s=(p.subjects||[]).find(x=>x.id===b.dataset.subject);if(!s)return;
    $("#v29-subject-detail").innerHTML=`<div class="smart-section-head"><div><span>DETALLE</span><h2>${escapeHtml(s.name)}</h2></div></div><div class="v29-topic-status-list">${s.topics.map(x=>`<article class="${escapeAttr(x.status)}"><span>${x.status==="dominated"?"✓":x.status==="learning"?"↗":x.status==="review"?"↻":"○"}</span><div><strong>${escapeHtml(x.name)}</strong><small>${Number(x.questions_answered||0)} preguntas respondidas</small></div><b>${Math.round(Number(x.mastery||0))}%</b></article>`).join("")}</div>`;
  });
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
      <div class="eyebrow">MODO PERSONAL</div><h3>Datos y protección</h3>
      <p style="color:var(--muted);line-height:1.6">MED AI usa tu perfil personal sincronizado. Los backups, exportaciones y diagnóstico están en Estado del sistema.</p>
      <div class="system-health-list" style="margin-top:12px"><div><span>Perfil</span><strong>SINCRONIZADO</strong></div><div><span>Backups</span><strong>R2 PRIVADO</strong></div><div><span>Exportación</span><strong>DISPONIBLE</strong></div></div>
      <button id="profile-system" class="secondary-btn" style="margin-top:12px">⚙ ESTADO DEL SISTEMA</button>
    </div>
  </div>`;
  $("#save-profile").onclick=async()=>{
    try{const r=await api("/api/profile",{method:"PUT",body:{full_name:$("#pf-name").value,university:$("#pf-university").value,academic_level:$("#pf-level").value,target_specialty:$("#pf-specialty").value,country:$("#pf-country").value,bio:$("#pf-bio").value}});state.user=r.user;toast("Perfil actualizado.")}catch(err){toast(err.message,true)}
  };
  $("#profile-system").onclick=()=>navigate("system");
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
  // Create a recovery point before an intentional update whenever possible.
  if(navigator.onLine){
    try{await api("/api/system/backup",{method:"POST",body:{reason:"before_update"}})}catch(err){logSystemError("backup_before_update",err)}
  }
  try{
    if("caches" in window){
      const keys=await caches.keys();
      await Promise.all(keys.map(k=>caches.delete(k)));
    }
    if("serviceWorker" in navigator){
      const regs=await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map(r=>r.unregister()));
    }
  }catch(err){logSystemError("clear_pwa_cache",err)}
  const url=new URL(location.href);
  url.searchParams.set("v29",Date.now().toString());
  location.replace(url.toString());
}

function setupPWA(){
  if("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js?v=29.0.0",{updateViaCache:"none"}).catch(err=>logSystemError("service_worker_register",err));
  window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();state.deferredPrompt=e;$("#install-btn").classList.remove("hidden")});
  $("#install-btn").onclick=async()=>{if(state.deferredPrompt){state.deferredPrompt.prompt();await state.deferredPrompt.userChoice;state.deferredPrompt=null;$("#install-btn").classList.add("hidden")}};
}

async function api(url,opts={}){
  const method=(opts.method||"GET").toUpperCase();
  const config={credentials:"include",...opts,headers:{"content-type":"application/json","x-medai-app-version":APP_VERSION,...(opts.headers||{})}};
  if(opts.body && typeof opts.body!=="string") config.body=JSON.stringify(opts.body);
  const cacheKey=offlineApiKey(url);
  try{
    const res=await fetch(url,config);
    const data=await res.json().catch(()=>({}));
    if(!res.ok){
      const incident=data.incident_id?` · Caso ${data.incident_id}`:"";
      const component=data.component?` · ${data.component}`:"";
      const err=new Error(([data.error,data.detail].filter(Boolean).join(" · ")||`Error ${res.status}`)+component+incident);
      err.status=res.status;err.incident_id=data.incident_id||null;err.component=data.component||null;throw err;
    }
    if(method==="GET"&&!url.includes("/auth/"))offlinePutJson(cacheKey,data).catch(()=>{});
    if(navigator.onLine&&state.maintenanceMode){
      state.maintenanceMode=false;updateMaintenanceBanner();
    }
    return data;
  }catch(err){
    logSystemError("api",err,{url,method,status:err?.status});
    if(method==="GET"){
      const saved=await offlineGetJson(cacheKey);
      if(saved!==null&&saved!==undefined){
        state.maintenanceMode=true;updateMaintenanceBanner("El servidor no respondió; mostrando la última copia guardada.");
        return {...saved,__offline:true};
      }
    }
    if(!navigator.onLine && ["POST","PUT","DELETE"].includes(method) && !url.includes("/auth/") &&
       !url.includes("/api/ai/") && !url.includes("/source-import") && !url.includes("/study-pack") &&
       !url.includes("/library/extract") && !url.includes("/system/restore") && !url.includes("/system/backup")){
      queueOffline({url,opts:{...opts,body:typeof opts.body==="string"?JSON.parse(opts.body):opts.body}});
      toast("Sin internet: cambio guardado para sincronizar.",false);
      updateNetworkBadge();
      return {ok:true,queued:true};
    }
    if(navigator.onLine){
      state.maintenanceMode=true;updateMaintenanceBanner("Un servicio remoto no respondió. Puedes continuar con el material que ya está guardado.");
    }
    throw err;
  }
}
function queueOffline(item){
  const q=getOfflineQueue();
  q.push({...item,id:crypto.randomUUID(),at:new Date().toISOString(),attempts:0});
  localStorage.setItem("medai_queue",JSON.stringify(q.slice(-250)));
}
async function flushOfflineQueue(){
  const q=getOfflineQueue();
  if(!q.length){state.lastSyncReport={sent:0,pending:0,at:new Date().toISOString()};updateNetworkBadge();return state.lastSyncReport}
  if(!navigator.onLine){updateNetworkBadge();return {sent:0,pending:q.length}}
  const pending=[];let sent=0;
  for(const item of q){
    try{
      const config={credentials:"include",...(item.opts||{}),headers:{"content-type":"application/json","x-medai-app-version":APP_VERSION,...(item.opts?.headers||{})}};
      if(config.body && typeof config.body!=="string")config.body=JSON.stringify(config.body);
      const res=await fetch(item.url,config);
      if(!res.ok)throw new Error(`Error ${res.status}`);
      sent++;
    }catch(err){
      pending.push({...item,attempts:Number(item.attempts||0)+1,last_error:String(err?.message||err).slice(0,500)});
      logSystemError("sync_queue",err,{url:item.url,method:item.opts?.method||"POST"});
    }
  }
  localStorage.setItem("medai_queue",JSON.stringify(pending));
  state.lastSyncReport={sent,pending:pending.length,at:new Date().toISOString()};
  updateNetworkBadge();
  if(sent&&!pending.length)toast(`${sent} cambio${sent===1?"":"s"} sin conexión sincronizado${sent===1?"":"s"}.`);
  if(pending.length)toast(`${pending.length} cambio${pending.length===1?"":"s"} sigue${pending.length===1?"":"n"} pendiente${pending.length===1?"":"s"}.`,true);
  return state.lastSyncReport;
}
function updateNetworkBadge(){
  const b=$("#sync-badge");if(!b)return;
  const pending=getOfflineQueue().length;
  if(!navigator.onLine){
    b.textContent=`● OFFLINE · ${pending?`${pending} PENDIENTE${pending===1?"":"S"}`:"ESTUDIO LOCAL"}`;
  }else if(pending){
    b.textContent=`● ${pending} PENDIENTE${pending===1?"":"S"} DE SYNC`;
  }else{
    b.textContent="● SINCRONIZADO";
  }
  b.classList.toggle("offline",!navigator.onLine||pending>0);
}
async function saveResume(data){return api("/api/resume",{method:"PUT",body:{...data,device_id:getDeviceId()}})}
function getDeviceId(){let id=localStorage.getItem("medai_device");if(!id){id=crypto.randomUUID();localStorage.setItem("medai_device",id)}return id}

// -------------------- UI HELPERS --------------------

function metric(label,value,sub,icon="◦"){return `<div class="card metric-card"><div class="metric-icon">${icon}</div><div class="metric-label">${escapeHtml(label)}</div><div class="metric-value">${escapeHtml(String(value))}</div><div class="metric-sub">${escapeHtml(sub)}</div></div>`}
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
