import express from 'express';
import { getTasks, findTask, addTask, deleteTask } from './task-store.js';

export const app = express();
// Log each request and its response status.
app.use((request, response, next) => {
  response.on('finish', () => console.log(`${request.method} ${request.originalUrl} → ${response.statusCode}`));
  next();
});
app.use(express.json()); // Before handlers that read request.body.

app.get('/', (request, response) => {
  response.type('text').send('Campus Help Desk is running. Try /api/tasks.');
});
app.get('/api/health', (request, response) => {
  response.json({ status: 'ok', time: new Date().toISOString() });
});
app.get('/api/tasks', (request, response) => {
  const completed = request.query.completed; // Query values are strings.
  let results = getTasks();
  if (completed === 'true') results = results.filter(task => task.completed);
  if (completed === 'false') results = results.filter(task => !task.completed);
  response.json({ count: results.length, tasks: results });
});
function numericId(request, response, next) {
  if (!/^[1-9]\d*$/.test(request.params.id) || !Number.isSafeInteger(Number(request.params.id))) {
    return response.status(400).json({ error: 'Use a positive whole number for the task ID.' });
  }
  next();
}
app.get('/api/tasks/:id', numericId, (request, response) => {
  const task = findTask(Number(request.params.id));
  if (!task) return response.status(404).json({ error: `Task ${request.params.id} was not found.` });
  response.json(task);
});
app.post('/api/tasks', (request, response) => {
  const text = typeof request.body?.text === 'string' ? request.body.text.trim() : '';
  if (!text) return response.status(400).json({ error: 'A non-empty text value is required.' });
  const task = addTask(text);
  response.location(`/api/tasks/${task.id}`).status(201).json(task);
});
// Extension activities: teach these only if the core GET/POST work is comfortable.
app.patch('/api/tasks/:id', numericId, (request, response) => {
  const task = findTask(Number(request.params.id));
  if (!task) return response.status(404).json({ error: 'Task was not found.' });
  if (typeof request.body?.completed !== 'boolean') {
    return response.status(400).json({ error: 'completed must be true or false (a boolean).' });
  }
  task.completed = request.body.completed;
  response.json(task);
});
app.delete('/api/tasks/:id', numericId, (request, response) => {
  const task = findTask(Number(request.params.id));
  if (!task) return response.status(404).json({ error: 'Task was not found.' });
  deleteTask(task.id);
  response.status(204).send(); // Intentionally no response body.
});
app.use((request, response) => response.status(404).json({ error: 'Route not found.' }));
// Error middleware needs all four parameters and belongs after the routes.
app.use((error, request, response, next) => {
  if (error.type === 'entity.parse.failed') {
    return response.status(400).json({ error: 'The request body is not valid JSON.' });
  }
  if (error.status === 413) return response.status(413).json({ error: 'Request body is too large.' });
  console.error(error.message);
  response.status(500).json({ error: 'Something went wrong on the server.' });
});
