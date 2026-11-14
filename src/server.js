import { app } from './app.js';
const PORT = Number(process.env.PORT) || 3000;
// Listen on this computer.
app.listen(PORT, '127.0.0.1', () => {
  console.log(`Campus Help Desk: http://localhost:${PORT}`);
});
