Shortify — URL Shortener
Shortify is a full-stack URL shortening application built with React and Vite on the frontend and Node.js, Express, PostgreSQL, and Redis on the backend. It lets registered users create and manage short links, protect links with passwords, set expiration dates, generate QR codes, and review click analytics. An admin area provides user, URL, and system-level management.

Features
- Authentication: user registration and login, hashed passwords, JWT access tokens, refresh-token flow, and protected routes.
- URL management: create, list, view, update, and delete short URLs.
- Custom aliases: choose a custom short code when available.
- Password-protected links: require a password before redirecting to the destination.
- Link expiration and status: set an expiry date and manage whether a link is active.
- QR codes: generate a QR code for a short URL.
- Analytics: dashboard statistics, per-link analytics, click history, and click metadata such as browser, operating system, device type, and referrer.
- Admin dashboard: view users, URLs, and system analytics; update URL status or remove URLs.
- Redis caching and rate limiting: cache short-link lookups and apply request limits.
- API safeguards: request validation, security headers, CORS configuration, and centralized error handling.

Tech Stack
Area	Technologies
Frontend	React, Vite, React Router, Axios, Recharts, Lucide React
Backend	Node.js, Express 5 (ES modules)
Database	PostgreSQL
Cache / rate limiting	Redis
Authentication	JSON Web Tokens, bcrypt, HTTP-only refresh cookie
Other	QRCode, express-validator, Helmet, Morgan


Project Structure
url-shortener/
├── backend/
│   ├── src/
│   │   ├── config/          # PostgreSQL and Redis setup
│   │   ├── controllers/     # Authentication, URL, analytics, admin handlers
│   │   ├── middleware/      # Authentication, authorization, rate limits, errors
│   │   ├── migrations/      # PostgreSQL schema
│   │   ├── routes/          # Express API routes
│   │   ├── services/        # URL, analytics, QR and cache logic
│   │   ├── utils/           # JWT, hashing, short-code and user-agent helpers
│   │   ├── validators/      # Request validation
│   │   ├── app.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   ├── context/
    │   ├── pages/
    │   └── services/
    └── package.json

Requirements
Install the following before running the project:
- Node.js (a current LTS release is recommended)
- npm
- PostgreSQL
- Redis
Local Setup
1. Clone the repository
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd url-shortener

2. Configure PostgreSQL
Create a database named url_shortener_db in PostgreSQL, or choose another name and update DATABASE_URL accordingly.

Run the schema file from the project root:
psql -U postgres -d url_shortener_db -f backend/src/migrations/schema.sql
If psql is not available in your terminal, open backend/src/migrations/schema.sql in pgAdmin's Query Tool while connected to the target database and execute it.

The schema creates the users, urls, clicks, and refresh_tokens tables, their indexes, and update-timestamp triggers.

3. Configure Redis
Start a Redis server and make sure its address matches REDIS_URL in backend/.env. The example configuration uses redis://localhost:6380; if your Redis server listens on the default port, use redis://localhost:6379 instead.

4. Configure the backend
From the project root:

Windows Command Prompt
cd backend
copy .env.example .env
macOS / Linux
cd backend
cp .env.example .env
Edit backend/.env and set the values for your machine:
PORT=5000
NODE_ENV=development

DATABASE_URL=postgresql://postgres:YOUR_POSTGRES_PASSWORD@localhost:5432/url_shortener_db
REDIS_URL=redis://localhost:6380

JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

FRONTEND_URL=http://localhost:5173
BASE_URL=http://localhost:5000
Replace the PostgreSQL password, Redis port, and JWT secret with your actual local values. Keep .env private and never commit real credentials or tokens.

Install dependencies and start the backend:
npm install
npm run dev
The API should be available at http://localhost:5000. Check the health endpoint:
GET http://localhost:5000/api/health
The backend startup process checks the PostgreSQL and Redis connections before starting Express.
5. Configure and start the frontend
Open a second terminal from the project root:
cd frontend
npm install
npm run dev
Vite normally serves the frontend at http://localhost:5173.

The frontend API client defaults to http://localhost:5000/api. If your backend uses a different address, create frontend/.env with:
VITE_API_URL=http://localhost:5000/api
Restart the Vite development server after changing environment variables.

API Overview
All API endpoints below use the local backend base URL http://localhost:5000.
Method	Endpoint	Purpose	Access
GET	/api/health	Check API status	Public
POST	/api/auth/register	Register an account	Public
POST	/api/auth/login	Sign in	Public
POST	/api/auth/refresh	Refresh an access token	Refresh-token flow
POST	/api/auth/logout	Sign out	Refresh-token flow
GET	/api/auth/me	Get the current user	Authenticated
POST	/api/urls	Create a short URL	Authenticated
GET	/api/urls	List the current user's URLs	Authenticated
GET	/api/urls/:id	Get URL details	Authenticated
PUT	/api/urls/:id	Update a URL	Authenticated
DELETE	/api/urls/:id	Delete a URL	Authenticated
GET	/api/urls/:id/qr	Generate a QR code	Authenticated
POST	/api/unlock/:shortCode	Unlock a password-protected link	Public
GET	/api/analytics/dashboard	Get dashboard analytics	Authenticated
GET	/api/analytics/:id	Get analytics for a URL	Authenticated
GET	/api/analytics/:id/clicks	Get click records for a URL	Authenticated
GET	/api/admin/dashboard	Admin dashboard summary	Admin
GET	/api/admin/users	List users	Admin
GET	/api/admin/urls	List URLs	Admin
GET	/api/admin/analytics	System analytics	Admin
PATCH	/api/admin/urls/:id/status	Update URL status	Admin
DELETE	/api/admin/urls/:id	Delete a URL as admin	Admin


Protected API requests use the access token in the Authorization: Bearer <token> header. The frontend Axios client reads the access token from browser local storage and attempts the refresh flow after eligible 401 responses.
Short-link redirects
A short URL uses the configured BASE_URL and generated short code, for example:
http://localhost:5000/abc123
The short code in this example is illustrative; create a link in the application to receive a real code.
First Admin Account
New registrations use the USER role by default. To grant admin access to a trusted account, register normally and then update that account in PostgreSQL:
UPDATE users
SET role = 'ADMIN'
WHERE email = 'your-email@example.com';
Replace the example email with the account's email address. Do not expose admin access to untrusted users.
Security Notes
- Do not commit .env files, database passwords, JWT secrets, access tokens, refresh tokens, or production credentials.
- Use a long, unique JWT_SECRET and different secrets for production.
- Use HTTPS and secure production cookie/CORS settings when deploying.
- Review rate-limit, proxy, and CORS settings before putting the application on the public internet.
- The ip_hash field is intended to store a hashed IP value rather than a raw IP address; check the implementation and privacy requirements before deployment.
- This README documents the implementation visible in the repository; it is not a security audit.
Available Scripts
Backend (backend/)
Command	Description
npm install	Install backend dependencies
npm run dev	Run with Nodemon
npm start	Start the backend normally


Frontend (frontend/)
Command	Description
npm install	Install frontend dependencies
npm run dev	Start Vite development server
npm run build	Build the production frontend bundle
npm run preview	Preview the production build locally
npm run lint	Run ESLint


Troubleshooting
- PostgreSQL connection fails: confirm PostgreSQL is running, the database exists, and DATABASE_URL has the correct username, password, host, and port.
- Redis connection fails: confirm Redis is running and REDIS_URL points to the correct port. The example uses port 6380, not Redis's common default of 6379.
- Frontend cannot reach the API: confirm the backend is running, VITE_API_URL is correct, and FRONTEND_URL matches the frontend origin.
- Redirect points to the wrong host: update BASE_URL in backend/.env.
- Schema or table errors: make sure backend/src/migrations/schema.sql has been executed against the database named in DATABASE_URL.