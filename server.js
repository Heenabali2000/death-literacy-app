// server.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('connect-flash');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

app.set('view engine', 'ejs');

// Session and flash config
app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: false,
}));
app.use(flash());

// Flash message locals
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success');
  res.locals.error_msg = req.flash('error');
  res.locals.user = req.session.user;
  next();
});

// Middleware to protect routes
function checkAuth(req, res, next) {
  if (req.session && req.session.user) {
    next();
  } else {
    req.flash('error', 'You must be logged in to access the quiz.');
    res.redirect('/login');
  }
}

// Serve homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Protected Quiz route
app.get('/quiz', checkAuth, (req, res) => {
  const quizPath = path.join(__dirname, 'public', 'quiz.html');
  fs.readFile(quizPath, 'utf8', (err, data) => {
    if (err) return res.status(500).send('Quiz could not be loaded.');
    res.send(data);
  });
});

// Auth Routes
app.get('/signup', (req, res) => {
  res.render('signup', { message: null });
});

app.get('/login', (req, res) => {
  res.render('login', { message: null });
});

app.get('/api/user', (req, res) => {
  if (req.session.user) {
    res.json({ loggedIn: true, user: req.session.user });
  } else {
    res.json({ loggedIn: false });
  }
});

app.post('/signup', async (req, res) => {
  const { fullname, email, password, confirm_password } = req.body;
  if (password !== confirm_password) {
    req.flash('error', 'Passwords do not match');
    return res.redirect('/signup');
  }
  try {
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      req.flash('error', 'Email already exists');
      return res.redirect('/signup');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query('INSERT INTO users (fullname, email, password) VALUES ($1, $2, $3)', [fullname, email, hashedPassword]);
    req.flash('success', 'Signup successful! Please log in.');
    res.redirect('/login');
  } catch (err) {
    console.error('Signup error:', err);
    req.flash('error', 'Signup failed. Try again.');
    res.redirect('/signup');
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      req.flash('error', 'Invalid email or password');
      return res.redirect('/login');
    }
    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (passwordMatch) {
      req.session.user = { id: user.id, email: user.email, fullname: user.fullname };
      req.flash('success', 'Login successful!');
      return res.redirect('/quiz');
    } else {
      req.flash('error', 'Invalid email or password');
      return res.redirect('/login');
    }
  } catch (error) {
    console.error('Login error:', error);
    req.flash('error', 'Login failed. Try again.');
    res.redirect('/login');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Logout error:', err);
      return res.redirect('/');
    }
    res.clearCookie('connect.sid');
    res.redirect('/');
  });
});

// API to receive quiz scores
app.post('/save-scores', async (req, res) => {
  const answers = req.body;
  console.log('Received quiz answers:', answers);
  res.json({ message: 'Answers received successfully!' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
