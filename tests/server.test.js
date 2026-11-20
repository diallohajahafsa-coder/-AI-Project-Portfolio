const assert = require("node:assert/strict");
const { afterEach, beforeEach, test } = require("node:test");
const { once } = require("node:events");
const { createApp, createDatabase } = require("../server");

let app;
let database;
let server;
let baseUrl;

beforeEach(async () => {
  database = createDatabase(":memory:");
  app = createApp(database);
  server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

afterEach(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  });
  database.close();
});

test("projects endpoint returns the starter portfolio projects", async () => {
  const response = await fetch(`${baseUrl}/api/projects`);
  const result = await response.json();

  assert.equal(response.status, 200);
  assert.equal(result.projects.length, 3);
  assert.equal(result.projects[0].title, "Your First AI Project");
  assert.deepEqual(result.projects[0].technologies, ["Python", "Scikit-learn", "Data"]);
});

test("contact endpoint validates and stores a message", async () => {
  const response = await fetch(`${baseUrl}/api/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Test User",
      email: "test@example.com",
      message: "I would like to discuss your portfolio.",
    }),
  });
  const result = await response.json();
  const storedCount = database.prepare("SELECT COUNT(*) AS count FROM contact_messages").get().count;

  assert.equal(response.status, 201);
  assert.equal(result.message, "Thanks! Your message has been received.");
  assert.equal(storedCount, 1);
});

test("contact endpoint rejects invalid email and short message", async () => {
  const response = await fetch(`${baseUrl}/api/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Test User", email: "not-an-email", message: "Short" }),
  });
  const result = await response.json();

  assert.equal(response.status, 400);
  assert.equal(result.error, "Enter a valid email address.");
  assert.equal(database.prepare("SELECT COUNT(*) AS count FROM contact_messages").get().count, 0);
});
