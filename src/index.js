const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store"
};

const SESSION_DAYS = 30;
const PASSWORD_ITERATIONS = 210000;

const COURSE_PATHS = {"ANAT":["Orientación anatómica, planos y términos","Osteología y articulaciones","Músculo y biomecánica básica","Tórax","Abdomen","Pelvis y periné","Miembro superior","Miembro inferior","Cabeza y cuello","Neuroanatomía e integración"],"HIST":["Microscopía y organización celular","Epitelios","Tejido conectivo","Cartílago y hueso","Tejido muscular","Tejido nervioso","Sangre y hematopoyesis","Histología de órganos y sistemas"],"EMBR":["Gametogénesis","Fecundación e implantación","Semanas 2 y 3: disco embrionario y gastrulación","Plegamiento corporal y derivados germinales","Placenta y membranas fetales","Organogénesis cardiovascular","Desarrollo del sistema nervioso","Desarrollo gastrointestinal y respiratorio","Desarrollo urogenital","Malformaciones y principios de teratología"],"FISIO":["Homeostasis, membrana y transporte","Potencial de membrana, nervio y músculo","Fisiología cardiovascular","Fisiología respiratoria","Fisiología renal","Equilibrio ácido-base","Fisiología gastrointestinal","Fisiología endocrina","Fisiología reproductiva","Integración, ejercicio y termorregulación"],"BIOQ":["Biomoléculas y agua","Enzimas y cinética","Bioenergética y ATP","Metabolismo de carbohidratos","Metabolismo de lípidos","Aminoácidos y proteínas","Nucleótidos","Replicación, transcripción y traducción","Integración metabólica","Nutrición y bioquímica clínica"],"GEN":["ADN, cromosomas y ciclo celular","Herencia mendeliana","Pedigrí y riesgo genético","Alteraciones cromosómicas","Genética molecular","Herencia multifactorial","Genética de poblaciones","Pruebas genéticas y consejo genético","Genómica y medicina de precisión"],"INMUNO":["Inmunidad innata","Antígenos y presentación por MHC","Linfocitos T","Linfocitos B y anticuerpos","Complemento y citocinas","Hipersensibilidad","Autoinmunidad","Inmunodeficiencias","Vacunas e inmunización","Trasplante e inmunología clínica"],"MICRO":["Principios de microbiología y diagnóstico","Bacteriología general","Bacterias grampositivas","Bacterias gramnegativas","Virología","Micología","Antimicrobianos y resistencia","Infecciones por síndromes","Prevención y control de infecciones"],"PARA":["Conceptos y ciclos parasitarios","Protozoos intestinales","Protozoos sanguíneos y tisulares","Nematodos","Cestodos","Trematodos","Diagnóstico parasitológico","Prevención y tratamiento antiparasitario"],"FARMA":["Farmacocinética","Farmacodinamia","Sistema nervioso autónomo","Farmacología cardiovascular","Fármacos renales y diuréticos","Farmacología endocrina","Sistema nervioso central","Antimicrobianos","Antiinflamatorios e inmunomoduladores","Oncología farmacológica","Toxicología e interacciones"],"PATO":["Lesión y adaptación celular","Inflamación aguda y crónica","Reparación y cicatrización","Trastornos hemodinámicos y trombosis","Patología inmunológica","Neoplasia","Patología genética","Patología cardiovascular y respiratoria","Patología gastrointestinal, renal y endocrina","Integración anatomopatológica"],"EPI":["Frecuencia de enfermedad y medidas de efecto","Diseños de estudio","Sesgos y confusión","Pruebas diagnósticas","Tamizaje","Estadística descriptiva","Probabilidad e inferencia","Intervalos de confianza y pruebas de hipótesis","Lectura crítica y medicina basada en evidencia","Salud pública y prevención"],"SEMIO":["Entrevista clínica y comunicación","Signos vitales y examen general","Semiología cardiovascular","Semiología respiratoria","Semiología abdominal","Semiología neurológica","Semiología musculoesquelética","Piel y faneras","Aparato genitourinario","Integración de historia y examen físico"],"MI":["Razonamiento clínico y lista de problemas","Cardiología","Neumología","Nefrología y ácido-base","Gastroenterología y hepatología","Endocrinología","Hematología y oncología","Enfermedades infecciosas","Reumatología","Geriatría y multimorbilidad","Paciente crítico y urgencias del internista"],"PED":["Crecimiento y desarrollo","Neonatología","Nutrición pediátrica","Enfermedades respiratorias","Gastroenterología pediátrica","Infecciones y vacunas","Cardiología pediátrica","Neurología pediátrica","Urgencias pediátricas","Adolescencia y prevención"],"CIR":["Principios quirúrgicos y seguridad","Evaluación preoperatoria","Líquidos, electrolitos y nutrición","Heridas e infección quirúrgica","Trauma","Abdomen agudo","Cirugía gastrointestinal","Cirugía vascular","Mama, tiroides y cirugía endocrina","Complicaciones postoperatorias"],"GINOBS":["Ciclo menstrual y fisiología reproductiva","Anticoncepción","Sangrado uterino anormal","Infecciones ginecológicas","Infertilidad","Control prenatal","Trabajo de parto y parto","Emergencias obstétricas","Puerperio","Oncología ginecológica"],"PSIQ":["Entrevista psiquiátrica y examen mental","Psicofarmacología básica","Trastornos depresivos y bipolares","Ansiedad y trauma","Psicosis","Uso de sustancias","Trastornos de personalidad","Sueño y conducta alimentaria","Psiquiatría de urgencias"],"NEURO":["Examen neurológico y localización","Cefaleas","Epilepsia","Enfermedad cerebrovascular","Trastornos del movimiento","Enfermedades desmielinizantes","Neuropatías y enfermedad neuromuscular","Demencias","Urgencias neurológicas"],"DERM":["Lesiones elementales y examen dermatológico","Dermatitis y eccemas","Infecciones cutáneas","Acné y trastornos foliculares","Psoriasis","Enfermedades autoinmunes","Tumores cutáneos","Urgencias dermatológicas"],"OFT":["Anatomía y examen ocular","Ojo rojo","Refracción y agudeza visual","Catarata y glaucoma","Retina","Neurooftalmología","Trauma ocular","Urgencias oftalmológicas"],"ORL":["Examen de oído y audición","Otitis y patología del oído","Vértigo","Nariz y senos paranasales","Faringe y laringe","Vía aérea","Masas cervicales","Urgencias ORL"],"TRAUMA":["Evaluación musculoesquelética","Principios de fracturas","Articulaciones y lesiones deportivas","Miembro superior","Miembro inferior","Columna vertebral","Ortopedia pediátrica","Urgencias traumatológicas"],"EMERG":["ABCDE y evaluación inicial","Reanimación y paro cardiorrespiratorio","Shock","Dolor torácico","Disnea aguda","Emergencias neurológicas","Sepsis","Trauma","Intoxicaciones","Emergencias metabólicas"],"CRIT":["Fundamentos de UCI","Vía aérea y ventilación mecánica","Shock y monitorización hemodinámica","Sepsis y falla multiorgánica","Lesión renal aguda y soporte renal","Neurocrítico","Sedación, analgesia y delirium","Nutrición en el paciente crítico","Ética y toma de decisiones en UCI"],"FAM":["Prevención y promoción de salud","Consulta de atención primaria","Hipertensión y riesgo cardiovascular","Diabetes y obesidad","Problemas agudos frecuentes","Salud de la mujer","Niñez y adolescencia","Adulto mayor","Salud mental en atención primaria","Medicina comunitaria"],"MATH":["Aritmética y proporciones","Álgebra","Ecuaciones e inecuaciones","Funciones y gráficas","Geometría","Trigonometría","Geometría analítica","Límites y continuidad","Derivadas","Integrales","Probabilidad y estadística","Vectores y matrices","Ecuaciones diferenciales"],"PHYS":["Unidades, medición y vectores","Cinemática","Leyes de Newton","Trabajo y energía","Cantidad de movimiento","Rotación y torque","Fluidos","Termodinámica","Ondas y sonido","Electricidad","Magnetismo","Óptica","Relatividad","Física cuántica y moderna"],"ASTRO":["Esfera celeste y coordenadas","Gravedad y órbitas","Sistema Solar","El Sol","Propiedades de las estrellas","Evolución estelar","Exoplanetas","Vía Láctea","Galaxias","Cosmología","Telescopios y observación","Astrobiología"],"LANG":["A1 · Primer contacto y supervivencia","A1 · Rutinas y comunicación básica","A2 · Vida cotidiana y descripciones","A2 · Pasado, futuro y situaciones prácticas","B1 · Conversación independiente","B1 · Comprensión y producción extendida","B2 · Argumentación y precisión","B2 · Comprensión de contenido complejo","C1 · Comunicación académica y profesional","C1 · Matices y fluidez","C2 · Precisión, registro y estilo","C2 · Dominio funcional avanzado"]};

const COURSE_EXPANSIONS = {"ANAT":["Anatomía de superficie y correlación por imagen","Espalda y columna vertebral","Vascularización, linfáticos y nervios periféricos","Órganos de los sentidos","Anatomía seccional y radiológica","Integración anatómica clínica"],"HIST":["Sistema cardiovascular y linfático","Sistema respiratorio","Tubo digestivo y glándulas anexas","Sistema urinario","Sistema endocrino","Sistema reproductor masculino y femenino"],"EMBR":["Desarrollo craneofacial","Desarrollo musculoesquelético y extremidades","Desarrollo endocrino","Desarrollo de ojo y oído","Circulación fetal y transición neonatal"],"FISIO":["Sangre, hemostasia y grupos sanguíneos","Neurofisiología y sistemas sensoriales","Sistema nervioso autónomo","Sueño, vigilia y ritmos biológicos","Metabolismo, ejercicio y balance energético","Calcio, hueso y regulación mineral"],"BIOQ":["Vitaminas y cofactores","Señalización celular","Regulación de la expresión génica","Estrés oxidativo y antioxidantes","Biología molecular diagnóstica","Errores innatos del metabolismo"],"GEN":["Epigenética","Herencia mitocondrial","Genética del cáncer","Farmacogenómica","Diagnóstico prenatal y reproductivo","Interpretación de variantes genéticas"],"INMUNO":["Tolerancia inmunológica","Inmunidad de mucosas","Inmunología tumoral","Pruebas inmunológicas de laboratorio","Inmunoterapia y fármacos biológicos"],"MICRO":["Anaerobios y bacterias especiales","Espiroquetas y bacterias atípicas","Virus emergentes y zoonosis","Microbiología clínica por aparatos","Bioseguridad y epidemiología hospitalaria"],"PARA":["Ectoparásitos","Síndromes parasitarios tropicales","Respuesta inmune frente a parásitos","Parasitología del viajero y medicina tropical"],"FARMA":["Fármacos de coagulación y hemostasia","Farmacología respiratoria","Farmacología gastrointestinal","Anestésicos locales y generales","Hematología y factores de crecimiento","Farmacología en embarazo, pediatría y geriatría","Principios de prescripción segura"],"PATO":["Patología hematolinfoide","Patología renal y urinaria","Patología del sistema nervioso","Patología ósea y de tejidos blandos","Dermatopatología","Patología de aparato reproductor y mama"],"EPI":["Regresión y modelado básico","Análisis de supervivencia","Revisiones sistemáticas y metaanálisis","Inferencia causal","Investigación de brotes","Vigilancia epidemiológica"],"SEMIO":["Cabeza, cuello, ORL y ojo","Semiología endocrina","Semiología hematológica","Examen mental y estado cognitivo","Valoración geriátrica integral","Semiología pediátrica"],"MI":["Hipertensión arterial","Cardiopatía isquémica","Arritmias","Insuficiencia cardíaca","Asma y EPOC","Neumonía y enfermedad pleural","Lesión renal aguda y enfermedad renal crónica","Trastornos hidroelectrolíticos","Diabetes mellitus","Trastornos tiroideos","Cirrosis y complicaciones","Hemorragia digestiva","Anemias","Trastornos trombóticos y anticoagulación","Sepsis","VIH e infecciones oportunistas","Enfermedades autoinmunes sistémicas","Cuidados paliativos y fin de vida"],"PED":["Nefrología pediátrica","Endocrinología pediátrica","Hematología y oncología pediátrica","Reumatología pediátrica","Dermatología pediátrica","Toxicología pediátrica","Maltrato y protección infantil"],"CIR":["Cirugía hepatobiliar y pancreática","Cirugía colorrectal","Hernias y pared abdominal","Cirugía torácica básica","Urología quirúrgica básica","Principios de cirugía oncológica"],"GINOBS":["Endometriosis y dolor pélvico","Menopausia","Embarazo ectópico","Trastornos hipertensivos del embarazo","Diabetes gestacional","Monitoreo fetal","Diagnóstico prenatal"],"PSIQ":["Trastorno obsesivo-compulsivo","Trastornos neurocognitivos","Trastornos somáticos","Psiquiatría infantil y del adolescente","Psicoterapias","Capacidad, consentimiento y ética psiquiátrica"],"NEURO":["Infecciones del sistema nervioso","Tumores del sistema nervioso","Mielopatías y lesión medular","Trastornos del sueño neurológicos","Dolor neuropático","Neuroinmunología"],"DERM":["Urticaria y reacciones medicamentosas","Enfermedades ampollosas","Trastornos de pigmentación","Cabello y uñas","Dermatología pediátrica","Dermatosis genitales"],"OFT":["Córnea y superficie ocular","Uveítis","Retina vascular y desprendimiento","Oftalmología pediátrica","Manifestaciones oculares de enfermedad sistémica"],"ORL":["Hipoacusia y audiología","Apnea obstructiva del sueño","Cáncer de cabeza y cuello","Trastornos de voz y deglución","Patología de glándulas salivales"],"TRAUMA":["Mano y muñeca","Hombro y codo","Cadera y rodilla","Pie y tobillo","Osteoporosis y fracturas por fragilidad","Infecciones y tumores musculoesqueléticos"],"EMERG":["Arritmias inestables","Hemorragia digestiva aguda","Emergencias hidroelectrolíticas","Emergencias obstétricas","Emergencias pediátricas","Emergencias ambientales"],"CRIT":["Insuficiencia respiratoria y SDRA","Ácido-base en UCI","Coagulopatía del paciente crítico","Emergencias endocrinas en UCI","Ultrasonido a pie de cama","Cuidados post-paro"],"FAM":["Tamizaje basado en riesgo","Dolor crónico","Cuidados paliativos en atención primaria","Salud del hombre","Medicina del viajero","Salud ocupacional"],"MATH":["Lógica y teoría de conjuntos","Potencias, radicales y logaritmos","Sucesiones y series","Números complejos","Cálculo multivariable","Álgebra lineal avanzada","Métodos numéricos","Matemática discreta"],"PHYS":["Oscilaciones","Gravitación","Electrostática y circuitos","Ondas electromagnéticas","Física nuclear","Física de partículas","Física estadística"],"ASTRO":["Técnicas observacionales y fotometría","Atmósferas estelares","Medio interestelar","Objetos compactos y agujeros negros","Astronomía de altas energías","Ondas gravitacionales","Materia oscura y energía oscura","Universo temprano"],"LANG":["Pronunciación y fonética aplicada","Comprensión auditiva intensiva","Escritura académica y profesional","Conversación avanzada por situaciones","Idioma médico y científico"]};
for (const [code,extra] of Object.entries(COURSE_EXPANSIONS)) {
  const base = COURSE_PATHS[code] || [];
  COURSE_PATHS[code] = [...base, ...extra.filter(name=>!base.includes(name))];
}


export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (!url.pathname.startsWith("/api/")) {
      return env.ASSETS.fetch(request);
    }

    try {
      if (request.method === "OPTIONS") {
        return new Response(null, { status: 204 });
      }

      // Public routes
      if (url.pathname === "/api/health" && request.method === "GET") {
        const row = await env.DB.prepare("SELECT COUNT(*) AS n FROM subjects").first();
        return json({ ok: true, app: "MED AI DALTON", subjects: Number(row?.n || 0) });
      }

      if (url.pathname === "/api/auth/register" && request.method === "POST") {
        return register(request, env);
      }

      if (url.pathname === "/api/auth/login" && request.method === "POST") {
        return login(request, env);
      }

      // Personal single-user mode:
      // no login screen; every device uses the same personal MED AI profile in D1.
      const user = await ensurePersonalUser(env);

      if (url.pathname === "/api/auth/logout" && request.method === "POST") {
        return logout(request, env, user);
      }

      if (url.pathname === "/api/auth/change-password" && request.method === "POST") {
        return changePassword(request, env, user);
      }

      if (url.pathname === "/api/me" && request.method === "GET") {
        return getMe(env, user);
      }

      if (url.pathname === "/api/profile" && request.method === "PUT") {
        return updateProfile(request, env, user);
      }

      if (url.pathname === "/api/dashboard" && request.method === "GET") {
        return dashboard(env, user);
      }

      if (url.pathname === "/api/subjects" && request.method === "GET") {
        return subjects(env);
      }

      if (url.pathname === "/api/topics" && request.method === "GET") {
        return topics(url, env);
      }

      if (url.pathname === "/api/course" && request.method === "GET") {
        return getCourse(url, env, user);
      }

      if (url.pathname === "/api/course-summaries" && request.method === "GET") {
        return getCourseSummaries(url, env, user);
      }

      if (url.pathname === "/api/course/material-pack" && request.method === "POST") {
        return aiCourseMaterialPack(request, env, user);
      }

      if (url.pathname === "/api/course/sources" && request.method === "GET") {
        return listUniversitySources(url, env, user);
      }

      if (url.pathname === "/api/course/source" && request.method === "GET") {
        return getUniversitySource(url, env, user);
      }

      if (url.pathname === "/api/course/source" && request.method === "DELETE") {
        return deleteUniversitySourceApi(url, env, user);
      }

      if (url.pathname === "/api/course/source-import" && request.method === "POST") {
        return importUniversitySourceApi(request, env, user);
      }

      if (url.pathname === "/api/course/source-chat" && request.method === "POST") {
        return universitySourceChat(request, env, user);
      }

      if (url.pathname === "/api/language-stats" && request.method === "GET") {
        return languageStats(env, user);
      }

      if (url.pathname === "/api/language-practice" && request.method === "POST") {
        return recordLanguagePractice(request, env, user);
      }

      if (url.pathname === "/api/language/lesson-pack" && request.method === "POST") {
        return aiLanguageLessonPack(request, env, user);
      }

      if (url.pathname === "/api/lesson-progress" && request.method === "PUT") {
        return putLessonProgress(request, env, user);
      }

      if (url.pathname === "/api/course-note" && request.method === "GET") {
        return getCourseNote(url, env, user);
      }

      if (url.pathname === "/api/course-note" && request.method === "PUT") {
        return putCourseNote(request, env, user);
      }

      if (url.pathname === "/api/tutor-sessions" && request.method === "GET") {
        return listTutorSessions(env, user);
      }

      if (url.pathname === "/api/tutor-session" && request.method === "GET") {
        return getTutorSession(url, env, user);
      }

      if (url.pathname === "/api/resume" && request.method === "GET") {
        return getResume(env, user);
      }

      if (url.pathname === "/api/resume" && request.method === "PUT") {
        return putResume(request, env, user);
      }

      if (url.pathname === "/api/topic-progress" && request.method === "PUT") {
        return putTopicProgress(request, env, user);
      }

      if (url.pathname === "/api/flashcards" && request.method === "GET") {
        return listFlashcards(url, env, user);
      }

      if (url.pathname === "/api/flashcards" && request.method === "POST") {
        return createFlashcard(request, env, user);
      }

      if (url.pathname === "/api/flashcards" && request.method === "DELETE") {
        return deleteFlashcard(url, env, user);
      }

      if (url.pathname === "/api/flashcards/review" && request.method === "POST") {
        return reviewFlashcard(request, env, user);
      }

      if (url.pathname === "/api/library" && request.method === "GET") {
        return listStudyLibrary(url, env, user);
      }

      if (url.pathname === "/api/library/folder" && request.method === "POST") {
        return createStudyLibraryFolder(request, env, user);
      }

      if (url.pathname === "/api/library/upload" && request.method === "POST") {
        return uploadStudyLibraryFile(request, env, user);
      }

      if (url.pathname === "/api/library/file" && request.method === "GET") {
        return getStudyLibraryFile(url, env, user);
      }

      if (url.pathname === "/api/library/item" && request.method === "PUT") {
        return updateStudyLibraryItem(request, env, user);
      }

      if (url.pathname === "/api/library/item" && request.method === "DELETE") {
        return deleteStudyLibraryItemApi(url, env, user);
      }

      if (url.pathname === "/api/notes" && request.method === "GET") {
        return listNotes(env, user);
      }

      if (url.pathname === "/api/notes" && request.method === "POST") {
        return createNote(request, env, user);
      }

      if (url.pathname === "/api/notes" && request.method === "DELETE") {
        return deleteNote(url, env, user);
      }

      if (url.pathname === "/api/deadlines" && request.method === "GET") {
        return listDeadlines(env, user);
      }

      if (url.pathname === "/api/deadlines" && request.method === "POST") {
        return createDeadline(request, env, user);
      }

      if (url.pathname === "/api/mistakes" && request.method === "GET") {
        return listMistakes(env, user);
      }

      if (url.pathname === "/api/stats" && request.method === "GET") {
        return stats(env, user);
      }

      if (url.pathname === "/api/search" && request.method === "GET") {
        return search(url, env, user);
      }

      if (url.pathname === "/api/exams/record" && request.method === "POST") {
        return recordExam(request, env, user);
      }

      if (url.pathname === "/api/ai/chat/stream" && request.method === "POST") {
        return aiChatStream(request, env, user, ctx);
      }

      if (url.pathname === "/api/ai/chat" && request.method === "POST") {
        return aiChat(request, env, user);
      }

      if (url.pathname === "/api/ai/exam" && request.method === "POST") {
        return aiExam(request, env, user);
      }

      if (url.pathname === "/api/ai/flashcards" && request.method === "POST") {
        return aiFlashcards(request, env, user);
      }

      if (url.pathname === "/api/ai/vision" && request.method === "POST") {
        return aiVision(request, env, user);
      }

      return json({ error: "Ruta API no encontrada." }, 404);
    } catch (err) {
      console.error("MED_AI_ERROR", err?.stack || err);
      return json({
        error: "Ocurrió un error interno.",
        detail: env.ENVIRONMENT === "development" ? String(err?.message || err) : undefined
      }, 500);
    }
  }
};


async function ensurePersonalUser(env) {
  const userId = "med_ai_personal_dalton";
  const email = "personal@med-ai.local";
  const now = new Date().toISOString();

  let user = await env.DB.prepare(
    "SELECT id,email,status FROM users WHERE id=? LIMIT 1"
  ).bind(userId).first();

  if (!user) {
    await env.DB.batch([
      env.DB.prepare(`
        INSERT OR IGNORE INTO users
        (id,email,password_hash,password_salt,password_algorithm,password_iterations,email_verified,status,created_at,updated_at)
        VALUES (?,?,'NOT_USED','NOT_USED','PERSONAL_MODE',1,1,'active',?,?)
      `).bind(userId,email,now,now),

      env.DB.prepare(`
        INSERT OR IGNORE INTO profiles
        (user_id,full_name,target_specialty,country,timezone,preferred_language,created_at,updated_at)
        VALUES (?,'Dalton','Medicina Interna','Guatemala','America/Guatemala','es',?,?)
      `).bind(userId,now,now),

      env.DB.prepare(`
        INSERT OR IGNORE INTO user_preferences
        (user_id,created_at,updated_at)
        VALUES (?,?,?)
      `).bind(userId,now,now),

      env.DB.prepare(`
        INSERT OR IGNORE INTO study_resume_state
        (user_id,route,progress_percent,context_json,sync_version,updated_at)
        VALUES (?,'/',0,'{}',1,?)
      `).bind(userId,now)
    ]);

    user = { id:userId, email, status:"active" };
  }

  return user;
}

// -------------------- AUTH --------------------

async function register(request, env) {
  const body = await readJson(request);
  const email = normalizeEmail(body.email);
  const password = String(body.password || "");
  const fullName = cleanText(body.fullName, 120);

  if (!isEmail(email)) return json({ error: "Correo electrónico inválido." }, 400);
  if (password.length < 10) return json({ error: "La contraseña debe tener al menos 10 caracteres." }, 400);

  if (env.ALLOW_SIGNUPS === "false") {
    const count = await env.DB.prepare("SELECT COUNT(*) AS n FROM users").first();
    if (Number(count?.n || 0) > 0) {
      return json({ error: "El registro de nuevas cuentas está desactivado." }, 403);
    }
  }

  const exists = await env.DB.prepare("SELECT id FROM users WHERE email = ? COLLATE NOCASE").bind(email).first();
  if (exists) return json({ error: "Ese correo ya está registrado." }, 409);

  const userId = crypto.randomUUID();
  const saltBytes = crypto.getRandomValues(new Uint8Array(16));
  const salt = bytesToBase64url(saltBytes);
  const hash = await derivePassword(password, saltBytes, PASSWORD_ITERATIONS);

  const now = new Date().toISOString();
  const statements = [
    env.DB.prepare(`
      INSERT INTO users
      (id,email,password_hash,password_salt,password_algorithm,password_iterations,email_verified,status,created_at,updated_at)
      VALUES (?,?,?,?,?,?,1,'active',?,?)
    `).bind(userId, email, hash, salt, "PBKDF2-SHA256", PASSWORD_ITERATIONS, now, now),

    env.DB.prepare(`
      INSERT INTO profiles (user_id,full_name,target_specialty,country,timezone,preferred_language,created_at,updated_at)
      VALUES (?,?, 'Medicina Interna','Guatemala','America/Guatemala','es',?,?)
    `).bind(userId, fullName || email.split("@")[0], now, now),

    env.DB.prepare(`
      INSERT INTO user_preferences (user_id,created_at,updated_at) VALUES (?,?,?)
    `).bind(userId, now, now),

    env.DB.prepare(`
      INSERT INTO study_resume_state (user_id,route,progress_percent,context_json,sync_version,updated_at)
      VALUES (?, '/',0,'{}',1,?)
    `).bind(userId, now)
  ];

  await env.DB.batch(statements);
  return issueSession(request, env, { id: userId, email }, 201);
}

async function login(request, env) {
  const body = await readJson(request);
  const email = normalizeEmail(body.email);
  const password = String(body.password || "");

  const user = await env.DB.prepare(`
    SELECT id,email,password_hash,password_salt,password_iterations,status
    FROM users WHERE email = ? COLLATE NOCASE
  `).bind(email).first();

  if (!user || user.status !== "active") {
    await delay(180);
    return json({ error: "Correo o contraseña incorrectos." }, 401);
  }

  const salt = base64urlToBytes(user.password_salt);
  const candidate = await derivePassword(password, salt, Number(user.password_iterations || PASSWORD_ITERATIONS));
  if (!constantTimeEqual(candidate, user.password_hash)) {
    await delay(180);
    return json({ error: "Correo o contraseña incorrectos." }, 401);
  }

  await env.DB.prepare("UPDATE users SET last_login_at=?, updated_at=? WHERE id=?")
    .bind(new Date().toISOString(), new Date().toISOString(), user.id).run();

  return issueSession(request, env, user, 200);
}

async function issueSession(request, env, user, status = 200) {
  const tokenBytes = crypto.getRandomValues(new Uint8Array(32));
  const rawToken = bytesToBase64url(tokenBytes);
  const tokenHash = await sha256(rawToken);
  const id = crypto.randomUUID();
  const now = new Date();
  const expires = new Date(now.getTime() + SESSION_DAYS * 86400000);
  const ua = request.headers.get("user-agent") || "";

  await env.DB.prepare(`
    INSERT INTO sessions (id,user_id,token_hash,user_agent,created_at,last_seen_at,expires_at)
    VALUES (?,?,?,?,?,?,?)
  `).bind(id, user.id, tokenHash, ua.slice(0, 500), now.toISOString(), now.toISOString(), expires.toISOString()).run();

  const secure = new URL(request.url).protocol === "https:";
  const cookie = [
    `medai_session=${rawToken}`,
    "HttpOnly",
    "Path=/",
    "SameSite=Lax",
    secure ? "Secure" : "",
    `Max-Age=${SESSION_DAYS * 86400}`
  ].filter(Boolean).join("; ");

  return json({ ok: true, user: { id: user.id, email: user.email } }, status, { "set-cookie": cookie });
}

async function requireAuth(request, env) {
  const token = parseCookie(request.headers.get("cookie") || "", "medai_session");
  if (!token) return { ok: false, response: json({ error: "Debes iniciar sesión." }, 401) };

  const tokenHash = await sha256(token);
  const user = await env.DB.prepare(`
    SELECT u.id,u.email,u.status,s.id AS session_id
    FROM sessions s
    JOIN users u ON u.id=s.user_id
    WHERE s.token_hash=? AND s.revoked_at IS NULL
      AND datetime(s.expires_at) > datetime('now')
    LIMIT 1
  `).bind(tokenHash).first();

  if (!user || user.status !== "active") {
    return { ok: false, response: json({ error: "Sesión vencida o inválida." }, 401) };
  }

  env.DB.prepare("UPDATE sessions SET last_seen_at=? WHERE id=?")
    .bind(new Date().toISOString(), user.session_id).run().catch(() => {});

  return { ok: true, user };
}

async function logout(request, env, user) {
  return json({ ok: true, personal_mode: true });
}

async function changePassword(request, env, user) {
  const body = await readJson(request);
  const currentPassword = String(body.currentPassword || "");
  const newPassword = String(body.newPassword || "");
  if (newPassword.length < 10) return json({ error: "La nueva contraseña debe tener al menos 10 caracteres." }, 400);

  const row = await env.DB.prepare(`
    SELECT password_hash,password_salt,password_iterations FROM users WHERE id=?
  `).bind(user.id).first();

  const candidate = await derivePassword(
    currentPassword,
    base64urlToBytes(row.password_salt),
    Number(row.password_iterations)
  );
  if (!constantTimeEqual(candidate, row.password_hash)) return json({ error: "Contraseña actual incorrecta." }, 401);

  const saltBytes = crypto.getRandomValues(new Uint8Array(16));
  const salt = bytesToBase64url(saltBytes);
  const hash = await derivePassword(newPassword, saltBytes, PASSWORD_ITERATIONS);
  const now = new Date().toISOString();

  await env.DB.batch([
    env.DB.prepare(`
      UPDATE users SET password_hash=?,password_salt=?,password_iterations=?,updated_at=? WHERE id=?
    `).bind(hash, salt, PASSWORD_ITERATIONS, now, user.id),
    env.DB.prepare("UPDATE sessions SET revoked_at=? WHERE user_id=? AND revoked_at IS NULL")
      .bind(now, user.id)
  ]);

  return json({ ok: true, relogin: true });
}

// -------------------- PROFILE / DASHBOARD --------------------

async function getMe(env, user) {
  const profile = await env.DB.prepare(`
    SELECT u.id,u.email,p.* FROM users u
    LEFT JOIN profiles p ON p.user_id=u.id
    WHERE u.id=?
  `).bind(user.id).first();
  return json({ user: profile });
}

async function updateProfile(request, env, user) {
  const body = await readJson(request);
  const now = new Date().toISOString();
  await env.DB.prepare(`
    UPDATE profiles SET
      full_name=?, university=?, academic_level=?, target_specialty=?,
      country=?, timezone=?, preferred_language=?, bio=?, updated_at=?
    WHERE user_id=?
  `).bind(
    cleanText(body.full_name, 120),
    cleanText(body.university, 160),
    cleanText(body.academic_level, 80) || "estudiante",
    cleanText(body.target_specialty, 120) || "Medicina Interna",
    cleanText(body.country, 80) || "Guatemala",
    cleanText(body.timezone, 80) || "America/Guatemala",
    cleanText(body.preferred_language, 20) || "es",
    cleanText(body.bio, 1500),
    now,
    user.id
  ).run();
  return getMe(env, user);
}

async function dashboard(env, user) {
  const [profile, resume, due, qstats, metrics, recent, deadlines] = await Promise.all([
    env.DB.prepare("SELECT * FROM profiles WHERE user_id=?").bind(user.id).first(),
    env.DB.prepare(`
      SELECT r.*,s.name AS subject_name,t.name AS topic_name,l.title AS lesson_title
      FROM study_resume_state r
      LEFT JOIN subjects s ON s.id=r.subject_id
      LEFT JOIN topics t ON t.id=r.topic_id
      LEFT JOIN lessons l ON l.id=r.lesson_id
      WHERE r.user_id=?
    `).bind(user.id).first(),
    env.DB.prepare(`
      SELECT COUNT(*) AS n FROM flashcards
      WHERE user_id=? AND suspended=0 AND datetime(due_at)<=datetime('now')
    `).bind(user.id).first(),
    env.DB.prepare(`
      SELECT COUNT(*) AS total,
             COALESCE(SUM(CASE WHEN is_correct=1 THEN 1 ELSE 0 END),0) AS correct
      FROM question_attempts WHERE user_id=?
    `).bind(user.id).first(),
    env.DB.prepare(`
      SELECT COALESCE(SUM(study_seconds),0) AS study_seconds,
             COALESCE(SUM(questions_answered),0) AS questions_answered,
             COALESCE(SUM(cases_completed),0) AS cases_completed,
             COALESCE(SUM(xp_earned),0) AS xp_earned
      FROM daily_metrics WHERE user_id=?
    `).bind(user.id).first(),
    env.DB.prepare(`
      SELECT p.mastery,p.last_studied_at,t.name AS topic_name,s.name AS subject_name
      FROM user_topic_progress p
      JOIN topics t ON t.id=p.topic_id
      JOIN subjects s ON s.id=t.subject_id
      WHERE p.user_id=?
      ORDER BY datetime(p.last_studied_at) DESC LIMIT 5
    `).bind(user.id).all(),
    env.DB.prepare(`
      SELECT id,title,due_at,deadline_type,importance
      FROM academic_deadlines
      WHERE user_id=? AND completed=0
      ORDER BY datetime(due_at) ASC LIMIT 5
    `).bind(user.id).all()
  ]);

  const total = Number(qstats?.total || 0);
  const correct = Number(qstats?.correct || 0);
  return json({
    profile,
    resume,
    dueFlashcards: Number(due?.n || 0),
    accuracy: total ? Math.round((correct / total) * 100) : 0,
    questionsAnswered: total,
    metrics,
    recentTopics: recent.results || [],
    deadlines: deadlines.results || []
  });
}

// -------------------- CURRICULUM / PROGRESS --------------------

async function subjects(env) {
  await ensureExpandedCurriculum(env);
  const rows = await env.DB.prepare(`
    SELECT id,code,name,description,category,icon,sort_order
    FROM subjects WHERE active=1 ORDER BY sort_order,name
  `).all();
  return json({ subjects: rows.results || [] });
}

async function ensureExpandedCurriculum(env){
  const now=new Date().toISOString();
  const subjects=[
    ["subj_math","MATH","Matemática","Desde aritmética y álgebra hasta cálculo, estadística y ecuaciones diferenciales.","Ciencias","∑",210],
    ["subj_physics","PHYS","Física","Mecánica, termodinámica, ondas, electricidad, magnetismo, óptica y física moderna.","Ciencias","Φ",220],
    ["subj_astronomy","ASTRO","Astronomía","Sistema Solar, estrellas, galaxias, observación y cosmología.","Ciencias","✧",230],
    ["subj_languages","LANG","Idiomas","Aprendizaje progresivo A1-C2 con comprensión, producción, conversación y pronunciación.","Idiomas","文",240]
  ];
  const topicMap={
    subj_math:["Aritmética y proporciones","Álgebra","Ecuaciones e inecuaciones","Funciones y gráficas","Geometría","Trigonometría","Geometría analítica","Límites y continuidad","Derivadas","Integrales","Probabilidad y estadística","Vectores y matrices","Ecuaciones diferenciales"],
    subj_physics:["Unidades, medición y vectores","Cinemática","Leyes de Newton","Trabajo y energía","Cantidad de movimiento","Rotación y torque","Fluidos","Termodinámica","Ondas y sonido","Electricidad","Magnetismo","Óptica","Relatividad","Física cuántica y moderna"],
    subj_astronomy:["Esfera celeste y coordenadas","Gravedad y órbitas","Sistema Solar","El Sol","Propiedades de las estrellas","Evolución estelar","Exoplanetas","Vía Láctea","Galaxias","Cosmología","Telescopios y observación","Astrobiología"],
    subj_languages:["A1 — Principiante","A2 — Elemental","B1 — Intermedio","B2 — Intermedio alto","C1 — Avanzado","C2 — Dominio"]
  };
  const statements=[];
  for(const s of subjects){statements.push(env.DB.prepare(`INSERT OR IGNORE INTO subjects (id,code,name,description,category,icon,sort_order,active,created_at,updated_at) VALUES (?,?,?,?,?,?,?,1,?,?)`).bind(...s,now,now));}
  for(const [subjectId,names] of Object.entries(topicMap)){
    names.forEach((name,i)=>{
      const slug=name.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
      statements.push(env.DB.prepare(`INSERT OR IGNORE INTO topics (id,subject_id,parent_topic_id,slug,name,description,difficulty_min,difficulty_max,estimated_minutes,sort_order,active,created_at,updated_at) VALUES (?,?,NULL,?,?,?,1,10,30,?,1,?,?)`).bind(`topic_${subjectId}_${i+1}`,subjectId,slug,name,`Ruta guiada de ${name}.`,i+1,now,now));
    });
  }
  await env.DB.batch(statements);
}

async function topics(url, env) {
  const subjectId = url.searchParams.get("subject_id");
  if (!subjectId) return json({ error: "Falta subject_id." }, 400);
  const rows = await env.DB.prepare(`
    SELECT id,subject_id,parent_topic_id,slug,name,description,difficulty_min,difficulty_max,estimated_minutes,sort_order
    FROM topics WHERE active=1 AND subject_id=? AND id NOT LIKE 'course_%' ORDER BY sort_order,name
  `).bind(subjectId).all();
  return json({ topics: rows.results || [] });
}

function normalizeCourseLanguage(value){
  const allowed=new Set(["he-IL","la","en-US","ru-RU","fr-FR"]);
  return allowed.has(value)?value:"en-US";
}

function courseLanguageKey(value){
  const normalized=normalizeCourseLanguage(value);
  const allowed={"he-IL":"he","la":"la","en-US":"en","ru-RU":"ru","fr-FR":"fr"};
  return allowed[normalized];
}

const LANGUAGE_COURSE_PATHS={
  "he":[
    "Alef-bet: reconocimiento de las letras",
    "Alef-bet: escritura y formas finales",
    "Niqqud y pronunciación básica",
    "Saludos, presentaciones y frases esenciales",
    "Género, número y concordancia",
    "Artículos, preposiciones y posesión",
    "Raíces de palabras y formación de vocabulario",
    "Verbos: presente y patrones básicos",
    "Verbos: pasado",
    "Verbos: futuro",
    "Binyanim: introducción a los patrones verbales",
    "Oraciones, preguntas y negación",
    "Lectura de textos sencillos sin niqqud",
    "Conversación cotidiana y comprensión auditiva",
    "Hebreo académico y vocabulario formal",
    "Lectura avanzada, expresiones y matices"
  ],
  "la":[
    "Pronunciación y alfabeto latino",
    "Concepto de caso, género y número",
    "Primera declinación",
    "Segunda declinación",
    "Adjetivos y concordancia",
    "Presente de indicativo y verbo sum",
    "Tercera declinación",
    "Cuarta y quinta declinación",
    "Pronombres y demostrativos",
    "Imperfecto y futuro",
    "Perfecto, pluscuamperfecto y futuro perfecto",
    "Voz pasiva",
    "Infinitivos y participios",
    "Subjuntivo",
    "Proposiciones subordinadas",
    "Acusativo con infinitivo y estilo indirecto",
    "Sintaxis avanzada",
    "Lectura guiada de textos latinos"
  ],
  "en":[
    "Pronunciación, alfabeto y sonidos fundamentales",
    "A1 · Saludos, presentaciones y verbo to be",
    "A1 · Presente simple y vida cotidiana",
    "A1 · Preguntas, negación y vocabulario esencial",
    "A2 · Pasado simple y experiencias",
    "A2 · Futuro, planes y situaciones prácticas",
    "A2 · Modales y comparaciones",
    "B1 · Presente perfecto y narración",
    "B1 · Conversación independiente",
    "B1 · Comprensión de textos y escucha",
    "B2 · Condicionales y estructuras complejas",
    "B2 · Argumentación y precisión",
    "B2 · Phrasal verbs y expresiones",
    "C1 · Escritura académica y profesional",
    "C1 · Matices, registro y fluidez",
    "C1 · Comprensión avanzada",
    "C2 · Precisión idiomática y estilo",
    "C2 · Dominio funcional avanzado"
  ],
  "ru":[
    "Alfabeto cirílico",
    "Pronunciación, acento y reducción vocálica",
    "Saludos, presentaciones y frases esenciales",
    "Género y número de sustantivos",
    "Caso nominativo y estructura básica",
    "Caso acusativo",
    "Caso preposicional",
    "Caso genitivo",
    "Caso dativo",
    "Caso instrumental",
    "Verbos en presente y conjugaciones",
    "Pasado y futuro",
    "Aspecto verbal: perfectivo e imperfectivo",
    "Verbos de movimiento",
    "Adjetivos, pronombres y concordancia",
    "Oraciones complejas y conectores",
    "Conversación y comprensión intermedia",
    "Ruso avanzado: registro, matices y textos auténticos"
  ],
  "fr":[
    "Pronunciación, alfabeto y sonidos franceses",
    "A1 · Saludos, presentaciones y être / avoir",
    "A1 · Artículos, género y número",
    "A1 · Presente y verbos frecuentes",
    "A1 · Preguntas, negación y vida cotidiana",
    "A2 · Passé composé",
    "A2 · Imparfait y narración",
    "A2 · Futuro y situaciones prácticas",
    "B1 · Pronombres y estructuras frecuentes",
    "B1 · Conversación independiente",
    "B1 · Comprensión auditiva y lectura",
    "B2 · Subjonctif y estructuras complejas",
    "B2 · Argumentación y precisión",
    "B2 · Expresiones idiomáticas",
    "C1 · Escritura académica y profesional",
    "C1 · Registro, matices y fluidez",
    "C2 · Comprensión avanzada",
    "C2 · Dominio funcional y estilo"
  ]
};

function coursePathFor(subjectCode,language){
  if(subjectCode!=="LANG") return COURSE_PATHS[subjectCode]||[];
  const key=courseLanguageKey(language);
  return LANGUAGE_COURSE_PATHS[key]||LANGUAGE_COURSE_PATHS.en;
}

function coursePrefix(subjectCode, language){
  return subjectCode==="LANG"?`course_LANG_${courseLanguageKey(language)}`:`course_${subjectCode}`;
}

async function ensureSubjectCourse(env, subject, language){
  const names=coursePathFor(subject.code,language);
  if(!names.length) return;
  const prefix=coursePrefix(subject.code,language);
  const now=new Date().toISOString();
  const statements=[];
  names.forEach((name,index)=>{
    const n=String(index+1).padStart(2,"0");
    const topicId=`${prefix}_${n}`;
    const lessonId=`lesson_${prefix}_${n}`;
    const difficulty=Math.max(1,Math.min(10,Math.ceil((index+1)/names.length*10)));
    const summary=`Lección guiada ${index+1} de ${names.length}. Avanza desde los fundamentos hasta la aplicación de ${name}.`;
    const objectives=[`Comprender los fundamentos de ${name}.`,`Explicar los conceptos clave con tus propias palabras.`,`Aplicar ${name} en preguntas, problemas o escenarios apropiados al nivel.`];
    const slug=subject.code==="LANG"?`lang-${courseLanguageKey(language)}-curso-${n}`:`${subject.code.toLowerCase()}-curso-${n}`;
    statements.push(env.DB.prepare(`INSERT INTO topics (id,subject_id,parent_topic_id,slug,name,description,difficulty_min,difficulty_max,estimated_minutes,sort_order,active,created_at,updated_at) VALUES (?,?,NULL,?,?,?, ?, ?,35,?,1,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name,description=excluded.description,difficulty_min=excluded.difficulty_min,difficulty_max=excluded.difficulty_max,estimated_minutes=excluded.estimated_minutes,sort_order=excluded.sort_order,active=1,updated_at=excluded.updated_at`).bind(topicId,subject.id,slug,name,summary,difficulty,difficulty,1000+index,now,now));
    statements.push(env.DB.prepare(`INSERT INTO lessons (id,topic_id,title,summary,content_md,learning_objectives_json,clinical_pearls_json,common_errors_json,source_references_json,estimated_minutes,difficulty,version,active,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,35,?,1,1,?,?) ON CONFLICT(id) DO UPDATE SET title=excluded.title,summary=excluded.summary,learning_objectives_json=excluded.learning_objectives_json,difficulty=excluded.difficulty,active=1,updated_at=excluded.updated_at`).bind(lessonId,topicId,`${n} · ${name}`,summary,"Lección guiada por MED AI.",JSON.stringify(objectives),"[]","[]","[]",difficulty,now,now));
  });
  await env.DB.batch(statements);
}

async function languageStatsData(env,user){
  const profile=await env.DB.prepare("SELECT total_xp FROM profiles WHERE user_id=?").bind(user.id).first();
  const rows=await env.DB.prepare(`SELECT metric_date,xp_earned,study_seconds,questions_answered FROM daily_metrics WHERE user_id=? AND (xp_earned>0 OR study_seconds>0 OR questions_answered>0) ORDER BY metric_date DESC LIMIT 180`).bind(user.id).all();
  const metrics=rows.results||[];
  const today=new Date().toISOString().slice(0,10);
  const todayRow=metrics.find(x=>x.metric_date===today);
  const active=new Set(metrics.map(x=>x.metric_date));
  let cursor=new Date(`${today}T00:00:00Z`);
  if(!active.has(today)) cursor=new Date(cursor.getTime()-86400000);
  let streak=0;
  while(streak<365){
    const key=cursor.toISOString().slice(0,10);
    if(!active.has(key))break;
    streak++;cursor=new Date(cursor.getTime()-86400000);
  }
  return {total_xp:Number(profile?.total_xp||0),today_xp:Number(todayRow?.xp_earned||0),streak,today_study_seconds:Number(todayRow?.study_seconds||0)};
}

async function languageStats(env,user){
  return json(await languageStatsData(env,user));
}

async function recordLanguagePractice(request,env,user){
  const body=await readJson(request);
  const xp=clamp(Math.round(Number(body.xp||0)),0,30);
  const answered=clamp(Math.round(Number(body.answered||0)),0,5);
  const correct=clamp(Math.round(Number(body.correct||0)),0,answered);
  const studySeconds=clamp(Math.round(Number(body.study_seconds||0)),0,1800);
  await bumpDailyMetric(env,user.id,{study_seconds:studySeconds,questions_answered:answered,questions_correct:correct,xp_earned:xp});
  if(xp>0) await env.DB.prepare("UPDATE profiles SET total_xp=total_xp+?,current_medical_level=MAX(1,CAST((total_xp+?)/500 AS INTEGER)+1),updated_at=? WHERE user_id=?").bind(xp,xp,new Date().toISOString(),user.id).run();
  return json({ok:true,...await languageStatsData(env,user)});
}

async function getCourseSummaries(url,env,user){
  const language=normalizeCourseLanguage(url.searchParams.get("language")||"en-US");
  const subjectsRows=await env.DB.prepare("SELECT id,code,name FROM subjects WHERE active=1 ORDER BY sort_order,name").all();
  const progressRows=await env.DB.prepare(`
    SELECT t.subject_id,t.id AS topic_id,COALESCE(p.completed,0) AS completed
    FROM topics t
    JOIN lessons l ON l.topic_id=t.id AND l.active=1
    LEFT JOIN user_lesson_progress p ON p.lesson_id=l.id AND p.user_id=?
    WHERE t.active=1 AND t.id LIKE 'course_%'
  `).bind(user.id).all();

  const allProgress=progressRows.results||[];
  const summaries={};
  for(const subject of (subjectsRows.results||[])){
    const path=coursePathFor(subject.code,language);
    if(!path.length) continue;
    const prefix=coursePrefix(subject.code,language)+"_";
    const completed=allProgress.filter(row=>
      row.subject_id===subject.id &&
      String(row.topic_id||"").startsWith(prefix) &&
      Number(row.completed)===1
    ).length;
    const total=path.length;
    summaries[subject.id]={
      subject_id:subject.id,
      code:subject.code,
      total,
      completed,
      progress_percent:total?Math.round(completed/total*100):0,
      language:subject.code==="LANG"?language:null
    };
  }
  return json({summaries,language});
}

async function getCourse(url, env, user){
  const subjectId=url.searchParams.get("subject_id");
  const language=normalizeCourseLanguage(url.searchParams.get("language")||"en-US");
  if(!subjectId) return json({error:"Falta subject_id."},400);
  const subject=await env.DB.prepare("SELECT id,code,name,description,category,icon FROM subjects WHERE id=? AND active=1").bind(subjectId).first();
  if(!subject) return json({error:"Materia no encontrada."},404);
  await ensureSubjectCourse(env,subject,language);
  const prefix=coursePrefix(subject.code,language);
  const rows=await env.DB.prepare(`
    SELECT t.id AS topic_id,t.name AS topic_name,t.description,t.difficulty_min,t.estimated_minutes,t.sort_order,
           l.id AS lesson_id,l.title AS lesson_title,l.summary,l.learning_objectives_json,l.difficulty,
           COALESCE(p.progress_percent,0) AS progress_percent,COALESCE(p.completed,0) AS completed,
           p.started_at,p.completed_at,p.last_studied_at,p.last_position_json
    FROM topics t
    JOIN lessons l ON l.topic_id=t.id AND l.active=1
    LEFT JOIN user_lesson_progress p ON p.lesson_id=l.id AND p.user_id=?
    WHERE t.subject_id=? AND t.active=1 AND t.id LIKE ?
    ORDER BY t.sort_order
  `).bind(user.id,subject.id,`${prefix}_%`).all();
  const items=rows.results||[];
  const total=items.length;
  const completed=items.filter(x=>Number(x.completed)===1).length;
  const progress=total?Math.round(completed/total*100):0;
  const nextIndex=items.findIndex(x=>Number(x.completed)!==1);
  return json({subject,language:subject.code==="LANG"?language:null,items,total,completed,progress_percent:progress,next_index:nextIndex<0?Math.max(0,total-1):nextIndex});
}

function courseTeachingProfile(code,languageName){
  if(code==="MATH")return "Enseña matemática desde intuición hasta formalización. Define símbolos, desarrolla procedimientos sin saltos, incluye fórmulas y ejemplos resueltos, comprueba resultados y señala errores algebraicos frecuentes.";
  if(code==="PHYS")return "Enseña física conectando intuición, modelo, ecuaciones, unidades y aplicación. Incluye ejemplos resueltos y comprobación dimensional cuando corresponda.";
  if(code==="ASTRO")return "Enseña astronomía con escalas, observaciones, evidencia, mecanismos físicos y relaciones cuantitativas cuando sean útiles. Distingue hechos observados, modelos e incertidumbre.";
  if(code==="LANG")return `Enseña ${languageName||"el idioma objetivo"} a un hispanohablante. La clase debe explicar la regla o patrón antes de practicarlo, usar ejemplos auténticos, pronunciación cuando ayude, vocabulario contextual y producción activa. Mantén el idioma objetivo apropiado al nivel.`;
  return "Enseña medicina y ciencias de la salud con rigor académico. Parte de fundamentos, conecta mecanismo con manifestaciones y aplicación clínica cuando corresponda. Distingue datos establecidos, razonamiento e incertidumbre. Es material educativo; evita presentar una recomendación como sustituto de atención clínica real.";
}


function courseMaterialDiagramFallback(material,topicName){
  const sections=Array.isArray(material?.sections)?material.sections:[];
  return {
    title:`Diagrama de ${topicName}`,
    caption:"Secuencia visual de los conceptos centrales.",
    steps:sections.slice(0,7).map((sec,i)=>({
      label:cleanText(sec?.title,260)||`Parte ${i+1}`,
      detail:cleanText((Array.isArray(sec?.key_points)&&sec.key_points.length?sec.key_points.join(" · "):sec?.content)||"",900)
    })).filter(x=>x.label)
  };
}

function courseMaterialMapFallback(material,topicName){
  const sections=Array.isArray(material?.sections)?material.sections:[];
  return {
    center:topicName,
    branches:sections.slice(0,7).map(sec=>({
      label:cleanText(sec?.title,260)||"Concepto",
      children:Array.isArray(sec?.key_points)?sec.key_points.slice(0,4).map(x=>cleanText(x,350)).filter(Boolean):[]
    })).filter(x=>x.label)
  };
}

function upgradeCourseMaterialV19(material,row){
  if(!material||typeof material!=="object")return null;
  const sections=Array.isArray(material.sections)?material.sections:[];
  const practice=Array.isArray(material.practice)?material.practice:[];
  if(sections.length<3||practice.length<6)return null;
  return {
    ...material,
    version:19,
    title:cleanText(material.title,260)||row.topic_name,
    overview:cleanText(material.overview,1600)||cleanText(row.summary||row.description,1600),
    diagram:(material.diagram&&Array.isArray(material.diagram.steps)&&material.diagram.steps.length)
      ? material.diagram
      : courseMaterialDiagramFallback(material,row.topic_name),
    concept_map:(material.concept_map&&Array.isArray(material.concept_map.branches)&&material.concept_map.branches.length)
      ? material.concept_map
      : courseMaterialMapFallback(material,row.topic_name)
  };
}

async function saveCourseMaterialV19(env,user,row,languageName,title,material,existingId=null){
  const serialized=JSON.stringify(material),now=new Date().toISOString();
  const tags=JSON.stringify(["curso","material_v19"]);
  const metadata=JSON.stringify({course_material:true,version:19,lesson_id:row.lesson_id,language:languageName});
  if(existingId){
    await env.DB.prepare("UPDATE notes SET title=?,body=?,tags_json=?,metadata_json=?,updated_at=?,sync_version=sync_version+1 WHERE id=? AND user_id=?")
      .bind(title,serialized,tags,metadata,now,existingId,user.id).run();
    return {updated_at:now,id:existingId};
  }
  const id=crypto.randomUUID();
  await env.DB.prepare(`INSERT INTO notes (id,user_id,subject_id,topic_id,title,body,tags_json,pinned,metadata_json,sync_version,created_at,updated_at)
    VALUES (?,?,?,?,?,?,?,0,?,1,?,?)`)
    .bind(id,user.id,row.subject_id,row.topic_id,title,serialized,tags,metadata,now,now).run();
  return {updated_at:now,id};
}

function aiErrorString(err){
  try{
    const pieces=[
      err?.message,err?.stack,err?.cause?.message,
      typeof err?.cause==="string"?err.cause:"",
      JSON.stringify(err?.cause||{})
    ].filter(Boolean);
    return pieces.join(" ").toLowerCase();
  }catch{return String(err||"").toLowerCase()}
}

function classifyWorkersAIError(err){
  const t=aiErrorString(err);
  if(t.includes("3036")||t.includes("daily free allocation")||t.includes("10,000 neurons")||t.includes("used up your daily"))return "quota";
  if(t.includes("insufficient credit")||t.includes("insufficient balance")||t.includes("credits")&&t.includes("exhaust"))return "credits";
  if(t.includes("3040")||t.includes("out of capacity")||t.includes("capacity"))return "capacity";
  if(t.includes("5035")||t.includes("requires workers paid"))return "paid_model";
  if(t.includes("504")||t.includes("gateway timeout")||t.includes("timed out")||t.includes("timeout"))return "timeout";
  if(t.includes("429")||t.includes("rate limited")||t.includes("rate_limit"))return "rate";
  return "other";
}

function workersAIUserMessage(err){
  const kind=classifyWorkersAIError(err);
  if(kind==="credits")return "Los créditos de AI Gateway parecen haberse agotado. Tu progreso está seguro; recarga créditos en Cloudflare para continuar usando los modelos premium.";
  if(kind==="quota")return "El respaldo de Workers AI alcanzó su cuota. MED AI también intentó los modelos premium del AI Gateway antes de mostrar este aviso.";
  if(kind==="capacity")return "El proveedor de IA está temporalmente sin capacidad. MED AI probó modelos alternativos; vuelve a intentarlo en unos minutos.";
  if(kind==="paid_model")return "El modelo solicitado no está disponible con la facturación actual. MED AI intentó modelos alternativos.";
  if(kind==="timeout")return "La IA tardó demasiado en responder. MED AI intentó un modelo alternativo; vuelve a intentarlo.";
  if(kind==="rate")return "El proveedor está limitando temporalmente las solicitudes. MED AI intentó un modelo alternativo; espera unos segundos e inténtalo otra vez.";
  return "AI Gateway no pudo completar la respuesta en este momento.";
}


async function getCourseTopicRow(env,topicId,lessonId=null,subjectId=null){
  let sql=`SELECT t.id AS topic_id,t.name AS topic_name,t.description,t.subject_id,l.id AS lesson_id,l.summary,l.difficulty,s.name AS subject_name,s.code AS subject_code
    FROM topics t JOIN lessons l ON l.topic_id=t.id JOIN subjects s ON s.id=t.subject_id
    WHERE t.id=? AND t.active=1 AND l.active=1`;
  const args=[topicId];
  if(lessonId){sql+=" AND l.id=?";args.push(lessonId)}
  if(subjectId){sql+=" AND s.id=?";args.push(subjectId)}
  sql+=" LIMIT 1";
  return env.DB.prepare(sql).bind(...args).first();
}

async function listUniversitySources(url,env,user){
  const topicId=cleanText(url.searchParams.get("topic_id"),220);
  if(!topicId)return json({sources:[]});
  const rows=await env.DB.prepare(`
    SELECT id,title,metadata_json,created_at,updated_at
    FROM notes
    WHERE user_id=? AND topic_id=? AND tags_json LIKE '%university_source%'
    ORDER BY datetime(updated_at) DESC LIMIT 100
  `).bind(user.id,topicId).all();
  return json({sources:rows.results||[]});
}

async function getUniversitySource(url,env,user){
  const id=cleanText(url.searchParams.get("id"),220);
  if(!id)return json({error:"Falta el identificador del material."},400);
  const row=await env.DB.prepare(`
    SELECT id,title,body,metadata_json,created_at,updated_at
    FROM notes WHERE id=? AND user_id=? AND tags_json LIKE '%university_source%' LIMIT 1
  `).bind(id,user.id).first();
  if(!row)return json({error:"No encontré esta clase guardada."},404);
  const pack=parseJsonLoose(row.body);
  if(!pack)return json({error:"El material guardado no se pudo leer."},500);
  return json({source:{id:row.id,title:row.title,metadata_json:row.metadata_json,created_at:row.created_at,updated_at:row.updated_at},pack});
}

async function deleteUniversitySourceApi(url,env,user){
  const id=cleanText(url.searchParams.get("id"),220);
  if(!id)return json({error:"Falta el identificador."},400);
  await env.DB.prepare("DELETE FROM notes WHERE id=? AND user_id=? AND tags_json LIKE '%university_source%'").bind(id,user.id).run();
  return json({ok:true});
}

function universitySourcePrompt(row,body){
  const sourceType=body.source_type||"text";
  const languageNames={"he-IL":"Hebreo","la":"Latín","en-US":"Inglés","ru-RU":"Ruso","fr-FR":"Francés"};
  const targetLanguage=row.subject_code==="LANG"?languageNames[normalizeCourseLanguage(body.language||"en-US")]:null;
  return `Eres un profesor universitario excelente y diseñador instruccional de MED AI DALTON.

TAREA: convierte el MATERIAL PROPORCIONADO POR EL ESTUDIANTE en una clase de estudio fiel y reutilizable.

MATERIA DEL CURSO: ${row.subject_name}
TEMA DEL CURSO: ${row.topic_name}
TIPO DE FUENTE: ${sourceType}
${targetLanguage?`IDIOMA DEL CURSO: ${targetLanguage}`:""}

REGLA PRINCIPAL DE FIDELIDAD:
- La prioridad absoluta es enseñar lo que aparece en el material proporcionado.
- No atribuyas al documento información que no esté allí.
- Si agregas una explicación necesaria para comprender mejor, identifícala como explicación complementaria y no como contenido literal de la fuente.
- No inventes páginas, citas, profesores, autores, datos, diagnósticos o resultados.
- Si el material es insuficiente o ambiguo, dilo en el resumen.
${body.exam_focus!==false?"- Identifica hechos, definiciones, relaciones, pasos y conceptos que razonablemente podrían evaluarse, sin afirmar que conoces el examen real del docente.":""}
${body.deep_explanation!==false?"- Enseña para comprensión profunda: explica mecanismos, relaciones y ejemplos, no solo una lista para memorizar.":""}

OBJETIVO DE AHORRO:
Todo lo necesario para los repasos posteriores debe quedar en ESTA salida: resumen, clase, diagrama, mapa, práctica y examen. Así el estudiante no necesita regenerarlo cada vez.

Devuelve EXCLUSIVAMENTE JSON válido:
{
  "version":21,
  "title":"título claro de la clase",
  "overview":"qué cubre la fuente y por qué importa",
  "estimated_minutes":30,
  "source_digest":"resumen denso y autosuficiente de los hechos, explicaciones, definiciones y relaciones más importantes de la fuente; servirá como contexto compacto para preguntas futuras",
  "objectives":["5 a 7 objetivos"],
  "sections":[
    {
      "title":"subtema",
      "content":"explicación clara en varios párrafos, fiel a la fuente",
      "key_points":["3 a 5 puntos"],
      "example":"ejemplo o aplicación cuando sea útil"
    }
  ],
  "key_terms":["8 a 18 conceptos"],
  "exam_focus":["5 a 10 elementos de alto rendimiento para repasar"],
  "diagram":{
    "title":"título",
    "caption":"qué representa",
    "steps":[{"label":"bloque o paso","detail":"explicación breve"}]
  },
  "concept_map":{
    "center":"concepto central",
    "branches":[{"label":"rama","children":["idea","idea"]}]
  },
  "summary":{
    "overview":"síntesis final",
    "must_remember":["6 a 10 ideas"],
    "common_errors":["3 a 6 confusiones o errores"],
    "connection":"cómo se conecta con el tema del curso"
  },
  "practice":[
    {"question":"pregunta","context":"","options":["A","B","C","D"],"correctIndex":0,"explanation":"explicación"}
  ],
  "exam":[
    {"stem":"pregunta","options":["A","B","C","D"],"correctIndex":0,"explanation":"explicación"}
  ],
  "video_searches":[
    {"query":"búsqueda precisa para YouTube","channel_hint":"tipo de canal o canal educativo si procede","why":"qué debería reforzar"}
  ]
}

REQUISITOS:
- 4 a 7 sections.
- 8 preguntas EXACTAS en practice.
- 10 preguntas EXACTAS en exam.
- Todas las preguntas deben poder responderse estudiando esta clase/fuente.
- 4 a 8 pasos en diagram.
- 4 a 7 ramas en concept_map.
- 3 a 5 video_searches. Son consultas de búsqueda, no inventes URLs de videos.
- Para Medicina: conserva precisión anatómica/fisiológica/clínica y distingue educación de atención a pacientes.
- Para Matemática/Física: incluye relaciones, procedimiento, símbolos/unidades y ejemplos cuando estén en la fuente.
- Para Idiomas: conserva el idioma objetivo, traducción/gramática/pronunciación que aparezcan en la fuente.
- No uses Markdown fuera de los strings JSON.`;
}

function sanitizeUniversityStudyPack(parsed,row,body){
  const sections=Array.isArray(parsed?.sections)?parsed.sections.slice(0,7).map(s=>({
    title:cleanText(s.title,260),
    content:cleanText(s.content,7000),
    key_points:Array.isArray(s.key_points)?s.key_points.slice(0,6).map(x=>cleanText(x,600)).filter(Boolean):[],
    example:cleanText(s.example,2500)
  })).filter(s=>s.title&&s.content):[];
  const practice=Array.isArray(parsed?.practice)?parsed.practice.slice(0,8).map(q=>({
    question:cleanText(q.question||q.stem,1200),
    context:cleanText(q.context,1200),
    options:Array.isArray(q.options)?q.options.slice(0,4).map(x=>cleanText(x,700)):[],
    correctIndex:clamp(Number(q.correctIndex),0,3),
    explanation:cleanText(q.explanation,1800)
  })).filter(q=>q.question&&q.options.length===4):[];
  const exam=Array.isArray(parsed?.exam)?parsed.exam.slice(0,10).map(q=>({
    stem:cleanText(q.stem||q.question,1200),
    options:Array.isArray(q.options)?q.options.slice(0,4).map(x=>cleanText(x,700)):[],
    correctIndex:clamp(Number(q.correctIndex),0,3),
    explanation:cleanText(q.explanation,1800)
  })).filter(q=>q.stem&&q.options.length===4):[];
  if(sections.length<3||practice.length<6||exam.length<10)return null;

  const diagramSteps=Array.isArray(parsed?.diagram?.steps)?parsed.diagram.steps.slice(0,8).map(x=>({
    label:cleanText(x.label,300),detail:cleanText(x.detail,1000)
  })).filter(x=>x.label):[];
  const mapBranches=Array.isArray(parsed?.concept_map?.branches)?parsed.concept_map.branches.slice(0,7).map(x=>({
    label:cleanText(x.label,300),
    children:Array.isArray(x.children)?x.children.slice(0,4).map(y=>cleanText(y,500)).filter(Boolean):[]
  })).filter(x=>x.label):[];

  return {
    version:21,
    university_source:true,
    title:cleanText(parsed.title,320)||body.source_name||row.topic_name,
    overview:cleanText(parsed.overview,2000),
    estimated_minutes:clamp(Number(parsed.estimated_minutes||30),10,180),
    source_digest:cleanText(parsed.source_digest,18000),
    objectives:Array.isArray(parsed.objectives)?parsed.objectives.slice(0,8).map(x=>cleanText(x,700)).filter(Boolean):[],
    sections,
    key_terms:Array.isArray(parsed.key_terms)?parsed.key_terms.slice(0,20).map(x=>cleanText(x,300)).filter(Boolean):[],
    exam_focus:Array.isArray(parsed.exam_focus)?parsed.exam_focus.slice(0,12).map(x=>cleanText(x,700)).filter(Boolean):[],
    diagram:{
      title:cleanText(parsed?.diagram?.title,300)||`Diagrama de ${row.topic_name}`,
      caption:cleanText(parsed?.diagram?.caption,900),
      steps:diagramSteps.length?diagramSteps:sections.slice(0,6).map(s=>({label:s.title,detail:s.key_points.slice(0,2).join(" · ")}))
    },
    concept_map:{
      center:cleanText(parsed?.concept_map?.center,300)||row.topic_name,
      branches:mapBranches.length?mapBranches:sections.slice(0,6).map(s=>({label:s.title,children:s.key_points.slice(0,3)}))
    },
    summary:{
      overview:cleanText(parsed?.summary?.overview,2200)||cleanText(parsed.overview,2200),
      must_remember:Array.isArray(parsed?.summary?.must_remember)?parsed.summary.must_remember.slice(0,12).map(x=>cleanText(x,700)).filter(Boolean):[],
      common_errors:Array.isArray(parsed?.summary?.common_errors)?parsed.summary.common_errors.slice(0,8).map(x=>cleanText(x,700)).filter(Boolean):[],
      connection:cleanText(parsed?.summary?.connection,1800)
    },
    practice:practice.slice(0,8),
    exam:exam.slice(0,10),
    video_searches:Array.isArray(parsed.video_searches)?parsed.video_searches.slice(0,5).map(v=>({
      query:cleanText(typeof v==="string"?v:v.query,500),
      channel_hint:cleanText(typeof v==="string"?"":v.channel_hint,250),
      why:cleanText(typeof v==="string"?"":v.why,800)
    })).filter(v=>v.query):[],
    source_reference:{
      type:cleanText(body.source_type,30),
      name:cleanText(body.source_name,300),
      mime_type:cleanText(body.mime_type,120),
      size_bytes:clamp(Number(body.size_bytes||0),0,50_000_000),
      imported_at:new Date().toISOString()
    }
  };
}

async function importUniversitySourceApi(request,env,user){
  ensureAI(env);
  const body=await readJson(request);
  const type=cleanText(body.source_type,30);
  if(!["pdf","text","video","youtube"].includes(type))return json({error:"Tipo de material no compatible."},400);
  const topicId=cleanText(body.topic_id,220),lessonId=cleanText(body.lesson_id,220),subjectId=cleanText(body.subject_id,220);
  const row=await getCourseTopicRow(env,topicId,lessonId,subjectId);
  if(!row)return json({error:"No pude relacionar este material con el tema actual."},404);

  const sourceName=cleanText(body.source_name,300)||`Material de ${row.topic_name}`;
  body.source_name=sourceName;
  const parts=[{text:universitySourcePrompt(row,body)}];

  if(type==="text"){
    const sourceText=cleanText(body.text,120000);
    if(sourceText.length<80)return json({error:"El texto es demasiado corto para preparar una clase."},400);
    parts.push({text:`\\n\\n===== MATERIAL DEL ESTUDIANTE =====\\n${sourceText}\\n===== FIN DEL MATERIAL =====`});
  }else if(type==="youtube"){
    const url=cleanText(body.url,1200);
    if(!/^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//i.test(url))return json({error:"El enlace de YouTube no parece válido."},400);
    parts.push({fileData:{fileUri:url,mimeType:"video/*"}});
  }else{
    const data=String(body.data_base64||"").trim();
    if(!data)return json({error:"No llegaron los datos del archivo."},400);
    if(data.length>14_500_000)return json({error:"El archivo es demasiado grande para esta importación directa. Usa una transcripción, divide el PDF o utiliza un enlace público de YouTube para videos largos."},413);
    const mime=cleanText(body.mime_type,120)||(type==="pdf"?"application/pdf":"video/mp4");
    if(type==="pdf"&&!mime.includes("pdf"))return json({error:"El archivo seleccionado no parece ser PDF."},400);
    if(type==="video"&&!mime.startsWith("video/"))return json({error:"El archivo seleccionado no parece ser video."},400);
    parts.push({inlineData:{mimeType:mime,data}});
  }

  let response,parsed,lastErr;
  try{
    response=await env.AI.run(
      PREMIUM_FLASH_MODEL,
      {
        contents:[{role:"user",parts}],
        generationConfig:{
          temperature:0.16,
          maxOutputTokens:5000,
          responseMimeType:"application/json"
        }
      },
      gatewayOptions("university_source_import",{
        subject:row.subject_code,
        source_type:type,
        topic:row.topic_name
      })
    );
    parsed=parseJsonLoose(extractCloudflareText(response));
  }catch(err){lastErr=err}

  const pack=sanitizeUniversityStudyPack(parsed,row,body);
  if(!pack){
    if(lastErr)return json({error:workersAIUserMessage(lastErr)},503);
    return json({error:"La IA leyó el material, pero no logró construir una clase completa. Intenta de nuevo o divide el material en una unidad más pequeña."},502);
  }

  // Keep only a small literal excerpt for pasted text. Binary originals are intentionally
  // not stored in D1; the reusable study pack is the persistent artifact.
  if(type==="text"){
    pack.source_reference.text_excerpt=cleanText(body.text,7000);
  }

  const id=crypto.randomUUID(),now=new Date().toISOString();
  const detail=type==="youtube"?"Video público analizado":type==="video"?"Video corto analizado":type==="pdf"?"PDF analizado":"Texto/apuntes analizados";
  const metadata={
    university_source:true,
    version:21,
    source_type:type,
    source_name:sourceName,
    source_detail:detail,
    source_size:Number(body.size_bytes||0),
    lesson_id:row.lesson_id,
    topic_name:row.topic_name,
    subject_name:row.subject_name,
    imported_once:true
  };
  await env.DB.prepare(`
    INSERT INTO notes
    (id,user_id,subject_id,topic_id,title,body,tags_json,pinned,metadata_json,sync_version,created_at,updated_at)
    VALUES (?,?,?,?,?,?,?,0,?,1,?,?)
  `).bind(
    id,user.id,row.subject_id,row.topic_id,
    `UNI · ${row.topic_name} · ${sourceName}`,
    JSON.stringify(pack),
    JSON.stringify(["university_source","study_pack","v21"]),
    JSON.stringify(metadata),
    now,now
  ).run();

  return json({ok:true,id,title:pack.title,model:PREMIUM_FLASH_MODEL},201);
}

async function universitySourceChat(request,env,user){
  const body=await readJson(request);
  const sourceId=cleanText(body.source_id,220),question=cleanText(body.question,5000);
  if(!sourceId||!question)return json({error:"Falta el material o la pregunta."},400);
  const row=await env.DB.prepare(`
    SELECT title,body,metadata_json FROM notes
    WHERE id=? AND user_id=? AND tags_json LIKE '%university_source%' LIMIT 1
  `).bind(sourceId,user.id).first();
  if(!row)return json({error:"No encontré esa clase guardada."},404);
  const pack=parseJsonLoose(row.body);
  if(!pack)return json({error:"No pude leer el material guardado."},500);

  const compact=[
    `TÍTULO: ${pack.title||row.title}`,
    `RESUMEN DE FUENTE: ${pack.source_digest||pack.summary?.overview||pack.overview||""}`,
    `CONCEPTOS: ${(pack.key_terms||[]).join(", ")}`,
    `PUNTOS CLAVE: ${(pack.summary?.must_remember||[]).join(" | ")}`
  ].join("\\n");

  const response=await callCloudflareAI(env,{
    model:PREMIUM_FLASH_MODEL,
    task:"university_source_question",
    messages:[
      {role:"system",content:"Eres un tutor universitario. Responde primero y principalmente con el material guardado que se te proporciona. Si necesitas agregar conocimiento general para aclarar, sepáralo explícitamente como explicación complementaria. No inventes que algo aparece en la fuente si no está en el contexto."},
      {role:"user",content:`CLASE GUARDADA:\\n${compact}\\n\\nPREGUNTA DEL ESTUDIANTE:\\n${question}`}
    ],
    max_tokens:1600,
    temperature:0.22
  });
  return json({answer:extractCloudflareText(response),model:response.__model||PREMIUM_FLASH_MODEL});
}

async function aiCourseMaterialPack(request,env,user){
  const body=await readJson(request);
  const topicId=cleanText(body.topic_id,220),lessonId=cleanText(body.lesson_id,220),subjectId=cleanText(body.subject_id,220);
  if(!topicId||!lessonId||!subjectId)return json({error:"Faltan datos de la lección."},400);
  const row=await env.DB.prepare(`SELECT t.id AS topic_id,t.name AS topic_name,t.description,t.subject_id,l.id AS lesson_id,l.summary,l.learning_objectives_json,l.difficulty,s.name AS subject_name,s.code AS subject_code FROM topics t JOIN lessons l ON l.topic_id=t.id JOIN subjects s ON s.id=t.subject_id WHERE t.id=? AND l.id=? AND s.id=? AND t.active=1 AND l.active=1`).bind(topicId,lessonId,subjectId).first();
  if(!row)return json({error:"No pude encontrar esta lección."},404);
  const language=normalizeCourseLanguage(body.language||"en-US");
  const languageNames={"he-IL":"Hebreo","la":"Latín","en-US":"Inglés","ru-RU":"Ruso","fr-FR":"Francés"};
  const languageName=row.subject_code==="LANG"?languageNames[language]:null;
  const materialTitle=`Material V19: ${row.topic_name}`;

  // First reuse anything already generated. This does NOT consume Workers AI.
  const existing=await env.DB.prepare("SELECT id,title,body,updated_at FROM notes WHERE user_id=? AND topic_id=? AND title=? ORDER BY datetime(updated_at) DESC LIMIT 1")
    .bind(user.id,row.topic_id,materialTitle).first();
  if(existing?.body){
    const parsed=parseJsonLoose(existing.body);
    const upgraded=upgradeCourseMaterialV19(parsed,row);
    if(upgraded){
      if(parsed?.version!==19){
        const saved=await saveCourseMaterialV19(env,user,row,languageName,materialTitle,upgraded,existing.id);
        return json({material:upgraded,cached:true,migrated:true,updated_at:saved.updated_at});
      }
      return json({material:upgraded,cached:true,updated_at:existing.updated_at});
    }
  }

  // V18 material is valuable and should be migrated instead of regenerated.
  const legacyTitle=`Material V18: ${row.topic_name}`;
  const legacy=await env.DB.prepare("SELECT id,title,body,updated_at FROM notes WHERE user_id=? AND topic_id=? AND title=? ORDER BY datetime(updated_at) DESC LIMIT 1")
    .bind(user.id,row.topic_id,legacyTitle).first();
  if(legacy?.body){
    const oldParsed=parseJsonLoose(legacy.body);
    const upgraded=upgradeCourseMaterialV19(oldParsed,row);
    if(upgraded){
      const saved=await saveCourseMaterialV19(env,user,row,languageName,materialTitle,upgraded,null);
      return json({material:upgraded,cached:true,migrated:true,updated_at:saved.updated_at});
    }
  }

  ensureAI(env);
  const seedObjectives=parseJsonLoose(row.learning_objectives_json)||[];
  const profile=courseTeachingProfile(row.subject_code,languageName);
  const prompt=`Crea el material completo de UNA sesión de estudio para una plataforma educativa universitaria.
MATERIA: ${row.subject_name}
TEMA: ${row.topic_name}
DIFICULTAD: ${Number(row.difficulty||4)}/10
${languageName?`IDIOMA OBJETIVO: ${languageName}`:""}
DESCRIPCIÓN BASE: ${row.description||row.summary||""}
OBJETIVOS BASE: ${Array.isArray(seedObjectives)?seedObjectives.join("; "):""}

ENFOQUE PEDAGÓGICO: ${profile}

La sesión debe poder estudiarse como un capítulo corto antes de hacer ejercicios. Debe cubrir los subtemas esenciales del tema, de lo más sencillo a lo más complejo, sin convertirse en una enciclopedia ni omitir fundamentos necesarios.

Devuelve EXCLUSIVAMENTE JSON válido con esta forma:
{
 "version":19,
 "title":"título de la clase",
 "overview":"introducción de 2 a 4 oraciones que explique por qué importa el tema",
 "estimated_minutes":35,
 "objectives":["5 a 7 objetivos concretos"],
 "sections":[
   {"title":"subtema","content":"explicación clara y completa en varios párrafos separados por saltos de línea","key_points":["3 a 5 ideas"],"example":"ejemplo trabajado o aplicado","application":"cómo se usa o por qué importa"}
 ],
 "key_terms":["8 a 15 conceptos clave"],
 "diagram":{
   "title":"título del diagrama",
   "caption":"qué representa",
   "steps":[{"label":"bloque o paso","detail":"explicación corta del bloque"}]
 },
 "concept_map":{
   "center":"concepto central",
   "branches":[{"label":"rama principal","children":["idea relacionada","idea relacionada"]}]
 },
 "practice":[
   {"type":"choice|true_false","question":"ejercicio","context":"dato o escenario opcional","options":["A","B","C","D"],"correctIndex":0,"explanation":"explicación educativa de la respuesta"}
 ],
 "summary":{"overview":"síntesis final","must_remember":["6 a 10 ideas indispensables"],"common_errors":["3 a 6 errores o confusiones frecuentes"],"connection":"cómo conecta con el siguiente nivel o con otros temas"}
}

REGLAS ESTRICTAS:
- 5 a 7 sections, ordenadas pedagógicamente.
- Cada section debe enseñar de verdad: definición, mecanismo o razonamiento y ejemplo/aplicación cuando corresponda.
- diagram debe tener entre 4 y 8 steps y representar un proceso, método, jerarquía o secuencia útil para ESTE tema; no debe ser decorativo.
- concept_map debe tener entre 4 y 7 branches y cada rama entre 2 y 4 children. Debe conectar los conceptos más importantes de la clase.
- Adapta los recursos visuales a la materia: mecanismos y rutas en Medicina; procedimientos y relaciones en Matemática; modelos, fuerzas o transformaciones en Física; escalas/procesos en Astronomía; patrones, estructura de frase o gramática en Idiomas.
- EXACTAMENTE 8 ejercicios de práctica.
- Todos los ejercicios deben poder autocorregirse. Usa 4 opciones en todos; para verdadero/falso usa ["Verdadero","Falso","No se puede determinar","Depende del contexto"] si hace falta.
- correctIndex debe ser 0,1,2 o 3 y apuntar a la opción correcta.
- No incluyas preguntas del examen final dentro del texto.
- No inventes referencias bibliográficas ni datos dudosos.
- En Matemática/Física incluye fórmulas en texto legible y al menos un ejemplo resuelto paso a paso.
- En Idiomas adapta ejemplos y explicación al idioma ${languageName||"seleccionado"}; si es Hebreo usa escritura hebrea, si es Ruso cirílico, si es Latín latín correcto.
- En Medicina conserva propósito educativo y no sustituye valoración profesional.
- Escribe en español salvo ejemplos necesarios del idioma objetivo.
- Sin markdown fuera de los valores JSON.`;

  async function run(model,temp,jsonMode=false){
    const response=await callCloudflareAI(env,{
      model,
      fallback:false,
      task:"course_material",
      messages:[
        {role:"system",content:"Eres un profesor universitario y diseñador instruccional. Creas clases autocontenidas, progresivas, correctas y orientadas a comprensión profunda y práctica activa. Devuelve solo JSON válido."},
        {role:"user",content:prompt}
      ],
      max_tokens:model===PREMIUM_PRO_MODEL?4096:3600,
      temperature:temp,
      response_format:jsonMode?{type:"json_object"}:undefined
    });
    return parseJsonLoose(extractCloudflareText(response));
  }
  let parsed=null,lastAIError=null;
  try{parsed=await run(PREMIUM_PRO_MODEL,.18,true)}catch(err){lastAIError=err}
  if(!parsed?.sections?.length||!parsed?.practice?.length){
    try{parsed=await run(PREMIUM_FLASH_MODEL,.16,true)}catch(err){lastAIError=err}
  }
  if(!parsed?.sections?.length||!parsed?.practice?.length){
    try{parsed=await run(WORKERS_TEXT_MODEL,.16,false)}catch(err){lastAIError=err}
  }
  if(!parsed?.sections?.length||parsed.sections.length<3||!Array.isArray(parsed.practice)||parsed.practice.length<6){
    if(lastAIError)return json({error:workersAIUserMessage(lastAIError)},classifyWorkersAIError(lastAIError)==="quota"?429:503);
    return json({error:"La IA no logró estructurar una clase completa. Intenta nuevamente."},502);
  }

  const material={
    version:19,
    title:cleanText(parsed.title,260)||row.topic_name,
    overview:cleanText(parsed.overview,1600)||cleanText(row.summary||row.description,1600),
    estimated_minutes:clamp(Number(parsed.estimated_minutes||40),20,90),
    objectives:Array.isArray(parsed.objectives)?parsed.objectives.slice(0,7).map(x=>cleanText(x,500)).filter(Boolean):[],
    sections:parsed.sections.slice(0,7).map(sec=>({
      title:cleanText(sec.title,260),content:cleanText(sec.content,2300),
      key_points:Array.isArray(sec.key_points)?sec.key_points.slice(0,5).map(x=>cleanText(x,450)).filter(Boolean):[],
      example:cleanText(sec.example,1600),application:cleanText(sec.application,1200)
    })).filter(x=>x.title&&x.content),
    key_terms:Array.isArray(parsed.key_terms)?parsed.key_terms.slice(0,15).map(x=>cleanText(x,220)).filter(Boolean):[],
    diagram:{
      title:cleanText(parsed.diagram?.title,260)||`Diagrama de ${row.topic_name}`,
      caption:cleanText(parsed.diagram?.caption,700)||"Secuencia visual de los conceptos centrales.",
      steps:Array.isArray(parsed.diagram?.steps)?parsed.diagram.steps.slice(0,8).map(x=>({
        label:cleanText(x.label,260),
        detail:cleanText(x.detail,900)
      })).filter(x=>x.label):[]
    },
    concept_map:{
      center:cleanText(parsed.concept_map?.center,260)||row.topic_name,
      branches:Array.isArray(parsed.concept_map?.branches)?parsed.concept_map.branches.slice(0,7).map(x=>({
        label:cleanText(x.label,260),
        children:Array.isArray(x.children)?x.children.slice(0,4).map(y=>cleanText(y,350)).filter(Boolean):[]
      })).filter(x=>x.label):[]
    },
    practice:parsed.practice.slice(0,8).map(q=>({
      type:String(q.type||"choice")==="true_false"?"true_false":"choice",
      question:cleanText(q.question,900),context:cleanText(q.context,900),
      options:Array.isArray(q.options)?q.options.slice(0,4).map(x=>cleanText(x,600)):[],
      correctIndex:clamp(Math.round(Number(q.correctIndex||0)),0,3),explanation:cleanText(q.explanation,1200)
    })).filter(q=>q.question&&q.options.length===4),
    summary:{
      overview:cleanText(parsed.summary?.overview,1600),
      must_remember:Array.isArray(parsed.summary?.must_remember)?parsed.summary.must_remember.slice(0,10).map(x=>cleanText(x,500)).filter(Boolean):[],
      common_errors:Array.isArray(parsed.summary?.common_errors)?parsed.summary.common_errors.slice(0,6).map(x=>cleanText(x,500)).filter(Boolean):[],
      connection:cleanText(parsed.summary?.connection,1000)
    }
  };
  if(material.sections.length<3||material.practice.length<6)return json({error:"El material generado quedó incompleto. Intenta nuevamente."},502);
  const saved=await saveCourseMaterialV19(env,user,row,languageName,materialTitle,material,existing?.id||null);
  return json({material,cached:false,updated_at:saved.updated_at});
}

async function putLessonProgress(request, env, user){
  const body=await readJson(request);
  if(!body.lesson_id) return json({error:"Falta lesson_id."},400);
  const row=await env.DB.prepare(`SELECT l.id,l.topic_id,l.title,t.subject_id,t.name AS topic_name,s.code AS subject_code,s.name AS subject_name FROM lessons l JOIN topics t ON t.id=l.topic_id JOIN subjects s ON s.id=t.subject_id WHERE l.id=?`).bind(body.lesson_id).first();
  if(!row) return json({error:"Lección no encontrada."},404);
  const before=await env.DB.prepare("SELECT completed,progress_percent FROM user_lesson_progress WHERE user_id=? AND lesson_id=?").bind(user.id,row.id).first();
  const progress=clamp(Number(body.progress_percent||0),0,100);
  const completed=body.completed?1:0;
  const now=new Date().toISOString();
  await env.DB.prepare(`
    INSERT INTO user_lesson_progress (id,user_id,lesson_id,progress_percent,completed,last_position_json,started_at,completed_at,last_studied_at,sync_version,created_at,updated_at)
    VALUES (?,?,?,?,?,?,?, ?,?,1,?,?)
    ON CONFLICT(user_id,lesson_id) DO UPDATE SET
      progress_percent=MAX(user_lesson_progress.progress_percent,excluded.progress_percent),
      completed=MAX(user_lesson_progress.completed,excluded.completed),
      last_position_json=excluded.last_position_json,
      started_at=COALESCE(user_lesson_progress.started_at,excluded.started_at),
      completed_at=CASE WHEN excluded.completed=1 THEN COALESCE(user_lesson_progress.completed_at,excluded.completed_at) ELSE user_lesson_progress.completed_at END,
      last_studied_at=excluded.last_studied_at,
      sync_version=user_lesson_progress.sync_version+1,
      updated_at=excluded.updated_at
  `).bind(crypto.randomUUID(),user.id,row.id,progress,completed,JSON.stringify(body.last_position||{}),before?null:now,completed?now:null,now,now,now).run();
  const current=await env.DB.prepare("SELECT progress_percent,completed FROM user_lesson_progress WHERE user_id=? AND lesson_id=?").bind(user.id,row.id).first();
  await env.DB.prepare(`
    INSERT INTO user_topic_progress (id,user_id,topic_id,mastery,lessons_completed,questions_answered,questions_correct,cases_completed,last_studied_at,next_review_at,metadata_json,sync_version,created_at,updated_at)
    VALUES (?,?,?,?,?,0,0,0,?,NULL,?,1,?,?)
    ON CONFLICT(user_id,topic_id) DO UPDATE SET mastery=excluded.mastery,lessons_completed=excluded.lessons_completed,last_studied_at=excluded.last_studied_at,metadata_json=excluded.metadata_json,sync_version=user_topic_progress.sync_version+1,updated_at=excluded.updated_at
  `).bind(crypto.randomUUID(),user.id,row.topic_id,Number(current?.progress_percent||0),Number(current?.completed||0),now,JSON.stringify({course:true,lesson_id:row.id}),now,now).run();

  const prefix=row.topic_id.replace(/_\d+$/,'');
  const agg=await env.DB.prepare(`SELECT COUNT(*) AS total,SUM(CASE WHEN COALESCE(p.completed,0)=1 THEN 1 ELSE 0 END) AS done FROM topics t JOIN lessons l ON l.topic_id=t.id LEFT JOIN user_lesson_progress p ON p.lesson_id=l.id AND p.user_id=? WHERE t.subject_id=? AND t.id LIKE ?`).bind(user.id,row.subject_id,`${prefix}_%`).first();
  const overall=Number(agg?.total||0)?Math.round(Number(agg?.done||0)/Number(agg.total)*100):0;
  await env.DB.prepare(`
    INSERT INTO study_resume_state (user_id,route,subject_id,topic_id,lesson_id,mode,progress_percent,context_json,device_id,sync_version,updated_at)
    VALUES (?,"/course",?,?,?,"course",?,?,NULL,1,?)
    ON CONFLICT(user_id) DO UPDATE SET route=excluded.route,subject_id=excluded.subject_id,topic_id=excluded.topic_id,lesson_id=excluded.lesson_id,mode=excluded.mode,progress_percent=excluded.progress_percent,context_json=excluded.context_json,sync_version=study_resume_state.sync_version+1,updated_at=excluded.updated_at
  `).bind(user.id,row.subject_id,row.topic_id,row.id,overall,JSON.stringify({subject:row.subject_name,topic:row.topic_name,course:true}),now).run();

  if(completed && Number(before?.completed||0)!==1){
    await bumpDailyMetric(env,user.id,{lessons_completed:1,xp_earned:25});
    await env.DB.prepare("UPDATE profiles SET total_xp=total_xp+25,current_medical_level=MAX(1,CAST((total_xp+25)/500 AS INTEGER)+1),updated_at=? WHERE user_id=?").bind(now,user.id).run();
  }
  return json({ok:true,progress_percent:Number(current?.progress_percent||0),completed:Number(current?.completed||0)===1,course_progress:overall});
}

async function getCourseNote(url,env,user){
  const topicId=url.searchParams.get("topic_id");
  if(!topicId) return json({note:null});
  const note=await env.DB.prepare("SELECT id,title,body,updated_at FROM notes WHERE user_id=? AND topic_id=? AND title LIKE 'Curso:%' ORDER BY datetime(updated_at) DESC LIMIT 1").bind(user.id,topicId).first();
  return json({note:note||null});
}

async function putCourseNote(request,env,user){
  const body=await readJson(request);
  if(!body.topic_id) return json({error:"Falta topic_id."},400);
  const topic=await env.DB.prepare("SELECT t.id,t.name,t.subject_id FROM topics t WHERE t.id=?").bind(body.topic_id).first();
  if(!topic) return json({error:"Tema no encontrado."},404);
  const now=new Date().toISOString();
  const existing=await env.DB.prepare("SELECT id FROM notes WHERE user_id=? AND topic_id=? AND title LIKE 'Curso:%' ORDER BY datetime(updated_at) DESC LIMIT 1").bind(user.id,topic.id).first();
  if(existing){
    await env.DB.prepare("UPDATE notes SET body=?,updated_at=?,sync_version=sync_version+1 WHERE id=? AND user_id=?").bind(cleanText(body.body,30000),now,existing.id,user.id).run();
    return json({ok:true,id:existing.id,updated_at:now});
  }
  const id=crypto.randomUUID();
  await env.DB.prepare(`INSERT INTO notes (id,user_id,subject_id,topic_id,title,body,tags_json,pinned,metadata_json,sync_version,created_at,updated_at) VALUES (?,?,?,?,?,?,?,0,?,1,?,?)`).bind(id,user.id,topic.subject_id,topic.id,`Curso: ${topic.name}`,cleanText(body.body,30000),JSON.stringify(["curso"]),JSON.stringify({course:true}),now,now).run();
  return json({ok:true,id,updated_at:now});
}

async function listTutorSessions(env,user){
  const rows=await env.DB.prepare(`
    SELECT c.id,c.title,c.subject_id,s.name AS subject_name,c.last_message_at,c.created_at,
           (SELECT COUNT(*) FROM ai_messages m WHERE m.conversation_id=c.id AND m.role IN ('user','assistant')) AS message_count
    FROM ai_conversations c
    LEFT JOIN subjects s ON s.id=c.subject_id
    WHERE c.user_id=? AND c.mode='tutor'
    ORDER BY datetime(COALESCE(c.last_message_at,c.created_at)) DESC
    LIMIT 30
  `).bind(user.id).all();
  return json({sessions:rows.results||[]});
}

async function getTutorSession(url,env,user){
  const id=url.searchParams.get("id");
  if(!id)return json({error:"Falta id de la clase."},400);
  const conversation=await env.DB.prepare(`
    SELECT c.id,c.title,c.subject_id,s.name AS subject_name,c.created_at,c.last_message_at
    FROM ai_conversations c LEFT JOIN subjects s ON s.id=c.subject_id
    WHERE c.id=? AND c.user_id=? AND c.mode='tutor'
  `).bind(id,user.id).first();
  if(!conversation)return json({error:"Clase no encontrada."},404);
  const rows=await env.DB.prepare(`
    SELECT role,content,created_at FROM ai_messages
    WHERE conversation_id=? AND user_id=? AND role IN ('user','assistant')
    ORDER BY datetime(created_at),rowid
  `).bind(id,user.id).all();
  return json({conversation,messages:rows.results||[]});
}

async function getResume(env, user) {
  const row = await env.DB.prepare(`
    SELECT r.*,s.name AS subject_name,t.name AS topic_name,l.title AS lesson_title
    FROM study_resume_state r
    LEFT JOIN subjects s ON s.id=r.subject_id
    LEFT JOIN topics t ON t.id=r.topic_id
    LEFT JOIN lessons l ON l.id=r.lesson_id
    WHERE r.user_id=?
  `).bind(user.id).first();
  return json({ resume: row });
}

async function putResume(request, env, user) {
  const body = await readJson(request);
  const now = new Date().toISOString();
  await env.DB.prepare(`
    INSERT INTO study_resume_state
    (user_id,route,subject_id,topic_id,lesson_id,mode,progress_percent,context_json,device_id,sync_version,updated_at)
    VALUES (?,?,?,?,?,?,?,?,?,1,?)
    ON CONFLICT(user_id) DO UPDATE SET
      route=excluded.route,
      subject_id=excluded.subject_id,
      topic_id=excluded.topic_id,
      lesson_id=excluded.lesson_id,
      mode=excluded.mode,
      progress_percent=excluded.progress_percent,
      context_json=excluded.context_json,
      device_id=excluded.device_id,
      sync_version=study_resume_state.sync_version+1,
      updated_at=excluded.updated_at
  `).bind(
    user.id,
    cleanText(body.route, 300) || "/",
    nullable(body.subject_id),
    nullable(body.topic_id),
    nullable(body.lesson_id),
    cleanText(body.mode, 80),
    clamp(Number(body.progress_percent || 0), 0, 100),
    JSON.stringify(body.context || {}),
    cleanText(body.device_id, 120),
    now
  ).run();
  return json({ ok: true, updated_at: now });
}

async function putTopicProgress(request, env, user) {
  const body = await readJson(request);
  if (!body.topic_id) return json({ error: "Falta topic_id." }, 400);
  const now = new Date().toISOString();
  await env.DB.prepare(`
    INSERT INTO user_topic_progress
    (id,user_id,topic_id,mastery,lessons_completed,questions_answered,questions_correct,cases_completed,last_studied_at,next_review_at,metadata_json,sync_version,created_at,updated_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,1,?,?)
    ON CONFLICT(user_id,topic_id) DO UPDATE SET
      mastery=excluded.mastery,
      lessons_completed=excluded.lessons_completed,
      questions_answered=excluded.questions_answered,
      questions_correct=excluded.questions_correct,
      cases_completed=excluded.cases_completed,
      last_studied_at=excluded.last_studied_at,
      next_review_at=excluded.next_review_at,
      metadata_json=excluded.metadata_json,
      sync_version=user_topic_progress.sync_version+1,
      updated_at=excluded.updated_at
  `).bind(
    crypto.randomUUID(), user.id, body.topic_id,
    clamp(Number(body.mastery || 0), 0, 100),
    Math.max(0, Number(body.lessons_completed || 0)),
    Math.max(0, Number(body.questions_answered || 0)),
    Math.max(0, Number(body.questions_correct || 0)),
    Math.max(0, Number(body.cases_completed || 0)),
    now,
    nullable(body.next_review_at),
    JSON.stringify(body.metadata || {}),
    now, now
  ).run();
  return json({ ok: true });
}

// -------------------- FLASHCARDS --------------------

async function listFlashcards(url, env, user) {
  const dueOnly = url.searchParams.get("due") === "1";
  const sql = dueOnly
    ? `SELECT * FROM flashcards WHERE user_id=? AND suspended=0 AND datetime(due_at)<=datetime('now') ORDER BY datetime(due_at) LIMIT 200`
    : `SELECT * FROM flashcards WHERE user_id=? ORDER BY datetime(updated_at) DESC LIMIT 300`;
  const rows = await env.DB.prepare(sql).bind(user.id).all();
  return json({ flashcards: rows.results || [] });
}

async function createFlashcard(request, env, user) {
  const body = await readJson(request);
  const front = cleanText(body.front, 3000);
  const back = cleanText(body.back, 6000);
  if (!front || !back) return json({ error: "La tarjeta necesita frente y reverso." }, 400);
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  await env.DB.prepare(`
    INSERT INTO flashcards
    (id,user_id,topic_id,source_type,front,back,hint,tags_json,ease_factor,interval_days,repetitions,lapses,due_at,suspended,metadata_json,sync_version,created_at,updated_at)
    VALUES (?,?,?,?,?,?,?,?,2.5,0,0,0,?,0,?,1,?,?)
  `).bind(
    id,user.id,nullable(body.topic_id),cleanText(body.source_type,50)||"manual",
    front,back,cleanText(body.hint,1000),JSON.stringify(body.tags||[]),
    now,JSON.stringify(body.metadata||{}),now,now
  ).run();
  return json({ ok: true, id }, 201);
}

async function deleteFlashcard(url, env, user) {
  const id = url.searchParams.get("id");
  if (!id) return json({ error: "Falta id de flashcard." }, 400);
  await env.DB.prepare("DELETE FROM flashcards WHERE id=? AND user_id=?")
    .bind(id, user.id).run();
  return json({ ok:true });
}

async function reviewFlashcard(request, env, user) {
  const body = await readJson(request);
  const grade = clamp(Math.round(Number(body.grade)), 0, 5);
  const card = await env.DB.prepare("SELECT * FROM flashcards WHERE id=? AND user_id=?")
    .bind(body.flashcard_id, user.id).first();
  if (!card) return json({ error: "Flashcard no encontrada." }, 404);

  const oldInterval = Number(card.interval_days || 0);
  const oldEase = Number(card.ease_factor || 2.5);
  let repetitions = Number(card.repetitions || 0);
  let lapses = Number(card.lapses || 0);
  let interval;
  let ease = oldEase;

  if (grade < 3) {
    repetitions = 0;
    lapses += 1;
    interval = 1;
  } else {
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 6;
    else interval = Math.max(1, Math.round(oldInterval * ease));
    repetitions += 1;
    ease = Math.max(1.3, oldEase + (0.1 - (5-grade)*(0.08 + (5-grade)*0.02)));
  }

  const now = new Date();
  const due = new Date(now.getTime() + interval * 86400000).toISOString();
  const reviewId = crypto.randomUUID();

  await env.DB.batch([
    env.DB.prepare(`
      UPDATE flashcards SET ease_factor=?,interval_days=?,repetitions=?,lapses=?,due_at=?,last_reviewed_at=?,sync_version=sync_version+1,updated_at=?
      WHERE id=? AND user_id=?
    `).bind(ease,interval,repetitions,lapses,due,now.toISOString(),now.toISOString(),card.id,user.id),
    env.DB.prepare(`
      INSERT INTO flashcard_reviews
      (id,user_id,flashcard_id,grade,response_seconds,old_interval_days,new_interval_days,old_ease_factor,new_ease_factor,reviewed_at)
      VALUES (?,?,?,?,?,?,?,?,?,?)
    `).bind(reviewId,user.id,card.id,grade,Number(body.response_seconds||0),oldInterval,interval,oldEase,ease,now.toISOString())
  ]);

  return json({ ok: true, due_at: due, interval_days: interval, ease_factor: ease });
}

// -------------------- NOTES / DEADLINES / MISTAKES --------------------


function requireLibraryR2(env){
  if(!env.LIBRARY||typeof env.LIBRARY.put!=="function"){
    throw new Error("La Biblioteca necesita un binding R2 llamado LIBRARY. Crea/vincula el bucket med-ai-dalton-library al Worker y vuelve a desplegar.");
  }
}
function parseLibraryMeta(row){
  return parseJsonLoose(row?.metadata_json)||{};
}
function librarySafeName(name,max=220){
  const cleaned=cleanText(name,max).replace(/[\\/:*?"<>|\u0000-\u001F]/g," ").replace(/\s+/g," ").trim();
  return cleaned||"Archivo";
}
async function allStudyLibraryRows(env,user){
  const rows=await env.DB.prepare(`
    SELECT id,title,tags_json,metadata_json,created_at,updated_at
    FROM notes
    WHERE user_id=? AND (tags_json LIKE '%library_file%' OR tags_json LIKE '%library_folder%')
    ORDER BY datetime(updated_at) DESC LIMIT 5000
  `).bind(user.id).all();
  return rows.results||[];
}
function libraryRowType(row){
  const tags=parseJsonLoose(row.tags_json)||[];
  return tags.includes("library_folder")?"folder":tags.includes("library_file")?"file":"";
}
function libraryChildren(rows,parentId){
  const wanted=parentId||null;
  return rows.filter(row=>{
    const meta=parseLibraryMeta(row);
    return (meta.parent_id||null)===wanted;
  });
}
function buildLibraryBreadcrumb(rows,folderId){
  const folders=new Map(rows.filter(r=>libraryRowType(r)==="folder").map(r=>[r.id,r]));
  const result=[];let id=folderId,guard=0;
  while(id&&guard++<40){
    const row=folders.get(id);if(!row)break;
    result.unshift({id:row.id,name:row.title});
    id=parseLibraryMeta(row).parent_id||null;
  }
  return result;
}
function libraryDescendantIds(rows,folderId){
  const result=new Set([folderId]);
  let changed=true,guard=0;
  while(changed&&guard++<100){
    changed=false;
    for(const row of rows){
      const meta=parseLibraryMeta(row);
      if(meta.parent_id&&result.has(meta.parent_id)&&!result.has(row.id)){
        result.add(row.id);changed=true;
      }
    }
  }
  return result;
}

async function listStudyLibrary(url,env,user){
  requireLibraryR2(env);
  const folderId=cleanText(url.searchParams.get("folder_id"),220)||null;
  const rows=await allStudyLibraryRows(env,user);
  const foldersAll=rows.filter(r=>libraryRowType(r)==="folder");
  const filesAll=rows.filter(r=>libraryRowType(r)==="file");

  let current=null;
  if(folderId){
    current=foldersAll.find(r=>r.id===folderId);
    if(!current)return json({error:"No encontré esta carpeta."},404);
  }

  const children=libraryChildren(rows,folderId);
  const folders=children.filter(r=>libraryRowType(r)==="folder").map(row=>{
    const meta=parseLibraryMeta(row);
    const childCount=libraryChildren(rows,row.id).length;
    return {...row,metadata_json:JSON.stringify({...meta,child_count:childCount})};
  }).sort((a,b)=>a.title.localeCompare(b.title,"es"));
  const files=children.filter(r=>libraryRowType(r)==="file").sort((a,b)=>a.title.localeCompare(b.title,"es"));

  const totalBytes=filesAll.reduce((sum,row)=>sum+Number(parseLibraryMeta(row).size_bytes||0),0);
  return json({
    current_folder:current?{id:current.id,name:current.title}:null,
    breadcrumb:buildLibraryBreadcrumb(rows,folderId),
    folders,files,
    total_folders:foldersAll.length,
    total_files:filesAll.length,
    total_bytes:totalBytes
  });
}

async function createStudyLibraryFolder(request,env,user){
  requireLibraryR2(env);
  const body=await readJson(request);
  const name=librarySafeName(body.name,160);
  const parentId=cleanText(body.parent_id,220)||null;
  const rows=await allStudyLibraryRows(env,user);
  if(parentId&&!rows.some(r=>r.id===parentId&&libraryRowType(r)==="folder"))return json({error:"La carpeta de destino no existe."},404);

  const duplicate=rows.some(r=>libraryRowType(r)==="folder"&&(parseLibraryMeta(r).parent_id||null)===parentId&&r.title.toLowerCase()===name.toLowerCase());
  if(duplicate)return json({error:"Ya existe una carpeta con ese nombre aquí."},409);

  const id=crypto.randomUUID(),now=new Date().toISOString();
  const meta={library_folder:true,parent_id:parentId};
  await env.DB.prepare(`
    INSERT INTO notes
    (id,user_id,subject_id,topic_id,title,body,tags_json,pinned,metadata_json,sync_version,created_at,updated_at)
    VALUES (?,?,?,?,?,?,?,0,?,1,?,?)
  `).bind(id,user.id,null,null,name,"",JSON.stringify(["library_folder"]),JSON.stringify(meta),now,now).run();
  return json({ok:true,id},201);
}

async function uploadStudyLibraryFile(request,env,user){
  requireLibraryR2(env);
  const form=await request.formData();
  const file=form.get("file");
  const parentId=cleanText(form.get("parent_id"),220)||null;
  if(!file||typeof file.arrayBuffer!=="function")return json({error:"No recibí ningún archivo."},400);
  const max=50*1024*1024;
  if(Number(file.size||0)>max)return json({error:"El archivo supera el límite de 50 MB."},413);

  const rows=await allStudyLibraryRows(env,user);
  if(parentId&&!rows.some(r=>r.id===parentId&&libraryRowType(r)==="folder"))return json({error:"La carpeta de destino no existe."},404);

  const original=librarySafeName(file.name||"Archivo",240);
  let display=original;
  const siblingNames=new Set(rows.filter(r=>libraryRowType(r)==="file"&&(parseLibraryMeta(r).parent_id||null)===parentId).map(r=>r.title.toLowerCase()));
  if(siblingNames.has(display.toLowerCase())){
    const dot=display.lastIndexOf(".");
    const base=dot>0?display.slice(0,dot):display,ext=dot>0?display.slice(dot):"";
    let n=2;while(siblingNames.has(`${base} (${n})${ext}`.toLowerCase()))n++;
    display=`${base} (${n})${ext}`;
  }

  const id=crypto.randomUUID(),now=new Date().toISOString();
  const safeKeyName=original.replace(/\s+/g,"_").replace(/[^a-zA-Z0-9._-]/g,"_").slice(-180);
  const r2Key=`${user.id}/${id}/${safeKeyName||"file"}`;
  const buffer=await file.arrayBuffer();

  await env.LIBRARY.put(r2Key,buffer,{
    httpMetadata:{contentType:file.type||"application/octet-stream"},
    customMetadata:{user_id:user.id,note_id:id,original_name:original}
  });

  const meta={
    library_file:true,parent_id:parentId,r2_key:r2Key,
    original_name:original,mime_type:file.type||"application/octet-stream",
    size_bytes:Number(file.size||buffer.byteLength||0)
  };
  try{
    await env.DB.prepare(`
      INSERT INTO notes
      (id,user_id,subject_id,topic_id,title,body,tags_json,pinned,metadata_json,sync_version,created_at,updated_at)
      VALUES (?,?,?,?,?,?,?,0,?,1,?,?)
    `).bind(id,user.id,null,null,display,"",JSON.stringify(["library_file"]),JSON.stringify(meta),now,now).run();
  }catch(err){
    await env.LIBRARY.delete(r2Key).catch(()=>{});
    throw err;
  }
  return json({ok:true,id,title:display},201);
}

async function getStudyLibraryFile(url,env,user){
  requireLibraryR2(env);
  const id=cleanText(url.searchParams.get("id"),220);
  const inline=url.searchParams.get("inline")==="1";
  if(!id)return json({error:"Falta id."},400);
  const row=await env.DB.prepare(`
    SELECT id,title,metadata_json FROM notes
    WHERE id=? AND user_id=? AND tags_json LIKE '%library_file%' LIMIT 1
  `).bind(id,user.id).first();
  if(!row)return json({error:"No encontré este archivo."},404);
  const meta=parseLibraryMeta(row);
  if(!meta.r2_key)return json({error:"El archivo no tiene una referencia de almacenamiento válida."},500);
  const object=await env.LIBRARY.get(meta.r2_key);
  if(!object)return json({error:"El archivo ya no está disponible en R2."},404);

  const headers=new Headers();
  object.writeHttpMetadata(headers);
  headers.set("content-type",meta.mime_type||headers.get("content-type")||"application/octet-stream");
  const disposition=inline?"inline":"attachment";
  const ascii=librarySafeName(meta.original_name||row.title,220).replace(/[^\x20-\x7E]/g,"_");
  headers.set("content-disposition",`${disposition}; filename="${ascii.replace(/"/g,"_")}"`);
  headers.set("cache-control","private, no-store");
  headers.set("x-content-type-options","nosniff");
  if(object.httpEtag)headers.set("etag",object.httpEtag);
  return new Response(object.body,{headers});
}

async function updateStudyLibraryItem(request,env,user){
  requireLibraryR2(env);
  const body=await readJson(request);
  const id=cleanText(body.id,220),type=cleanText(body.type,20),name=librarySafeName(body.name,240);
  if(!id||!["file","folder"].includes(type))return json({error:"Datos incompletos."},400);
  const row=await env.DB.prepare("SELECT id,title,tags_json,metadata_json FROM notes WHERE id=? AND user_id=? LIMIT 1").bind(id,user.id).first();
  if(!row||libraryRowType(row)!==type)return json({error:"No encontré ese elemento."},404);
  await env.DB.prepare("UPDATE notes SET title=?,updated_at=?,sync_version=sync_version+1 WHERE id=? AND user_id=?")
    .bind(name,new Date().toISOString(),id,user.id).run();
  return json({ok:true});
}

async function deleteStudyLibraryItemApi(url,env,user){
  requireLibraryR2(env);
  const id=cleanText(url.searchParams.get("id"),220),type=cleanText(url.searchParams.get("type"),20);
  if(!id||!["file","folder"].includes(type))return json({error:"Datos incompletos."},400);
  const rows=await allStudyLibraryRows(env,user);
  const row=rows.find(r=>r.id===id&&libraryRowType(r)===type);
  if(!row)return json({error:"No encontré ese elemento."},404);

  let targets;
  if(type==="folder"){
    const ids=libraryDescendantIds(rows,id);
    targets=rows.filter(r=>ids.has(r.id));
  }else targets=[row];

  const r2Keys=targets.filter(r=>libraryRowType(r)==="file").map(r=>parseLibraryMeta(r).r2_key).filter(Boolean);
  if(r2Keys.length){
    // R2 supports batch delete; keep chunks conservative.
    for(let i=0;i<r2Keys.length;i+=1000){
      await env.LIBRARY.delete(r2Keys.slice(i,i+1000));
    }
  }
  const ids=targets.map(r=>r.id);
  for(let i=0;i<ids.length;i+=100){
    const chunk=ids.slice(i,i+100);
    const qs=chunk.map(()=>"?").join(",");
    await env.DB.prepare(`DELETE FROM notes WHERE user_id=? AND id IN (${qs})`).bind(user.id,...chunk).run();
  }
  return json({ok:true,deleted:targets.length});
}

async function listNotes(env, user) {
  const rows = await env.DB.prepare(`
    SELECT * FROM notes WHERE user_id=? ORDER BY pinned DESC, datetime(updated_at) DESC LIMIT 300
  `).bind(user.id).all();
  return json({ notes: rows.results || [] });
}

async function createNote(request, env, user) {
  const body = await readJson(request);
  const title = cleanText(body.title, 300);
  if (!title) return json({ error: "Escribe un título." }, 400);
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  await env.DB.prepare(`
    INSERT INTO notes
    (id,user_id,subject_id,topic_id,title,body,tags_json,pinned,metadata_json,sync_version,created_at,updated_at)
    VALUES (?,?,?,?,?,?,?,?,?,1,?,?)
  `).bind(
    id,user.id,nullable(body.subject_id),nullable(body.topic_id),title,
    cleanText(body.body,30000),JSON.stringify(body.tags||[]),body.pinned?1:0,
    JSON.stringify(body.metadata||{}),now,now
  ).run();
  return json({ ok: true, id }, 201);
}

async function deleteNote(url, env, user) {
  const id = url.searchParams.get("id");
  if (!id) return json({ error: "Falta id." }, 400);
  await env.DB.prepare("DELETE FROM notes WHERE id=? AND user_id=?").bind(id,user.id).run();
  return json({ ok: true });
}

async function listDeadlines(env, user) {
  const rows = await env.DB.prepare(`
    SELECT d.*,s.name AS subject_name
    FROM academic_deadlines d LEFT JOIN subjects s ON s.id=d.subject_id
    WHERE d.user_id=? ORDER BY completed ASC, datetime(due_at) ASC LIMIT 200
  `).bind(user.id).all();
  return json({ deadlines: rows.results || [] });
}

async function createDeadline(request, env, user) {
  const body = await readJson(request);
  if (!body.title || !body.due_at) return json({ error: "Título y fecha son obligatorios." }, 400);
  const id=crypto.randomUUID(), now=new Date().toISOString();
  await env.DB.prepare(`
    INSERT INTO academic_deadlines
    (id,user_id,title,deadline_type,subject_id,due_at,importance,notes,completed,created_at,updated_at)
    VALUES (?,?,?,?,?,?,?,?,0,?,?)
  `).bind(
    id,user.id,cleanText(body.title,300),cleanText(body.deadline_type,50)||"exam",
    nullable(body.subject_id),body.due_at,clamp(Number(body.importance||3),1,5),
    cleanText(body.notes,3000),now,now
  ).run();
  return json({ok:true,id},201);
}

async function listMistakes(env, user) {
  const rows = await env.DB.prepare(`
    SELECT m.*,t.name AS topic_name
    FROM mistakes m LEFT JOIN topics t ON t.id=m.topic_id
    WHERE m.user_id=? ORDER BY resolved ASC, datetime(m.updated_at) DESC LIMIT 300
  `).bind(user.id).all();
  return json({ mistakes: rows.results || [] });
}

// -------------------- STATS / SEARCH / EXAMS --------------------

async function stats(env, user) {
  const [daily, mastery, totals] = await Promise.all([
    env.DB.prepare(`
      SELECT metric_date,study_seconds,questions_answered,questions_correct,flashcards_reviewed,cases_completed,lessons_completed,xp_earned
      FROM daily_metrics WHERE user_id=? ORDER BY metric_date DESC LIMIT 30
    `).bind(user.id).all(),
    env.DB.prepare(`
      SELECT p.mastery,p.questions_answered,p.questions_correct,t.name AS topic_name,s.name AS subject_name
      FROM user_topic_progress p JOIN topics t ON t.id=p.topic_id JOIN subjects s ON s.id=t.subject_id
      WHERE p.user_id=? ORDER BY p.mastery ASC LIMIT 30
    `).bind(user.id).all(),
    env.DB.prepare(`
      SELECT
      (SELECT COUNT(*) FROM question_attempts WHERE user_id=?) questions,
      (SELECT COUNT(*) FROM case_sessions WHERE user_id=? AND status='completed') cases,
      (SELECT COUNT(*) FROM flashcard_reviews WHERE user_id=?) reviews,
      (SELECT COUNT(*) FROM study_sessions WHERE user_id=?) sessions
    `).bind(user.id,user.id,user.id,user.id).first()
  ]);
  return json({ daily: daily.results||[], mastery: mastery.results||[], totals });
}

async function search(url, env, user) {
  const q = cleanText(url.searchParams.get("q"), 100);
  if (!q) return json({ results: [] });
  const like = `%${q}%`;
  const [topicsRows, lessonRows, noteRows] = await Promise.all([
    env.DB.prepare(`
      SELECT 'topic' AS type,t.id,t.name AS title,s.name AS subtitle
      FROM topics t JOIN subjects s ON s.id=t.subject_id
      WHERE t.active=1 AND (t.name LIKE ? OR t.description LIKE ?) LIMIT 20
    `).bind(like,like).all(),
    env.DB.prepare(`
      SELECT 'lesson' AS type,l.id,l.title,t.name AS subtitle
      FROM lessons l JOIN topics t ON t.id=l.topic_id
      WHERE l.active=1 AND (l.title LIKE ? OR l.summary LIKE ?) LIMIT 20
    `).bind(like,like).all(),
    env.DB.prepare(`
      SELECT 'note' AS type,id,title,'Mis apuntes' AS subtitle
      FROM notes WHERE user_id=? AND (title LIKE ? OR body LIKE ?) LIMIT 20
    `).bind(user.id,like,like).all()
  ]);
  return json({ results: [...(topicsRows.results||[]),...(lessonRows.results||[]),...(noteRows.results||[])] });
}

async function recordExam(request, env, user) {
  const body = await readJson(request);
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const pct = clamp(Number(body.percentage || 0),0,100);
  const questions = Array.isArray(body.questions) ? body.questions.slice(0, 100) : [];
  const answers = body.answers && typeof body.answers === "object" ? body.answers : {};

  const statements = [
    env.DB.prepare(`
      INSERT INTO exams
      (id,user_id,title,exam_type,status,settings_json,started_at,finished_at,score,max_score,percentage,ai_summary,created_at,updated_at)
      VALUES (?,?,?,'ai_practice','completed',?,?,?,?,?,?,?, ?,?)
    `).bind(
      id,user.id,cleanText(body.title,300)||"Examen IA",JSON.stringify(body.settings||{}),
      body.started_at||now,now,Number(body.score||0),Number(body.max_score||0),pct,
      cleanText(body.ai_summary,3000),now,now
    )
  ];

  for (let i=0;i<questions.length;i++) {
    const q=questions[i]||{};
    const chosen=Number(answers[`q${i}`]);
    const correct=Number(q.correctIndex);
    const answered=Number.isFinite(chosen);
    const isCorrect=answered && chosen===correct;
    const attemptId=crypto.randomUUID();
    const snapshot={stem:q.stem||"",options:Array.isArray(q.options)?q.options:[],correctIndex:correct,explanation:q.explanation||""};
    statements.push(env.DB.prepare(`
      INSERT INTO question_attempts
      (id,user_id,question_id,topic_id,source_type,question_snapshot_json,user_answer_json,is_correct,score,answered_at,metadata_json)
      VALUES (?,?,NULL,NULL,'ai_exam',?,?,?,?,?,'{}')
    `).bind(
      attemptId,user.id,JSON.stringify(snapshot),JSON.stringify({chosenIndex:answered?chosen:null}),isCorrect?1:0,isCorrect?1:0,now
    ));

    if (!isCorrect) {
      const correctText=Array.isArray(q.options) && q.options[correct]!==undefined ? String(q.options[correct]) : String(correct);
      const userText=answered && Array.isArray(q.options) && q.options[chosen]!==undefined ? String(q.options[chosen]) : "Sin respuesta";
      statements.push(env.DB.prepare(`
        INSERT INTO mistakes
        (id,user_id,topic_id,question_attempt_id,source_type,source_ref,prompt,user_answer,correct_answer,explanation,error_category,mastery_score,times_failed,times_correct_after,next_review_at,resolved,metadata_json,sync_version,created_at,updated_at)
        VALUES (?,?,NULL,?,'ai_exam',?,?,?,?,?,'pregunta_examen',0,1,0,?,0,?,1,?,?)
      `).bind(
        crypto.randomUUID(),user.id,attemptId,id,cleanText(q.stem,4000),userText,correctText,
        cleanText(q.explanation,5000),new Date(Date.now()+86400000).toISOString(),
        JSON.stringify({exam_id:id,question_index:i}),now,now
      ));
    }
  }

  await env.DB.batch(statements);

  await bumpDailyMetric(env,user.id,{
    questions_answered:Number(body.max_score||0),
    questions_correct:Number(body.score||0),
    xp_earned:Math.round(Number(body.score||0)*2)
  });
  return json({ok:true,id});
}

// -------------------- CLOUDFLARE WORKERS AI --------------------

const AI_GATEWAY_ID = "med-ai-dalton";

// Premium models through AI Gateway Unified Billing.
const PREMIUM_PRO_MODEL = "google/gemini-2.5-pro";
const PREMIUM_FLASH_MODEL = "google/gemini-2.5-flash";

// Workers AI remains as automatic backup. These requests also pass through
// the same AI Gateway so prepaid credits can cover them when necessary.
const WORKERS_TEXT_MODEL = "@cf/zai-org/glm-4.7-flash";
const WORKERS_FAST_MODEL = "@cf/meta/llama-3.1-8b-instruct-fast";
const DEFAULT_TEXT_MODEL = PREMIUM_PRO_MODEL;
const DEFAULT_FAST_MODEL = PREMIUM_FLASH_MODEL;
const DEFAULT_VISION_MODEL = "@cf/google/gemma-4-26b-a4b-it";

function isWorkersAIModel(model){
  return String(model||"").startsWith("@cf/");
}

function gatewayOptions(task="general",extra={}){
  return {
    gateway:{
      id:AI_GATEWAY_ID,
      skipCache:true,
      collectLog:true,
      metadata:{
        app:"MED AI DALTON",
        version:"20",
        task,
        ...extra
      }
    }
  };
}

function modelTier(model){
  if(model===PREMIUM_PRO_MODEL)return "advanced";
  if(model===PREMIUM_FLASH_MODEL)return "fast";
  return "backup";
}

function modelFallbackChain(requested){
  const chain=[];
  const push=m=>{if(m&&!chain.includes(m))chain.push(m)};

  push(requested);

  if(requested===PREMIUM_PRO_MODEL){
    push(PREMIUM_FLASH_MODEL);
    push(WORKERS_TEXT_MODEL);
    push(WORKERS_FAST_MODEL);
  }else if(requested===PREMIUM_FLASH_MODEL){
    push(WORKERS_FAST_MODEL);
    push(WORKERS_TEXT_MODEL);
  }else if(isWorkersAIModel(requested)){
    push(WORKERS_TEXT_MODEL);
    push(WORKERS_FAST_MODEL);
  }else{
    push(PREMIUM_FLASH_MODEL);
    push(WORKERS_TEXT_MODEL);
    push(WORKERS_FAST_MODEL);
  }
  return chain;
}

async function aiChatStream(request, env, user, ctx) {
  ensureAI(env);
  const body = await readJson(request);
  const message = cleanText(body.message, 12000);
  if (!message) return json({ error: "Escribe un mensaje." }, 400);

  const mode = cleanText(body.mode,80) || "tutor";
  const conversationId = body.conversation_id || crypto.randomUUID();
  const now = new Date().toISOString();

  const existing = await env.DB.prepare(
    "SELECT id FROM ai_conversations WHERE id=? AND user_id=?"
  ).bind(conversationId,user.id).first();

  if (!existing) {
    await env.DB.prepare(`
      INSERT INTO ai_conversations
      (id,user_id,mode,title,subject_id,topic_id,context_json,archived,last_message_at,created_at,updated_at)
      VALUES (?,?,?,?,?,?,?,0,?,?,?)
    `).bind(
      conversationId,user.id,mode,cleanText(body.title,180)||humanMode(mode),
      nullable(body.subject_id),nullable(body.topic_id),
      JSON.stringify(body.context||{}),now,now,now
    ).run();
  }

  // Keep only the latest 6 messages: less prompt processing = faster first token.
  const historyRows = await env.DB.prepare(`
    SELECT role,content FROM ai_messages
    WHERE conversation_id=? AND user_id=? AND role IN ('user','assistant')
    ORDER BY datetime(created_at) DESC LIMIT 6
  `).bind(conversationId,user.id).all();

  const history = [...(historyRows.results||[])].reverse();
  const messages = [
    { role:"system", content:medicalInstructions(mode) + "\nSé claro, completo y docente. Nunca respondas únicamente con un título. Si el usuario pide aprender, explicar o entender un tema, desarrolla una explicación sustancial. Usa párrafos cortos y una estructura visual limpia." },
    ...history.map(x => ({ role:x.role, content:x.content })),
    { role:"user", content:message }
  ];

  const model = selectChatModel(mode, message);
  const maxTokens = model===PREMIUM_PRO_MODEL ? 3500 : 2400;

  // Save the user message before inference so conversation continuity is safe.
  await env.DB.prepare(`
    INSERT INTO ai_messages
    (id,user_id,conversation_id,role,content,content_json,model,created_at)
    VALUES (?,?,?,'user',?,'{}',NULL,?)
  `).bind(crypto.randomUUID(),user.id,conversationId,message,now).run();

  let aiStream=null,usedModel=model,lastStreamErr=null;
  const streamModels=modelFallbackChain(model);

  for(const candidate of streamModels){
    try {
      const input={
        messages,
        max_tokens:isWorkersAIModel(candidate)?Math.min(maxTokens,2200):maxTokens,
        temperature:0.30,
        stream:true
      };
      if(isWorkersAIModel(candidate)){
        input.chat_template_kwargs={enable_thinking:false};
      }

      aiStream=await env.AI.run(
        candidate,
        input,
        gatewayOptions(`stream_${mode}`,{model_requested:model,model_used:candidate})
      );
      usedModel=candidate;
      break;
    } catch(err) {
      lastStreamErr=err;
      console.error("AI_GATEWAY_STREAM_MODEL_ERROR",candidate,err?.stack||err);
    }
  }

  if(!aiStream){
    const kind=classifyWorkersAIError(lastStreamErr);
    return json({error:workersAIUserMessage(lastStreamErr)},["quota","rate","credits"].includes(kind)?429:503);
  }

  const [clientStream, archiveStream] = aiStream.tee();
  ctx.waitUntil(saveStreamedAssistantMessage(
    archiveStream, env, user.id, conversationId, usedModel
  ));

  return new Response(clientStream, {
    status:200,
    headers:{
      "content-type":"text/event-stream; charset=utf-8",
      "cache-control":"no-cache, no-store",
      "x-accel-buffering":"no",
      "x-medai-conversation-id":conversationId,
      "x-medai-model":usedModel,
      "x-medai-speed-mode":modelTier(usedModel)
    }
  });
}

function selectChatModel(mode, message) {
  const advancedModes = new Set([
    "patient","case_solver","grand_rounds","emergency","osce","differential","ward_round"
  ]);
  if (advancedModes.has(mode)) return DEFAULT_TEXT_MODEL;

  const complex = /diagn[oó]stic|diferencial|fisiopatolog|tratamiento|manejo|sepsis|shock|gasometr|electrolit|interacci[oó]n|contraindic|complicaci[oó]n|caso cl[ií]nico|internista|\bR[123]\b|urgencia|emergencia|interpretaci[oó]n|razonamiento cl[ií]nico|demostraci[oó]n|derivaci[oó]n|ecuaci[oó]n diferencial|relatividad|cu[aá]ntic|c[aá]lculo avanzado|tensor/i;
  if (complex.test(message)) return DEFAULT_TEXT_MODEL;

  // Teaching requests benefit from the stronger model while streaming keeps the interface responsive.
  if (mode === "tutor" && /quiero aprender|quiero entender|ens[eé]ñame|expl[ií]came|explica|paso a paso|c[oó]mo funciona|funcionamiento|fisiolog[ií]a|mecanismo/i.test(message)) return DEFAULT_TEXT_MODEL;

  // Short definitions, memorization and quick drills use the fast model.
  return DEFAULT_FAST_MODEL;
}

async function saveStreamedAssistantMessage(stream, env, userId, conversationId, model) {
  try {
    const answer = await collectTextFromSSE(stream);
    if (!answer.trim()) return;
    const now = new Date().toISOString();
    await env.DB.batch([
      env.DB.prepare(`
        INSERT INTO ai_messages
        (id,user_id,conversation_id,role,content,content_json,model,created_at)
        VALUES (?,?,?,'assistant',?,'{}',?,?)
      `).bind(crypto.randomUUID(),userId,conversationId,answer,model,now),
      env.DB.prepare(`
        UPDATE ai_conversations SET last_message_at=?,updated_at=?
        WHERE id=? AND user_id=?
      `).bind(now,now,conversationId,userId)
    ]);
  } catch(err) {
    console.error("STREAM_ARCHIVE_ERROR",err?.stack||err);
  }
}

async function collectTextFromSSE(stream) {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let answer = "";

  while (true) {
    const {done,value} = await reader.read();
    if (done) break;
    buffer += decoder.decode(value,{stream:true});
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() || "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const payload = trimmed.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      try {
        const obj = JSON.parse(payload);
        const piece = extractStreamPiece(obj);
        if (piece) answer = smartAppend(answer,piece);
      } catch {}
    }
  }

  if (buffer.trim().startsWith("data:")) {
    const payload = buffer.trim().slice(5).trim();
    if (payload && payload !== "[DONE]") {
      try {
        const obj = JSON.parse(payload);
        const piece = extractStreamPiece(obj);
        if (piece) answer = smartAppend(answer,piece);
      } catch {}
    }
  }
  return answer;
}

function extractStreamPiece(obj) {
  if (!obj) return "";
  if (typeof obj.response === "string") return obj.response;
  if (typeof obj.text === "string") return obj.text;
  if (typeof obj.token === "string") return obj.token;
  const delta = obj.choices?.[0]?.delta?.content;
  if (typeof delta === "string") return delta;
  const message = obj.choices?.[0]?.message?.content;
  if (typeof message === "string") return message;
  return "";
}

function smartAppend(current, piece) {
  if (!piece) return current;
  if (!current) return piece;
  // Handles both true deltas and providers that occasionally emit cumulative text.
  if (piece.startsWith(current)) return piece;
  if (current.endsWith(piece)) return current;
  return current + piece;
}

async function aiChat(request, env, user) {
  ensureAI(env);
  const body = await readJson(request);
  const message = cleanText(body.message, 12000);
  if (!message) return json({ error: "Escribe un mensaje." }, 400);

  const mode = cleanText(body.mode,80) || "tutor";
  let conversationId = body.conversation_id || crypto.randomUUID();
  const now = new Date().toISOString();

  const existing = await env.DB.prepare(
    "SELECT id FROM ai_conversations WHERE id=? AND user_id=?"
  ).bind(conversationId,user.id).first();

  if (!existing) {
    await env.DB.prepare(`
      INSERT INTO ai_conversations
      (id,user_id,mode,title,subject_id,topic_id,context_json,archived,last_message_at,created_at,updated_at)
      VALUES (?,?,?,?,?,?,?,0,?,?,?)
    `).bind(
      conversationId,user.id,mode,cleanText(body.title,180)||humanMode(mode),
      nullable(body.subject_id),nullable(body.topic_id),
      JSON.stringify(body.context||{}),now,now,now
    ).run();
  }

  const historyRows = await env.DB.prepare(`
    SELECT role,content FROM ai_messages
    WHERE conversation_id=? AND user_id=? AND role IN ('user','assistant')
    ORDER BY datetime(created_at) DESC LIMIT 8
  `).bind(conversationId,user.id).all();

  const history = [...(historyRows.results||[])].reverse();
  const messages = [
    { role:"system", content:medicalInstructions(mode) },
    ...history.map(x => ({ role:x.role, content:x.content })),
    { role:"user", content:message }
  ];

  const response = await callCloudflareAI(env, {
    model:selectChatModel(mode,message),
    task:`chat_${mode}`,
    messages,
    max_tokens:selectChatModel(mode,message)===PREMIUM_PRO_MODEL?3000:2200,
    temperature:0.30
  });

  const answer = extractCloudflareText(response) ||
    "No pude generar una respuesta en este momento.";

  await env.DB.batch([
    env.DB.prepare(`
      INSERT INTO ai_messages
      (id,user_id,conversation_id,role,content,content_json,model,created_at)
      VALUES (?,?,?,'user',?,'{}',NULL,?)
    `).bind(
      crypto.randomUUID(),user.id,conversationId,message,now
    ),

    env.DB.prepare(`
      INSERT INTO ai_messages
      (id,user_id,conversation_id,role,content,content_json,model,tokens_input,tokens_output,created_at)
      VALUES (?,?,?,'assistant',?,'{}',?,?,?,?)
    `).bind(
      crypto.randomUUID(),user.id,conversationId,answer,
      response.__model || env.CLOUDFLARE_AI_MODEL || DEFAULT_TEXT_MODEL,
      Number(response.usage?.prompt_tokens || response.usage?.input_tokens || 0),
      Number(response.usage?.completion_tokens || response.usage?.output_tokens || 0),
      new Date().toISOString()
    ),

    env.DB.prepare(`
      UPDATE ai_conversations
      SET last_message_at=?,updated_at=?
      WHERE id=? AND user_id=?
    `).bind(
      new Date().toISOString(),new Date().toISOString(),
      conversationId,user.id
    )
  ]);

  return json({
    answer,
    conversation_id:conversationId,
    model:response.__model || env.CLOUDFLARE_AI_MODEL || DEFAULT_TEXT_MODEL,
    provider:"Cloudflare AI Gateway"
  });
}

async function aiLanguageLessonPack(request,env,user){
  ensureAI(env);
  const body=await readJson(request);
  const language=normalizeCourseLanguage(body.language||"en-US");
  const languageNames={"he-IL":"Hebreo","la":"Latín","en-US":"Inglés","ru-RU":"Ruso","fr-FR":"Francés"};
  const languageName=languageNames[language]||"Inglés";
  const topic=cleanText(body.topic,220)||"fundamentos";
  const level=cleanText(body.level,80)||"A1";
  const dir=language==="he-IL"?"rtl":"ltr";

  const prompt=`Diseña una microlección interactiva para un estudiante hispanohablante.
IDIOMA OBJETIVO: ${languageName}
TEMA: ${topic}
NIVEL: ${level}

La lección debe ENSEÑAR antes de evaluar. Usa vocabulario y gramática apropiados al tema y al nivel.
Para Hebreo respeta el alfabeto hebreo y añade pronunciación/transliteración solo cuando ayude.
Para Latín usa latín correcto y explica los elementos gramaticales en español.
Para Ruso usa cirílico correcto y transliteración únicamente cuando sea pedagógicamente útil.
Para Inglés y Francés aumenta progresivamente el uso del idioma objetivo.

Devuelve EXCLUSIVAMENTE JSON válido con esta estructura:
{
  "title":"título breve",
  "goal":"objetivo de aprendizaje",
  "coach_tip":"consejo de estudio",
  "vocabulary":[
    {"target":"palabra o expresión","es":"significado en español","pronunciation":"pronunciación opcional"}
  ],
  "mini_lesson":[
    {"title":"concepto","body":"explicación clara en español","example":"ejemplo en idioma objetivo"}
  ],
  "exercises":[
    {
      "type":"choice|listen|order|translate|fill|speak",
      "instruction":"instrucción breve en español",
      "prompt":"texto objetivo cuando aplique",
      "prompt_es":"texto en español cuando aplique",
      "target":"frase que debe escucharse o pronunciarse cuando aplique",
      "options":["opción1","opción2","opción3","opción4"],
      "words":["palabra","palabra"],
      "answer":"respuesta correcta exacta",
      "pronunciation":"guía opcional",
      "explanation":"por qué es correcto o qué regla se practica"
    }
  ]
}

REGLAS:
- Devuelve 5 a 8 elementos de vocabulary.
- Devuelve 2 o 3 elementos de mini_lesson.
- Devuelve EXACTAMENTE 8 exercises.
- Debe haber al menos: 1 choice, 1 listen, 1 order, 1 translate, 1 fill y 1 speak.
- Las opciones incorrectas deben ser plausibles, no absurdas.
- En "order", words debe contener la frase correcta separada por palabras y answer debe ser la frase correcta.
- En "listen", target es lo que se reproduce y answer debe coincidir exactamente con una de las 4 options.
- En "choice", answer debe coincidir exactamente con una de las 4 options.
- En "fill", el prompt debe incluir ____ y answer solo la palabra o expresión faltante.
- En "speak", target y answer deben ser la misma frase.
- Explica los errores en español.
- No repitas el mismo ejercicio varias veces.
- No incluyas markdown.`;

  const response=await callCloudflareAI(env,{
    model:DEFAULT_FAST_MODEL,
    task:"language_lesson",
    messages:[
      {role:"system",content:"Eres diseñador experto de experiencias de aprendizaje de idiomas. Combinas explicación breve, recuperación activa, práctica contextual, corrección inmediata, escucha y producción oral. Tu salida debe ser JSON válido."},
      {role:"user",content:prompt}
    ],
    max_tokens:3200,
    temperature:.28
  });

  const parsed=parseJsonLoose(extractCloudflareText(response));
  if(!parsed||!Array.isArray(parsed.exercises)||parsed.exercises.length<5){
    return json({error:"No se pudo estructurar la lección interactiva."},502);
  }

  const exercises=parsed.exercises.slice(0,8).map((x,i)=>{
    const type=["choice","listen","order","translate","fill","speak"].includes(String(x.type||"").toLowerCase())?String(x.type).toLowerCase():"choice";
    return {
      type,
      instruction:cleanText(x.instruction,300)||"Resuelve el ejercicio.",
      prompt:cleanText(x.prompt,1200),
      prompt_es:cleanText(x.prompt_es,1200),
      target:cleanText(x.target,1200),
      options:Array.isArray(x.options)?x.options.slice(0,4).map(v=>cleanText(v,700)):[],
      words:Array.isArray(x.words)?x.words.slice(0,20).map(v=>cleanText(v,200)).filter(Boolean):[],
      answer:cleanText(x.answer,1200),
      pronunciation:cleanText(x.pronunciation,500),
      explanation:cleanText(x.explanation,1200)
    };
  }).filter(x=>x.answer||x.target);

  if(exercises.length<5)return json({error:"La lección generada quedó incompleta."},502);

  return json({
    language,
    language_name:languageName,
    direction:dir,
    title:cleanText(parsed.title,220)||topic,
    goal:cleanText(parsed.goal,800)||`Dominar los fundamentos de ${topic}.`,
    coach_tip:cleanText(parsed.coach_tip,800)||"Intenta responder antes de mirar la corrección.",
    vocabulary:Array.isArray(parsed.vocabulary)?parsed.vocabulary.slice(0,8).map(v=>({
      target:cleanText(v.target,500),
      es:cleanText(v.es,500),
      pronunciation:cleanText(v.pronunciation,300)
    })).filter(v=>v.target):[],
    mini_lesson:Array.isArray(parsed.mini_lesson)?parsed.mini_lesson.slice(0,3).map(v=>({
      title:cleanText(v.title,180),
      body:cleanText(v.body,1500),
      example:cleanText(v.example,800)
    })).filter(v=>v.title||v.body):[],
    exercises,
    model:response.__model||DEFAULT_FAST_MODEL
  });
}

async function aiExam(request, env, user) {
  ensureAI(env);
  const body = await readJson(request);
  const count = clamp(Math.round(Number(body.count||10)), 5, 30);
  const difficulty = clamp(Math.round(Number(body.difficulty||3)),1,10);
  const subject = cleanText(body.subject,120)||"Medicina";
  const topic = cleanText(body.topic,160)||"contenido general";
  const examLanguage=normalizeCourseLanguage(body.language||"en-US");
  const examLanguageNames={"he-IL":"Hebreo","la":"Latín","en-US":"Inglés","ru-RU":"Ruso","fr-FR":"Francés"};
  const languageInstruction=subject.toLowerCase().includes("idioma")?` El idioma objetivo es ${examLanguageNames[examLanguage]||"Inglés"}; evalúa específicamente ese idioma y no otro.`:"";

  const prompt = `Genera ${count} preguntas de selección múltiple en español para la materia ${subject}, tema ${topic}, dificultad ${difficulty}/10.${languageInstruction}
Adapta el tipo de pregunta a la materia: en Matemática y Física incluye razonamiento y cálculos cuando corresponda; en Astronomía combina conceptos y aplicación; en Idiomas evalúa comprensión, gramática, vocabulario y uso contextual; en Medicina conserva rigor clínico.
Cada pregunta debe tener exactamente 4 opciones plausibles, una sola correcta y explicación educativa.
Devuelve EXCLUSIVAMENTE JSON válido, sin markdown ni texto antes o después, con esta forma:
{"questions":[{"stem":"...","options":["...","...","...","..."],"correctIndex":0,"explanation":"..."}]}`;

  const response = await callCloudflareAI(env,{
    model: difficulty >= 7 ? DEFAULT_TEXT_MODEL : DEFAULT_FAST_MODEL,
    task:"exam_generation",
    messages:[
      {
        role:"system",
        content:"Eres un examinador académico riguroso y multidisciplinario. Ajusta la evaluación a la materia solicitada, evita ambigüedades, verifica cálculos y conceptos, y responde en español salvo cuando una pregunta de idioma requiera usar el idioma objetivo."
      },
      {role:"user",content:prompt}
    ],
    max_tokens: count <= 10 ? 2400 : 3300,
    temperature: 0.22
  });

  const text = extractCloudflareText(response);
  const parsed = parseJsonLoose(text);

  if (!parsed?.questions?.length) {
    return json({
      error:"La IA no devolvió un examen estructurado. Inténtalo de nuevo."
    },502);
  }

  const questions = parsed.questions.slice(0,count).map((q,i)=>({
    id:`cf_${Date.now()}_${i}`,
    stem:String(q.stem||""),
    options:Array.isArray(q.options)?q.options.slice(0,4).map(String):[],
    correctIndex:clamp(Number(q.correctIndex||0),0,3),
    explanation:String(q.explanation||"")
  })).filter(q=>q.stem && q.options.length===4);

  return json({
    questions,
    model:response.__model || env.CLOUDFLARE_AI_MODEL || DEFAULT_TEXT_MODEL,
    provider:"Cloudflare AI Gateway"
  });
}

async function aiFlashcards(request, env, user) {
  ensureAI(env);
  const body = await readJson(request);
  const count = clamp(Math.round(Number(body.count||10)),3,20);
  const subject = cleanText(body.subject,120)||"Medicina";
  const topic = cleanText(body.topic,220);
  const level = cleanText(body.level,80)||"Primeros años";
  const focus = cleanText(body.focus,120)||"fundamentos";

  if (!topic || topic.length < 3) {
    return json({error:"Escribe un tema específico para las flashcards."},400);
  }

  const prompt = `Crea exactamente ${count} flashcards académicas de alta calidad. Usa español como idioma de explicación, salvo que el tema sea aprendizaje de idiomas y convenga usar el idioma objetivo.

ALCANCE ESTRICTO:
- Materia: ${subject}
- Tema específico: ${topic}
- Nivel del estudiante: ${level}
- Enfoque: ${focus}

REGLAS OBLIGATORIAS:
1. TODAS las tarjetas deben pertenecer directamente a la materia "${subject}" y al tema "${topic}".
2. NO mezcles otros temas, sistemas, enfermedades o materias salvo que sean indispensables para comprender directamente "${topic}". Si una relación externa no es indispensable, omítela.
3. Cada tarjeta debe evaluar UNA sola idea. No combines varias preguntas en una tarjeta.
4. La pregunta del frente debe ser inequívoca y poder responderse sin contexto adicional.
5. El reverso debe ser breve, preciso y educativo: idealmente 1 a 3 oraciones.
6. Evita preguntas vagas como "¿Qué sabes de...?" o listas gigantes.
7. No inventes datos. Si no estás seguro de un detalle, no lo incluyas.
8. Para nivel ${level}, usa solo la profundidad apropiada.
9. No conviertas automáticamente un tema básico en tratamiento clínico si el enfoque no lo pide.
10. Antes de responder, verifica internamente que ninguna tarjeta se salga del tema "${topic}".

Devuelve SOLO JSON válido, sin markdown ni texto fuera del JSON:
{"cards":[{"front":"pregunta clara","back":"respuesta precisa","hint":"pista breve"}]}`;

  const response = await callCloudflareAI(env,{
    model:DEFAULT_FAST_MODEL,
    task:"flashcards",
    messages:[
      {
        role:"system",
        content:`Eres un diseñador experto de flashcards de repetición espaciada para medicina, matemática, física, astronomía e idiomas. Tu prioridad es la fidelidad temática: nunca mezcles contenido ajeno al tema solicitado. Mantén cada tarjeta atómica, clara, correcta y apropiada para el nivel indicado. En matemáticas y física verifica los resultados; en idiomas favorece uso contextual y recuperación activa.`
      },
      {role:"user",content:prompt}
    ],
    max_tokens: count <= 10 ? 1500 : 2100,
    temperature:0.10
  });

  const parsed = parseJsonLoose(extractCloudflareText(response));

  if(!parsed?.cards?.length) {
    return json({error:"No se pudieron generar flashcards estructuradas."},502);
  }

  const cards = parsed.cards.slice(0,count)
    .map(c=>({
      front:cleanText(c.front,1600),
      back:cleanText(c.back,3200),
      hint:cleanText(c.hint,700)
    }))
    .filter(c=>c.front && c.back);

  if (!cards.length) {
    return json({error:"La IA no generó tarjetas válidas para ese tema."},502);
  }

  return json({
    cards,
    subject,
    topic,
    level,
    focus,
    model:response.__model || env.CLOUDFLARE_AI_MODEL || DEFAULT_TEXT_MODEL,
    provider:"Cloudflare AI Gateway"
  });
}

async function aiVision(request, env, user) {
  ensureAI(env);
  const body = await readJson(request);
  const dataUrl = String(body.image_data_url||"");
  const prompt = cleanText(body.prompt,5000) ||
    "Analiza esta imagen con fines educativos médicos.";
  const mode = cleanText(body.mode,80)||"vision";

  if(!dataUrl.startsWith("data:image/")) {
    return json({error:"Imagen inválida."},400);
  }
  if(dataUrl.length>7_500_000) {
    return json({error:"La imagen es demasiado grande."},413);
  }

  const model = env.CLOUDFLARE_VISION_MODEL || DEFAULT_VISION_MODEL;

  try {
    const response = await env.AI.run(
      model,
      {
        messages:[
          {role:"system",content:medicalInstructions(mode)},
          {
            role:"user",
            content:[
              {
                type:"image_url",
                image_url:{url:dataUrl}
              },
              {
                type:"text",
                text:prompt
              }
            ]
          }
        ],
        max_tokens:1900,
        temperature:0.2,
        chat_template_kwargs:{enable_thinking:false}
      },
      gatewayOptions(`vision_${mode}`,{model_used:model})
    );

    response.__model = model;

    return json({
      answer:extractCloudflareText(response) ||
        "No pude interpretar la imagen.",
      model,
      provider:"Cloudflare AI Gateway"
    });
  } catch(err) {
    console.error("CLOUDFLARE_VISION_ERROR",err?.stack||err);
    return json({
      error:"No se pudo analizar la imagen con Workers AI.",
      detail:env.ENVIRONMENT==="development" ? String(err?.message||err) : undefined
    },500);
  }
}

async function callCloudflareAI(env, options) {
  ensureAI(env);
  const requested = options.model || env.CLOUDFLARE_AI_MODEL || DEFAULT_TEXT_MODEL;
  const models = options.fallback===false ? [requested] : modelFallbackChain(requested);
  let lastErr=null;

  for(const model of models){
    try {
      const input={
        messages:options.messages,
        max_tokens:options.max_tokens || (model===PREMIUM_PRO_MODEL?3200:2200),
        temperature:options.temperature ?? 0.30
      };

      if(options.stream) input.stream=true;
      if(options.response_format) input.response_format=options.response_format;

      if(isWorkersAIModel(model)){
        input.chat_template_kwargs={enable_thinking:false};
      }

      const response=await env.AI.run(
        model,
        input,
        gatewayOptions(options.task||"general",{
          model_requested:requested,
          model_used:model
        })
      );

      if(response && typeof response==="object"){
        response.__model=model;
        response.__gateway=AI_GATEWAY_ID;
      }
      return response;
    } catch(err) {
      lastErr=err;
      console.error("AI_GATEWAY_MODEL_ERROR",model,err?.stack||err);
    }
  }

  throw new Error(workersAIUserMessage(lastErr));
}

function ensureAI(env) {
  if(!env.AI) {
    throw new Error(
      "El binding AI de Cloudflare todavía no está configurado."
    );
  }
}

function extractCloudflareText(data) {
  if(!data) return "";

  if(typeof data.response === "string") {
    return data.response.trim();
  }

  if(typeof data.result?.response === "string") {
    return data.result.response.trim();
  }

  const choice = data.choices?.[0];
  if(typeof choice?.message?.content === "string") {
    return choice.message.content.trim();
  }

  if(Array.isArray(choice?.message?.content)) {
    return choice.message.content
      .map(x => typeof x === "string" ? x : (x?.text || ""))
      .join("\n")
      .trim();
  }

  if(typeof data.output_text === "string") {
    return data.output_text.trim();
  }

  if(Array.isArray(data.candidates)) {
    return data.candidates
      .flatMap(c=>Array.isArray(c?.content?.parts)?c.content.parts:[])
      .map(p=>typeof p?.text==="string"?p.text:"")
      .filter(Boolean)
      .join("\n")
      .trim();
  }

  return "";
}

function medicalInstructions(mode){
  if(mode==="science") return `Responde en español y actúa como profesor universitario excelente de Matemática, Física o Astronomía según el área indicada por el estudiante.
REGLAS: enseña conceptos antes de fórmulas; no saltes pasos algebraicos importantes; define símbolos y unidades; verifica dimensiones y resultados; distingue intuición, derivación y aplicación; en problemas guía paso a paso y deja que el estudiante intente cuando la modalidad sea práctica o socrática. Corrige errores explicando exactamente dónde ocurrió el razonamiento incorrecto. Si el tema es avanzado, declara supuestos y límites de validez. Evita inventar datos o hechos científicos. Adapta la profundidad al nivel indicado. FORMATO: usa ## para el título principal y ### para subtítulos cuando sea útil, listas o pasos numerados y párrafos cortos. No uses encabezados subrayados con signos = o -. Nunca respondas solo con el título.`;
  if(mode==="language") return `Actúa como profesor experto en adquisición de idiomas para un estudiante hispanohablante. El idioma objetivo, el nivel, el tema de la ruta y el porcentaje de inmersión vienen indicados en cada mensaje.
MÉTODO OBLIGATORIO: 1) usa input comprensible ligeramente superior al nivel actual; 2) exige producción activa, no aprendizaje pasivo; 3) trabaja UNA actividad principal por turno y espera la respuesta del estudiante; 4) después de una respuesta usa el patrón “Lo que hiciste bien → Corrección → Por qué → Repite o aplica”; 5) enseña gramática dentro de frases y situaciones reales; 6) recicla palabras y estructuras de turnos anteriores mediante recuperación activa y repetición espaciada; 7) alterna comprensión, conversación, lectura, escritura, escucha simulada y pronunciación; 8) respeta el nivel de inmersión y no traduzcas automáticamente todo; 9) para pronunciación señala sonido, sílaba tónica, ritmo y un ejemplo contrastivo; usa IPA o transliteración solo cuando ayude; 10) adapta el método al idioma: hebreo debe enseñar alef-bet, niqqud, raíces y binyanim; latín debe enseñar casos, declinaciones, conjugaciones, sintaxis y lectura; ruso debe enseñar cirílico, casos, aspecto y verbos de movimiento; inglés y francés deben progresar desde comunicación básica hasta registro avanzado; 11) no felicites de manera vacía: la retroalimentación debe ser concreta; 12) si el estudiante se equivoca, crea inmediatamente un microejercicio que ataque ese error; 13) al final de cada mini-lección incluye una producción libre breve que compruebe transferencia.
FORMATO: explicaciones breves y visuales, ejemplos claros, negrita en patrones importantes, máximo unas pocas secciones por turno. Evita listas interminables. El objetivo es que el estudiante use el idioma, no solo que lea sobre él.`;
  const modeText={
    tutor:"Tutor médico personal: enseña de manera escalonada, clara y rigurosa; usa razonamiento socrático cuando sea útil.",
    patient:`Actúa como simulador de paciente virtual para entrenamiento de entrevista clínica. Mantén un caso clínico interno y coherente que el estudiante NO puede ver.
REGLAS OBLIGATORIAS:
1. Si recibes [INICIAR_SIMULACION_PACIENTE], crea el caso en secreto y responde SOLO con nombre ficticio, edad, sexo y motivo de consulta en palabras del paciente. Nada más.
2. Durante la entrevista responde como paciente en primera persona y únicamente a lo que el estudiante pregunte. No ofrezcas espontáneamente antecedentes, revisión por sistemas ni pistas diagnósticas.
3. Si solicita examen físico, entrega únicamente los hallazgos de la región o maniobra solicitada. No interpretes.
4. Si ordena estudios, entrega solo los resultados de los estudios que pidió, sin revelar el diagnóstico salvo que sea inevitable por el propio resultado.
5. Nunca muestres diagnóstico, diferenciales, plan, explicación docente o el caso completo mientras la entrevista siga activa.
6. Solo cuando recibas [FINALIZAR_Y_EVALUAR_SIMULACION] sal del papel, revela el caso y evalúa el desempeño del estudiante.`,
    case_solver:"Actúa como docente de razonamiento clínico. El estudiante te proporcionará un caso completo para resolver. Analiza únicamente los datos suministrados; no inventes hallazgos. Da una solución estructurada con resumen, problemas, diagnóstico probable razonado, diferenciales priorizados, estudios adicionales justificados, manejo, alertas y puntos de aprendizaje. Señala claramente la incertidumbre cuando falten datos.",
    grand_rounds:"Actúa como profesor de Medicina Interna en Grand Rounds. Presenta casos complejos, exige lista de problemas, diferenciales priorizados, pruebas justificadas y plan terapéutico.",
    emergency:"Actúa como simulador de emergencias. Presenta información progresivamente, evalúa prioridades ABCDE, decisiones críticas, seguridad y tratamiento.",
    osce:"Actúa como examinador OSCE y paciente estandarizado. Evalúa comunicación, historia, examen, razonamiento y cierre.",
    pharmacology:"Tutor avanzado de farmacología: mecanismos, indicaciones, efectos adversos, interacciones, contraindicaciones y razonamiento clínico.",
    ecg:"Profesor de electrocardiografía. Exige método sistemático: frecuencia, ritmo, eje, intervalos, morfología, ST-T, diagnóstico e integración clínica.",
    radiology:"Tutor de interpretación radiológica. Exige descripción sistemática antes del diagnóstico y correlación clínica.",
    laboratory:"Tutor de interpretación de laboratorio y ácido-base. Pide interpretación, patrón, diferencial y próximos pasos.",
    differential:"Entrenador de diagnóstico diferencial: obliga a priorizar amenazas vitales, probabilidad y discriminadores.",
    socratic:"Tutor socrático: no des la respuesta de inmediato; guía mediante preguntas hasta que el estudiante llegue a ella.",
    ward_round:"Jefe de servicio en pase de visita. Pide presentación concisa, problemas activos, evidencia y plan por problema."
  }[mode]||"Tutor médico personal riguroso.";

  return `Responde en español. ${modeText}
Objetivo: entrenamiento académico de medicina con énfasis en Medicina Interna.
Diferencia hechos establecidos, razonamiento e incertidumbre. Evita inventar guías o referencias.
Cuando una recomendación dependa de guías cambiantes, indícalo.
Es contenido educativo y no sustituye la valoración profesional de pacientes reales.
Adapta la profundidad al nivel que indique el estudiante y corrige errores explicando el porqué.
FORMATO GENERAL: salvo cuando debas actuar estrictamente como paciente durante una simulación, presenta las respuestas como un documento profesional y fácil de estudiar. Usa encabezados Markdown con ## para títulos y ### para subtítulos; usa **negrita** para conceptos importantes; listas con viñetas o pasos numerados cuando ayuden; párrafos cortos y claros. NO uses encabezados subrayados con signos = o -. NUNCA entregues solo un título: todo encabezado debe ir seguido de contenido sustancial. Evita muros de texto y también evita fragmentar en demasiadas secciones.`;
}

function humanMode(mode){
  return ({
    tutor:"Tutor IA",patient:"Paciente virtual",case_solver:"Resolver caso clínico",grand_rounds:"Grand Rounds",
    emergency:"Emergencias",osce:"OSCE",pharmacology:"Farmacología",
    ecg:"ECG",radiology:"Radiología",laboratory:"Laboratorios",
    differential:"Diagnóstico diferencial",socratic:"Modo socrático",ward_round:"Pase de visita",science:"Ciencias",language:"Idiomas"
  })[mode]||"Tutor IA";
}

// -------------------- METRICS --------------------

async function bumpDailyMetric(env,userId,delta={}){
  const date=new Date().toISOString().slice(0,10);
  const id=`metric_${userId}_${date}`;
  await env.DB.prepare(`
    INSERT INTO daily_metrics
    (id,user_id,metric_date,study_seconds,questions_answered,questions_correct,flashcards_reviewed,cases_completed,lessons_completed,xp_earned,created_at,updated_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
    ON CONFLICT(user_id,metric_date) DO UPDATE SET
      study_seconds=daily_metrics.study_seconds+excluded.study_seconds,
      questions_answered=daily_metrics.questions_answered+excluded.questions_answered,
      questions_correct=daily_metrics.questions_correct+excluded.questions_correct,
      flashcards_reviewed=daily_metrics.flashcards_reviewed+excluded.flashcards_reviewed,
      cases_completed=daily_metrics.cases_completed+excluded.cases_completed,
      lessons_completed=daily_metrics.lessons_completed+excluded.lessons_completed,
      xp_earned=daily_metrics.xp_earned+excluded.xp_earned,
      updated_at=excluded.updated_at
  `).bind(
    id,userId,date,
    Number(delta.study_seconds||0),Number(delta.questions_answered||0),Number(delta.questions_correct||0),
    Number(delta.flashcards_reviewed||0),Number(delta.cases_completed||0),Number(delta.lessons_completed||0),
    Number(delta.xp_earned||0),new Date().toISOString(),new Date().toISOString()
  ).run();
}

// -------------------- HELPERS --------------------

function json(data,status=200,extraHeaders={}){
  return new Response(JSON.stringify(data),{status,headers:{...JSON_HEADERS,...extraHeaders}});
}

async function readJson(request){
  const type=request.headers.get("content-type")||"";
  if(!type.includes("application/json")) return {};
  const text=await request.text();
  if(text.length>18_000_000) throw new Error("Solicitud demasiado grande.");
  return text?JSON.parse(text):{};
}

function normalizeEmail(v){return String(v||"").trim().toLowerCase();}
function isEmail(v){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);}
function cleanText(v,max=5000){return String(v??"").trim().slice(0,max);}
function nullable(v){const s=String(v??"").trim(); return s?s:null;}
function clamp(n,min,max){return Math.min(max,Math.max(min,Number.isFinite(n)?n:min));}
function delay(ms){return new Promise(r=>setTimeout(r,ms));}

function parseCookie(header,name){
  for(const part of header.split(";")){
    const [k,...rest]=part.trim().split("=");
    if(k===name) return rest.join("=");
  }
  return "";
}

async function derivePassword(password,saltBytes,iterations){
  const keyMaterial=await crypto.subtle.importKey(
    "raw",new TextEncoder().encode(password),{name:"PBKDF2"},false,["deriveBits"]
  );
  const bits=await crypto.subtle.deriveBits(
    {name:"PBKDF2",hash:"SHA-256",salt:saltBytes,iterations},
    keyMaterial,256
  );
  return bytesToBase64url(new Uint8Array(bits));
}

async function sha256(text){
  const digest=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(text));
  return bytesToBase64url(new Uint8Array(digest));
}

function bytesToBase64url(bytes){
  let binary="";
  for(let i=0;i<bytes.length;i++) binary+=String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
}

function base64urlToBytes(str){
  let s=str.replace(/-/g,"+").replace(/_/g,"/");
  while(s.length%4) s+="=";
  const bin=atob(s), out=new Uint8Array(bin.length);
  for(let i=0;i<bin.length;i++) out[i]=bin.charCodeAt(i);
  return out;
}

function constantTimeEqual(a,b){
  if(a.length!==b.length) return false;
  let diff=0;
  for(let i=0;i<a.length;i++) diff|=a.charCodeAt(i)^b.charCodeAt(i);
  return diff===0;
}

function parseJsonLoose(text){
  if(!text) return null;
  try{return JSON.parse(text);}catch{}
  const first=Math.min(...["{","["].map(c=>{const i=text.indexOf(c);return i<0?Infinity:i;}));
  const last=Math.max(text.lastIndexOf("}"),text.lastIndexOf("]"));
  if(Number.isFinite(first)&&last>first){
    try{return JSON.parse(text.slice(first,last+1));}catch{}
  }
  return null;
}
