const fs = require("node:fs");
const path = require("node:path");
const Database = require("better-sqlite3");
const express = require("express");
const rateLimit = require("express-rate-limit").rateLimit;
const helmet = require("helmet");

const projectSeeds = [
  {
    category: "FULL STACK AI",
    title: "Fullstack AI App",
    description: "A full-stack AI project built with React, Flask, and MongoDB.",
    technologies: ["React", "Flask", "MongoDB"],
    repoUrl: "https://github.com/diallohajahafsa-coder/fullstack-ai-app",
    demoUrl: "",
    theme: "lilac",
    visual: "orbit",
  },
  {
    category: "WEB DEVELOPMENT",
    title: "IWD Practical 5–12",
    description: "Interactive web design practical exercises.",
    technologies: ["IWD", "Web Development"],
    repoUrl: "https://github.com/diallohajahafsa-coder/iwd-practical-5-12",
    demoUrl: "",
    theme: "yellow",
    visual: "grid",
  },
  {
    category: "COMMUNICATION",
    title: "Nurture AI",
    description: "A project focused on helping with communication.",
    technologies: ["TypeScript"],
    repoUrl: "https://github.com/diallohajahafsa-coder/Nurture-AI",
    demoUrl: "",
    theme: "mint",
    visual: "wave",
  },
  {
    category: "MOBILE GAME",
    title: "Cooking Master Game",
    description: "A mobile cooking game built with Unity 6.",
    technologies: ["Unity 6", "Mobile Game"],
    repoUrl: "https://github.com/diallohajahafsa-coder/cooking-master-game",
    demoUrl: "",
    theme: "lilac",
    visual: "grid",
  },
  {
    category: "EDUCATION",
    title: "AI Chatbot",
    description: "An educational AI chatbot project.",
    technologies: ["TypeScript"],
    repoUrl: "https://github.com/diallohajahafsa-coder/AI-CHATBOT",
    demoUrl: "",
    theme: "yellow",
    visual: "wave",
  },
  {
    category: "EDUCATION",
    title: "AI Chatbot for Student Support",
    description: "A chatbot project to help students with study support.",
    technologies: ["TypeScript"],
    repoUrl: "https://github.com/diallohajahafsa-coder/AI-Chatbot-for-Student-Support",
    demoUrl: "https://ai-chatbot-for-student-support.vercel.app",
    theme: "mint",
    visual: "orbit",
  },
  {
    category: "EDUCATION",
    title: "AI Assistant Study",
    description: "An AI assistant project to help students study.",
    technologies: ["TypeScript"],
    repoUrl: "https://github.com/diallohajahafsa-coder/AI-Assistant-Study",
    demoUrl: "",
    theme: "lilac",
    visual: "wave",
  },
  {
    category: "EDUCATION",
    title: "AI Study Assistant System Development",
    description: "A study-assistant system development project.",
    technologies: ["AI", "Education"],
    repoUrl: "https://github.com/diallohajahafsa-coder/AI-Study-Assistant-System-Development",
    demoUrl: "",
    theme: "yellow",
    visual: "orbit",
  },
  {
    category: "EDUCATION",
    title: "AI Study Assistant (Web Demo)",
    description: "An AI study-assistant project with a live web demo.",
    technologies: ["AI", "Education"],
    repoUrl: "https://github.com/diallohajahafsa-coder/AI-Study-Assistant-",
    demoUrl: "",
    theme: "mint",
    visual: "grid",
  },
  {
    category: "EDUCATION",
    title: "AI Study Assistant System",
    description: "A system to help students learn and grow.",
    technologies: ["TypeScript"],
    repoUrl: "https://github.com/diallohajahafsa-coder/AI-Study-Assistant-System",
    demoUrl: "https://ai-study-assistant-system.vercel.app",
    theme: "lilac",
    visual: "orbit",
  },
  {
    category: "WEB DEVELOPMENT",
    title: "Online Library Management System",
    description: "An online library-management project.",
    technologies: ["TypeScript"],
    repoUrl: "https://github.com/diallohajahafsa-coder/Build-an-Online-Library-Management-System",
    demoUrl: "https://build-an-online-library-management.vercel.app",
    theme: "yellow",
    visual: "grid",
  },
  {
    category: "EDUCATION",
    title: "AI Study Assistant",
    description: "An AI project to help with study.",
    technologies: ["TypeScript"],
    repoUrl: "https://github.com/diallohajahafsa-coder/AI-Study-Assistant",
    demoUrl: "",
    theme: "mint",
    visual: "wave",
  },
  {
    category: "TRAVEL",
    title: "AI Traveling Assistant",
    description: "A travel assistant powered by AI.",
    technologies: ["AI", "Travel"],
    repoUrl: "https://github.com/diallohajahafsa-coder/AI-Traveling-Assistant",
    demoUrl: "",
    theme: "lilac",
    visual: "grid",
  },
  {
    category: "WEB DEVELOPMENT",
    title: "IWD Practice",
    description: "A repository for IWD practice.",
    technologies: ["IWD", "Practice"],
    repoUrl: "https://github.com/diallohajahafsa-coder/IWD-Practice",
    demoUrl: "",
    theme: "yellow",
    visual: "wave",
  },
  {
    category: "TRAVEL",
    title: "AI Travel Assistant",
    description: "A travel assistant powered by AI.",
    technologies: ["AI", "Travel"],
    repoUrl: "https://github.com/diallohajahafsa-coder/AI-Travel-Assistant",
    demoUrl: "",
    theme: "mint",
    visual: "orbit",
  },
  {
    category: "TRAVEL",
    title: "AI Travel",
    description: "An AI project for planning trips.",
    technologies: ["AI", "Travel"],
    repoUrl: "https://github.com/diallohajahafsa-coder/AI-travel",
    demoUrl: "",
    theme: "lilac",
    visual: "wave",
  },
  {
    category: "TRAVEL",
    title: "AI Travel Planner",
    description: "An AI travel-planning project.",
    technologies: ["TypeScript", "Travel"],
    repoUrl: "https://github.com/diallohajahafsa-coder/AI-Travel-Planner",
    demoUrl: "",
    theme: "yellow",
    visual: "orbit",
  },
  {
    category: "AI ASSISTANT",
    title: "AI Assistant 2",
    description: "An AI assistant optimization project.",
    technologies: ["Shell", "AI"],
    repoUrl: "https://github.com/diallohajahafsa-coder/AI-assistant2",
    demoUrl: "",
    theme: "mint",
    visual: "grid",
  },
  {
    category: "AI ASSISTANT",
    title: "AI Assistant",
    description: "An AI assistant optimization project with a live demo.",
    technologies: ["TypeScript"],
    repoUrl: "https://github.com/diallohajahafsa-coder/AI-assistant",
    demoUrl: "",
    theme: "mint",
    visual: "orbit",
  },
];

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
    VALUES (@id, @category, @title, @description, @technologies, @theme, @visual, @repoUrl, @demoUrl)
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
