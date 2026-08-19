# NARSS HPC Lab

## Structure

- `frontend/` contains HTML, CSS, JavaScript and assets.
- `backend/` contains Express, SQLite and authentication.
- `frontend/map.html` is the main interactive map.
- `frontend/index.html` is the main landing page.

## Run Backend

```bash
cd backend
npm install
npm start
```

The API runs on:

```text
http://localhost:3000
```

## Frontend

Open the `frontend` folder with a local web server. Avoid opening the HTML files directly with `file://`.

For example, with VS Code Live Server, open:

```text
frontend/index.html
```

## Important

Change `JWT_SECRET` in `backend/.env` before using the project outside local development.

Put the NARSS brochure PDF in:

```text
frontend/assets/pdf/NARSS_HPC_Brochure_PrintReady.pdf
```

The existing SQLite database can be kept if you want to preserve the old users. If you start without a database file, the backend creates the `users` table automatically.
