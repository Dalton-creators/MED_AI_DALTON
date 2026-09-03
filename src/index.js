const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store"
};

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
      // Personal single-user mode:
      // no login screen; every device uses the same personal MED AI profile in D1.
      const user = await ensurePersonalUser(env);

      // V26 · Stability & Reliability Center
      if (url.pathname === "/api/system/health" && request.method === "GET") {
        return systemHealthApi(env, user);
      }

      if (url.pathname === "/api/system/self-test" && request.method === "GET") {
        return systemSelfTestApi(url, env, user);
      }

      if (url.pathname === "/api/system/backups" && request.method === "GET") {
        return listSystemBackupsApi(env, user);
      }

      if (url.pathname === "/api/system/backup" && request.method === "POST") {
        return createSystemBackupApi(request, env, user);
      }

      if (url.pathname === "/api/system/backup" && request.method === "GET") {
        return downloadSystemBackupApi(url, env, user);
      }

      if (url.pathname === "/api/system/restore" && request.method === "POST") {
        return restoreSystemBackupApi(request, env, user);
      }

      if (url.pathname === "/api/system/integrity" && request.method === "GET") {
        return systemIntegrityApi(url, env, user);
      }

      if (url.pathname === "/api/system/offline-course" && request.method === "GET") {
        return systemOfflineCourseApi(url, env, user);
      }

      if (url.pathname === "/api/system/export" && request.method === "GET") {
        return systemExportApi(env, user);
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

      if (url.pathname === "/api/academic/home" && request.method === "GET") {
        return academicHomeApi(env, user);
      }

      if (url.pathname === "/api/academic/semester" && request.method === "GET") {
        return academicSemesterApi(request, env, user, "GET");
      }

      if (url.pathname === "/api/academic/semester" && request.method === "POST") {
        return academicSemesterApi(request, env, user, "POST");
      }

      if (url.pathname === "/api/academic/diagnostic/start" && request.method === "POST") {
        return academicDiagnosticStartApi(request, env, user);
      }

      if (url.pathname === "/api/academic/diagnostic" && request.method === "GET") {
        return academicDiagnosticApi(request, env, user, "GET");
      }

      if (url.pathname === "/api/academic/diagnostic" && request.method === "POST") {
        return academicDiagnosticApi(request, env, user, "POST");
      }

      if (url.pathname === "/api/academic/credentials" && request.method === "GET") {
        return academicCredentialsApi(env, user);
      }

      if (url.pathname === "/api/academic/explain" && request.method === "POST") {
        return academicExplainApi(request, env, user);
      }

      if (url.pathname === "/api/subjects" && request.method === "GET") {
        return subjects(env);
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

      if (url.pathname === "/api/library/source-priority" && request.method === "PUT") {
        return updateLibrarySourcePriorityApi(request, env, user);
      }

      if (url.pathname === "/api/library/item" && request.method === "DELETE") {
        return deleteStudyLibraryItemApi(url, env, user);
      }

      if (url.pathname === "/api/library/study-packs" && request.method === "GET") {
        return listLibraryStudyPacks(url, env, user);
      }

      if (url.pathname === "/api/library/source-map" && request.method === "POST") {
        return librarySourceMapApi(request, env, user);
      }

      if (url.pathname === "/api/library/study-pack" && request.method === "POST") {
        return createLibraryStudyPackApi(request, env, user);
      }

      if (url.pathname === "/api/library/extract" && request.method === "POST") {
        return extractLibraryDocument(request, env, user);
      }

      if (url.pathname === "/api/library/ocr-index" && request.method === "POST") {
        return libraryOcrIndexApi(request, env, user);
      }

      if (url.pathname === "/api/library/transcribe" && request.method === "POST") {
        return transcribeLibraryMediaApi(request, env, user);
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

      if (url.pathname === "/api/smart/dashboard" && request.method === "GET") {
        return smartDashboard(env, user);
      }

      if (url.pathname === "/api/smart/retrieve" && request.method === "GET") {
        return smartRetrieve(url, env, user);
      }

      if (url.pathname === "/api/smart/ask" && request.method === "POST") {
        return smartAsk(request, env, user);
      }

      if (url.pathname === "/api/smart/review-set" && request.method === "GET") {
        return smartReviewSet(url, env, user);
      }

      if (url.pathname === "/api/smart/review" && request.method === "POST") {
        return smartRateReview(request, env, user);
      }

      if (url.pathname === "/api/smart/historical-keys" && request.method === "POST") {
        return analyzeHistoricalKeysApi(request, env, user);
      }

      if (url.pathname === "/api/smart/historical-keys" && request.method === "GET") {
        return getHistoricalKeysApi(url, env, user);
      }

      if (url.pathname === "/api/exam-prep/plan" && request.method === "GET") {
        return getExamPrepPlanApi(url, env, user);
      }

      if (url.pathname === "/api/exam-prep/plan" && request.method === "POST") {
        return createExamPrepPlanApi(request, env, user);
      }

      if (url.pathname === "/api/question-bank" && request.method === "GET") {
        return questionBankApi(url, env, user);
      }

      if (url.pathname === "/api/question-bank" && request.method === "DELETE") {
        return deleteQuestionBankApi(url, env, user);
      }

      if (url.pathname === "/api/adaptive-exam/start" && request.method === "GET") {
        return adaptiveExamStartApi(url, env, user);
      }

      if (url.pathname === "/api/progress/overview" && request.method === "GET") {
        return progressOverviewApi(env, user);
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
      const incidentId=crypto.randomUUID().slice(0,8).toUpperCase();
      const msg=String(err?.message||err||"");
      const path=url.pathname;
      const component=
        path.includes("/library") ? "Biblioteca / R2" :
        path.includes("/smart") ? "Repaso inteligente" :
        path.includes("/ai/") ? "IA / Gateway" :
        path.includes("/course") ? "Cursos" :
        path.includes("/system") ? "Sistema / Backup" :
        "API general";
      console.error("MED_AI_ERROR",incidentId,component,path,err?.stack||err);
      const safeSetup=/binding R2|LIBRARY|R2 bucket|almacenamiento offline/i.test(msg);
      return json({
        error: safeSetup ? msg : `Ocurrió un error interno en ${component}.`,
        detail: env.ENVIRONMENT === "development" ? msg : undefined,
        incident_id:incidentId,
        component,
        path,
        server_version:SYSTEM_VERSION
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


// ============================================================
// V26 · STABILITY & RELIABILITY BACKEND
// ============================================================

const SYSTEM_VERSION="30.0.7";
const SYSTEM_BACKUP_PREFIX="_system_backups";
const SYSTEM_BACKUP_TABLES=[
  "profiles","user_preferences","study_resume_state",
  "user_topic_progress","user_lesson_progress",
  "notes","academic_deadlines","study_sessions",
  "exams","question_attempts","mistakes",
  "flashcards","flashcard_reviews",
  "ai_conversations","ai_messages",
  "case_sessions","daily_metrics"
];

async function systemHealthApi(env,user){
  let db=false,dbDetail="",r2=false,r2Detail="";
  try{
    const row=await env.DB.prepare("SELECT COUNT(*) AS n FROM notes WHERE user_id=?").bind(user.id).first();
    db=true;dbDetail=`D1 responde · ${Number(row?.n||0)} registros de notas/materiales`;
  }catch(err){
    dbDetail=`D1 no respondió: ${String(err?.message||err).slice(0,240)}`;
  }

  if(env.LIBRARY){
    try{
      await env.LIBRARY.list({prefix:`${SYSTEM_BACKUP_PREFIX}/${user.id}/`,limit:1});
      r2=true;r2Detail="Binding LIBRARY responde correctamente";
    }catch(err){
      r2Detail=`R2 no respondió: ${String(err?.message||err).slice(0,240)}`;
    }
  }else{
    r2Detail="Falta binding LIBRARY";
  }

  let backupCount=0,lastBackup=null;
  if(r2){
    try{
      const list=await env.LIBRARY.list({prefix:`${SYSTEM_BACKUP_PREFIX}/${user.id}/`,limit:100});
      const objs=[...(list.objects||[])].sort((a,b)=>String(b.uploaded||"").localeCompare(String(a.uploaded||"")));
      backupCount=objs.length;
      if(objs[0])lastBackup={key:objs[0].key,created_at:objs[0].uploaded||null,size:Number(objs[0].size||0)};
    }catch{}
  }

  return json({
    ok:db,
    app:"MED AI DALTON",
    server_version:SYSTEM_VERSION,
    db,db_detail:dbDetail,
    r2,r2_detail:r2Detail,
    ai:!!env.AI,
    assets:!!env.ASSETS,
    gateway_id:typeof AI_GATEWAY_ID!=="undefined"?AI_GATEWAY_ID:"med-ai-dalton",
    backup_count:backupCount,
    last_backup:lastBackup,
    checked_at:new Date().toISOString(),
    note:"AI=true confirma el binding; el diagnóstico no ejecuta una inferencia de pago."
  });
}


async function systemSelfTestApi(url,env,user){
  const checks=[];
  const add=(name,ok,detail)=>checks.push({name,ok:!!ok,detail:cleanText(detail,800)});

  try{
    const n=await env.DB.prepare("SELECT COUNT(*) AS n FROM subjects WHERE active=1").first();
    add("D1 · subjects",Number(n?.n||0)>0,`${Number(n?.n||0)} materias activas`);
  }catch(err){add("D1 · subjects",false,String(err?.message||err))}

  try{
    const n=await env.DB.prepare("SELECT COUNT(*) AS n FROM notes WHERE user_id=?").bind(user.id).first();
    add("D1 · notes",true,`${Number(n?.n||0)} notas/materiales`);
  }catch(err){add("D1 · notes",false,String(err?.message||err))}

  try{
    const r=await env.DB.prepare("SELECT body FROM notes WHERE user_id=? AND tags_json LIKE '%historical_keys_pack%' LIMIT 1").bind(user.id).first();
    add("Paquetes históricos",true,r?((parseJsonLoose(r.body)||{}).historical_keys_pack?"JSON válido":"Registro legible"):"Sin paquetes todavía");
  }catch(err){add("Paquetes históricos",false,String(err?.message||err))}

  try{
    const bank=await questionBankRows(env,user);
    add("Banco de preguntas",true,`${bank.length} preguntas válidas`);
  }catch(err){add("Banco de preguntas",false,String(err?.message||err))}

  try{
    requireLibraryR2(env);
    const list=await env.LIBRARY.list({limit:1});
    add("R2 · Biblioteca",true,`${(list.objects||[]).length?"Objetos accesibles":"Bucket accesible"}`);
  }catch(err){add("R2 · Biblioteca",false,String(err?.message||err))}

  try{
    const file=await env.DB.prepare("SELECT metadata_json,title FROM notes WHERE user_id=? AND tags_json LIKE '%library_file%' LIMIT 1").bind(user.id).first();
    if(!file)add("D1 ↔ R2 muestra",true,"Sin archivos para comprobar");
    else{
      const m=parseJsonLoose(file.metadata_json)||{},head=m.r2_key?await env.LIBRARY.head(m.r2_key):null;
      add("D1 ↔ R2 muestra",!!head,head?`OK · ${file.title}`:`Falta objeto de ${file.title}`);
    }
  }catch(err){add("D1 ↔ R2 muestra",false,String(err?.message||err))}

  try{
    const n=await env.DB.prepare("SELECT COUNT(*) AS n FROM notes WHERE user_id=? AND (tags_json LIKE '%semester_v30%' OR tags_json LIKE '%diagnostic_v30%')").bind(user.id).first();
    add("Academic Experience V30",true,`${Number(n?.n||0)} registros académicos V30`);
  }catch(err){add("Academic Experience V30",false,String(err?.message||err))}

  try{
    const n=await env.DB.prepare("SELECT COUNT(*) AS n FROM academic_deadlines WHERE user_id=?").bind(user.id).first();
    add("Calendario académico",true,`${Number(n?.n||0)} fechas registradas`);
  }catch(err){add("Calendario académico",false,String(err?.message||err))}

  add("AI binding",!!env.AI,env.AI?"Binding AI disponible":"Falta binding AI");
  add("Assets binding",!!env.ASSETS,env.ASSETS?"Assets disponible":"Falta ASSETS");

  let ai_live=null;
  if(url.searchParams.get("ai")==="1"){
    try{
      ensureAI(env);
      const live=await promiseTimeout(
        env.AI.run(
          PREMIUM_FLASH_LITE_MODEL,
          {
            contents:[{role:"user",parts:[{text:"Responde exactamente: MEDAI_OK"}]}],
            generationConfig:{temperature:0,maxOutputTokens:20}
          },
          gatewayOptions("system_live_ai_test",{
            model_requested:PREMIUM_FLASH_LITE_MODEL,
            model_used:PREMIUM_FLASH_LITE_MODEL
          })
        ),
        15000,
        "Prueba IA"
      );
      const text=extractCloudflareText(live);
      const ok=/MEDAI_OK/i.test(text);
      ai_live={ok,model:PREMIUM_FLASH_LITE_MODEL,response:cleanText(text,120)};
      add("IA real · Gemini 2.5 Flash Lite",ok,ok?"Inferencia real respondió correctamente":`Respuesta inesperada: ${cleanText(text,120)}`);
    }catch(err){
      ai_live={ok:false,model:PREMIUM_FLASH_LITE_MODEL,error:cleanText(err?.message||err,300)};
      add("IA real · Gemini 2.5 Flash Lite",false,String(err?.message||err));
    }
  }

  const passed=checks.filter(x=>x.ok).length;
  return json({
    ok:passed===checks.length,passed,total:checks.length,checks,
    ai_live,server_version:SYSTEM_VERSION,checked_at:new Date().toISOString()
  });
}

async function collectSystemBackupData(env,user){
  const tables={};
  for(const table of SYSTEM_BACKUP_TABLES){
    try{
      const rows=await env.DB.prepare(`SELECT * FROM ${table} WHERE user_id=?`).bind(user.id).all();
      tables[table]=rows.results||[];
    }catch(err){
      // A future/older schema may not contain every optional table.
      tables[table]=[];
    }
  }

  const libraryRows=await env.DB.prepare(`
    SELECT id,title,metadata_json,updated_at
    FROM notes
    WHERE user_id=? AND tags_json LIKE '%library_file%'
    ORDER BY datetime(updated_at) DESC
  `).bind(user.id).all().catch(()=>({results:[]}));

  const library_manifest=(libraryRows.results||[]).map(r=>{
    const m=parseLibraryMeta(r);
    return {id:r.id,title:r.title,r2_key:m.r2_key||null,mime_type:m.mime_type||null,size_bytes:Number(m.size_bytes||0),updated_at:r.updated_at};
  });

  return {
    format:"MED_AI_DALTON_BACKUP",
    format_version:1,
    app_version:SYSTEM_VERSION,
    user_id:user.id,
    created_at:new Date().toISOString(),
    tables,
    library_manifest
  };
}

async function pruneSystemBackups(env,user,keep=10){
  if(!env.LIBRARY)return;
  const prefix=`${SYSTEM_BACKUP_PREFIX}/${user.id}/`;
  let cursor=undefined,all=[];
  do{
    const page=await env.LIBRARY.list({prefix,limit:1000,cursor});
    all.push(...(page.objects||[]));
    cursor=page.truncated?page.cursor:undefined;
  }while(cursor);
  all.sort((a,b)=>String(b.uploaded||"").localeCompare(String(a.uploaded||"")));
  const old=all.slice(keep);
  if(old.length)await Promise.all(old.map(x=>env.LIBRARY.delete(x.key).catch(()=>{})));
}

async function createSystemBackupInternal(env,user,reason="manual"){
  requireLibraryR2(env);
  const backup=await collectSystemBackupData(env,user);
  backup.reason=cleanText(reason,120)||"manual";
  const stamp=backup.created_at.replace(/[:.]/g,"-");
  const key=`${SYSTEM_BACKUP_PREFIX}/${user.id}/${stamp}.json`;
  const text=JSON.stringify(backup);
  await env.LIBRARY.put(key,text,{
    httpMetadata:{contentType:"application/json; charset=utf-8"},
    customMetadata:{medai:"system-backup",version:SYSTEM_VERSION,reason:backup.reason}
  });
  await pruneSystemBackups(env,user,10);
  return {key,created_at:backup.created_at,size:new TextEncoder().encode(text).byteLength,reason:backup.reason};
}

async function createSystemBackupApi(request,env,user){
  const body=await readJson(request).catch(()=>({}));
  const result=await createSystemBackupInternal(env,user,cleanText(body.reason,120)||"manual");
  return json({ok:true,...result},201);
}

async function listSystemBackupsApi(env,user){
  requireLibraryR2(env);
  const prefix=`${SYSTEM_BACKUP_PREFIX}/${user.id}/`;
  let cursor=undefined,objects=[];
  do{
    const page=await env.LIBRARY.list({prefix,limit:100,cursor,include:["customMetadata"]});
    objects.push(...(page.objects||[]));
    cursor=page.truncated?page.cursor:undefined;
  }while(cursor&&objects.length<500);
  objects.sort((a,b)=>String(b.uploaded||"").localeCompare(String(a.uploaded||"")));
  return json({backups:objects.slice(0,20).map(x=>({
    key:x.key,
    created_at:x.uploaded||null,
    size:Number(x.size||0),
    reason:x.customMetadata?.reason||"backup"
  }))});
}

function validSystemBackupKey(user,key){
  const prefix=`${SYSTEM_BACKUP_PREFIX}/${user.id}/`;
  return typeof key==="string"&&key.startsWith(prefix)&&key.endsWith(".json")&&!key.includes("..");
}

async function downloadSystemBackupApi(url,env,user){
  requireLibraryR2(env);
  const key=String(url.searchParams.get("key")||"");
  if(!validSystemBackupKey(user,key))return json({error:"Backup inválido."},400);
  const obj=await env.LIBRARY.get(key);
  if(!obj)return json({error:"No encontré ese backup."},404);
  const text=await obj.text();
  if(url.searchParams.get("download")==="1"){
    const name=`MED_AI_DALTON_BACKUP_${String(key.split("/").pop()||"backup.json")}`;
    return new Response(text,{status:200,headers:{
      "content-type":"application/json; charset=utf-8",
      "content-disposition":`attachment; filename="${name}"`,
      "cache-control":"no-store"
    }});
  }
  const parsed=parseJsonLoose(text);
  return json({backup:parsed});
}

function safeBackupColumns(row){
  return Object.keys(row||{}).filter(k=>/^[A-Za-z_][A-Za-z0-9_]*$/.test(k));
}

async function restoreBackupRows(env,user,backup){
  const data=backup?.tables&&typeof backup.tables==="object"?backup.tables:{};
  let restored=0;
  for(const table of SYSTEM_BACKUP_TABLES){
    const rows=Array.isArray(data[table])?data[table]:[];
    for(let start=0;start<rows.length;start+=40){
      const statements=[];
      for(const original of rows.slice(start,start+40)){
        if(!original||typeof original!=="object")continue;
        const row={...original};
        if("user_id" in row)row.user_id=user.id;
        const cols=safeBackupColumns(row);
        if(!cols.length)continue;
        const placeholders=cols.map(()=>"?").join(",");
        const sql=`INSERT OR REPLACE INTO ${table} (${cols.join(",")}) VALUES (${placeholders})`;
        statements.push(env.DB.prepare(sql).bind(...cols.map(c=>row[c]??null)));
      }
      if(statements.length){
        await env.DB.batch(statements);
        restored+=statements.length;
      }
    }
  }
  return restored;
}

async function restoreSystemBackupApi(request,env,user){
  requireLibraryR2(env);
  const body=await readJson(request);
  if(body.confirm!=="RESTAURAR")return json({error:"Confirmación de restauración inválida."},400);
  const key=String(body.key||"");
  if(!validSystemBackupKey(user,key))return json({error:"Backup inválido."},400);
  const obj=await env.LIBRARY.get(key);
  if(!obj)return json({error:"No encontré ese backup."},404);
  const backup=parseJsonLoose(await obj.text());
  if(backup?.format!=="MED_AI_DALTON_BACKUP")return json({error:"El archivo no es un backup reconocido de MED AI."},400);

  // Safety restore point before modifying D1.
  const before=await createSystemBackupInternal(env,user,"before_restore");
  const restored=await restoreBackupRows(env,user,backup);
  return json({ok:true,rows_restored:restored,safety_backup:before.key,restored_from:key});
}

async function systemIntegrityApi(url,env,user){
  requireLibraryR2(env);
  const limit=clamp(Number(url.searchParams.get("limit")||250),1,500);
  const rows=await env.DB.prepare(`
    SELECT id,title,metadata_json
    FROM notes
    WHERE user_id=? AND tags_json LIKE '%library_file%'
    ORDER BY datetime(updated_at) DESC
    LIMIT ?
  `).bind(user.id,limit).all();
  const results=rows.results||[],missing=[];
  const concurrency=12;
  for(let i=0;i<results.length;i+=concurrency){
    const batch=results.slice(i,i+concurrency);
    await Promise.all(batch.map(async row=>{
      try{
        const meta=parseLibraryMeta(row),key=meta.r2_key;
        if(!key){missing.push({id:row.id,title:row.title,reason:"El registro D1 no contiene r2_key"});return}
        const head=await env.LIBRARY.head(key);
        if(!head)missing.push({id:row.id,title:row.title,reason:"El objeto no existe en R2"});
      }catch(err){
        missing.push({id:row.id,title:row.title,reason:String(err?.message||err).slice(0,240)});
      }
    }));
  }
  const count=await env.DB.prepare(`SELECT COUNT(*) AS n FROM notes WHERE user_id=? AND tags_json LIKE '%library_file%'`).bind(user.id).first().catch(()=>({n:results.length}));
  return json({
    ok:missing.length===0,
    total:Number(count?.n||results.length),
    checked:results.length,
    missing,
    truncated:Number(count?.n||0)>results.length,
    checked_at:new Date().toISOString()
  });
}

async function systemOfflineCourseApi(url,env,user){
  const subjectId=cleanText(url.searchParams.get("subject_id"),220);
  if(!subjectId)return json({materials:[],flashcards:[],historical_packs:[],question_bank:[],count:0});
  const subject=await env.DB.prepare(`SELECT id,name,code FROM subjects WHERE id=? LIMIT 1`).bind(subjectId).first();
  if(!subject)return json({error:"No encontré esa materia."},404);

  const [materialRows,flashRows,historicalRows]=await Promise.all([
    env.DB.prepare(`
      SELECT id,subject_id,topic_id,title,body,metadata_json,updated_at
      FROM notes
      WHERE user_id=? AND subject_id=? AND tags_json LIKE '%material_v19%'
      ORDER BY datetime(updated_at) DESC LIMIT 400
    `).bind(user.id,subjectId).all(),
    env.DB.prepare(`
      SELECT id,topic_id,source_type,front,back,hint,tags_json,interval_days,ease_factor,due_at,metadata_json,created_at
      FROM flashcards WHERE user_id=? ORDER BY datetime(created_at) DESC LIMIT 1500
    `).bind(user.id).all().catch(()=>({results:[]})),
    env.DB.prepare(`
      SELECT id,title,body,metadata_json,updated_at FROM notes
      WHERE user_id=? AND tags_json LIKE '%historical_keys_pack%'
      ORDER BY datetime(updated_at) DESC LIMIT 100
    `).bind(user.id).all()
  ]);

  const seen=new Set(),materials=[];
  for(const row of (materialRows.results||[])){
    const meta=parseJsonLoose(row.metadata_json)||{},lessonId=cleanText(meta.lesson_id,220),material=parseJsonLoose(row.body);
    if(!lessonId||!material)continue;
    const key=`${row.topic_id||""}|${lessonId}|${meta.language||""}`;
    if(seen.has(key))continue;seen.add(key);
    materials.push({id:row.id,subject_id:row.subject_id,topic_id:row.topic_id,lesson_id:lessonId,language:cleanText(meta.language,100),title:row.title,material,updated_at:row.updated_at});
  }

  const historical_packs=[];
  for(const r of (historicalRows.results||[])){
    const p=parseJsonLoose(r.body)||{},m=parseJsonLoose(r.metadata_json)||{},subj=p.subject||m.subject||"";
    if(smartNormalize(subj).includes(smartNormalize(subject.name))||smartNormalize(subj).includes(smartNormalize(subject.code))){
      historical_packs.push({id:r.id,title:r.title,pack:p,updated_at:r.updated_at});
    }
  }

  const topicRows=await env.DB.prepare(`SELECT id FROM topics WHERE subject_id=?`).bind(subjectId).all().catch(()=>({results:[]}));
  const subjectTopics=new Set((topicRows.results||[]).map(x=>x.id));
  const flashcards=(flashRows.results||[]).filter(c=>{
    const m=parseJsonLoose(c.metadata_json)||{},tags=parseJsonLoose(c.tags_json)||[];
    const hay=smartNormalize(`${m.subject||""} ${tags.join(" ")}`);
    return subjectTopics.has(c.topic_id)||hay.includes(smartNormalize(subject.name))||hay.includes(smartNormalize(subject.code));
  }).slice(0,600);

  const allBank=await questionBankRows(env,user),normName=smartNormalize(subject.name),normCode=smartNormalize(subject.code);
  const question_bank=allBank.filter(q=>{
    const s=smartNormalize(`${q.subject} ${q.topic}`);
    return s.includes(normName)||s.includes(normCode);
  }).slice(0,500);

  return json({
    subject:{id:subject.id,name:subject.name,code:subject.code},
    materials,flashcards,historical_packs,question_bank,count:materials.length,bundle_version:30,
    note:"Los PDF/libros quedan offline cuando los marcaste OFFLINE en Biblioteca; este paquete añade clases, flashcards, claves históricas y banco de preguntas."
  });
}

// -------------------- AUTH --------------------

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


// ============================================================
// V30 · ACADEMIC EXPERIENCE
// ============================================================

function academicNoteMeta(row){
  return parseJsonLoose(row?.metadata_json)||{};
}
function academicNoteBody(row){
  const parsed=parseJsonLoose(row?.body);
  return parsed&&typeof parsed==="object"?parsed:{};
}

async function latestAcademicNote(env,user,tag,subjectId=""){
  const rows=await env.DB.prepare(`
    SELECT id,title,body,metadata_json,created_at,updated_at
    FROM notes WHERE user_id=? AND tags_json LIKE ?
    ORDER BY datetime(updated_at) DESC LIMIT 100
  `).bind(user.id,`%${tag}%`).all();
  const list=rows.results||[];
  if(!subjectId)return list[0]||null;
  return list.find(r=>{
    const b=academicNoteBody(r),m=academicNoteMeta(r);
    return String(b.subject_id||m.subject_id||"")===String(subjectId);
  })||null;
}

async function academicHomeApi(env,user){
  const now=new Date(),today=now.toISOString().slice(0,10);
  const [
    profile,resume,dueCards,dueMistakes,deadlineRows,weakRows,weekRows,semesterRow,diagnosticRows
  ]=await Promise.all([
    env.DB.prepare(`SELECT * FROM profiles WHERE user_id=?`).bind(user.id).first(),
    env.DB.prepare(`
      SELECT r.*,s.name AS subject_name,t.name AS topic_name,l.title AS lesson_title
      FROM study_resume_state r
      LEFT JOIN subjects s ON s.id=r.subject_id
      LEFT JOIN topics t ON t.id=r.topic_id
      LEFT JOIN lessons l ON l.id=r.lesson_id
      WHERE r.user_id=?
    `).bind(user.id).first(),
    env.DB.prepare(`SELECT COUNT(*) AS n FROM flashcards WHERE user_id=? AND suspended=0 AND datetime(due_at)<=datetime('now')`).bind(user.id).first(),
    env.DB.prepare(`SELECT COUNT(*) AS n FROM mistakes WHERE user_id=? AND resolved=0 AND (next_review_at IS NULL OR datetime(next_review_at)<=datetime('now'))`).bind(user.id).first(),
    env.DB.prepare(`
      SELECT d.id,d.title,d.due_at,d.deadline_type,d.importance,d.subject_id,s.name AS subject_name
      FROM academic_deadlines d LEFT JOIN subjects s ON s.id=d.subject_id
      WHERE d.user_id=? AND d.completed=0 AND datetime(d.due_at)>=datetime('now')
      ORDER BY datetime(d.due_at) ASC LIMIT 8
    `).bind(user.id).all(),
    env.DB.prepare(`
      SELECT p.topic_id,p.mastery,p.questions_answered,p.questions_correct,p.last_studied_at,
             t.name AS topic_name,t.subject_id,s.name AS subject_name
      FROM user_topic_progress p
      JOIN topics t ON t.id=p.topic_id JOIN subjects s ON s.id=t.subject_id
      WHERE p.user_id=? AND p.questions_answered>0
      ORDER BY p.mastery ASC, datetime(p.last_studied_at) ASC LIMIT 12
    `).bind(user.id).all(),
    env.DB.prepare(`
      SELECT metric_date,study_seconds,questions_answered,questions_correct,flashcards_reviewed,xp_earned
      FROM daily_metrics WHERE user_id=? AND metric_date>=date('now','-14 day')
      ORDER BY metric_date DESC
    `).bind(user.id).all(),
    latestAcademicNote(env,user,"semester_v30"),
    env.DB.prepare(`
      SELECT id,title,body,metadata_json,updated_at FROM notes
      WHERE user_id=? AND tags_json LIKE '%diagnostic_v30%'
      ORDER BY datetime(updated_at) DESC LIMIT 30
    `).bind(user.id).all()
  ]);

  const semester=semesterRow?academicNoteBody(semesterRow):null;
  const activeSubjects=new Set(Array.isArray(semester?.subject_ids)?semester.subject_ids:[]);
  const allDeadlines=deadlineRows.results||[];
  const deadlines=activeSubjects.size?allDeadlines.filter(x=>!x.subject_id||activeSubjects.has(x.subject_id)):allDeadlines;
  const nextDeadline=deadlines[0]||allDeadlines[0]||null;
  const allWeak=weakRows.results||[];
  const weak=activeSubjects.size?allWeak.filter(x=>activeSubjects.has(x.subject_id)):allWeak;
  const diagnosticPreview=(diagnosticRows.results||[]).map(r=>({id:r.id,...academicNoteBody(r),updated_at:r.updated_at}));
  const dueF=Number(dueCards?.n||0),dueM=Number(dueMistakes?.n||0);
  const week=weekRows.results||[];
  const studyToday=week.find(x=>x.metric_date===today);
  const weekMinutes=Math.round(week.filter(x=>{
    const d=new Date(`${x.metric_date}T12:00:00Z`);
    return (now-d)<=7*86400000;
  }).reduce((s,x)=>s+Number(x.study_seconds||0),0)/60);

  const studiedDates=new Set(week.filter(x=>Number(x.study_seconds||0)>0).map(x=>x.metric_date));
  let streak=0;
  for(let i=0;i<30;i++){
    const d=new Date(now.getTime()-i*86400000).toISOString().slice(0,10);
    if(studiedDates.has(d))streak++;
    else if(i===0)continue;
    else break;
  }

  let recommendation={
    title:resume?.topic_name||resume?.subject_name||"Empieza una materia",
    subject_id:resume?.subject_id||null,
    subject_name:resume?.subject_name||"",
    detail:resume?.lesson_title||"Continúa tu ruta académica.",
    reason:"continuidad",
    minutes:25,
    action:"study"
  };
  const lowDiagnostic=diagnosticPreview.find(x=>(!activeSubjects.size||activeSubjects.has(x.subject_id))&&Number(x.percentage||0)<70);
  if(!weak.length&&lowDiagnostic){
    recommendation={
      title:lowDiagnostic.recommendations?.[0]?.skill||lowDiagnostic.subject_name||"Fundamentos",
      subject_id:lowDiagnostic.subject_id||null,
      subject_name:lowDiagnostic.subject_name||"",
      detail:`Tu diagnóstico fue ${Math.round(Number(lowDiagnostic.percentage||0))}%. Conviene reforzar esta base antes de avanzar.`,
      reason:"diagnóstico inicial",
      minutes:30,
      action:"study"
    };
  }
  if(nextDeadline){
    const days=Math.max(0,Math.ceil((new Date(nextDeadline.due_at)-now)/86400000));
    if(days<=14){
      recommendation={
        title:nextDeadline.subject_name||nextDeadline.title,
        subject_id:nextDeadline.subject_id||null,
        subject_name:nextDeadline.subject_name||"",
        detail:`${nextDeadline.title} · ${days===0?"hoy":days===1?"mañana":`en ${days} días`}`,
        reason:"parcial próximo",
        minutes:days<=3?45:35,
        action:"exam_prep"
      };
    }
  }
  if(dueM>=4&&(!nextDeadline||new Date(nextDeadline.due_at)-now>2*86400000)){
    recommendation={
      title:weak[0]?.topic_name||"Repaso de errores",
      subject_id:weak[0]?.subject_id||null,
      subject_name:weak[0]?.subject_name||"",
      detail:`Tienes ${dueM} errores listos para repasar.`,
      reason:"debilidad detectada",
      minutes:20,
      action:"smart"
    };
  }

  const missionTasks=[];
  if(dueF)missionTasks.push({id:"flashcards",title:`Repasar ${Math.min(10,dueF)} flashcards`,view:"flashcards",minutes:8});
  if(dueM)missionTasks.push({id:"mistakes",title:`Corregir ${Math.min(4,dueM)} errores`,view:"smart",minutes:10});
  missionTasks.push({id:"focus",title:`Estudiar ${recommendation.title}`,view:recommendation.action||"study",subject_id:recommendation.subject_id||null,minutes:recommendation.minutes||25});
  missionTasks.push({id:"questions",title:"Responder 10 preguntas de recuperación activa",view:"question_bank",minutes:12});
  const missionMinutes=missionTasks.reduce((s,x)=>s+Number(x.minutes||0),0);

  const diagnostics=diagnosticPreview;

  return json({
    profile,recommendation,
    mission:{date:today,minutes:missionMinutes,tasks:missionTasks},
    due_flashcards:dueF,due_mistakes:dueM,
    next_deadline:nextDeadline,deadlines,
    weak_topics:weak,
    week_minutes:weekMinutes,today_minutes:Math.round(Number(studyToday?.study_seconds||0)/60),
    streak_days:streak,
    semester,
    latest_diagnostics:diagnostics.slice(0,12)
  });
}

async function academicSemesterApi(request,env,user,method){
  if(method==="GET"){
    const rows=await env.DB.prepare(`
      SELECT id,title,body,metadata_json,created_at,updated_at FROM notes
      WHERE user_id=? AND tags_json LIKE '%semester_v30%'
      ORDER BY datetime(updated_at) DESC LIMIT 20
    `).bind(user.id).all();
    return json({semesters:(rows.results||[]).map(r=>({id:r.id,...academicNoteBody(r),created_at:r.created_at,updated_at:r.updated_at}))});
  }

  const body=await readJson(request);
  const name=cleanText(body.name,220),startDate=cleanText(body.start_date,30),endDate=cleanText(body.end_date,30);
  const subjectIds=Array.isArray(body.subject_ids)?[...new Set(body.subject_ids.map(x=>cleanText(x,220)).filter(Boolean))].slice(0,30):[];
  if(!name)return json({error:"Escribe el nombre del semestre."},400);
  const subjects=subjectIds.length?await env.DB.prepare(`
    SELECT id,code,name FROM subjects WHERE active=1
  `).all():{results:[]};
  const selected=(subjects.results||[]).filter(s=>subjectIds.includes(s.id));
  const payload={
    version:30,semester_v30:true,name,start_date:startDate||null,end_date:endDate||null,
    subject_ids:selected.map(s=>s.id),
    subjects:selected.map(s=>({id:s.id,code:s.code,name:s.name})),
    goal:cleanText(body.goal,1200),
    active:body.active!==false
  };
  const now=new Date().toISOString(),id=cleanText(body.id,220)||crypto.randomUUID();
  const existing=body.id?await env.DB.prepare(`SELECT id FROM notes WHERE id=? AND user_id=? AND tags_json LIKE '%semester_v30%'`).bind(id,user.id).first():null;
  if(existing){
    await env.DB.prepare(`UPDATE notes SET title=?,body=?,metadata_json=?,updated_at=?,sync_version=sync_version+1 WHERE id=? AND user_id=?`)
      .bind(`SEMESTRE · ${name}`,JSON.stringify(payload),JSON.stringify({semester_v30:true,name,active:payload.active}),now,id,user.id).run();
  }else{
    await env.DB.prepare(`
      INSERT INTO notes(id,user_id,subject_id,topic_id,title,body,tags_json,pinned,metadata_json,sync_version,created_at,updated_at)
      VALUES(?,?,NULL,NULL,?,?,?,0,?,1,?,?)
    `).bind(id,user.id,`SEMESTRE · ${name}`,JSON.stringify(payload),JSON.stringify(["semester_v30","academic_v30"]),JSON.stringify({semester_v30:true,name,active:payload.active}),now,now).run();
  }
  return json({ok:true,id,semester:payload});
}

async function academicDiagnosticStartApi(request,env,user){
  ensureAI(env);
  const body=await readJson(request),subjectId=cleanText(body.subject_id,220);
  if(!subjectId)return json({error:"Selecciona una materia."},400);
  const subject=await env.DB.prepare(`SELECT id,code,name FROM subjects WHERE id=? AND active=1`).bind(subjectId).first();
  if(!subject)return json({error:"Materia no encontrada."},404);
  const diagnosticLanguage=normalizeCourseLanguage(body.language||"en-US");
  const diagnosticLanguageNames={"he-IL":"Hebreo","la":"Latín","en-US":"Inglés","ru-RU":"Ruso","fr-FR":"Francés"};
  const subjectLabel=subject.code==="LANG"?`Idiomas · ${diagnosticLanguageNames[diagnosticLanguage]||"Inglés"}`:subject.name;
  const topics=await env.DB.prepare(`
    SELECT id,name,description FROM topics
    WHERE subject_id=? AND active=1
    ORDER BY sort_order,name LIMIT 40
  `).bind(subjectId).all();
  const topicNames=(topics.results||[]).map(x=>x.name).slice(0,24);
  const prompt=`Crea un diagnóstico académico de 20 preguntas para "${subjectLabel}".
Distribuye las preguntas entre estos temas cuando sean pertinentes:
${topicNames.map((x,i)=>`${i+1}. ${x}`).join("\n")}

OBJETIVO:
- Detectar conocimientos previos.
- Mezclar fundamentos, comprensión y aplicación.
- Evitar contenido excesivamente avanzado si la materia empieza desde fundamentos.
- Cada pregunta debe tener 4 opciones, una correcta, explicación y una habilidad/tema evaluado.

Devuelve SOLO JSON:
{"questions":[{"stem":"...","options":["...","...","...","..."],"correctIndex":0,"explanation":"...","skill":"nombre del tema evaluado"}]}`;

  const response=await callCloudflareAI(env,{
    model:DEFAULT_FAST_MODEL,task:"academic_diagnostic",
    messages:[
      {role:"system",content:"Eres un evaluador académico. Diseña diagnósticos equilibrados y válidos. Devuelve únicamente JSON válido."},
      {role:"user",content:prompt}
    ],
    max_tokens:4800,temperature:0.15
  });
  const parsed=parseJsonLoose(extractCloudflareText(response));
  const questions=(Array.isArray(parsed?.questions)?parsed.questions:[]).slice(0,20).map((q,i)=>({
    id:`diag_${Date.now()}_${i}`,
    stem:cleanText(q.stem,1800),
    options:Array.isArray(q.options)?q.options.slice(0,4).map(x=>cleanText(x,1000)):[],
    correctIndex:clamp(Number(q.correctIndex),0,3),
    explanation:cleanText(q.explanation,2200),
    skill:cleanText(q.skill,300)||"Fundamentos"
  })).filter(q=>q.stem&&q.options.length===4);
  if(questions.length<16)return json({error:`No pude construir un diagnóstico suficientemente completo (${questions.length}/20). Inténtalo de nuevo.`,generated:questions.length,expected:20},502);
  return json({subject:{...subject,name:subjectLabel,language:subject.code==="LANG"?diagnosticLanguage:null},questions,model:response.__model||DEFAULT_FAST_MODEL});
}

async function academicDiagnosticApi(request,env,user,method){
  if(method==="GET"){
    const url=new URL(request.url),subjectId=cleanText(url.searchParams.get("subject_id"),220);
    const rows=await env.DB.prepare(`
      SELECT id,title,body,metadata_json,updated_at FROM notes
      WHERE user_id=? AND tags_json LIKE '%diagnostic_v30%'
      ORDER BY datetime(updated_at) DESC LIMIT 80
    `).bind(user.id).all();
    let list=(rows.results||[]).map(r=>({id:r.id,...academicNoteBody(r),updated_at:r.updated_at}));
    if(subjectId)list=list.filter(x=>x.subject_id===subjectId);
    return json({diagnostics:list});
  }
  const body=await readJson(request),subjectId=cleanText(body.subject_id,220),subjectName=cleanText(body.subject_name,300);
  const questions=Array.isArray(body.questions)?body.questions.slice(0,40):[];
  const answers=body.answers&&typeof body.answers==="object"?body.answers:{};
  if(!subjectId||!questions.length)return json({error:"Diagnóstico incompleto."},400);
  let score=0;const skills=new Map();
  questions.forEach((q,i)=>{
    const chosen=Number(answers[`q${i}`]),correct=Number(q.correctIndex),ok=Number.isFinite(chosen)&&chosen===correct;
    if(ok)score++;
    const skill=cleanText(q.skill,300)||"Fundamentos";
    if(!skills.has(skill))skills.set(skill,{skill,correct:0,total:0});
    const s=skills.get(skill);s.total++;if(ok)s.correct++;
  });
  const skillScores=[...skills.values()].map(s=>({...s,percentage:Math.round(s.correct/s.total*100)})).sort((a,b)=>a.percentage-b.percentage);
  const pct=Math.round(score/questions.length*100),now=new Date().toISOString(),id=crypto.randomUUID();
  const payload={
    version:30,diagnostic_v30:true,subject_id:subjectId,subject_name:subjectName,
    score,max_score:questions.length,percentage:pct,skills:skillScores,
    recommendations:skillScores.slice(0,5).map(x=>({skill:x.skill,percentage:x.percentage})),
    completed_at:now
  };
  await env.DB.prepare(`
    INSERT INTO notes(id,user_id,subject_id,topic_id,title,body,tags_json,pinned,metadata_json,sync_version,created_at,updated_at)
    VALUES(?,?,?,NULL,?,?,?,0,?,1,?,?)
  `).bind(id,user.id,subjectId,`DIAGNÓSTICO · ${subjectName||"Materia"}`,JSON.stringify(payload),JSON.stringify(["diagnostic_v30","academic_v30"]),JSON.stringify({diagnostic_v30:true,subject_id:subjectId,percentage:pct}),now,now).run();
  return json({ok:true,id,diagnostic:payload},201);
}

async function academicCredentialsApi(env,user){
  const subjects=await env.DB.prepare(`SELECT id,code,name FROM subjects WHERE active=1 ORDER BY sort_order,name`).all();
  const progress=await env.DB.prepare(`
    SELECT t.subject_id,p.mastery,p.questions_answered,p.questions_correct
    FROM user_topic_progress p JOIN topics t ON t.id=p.topic_id
    WHERE p.user_id=?
  `).bind(user.id).all();
  const course=await env.DB.prepare(`
    SELECT t.subject_id,COUNT(*) AS total,SUM(CASE WHEN COALESCE(p.completed,0)=1 THEN 1 ELSE 0 END) AS completed
    FROM topics t JOIN lessons l ON l.topic_id=t.id AND l.active=1
    LEFT JOIN user_lesson_progress p ON p.lesson_id=l.id AND p.user_id=?
    WHERE t.active=1 AND t.id LIKE 'course_%'
    GROUP BY t.subject_id
  `).bind(user.id).all();
  const credentials=[];
  for(const s of (subjects.results||[])){
    const rows=(progress.results||[]).filter(x=>x.subject_id===s.id);
    const answered=rows.reduce((a,x)=>a+Number(x.questions_answered||0),0);
    const weightedAnswered=rows.reduce((a,x)=>a+Number(x.questions_answered||0),0);
    const weightedMastery=weightedAnswered?rows.reduce((a,x)=>a+Number(x.mastery||0)*Number(x.questions_answered||0),0)/weightedAnswered:0;
    const c=(course.results||[]).find(x=>x.subject_id===s.id);
    const coursePct=c&&Number(c.total)>0?Math.round(Number(c.completed||0)/Number(c.total)*100):0;
    const earned=coursePct===100||(answered>=30&&weightedMastery>=85);
    const progressPct=Math.max(coursePct,Math.round(weightedMastery));
    if(earned||progressPct>=50){
      credentials.push({
        subject_id:s.id,subject_name:s.name,code:s.code,
        earned,progress_percent:Math.min(100,progressPct),
        evidence:coursePct===100?`${Number(c.completed)}/${Number(c.total)} temas del curso aprobados`:`${answered} preguntas · dominio ${Math.round(weightedMastery)}%`,
        level:earned?"Dominio alcanzado":"En progreso"
      });
    }
  }
  return json({credentials});
}

async function academicExplainApi(request,env,user){
  ensureAI(env);
  const body=await readJson(request),mode=cleanText(body.mode,60),subject=cleanText(body.subject,300),topic=cleanText(body.topic,400);
  const material=cleanText(body.material,16000),question=cleanText(body.question,1000);
  const styles={
    simple:"Explícalo con lenguaje más fácil, sin perder precisión.",
    steps:"Explícalo paso a paso, sin saltos.",
    analogy:"Usa una analogía clara y luego conecta cada parte con el concepto real.",
    clinical:"Usa un ejemplo clínico educativo que ayude a comprender el mecanismo.",
    visual:"Construye un diagrama textual/visual por etapas que pueda imaginarse fácilmente.",
    university:"Explícalo con profundidad universitaria y conexiones importantes.",
    socratic:"No des toda la respuesta de inmediato. Haz 3 a 5 preguntas socráticas progresivas y agrega pistas."
  };
  const instruction=styles[mode]||styles.simple;
  const response=await callCloudflareAI(env,{
    model:PREMIUM_FLASH_MODEL,task:"academic_explain_differently",
    messages:[
      {role:"system",content:"Eres MED AI DALTON. Enseña con rigor y adapta la explicación al formato pedido. Si el contexto es medicina, recuerda que es educación y no sustituye atención clínica."},
      {role:"user",content:`Materia: ${subject}\nTema: ${topic}\nFormato: ${instruction}\n${question?`Duda del estudiante: ${question}\n`:""}\nCONTEXTO DE LA CLASE:\n${material}`}
    ],
    max_tokens:2200,temperature:0.22
  });
  return json({answer:extractCloudflareText(response),mode,model:response.__model||PREMIUM_FLASH_MODEL});
}

async function updateLibrarySourcePriorityApi(request,env,user){
  const body=await readJson(request),id=cleanText(body.file_id,220),primary=body.primary===true,subjectId=cleanText(body.subject_id,220);
  if(!id)return json({error:"Falta el archivo."},400);
  const row=await env.DB.prepare(`
    SELECT id,title,metadata_json,tags_json FROM notes
    WHERE id=? AND user_id=? AND tags_json LIKE '%library_file%' LIMIT 1
  `).bind(id,user.id).first();
  if(!row)return json({error:"Archivo no encontrado."},404);
  const meta=parseLibraryMeta(row);
  let subject=null;
  if(subjectId)subject=await env.DB.prepare(`SELECT id,name FROM subjects WHERE id=? AND active=1`).bind(subjectId).first();
  meta.primary_source_v30=primary;
  meta.primary_subject_id=primary?(subject?.id||subjectId||null):null;
  meta.primary_subject_name=primary?(subject?.name||null):null;
  meta.primary_updated_at=new Date().toISOString();
  await env.DB.prepare(`UPDATE notes SET metadata_json=?,updated_at=?,sync_version=sync_version+1 WHERE id=? AND user_id=?`)
    .bind(JSON.stringify(meta),new Date().toISOString(),id,user.id).run();
  return json({ok:true,file_id:id,primary,subject});
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
    source_signature:sourceSignature,
    generation_version:"30.0.1",
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

  return json({
    ok:true,id,title:pack.title,
    model:generationInfo?.usedModel||repairInfo?.model||PREMIUM_FLASH_MODEL,
    generation_ms:Date.now()-generationStartedAt,
    repaired:!!repairInfo
  },201);
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

  const fileTargets=targets.filter(r=>libraryRowType(r)==="file");
  const r2Keys=fileTargets.map(r=>parseLibraryMeta(r).r2_key).filter(Boolean);
  if(r2Keys.length){
    // Remove original objects plus private extraction/transcription sidecars.
    const objects=[];
    for(const key of r2Keys)objects.push(key,`${key}.medai-v24.txt`,`${key}.medai-v29.txt`,`${key}.medai-v29-transcript.txt`);
    for(let i=0;i<objects.length;i+=1000){
      await env.LIBRARY.delete(objects.slice(i,i+1000)).catch(()=>{});
    }
  }
  // Remove search-index chunks that belonged to deleted source files.
  const fileIds=new Set(fileTargets.map(r=>r.id));
  if(fileIds.size){
    const chunks=await env.DB.prepare(`SELECT id,metadata_json FROM notes WHERE user_id=? AND tags_json LIKE '%source_chunk_v29%' LIMIT 5000`).bind(user.id).all().catch(()=>({results:[]}));
    const chunkIds=(chunks.results||[]).filter(r=>fileIds.has((parseJsonLoose(r.metadata_json)||{}).source_file_id)).map(r=>r.id);
    for(let i=0;i<chunkIds.length;i+=100){
      const part=chunkIds.slice(i,i+100),qs=part.map(()=>"?").join(",");
      await env.DB.prepare(`DELETE FROM notes WHERE user_id=? AND id IN (${qs})`).bind(user.id,...part).run();
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


function markdownConversionText(result){
  if(typeof result==="string")return result;
  if(typeof result?.data==="string")return result.data;
  if(typeof result?.result?.data==="string")return result.result.data;
  if(Array.isArray(result?.results)){
    return result.results.map(x=>typeof x?.data==="string"?x.data:"").filter(Boolean).join("\n\n");
  }
  if(Array.isArray(result)){
    return result.map(x=>typeof x?.data==="string"?x.data:"").filter(Boolean).join("\n\n");
  }
  return "";
}


async function getLibraryFileRow(env,user,fileId){
  const row=await env.DB.prepare(`
    SELECT id,title,metadata_json,tags_json,updated_at FROM notes
    WHERE id=? AND user_id=? AND tags_json LIKE '%library_file%' LIMIT 1
  `).bind(fileId,user.id).first();
  if(!row)throw new Error("No encontré ese archivo en tu Biblioteca.");
  const meta=parseLibraryMeta(row);
  if(!meta.r2_key)throw new Error("El archivo no tiene referencia R2.");
  return {row,meta};
}

function sourceLocatorBlocks(text,name="Documento"){
  const raw=String(text||"").replace(/\r/g,"").trim();
  if(!raw)return [];
  // First honor explicit page/slide separators when conversion preserved them.
  const pagePattern=/(?:^|\n)(?:#{0,3}\s*)?(?:p[aá]gina|page|diapositiva|slide)\s+(\d+)[^\n]*\n/gi;
  const matches=[...raw.matchAll(pagePattern)];
  const blocks=[];
  if(matches.length){
    for(let i=0;i<matches.length;i++){
      const start=matches[i].index+matches[i][0].length;
      const end=i+1<matches.length?matches[i+1].index:raw.length;
      const chunk=raw.slice(start,end).trim();
      if(chunk.length>40)blocks.push({
        locator:`${/slide|diapositiva/i.test(matches[i][0])?"diapositiva":"pág."} ${matches[i][1]}`,
        text:chunk.slice(0,7000),precision:"exact_marker"
      });
    }
    if(blocks.length)return blocks.slice(0,160);
  }
  // Form-feed often survives PDF extraction and is a reliable page boundary.
  const pages=raw.split(/\f+/).map(x=>x.trim()).filter(x=>x.length>40);
  if(pages.length>1){
    return pages.slice(0,160).map((text,i)=>({locator:`pág. ${i+1}`,text:text.slice(0,7000),precision:"page_break"}));
  }
  // Never invent a page number when extraction lost pagination.
  const size=4200,overlap=350;
  for(let start=0,n=1;start<raw.length&&blocks.length<160;start+=size-overlap,n++){
    const chunk=raw.slice(start,start+size).trim();
    if(chunk.length>40)blocks.push({locator:`bloque ${n}`,text:chunk,precision:"block"});
  }
  return blocks;
}

async function libraryExtractTextCore(env,user,fileId,{allowLowQuality=false}={}){
  requireLibraryR2(env);
  const {row,meta}=await getLibraryFileRow(env,user,fileId);
  const name=meta.original_name||row.title||"documento";
  const mime=meta.mime_type||"application/octet-stream";
  const sidecar=`${meta.r2_key}.medai-v29.txt`;
  const oldSidecar=`${meta.r2_key}.medai-v24.txt`;

  for(const key of [sidecar,oldSidecar]){
    const cached=await env.LIBRARY.get(key);
    if(cached){
      const text=String(await cached.text()).trim();
      // A sparse legacy PDF sidecar should not prevent the V29 OCR-oriented retry.
      if(text && (text.length>=160 || key===sidecar || !/\.pdf$/i.test(name))){
        return {text,row,meta,cached:true,low_quality:text.length<120,engine:key===sidecar?"v29":"legacy"};
      }
    }
  }

  const object=await env.LIBRARY.get(meta.r2_key);
  if(!object)throw new Error("El archivo no está disponible en R2.");
  let text="",engine="document-conversion";

  if(mime.startsWith("text/")||/\.(txt|md|rtf)$/i.test(name)){
    text=await object.text();engine="text";
  }else if(mime.startsWith("image/")||/\.(png|jpe?g|webp)$/i.test(name)){
    ensureAI(env);
    const buffer=await object.arrayBuffer();
    if(buffer.byteLength>7_000_000)throw new Error("La imagen supera 7 MB. Reduce su tamaño antes de ejecutar OCR.");
    const dataUrl=`data:${mime||"image/jpeg"};base64,${bytesToBase64Standard(new Uint8Array(buffer))}`;
    const model=env.CLOUDFLARE_VISION_MODEL||DEFAULT_VISION_MODEL;
    const response=await env.AI.run(model,{
      messages:[
        {role:"system",content:"Realiza OCR académico fiel. Transcribe todo el texto legible, tablas, encabezados, opciones y numeración. No inventes contenido."},
        {role:"user",content:[
          {type:"image_url",image_url:{url:dataUrl}},
          {type:"text",text:"Transcribe fielmente esta imagen para estudio. Conserva estructura y numeración. Devuelve solo el texto extraído."}
        ]}
      ],
      max_tokens:5200,temperature:0.03,chat_template_kwargs:{enable_thinking:false}
    },gatewayOptions("library_ocr_image",{model_used:model}));
    text=extractCloudflareText(response);engine="vision-ocr";
  }else{
    const allowed=[
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.oasis.opendocument.text",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    ];
    if(!allowed.includes(mime)&&!/\.(pdf|docx|odt|pptx)$/i.test(name)){
      throw new Error("Este formato no admite OCR/indexación documental directa.");
    }
    if(!env.AI?.toMarkdown)throw new Error("La conversión documental de Workers AI no está disponible.");
    const buffer=await object.arrayBuffer(),input={name,blob:new Blob([buffer],{type:mime})};
    const normal={conversionOptions:{output:{format:"text"},pdf:{metadata:false}}};
    const ocr={conversionOptions:{output:{format:"text"},pdf:{metadata:false,ocr:true}}};
    let converted=null,firstErr=null;
    try{
      const converter=env.AI.toMarkdown();
      converted=converter&&typeof converter.transform==="function"?await converter.transform(input,normal):await env.AI.toMarkdown(input,normal);
    }catch(err){firstErr=err}
    text=String(markdownConversionText(converted)||"").trim();
    // A second OCR-oriented conversion is attempted only when the first extraction is sparse.
    if(text.length<160&&/\.pdf$/i.test(name)){
      try{
        const converter=env.AI.toMarkdown();
        const second=converter&&typeof converter.transform==="function"?await converter.transform(input,ocr):await env.AI.toMarkdown(input,ocr);
        const candidate=String(markdownConversionText(second)||"").trim();
        if(candidate.length>text.length){text=candidate;engine="document-conversion-ocr"}
      }catch(err){if(!firstErr)firstErr=err}
    }
    if(!text&&firstErr)throw firstErr;
  }

  text=String(text||"").trim();
  const lowQuality=text.length<120;
  if(lowQuality&&!allowLowQuality){
    throw new Error("No pude extraer suficiente texto. Si es un escaneo muy borroso, prueba con una imagen/foto más clara o páginas separadas.");
  }
  if(text){
    await env.LIBRARY.put(sidecar,text,{
      httpMetadata:{contentType:"text/plain; charset=utf-8"},
      customMetadata:{source_file_id:fileId,user_id:user.id,medai:"v29-extracted-text",engine}
    });
  }
  return {text,row,meta,cached:false,low_quality:lowQuality,engine};
}

async function replaceV29SourceChunks(env,user,fileId,sourceName,blocks){
  const old=await env.DB.prepare(`
    SELECT id,metadata_json FROM notes WHERE user_id=? AND tags_json LIKE '%source_chunk_v29%' LIMIT 1000
  `).bind(user.id).all();
  const deletes=(old.results||[]).filter(r=>(parseJsonLoose(r.metadata_json)||{}).source_file_id===fileId)
    .map(r=>env.DB.prepare("DELETE FROM notes WHERE id=? AND user_id=?").bind(r.id,user.id));
  if(deletes.length)await env.DB.batch(deletes);

  const now=new Date().toISOString(),statements=[];
  for(let i=0;i<Math.min(160,blocks.length);i++){
    const b=blocks[i],id=`src29_${await sha256(`${user.id}|${fileId}|${b.locator}|${i}`)}`;
    const meta={source_chunk_v29:true,source_file_id:fileId,source_name:sourceName,locator:b.locator,precision:b.precision,chunk_index:i};
    statements.push(env.DB.prepare(`
      INSERT OR REPLACE INTO notes
      (id,user_id,subject_id,topic_id,title,body,tags_json,pinned,metadata_json,sync_version,created_at,updated_at)
      VALUES (?,?,?,?,?,?,?,0,?,1,?,?)
    `).bind(id,user.id,null,null,`${sourceName} · ${b.locator}`,b.text,JSON.stringify(["source_chunk_v29","library_source","v29"]),JSON.stringify(meta),now,now));
  }
  for(let i=0;i<statements.length;i+=40)await env.DB.batch(statements.slice(i,i+40));
  return statements.length;
}

async function libraryOcrIndexApi(request,env,user){
  const body=await readJson(request),fileId=cleanText(body.file_id,220);
  if(!fileId)return json({error:"Falta el archivo."},400);
  const extracted=await libraryExtractTextCore(env,user,fileId,{allowLowQuality:true});
  if(String(extracted.text||"").trim().length<40){
    return json({error:"No pude obtener texto útil de este archivo. El escaneo puede estar demasiado borroso."},422);
  }
  const name=extracted.meta.original_name||extracted.row.title||"Documento";
  const blocks=sourceLocatorBlocks(extracted.text,name);
  const indexed=await replaceV29SourceChunks(env,user,fileId,name,blocks);
  const exact=blocks.filter(x=>x.precision!=="block").length;
  return json({
    ok:true,file_id:fileId,source_name:name,indexed_blocks:indexed,
    exact_locators:exact,approximate_blocks:indexed-exact,
    engine:extracted.engine,cached:extracted.cached,low_quality:extracted.low_quality,
    message:exact?`Se conservaron ${exact} localizadores de página/diapositiva detectables.`:"La extracción perdió la paginación; MED AI citará bloques y no inventará páginas."
  });
}

async function extractLibraryDocument(request,env,user){
  const body=await readJson(request);
  const fileId=cleanText(body.file_id,220);
  if(!fileId)return json({error:"Falta el archivo."},400);
  try{
    const d=await libraryExtractTextCore(env,user,fileId);
    return json({ok:true,text:d.text,cached:d.cached,engine:d.engine,low_quality:d.low_quality});
  }catch(err){
    return json({error:String(err?.message||err)},422);
  }
}

async function listLibraryStudyPacks(url,env,user){
  const fileId=cleanText(url.searchParams.get("file_id"),220);
  if(!fileId)return json({packs:[]});
  const rows=await env.DB.prepare(`
    SELECT id,title,metadata_json,created_at,updated_at
    FROM notes
    WHERE user_id=? AND tags_json LIKE '%library_study_pack%'
    ORDER BY datetime(updated_at) DESC LIMIT 300
  `).bind(user.id).all();
  const packs=(rows.results||[]).filter(row=>{
    const meta=parseJsonLoose(row.metadata_json)||{};
    return meta.source_file_id===fileId;
  });
  return json({packs});
}




function promiseTimeout(promise,ms,label="operación"){
  let timer;
  const timeout=new Promise((_,reject)=>{
    timer=setTimeout(()=>{
      const err=new Error(`${label} superó ${Math.round(ms/1000)} segundos.`);
      err.code="MEDAI_TIMEOUT";
      reject(err);
    },ms);
  });
  return Promise.race([promise,timeout]).finally(()=>clearTimeout(timer));
}

async function callLibraryStructuredJson(env,{task,system,prompt,maxOutputTokens=7000,temperature=0.10,profile="normal"}){
  ensureAI(env);
  let lastErr=null,raw=null,parsed=null,usedModel=null,shape="";
  const repairMode=profile==="repair";
  const geminiTimeout=repairMode?28000:50000;
  const workerTimeout=repairMode?18000:25000;
  const fallbackModels=repairMode?[WORKERS_FAST_MODEL]:[WORKERS_FAST_MODEL,WORKERS_TEXT_MODEL];

  try{
    raw=await promiseTimeout(
      env.AI.run(
        PREMIUM_FLASH_MODEL,
        {
          contents:[{role:"user",parts:[{text:prompt}]}],
          systemInstruction:{parts:[{text:system}]},
          generationConfig:{
            temperature,
            maxOutputTokens,
            responseMimeType:"application/json"
          }
        },
        gatewayOptions(task,{
          model_requested:PREMIUM_FLASH_MODEL,
          model_used:PREMIUM_FLASH_MODEL,
          format:"gemini_native_json"
        })
      ),
      geminiTimeout,
      "Gemini 2.5 Flash"
    );
    usedModel=PREMIUM_FLASH_MODEL;
    parsed=parseAIJsonResponse(raw);
    shape=Array.isArray(raw?.candidates)?"gemini_candidates":
      Array.isArray(raw?.result?.candidates)?"wrapped_gemini_candidates":
      Array.isArray(raw?.choices)?"choices":
      typeof raw?.response==="string"?"response_string":
      raw&&typeof raw==="object"?Object.keys(raw).slice(0,8).join(","):"empty";
    if(parsed)return {parsed,raw,usedModel,shape};
  }catch(err){
    lastErr=err;
    console.error("LIBRARY_GEMINI_NATIVE_JSON_ERROR",err?.stack||err);
  }

  for(const model of fallbackModels){
    try{
      raw=await promiseTimeout(
        env.AI.run(
          model,
          {
            messages:[
              {role:"system",content:system+"\nDevuelve únicamente JSON válido, sin Markdown ni texto antes o después."},
              {role:"user",content:prompt}
            ],
            max_tokens:Math.min(maxOutputTokens,repairMode?3600:4800),
            temperature,
            chat_template_kwargs:{enable_thinking:false}
          },
          gatewayOptions(task,{
            model_requested:PREMIUM_FLASH_MODEL,
            model_used:model,
            format:"workers_json_fallback"
          })
        ),
        workerTimeout,
        model
      );
      usedModel=model;
      parsed=parseAIJsonResponse(raw);
      shape=Array.isArray(raw?.choices)?"choices":
        typeof raw?.response==="string"?"response_string":
        raw&&typeof raw==="object"?Object.keys(raw).slice(0,8).join(","):"empty";
      if(parsed)return {parsed,raw,usedModel,shape};
    }catch(err){
      lastErr=err;
      console.error("LIBRARY_WORKERS_JSON_FALLBACK_ERROR",model,err?.stack||err);
    }
  }

  if(lastErr){
    if(lastErr?.code==="MEDAI_TIMEOUT"){
      const err=new Error(repairMode
        ?"La reparación automática tardó demasiado y fue detenida."
        :"Los modelos tardaron demasiado en crear esta sesión. MED AI detuvo la espera y probó sus respaldos para evitar una espera infinita.");
      err.code="MEDAI_TIMEOUT";
      throw err;
    }
    throw lastErr;
  }
  return {parsed:null,raw,usedModel,shape};
}


async function callLibraryPartJson(env,{
  task,model=PREMIUM_FLASH_LITE_MODEL,system,prompt,
  maxOutputTokens=2600,temperature=0.08,providerTimeout=32000,fallbackTimeout=18000
}){
  ensureAI(env);
  let primaryError=null,raw=null,parsed=null;

  try{
    raw=await promiseTimeout(
      env.AI.run(
        model,
        {
          contents:[{role:"user",parts:[{text:prompt}]}],
          systemInstruction:{parts:[{text:system}]},
          generationConfig:{
            temperature,
            maxOutputTokens,
            responseMimeType:"application/json"
          }
        },
        gatewayOptions(task,{
          model_requested:model,
          model_used:model,
          format:"library_parallel_json"
        })
      ),
      providerTimeout,
      model
    );
    parsed=parseAIJsonResponse(raw);
    if(parsed)return {parsed,model,source:"primary"};
  }catch(err){
    primaryError=err;
    console.error("LIBRARY_PARALLEL_PRIMARY_ERROR",task,model,err?.stack||err);
  }

  // One small Workers AI fallback. We do not chain several long providers:
  // each component must finish quickly or fail explicitly.
  try{
    raw=await promiseTimeout(
      env.AI.run(
        WORKERS_FAST_MODEL,
        {
          messages:[
            {role:"system",content:system+"\nDevuelve exclusivamente JSON válido, sin Markdown."},
            {role:"user",content:prompt}
          ],
          max_tokens:Math.min(maxOutputTokens,3200),
          temperature,
          chat_template_kwargs:{enable_thinking:false}
        },
        gatewayOptions(task,{
          model_requested:model,
          model_used:WORKERS_FAST_MODEL,
          format:"library_parallel_workers_fallback"
        })
      ),
      fallbackTimeout,
      WORKERS_FAST_MODEL
    );
    parsed=parseAIJsonResponse(raw);
    if(parsed)return {parsed,model:WORKERS_FAST_MODEL,source:"fallback"};
  }catch(err){
    console.error("LIBRARY_PARALLEL_FALLBACK_ERROR",task,err?.stack||err);
    const finalErr=new Error(
      primaryError?.code==="MEDAI_TIMEOUT"||err?.code==="MEDAI_TIMEOUT"
        ? `La parte “${task}” tardó demasiado incluso con el respaldo rápido.`
        : `No pude generar la parte “${task}”.`
    );
    finalErr.code="LIBRARY_PART_FAILED";
    finalErr.task=task;
    finalErr.primary=String(primaryError?.message||"");
    finalErr.fallback=String(err?.message||"");
    throw finalErr;
  }

  const err=new Error(`La parte “${task}” no devolvió JSON utilizable.`);
  err.code="LIBRARY_PART_INVALID";
  err.task=task;
  throw err;
}


function sanitizeLibrarySimplePack(parsed,row,body){
  const rawDiagrams=Array.isArray(parsed?.diagrams)?parsed.diagrams:(parsed?.diagram?[parsed.diagram]:[]);
  const diagrams=rawDiagrams.slice(0,3).map((d,i)=>({
    title:cleanText(d?.title,360)||`Diagrama ${i+1}`,
    type:cleanText(d?.type,80)||"relación",
    caption:cleanText(d?.caption,1400),
    steps:Array.isArray(d?.steps)?d.steps.slice(0,10).map(s=>({
      label:cleanText(s?.label,360),
      detail:cleanText(s?.detail,1500),
      relation:cleanText(s?.relation,180)
    })).filter(s=>s.label):[]
  })).filter(d=>d.steps.length>=2);

  const branches=Array.isArray(parsed?.concept_map?.branches)?parsed.concept_map.branches.slice(0,10).map(b=>({
    label:cleanText(b?.label,360),
    summary:cleanText(b?.summary,1000),
    children:Array.isArray(b?.children)?b.children.slice(0,8).map(x=>{
      if(typeof x==="string")return {label:cleanText(x,500),detail:""};
      return {label:cleanText(x?.label,500),detail:cleanText(x?.detail,900)};
    }).filter(x=>x.label):[]
  })).filter(b=>b.label):[];

  const summarySections=(Array.isArray(parsed?.summary?.sections)?parsed.summary.sections:[]).slice(0,24).map((s,i)=>({
    title:cleanText(s?.title,420)||`Sección ${i+1}`,
    page_refs:Array.isArray(s?.page_refs)?s.page_refs.map(Number).filter(Number.isFinite).slice(0,12):[],
    summary:cleanText(s?.summary,5200),
    key_points:Array.isArray(s?.key_points)?s.key_points.slice(0,10).map(x=>cleanText(x,1000)).filter(Boolean):[],
    important_data:Array.isArray(s?.important_data)?s.important_data.slice(0,10).map(x=>cleanText(x,1000)).filter(Boolean):[]
  })).filter(s=>s.summary||s.key_points.length||s.important_data.length);

  const summary={
    overview:cleanText(parsed?.summary?.overview||parsed?.overview,6500),
    sections:summarySections,
    must_remember:Array.isArray(parsed?.summary?.must_remember)?parsed.summary.must_remember.slice(0,18).map(x=>cleanText(x,1100)).filter(Boolean):[],
    final_synthesis:cleanText(parsed?.summary?.final_synthesis,3800)
  };

  if(!summary.overview||!branches.length||!diagrams.length)return null;

  return {
    version:30.07,
    university_source:true,
    library_study_pack:true,
    library_simple_v30:true,
    library_rich_summary_v30:true,
    title:cleanText(parsed?.title,420)||body.source_name||row.topic_name,
    overview:cleanText(parsed?.overview,3600)||summary.overview,
    estimated_minutes:clamp(Number(parsed?.estimated_minutes||25),5,120),
    source_digest:cleanText(parsed?.source_digest,22000),
    key_terms:Array.isArray(parsed?.key_terms)?parsed.key_terms.slice(0,30).map(x=>cleanText(x,420)).filter(Boolean):[],
    summary,
    diagrams,
    diagram:diagrams[0],
    concept_map:{
      center:cleanText(parsed?.concept_map?.center,360)||row.topic_name,
      overview:cleanText(parsed?.concept_map?.overview,1600),
      branches
    },
    sections:[],objectives:[],exam_focus:[],practice:[],exam:[],video_searches:[],
    source_reference:{
      type:cleanText(body.source_type,30),
      name:cleanText(body.source_name,300),
      mime_type:cleanText(body.mime_type,120),
      imported_at:new Date().toISOString()
    }
  };
}
function validateLibrarySimplePackAgainstSource(pack,map,sourceText){
  const names=sourceLockNames(map).map(normalizeSourceLockText).filter(Boolean);
  const headingNames=(map?.headings||[]).map(x=>normalizeSourceLockText(x.title)).filter(Boolean);
  const generated=[
    pack?.title,pack?.overview,pack?.summary?.overview,pack?.summary?.final_synthesis,
    ...(pack?.summary?.must_remember||[]),
    ...(pack?.summary?.sections||[]).flatMap(s=>[s.title,s.summary,...(s.key_points||[]),...(s.important_data||[])]),
    ...(pack?.key_terms||[]),
    ...(pack?.diagrams||[]).flatMap(d=>[d.title,d.caption,...(d.steps||[]).flatMap(s=>[s.label,s.detail,s.relation])]),
    pack?.concept_map?.center,pack?.concept_map?.overview,
    ...(pack?.concept_map?.branches||[]).flatMap(b=>[b.label,b.summary,...(b.children||[]).flatMap(x=>[x.label,x.detail])])
  ].filter(Boolean).join(" ");

  const norm=normalizeSourceLockText(generated);
  const found=names.filter(n=>n&&norm.includes(n)).length;
  const recall=names.length?found/names.length:1;
  const headingFound=headingNames.filter(n=>n&&norm.includes(n)).length;
  const headingRecall=headingNames.length?headingFound/headingNames.length:1;
  const coverage=sourceLockCoverage(sourceText,generated);

  return {
    ok:recall>=(names.length<=2?1:0.6) && headingRecall>=(headingNames.length<=6?0.95:0.78) && coverage>=0.10,
    topic_recall:recall,
    heading_recall:headingRecall,
    lexical_coverage:coverage,
    missing_topics:names.filter(n=>!norm.includes(n)).slice(0,12),
    missing_headings:headingNames.filter(n=>!norm.includes(n)).slice(0,12)
  };
}

function libraryParallelCoreValid(p){
  const sections=Array.isArray(p?.sections)?p.sections.filter(x=>x?.title&&(x?.content||x?.explanation)).length:0;
  return sections>=3 && !!(p?.title||p?.overview);
}
function libraryParallelPracticeValid(p){
  const q=Array.isArray(p?.practice)?p.practice.filter(x=>x&&(x.question||x.stem)&&Array.isArray(x.options)&&x.options.length===4):[];
  return q.length>=8;
}
function libraryParallelExamValid(p){
  const q=Array.isArray(p?.exam)?p.exam.filter(x=>x&&(x.stem||x.question)&&Array.isArray(x.options)&&x.options.length===4):[];
  return q.length>=10;
}

async function retryLibraryPartFast(env,{task,system,prompt,maxOutputTokens=2600}){
  let raw;
  try{
    raw=await promiseTimeout(
      env.AI.run(
        WORKERS_FAST_MODEL,
        {
          messages:[
            {role:"system",content:system+"\nDevuelve SOLO JSON válido. Cumple exactamente las cantidades solicitadas."},
            {role:"user",content:prompt}
          ],
          max_tokens:Math.min(maxOutputTokens,3200),
          temperature:0.04,
          chat_template_kwargs:{enable_thinking:false}
        },
        gatewayOptions(`${task}_retry`,{
          model_requested:WORKERS_FAST_MODEL,
          model_used:WORKERS_FAST_MODEL,
          format:"library_parallel_retry"
        })
      ),
      16000,
      WORKERS_FAST_MODEL
    );
    const parsed=parseAIJsonResponse(raw);
    if(parsed)return {parsed,model:WORKERS_FAST_MODEL,source:"retry"};
  }catch(err){
    console.error("LIBRARY_PART_RETRY_ERROR",task,err?.stack||err);
  }
  return null;
}

function libraryPackRequiredCounts(parsed){
  const sections=Array.isArray(parsed?.sections)?parsed.sections.filter(x=>x&&x.title&&(x.content||x.explanation)).length:0;
  const practice=Array.isArray(parsed?.practice)?parsed.practice.filter(x=>x&&(x.question||x.stem)&&Array.isArray(x.options)&&x.options.length>=4).length:0;
  const exam=Array.isArray(parsed?.exam)?parsed.exam.filter(x=>x&&(x.stem||x.question)&&Array.isArray(x.options)&&x.options.length>=4).length:0;
  return {sections,practice,exam};
}

function mergeLibraryPackRepair(base,repair){
  const out=(base&&typeof base==="object")?structuredClone(base):{};
  if(repair&&typeof repair==="object"){
    for(const key of ["title","overview","estimated_minutes","source_digest","objectives","key_terms","exam_focus","diagram","concept_map","summary","video_searches"]){
      if((out[key]===undefined||out[key]===null||out[key]===""||(Array.isArray(out[key])&&!out[key].length))&&repair[key]!==undefined){
        out[key]=repair[key];
      }
    }
    if(Array.isArray(repair.sections)&&libraryPackRequiredCounts(out).sections<3)out.sections=repair.sections;
    if(Array.isArray(repair.practice)&&libraryPackRequiredCounts(out).practice<6)out.practice=repair.practice;
    if(Array.isArray(repair.exam)&&libraryPackRequiredCounts(out).exam<10)out.exam=repair.exam;
  }
  return out;
}

async function repairLibraryStudyPack(env,parsed,sourceText,studyFocus,fileTitle){
  const before=libraryPackRequiredCounts(parsed);
  const needSections=before.sections<3;
  const needPractice=before.practice<6;
  const needExam=before.exam<10;

  const compactSource=cleanText(sourceText,65000);
  const prompt=`La primera generación de un paquete de estudio quedó incompleta.
Debes REPARAR solamente los componentes obligatorios que faltan.

ARCHIVO: ${fileTitle}
ENFOQUE: ${studyFocus}

FALTANTES:
- sections: ${needSections?"SÍ — genera 4 secciones completas":"NO"}
- practice: ${needPractice?"SÍ — genera EXACTAMENTE 8 preguntas":"NO"}
- exam: ${needExam?"SÍ — genera EXACTAMENTE 10 preguntas":"NO"}

Devuelve SOLO JSON válido. Usa únicamente estas claves:
{
  ${needSections?`"sections":[{"title":"...","content":"explicación clara en varios párrafos","key_points":["..."],"example":"..."}],`:""}
  ${needPractice?`"practice":[{"question":"...","context":"","options":["A","B","C","D"],"correctIndex":0,"explanation":"..."}],`:""}
  ${needExam?`"exam":[{"stem":"...","options":["A","B","C","D"],"correctIndex":0,"explanation":"..."}],`:""}
  "overview":"resumen breve",
  "source_digest":"resumen denso y fiel de la fuente"
}

REGLAS:
- Cada pregunta debe tener exactamente 4 opciones.
- correctIndex debe ser 0, 1, 2 o 3.
- No copies preguntas idénticas entre practice y exam.
- Las respuestas correctas deben poder justificarse con el material.
- No inventes páginas, autores, datos ni contenido no presente.
- Prioriza comprensión y aplicación.

===== MATERIAL =====
${compactSource}
===== FIN =====`;

  const generated=await callLibraryStructuredJson(env,{
    task:"library_study_pack_repair",
    system:"Reparas salidas JSON académicas incompletas. Devuelve únicamente JSON válido y cumple exactamente las cantidades solicitadas.",
    prompt,
    maxOutputTokens:3600,
    temperature:0.06,
    profile:"repair"
  });
  const repair=generated.parsed;
  const merged=mergeLibraryPackRepair(parsed,repair);
  return {
    merged,
    before,
    after:libraryPackRequiredCounts(merged),
    model:generated.usedModel,
    shape:generated.shape
  };
}


function normalizeSourceLockText(s){
  return String(s||"")
    .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
    .toLowerCase().replace(/[^a-z0-9ñ+\-/%(). ]+/gi," ")
    .replace(/\s+/g," ").trim();
}
function sourceLockMeaningfulTokens(s){
  const stop=new Set(["para","como","con","del","las","los","una","uno","unos","unas","que","por","este","esta","estos","estas","desde","entre","sobre","sin","son","ser","sus","mas","muy","cada","tambien","puede","pueden","the","and","for","with","from","this","that","are","was","were","into","than"]);
  return normalizeSourceLockText(s).split(" ").filter(x=>x.length>=4&&!stop.has(x));
}
function sourceLockPageNumbers(sourceText){
  const out=new Set();
  for(const m of String(sourceText||"").matchAll(/=====\s*PÁGINA\s+(\d+)\s*=====/gi))out.add(Number(m[1]));
  return out;
}
function sourceLockTopicSupported(name,aliases,sourceNorm){
  const candidates=[name,...(Array.isArray(aliases)?aliases:[])].map(normalizeSourceLockText).filter(Boolean);
  for(const c of candidates){
    if(c.length>=4&&sourceNorm.includes(c))return true;
    const toks=sourceLockMeaningfulTokens(c);
    if(toks.length&&toks.every(t=>sourceNorm.includes(t)))return true;
  }
  return false;
}
function sanitizeSourceMapAgainstText(map,sourceText){
  const sourceNorm=normalizeSourceLockText(sourceText),allowedPages=sourceLockPageNumbers(sourceText),topics=[];
  for(const raw of (Array.isArray(map?.topics)?map.topics:[]).slice(0,30)){
    const name=cleanText(raw?.name,300),aliases=Array.isArray(raw?.aliases)?raw.aliases.map(x=>cleanText(x,220)).filter(Boolean).slice(0,8):[];
    if(!name||!sourceLockTopicSupported(name,aliases,sourceNorm))continue;
    const page_refs=Array.isArray(raw?.page_refs)?raw.page_refs.map(Number).filter(n=>Number.isInteger(n)&&(!allowedPages.size||allowedPages.has(n))).slice(0,12):[];
    const evidence=[];
    for(const e of (Array.isArray(raw?.evidence)?raw.evidence:[]).slice(0,8)){
      const clean=cleanText(e,320),norm=normalizeSourceLockText(clean);
      if(norm.length>=8&&sourceNorm.includes(norm))evidence.push(clean);
    }
    topics.push({name,aliases,page_refs,evidence,subtopics:Array.isArray(raw?.subtopics)?raw.subtopics.map(x=>cleanText(x,180)).filter(Boolean).slice(0,12):[]});
  }
  const seen=new Set(),dedup=[];
  for(const t of topics){const k=normalizeSourceLockText(t.name);if(!seen.has(k)){seen.add(k);dedup.push(t)}}

  const headings=[];
  const headingSeen=new Set();
  for(const raw of (Array.isArray(map?.headings)?map.headings:[]).slice(0,40)){
    const title=cleanText(raw?.title,360);
    const aliases=Array.isArray(raw?.aliases)?raw.aliases.map(x=>cleanText(x,240)).filter(Boolean).slice(0,6):[];
    if(!title||!sourceLockTopicSupported(title,aliases,sourceNorm))continue;
    const key=normalizeSourceLockText(title);
    if(headingSeen.has(key))continue;
    headingSeen.add(key);
    const page_refs=Array.isArray(raw?.page_refs)?raw.page_refs.map(Number).filter(n=>Number.isInteger(n)&&(!allowedPages.size||allowedPages.has(n))).slice(0,12):[];
    const subheadings=(Array.isArray(raw?.subheadings)?raw.subheadings:[])
      .map(x=>cleanText(x,300)).filter(x=>x&&sourceLockTopicSupported(x,[],sourceNorm)).slice(0,12);
    headings.push({
      title,
      level:clamp(Number(raw?.level||2),1,4),
      page_refs,
      subheadings
    });
  }

  return {
    topics:dedup.slice(0,20),
    headings:headings.slice(0,24),
    excluded:Array.isArray(map?.excluded)?map.excluded.map(x=>cleanText(x,300)).filter(Boolean).slice(0,20):[],
    source_summary:cleanText(map?.source_summary,2200),
    domain:cleanText(map?.domain,180)||"General",
    material_type:cleanText(map?.material_type,180)||"Material académico",
    language:cleanText(map?.language,80)||null
  };
}
function sourceLockMapValid(map){return !!map&&Array.isArray(map.topics)&&map.topics.length>=1&&map.topics.every(t=>String(t?.name||"").trim())}
function sourceLockNames(map){return (map?.topics||[]).map(t=>String(t.name||"").trim()).filter(Boolean).slice(0,20)}
function sourceLockCoverage(sourceText,generatedText){
  const src=new Set(sourceLockMeaningfulTokens(sourceText)),gen=[...new Set(sourceLockMeaningfulTokens(generatedText))];
  if(!gen.length)return 0; return gen.filter(x=>src.has(x)).length/gen.length;
}
function validatePackAgainstSourceMap(pack,map,sourceText){
  const names=sourceLockNames(map),normNames=names.map(normalizeSourceLockText);
  const generated=[pack?.title,pack?.overview,...(pack?.sections||[]).map(x=>`${x.title||""} ${x.content||""} ${(x.key_points||[]).join(" ")}`),...(pack?.key_terms||[]),...(pack?.exam_focus||[])].filter(Boolean).join("\n");
  const gnorm=normalizeSourceLockText(generated);
  const found=normNames.filter(n=>n&&gnorm.includes(n)).length;
  const topicRecall=names.length?found/names.length:1,coverage=sourceLockCoverage(sourceText,generated);
  return {ok:topicRecall>=(names.length<=2?1:0.6)&&coverage>=0.12,topic_recall:topicRecall,lexical_coverage:coverage,missing_topics:names.filter((_,i)=>!gnorm.includes(normNames[i])).slice(0,12)};
}
function validateQuestionSetAgainstSource(questionSet,map,sourceText,kind){
  const names=sourceLockNames(map).map(normalizeSourceLockText).filter(Boolean),srcTokens=new Set(sourceLockMeaningfulTokens(sourceText));
  const rows=Array.isArray(questionSet)?questionSet:[];let aligned=0;const weak=[];
  rows.forEach((q,i)=>{
    const text=normalizeSourceLockText([q?.question,q?.stem,q?.context,q?.explanation,...(Array.isArray(q?.options)?q.options:[])].filter(Boolean).join(" "));
    const hasTopic=names.some(n=>n&&text.includes(n)),tokens=[...new Set(sourceLockMeaningfulTokens(text))];
    const overlap=tokens.length?tokens.filter(t=>srcTokens.has(t)).length/tokens.length:0;
    if(hasTopic||overlap>=0.12)aligned++;else weak.push(i+1);
  });
  const required=kind==="exam"?Math.min(rows.length,8):Math.min(rows.length,6);
  return {ok:aligned>=required,aligned,total:rows.length,weak_questions:weak};
}
async function buildLibrarySourceMap(env,{material,studyScope,fileTitle}){
  const prompt=`Analiza EXCLUSIVAMENTE el fragmento seleccionado y detecta su estructura REAL.
No presupongas ninguna carrera o asignatura. No enseñes todavía. No uses conocimiento externo.

Devuelve SOLO JSON:
{
 "domain":"área académica detectada",
 "material_type":"capítulo / apuntes / guía / artículo / tabla / otro",
 "language":"idioma principal",
 "headings":[
   {
     "title":"encabezado o subtítulo REAL presente en el texto",
     "level":2,
     "page_refs":[7],
     "aliases":[],
     "subheadings":["subtítulo REAL que depende de este encabezado"]
   }
 ],
 "topics":[
   {
     "name":"unidad principal de estudio explícita",
     "aliases":["variantes explícitas"],
     "page_refs":[7],
     "evidence":["frase breve realmente presente"],
     "subtopics":["subtema realmente presente"]
   }
 ],
 "excluded":["menciones incidentales"],
 "source_summary":"qué contienen realmente las páginas"
}

REGLAS:
- headings debe intentar conservar los ENCABEZADOS Y SUBTÍTULOS visibles/reconocibles del fragmento.
- No inventes un subtítulo porque sería pedagógicamente conveniente.
- Si no existe un encabezado claro, NO lo inventes: usa topics para representar el contenido.
- Cada heading/topic debe poder demostrarse con el fragmento.
- page_refs solo usa números presentes en ===== PÁGINA N =====.
- No completes capítulos faltantes.
- No añadas conocimiento de otras páginas.
- Máximo 24 headings y 20 topics.
- Funciona con cualquier disciplina.

ARCHIVO: ${fileTitle}
RANGO: ${studyScope}

===== FRAGMENTO =====
${material}
===== FIN =====`;

  let result=await callLibraryPartJson(env,{
    task:"library_source_structure_v3006",
    model:PREMIUM_FLASH_LITE_MODEL,
    system:"Eres un extractor estructural académico. Tu prioridad es preservar los encabezados, subtítulos y temas que realmente existen en la fuente.",
    prompt,maxOutputTokens:2600,temperature:0.01,providerTimeout:26000,fallbackTimeout:15000
  });
  let cleaned=sanitizeSourceMapAgainstText(result?.parsed,material);
  if(!sourceLockMapValid(cleaned)){
    const retry=await retryLibraryPartFast(env,{
      task:"library_source_structure_v3006",
      system:"Extrae solo estructura y temas explícitos. Conserva subtítulos reales; no inventes.",
      prompt,maxOutputTokens:2600
    });
    if(retry){result=retry;cleaned=sanitizeSourceMapAgainstText(retry.parsed,material)}
  }
  if(!sourceLockMapValid(cleaned)){
    const e=new Error("No pude confirmar suficiente contenido explícito en el fragmento seleccionado.");
    e.code="SOURCE_MAP_INVALID";
    throw e;
  }
  return {...result,parsed:cleaned};
}
async function librarySourceMapApi(request,env,user){
  ensureAI(env);
  const body=await readJson(request),fileId=cleanText(body.file_id,220),text=cleanText(body.extracted_text,90000),scope=cleanText(body.study_scope,240)||"Fragmento seleccionado";
  if(!fileId||text.length<120)return json({error:"Falta el archivo o el fragmento tiene muy poco texto."},400);
  const file=await env.DB.prepare(`SELECT id,title FROM notes WHERE id=? AND user_id=? AND tags_json LIKE '%library_file%' LIMIT 1`).bind(fileId,user.id).first();
  if(!file)return json({error:"Archivo no encontrado."},404);
  try{
    const result=await buildLibrarySourceMap(env,{material:text,studyScope:scope,fileTitle:file.title});
    return json({ok:true,source_map:result.parsed,source_topics:sourceLockNames(result.parsed),model:result.model||PREMIUM_FLASH_LITE_MODEL});
  }catch(err){return json({error:"No pude reconocer con seguridad qué temas aparecen en estas páginas. Prueba otro rango o activa OCR si el PDF es escaneado.",detail:String(err?.message||err)},422)}
}


function libraryHeadingKey(s){return normalizeSourceLockText(s).replace(/\s+/g," ").trim()}
function libraryMissingSummaryHeadings(parsed,map){
  const headings=(map?.headings||[]).map(h=>cleanText(h.title,360)).filter(Boolean);
  if(!headings.length)return [];
  const sections=Array.isArray(parsed?.summary?.sections)?parsed.summary.sections:[];
  const combined=normalizeSourceLockText(sections.map(s=>`${s?.title||""} ${s?.summary||""}`).join("\n"));
  return headings.filter(h=>{
    const k=libraryHeadingKey(h);
    if(!k)return false;
    if(combined.includes(k))return false;
    const toks=sourceLockMeaningfulTokens(k);
    return !(toks.length>=2&&toks.every(t=>combined.includes(t)));
  }).slice(0,12);
}
function mergeLibrarySummaryRepair(base,repair){
  if(!base||typeof base!=="object")base={};
  if(!base.summary||typeof base.summary!=="object")base.summary={};
  const current=Array.isArray(base.summary.sections)?base.summary.sections:[];
  const incoming=Array.isArray(repair?.sections)?repair.sections:[];
  const seen=new Set(current.map(x=>libraryHeadingKey(x?.title)));
  for(const s of incoming){
    const key=libraryHeadingKey(s?.title);
    if(!key||seen.has(key))continue;
    current.push(s);seen.add(key);
  }
  base.summary.sections=current.slice(0,24);
  return base;
}
function deterministicLibraryVisuals(map,title){
  const sourceUnits=(map?.headings?.length?map.headings.map(h=>({
    label:h.title,
    children:(h.subheadings||[]).map(x=>({label:x,detail:"Subtema detectado en la fuente"}))
  })):map?.topics?.map(t=>({
    label:t.name,
    children:(t.subtopics||[]).map(x=>({label:x,detail:"Subtema detectado en la fuente"}))
  }))||[]).slice(0,10);

  const branches=sourceUnits.map(x=>({
    label:x.label,
    summary:"Unidad explícita del fragmento",
    children:x.children.length?x.children:[{label:"Puntos principales",detail:"Revisa el resumen de esta unidad."}]
  }));

  const steps=sourceUnits.slice(0,10).map((x,i)=>({
    label:x.label,
    detail:(x.children||[]).slice(0,4).map(y=>y.label).join(" · ")||"Unidad del fragmento",
    relation:i<sourceUnits.length-1?"Siguiente unidad del material":""
  }));

  return {
    concept_map:{
      center:cleanText(title,360)||"Material seleccionado",
      overview:"Mapa estructural construido directamente a partir de los encabezados y temas detectados en las páginas seleccionadas.",
      branches
    },
    diagrams:[{
      title:"Estructura del fragmento",
      type:"jerarquía",
      caption:"Organización de las unidades detectadas en las páginas seleccionadas.",
      steps
    }]
  };
}
function completeLibraryVisualsWithSourceMap(parsed,map,title){
  const fallback=deterministicLibraryVisuals(map,title);
  if(!parsed||typeof parsed!=="object")parsed={};
  if(!parsed.concept_map||!Array.isArray(parsed.concept_map.branches)||!parsed.concept_map.branches.length){
    parsed.concept_map=fallback.concept_map;
  }else{
    const branches=parsed.concept_map.branches;
    const existingNorm=normalizeSourceLockText(branches.map(b=>b?.label||"").join(" "));
    const units=(map?.headings?.length?map.headings.map(h=>h.title):(map?.topics||[]).map(t=>t.name)).filter(Boolean);
    for(const u of units){
      const k=normalizeSourceLockText(u);
      if(k&&!existingNorm.includes(k)&&branches.length<10){
        branches.push({label:u,summary:"Unidad detectada en la fuente",children:[]});
      }
    }
  }
  if(!Array.isArray(parsed.diagrams)||!parsed.diagrams.length)parsed.diagrams=fallback.diagrams;
  return parsed;
}

async function createLibraryStudyPackApi(request,env,user){
  ensureAI(env);
  const body=await readJson(request),fileId=cleanText(body.file_id,220),extracted=cleanText(body.extracted_text,90000);
  if(!fileId||extracted.length<120)return json({error:"Falta el archivo o el fragmento tiene muy poco contenido."},400);

  const file=await env.DB.prepare(`SELECT id,title,metadata_json FROM notes WHERE id=? AND user_id=? AND tags_json LIKE '%library_file%' LIMIT 1`).bind(fileId,user.id).first();
  if(!file)return json({error:"No encontré el archivo original en tu Biblioteca."},404);

  const fileMeta=parseJsonLoose(file.metadata_json)||{};
  const studyFocus=cleanText(body.study_focus,500)||file.title;
  const studyScope=cleanText(body.study_scope,240)||"Fragmento seleccionado";
  const instruction=cleanText(body.instruction,2500);
  const pageStart=Number(body.page_start||0),pageEnd=Number(body.page_end||0),pdfPageCount=Number(body.pdf_page_count||0);
  const ocrPages=Array.isArray(body.ocr_pages)?body.ocr_pages.map(Number).filter(n=>Number.isInteger(n)&&n>0).slice(0,20):[];
  const exactPageRange=pageStart>0&&pageEnd>=pageStart;

  const sourceSignature=await sha256([
    "library-rich-v30.0.7",user.id,fileId,studyScope,studyFocus,
    exactPageRange?`${pageStart}-${pageEnd}`:"",extracted
  ].join("|"));

  const existing=await env.DB.prepare(`SELECT id,title,metadata_json FROM notes WHERE user_id=? AND tags_json LIKE '%library_study_pack%' ORDER BY datetime(updated_at) DESC LIMIT 180`).bind(user.id).all();
  for(const row of (existing.results||[])){
    const m=parseJsonLoose(row.metadata_json)||{};
    if(m.source_signature===sourceSignature&&m.library_rich_summary_v30===true){
      return json({ok:true,id:row.id,title:m.study_title||row.title,reused:true,generation_ms:0,source_topics:m.source_topics||[]},200);
    }
  }

  const started=Date.now();
  let sourceMap=sanitizeSourceMapAgainstText(body.source_map,extracted),sourceMapModel="preview";
  if(!sourceLockMapValid(sourceMap)){
    try{
      const built=await buildLibrarySourceMap(env,{material:extracted,studyScope,fileTitle:file.title});
      sourceMap=built.parsed;
      sourceMapModel=built.model||PREMIUM_FLASH_LITE_MODEL;
    }catch(err){
      return json({error:"No pude identificar con seguridad la estructura real de estas páginas.",component:"Biblioteca · estructura de fuente",detail:String(err?.message||err)},502);
    }
  }

  const topicNames=sourceLockNames(sourceMap);
  const headingNames=(sourceMap.headings||[]).map(h=>h.title).filter(Boolean);
  const headingBlock=headingNames.length
    ? headingNames.map((x,i)=>`${i+1}. ${x}`).join("\n")
    : topicNames.map((x,i)=>`${i+1}. ${x}`).join("\n");
  const topicBlock=topicNames.map((x,i)=>`${i+1}. ${x}`).join("\n");

  const material=[
    `Archivo: ${file.title}`,
    `Selección: ${studyScope}`,
    exactPageRange?`Páginas exactas: ${pageStart}-${pageEnd}${pdfPageCount?` de ${pdfPageCount}`:""}`:"",
    `Enfoque del estudiante: ${studyFocus}`,
    instruction?`Indicación adicional: ${instruction}`:"",
    `ENCABEZADOS/SUBTÍTULOS DETECTADOS:\n${headingBlock}`,
    `TEMAS EXPLÍCITOS:\n${topicBlock}`,
    "REGLA ABSOLUTA: usa únicamente estas páginas. No añadas contenido del resto del archivo.",
    `===== MATERIAL =====\n${extracted}\n===== FIN =====`
  ].filter(Boolean).join("\n\n");

  const summaryPrompt=`Crea un RESUMEN DE ESTUDIO COMPLETO pero enfocado, basado únicamente en las páginas seleccionadas.

IMPORTANTE:
- El resumen debe ABARCAR los encabezados/subtítulos reales detectados.
- No hagas un resumen de 3 frases. Quiero suficiente contenido para estudiar.
- Dedica una sección a cada subtítulo importante cuando el material lo permita.
- Conserva nombres, fórmulas, valores, definiciones, clasificaciones, mecanismos, fechas o datos importantes que realmente aparezcan.
- Distingue lo esencial de los detalles secundarios.
- No inventes información que no esté en las páginas.
- Funciona con cualquier materia.

Devuelve SOLO JSON:
{
 "title":"título fiel",
 "overview":"introducción general de 4 a 8 frases",
 "estimated_minutes":30,
 "source_digest":"síntesis densa y fiel",
 "key_terms":["15 a 30 conceptos importantes"],
 "summary":{
   "overview":"visión general suficientemente completa",
   "sections":[
     {
       "title":"encabezado/subtítulo real o unidad explícita",
       "page_refs":[7,8],
       "summary":"explicación completa del contenido de este subtítulo; puede usar varios párrafos separados por saltos de línea",
       "key_points":["4 a 8 ideas más importantes"],
       "important_data":["datos, fórmulas, dosis, valores, fechas, vocabulario o relaciones que valga la pena memorizar; solo si existen"]
     }
   ],
   "must_remember":["8 a 18 ideas de máxima prioridad"],
   "final_synthesis":"cómo se conectan entre sí las secciones del fragmento"
 }
}

SUBTÍTULOS/UNIDADES QUE DEBES CUBRIR:
${headingBlock}

${material}`;

  const visualPrompt=`Construye SOLO el MAPA MENTAL y los DIAGRAMAS del fragmento seleccionado.

El mapa mental debe ser jerárquico:
CENTRO → ramas principales → subideas con explicación breve.
No hagas ramas vagas como "Importancia" si el texto no las desarrolla.
Cada rama debe corresponder a un subtítulo o unidad real cuando sea posible.

Los diagramas deben elegirse según la naturaleza del material:
- proceso/secuencia;
- ciclo;
- comparación;
- clasificación/jerarquía;
- causa → efecto;
- estructura/relaciones;
- algoritmo/procedimiento.
No fuerces una secuencia cuando no existe.

Devuelve SOLO JSON:
{
 "concept_map":{
   "center":"tema central real",
   "overview":"cómo leer el mapa",
   "branches":[
     {
       "label":"rama principal",
       "summary":"qué representa",
       "children":[
         {"label":"subidea","detail":"relación o dato clave"}
       ]
     }
   ]
 },
 "diagrams":[
   {
     "title":"nombre claro",
     "type":"proceso|ciclo|comparación|jerarquía|causa-efecto|estructura|procedimiento",
     "caption":"qué ayuda a comprender",
     "steps":[
       {"label":"elemento","detail":"explicación","relation":"qué lo conecta con el siguiente"}
     ]
   }
 ]
}

REQUISITOS:
- 5 a 10 ramas en el mapa cuando el contenido lo justifique.
- 2 a 7 subideas por rama.
- 1 a 3 diagramas; cada uno debe aportar algo distinto.
- 3 a 10 elementos por diagrama según el material.
- Todo debe salir de estas páginas.

UNIDADES REALES:
${headingBlock}

${material}`;

  let summaryResult=null,visualResult=null;
  const results=await Promise.allSettled([
    callLibraryPartJson(env,{
      task:"library_rich_summary_v3006",
      model:PREMIUM_FLASH_MODEL,
      system:"Eres MED AI DALTON. Produces resúmenes académicos completos, organizados por los subtítulos reales de la fuente y sin contenido externo.",
      prompt:summaryPrompt,maxOutputTokens:5200,temperature:0.03,providerTimeout:42000,fallbackTimeout:20000
    }),
    callLibraryPartJson(env,{
      task:"library_visual_structure_v3006",
      model:PREMIUM_FLASH_LITE_MODEL,
      system:"Eres MED AI DALTON. Diseñas mapas mentales jerárquicos y diagramas académicos fieles a la fuente.",
      prompt:visualPrompt,maxOutputTokens:3200,temperature:0.03,providerTimeout:30000,fallbackTimeout:16000
    })
  ]);

  if(results[0].status==="fulfilled")summaryResult=results[0].value;
  if(results[1].status==="fulfilled")visualResult=results[1].value;

  if(!summaryResult){
    const retry=await retryLibraryPartFast(env,{
      task:"library_rich_summary_v3007",
      system:"Genera un resumen completo organizado por subtítulos reales. No inventes.",
      prompt:summaryPrompt,maxOutputTokens:4600
    });
    if(retry)summaryResult=retry;
  }

  if(summaryResult?.parsed){
    const missingHeadings=libraryMissingSummaryHeadings(summaryResult.parsed,sourceMap);
    if(missingHeadings.length){
      const repairPrompt=`Completa ÚNICAMENTE las secciones faltantes de este resumen.
SUBTÍTULOS QUE FALTAN:
${missingHeadings.map((x,i)=>`${i+1}. ${x}`).join("\n")}

Devuelve SOLO:
{"sections":[{"title":"subtítulo exacto","page_refs":[7],"summary":"resumen sustancial y fiel","key_points":["4 a 8"],"important_data":["solo datos presentes"]}]}

REGLAS:
- Una sección por cada subtítulo faltante.
- No repitas secciones ya creadas.
- No añadas conocimiento externo.
- Usa únicamente el material seleccionado.

${material}`;
      try{
        const repaired=await callLibraryPartJson(env,{
          task:"library_summary_heading_repair_v3007",
          model:PREMIUM_FLASH_LITE_MODEL,
          system:"Completa subtítulos faltantes de un resumen académico usando exclusivamente la fuente.",
          prompt:repairPrompt,maxOutputTokens:3000,temperature:0.02,providerTimeout:26000,fallbackTimeout:15000
        });
        summaryResult.parsed=mergeLibrarySummaryRepair(summaryResult.parsed,repaired.parsed);
      }catch(err){
        console.error("LIBRARY_HEADING_REPAIR_ERROR",err?.stack||err);
      }
    }
  }

  if(!visualResult){
    const retry=await retryLibraryPartFast(env,{
      task:"library_visual_structure_v3007",
      system:"Genera solo un mapa mental jerárquico y diagramas fieles.",
      prompt:visualPrompt,maxOutputTokens:3000
    });
    if(retry)visualResult=retry;
  }

  if(!summaryResult){
    return json({error:"No pude completar el resumen de estas páginas.",component:"Biblioteca · resumen completo",generation_ms:Date.now()-started},502);
  }

  const visualParsed=completeLibraryVisualsWithSourceMap(visualResult?.parsed||{},sourceMap,studyFocus);
  const combined={...summaryResult.parsed,...visualParsed};
  const pseudoRow={subject_name:"Biblioteca personal",topic_name:studyFocus,subject_code:"LIBRARY"};
  const promptBody={source_type:fileMeta.mime_type==="application/pdf"?"pdf":"text",source_name:file.title,mime_type:fileMeta.mime_type||""};
  const pack=sanitizeLibrarySimplePack(combined,pseudoRow,promptBody);

  if(!pack){
    return json({error:"La IA respondió, pero faltó parte del resumen, mapa mental o diagramas.",component:"Biblioteca · validación visual"},502);
  }

  const validation=validateLibrarySimplePackAgainstSource(pack,sourceMap,extracted);
  if(!validation.ok){
    return json({
      error:"El material generado no cubrió suficientemente la estructura de las páginas seleccionadas. MED AI lo rechazó para no darte un resumen incompleto o mezclado.",
      component:"Biblioteca · cobertura de subtítulos",
      missing_topics:validation.missing_topics,
      missing_headings:validation.missing_headings,
      heading_recall:validation.heading_recall
    },502);
  }

  pack.source_lock={
    enabled:true,version:"30.0.7",
    domain:sourceMap.domain||"General",
    material_type:sourceMap.material_type||"Material académico",
    topics:sourceMap.topics||[],
    headings:sourceMap.headings||[],
    excluded:sourceMap.excluded||[],
    source_summary:sourceMap.source_summary||"",
    validation
  };
  pack.source_reference={
    type:"library",source_file_id:fileId,name:file.title,mime_type:fileMeta.mime_type||"",
    study_scope:studyScope,
    page_start:exactPageRange?pageStart:null,
    page_end:exactPageRange?pageEnd:null,
    pdf_page_count:pdfPageCount||null,
    ocr_pages:ocrPages,
    imported_at:new Date().toISOString()
  };

  const id=crypto.randomUUID(),now=new Date().toISOString();
  const metadata={
    university_source:true,
    library_study_pack:true,
    library_simple_v30:true,
    library_rich_summary_v30:true,
    version:30.06,
    source_type:"library",
    source_file_id:fileId,
    source_name:file.title,
    study_scope:studyScope,
    study_focus:studyFocus,
    study_title:pack.title||studyFocus,
    page_start:exactPageRange?pageStart:null,
    page_end:exactPageRange?pageEnd:null,
    pdf_page_count:pdfPageCount||null,
    source_signature:sourceSignature,
    source_lock_v30:true,
    source_topics:topicNames,
    source_headings:headingNames,
    source_domain:sourceMap.domain||"General",
    generation_version:"30.0.7",
    generation_models:{summary:summaryResult.model||null,visuals:visualResult.model||null,source_map:sourceMapModel},
    generation_ms:Date.now()-started,
    imported_once:true
  };

  await env.DB.prepare(`INSERT INTO notes (id,user_id,subject_id,topic_id,title,body,tags_json,pinned,metadata_json,sync_version,created_at,updated_at) VALUES (?,?,?,?,?,?,?,0,?,1,?,?)`)
    .bind(
      id,user.id,null,null,
      `LIB · ${file.title} · ${studyScope}`,
      JSON.stringify(pack),
      JSON.stringify(["university_source","study_pack","library_study_pack","library_simple_v30","library_rich_summary_v30","source_locked","v30_0_7"]),
      JSON.stringify(metadata),now,now
    ).run();

  return json({
    ok:true,id,title:pack.title,reused:false,
    source_topics:topicNames,
    source_headings:headingNames,
    generation_ms:Date.now()-started,
    models:metadata.generation_models
  },201);
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


// -------------------- V25 SMART STUDY ENGINE --------------------

const SMART_STOPWORDS=new Set([
  "a","al","algo","algunas","algunos","ante","antes","como","con","contra","cual","cuando","de","del","desde","donde",
  "dos","el","ella","ellas","ellos","en","entre","era","es","esa","ese","eso","esta","este","esto","fue","ha","hay","la",
  "las","le","les","lo","los","mas","más","me","mi","mis","muy","no","o","para","pero","por","porque","que","qué","se",
  "sin","sobre","su","sus","te","tu","tus","un","una","uno","y","ya","the","and","of","to","in","is","for","on","with"
]);

function smartNormalize(s){
  return String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9ñ]+/g," ").replace(/\s+/g," ").trim();
}
function smartTokens(s){
  return smartNormalize(s).split(" ").filter(x=>x.length>2&&!SMART_STOPWORDS.has(x)).slice(0,40);
}
function smartCompactPack(pack){
  if(!pack||typeof pack!=="object")return "";
  const out=[
    pack.title,pack.overview,pack.source_digest,
    pack.summary?.overview,pack.summary?.connection,
    ...(pack.summary?.must_remember||[]),
    ...(pack.summary?.common_errors||[]),
    ...(pack.key_terms||[]),
    ...(pack.exam_focus||[]),
    ...(pack.objectives||[])
  ];
  for(const sec of (pack.sections||[]).slice(0,10)){
    out.push(sec.title,sec.content,...(sec.key_points||[]),sec.example,sec.application);
  }
  return out.filter(Boolean).join("\n");
}
function smartSourceFromNote(row){
  const tags=parseJsonLoose(row.tags_json)||[];
  const meta=parseJsonLoose(row.metadata_json)||{};
  let pack=parseJsonLoose(row.body),text="";
  if(pack&&typeof pack==="object")text=smartCompactPack(pack);
  else text=String(row.body||"");
  let type="note",label="Apunte",scope="";
  if(tags.includes("source_chunk_v29")){type="library_source";label="Fuente de Biblioteca";scope=[meta.source_name,meta.locator].filter(Boolean).join(" · ")}
  else if(tags.includes("transcription_pack_v29")){type="transcription";label="Clase transcrita";scope=meta.source_name||""}
  else if(tags.includes("historical_keys_pack")){type="historical_keys";label="Claves de años pasados";scope=meta.subject||""}
  else if(tags.includes("past_exam_pack")){type="past_exam";label="Parcial anterior";scope=meta.subject?`${meta.subject}${meta.year?` · ${meta.year}`:""}`:""}
  else if(tags.includes("library_study_pack")){type="library_session";label="Sesión de Biblioteca";scope=meta.study_scope||meta.source_name||""}
  else if(tags.includes("university_source")){type="university";label="Material universitario";scope=meta.source_name||meta.source_detail||""}
  else if(tags.includes("material_v19")||meta.course_material){type="course";label="Curso MED AI";scope=meta.language||""}
  else if(tags.includes("library_file")||tags.includes("library_folder"))return null;
  const displayTitle=cleanText(pack?.title||meta.study_title||meta.source_name||row.title,320)||"Material";
  return {id:row.id,title:displayTitle,text,body:pack,meta,tags,type,label,scope,updated_at:row.updated_at};
}
function smartScoreSource(src,query){
  const terms=smartTokens(query);if(!terms.length)return 0;
  const title=smartNormalize(src.title),body=smartNormalize(src.text).slice(0,50000),phrase=smartNormalize(query);
  let score=0;
  if(phrase.length>5&&title.includes(phrase))score+=35;
  if(phrase.length>5&&body.includes(phrase))score+=20;
  for(const term of terms){
    if(title.includes(term))score+=12;
    const matches=body.split(term).length-1;
    score+=Math.min(12,matches*2);
  }
  if(src.type==="university"||src.type==="library_session")score+=2;
  return score;
}
function smartSnippet(text,query){
  const clean=String(text||"").replace(/\s+/g," ").trim();
  if(!clean)return "";
  const terms=smartTokens(query);
  let at=-1;
  for(const t of terms){at=smartNormalize(clean).indexOf(t);if(at>=0)break}
  if(at<0)return clean.slice(0,650)+(clean.length>650?"…":"");
  const start=Math.max(0,at-180),end=Math.min(clean.length,start+750);
  return `${start>0?"…":""}${clean.slice(start,end)}${end<clean.length?"…":""}`;
}
async function smartMaterialSources(env,user,query,limit=8){
  const rows=await env.DB.prepare(`
    SELECT id,title,body,tags_json,metadata_json,subject_id,topic_id,updated_at
    FROM notes
    WHERE user_id=? ORDER BY datetime(updated_at) DESC LIMIT 900
  `).bind(user.id).all();
  const all=rows.results||[],primaryFileIds=new Set();
  for(const r of all){
    const tags=parseJsonLoose(r.tags_json)||[],meta=parseJsonLoose(r.metadata_json)||{};
    if(tags.includes("library_file")&&meta.primary_source_v30)primaryFileIds.add(r.id);
  }
  return all
    .map(smartSourceFromNote).filter(Boolean)
    .map(src=>{
      const isPrimary=!!src.meta?.primary_source_v30||primaryFileIds.has(src.meta?.source_file_id);
      return {...src,primary:isPrimary,score:smartScoreSource(src,query)+(isPrimary?35:0)};
    })
    .filter(x=>x.score>0)
    .sort((a,b)=>b.score-a.score)
    .slice(0,limit)
    .map(x=>({
      id:x.id,title:x.title,type:x.type,label:x.label,scope:x.scope,score:x.score,primary:x.primary,
      snippet:smartSnippet(x.text,query),context:String(x.text||"").slice(0,6500)
    }));
}

async function smartDashboard(env,user){
  const now=new Date().toISOString();
  const [weakRows,dueRow,deadlineRows,noteRows] = await Promise.all([
    env.DB.prepare(`
      SELECT p.mastery,p.questions_answered,p.questions_correct,t.name AS topic_name,s.name AS subject_name
      FROM user_topic_progress p JOIN topics t ON t.id=p.topic_id JOIN subjects s ON s.id=t.subject_id
      WHERE p.user_id=? ORDER BY p.mastery ASC, p.questions_answered DESC LIMIT 10
    `).bind(user.id).all(),
    env.DB.prepare(`SELECT COUNT(*) AS c FROM mistakes WHERE user_id=? AND resolved=0 AND (next_review_at IS NULL OR datetime(next_review_at)<=datetime(?))`)
      .bind(user.id,now).first(),
    env.DB.prepare(`
      SELECT id,title,due_at,importance,subject_id FROM academic_deadlines
      WHERE user_id=? AND completed=0 AND datetime(due_at)>=datetime(?)
      ORDER BY datetime(due_at) ASC LIMIT 5
    `).bind(user.id,now).all(),
    env.DB.prepare(`
      SELECT id,title,body,tags_json,metadata_json,updated_at FROM notes
      WHERE user_id=? AND (
        tags_json LIKE '%material_v19%' OR tags_json LIKE '%university_source%' OR
        tags_json LIKE '%library_study_pack%' OR tags_json LIKE '%past_exam_pack%' OR
        tags_json LIKE '%historical_keys_pack%'
      ) ORDER BY datetime(updated_at) DESC LIMIT 300
    `).bind(user.id).all()
  ]);

  const notes=noteRows.results||[];
  const past=[],historicalKeys=[];
  const trend=new Map(),keyTrend=new Map();
  for(const row of notes){
    const tags=parseJsonLoose(row.tags_json)||[];
    const meta=parseJsonLoose(row.metadata_json)||{},pack=parseJsonLoose(row.body)||{};
    if(tags.includes("historical_keys_pack")){
      historicalKeys.push({id:row.id,title:row.title,study_title:pack.title||meta.study_title,subject:meta.subject||pack.subject,source_count:Number(meta.source_count||pack.source_count||pack.source_files?.length||0),updated_at:row.updated_at});
      for(const t of (pack.recurring_topics||[])){
        const name=cleanText(t.name,220);if(!name)continue;
        const key=smartNormalize(name),prev=keyTrend.get(key)||{topic:name,count:0,score:0};
        prev.count+=Number(t.occurrence_count||1);
        prev.score+=Number(t.historical_weight||10);
        keyTrend.set(key,prev);
      }
      continue;
    }
    if(!tags.includes("past_exam_pack"))continue;
    past.push({id:row.id,title:row.title,study_title:pack.title||meta.study_title,subject:meta.subject||pack.subject,year:meta.year||pack.year,updated_at:row.updated_at});
    for(const t of (pack.topics||[])){
      const name=cleanText(t.name,220);if(!name)continue;
      const key=smartNormalize(name),prev=trend.get(key)||{topic:name,count:0,score:0};
      prev.count+=1;prev.score+=Number(t.weight||t.frequency_score||10);trend.set(key,prev);
    }
  }
  const trends=[...trend.values()].sort((a,b)=>(b.count*100+b.score)-(a.count*100+a.score))
    .slice(0,12).map(x=>({...x,score:Math.min(100,Math.round(x.score/Math.max(1,x.count)))}));
  const keyTrends=[...keyTrend.values()].sort((a,b)=>(b.count*100+b.score)-(a.count*100+a.score))
    .slice(0,12).map(x=>({...x,score:Math.min(100,Math.round(x.score/Math.max(1,x.count||1)))}));

  const weak=weakRows.results||[],recommendations=[];
  const due=Number(dueRow?.c||0);
  if(due)recommendations.push({title:`Repasa ${Math.min(12,due)} concepto${due===1?"":"s"} pendiente${due===1?"":"s"}`,detail:"Provienen de preguntas que fallaste anteriormente.",minutes:`${Math.max(8,Math.min(30,due*2))} min`});
  if(weak[0])recommendations.push({title:`Refuerza ${weak[0].topic_name}`,detail:`Es tu tema registrado con menor dominio (${Math.round(Number(weak[0].mastery||0))}%).`,minutes:"20 min"});
  if(historicalKeys[0])recommendations.push({title:"Repasa tus claves de años pasados",detail:`Reutiliza ${historicalKeys[0].study_title||historicalKeys[0].title} sin nueva llamada de IA.`,minutes:"25–40 min"});
  else if(past[0])recommendations.push({title:"Haz un simulador de parcial anterior",detail:`Reutiliza ${past[0].study_title||past[0].title} sin nueva llamada de IA.`,minutes:"20–30 min"});
  if(!recommendations.length)recommendations.push({title:"Avanza tu curso actual",detail:"No hay errores urgentes; aprovecha para aprender contenido nuevo.",minutes:"30–45 min"});

  return json({
    weaknesses:weak,
    review_due:due,
    next_deadline:(deadlineRows.results||[])[0]||null,
    deadlines:deadlineRows.results||[],
    material_count:notes.length,
    past_exams:past.slice(0,20),
    exam_trends:trends,
    historical_keys:historicalKeys.slice(0,30),
    historical_key_trends:keyTrends,
    recommendations:recommendations.slice(0,4),
    health:{db:true,r2:!!env.LIBRARY,ai:!!env.AI}
  });
}

async function smartRetrieve(url,env,user){
  const q=cleanText(url.searchParams.get("q"),600);
  if(!q)return json({sources:[]});
  return json({query:q,sources:await smartMaterialSources(env,user,q,10)});
}

async function smartAsk(request,env,user){
  ensureAI(env);
  const body=await readJson(request),q=cleanText(body.query,4000),quality=cleanText(body.quality,30)||"economy";
  if(!q)return json({error:"Escribe una pregunta."},400);
  const sources=await smartMaterialSources(env,user,q,7);
  if(!sources.length)return json({answer:"No encontré material guardado suficientemente relacionado con esta pregunta. Puedes usar Tutor IA para aprenderlo desde cero o agregar material a tu Biblioteca.",sources:[],model_label:"Sin IA"});
  const context=sources.map((s,i)=>`[${i+1}] ${s.primary?"★ PRINCIPAL · ":""}${s.title}${s.scope?` · ${s.scope}`:""}\n${s.context}`).join("\n\n");
  const model=quality==="max"?PREMIUM_PRO_MODEL:PREMIUM_FLASH_MODEL;
  const response=await callCloudflareAI(env,{
    model,task:"smart_rag_answer",
    messages:[
      {role:"system",content:"Eres MED AI DALTON. Responde principalmente con las fuentes personales del estudiante. Cita dentro de la respuesta usando [1], [2], etc. Las fuentes marcadas como PRINCIPALES tienen prioridad cuando sean pertinentes. No afirmes que una idea está en una fuente si no aparece en el contexto. Si agregas conocimiento general para explicar, crea un apartado claramente titulado 'Explicación complementaria de IA'. Para medicina clínica, señala cuándo una afirmación requiere verificar una fuente clínica actual. Sé didáctico, riguroso y útil para estudiar."},
      {role:"user",content:`PREGUNTA:\n${q}\n\nFUENTES GUARDADAS:\n${context}`}
    ],
    max_tokens:model===PREMIUM_PRO_MODEL?2600:1800,
    temperature:0.22
  });
  return json({answer:extractCloudflareText(response),sources:sources.map(({context,...x})=>x),model:response.__model||model,model_label:model===PREMIUM_PRO_MODEL?"Gemini 2.5 Pro":"Gemini 2.5 Flash"});
}

async function smartReviewSet(url,env,user){
  const limit=clamp(Number(url.searchParams.get("limit")||12),1,30),now=new Date().toISOString();
  let rows=await env.DB.prepare(`
    SELECT m.*,t.name AS topic_name FROM mistakes m LEFT JOIN topics t ON t.id=m.topic_id
    WHERE m.user_id=? AND m.resolved=0 AND (m.next_review_at IS NULL OR datetime(m.next_review_at)<=datetime(?))
    ORDER BY COALESCE(datetime(m.next_review_at),datetime(m.created_at)) ASC, m.mastery_score ASC LIMIT ?
  `).bind(user.id,now,limit).all();
  if(!(rows.results||[]).length){
    rows=await env.DB.prepare(`
      SELECT m.*,t.name AS topic_name FROM mistakes m LEFT JOIN topics t ON t.id=m.topic_id
      WHERE m.user_id=? AND m.resolved=0 ORDER BY m.mastery_score ASC, datetime(m.updated_at) DESC LIMIT ?
    `).bind(user.id,limit).all();
  }
  return json({items:rows.results||[]});
}

async function smartRateReview(request,env,user){
  const body=await readJson(request),id=cleanText(body.mistake_id,220),rating=clamp(Number(body.rating),0,3);
  if(!id)return json({error:"Falta el error a actualizar."},400);
  const row=await env.DB.prepare(`SELECT id,mastery_score,times_failed,times_correct_after FROM mistakes WHERE id=? AND user_id=? LIMIT 1`).bind(id,user.id).first();
  if(!row)return json({error:"No encontré ese repaso."},404);
  const old=Number(row.mastery_score||0),success=Number(row.times_correct_after||0);
  let mastery=old,nextSuccess=success,failed=Number(row.times_failed||0),days=1;
  if(rating===0){mastery=Math.max(0,old-15);failed+=1;days=1}
  if(rating===1){mastery=Math.min(100,old+5);nextSuccess+=1;days=Math.min(7,2+Math.floor(nextSuccess/2))}
  if(rating===2){mastery=Math.min(100,old+12);nextSuccess+=1;days=Math.min(30,4+nextSuccess*2)}
  if(rating===3){mastery=Math.min(100,old+20);nextSuccess+=1;days=Math.min(60,8+nextSuccess*4)}
  const resolved=mastery>=85&&nextSuccess>=3&&rating>=2?1:0;
  const next=new Date(Date.now()+days*86400000).toISOString(),now=new Date().toISOString();
  await env.DB.prepare(`
    UPDATE mistakes SET mastery_score=?,times_failed=?,times_correct_after=?,next_review_at=?,resolved=?,updated_at=?,sync_version=sync_version+1
    WHERE id=? AND user_id=?
  `).bind(mastery,failed,nextSuccess,next,resolved,now,id,user.id).run();
  return json({ok:true,mastery_score:mastery,next_review_at:next,resolved});
}


function sanitizeHistoricalQuiz(arr,limit){
  return (Array.isArray(arr)?arr:[]).slice(0,limit).map(q=>({
    stem:cleanText(q.stem||q.question,1800),
    options:Array.isArray(q.options)?q.options.slice(0,4).map(x=>cleanText(x,900)):[],
    correctIndex:clamp(Number(q.correctIndex),0,3),
    explanation:cleanText(q.explanation,2200),
    topic:cleanText(q.topic,300)
  })).filter(q=>q.stem&&q.options.length===4);
}
function sanitizeHistoricalKeysPack(parsed,subject,sourceFiles){
  const topics=(Array.isArray(parsed?.recurring_topics)?parsed.recurring_topics:[]).slice(0,18).map(t=>({
    name:cleanText(t.name,300),
    occurrence_count:clamp(Number(t.occurrence_count||1),1,Math.max(1,sourceFiles.length)),
    historical_weight:clamp(Number(t.historical_weight||10),1,100),
    source_files:Array.isArray(t.source_files)?t.source_files.slice(0,12).map(x=>cleanText(x,320)).filter(Boolean):[],
    concepts:Array.isArray(t.concepts)?t.concepts.slice(0,10).map(x=>cleanText(x,500)).filter(Boolean):[],
    why_priority:cleanText(t.why_priority,1300)
  })).filter(t=>t.name);

  const practice=sanitizeHistoricalQuiz(parsed?.practice_questions,12);
  if(topics.length<1)return null;

  let branches=Array.isArray(parsed?.concept_map?.branches)?parsed.concept_map.branches.slice(0,8).map(b=>({
    label:cleanText(b.label,320),
    children:Array.isArray(b.children)?b.children.slice(0,6).map(x=>cleanText(typeof x==="string"?x:x?.label,600)).filter(Boolean):[]
  })).filter(b=>b.label):[];
  if(!branches.length)branches=topics.slice(0,8).map(t=>({label:t.name,children:(t.concepts||[]).slice(0,5)}));

  let diagrams=Array.isArray(parsed?.diagrams)?parsed.diagrams.slice(0,3).map((d,i)=>({
    title:cleanText(d.title,320)||`Diagrama ${i+1}`,
    caption:cleanText(d.caption,900),
    steps:Array.isArray(d.steps)?d.steps.slice(0,10).map(s=>({
      label:cleanText(s.label,320),
      detail:cleanText(s.detail,1000)
    })).filter(s=>s.label):[]
  })).filter(d=>d.steps.length>=2):[];

  const important=Array.isArray(parsed?.important_points)?parsed.important_points.slice(0,24).map(x=>cleanText(x,1100)).filter(Boolean):[];
  const remember=Array.isArray(parsed?.must_remember)?parsed.must_remember.slice(0,20).map(x=>cleanText(x,1100)).filter(Boolean):important.slice(0,14);

  return {
    version:30.07,historical_keys_pack:true,historical_simple_v30:true,
    title:cleanText(parsed?.title,380)||`${subject} · Repaso desde claves`,
    subject,source_count:sourceFiles.length,source_files:sourceFiles,
    overview:cleanText(parsed?.overview,5200),
    source_quality:cleanText(parsed?.source_quality,1800),
    limitations:Array.isArray(parsed?.limitations)?parsed.limitations.slice(0,12).map(x=>cleanText(x,1100)).filter(Boolean):[],
    recurring_topics:topics,
    historical_patterns:Array.isArray(parsed?.historical_patterns)?parsed.historical_patterns.slice(0,18).map(x=>cleanText(x,1100)).filter(Boolean):[],
    important_points:important,must_remember:remember,
    common_traps:Array.isArray(parsed?.common_traps)?parsed.common_traps.slice(0,16).map(x=>cleanText(x,1100)).filter(Boolean):[],
    concept_map:{center:cleanText(parsed?.concept_map?.center,320)||subject,branches},
    diagrams,
    practice_questions:practice,
    source_digest:cleanText(parsed?.source_digest,18000),
    lessons:[],study_plan:[],final_exam:[],created_from_history:true
  };
}


function groundHistoricalTopicsToDocuments(pack,documents){
  if(!pack)return null;
  const grounded=[];
  for(const topic of (pack.recurring_topics||[])){
    const supported=[];
    for(const doc of documents){
      const norm=normalizeSourceLockText(doc.text);
      if(sourceLockTopicSupported(topic.name,topic.concepts||[],norm))supported.push(doc.name);
    }
    if(!supported.length)continue;
    grounded.push({...topic,source_files:supported,occurrence_count:supported.length});
  }
  if(!grounded.length)return null;

  const total=grounded.reduce((s,t)=>s+Number(t.occurrence_count||0),0)||1;
  grounded.forEach(t=>t.historical_weight=Math.max(1,Math.round(Number(t.occurrence_count||0)/total*100)));
  const weightSum=grounded.reduce((s,t)=>s+t.historical_weight,0);
  if(grounded.length&&weightSum!==100)grounded[0].historical_weight=Math.max(1,grounded[0].historical_weight+(100-weightSum));

  const allowed=grounded.map(t=>normalizeSourceLockText(t.name)).filter(Boolean);
  const practice=[];
  const seen=new Set();
  for(const q of (pack.practice_questions||[])){
    const stemKey=normalizeSourceLockText(q.stem);
    if(!stemKey||seen.has(stemKey))continue;
    const topicNorm=normalizeSourceLockText(q.topic);
    const qNorm=normalizeSourceLockText(`${q.stem} ${q.explanation||""}`);
    const aligned=(topicNorm&&allowed.some(a=>topicNorm.includes(a)||a.includes(topicNorm)))||
      allowed.some(a=>qNorm.includes(a));
    if(!aligned)continue;
    seen.add(stemKey);practice.push(q);
  }

  const branches=(pack.concept_map?.branches||[]).filter(b=>{
    const n=normalizeSourceLockText(b.label);
    return allowed.some(a=>n.includes(a)||a.includes(n));
  });
  pack.recurring_topics=grounded;
  pack.practice_questions=practice.slice(0,12);
  pack.concept_map={
    center:pack.concept_map?.center||pack.subject,
    branches:branches.length?branches:grounded.slice(0,8).map(t=>({label:t.name,children:(t.concepts||[]).slice(0,5)}))
  };
  if(!pack.diagrams?.length){
    pack.diagrams=[{
      title:"Frecuencia histórica verificada",
      caption:"Conteo calculado a partir de los PDF cargados.",
      steps:grounded.slice(0,10).map(t=>({label:t.name,detail:`Aparece en ${t.occurrence_count} de ${documents.length} archivo(s).`}))
    }];
  }
  return pack;
}
function historicalPracticeMissing(pack){return Math.max(0,12-(pack?.practice_questions?.length||0))}
function mergeHistoricalPractice(pack,questions){
  const merged=[...(pack.practice_questions||[])];
  const seen=new Set(merged.map(q=>normalizeSourceLockText(q.stem)));
  for(const q of sanitizeHistoricalQuiz(questions,12)){
    const k=normalizeSourceLockText(q.stem);
    if(!k||seen.has(k))continue;
    seen.add(k);merged.push(q);
    if(merged.length>=12)break;
  }
  pack.practice_questions=merged.slice(0,12);
  return pack;
}

async function analyzeHistoricalKeysApi(request,env,user){
  ensureAI(env);requireLibraryR2(env);
  const body=await readJson(request);
  const fileIds=Array.isArray(body.file_ids)?[...new Set(body.file_ids.map(x=>cleanText(x,220)).filter(Boolean))].slice(0,12):[];
  const subject=cleanText(body.subject,320),note=cleanText(body.note,2000);
  if(!fileIds.length||!subject)return json({error:"Agrega al menos un PDF y escribe la materia."},400);

  const signature=await sha256(`historical-simple-v30.0.7|${smartNormalize(subject)}|${[...fileIds].sort().join("|")}`);
  const existing=await env.DB.prepare(`SELECT id,metadata_json FROM notes WHERE user_id=? AND tags_json LIKE '%historical_keys_pack%' ORDER BY datetime(updated_at) DESC LIMIT 100`).bind(user.id).all();
  for(const row of (existing.results||[])){
    const m=parseJsonLoose(row.metadata_json)||{};
    if(m.source_signature===signature&&m.historical_simple_v30===true&&m.evidence_verified_v30===true){
      return json({ok:true,id:row.id,cached:true});
    }
  }

  const extracted=[];
  for(const id of fileIds){
    const src=await getLibraryExtractedText(env,user,id);
    extracted.push({
      id,
      name:src.row.title||src.meta?.original_name||"Clave histórica",
      text:String(src.text||"")
    });
  }

  const usable=extracted.filter(x=>normalizeSourceLockText(x.text).length>=80);
  if(!usable.length)return json({error:"Los PDF no contienen suficiente texto o contexto para identificar temas. Si son escaneados, primero usa OCR en Biblioteca."},422);

  const perFile=Math.max(6500,Math.min(28000,Math.floor(100000/usable.length)));
  const documents=usable.map((x,i)=>`===== ARCHIVO ${i+1}: ${x.name} =====
${x.text.slice(0,perFile)}
===== FIN ARCHIVO ${i+1} =====`).join("\n\n");

  const prompt=`Eres MED AI DALTON. Analiza CLAVES/PARCIALES DE AÑOS ANTERIORES de "${subject}".
${note?`Indicación del estudiante: ${note}`:""}

OBJETIVO: preparar un repaso de alto rendimiento, pero SIN adivinar el próximo examen.

GENERA ÚNICAMENTE:
1) Resumen suficientemente completo de lo que realmente muestran las claves.
2) Temas/puntos importantes y los que más se repiten.
3) Mapa mental.
4) 1 a 3 diagramas útiles.
5) Hasta 12 ejercicios nuevos de práctica, todos sobre temas con evidencia en las claves.

REGLAS DE EVIDENCIA:
- recurring_topics solo puede incluir temas cuyo nombre/conceptos estén apoyados por el texto de al menos un PDF.
- source_files debe listar únicamente archivos donde el tema realmente aparezca.
- occurrence_count debe corresponder a la cantidad de esos archivos; MED AI lo volverá a verificar por código.
- Si un PDF solo tiene letras A/B/C sin la pregunta o contexto, NO asignes un tema a esas letras.
- No predigas qué vendrá en el siguiente parcial.
- No introduzcas un tema nuevo solo porque sea típico de la materia.
- Los ejercicios pueden usar conocimiento correcto para EXPLICAR un tema identificado, pero no evaluar un tema distinto.

Devuelve SOLO JSON:
{
 "title":"...",
 "overview":"resumen claro y sustancial",
 "source_quality":"qué tan interpretables son las claves",
 "limitations":["..."],
 "recurring_topics":[
   {"name":"tema","occurrence_count":3,"historical_weight":25,"source_files":["archivo.pdf"],"concepts":["..."],"why_priority":"por qué conviene repasarlo"}
 ],
 "historical_patterns":["patrones observados sin predecir"],
 "important_points":["puntos esenciales"],
 "must_remember":["ideas de máxima prioridad"],
 "common_traps":["errores/confusiones relevantes"],
 "concept_map":{"center":"${subject}","branches":[{"label":"tema","children":["concepto"]}]},
 "diagrams":[{"title":"...","caption":"...","steps":[{"label":"...","detail":"..."}]}],
 "practice_questions":[{"stem":"...","options":["A","B","C","D"],"correctIndex":0,"explanation":"...","topic":"tema de recurring_topics"}],
 "source_digest":"síntesis compacta"
}

${documents}`;

  let result;
  try{
    result=await callLibraryPartJson(env,{
      task:"historical_keys_verified_v3007",
      model:PREMIUM_FLASH_MODEL,
      system:"Analiza claves históricas con rigor. No inventes frecuencia ni temas. Devuelve exclusivamente JSON válido.",
      prompt,maxOutputTokens:5600,temperature:0.08,providerTimeout:42000,fallbackTimeout:22000
    });
  }catch(err){
    return json({error:workersAIUserMessage(err),component:"Claves · análisis histórico"},503);
  }

  const sourceFiles=usable.map(x=>x.name);
  let pack=sanitizeHistoricalKeysPack(result?.parsed,subject,sourceFiles);
  pack=groundHistoricalTopicsToDocuments(pack,usable);
  if(!pack)return json({error:"No pude confirmar ningún tema con evidencia suficiente dentro de las claves. Prefiero no inventar un repaso."},422);

  const missing=historicalPracticeMissing(pack);
  if(missing>0){
    const allowed=pack.recurring_topics.map(t=>`${t.name} (${t.occurrence_count}/${usable.length} archivos)`).join("\n");
    const existingStems=(pack.practice_questions||[]).map((q,i)=>`${i+1}. ${q.stem}`).join("\n");
    const repairPrompt=`Genera EXACTAMENTE ${missing} preguntas NUEVAS para completar la práctica.

TEMAS AUTORIZADOS:
${allowed}

PREGUNTAS YA EXISTENTES (NO REPETIR):
${existingStems||"Ninguna"}

Devuelve SOLO:
{"practice_questions":[{"stem":"...","options":["A","B","C","D"],"correctIndex":0,"explanation":"...","topic":"tema autorizado"}]}

REGLAS:
- Solo temas autorizados.
- 4 opciones y una correcta.
- No copies una pregunta existente.
- No inventes un tema nuevo.
- Usa las claves como evidencia del alcance.

${documents}`;
    try{
      const repair=await callLibraryPartJson(env,{
        task:"historical_keys_practice_repair_v3007",
        model:PREMIUM_FLASH_LITE_MODEL,
        system:"Completa una práctica usando únicamente los temas históricos autorizados.",
        prompt:repairPrompt,maxOutputTokens:2600,temperature:0.05,providerTimeout:26000,fallbackTimeout:15000
      });
      pack=mergeHistoricalPractice(pack,repair?.parsed?.practice_questions||[]);
      pack=groundHistoricalTopicsToDocuments(pack,usable)||pack;
    }catch(err){
      console.error("HISTORICAL_PRACTICE_REPAIR_ERROR",err?.stack||err);
    }
  }

  if((pack.practice_questions||[]).length<6){
    return json({error:"Identifiqué temas históricos, pero no pude construir suficientes ejercicios fieles sin introducir contenido externo. Revisa que las claves tengan preguntas o contexto legible."},422);
  }
  if(pack.practice_questions.length<12){
    pack.limitations=[...(pack.limitations||[]),`Se generaron ${pack.practice_questions.length} ejercicios fiables de 12 solicitados; no se inventaron preguntas adicionales.`];
  }

  const id=crypto.randomUUID(),now=new Date().toISOString();
  const meta={
    historical_keys_pack:true,historical_simple_v30:true,version:30.07,
    subject,study_title:pack.title,source_file_ids:fileIds,source_files:sourceFiles,
    source_count:fileIds.length,source_signature:signature,
    evidence_verified_v30:true,
    verified_topic_count:pack.recurring_topics.length,
    practice_count:pack.practice_questions.length,
    generation_version:"30.0.7",
    generation_model:result.model||PREMIUM_FLASH_MODEL
  };

  await env.DB.prepare(`INSERT INTO notes (id,user_id,subject_id,topic_id,title,body,tags_json,pinned,metadata_json,sync_version,created_at,updated_at) VALUES (?,?,?,?,?,?,?,0,?,1,?,?)`)
    .bind(
      id,user.id,null,null,`CLAVES HISTÓRICAS · ${subject}`,JSON.stringify(pack),
      JSON.stringify(["historical_keys_pack","historical_simple_v30","evidence_verified","smart_study","study_pack","v30_0_7"]),
      JSON.stringify(meta),now,now
    ).run();

  await questionBankUpsertQuestions(env,user,pack.practice_questions||[],{
    source_type:"historical_keys",source_ref:id,subject,source_name:pack.title
  });

  return json({
    ok:true,id,cached:false,model:result.model||PREMIUM_FLASH_MODEL,
    verified_topics:pack.recurring_topics.length,
    practice_count:pack.practice_questions.length
  },201);
}

async function getHistoricalKeysApi(url,env,user){
  if(url.searchParams.get("list")==="1"){
    const rows=await env.DB.prepare(`
      SELECT id,title,metadata_json,updated_at FROM notes
      WHERE user_id=? AND tags_json LIKE '%historical_keys_pack%'
      ORDER BY datetime(updated_at) DESC LIMIT 100
    `).bind(user.id).all();
    return json({packs:(rows.results||[]).map(r=>{
      const m=parseJsonLoose(r.metadata_json)||{};
      return {id:r.id,title:r.title,study_title:m.study_title,subject:m.subject,source_count:Number(m.source_count||0),updated_at:r.updated_at};
    })});
  }
  const id=cleanText(url.searchParams.get("id"),220);
  if(!id)return json({error:"Falta el identificador del paquete."},400);
  const row=await env.DB.prepare(`
    SELECT id,title,body,metadata_json,updated_at FROM notes
    WHERE id=? AND user_id=? AND tags_json LIKE '%historical_keys_pack%' LIMIT 1
  `).bind(id,user.id).first();
  if(!row)return json({error:"No encontré ese repaso de claves."},404);
  const pack=parseJsonLoose(row.body);
  if(!pack)return json({error:"No pude leer el paquete guardado."},500);
  return json({source:{id:row.id,title:row.title,metadata_json:row.metadata_json,updated_at:row.updated_at},pack});
}

async function getLibraryExtractedText(env,user,fileId){
  return libraryExtractTextCore(env,user,fileId);
}

function bytesToBase64Standard(bytes){
  let binary="";
  const chunk=0x8000;
  for(let i=0;i<bytes.length;i+=chunk){
    const part=bytes.subarray(i,Math.min(bytes.length,i+chunk));
    binary+=String.fromCharCode(...part);
  }
  return btoa(binary);
}

async function listMistakes(env, user) {
  const rows = await env.DB.prepare(`
    SELECT m.*,t.name AS topic_name
    FROM mistakes m LEFT JOIN topics t ON t.id=m.topic_id
    WHERE m.user_id=? ORDER BY resolved ASC, datetime(m.updated_at) DESC LIMIT 300
  `).bind(user.id).all();
  return json({ mistakes: rows.results || [] });
}


// ============================================================
// V29 FINAL · MEDIA, EXAM PREP, QUESTION BANK, PROGRESS & EXPORT
// ============================================================

function sanitizeTranscriptionPack(parsed,sourceName){
  const flash=(Array.isArray(parsed?.flashcards)?parsed.flashcards:[]).slice(0,20).map(x=>({
    front:cleanText(x.front,1400),back:cleanText(x.back,2600)
  })).filter(x=>x.front&&x.back);
  const questions=sanitizeHistoricalQuiz(parsed?.questions,15);
  const sections=(Array.isArray(parsed?.sections)?parsed.sections:[]).slice(0,12).map(x=>({
    title:cleanText(x.title,360),
    explanation:cleanText(x.explanation||x.content,6000),
    key_points:Array.isArray(x.key_points)?x.key_points.slice(0,10).map(y=>cleanText(y,900)).filter(Boolean):[]
  })).filter(x=>x.title&&x.explanation);
  if(!sections.length)return null;
  return {
    version:29,transcription_pack:true,
    title:cleanText(parsed?.title,380)||`Clase transcrita · ${sourceName}`,
    overview:cleanText(parsed?.overview,2800),
    sections,
    must_remember:Array.isArray(parsed?.must_remember)?parsed.must_remember.slice(0,20).map(x=>cleanText(x,1000)).filter(Boolean):[],
    flashcards:flash,
    questions,
    source_digest:cleanText(parsed?.source_digest,14000)
  };
}

async function transcribeLibraryMediaApi(request,env,user){
  ensureAI(env);requireLibraryR2(env);
  const body=await readJson(request),fileId=cleanText(body.file_id,220),subject=cleanText(body.subject,300);
  if(!fileId)return json({error:"Falta el archivo de audio/video."},400);

  const {row,meta}=await getLibraryFileRow(env,user,fileId);
  const name=meta.original_name||row.title||"Clase";
  const mime=String(meta.mime_type||"").toLowerCase();
  if(!mime.startsWith("audio/")&&!mime.startsWith("video/")&&!/\.(mp3|wav|m4a|ogg|webm|mp4|mpeg|mpga)$/i.test(name)){
    return json({error:"Selecciona un archivo de audio o video compatible."},400);
  }

  const existing=await env.DB.prepare(`
    SELECT id,body,metadata_json,updated_at FROM notes
    WHERE user_id=? AND tags_json LIKE '%transcription_pack_v29%'
    ORDER BY datetime(updated_at) DESC LIMIT 100
  `).bind(user.id).all();
  for(const r of (existing.results||[])){
    const m=parseJsonLoose(r.metadata_json)||{};
    if(m.source_file_id===fileId){
      return json({ok:true,id:r.id,cached:true,pack:parseJsonLoose(r.body),transcript_cached:true});
    }
  }

  const obj=await env.LIBRARY.get(meta.r2_key);
  if(!obj)return json({error:"El audio/video ya no está disponible en R2."},404);
  const buffer=await obj.arrayBuffer();
  if(buffer.byteLength>25_000_000){
    return json({error:"Para transcripción directa, usa archivos de hasta 25 MB. Divide una clase larga en partes y MED AI podrá estudiar cada segmento."},413);
  }
  const audioBytes=new Uint8Array(buffer);
  const whisperModels=["@cf/openai/whisper-large-v3-turbo","@cf/openai/whisper"];
  let transcript="",usedWhisper="",lastErr=null;
  for(const model of whisperModels){
    try{
      // Prefer the compact typed-array shape to avoid multiplying memory on long recordings.
      let res;
      try{
        res=await env.AI.run(model,{audio:audioBytes},gatewayOptions("lecture_transcription",{model_used:model}));
      }catch(first){
        // Some Workers AI revisions expect a normal number array. Only use that
        // fallback for smaller files so a large class cannot exhaust Worker memory.
        if(buffer.byteLength>8_000_000)throw first;
        res=await env.AI.run(model,{audio:[...audioBytes]},gatewayOptions("lecture_transcription",{model_used:model}));
      }
      transcript=cleanText(res?.text||res?.transcription||res?.result?.text||extractCloudflareText(res),120000);
      if(transcript.length>40){usedWhisper=model;break}
    }catch(err){lastErr=err}
  }
  if(transcript.length<40){
    return json({error:`No pude transcribir este archivo${lastErr?`: ${String(lastErr?.message||lastErr).slice(0,220)}`:"."}`},422);
  }

  const transcriptKey=`${meta.r2_key}.medai-v29-transcript.txt`;
  await env.LIBRARY.put(transcriptKey,transcript,{
    httpMetadata:{contentType:"text/plain; charset=utf-8"},
    customMetadata:{source_file_id:fileId,user_id:user.id,medai:"v29-transcript",model:usedWhisper}
  });

  const prompt=`Convierte esta TRANSCRIPCIÓN DE CLASE en un paquete de estudio riguroso.
Materia/contexto: ${subject||"no indicado"}
Archivo: ${name}

Devuelve SOLO JSON:
{
 "title":"...",
 "overview":"...",
 "sections":[{"title":"...","explanation":"explicación completa","key_points":["..."]}],
 "must_remember":["..."],
 "flashcards":[{"front":"...","back":"..."}],
 "questions":[{"stem":"...","options":["A","B","C","D"],"correctIndex":0,"explanation":"...","topic":"...","difficulty":2}],
 "source_digest":"..."
}
REQUISITOS:
- 4 a 10 sections si el contenido lo permite.
- hasta 15 flashcards.
- EXACTAMENTE 12 preguntas nuevas si hay suficiente contenido.
- No inventes que el profesor dijo algo que no aparece en la transcripción.
- Si agregas explicación académica complementaria, mantenla coherente y claramente docente.

===== TRANSCRIPCIÓN =====
${transcript.slice(0,100000)}
===== FIN =====`;

  let parsed=null,lastAI=null;
  try{
    const res=await callCloudflareAI(env,{
      model:PREMIUM_FLASH_MODEL,task:"lecture_study_pack",
      messages:[
        {role:"system",content:"Eres un profesor universitario. Organiza una transcripción en material de estudio y devuelve únicamente JSON válido."},
        {role:"user",content:prompt}
      ],
      max_tokens:7200,temperature:0.12,response_format:{type:"json_object"}
    });
    parsed=parseJsonLoose(extractCloudflareText(res));
  }catch(err){lastAI=err}
  const pack=sanitizeTranscriptionPack(parsed,name);
  if(!pack)return json({error:lastAI?workersAIUserMessage(lastAI):"La transcripción se obtuvo, pero no pude construir el paquete de estudio."},502);

  const id=crypto.randomUUID(),now=new Date().toISOString();
  const metadata={transcription_pack_v29:true,source_file_id:fileId,source_name:name,subject,whisper_model:usedWhisper,transcript_r2_key:transcriptKey,study_title:pack.title};
  await env.DB.prepare(`
    INSERT INTO notes
    (id,user_id,subject_id,topic_id,title,body,tags_json,pinned,metadata_json,sync_version,created_at,updated_at)
    VALUES (?,?,?,?,?,?,?,0,?,1,?,?)
  `).bind(id,user.id,null,null,`CLASE TRANSCRITA · ${name}`,JSON.stringify(pack),JSON.stringify(["transcription_pack_v29","study_pack","v29"]),JSON.stringify(metadata),now,now).run();

  const cardStatements=[];
  for(const card of (pack.flashcards||[]).slice(0,20)){
    cardStatements.push(env.DB.prepare(`
      INSERT INTO flashcards
      (id,user_id,topic_id,source_type,front,back,hint,tags_json,ease_factor,interval_days,repetitions,lapses,due_at,suspended,metadata_json,sync_version,created_at,updated_at)
      VALUES (?,?,NULL,'transcription',?,?,?,?,2.5,0,0,0,?,0,?,1,?,?)
    `).bind(
      crypto.randomUUID(),user.id,card.front,card.back,"",JSON.stringify(["transcription","v29",subject||""]),
      now,JSON.stringify({source_ref:id,source_file_id:fileId,source_name:name,subject}),now,now
    ));
  }
  if(cardStatements.length)await env.DB.batch(cardStatements);
  await questionBankUpsertQuestions(env,user,pack.questions,{source_type:"transcription",source_ref:id,subject:subject||"",source_name:name});
  return json({ok:true,id,cached:false,pack,transcript_preview:transcript.slice(0,3500),whisper_model:usedWhisper,flashcards_saved:cardStatements.length},201);
}

function normalizeBankQuestion(q,context={}){
  const options=Array.isArray(q?.options)?q.options.slice(0,4).map(x=>cleanText(x,1000)):[];
  const stem=cleanText(q?.stem||q?.question,1800);
  if(!stem||options.length!==4)return null;
  let inferred=Number(q.difficulty||context.difficulty||0);
  if(!Number.isFinite(inferred)||inferred<=0){
    inferred=2;
    if(stem.length>220||/caso|paciente|calcula|determine|integra|analiza|razonamiento|mecanismo/i.test(stem))inferred=3;
    if(stem.length>420||/mejor conducta|más probable|excepto|combinación|multietapa|demuestre/i.test(stem))inferred=4;
  }
  return {
    stem,
    options,
    correctIndex:clamp(Number(q.correctIndex),0,3),
    explanation:cleanText(q.explanation,2400),
    topic:cleanText(q.topic||q.skill||context.topic,300),
    subject:cleanText(q.subject||context.subject,300),
    difficulty:clamp(inferred,1,5),
    source_type:cleanText(context.source_type||q.source_type,80)||"generated",
    source_ref:cleanText(context.source_ref||q.source_ref,220),
    source_name:cleanText(context.source_name||q.source_name,320)
  };
}

async function questionBankUpsertQuestions(env,user,questions,context={}){
  const normalized=(Array.isArray(questions)?questions:[]).map(q=>normalizeBankQuestion(q,context)).filter(Boolean).slice(0,100);
  if(!normalized.length)return 0;
  const now=new Date().toISOString(),statements=[];
  for(const q of normalized){
    const fingerprint=await sha256(smartNormalize(q.stem));
    const id=`qb29_${fingerprint}`;
    const metadata={question_bank_v29:true,fingerprint,subject:q.subject,topic:q.topic,difficulty:q.difficulty,source_type:q.source_type,source_ref:q.source_ref,source_name:q.source_name};
    statements.push(env.DB.prepare(`
      INSERT OR IGNORE INTO notes
      (id,user_id,subject_id,topic_id,title,body,tags_json,pinned,metadata_json,sync_version,created_at,updated_at)
      VALUES (?,?,?,?,?,?,?,0,?,1,?,?)
    `).bind(id,user.id,null,null,`PREGUNTA · ${q.topic||q.subject||"Banco"}`,JSON.stringify(q),JSON.stringify(["question_bank_v29","v29"]),JSON.stringify(metadata),now,now));
  }
  for(let i=0;i<statements.length;i+=40)await env.DB.batch(statements.slice(i,i+40));
  return statements.length;
}

async function questionBankRows(env,user){
  const rows=await env.DB.prepare(`
    SELECT id,title,body,metadata_json,created_at,updated_at FROM notes
    WHERE user_id=? AND tags_json LIKE '%question_bank_v29%'
    ORDER BY datetime(updated_at) DESC LIMIT 3000
  `).bind(user.id).all();
  return (rows.results||[]).map(r=>{
    const q=parseJsonLoose(r.body)||{},m=parseJsonLoose(r.metadata_json)||{};
    return {id:r.id,...q,difficulty:Number(q.difficulty||m.difficulty||2),subject:q.subject||m.subject||"",topic:q.topic||m.topic||"",updated_at:r.updated_at};
  }).filter(q=>q.stem&&Array.isArray(q.options)&&q.options.length===4);
}

async function questionBankApi(url,env,user){
  const subject=smartNormalize(url.searchParams.get("subject")||"");
  const q=smartNormalize(url.searchParams.get("q")||"");
  let rows=await questionBankRows(env,user);
  if(subject)rows=rows.filter(x=>smartNormalize(x.subject).includes(subject)||smartNormalize(x.topic).includes(subject));
  if(q)rows=rows.filter(x=>smartNormalize(`${x.stem} ${x.topic} ${x.subject}`).includes(q));
  const byDifficulty={1:0,2:0,3:0,4:0,5:0},subjects={};
  for(const x of rows){
    byDifficulty[clamp(Number(x.difficulty||2),1,5)]++;
    const s=x.subject||"Sin materia";subjects[s]=(subjects[s]||0)+1;
  }
  return json({questions:rows.slice(0,600),total:rows.length,by_difficulty:byDifficulty,subjects});
}

async function deleteQuestionBankApi(url,env,user){
  const id=cleanText(url.searchParams.get("id"),220);
  if(!id)return json({error:"Falta id."},400);
  await env.DB.prepare(`DELETE FROM notes WHERE id=? AND user_id=? AND tags_json LIKE '%question_bank_v29%'`).bind(id,user.id).run();
  return json({ok:true});
}

async function adaptiveExamStartApi(url,env,user){
  const subject=cleanText(url.searchParams.get("subject"),300);
  const count=clamp(Number(url.searchParams.get("count")||20),10,40);
  let bank=await questionBankRows(env,user);
  if(subject){
    const norm=smartNormalize(subject);
    bank=bank.filter(q=>smartNormalize(q.subject).includes(norm)||smartNormalize(q.topic).includes(norm));
  }
  // If the permanent bank is still small, seed it from saved historical-key packs.
  if(bank.length<count){
    const packs=await env.DB.prepare(`
      SELECT id,body,metadata_json FROM notes WHERE user_id=? AND tags_json LIKE '%historical_keys_pack%'
      ORDER BY datetime(updated_at) DESC LIMIT 80
    `).bind(user.id).all();
    const candidates=[];
    for(const r of (packs.results||[])){
      const p=parseJsonLoose(r.body)||{},m=parseJsonLoose(r.metadata_json)||{};
      const subj=p.subject||m.subject||"";
      if(subject&&!smartNormalize(subj).includes(smartNormalize(subject)))continue;
      candidates.push(...(p.practice_questions||[]),...(p.final_exam||[]));
    }
    if(candidates.length){
      await questionBankUpsertQuestions(env,user,candidates,{source_type:"historical_keys",subject});
      bank=await questionBankRows(env,user);
      if(subject){
        const norm=smartNormalize(subject);
        bank=bank.filter(q=>smartNormalize(q.subject).includes(norm)||smartNormalize(q.topic).includes(norm));
      }
    }
  }
  if(bank.length<5)return json({error:"Aún no hay suficientes preguntas para un examen adaptativo. Haz exámenes o crea un paquete en Antes del parcial para alimentar el banco."},422);

  // Return a broad pool. The browser selects the next item according to current difficulty.
  bank.sort((a,b)=>Number(a.difficulty||2)-Number(b.difficulty||2));
  const perLevel=Math.max(8,Math.ceil(count*1.5));
  const pool=[];
  for(let level=1;level<=5;level++)pool.push(...bank.filter(x=>Number(x.difficulty||2)===level).slice(0,perLevel));
  const unique=[],seen=new Set();
  for(const q of [...pool,...bank]){
    const k=smartNormalize(q.stem);if(!k||seen.has(k))continue;seen.add(k);unique.push(q);
    if(unique.length>=Math.min(100,count*4))break;
  }
  return json({subject:subject||"Mi banco",target_count:Math.min(count,unique.length),pool:unique});
}

function examPlanTopicCandidates(historical,weakRows){
  const map=new Map();
  for(const t of (historical?.recurring_topics||[])){
    const key=smartNormalize(t.name);if(!key)continue;
    map.set(key,{name:t.name,score:Number(t.historical_weight||10)+Number(t.occurrence_count||1)*8,reason:`Apareció en ${Number(t.occurrence_count||1)} archivo(s) histórico(s)`});
  }
  for(const w of (weakRows||[])){
    const key=smartNormalize(w.topic_name);if(!key)continue;
    const weakness=100-Number(w.mastery||0),prev=map.get(key)||{name:w.topic_name,score:0,reason:""};
    prev.score+=weakness;
    prev.reason=[prev.reason,`dominio actual ${Math.round(Number(w.mastery||0))}%`].filter(Boolean).join(" · ");
    map.set(key,prev);
  }
  return [...map.values()].sort((a,b)=>b.score-a.score);
}

async function createExamPrepPlanApi(request,env,user){
  const body=await readJson(request);
  const subject=cleanText(body.subject,300),title=cleanText(body.title,300)||`Parcial de ${subject||"estudio"}`;
  const dueAt=cleanText(body.due_at,80),dailyMinutes=clamp(Number(body.daily_minutes||60),20,240);
  if(!subject||!dueAt)return json({error:"Materia y fecha del parcial son obligatorias."},400);
  const due=new Date(dueAt),today=new Date();
  if(!Number.isFinite(due.getTime()))return json({error:"Fecha inválida."},400);
  const days=Math.max(1,Math.min(60,Math.ceil((due-today)/86400000)));

  const subjectRow=await env.DB.prepare(`SELECT id,name FROM subjects WHERE lower(name)=lower(?) OR lower(code)=lower(?) LIMIT 1`).bind(subject,subject).first().catch(()=>null);
  const weak=subjectRow?await env.DB.prepare(`
    SELECT p.mastery,t.name AS topic_name FROM user_topic_progress p JOIN topics t ON t.id=p.topic_id
    WHERE p.user_id=? AND t.subject_id=? ORDER BY p.mastery ASC LIMIT 25
  `).bind(user.id,subjectRow.id).all():{results:[]};

  const packs=await env.DB.prepare(`
    SELECT body,metadata_json FROM notes WHERE user_id=? AND tags_json LIKE '%historical_keys_pack%'
    ORDER BY datetime(updated_at) DESC LIMIT 100
  `).bind(user.id).all();
  let historical=null;
  for(const r of (packs.results||[])){
    const p=parseJsonLoose(r.body)||{},m=parseJsonLoose(r.metadata_json)||{};
    if(smartNormalize(p.subject||m.subject).includes(smartNormalize(subject))){historical=p;break}
  }

  let topics=examPlanTopicCandidates(historical,weak.results||[]);
  if(!topics.length)topics=[{name:`Fundamentos de ${subject}`,score:50,reason:"Aún no hay datos de dominio; usa tu programa oficial y materiales de clase."}];

  const sessions=[];
  const studyDays=Math.max(1,days-2);
  for(let d=0;d<studyDays;d++){
    const date=new Date(today.getTime()+d*86400000).toISOString().slice(0,10);
    const t1=topics[d%topics.length],t2=topics[(d+1)%topics.length];
    sessions.push({
      day:d+1,date,title:`Clase + práctica · ${t1.name}`,
      minutes:dailyMinutes,
      focus:[t1.name,...(dailyMinutes>=80&&t2.name!==t1.name?[t2.name]:[])],
      task:"Estudia el concepto, haz recuperación activa y termina con preguntas del banco.",
      reason:t1.reason
    });
  }
  if(days>=2)sessions.push({
    day:sessions.length+1,
    date:new Date(due.getTime()-2*86400000).toISOString().slice(0,10),
    title:"Repaso de errores",minutes:dailyMinutes,
    focus:topics.slice(0,4).map(x=>x.name),
    task:"Haz Repaso inteligente y vuelve a los conceptos que aún fallas.",
    reason:"Consolidación antes del simulacro"
  });
  sessions.push({
    day:sessions.length+1,
    date:new Date(due.getTime()-86400000).toISOString().slice(0,10),
    title:"Simulacro final",minutes:Math.min(120,dailyMinutes),
    focus:topics.slice(0,6).map(x=>x.name),
    task:"Haz un examen adaptativo o el examen final de Antes del parcial. Después revisa solo errores.",
    reason:"Evaluación final antes del parcial"
  });

  const plan={version:29,exam_prep_plan:true,title,subject,due_at:dueAt,daily_minutes:dailyMinutes,days_remaining:days,priority_topics:topics.slice(0,12),sessions};
  const now=new Date().toISOString();
  const meta={exam_prep_plan_v29:true,subject,due_at:dueAt,study_title:title};

  // Reuse/update the latest plan for the same subject instead of creating duplicates.
  let planId=null;
  const existingPlans=await env.DB.prepare(`
    SELECT id,metadata_json FROM notes
    WHERE user_id=? AND tags_json LIKE '%exam_prep_plan_v29%'
    ORDER BY datetime(updated_at) DESC LIMIT 100
  `).bind(user.id).all();
  for(const r of (existingPlans.results||[])){
    const m=parseJsonLoose(r.metadata_json)||{};
    if(smartNormalize(m.subject)===smartNormalize(subject)){planId=r.id;break}
  }

  if(planId){
    await env.DB.prepare(`
      UPDATE notes SET subject_id=?,title=?,body=?,metadata_json=?,updated_at=?,sync_version=sync_version+1
      WHERE id=? AND user_id=?
    `).bind(subjectRow?.id||null,`PLAN PARCIAL · ${subject}`,JSON.stringify(plan),JSON.stringify(meta),now,planId,user.id).run();
  }else{
    planId=crypto.randomUUID();
    await env.DB.prepare(`
      INSERT INTO notes
      (id,user_id,subject_id,topic_id,title,body,tags_json,pinned,metadata_json,sync_version,created_at,updated_at)
      VALUES (?,?,?,?,?,?,?,0,?,1,?,?)
    `).bind(planId,user.id,subjectRow?.id||null,null,`PLAN PARCIAL · ${subject}`,JSON.stringify(plan),JSON.stringify(["exam_prep_plan_v29","smart_study","v29"]),JSON.stringify(meta),now,now).run();
  }

  // Reuse/update an existing incomplete exam deadline for the same subject/title.
  let deadline=null;
  if(subjectRow?.id){
    deadline=await env.DB.prepare(`
      SELECT id FROM academic_deadlines
      WHERE user_id=? AND completed=0 AND deadline_type='exam' AND subject_id=?
      ORDER BY datetime(updated_at) DESC LIMIT 1
    `).bind(user.id,subjectRow.id).first();
  }else{
    deadline=await env.DB.prepare(`
      SELECT id FROM academic_deadlines
      WHERE user_id=? AND completed=0 AND deadline_type='exam' AND lower(title)=lower(?)
      ORDER BY datetime(updated_at) DESC LIMIT 1
    `).bind(user.id,title).first();
  }

  let deadlineId=deadline?.id||crypto.randomUUID();
  if(deadline?.id){
    await env.DB.prepare(`
      UPDATE academic_deadlines
      SET title=?,subject_id=?,due_at=?,importance=5,notes=?,updated_at=?
      WHERE id=? AND user_id=?
    `).bind(title,subjectRow?.id||null,dueAt,"Creado/actualizado desde Antes del parcial · V30",now,deadline.id,user.id).run();
  }else{
    await env.DB.prepare(`
      INSERT INTO academic_deadlines
      (id,user_id,title,deadline_type,subject_id,due_at,importance,notes,completed,created_at,updated_at)
      VALUES (?,?,?,?,?,?,?,?,0,?,?)
    `).bind(deadlineId,user.id,title,"exam",subjectRow?.id||null,dueAt,5,"Creado desde Antes del parcial · V30",now,now).run();
  }

  return json({ok:true,id:planId,deadline_id:deadlineId,updated:!!planId,plan},201);
}

async function getExamPrepPlanApi(url,env,user){
  const subject=smartNormalize(url.searchParams.get("subject")||"");
  const rows=await env.DB.prepare(`
    SELECT id,title,body,metadata_json,updated_at FROM notes
    WHERE user_id=? AND tags_json LIKE '%exam_prep_plan_v29%'
    ORDER BY datetime(updated_at) DESC LIMIT 50
  `).bind(user.id).all();
  for(const r of (rows.results||[])){
    const p=parseJsonLoose(r.body)||{};
    if(!subject||smartNormalize(p.subject).includes(subject))return json({id:r.id,plan:p,updated_at:r.updated_at});
  }
  return json({plan:null});
}

async function progressOverviewApi(env,user){
  const rows=await env.DB.prepare(`
    SELECT s.id AS subject_id,s.code,s.name AS subject_name,t.id AS topic_id,t.name AS topic_name,
           COALESCE(p.mastery,0) AS mastery,COALESCE(p.questions_answered,0) AS questions_answered,
           COALESCE(p.questions_correct,0) AS questions_correct,p.last_studied_at
    FROM subjects s JOIN topics t ON t.subject_id=s.id AND t.active=1
    LEFT JOIN user_topic_progress p ON p.topic_id=t.id AND p.user_id=?
    WHERE s.active=1
    ORDER BY s.sort_order,s.name,t.sort_order,t.name
  `).bind(user.id).all();

  const subjects=new Map(),totals={dominated:0,learning:0,review:0,not_started:0};
  const now=Date.now();
  for(const r of (rows.results||[])){
    const answered=Number(r.questions_answered||0),correct=Number(r.questions_correct||0),mastery=Number(r.mastery||0);
    const accuracy=answered?Math.round(correct/answered*100):0;
    const last=r.last_studied_at?new Date(r.last_studied_at).getTime():0;
    const daysSince=last?Math.max(0,Math.floor((now-last)/86400000)):null;
    const stale=daysSince!==null&&daysSince>45;

    let status="not_started";
    if(answered>0){
      if(answered>=12&&mastery>=85&&accuracy>=80&&!stale)status="dominated";
      else if(answered>=4&&mastery>=50&&!stale)status="learning";
      else status="review";
    }else if(mastery>0){
      status=mastery>=50?"learning":"review";
    }

    const evidence=answered>=20?"high":answered>=8?"medium":answered>0?"low":"none";
    totals[status]++;
    if(!subjects.has(r.subject_id))subjects.set(r.subject_id,{id:r.subject_id,code:r.code,name:r.subject_name,dominated:0,learning:0,review:0,not_started:0,topics:[]});
    const s=subjects.get(r.subject_id);s[status]++;
    s.topics.push({
      id:r.topic_id,name:r.topic_name,mastery,questions_answered:answered,questions_correct:correct,accuracy,
      last_studied_at:r.last_studied_at||null,days_since_study:daysSince,status,evidence,
      mastery_rule:status==="dominated"?"≥12 preguntas · dominio ≥85% · precisión ≥80% · repaso reciente":"Dominio requiere evidencia repetida"
    });
  }
  return json({
    totals,subjects:[...subjects.values()],
    rules:{dominated:"≥12 preguntas, dominio ≥85%, precisión ≥80% y actividad en los últimos 45 días",learning:"evidencia parcial con dominio ≥50%",review:"errores, evidencia insuficiente o conocimiento que necesita refresco"}
  });
}

// ---------- ZIP export without external dependencies ----------
const CRC32_TABLE=(()=>{
  const table=new Uint32Array(256);
  for(let n=0;n<256;n++){
    let c=n;
    for(let k=0;k<8;k++)c=(c&1)?0xEDB88320^(c>>>1):c>>>1;
    table[n]=c>>>0;
  }
  return table;
})();
function crc32(bytes){
  let c=0xFFFFFFFF;
  for(const b of bytes)c=CRC32_TABLE[(c^b)&0xFF]^(c>>>8);
  return (c^0xFFFFFFFF)>>>0;
}
function le16(n){return Uint8Array.of(n&255,(n>>>8)&255)}
function le32(n){return Uint8Array.of(n&255,(n>>>8)&255,(n>>>16)&255,(n>>>24)&255)}
function concatBytes(parts){
  const len=parts.reduce((s,p)=>s+p.length,0),out=new Uint8Array(len);let at=0;
  for(const p of parts){out.set(p,at);at+=p.length}return out;
}
function buildStoreZip(entries){
  const enc=new TextEncoder(),locals=[],centrals=[];let offset=0;
  for(const entry of entries){
    const name=enc.encode(entry.name),data=typeof entry.data==="string"?enc.encode(entry.data):entry.data;
    const crc=crc32(data);
    const local=concatBytes([le32(0x04034b50),le16(20),le16(0),le16(0),le16(0),le16(0),le32(crc),le32(data.length),le32(data.length),le16(name.length),le16(0),name,data]);
    locals.push(local);
    const central=concatBytes([le32(0x02014b50),le16(20),le16(20),le16(0),le16(0),le16(0),le16(0),le32(crc),le32(data.length),le32(data.length),le16(name.length),le16(0),le16(0),le16(0),le16(0),le32(0),le32(offset),name]);
    centrals.push(central);offset+=local.length;
  }
  const centralData=concatBytes(centrals),localData=concatBytes(locals);
  const end=concatBytes([le32(0x06054b50),le16(0),le16(0),le16(entries.length),le16(entries.length),le32(centralData.length),le32(localData.length),le16(0)]);
  return concatBytes([localData,centralData,end]);
}
async function systemExportApi(env,user){
  const backup=await collectSystemBackupData(env,user);
  const tables=backup.tables||{};
  const questionBank=(tables.notes||[]).filter(r=>String(r.tags_json||"").includes("question_bank_v29"));
  const entries=[
    {name:"MED_AI_EXPORT.json",data:JSON.stringify(backup,null,2)},
    {name:"library_manifest.json",data:JSON.stringify(backup.library_manifest||[],null,2)},
    {name:"notes.json",data:JSON.stringify(tables.notes||[],null,2)},
    {name:"exams.json",data:JSON.stringify(tables.exams||[],null,2)},
    {name:"mistakes.json",data:JSON.stringify(tables.mistakes||[],null,2)},
    {name:"question_bank.json",data:JSON.stringify(questionBank,null,2)}
  ];
  const zip=buildStoreZip(entries);
  const date=new Date().toISOString().slice(0,10);
  return new Response(zip,{headers:{
    "content-type":"application/zip",
    "content-disposition":`attachment; filename="MED_AI_DALTON_EXPORT_${date}.zip"`,
    "cache-control":"no-store"
  }});
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
  const q=cleanText(url.searchParams.get("q"),160);
  if(!q)return json({results:[]});
  const like=`%${q}%`;
  const [topicsRows,lessonRows,noteRows,flashRows,mistakeRows]=await Promise.all([
    env.DB.prepare(`
      SELECT 'topic' AS type,t.id,t.name AS title,s.name AS subtitle,t.subject_id
      FROM topics t JOIN subjects s ON s.id=t.subject_id
      WHERE t.active=1 AND (t.name LIKE ? OR t.description LIKE ?)
      LIMIT 25
    `).bind(like,like).all(),
    env.DB.prepare(`
      SELECT 'lesson' AS type,l.id,l.title,t.name AS subtitle,t.subject_id
      FROM lessons l JOIN topics t ON t.id=l.topic_id
      WHERE l.active=1 AND (l.title LIKE ? OR l.summary LIKE ?)
      LIMIT 25
    `).bind(like,like).all(),
    env.DB.prepare(`
      SELECT id,title,body,tags_json,metadata_json,subject_id,updated_at
      FROM notes WHERE user_id=? AND (title LIKE ? OR body LIKE ?)
      ORDER BY datetime(updated_at) DESC LIMIT 50
    `).bind(user.id,like,like).all(),
    env.DB.prepare(`
      SELECT 'flashcard' AS type,id,front AS title,back AS subtitle,topic_id
      FROM flashcards WHERE user_id=? AND (front LIKE ? OR back LIKE ?)
      ORDER BY datetime(updated_at) DESC LIMIT 20
    `).bind(user.id,like,like).all(),
    env.DB.prepare(`
      SELECT 'mistake' AS type,id,prompt AS title,correct_answer AS subtitle,topic_id
      FROM mistakes WHERE user_id=? AND (prompt LIKE ? OR correct_answer LIKE ? OR explanation LIKE ?)
      ORDER BY datetime(updated_at) DESC LIMIT 20
    `).bind(user.id,like,like,like).all()
  ]);

  const results=[];
  for(const r of (topicsRows.results||[]))results.push({...r,view:"study",label:"Tema"});
  for(const r of (lessonRows.results||[]))results.push({...r,view:"study",label:"Lección"});
  for(const r of (noteRows.results||[])){
    const src=smartSourceFromNote(r);
    if(src){
      results.push({
        type:src.type,id:src.id,title:src.title,
        subtitle:[src.label,src.scope].filter(Boolean).join(" · "),
        view:src.type==="course"?"study":src.type==="historical_keys"?"exam_prep":"smart",
        label:src.label,primary:!!src.meta?.primary_source_v30,updated_at:r.updated_at
      });
    }else{
      const tags=parseJsonLoose(r.tags_json)||[];
      if(tags.includes("library_file")){
        const meta=parseLibraryMeta(r);
        results.push({
          type:"library_file",id:r.id,title:r.title,
          subtitle:`Biblioteca${meta.primary_source_v30?" · ★ FUENTE PRINCIPAL":""}`,
          view:"library",label:"Archivo",primary:!!meta.primary_source_v30
        });
      }
    }
  }
  for(const r of (flashRows.results||[]))results.push({...r,view:"flashcards",label:"Flashcard"});
  for(const r of (mistakeRows.results||[]))results.push({...r,view:"mistakes",label:"Error"});

  const norm=smartNormalize(q);
  const ranked=results.map((r,i)=>{
    const title=smartNormalize(r.title),sub=smartNormalize(r.subtitle);
    let score=r.primary?30:0;
    if(title===norm)score+=80;
    else if(title.includes(norm))score+=45;
    if(sub.includes(norm))score+=20;
    score+=Math.max(0,15-i/4);
    return {...r,score};
  }).sort((a,b)=>b.score-a.score).slice(0,60);
  return json({query:q,results:ranked});
}

async function recordExam(request, env, user) {
  const body = await readJson(request);
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const pct = clamp(Number(body.percentage || 0),0,100);
  const questions = Array.isArray(body.questions) ? body.questions.slice(0, 100) : [];
  const answers = body.answers && typeof body.answers === "object" ? body.answers : {};
  const settings = body.settings && typeof body.settings === "object" ? body.settings : {};
  const attemptSourceType = settings.diagnostic ? "diagnostic_v30" : settings.serious_exam ? "serious_exam_v30" : settings.adaptive_exam ? "adaptive_exam" : settings.historical_keys ? "historical_keys_exam" : "ai_exam";
  const attemptSourceRef = settings.historical_keys_pack_id ? String(settings.historical_keys_pack_id) : id;

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
      VALUES (?,?,NULL,NULL,?,?,?,?,?,?,?)
    `).bind(
      attemptId,user.id,attemptSourceType,JSON.stringify(snapshot),JSON.stringify({chosenIndex:answered?chosen:null}),
      isCorrect?1:0,isCorrect?1:0,now,JSON.stringify(settings)
    ));

    if (!isCorrect) {
      const correctText=Array.isArray(q.options) && q.options[correct]!==undefined ? String(q.options[correct]) : String(correct);
      const userText=answered && Array.isArray(q.options) && q.options[chosen]!==undefined ? String(q.options[chosen]) : "Sin respuesta";
      statements.push(env.DB.prepare(`
        INSERT INTO mistakes
        (id,user_id,topic_id,question_attempt_id,source_type,source_ref,prompt,user_answer,correct_answer,explanation,error_category,mastery_score,times_failed,times_correct_after,next_review_at,resolved,metadata_json,sync_version,created_at,updated_at)
        VALUES (?,?,NULL,?,?,?,?,?,? ,?,'pregunta_examen',0,1,0,?,0,?,1,?,?)
      `).bind(
        crypto.randomUUID(),user.id,attemptId,attemptSourceType,attemptSourceRef,cleanText(q.stem,4000),userText,correctText,
        cleanText(q.explanation,5000),new Date(Date.now()+86400000).toISOString(),
        JSON.stringify({exam_id:id,question_index:i,...settings}),now,now
      ));
    }
  }

  await env.DB.batch(statements);

  await bumpDailyMetric(env,user.id,{
    questions_answered:Number(body.max_score||0),
    questions_correct:Number(body.score||0),
    xp_earned:Math.round(Number(body.score||0)*2)
  });
  try{
    await questionBankUpsertQuestions(env,user,questions,{
      source_type:attemptSourceType,source_ref:id,
      subject:cleanText(settings.subject,300),source_name:cleanText(body.title,300),
      difficulty:settings.difficulty?Math.max(1,Math.min(5,Math.ceil(Number(settings.difficulty)/2))):undefined
    });
  }catch(err){console.error("QUESTION_BANK_SAVE_ERROR",err?.stack||err)}
  return json({ok:true,id});
}

// -------------------- CLOUDFLARE WORKERS AI --------------------

const AI_GATEWAY_ID = "med-ai-dalton";

// Premium models through AI Gateway Unified Billing.
const PREMIUM_PRO_MODEL = "google/gemini-2.5-pro";
const PREMIUM_FLASH_MODEL = "google/gemini-2.5-flash";
const PREMIUM_FLASH_LITE_MODEL = "google/gemini-2.5-flash-lite";

// Workers AI remains as automatic backup. These requests also pass through
// the same AI Gateway so prepaid credits can cover them when necessary.
// Current Cloudflare-hosted fallbacks.
const WORKERS_FAST_MODEL = "@cf/zai-org/glm-4.7-flash";
const WORKERS_TEXT_MODEL = "@cf/google/gemma-4-26b-a4b-it";
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
        version:SYSTEM_VERSION,
        task,
        ...extra
      }
    }
  };
}

function modelTier(model){
  if(model===PREMIUM_PRO_MODEL)return "advanced";
  if(model===PREMIUM_FLASH_MODEL)return "fast";
  if(model===PREMIUM_FLASH_LITE_MODEL)return "lite";
  if(model===WORKERS_FAST_MODEL)return "workers-fast";
  if(model===WORKERS_TEXT_MODEL)return "workers-quality";
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

      aiStream=await promiseTimeout(
        env.AI.run(
          candidate,
          input,
          gatewayOptions(`stream_${mode}`,{model_requested:model,model_used:candidate})
        ),
        candidate===PREMIUM_PRO_MODEL?45000:30000,
        candidate
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

  if(questions.length<count){
    return json({
      error:`La IA devolvió ${questions.length} de ${count} preguntas válidas. MED AI rechazó el examen incompleto; vuelve a generarlo.`,
      generated:questions.length,
      expected:count
    },502);
  }

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

      const timeoutMs =
        model===PREMIUM_PRO_MODEL ? 55000 :
        model===PREMIUM_FLASH_MODEL ? 42000 :
        model===PREMIUM_FLASH_LITE_MODEL ? 32000 :
        model===WORKERS_TEXT_MODEL ? 32000 : 26000;

      const response=await promiseTimeout(
        env.AI.run(
          model,
          input,
          gatewayOptions(options.task||"general",{
            model_requested:requested,
            model_used:model
          })
        ),
        timeoutMs,
        model
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
  if(typeof data==="string")return data.trim();

  if(typeof data.response==="string")return data.response.trim();
  if(typeof data.result?.response==="string")return data.result.response.trim();
  if(typeof data.output_text==="string")return data.output_text.trim();
  if(typeof data.result?.output_text==="string")return data.result.output_text.trim();

  const choices=[
    ...(Array.isArray(data.choices)?data.choices:[]),
    ...(Array.isArray(data.result?.choices)?data.result.choices:[])
  ];
  if(choices.length){
    const out=choices.flatMap(choice=>{
      const content=choice?.message?.content;
      if(typeof content==="string")return [content];
      if(Array.isArray(content))return content.map(x=>typeof x==="string"?x:(x?.text||x?.content||""));
      return [];
    }).filter(Boolean).join("\n").trim();
    if(out)return out;
  }

  const candidates=[
    ...(Array.isArray(data.candidates)?data.candidates:[]),
    ...(Array.isArray(data.result?.candidates)?data.result.candidates:[])
  ];
  if(candidates.length){
    const out=candidates
      .flatMap(c=>Array.isArray(c?.content?.parts)?c.content.parts:[])
      .map(p=>typeof p?.text==="string"?p.text:"")
      .filter(Boolean)
      .join("\n")
      .trim();
    if(out)return out;
  }

  if(data.result&&data.result!==data){
    const nested=extractCloudflareText(data.result);
    if(nested)return nested;
  }
  if(data.data&&data.data!==data){
    const nested=extractCloudflareText(data.data);
    if(nested)return nested;
  }
  return "";
}

function structuredJsonCandidate(data){
  if(!data||typeof data!=="object")return null;
  if(Array.isArray(data.sections)||Array.isArray(data.practice)||Array.isArray(data.exam))return data;
  for(const key of ["result","data","response","output"]){
    const child=data[key];
    if(child&&typeof child==="object"){
      const found=structuredJsonCandidate(child);
      if(found)return found;
    }
  }
  return null;
}

function parseAIJsonResponse(data){
  const direct=structuredJsonCandidate(data);
  if(direct)return direct;
  return parseJsonLoose(extractCloudflareText(data));
}

function medicalInstructions(mode){
  if(mode==="document_ocr") return `Eres un motor de OCR académico fiel. Transcribe únicamente lo visible en la imagen. Conserva títulos, numeración, listas, opciones, símbolos y fórmulas legibles. No resumas, no expliques, no corrijas y no inventes texto. Devuelve solamente la transcripción.`;
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

function cleanText(v,max=5000){return String(v??"").trim().slice(0,max);}
function nullable(v){const s=String(v??"").trim(); return s?s:null;}
function clamp(n,min,max){return Math.min(max,Math.max(min,Number.isFinite(n)?n:min));}
function delay(ms){return new Promise(r=>setTimeout(r,ms));}

async function sha256(text){
  const digest=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(text));
  return bytesToBase64url(new Uint8Array(digest));
}

function bytesToBase64url(bytes){
  let binary="";
  for(let i=0;i<bytes.length;i++) binary+=String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
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
