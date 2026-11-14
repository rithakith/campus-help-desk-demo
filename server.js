// Instructor-only launcher. Run: node instructor-server.js
import express from 'express';
import { app } from './src/app.js';
import { resetTasks } from './src/task-store.js';
const classroom = express();
classroom.get('/', (request, response) => response.redirect('/classroom/'));
classroom.use('/classroom', express.static(new URL('./public', import.meta.url).pathname));
classroom.post('/demo/reset', (request, response) => {
  resetTasks();
  response.json({ message: 'The classroom data has been reset.' });
});
classroom.get('/demo/error', (request, response) => {
  response.status(500).json({ error: 'Something went wrong on the server.' });
});
classroom.use(app);
const PORT = Number(process.env.PORT) || 3000;
classroom.listen(PORT, '0.0.0.0', () => console.log(`Classroom: http://localhost:${PORT}/classroom`));
