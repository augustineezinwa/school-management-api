# School Management API (API Docs page)[https://school-management-api-mjci.onrender.com/api/docs]

REST API for managing schools, classrooms, students, and users with role-based access control (RBAC), scope enforcement, and OpenAPI documentation.

---

## Features

- **Authentication & authorization**
  - JWT-based login; long- and short-lived tokens
  - Role-based access: `super_admin`, `school_admin`
  - School-scoped and user-scoped access so admins only manage their own school/user

- **Schools**
  - CRUD for schools (create, list, get by id, update, delete)
  - School profile updates
  - Cascade delete: removing a school clears related users’ school, and deletes classrooms and students (no soft deletes for now)

- **Classrooms**
  - Create classroom, list by school, manage (capacity, equipment, status), delete
  - Scoped by school

- **Students**
  - Enroll, list, get by id, update profile, delete
  - Transfer student between classrooms/schools (with capacity checks)
  - Scoped by school

- **Users**
  - Create user, manage profile, change password, assign admin to school
  - User-scoped so users cannot manage other users

- **API & security**
  - OpenAPI (Swagger) docs at `/api/docs`
  - Rate limiting per IP on `/api` (configurable)
  - Request validation and consistent error responses

---

## Prerequisites

- **Node.js** (v20+)
- **MongoDB** (local or Atlas)
- **Redis** (optional; used for cache/cortex if configured)

---

## Quick setup

### 1. Clone and install

```bash
git clone <repository-url>
cd school-management-api
npm install
```

### 2. Environment variables

Copy the example env file and edit with your values:

```bash
cp .env.example .env
```

Edit `.env` and set at least the **required** variables (see [Environment variables](#environment-variables) below).
Most importantly set your `SUPER_USER_EMAIL` and `SUPER_USER_PASSWORD` to your preferred credentials

### 3. Start MongoDB

Ensure MongoDB is running (e.g. local on `mongodb://localhost:27017` or use a connection string in `MONGO_URI`).

Once Mongo is running, do
```bash
npm run build
```
to seed your super user.

### 4. Run the app

```bash
npm start
```

The API runs at `http://localhost:9000` by default. Open [API documentation](#api-documentation).

---

## Environment variables

Use `.env.example` as a template. After copying to `.env`, set:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `MONGO_URI` | Yes | `mongodb://localhost:27017/axion` | MongoDB connection string |
| `LONG_TOKEN_SECRET` | Yes | — | Secret for JWT long-lived tokens (e.g. login) |
| `SUPER_USER_EMAIL`   | Yes | - | Your super admin email  |
| `SUPER_USER_PASSWORD` | Yes | - | Your super admin password |
| `SHORT_TOKEN_SECRET` | Yes | — | Secret for short-lived tokens |
| `NACL_SECRET` | Yes | — | Secret for encryption (NACL) |
| `USER_PORT` | No | `9000` | HTTP server port |
| `ENV` | No | `development` | `development`, `test`, or `production` |
| `SERVICE_NAME` | No | `axion` | App name (used in logs and DB name if not in URI) |
| `RATE_LIMIT_MAX` | No | `100` | Max requests per IP per window |
| `RATE_LIMIT_WINDOW_MS` | No | `900000` (15 min) | Rate limit window in milliseconds |
| `REDIS_URI` | No | `redis://127.0.0.1:6379` | Redis for cache/cortex (if used) |

**Copy command (reminder):**

```bash
cp .env.example .env
# then edit .env with your secrets and MONGO_URI
```

---

## Commands

| Command | Description |
|--------|-------------|
| `npm install` | Install dependencies |
| `npm start` | Start the API server |
| `npm test` | Run integration/unit tests (Jest, in-band) |
| `npm run migrate:up` | Run MongoDB migrations up |
| `npm run migrate:down` | Run MongoDB migrations down |
| `npm run migrate:status` | Show migration status |
| `npm run migrate:create <name>` | Create a new migration file |
| `npm run build` | Run migrations and sync (if used) |

---

## API documentation

- **Swagger UI (interactive):** [http://localhost:9000/api/docs](http://localhost:9000/api/docs)  
  (Replace host/port if you changed `USER_PORT` or deploy elsewhere.)

- **OpenAPI JSON:** [http://localhost:9000/api/docs.json](http://localhost:5111/api/docs.json)

Use the **token** header (or query) with a JWT from `/api/auth/login` for protected endpoints.

To test on the live hosted swagger API doc: visit this [page](https://school-management-api-mjci.onrender.com/api/docs)

Select the web server from the servers dropdown
get your super admin credentials from .env.example
use the email & password to login

you will receive a token, set this token on authorize button at the top right
You can now test all protected routes

---

## Endpoints

Base path: **`/api`**

### Auth & tokens

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/auth/login` | Login (email + password), returns JWT |

### Users

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/users` | Create user |
| `PATCH` | `/users/change-password` | Change own password |
| `PATCH` | `/users/:id` | Update user by id (scoped) |
| `PATCH` | `/users/:id/assign-school` | Assign admin to a school |

### Schools

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/schools` | Create school |
| `GET` | `/schools` | List all schools |
| `GET` | `/schools/:id` | Get school by id |
| `PUT` | `/schools/:id` | Update school by id |
| `DELETE` | `/schools/:id` | Delete school (cascades) |
| `PATCH` | `/schools/:id/profile` | Update school profile |

### Classrooms

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/classrooms` | Create classroom |
| `GET` | `/schools/:schoolId/classrooms` | List classrooms by school |
| `PATCH` | `/classrooms/:id` | Manage classroom (capacity, equipment, status) |
| `DELETE` | `/classrooms/:id` | Delete classroom |

### Students

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/students` | Enroll student |
| `GET` | `/students` | List students |
| `GET` | `/students/:id` | Get student by id |
| `PATCH` | `/students/:id` | Update student profile |
| `DELETE` | `/students/:id` | Delete student |
| `PATCH` | `/students/:id/transfer` | Transfer student to another classroom/school |

Protected routes expect a **token** (JWT) in the `token` header or as configured by your client.

---

## Rate limiting

- Applied to all **`/api`** routes (per IP).
- Default: **100 requests per 15 minutes** per IP.
- Configure with `RATE_LIMIT_MAX` and `RATE_LIMIT_WINDOW_MS`.
- When exceeded: **429** with JSON `{ ok: false, message: "Too many requests..." }`.
- Disabled when `ENV=test`.

---

## Running tests

Tests use Jest and Supertest with an in-memory MongoDB (MongoMemoryServer) where possible.

```bash
npm install
npm test
```


- **Pattern:** Tests live under `managers/entities/*/tests/*.test.js` (authorization, validation, functionality).
- **Environment:** Set `ENV=test` (e.g. in `.env.test` or env); rate limiting is skipped in test.
- **Optional:** Use a real MongoDB for tests by setting `TEST_MONGO_URI` (e.g. `mongodb://localhost:27017/test`).

---

## Database schema

MongoDB is used for persistence. Schema definitions (Mongoose models) live in the repo:

| Entity | Schema file |
|--------|-------------|
| Schools | [managers/entities/school/school.mongoModel.js](managers/entities/school/school.mongoModel.js) |
| Users | [managers/entities/user/user.mongoModel.js](managers/entities/user/user.mongoModel.js) |
| Classrooms | [managers/entities/classroom/classroom.mongoModel.js](managers/entities/classroom/classroom.mongoModel.js) |
| Students | [managers/entities/student/student.mongoModel.js](managers/entities/student/student.mongoModel.js) |

Migrations (if used) are in [migrations/](migrations/). Run `npm run migrate:up` after setting `MONGO_URI`.

---

## Project structure (high level)

```
config/           # Routes, OpenAPI, env config
loaders/          # Managers, Mongo, validators
managers/
  entities/       # school, user, classroom, student (manager, schema, mongoModel, tests)
  api/            # HTTP API middleware
  http/           # Express server, rate limit
  response_dispatcher/
mws/              # Middleware (token, school scope, user scope)
static_arch/      # RBAC policy
migrations/       # migrate-mongo scripts
tests/            # Integration test helpers
```

---

## Improvements

The API is built with **REST best practices** in mind:

- **Resource-based URLs** – Nouns for resources (`/schools`, `/classrooms`, `/students`, `/users`) and HTTP methods for actions.
- **Standard methods** – `GET` (read), `POST` (create), `PUT`/`PATCH` (update), `DELETE` (remove).
- **Stable base path** – All routes under `/api` with a single [config/routes.config.js](config/routes.config.js) as the source of truth.
- **Declarative route mapping** – No scattered route definitions; one file maps path + method to handler.

**Route mapping:** view the full list of paths, methods, and handler targets here: **[config/routes.config.js](config/routes.config.js)**.

---

## License

ISC
