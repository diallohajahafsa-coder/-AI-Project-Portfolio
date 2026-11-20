const fs = require("node:fs");
const path = require("node:path");
const Database = require("better-sqlite3");
const express = require("express");
const rateLimit = require("express-rate-limit").rateLimit;
const helmet = require("helmet");

const projectSeeds = require("./projects.json");

function createDatabase(databasePath) {
  if (databasePath !== ":memory:") {
    fs.mkdirSync(path.dirname(databasePath), { recursive: true });
  }

  const database = new Database(databasePath);
  database.pragma("journal_mode = WAL");
  database.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY,
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      technologies TEXT NOT NULL,
      theme TEXT NOT NULL,
      visual TEXT NOT NULL,
      repo_url TEXT NOT NULL DEFAULT '',
      demo_url TEXT NOT NULL DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS contact_messages (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  const projectColumns = new Set(database.pragma("table_info(projects)").map((column) => column.name));
  if (!projectColumns.has("repo_url")) {
    database.exec("ALTER TABLE projects ADD COLUMN repo_url TEXT NOT NULL DEFAULT ''");
  }
  if (!projectColumns.has("demo_url")) {
    database.exec("ALTER TABLE projects ADD COLUMN demo_url TEXT NOT NULL DEFAULT ''");
  }

  const insertProject = database.prepare(`
    INSERT INTO projects (id, category, title, description, technologies, theme, visual, repo_url, demo_url)
    VALUES (@id, @category, @title, @description, @technologies, @theme, @visual, @repo_url, @demo_url)
    ON CONFLICT(id) DO UPDATE SET
        category = excluded.category,
        title = excluded.title,
        description = excluded.description,
        technologies = excluded.technologies,
        theme = excluded.theme,
        visual = excluded.visual,
        repo_url = excluded.repo_url,
        demo_url = excluded.demo_url
  `);
  const insertSeeds = database.transaction((projects) => {
    projects.forEach((project, index) => {
        insertProject.run({
          id: index + 1,
          ...project,
          technologies: JSON.stringify(project.technologies),
        });
    });
  });
  insertSeeds(projectSeeds);

  return database;
}

function createApp(database) {
  const app = express();
  if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
  }
  app.disable("x-powered-by");
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
      },
    },
  }));
  app.use(express.json({ limit: "12kb" }));

  const contactLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { error: "Too many messages were submitted. Please try again later." },
  });

  app.get("/", (_request, response) => {
    response.sendFile(path.join(__dirname, "index.html"));
  });
  app.get("/index.html", (_request, response) => {
    response.sendFile(path.join(__dirname, "index.html"));
  });
  app.get("/projects.json", (_request, response) => {
    response.sendFile(path.join(__dirname, "projects.json"));
  });
  app.get("/style.css", (_request, response) => {
    response.type("css").sendFile(path.join(__dirname, "style.css"));
  });
  app.get("/script.js", (_request, response) => {
    response.type("application/javascript").sendFile(path.join(__dirname, "script.js"));
  });

  app.get("/api/health", (_request, response) => {
    response.json({ status: "ok" });
  });

  app.get("/api/projects", (_request, response) => {
    const projects = database.prepare(`
      SELECT id, category, title, description, technologies, theme, visual, repo_url, demo_url
      FROM projects
      ORDER BY id
    `).all().map((project) => ({
      ...project,
      technologies: JSON.parse(project.technologies),
    }));
    response.json({ projects });
  });

  app.post("/api/contact", contactLimiter, (request, response) => {
    const name = typeof request.body.name === "string" ? request.body.name.trim() : "";
    const email = typeof request.body.email === "string" ? request.body.email.trim() : "";
    const message = typeof request.body.message === "string" ? request.body.message.trim() : "";
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (name.length < 2 || name.length > 80) {
      return response.status(400).json({ error: "Enter a name between 2 and 80 characters." });
    }
    if (email.length > 254 || !validEmail) {
      return response.status(400).json({ error: "Enter a valid email address." });
    }
    if (message.length < 10 || message.length > 5000) {
      return response.status(400).json({ error: "Enter a message between 10 and 5,000 characters." });
    }

    database.prepare(`
      INSERT INTO contact_messages (name, email, message, created_at)
      VALUES (?, ?, ?, ?)
    `).run(name, email, message, new Date().toISOString());

    return response.status(201).json({ message: "Thanks! Your message has been received." });
  });

  app.use("/api", (_request, response) => {
    response.status(404).json({ error: "API endpoint not found." });
  });
  app.use((_request, response) => {
    response.status(404).type("text").send("Page not found.");
  });
  app.use((error, _request, response, next) => {
    if (response.headersSent) {
      return next(error);
    }

    if (error.status && error.status < 500) {
      const message = error.status === 413 ? "Request body is too large." : "Invalid request.";
      return response.status(error.status).json({ error: message });
    }

    console.error("Request failed:", error);
    return response.status(500).json({ error: "An unexpected server error occurred." });
  });

  return app;
}

if (require.main === module) {
  const databasePath = process.env.DATABASE_PATH || path.join(__dirname, "data", "portfolio.db");
  const database = createDatabase(databasePath);
  const app = createApp(database);
  const port = Number(process.env.PORT) || 3000;
  app.listen(port, () => {
    console.log(`Portfolio server listening on port ${port}`);
  });
}

module.exports = { createApp, createDatabase };
