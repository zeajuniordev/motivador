# Motivador — Instrucciones para correr y desplegar (MVP)

Este documento describe los pasos mínimos para ejecutar el proyecto localmente, hacer pruebas y desplegar las partes serverless (BFF y backend) usando SAM. Está pensado para no perderse: comandos, ubicación de archivos importantes y ejemplos de `.env`.

**Estructura importante**
- `motivador-app-front/motivador` — Frontend (Vite + React)
- `motivador-app-bff` — BFF en Python (SAM)
- `motivador-app-back/motivador-app` — Backend en Node (SAM)

Requisitos locales (macOS - zsh):
- Node >= 18
- pnpm (recomendado para el monorepo)
- AWS CLI (opcional para despliegue)
- AWS SAM CLI (para pruebas locales y deploy)

Instalación de herramientas:

```bash
# Node / npm ya instalados: instala pnpm
npm i -g pnpm

# Instalar SAM CLI (recomendado vía Homebrew):
brew tap aws/tap
brew install aws-sam-cli

# Alternativa pip (si no usas Homebrew):
pip3 install --user aws-sam-cli
```

1) Inicializar monorepo y dependencias

```bash
# desde la raíz del repo
pnpm install
pnpm run bootstrap
```

2) Preparar variables de entorno del frontend (Vite)

- Cambia las URLs hardcodeadas en `motivador-app-front/motivador/src/pages/Subscribe.jsx` para usar `import.meta.env.VITE_API_BASE`.
- Crea un archivo `.env.local` dentro de `motivador-app-front/motivador` con la variable `VITE_API_BASE` para desarrollo local o apuntando al stage deployado.

Ejemplo `motivador-app-front/motivador/.env.local`:

```text
VITE_API_BASE=http://localhost:3000/Prod
```

3) Arrancar frontend en modo desarrollo

```bash
pnpm run dev:front
# por defecto Vite abrirá en http://localhost:5173
```

4) Ejecutar BFF localmente con SAM (dev)

```bash
cd motivador-app-bff
sam build
# probar la API localmente (ajusta puerto si es necesario)
sam local start-api --port 3000

# ahora el endpoint /registrar estará disponible en http://localhost:3000/registrar
```

Notas: si tu BFF depende de variables de entorno (TABLE_NAME, etc.), pásalas con `--env-vars env.json` cuando uses `sam local start-api` o definelas en `env.json`.

5) Ejecutar backend (generar/enviar) localmente con SAM

```bash
cd motivador-app-back/motivador-app
sam build

# Para invocar funciones lambda individualmente:
sam local invoke GenerarMensajeFunction --event events/event.json
sam local invoke EnviarMensajeFunction --event events/event.json
```

6) Configurar recursos en AWS (producción)

- DynamoDB: tabla de `Suscripciones` (ver `motivador-app-bff` código). Asegura los índices y nombres esperados.
- SQS: cola para mensajes a enviar.
- Secrets Manager: secreto con la `OPENAI_API_KEY` (o usa variable de entorno para dev).
- SES / SNS: configurar remitente verificado y permisos para envío de correos.

7) Despliegue con SAM (BFF y backend)

Recomendación: desplegar cada servicio por separado desde su carpeta.

BFF:
```bash
cd motivador-app-bff
sam deploy --guided
```

Backend (generar/enviar):
```bash
cd motivador-app-back/motivador-app
sam deploy --guided
```

Durante `sam deploy --guided` se te pedirá parámetros (stack name, región, nombres de recursos). Es útil mantener la configuración guardada para despliegues posteriores.

8) Tests

Backend unit tests (ejemplo existente):

```bash
cd motivador-app-back/motivador-app/src
npm ci
npm test
```

9) CI básico (GitHub Actions)

- Añade un workflow en `.github/workflows/ci.yml` que haga:
  - checkout
  - setup Node
  - instala pnpm
  - `pnpm install --recursive`
  - build frontend
  - ejecutar tests backend
  - opcional: `sam build` para validar compilación serverless

10) Variables y archivos `.env` por paquete (sugerencia)

- `motivador-app-front/motivador/.env.local` — `VITE_API_BASE`
- `motivador-app-bff/.env` o `env.json` (para `sam local`): `TABLE_NAME`, `REGION`, etc.
- `motivador-app-back/motivador-app/.env` o `env.json`: `SECRETS_NAME`, `SQS_URL`, `SES_FROM`, `OPENAI_API_KEY` (solo en dev).

11) Despliegue automático / recomendaciones adicionales

- No incluyas claves reales en `.env` versionado. Usa `env.example` con nombres de variables.
- Para producción, usa IAM roles/parameters store y Secrets Manager.
- Implementa un pipeline CI/CD que haga `sam build` y despliegue sólo desde la rama `main` con credenciales de despliegue seguras.

12) Problemas comunes y soluciones rápidas

- CORS: si el frontend no puede llamar la API, revisa las cabeceras `Access-Control-Allow-Origin` en las lambdas o añade un recurso `OPTIONS` en SAM.
- Permisos SES: verifica que la cuenta AWS ha verificado el remitente y está fuera del sandbox.
- Secrets/OpenAI: durante desarrollo usa una variable `OPENAI_API_KEY` localmente; en producción usa Secrets Manager.

---
Si quieres, puedo:
- actualizar `Subscribe.jsx` para usar `import.meta.env.VITE_API_BASE` ahora
- crear `.env.example` en cada paquete
- añadir el workflow de CI en `.github/workflows/ci.yml`

Di cuál de esas quieres que haga ahora y lo implemento.
