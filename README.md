# MED AI DALTON

Aplicación full-stack sobre Cloudflare Workers + D1 + OpenAI Responses API.

## Arquitectura

- `public/`: PWA responsive para Windows, iPhone, iPad, Android y navegador.
- `src/index.js`: Worker/API.
- Cloudflare D1: cuenta, perfil, progreso, exámenes, flashcards, casos, notas y estadísticas.
- OpenAI: Tutor IA y generación educativa.
- El proyecto ya apunta a `med_ai_dalton_db` mediante el binding `DB`.

## Módulos incluidos en la interfaz

Inicio, Estudiar, Tutor IA, Exámenes, Flashcards, Paciente virtual, Grand Rounds,
Emergencias, ECG, Radiología, Laboratorios, Farmacología, OSCE, Biblioteca,
Cuaderno de errores, Plan de estudio, Estadísticas y Perfil.

## Antes de usar la IA

NO pongas tu clave de OpenAI en GitHub ni en `wrangler.jsonc`.

Desde PowerShell/CMD en la carpeta del proyecto:

    npx.cmd wrangler secret put OPENAI_API_KEY

Pega la clave solo cuando Wrangler la pida.

## Despliegue

    npm install
    npx.cmd wrangler deploy

En Cloudflare Builds el Deploy command puede ser:

    npx wrangler deploy

No necesita Build command porque el frontend es estático.

## Seguridad de registro

`ALLOW_SIGNUPS` está en `"false"`. La aplicación permite crear la primera cuenta cuando la base aún no tiene usuarios y, después de eso, bloquea registros adicionales. Así tu MED AI queda personal desde el inicio.

## PWA

La aplicación incluye `manifest.webmanifest` y Service Worker.
Después de desplegarla se puede instalar desde navegadores compatibles.

## Nota médica

La IA está configurada para entrenamiento educativo. Para decisiones en pacientes reales,
las recomendaciones deben verificarse con fuentes clínicas actuales y juicio profesional.

