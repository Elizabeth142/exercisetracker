const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const users = []; // in-memory "users" DB

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// ✅ POST /api/users
app.post('/api/users', (req, res) => {
  const username = req.body.username;
  const user = {
    username,
    _id: users.length + 1 + ''
  };
  users.push({ ...user, log: [] });
  res.json(user);
});

// ✅ GET /api/users
app.get('/api/users', (req, res) => {
  res.json(users.map(u => ({ username: u.username, _id: u._id })));
});

// ✅ POST /api/users/:_id/exercises
app.post('/api/users/:_id/exercises', (req, res) => {
  const { description, duration, date } = req.body;
  const user = users.find(u => u._id === req.params._id);
  if (!user) return res.json({ error: 'User not found' });

  const newEntry = {
    description,
    duration: parseInt(duration),
    date: date ? new Date(date).toDateString() : new Date().toDateString()
  };
  user.log.push(newEntry);

  res.json({
    _id: user._id,
    username: user.username,
    ...newEntry
  });
});

// ✅ GET /api/users/:_id/logs
app.get('/api/users/:_id/logs', (req, res) => {
  const user = users.find(u => u._id === req.params._id);
  if (!user) return res.json({ error: 'User not found' });

  let log = [...user.log];

  if (req.query.from) {
    const from = new Date(req.query.from);
    log = log.filter(e => new Date(e.date) >= from);
  }

  if (req.query.to) {
    const to = new Date(req.query.to);
    log = log.filter(e => new Date(e.date) <= to);
  }

  if (req.query.limit) {
    log = log.slice(0, parseInt(req.query.limit));
  }

  res.json({
    username: user.username,
    _id: user._id,
    count: log.length,
    log
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
