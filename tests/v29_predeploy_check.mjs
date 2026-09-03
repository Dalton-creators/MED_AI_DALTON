import fs from "node:fs";
import path from "node:path";
import {spawnSync} from "node:child_process";
import {fileURLToPath} from "node:url";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
let failed=false;
const read=rel=>fs.readFileSync(path.join(root,rel),"utf8");
const check=(name,cond,detail="")=>{
  console.log(`${cond?"OK  ":"FAIL"} ${name}${detail?` · ${detail}`:""}`);
  if(!cond)failed=true;
};
const required=[
  "public/index.html","public/styles.css","public/app.js","public/sw.js",
  "public/manifest.webmanifest","public/icons/icon.svg","src/index.js","wrangler.jsonc"
];
console.log("\nMED AI DALTON · V29 FINAL PREDEPLOY CHECK\n");
for(const rel of required)check(`Existe ${rel}`,fs.existsSync(path.join(root,rel)));

for(const rel of ["public/app.js","src/index.js"]){
  const r=spawnSync(process.execPath,["--check",path.join(root,rel)],{encoding:"utf8"});
  check(`Sintaxis ${rel}`,r.status===0,r.stderr?.trim()||"");
}

const app=read("public/app.js"),worker=read("src/index.js"),html=read("public/index.html"),sw=read("public/sw.js"),wrangler=read("wrangler.jsonc");
check("Versión frontend 29.0.0",app.includes('APP_VERSION="29.0.0"'));
check("Versión Worker 29.0.0",worker.includes('SYSTEM_VERSION="29.0.0"'));
check("V29 visible",html.includes("V29 FINAL"));
check("Service Worker V29",sw.includes("med-ai-dalton-v29-final"));

const mustApp=[
  ["Antes del parcial","renderExamPrepCenter"],
  ["Banco permanente","renderQuestionBank"],
  ["Examen adaptativo","startAdaptiveExamV29"],
  ["OCR + citas","indexLibrarySourceV29"],
  ["Transcripción","transcribeLibraryMediaV29"],
  ["Progreso académico","MAPA DE DOMINIO · V29"],
  ["Exportación","exportAllMedAI"],
  ["Offline bundle","offlinebundle:"],
  ["Self test","runDeepSystemTestV29"],
  ["Smart Study","renderSmartStudy"],
  ["Offline Vault","OFFLINE_DB_NAME"]
];
for(const [name,token] of mustApp)check(name,app.includes(token));

const routes=[
  "/api/library/ocr-index","/api/library/transcribe","/api/exam-prep/plan",
  "/api/question-bank","/api/adaptive-exam/start","/api/progress/overview",
  "/api/system/export","/api/system/self-test","/api/smart/historical-keys"
];
for(const route of routes)check(`Ruta ${route}`,worker.includes(`"${route}"`));

const deadRoutes=["/api/auth/login","/api/auth/register","/api/auth/change-password","/api/smart/past-exam"];
for(const route of deadRoutes)check(`Sin ruta antigua ${route}`,!worker.includes(`"${route}"`));

function duplicates(text){
  const re=/(?:async\s+)?function\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*\(/g;
  const counts=new Map(); let m;
  while((m=re.exec(text)))counts.set(m[1],(counts.get(m[1])||0)+1);
  return [...counts].filter(([,n])=>n>1);
}
const appDup=duplicates(app),workerDup=duplicates(worker);
check("Sin funciones duplicadas app.js",appDup.length===0,JSON.stringify(appDup));
check("Sin funciones duplicadas index.js",workerDup.length===0,JSON.stringify(workerDup));

try{
  const cfg=JSON.parse(wrangler);
  check("Binding AI",cfg.ai?.binding==="AI");
  check("Binding DB",cfg.d1_databases?.some(x=>x.binding==="DB"&&x.database_name==="med_ai_dalton_db"));
  check("Binding LIBRARY",cfg.r2_buckets?.some(x=>x.binding==="LIBRARY"&&x.bucket_name==="med-ai-dalton-library"));
  check("Assets",cfg.assets?.binding==="ASSETS");
  check("keep_vars",cfg.keep_vars===true);
}catch(err){
  check("wrangler.jsonc válido",false,String(err));
}

const swCore=(sw.match(/const CORE=\[(.*?)\];/s)||[])[1]||"";
const corePaths=[...swCore.matchAll(/"([^"]+)"/g)].map(m=>m[1]);
for(const url of corePaths){
  const clean=url.split("?")[0];
  const rel=clean==="/"?"public/index.html":`public/${clean.replace(/^\//,"")}`;
  check(`Precache ${url}`,fs.existsSync(path.join(root,rel)));
}

if(failed){
  console.error("\n❌ V29 NO debe desplegarse todavía.\n");
  process.exit(1);
}
console.log("\n✅ V29 FINAL pasó todas las comprobaciones estáticas.\n");
