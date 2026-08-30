const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store"
};

const SESSION_DAYS = 30;
const PASSWORD_ITERATIONS = 210000;

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
    FROM topics WHERE active=1 AND subject_id=? ORDER BY sort_order,name
  `).bind(subjectId).all();
  return json({ topics: rows.results || [] });
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

const DEFAULT_TEXT_MODEL = "@cf/zai-org/glm-4.7-flash";
const DEFAULT_FAST_MODEL = "@cf/meta/llama-3.1-8b-instruct-fast";
const DEFAULT_VISION_MODEL = "@cf/google/gemma-4-26b-a4b-it";

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
    { role:"system", content:medicalInstructions(mode) + "\nSé claro y directo. Empieza por la respuesta esencial y amplía solo lo necesario." },
    ...history.map(x => ({ role:x.role, content:x.content })),
    { role:"user", content:message }
  ];

  const model = selectChatModel(mode, message);
  const maxTokens = model === DEFAULT_FAST_MODEL ? 950 : 1450;

  // Save the user message before inference so conversation continuity is safe.
  await env.DB.prepare(`
    INSERT INTO ai_messages
    (id,user_id,conversation_id,role,content,content_json,model,created_at)
    VALUES (?,?,?,'user',?,'{}',NULL,?)
  `).bind(crypto.randomUUID(),user.id,conversationId,message,now).run();

  let aiStream;
  try {
    aiStream = await env.AI.run(model, {
      messages,
      max_tokens:maxTokens,
      temperature:0.28,
      stream:true,
      chat_template_kwargs:{ enable_thinking:false }
    });
  } catch(err) {
    console.error("CLOUDFLARE_AI_STREAM_START_ERROR",err?.stack||err);
    return json({
      error:"Workers AI no pudo iniciar la respuesta. Inténtalo de nuevo en unos segundos."
    },500);
  }

  const [clientStream, archiveStream] = aiStream.tee();
  ctx.waitUntil(saveStreamedAssistantMessage(
    archiveStream, env, user.id, conversationId, model
  ));

  return new Response(clientStream, {
    status:200,
    headers:{
      "content-type":"text/event-stream; charset=utf-8",
      "cache-control":"no-cache, no-store",
      "x-accel-buffering":"no",
      "x-medai-conversation-id":conversationId,
      "x-medai-model":model,
      "x-medai-speed-mode":model === DEFAULT_FAST_MODEL ? "fast" : "advanced"
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

  // Definitions, basic explanations, anatomy, memorization and ordinary study use the fast model.
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
    messages,
    max_tokens: 1600,
    temperature: 0.35
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
    provider:"Cloudflare Workers AI"
  });
}

async function aiExam(request, env, user) {
  ensureAI(env);
  const body = await readJson(request);
  const count = clamp(Math.round(Number(body.count||10)), 5, 30);
  const difficulty = clamp(Math.round(Number(body.difficulty||3)),1,10);
  const subject = cleanText(body.subject,120)||"Medicina";
  const topic = cleanText(body.topic,160)||"contenido general";

  const prompt = `Genera ${count} preguntas de selección múltiple en español para la materia ${subject}, tema ${topic}, dificultad ${difficulty}/10.
Adapta el tipo de pregunta a la materia: en Matemática y Física incluye razonamiento y cálculos cuando corresponda; en Astronomía combina conceptos y aplicación; en Idiomas evalúa comprensión, gramática, vocabulario y uso contextual; en Medicina conserva rigor clínico.
Cada pregunta debe tener exactamente 4 opciones plausibles, una sola correcta y explicación educativa.
Devuelve EXCLUSIVAMENTE JSON válido, sin markdown ni texto antes o después, con esta forma:
{"questions":[{"stem":"...","options":["...","...","...","..."],"correctIndex":0,"explanation":"..."}]}`;

  const response = await callCloudflareAI(env,{
    model: difficulty >= 7 ? DEFAULT_TEXT_MODEL : DEFAULT_FAST_MODEL,
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
    provider:"Cloudflare Workers AI"
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
    provider:"Cloudflare Workers AI"
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
    const response = await env.AI.run(model,{
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
      max_tokens:1700,
      temperature:0.2,
      chat_template_kwargs:{enable_thinking:false}
    });

    response.__model = model;

    return json({
      answer:extractCloudflareText(response) ||
        "No pude interpretar la imagen.",
      model,
      provider:"Cloudflare Workers AI"
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
  const model = options.model || env.CLOUDFLARE_AI_MODEL || DEFAULT_TEXT_MODEL;

  try {
    const response = await env.AI.run(model,{
      messages:options.messages,
      max_tokens:options.max_tokens || 2500,
      temperature:options.temperature ?? 0.3,
      chat_template_kwargs:{
        enable_thinking:false
      }
    });

    if (response && typeof response === "object") {
      response.__model = model;
    }

    return response;
  } catch(err) {
    console.error("CLOUDFLARE_AI_ERROR",err?.stack||err);
    throw new Error(
      "Workers AI no pudo responder. Si superaste la asignación gratuita diaria, vuelve a intentarlo cuando se reinicie el límite."
    );
  }
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

  return "";
}

function medicalInstructions(mode){
  if(mode==="science") return `Responde en español y actúa como profesor universitario excelente de Matemática, Física o Astronomía según el área indicada por el estudiante.
REGLAS: enseña conceptos antes de fórmulas; no saltes pasos algebraicos importantes; define símbolos y unidades; verifica dimensiones y resultados; distingue intuición, derivación y aplicación; en problemas guía paso a paso y deja que el estudiante intente cuando la modalidad sea práctica o socrática. Corrige errores explicando exactamente dónde ocurrió el razonamiento incorrecto. Si el tema es avanzado, declara supuestos y límites de validez. Evita inventar datos o hechos científicos. Adapta la profundidad al nivel indicado.`;
  if(mode==="language") return `Actúa como profesor experto en adquisición de idiomas. El idioma nativo del estudiante es español y el idioma objetivo, nivel CEFR e inmersión vienen indicados en cada mensaje.
REGLAS OBLIGATORIAS: 1) prioriza comprensión y producción real, no listas aisladas; 2) presenta una actividad manejable por turno y espera respuesta; 3) corrige primero los errores que afectan significado o son repetitivos, explicando brevemente el porqué; 4) enseña gramática dentro de contexto; 5) recicla vocabulario previamente usado para repetición espaciada; 6) incluye conversación, lectura, escucha simulada, escritura y pronunciación de forma equilibrada; 7) respeta el porcentaje de inmersión indicado; 8) no traduzcas todo automáticamente; 9) cuando enseñes pronunciación, usa ejemplos claros y, si ayuda, IPA sin abrumar; 10) para pruebas de nivel aumenta dificultad gradualmente y estima A1-C2 solo después de suficiente evidencia. Mantén tono de profesor adulto, serio y paciente.`;
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
Adapta la profundidad al nivel que indique el estudiante y corrige errores explicando el porqué.`;
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
  if(text.length>8_000_000) throw new Error("Solicitud demasiado grande.");
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
