// Memory is our temporary whiteboard. Restarting the server resets it.
const seed = () => [
  { id: 1, text: 'Fix the classroom projector', completed: false },
  { id: 2, text: 'Find a lost water bottle', completed: true },
  { id: 3, text: 'Help connect to campus Wi-Fi', completed: false }
];
let tasks = seed();
let nextId = 4;
export function getTasks() { return tasks; }
export function findTask(id) { return tasks.find(task => task.id === id); }
export function addTask(text) {
  const task = { id: nextId++, text, completed: false };
  tasks.push(task);
  return task;
}
export function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
}
export function resetTasks() { tasks = seed(); nextId = 4; }
