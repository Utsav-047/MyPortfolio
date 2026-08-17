// In-Memory Data Store (Data stored in JavaScript Array)

let tasks = [
  { id: 1, title: 'Learn Node.js & Express', description: 'Understand core Node modules, Express routing, and middleware', completed: true },
  { id: 2, title: 'Build Task Management Backend', description: 'Implement REST endpoints with array storage and notifications', completed: false }
];

let nextId = 3;
const requestLogs = [];

module.exports = {
  tasks,
  nextId: () => nextId++,
  requestLogs
};
