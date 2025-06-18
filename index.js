const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Homepage
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// In-memory data
let users = [];

// Create user
app.post('/api/users', (req, res) => {
  const username = req.body.username;
  const user = { username, _id: Date.now().toString(), log: [] };
  users.push(user);
  res.json({ username: user.username, _id: user._id });
});

// Get all users
app.get('/api/users', (req, res) => {
  const result = users.map(u => ({ username: u.username, _id: u._id }));
  res.json(result);
});

// Add exercise
app.post('/api/users/:_id/exercises', (req, res) => {
  const { description, duration, date } = req.body;
  const user = users.find(u => u._id === req.params._id);
  if (!user) return res.json({ error: 'User not found' });

  const exercise = {
    description,
    duration: parseInt(duration),
    date: date ? new Date(date).toDateString() : new Date().toDateString()
  };

  user.log.push(exercise);

  res.json({
    _id: user._id,
    username: user.username,
    description: exercise.description,
    duration: exercise.duration,
    date: exercise.date
  });
});

// Get user logs
app.get('/api/users/:_id/logs', (req, res) => {
  const user = users.find(u => u._id === req.params._id);
  if (!user) return res.json({ error: 'User not found' });

  let log = [...user.log];

  const { from, to, limit } = req.query;

  if (from) {
    const fromDate = new Date(from);
    log = log.filter(e => new Date(e.date) >= fromDate);
  }

  if (to) {
    const toDate = new Date(to);
    log = log.filter(e => new Date(e.date) <= toDate);
  }

  if (limit) {
    log = log.slice(0, parseInt(limit));
  }

  res.json({
    username: user.username,
    _id: user._id,
    count: log.length,
    log
  });
});

// Start server
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('App is listening on port ' + listener.address().port);
});
