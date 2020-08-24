const express = require("express");
const cors = require("cors");

const { uuid, isUuid } = require("uuidv4");

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

function logRequests(request, response, next) {
  const { method, url } = request;
  const logLabel = `[${method.toUpperCase()}] ${url}`;

  console.log(logLabel);

  return next(); //Próximo middleware
}

function validateProjectId(request, response, next) {
  const { id } = request.params;

  if (!isUuid(id)) {
    return response.status(400).json({ error: "Invalid project ID" });
  }

  return next();
}

app.use(logRequests);
app.use("/repositories/:id", validateProjectId);
app.use("/repositories/:id/like", validateProjectId);

// LISTA REPOSITÓRIOS
app.get("/repositories", (request, response) => {
  const { title } = request.query;

  const results = title
    ? repositories.filter((repo) => repo.title.includes(title))
    : repositories;

  return response.json(repositories);
});

// CRIA REPOSITÓRIOS
app.post("/repositories", (request, response) => {
  const { title, url, techs } = request.body;
  const likes = 0;
  const repo = { id: uuid(), title, url, techs, likes };

  repositories.push(repo);

  return response.json(repo);
});

// ATUALIZA REPOSITÓRIOS
app.put("/repositories/:id", (request, response) => {
  const { id } = request.params;
  const { title, url, techs } = request.body;
  const repoIndex = repositories.findIndex((repo) => repo.id === id);

  if (repoIndex < 0) {
    return response.status(400).json({ error: "Repositorie not found." });
  }

  const likes = repositories[repoIndex].likes;

  const repoToUpdate = {
    title,
    url,
    techs,
    likes,
    id,
  };

  repositories[repoIndex] = repoToUpdate;

  return response.json(repoToUpdate);
});

// DELETE
app.delete("/repositories/:id", (request, response) => {
  const { id } = request.params;
  const repoIndex = repositories.findIndex((repo) => repo.id === id);

  if (repoIndex < 0) {
    return response.status(400).json({ error: "Repositorie not found." });
  }

  repositories.splice(repoIndex, 1);

  return response.status(204).send();
});

// CRIA LIKES
app.post("/repositories/:id/like", (request, response) => {
  const { id } = request.params;
  const repoIndex = repositories.findIndex((repo) => repo.id === id);

  if (repoIndex < 0) {
    return response.status(400).json({ error: "Repositorie does not exists." });
  }

  const repoUpdate = repositories[repoIndex];

  repoUpdate.likes++;

  return response.json(repoUpdate);
});

module.exports = app;
