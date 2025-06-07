// server.js
require('dotenv').config();
const express = require('express');
const path = require("path");
const session = require("express-session");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const pool = require("./db");

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(session({
  secret: "your_secret_key",
  resave: false,
  saveUninitialized: true
}));

// Make user data available in all views
app.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
});

// Routes
const saveScoresRoute = require('./routes/savescores');
app.use('/', saveScoresRoute);

const thoughtsRoute = require('./routes/thoughts');
app.use('/', thoughtsRoute);

// Pages
app.get("/", (req, res) => {
  res.render("index", { user: req.session.user });
});

app.get('/about', (req, res) => {
  res.render('about', { user: req.session.user });
});

app.get("/resources", (req, res) => {
  res.render("resources", { user: req.session.user });
});

app.get("/education", (req, res) => {
  res.render("resources", { user: req.session.user }); // same content
});



// ✅ GET Signup Page
app.get("/signup", (req, res) => {
  res.render("signup", { error_msg: "", formData: {} });
});

// ✅ POST Signup
app.post('/signup', async (req, res) => {
  const { firstname, lastname, organization, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await pool.query(
      'INSERT INTO users (firstname, lastname, organization, email, password) VALUES ($1, $2, $3, $4, $5)',
      [firstname, lastname, organization, email, hashedPassword]
    );
    res.redirect('/login');
  } catch (err) {
    if (err.code === '23505') {
      return res.render('signup', {
        error_msg: 'Email already exists. Please use a different one or log in.',
        formData: req.body
      });
    }
    console.error(err);
    res.send("Error during signup");
  }
});


// ✅ GET Login Page
app.get("/login", (req, res) => {
  res.render("login", { error_msg: "", formData: {} });
});

// ✅ POST Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      const match = await bcrypt.compare(password, user.password);
      if (match) {
        req.session.userId = user.id;
        req.session.user = {
          id: user.id,
          firstname: user.firstname,
          email: user.email
        };
        return res.redirect("/quiz");
      }
    }
    res.render("login", { error_msg: "Invalid email or password", formData: req.body });
  } catch (err) {
    console.error(err);
    res.render("login", { error_msg: "An error occurred", formData: req.body });
  }
});

// ✅ Forgot Password Page
app.get("/forgot-password", (req, res) => {
  res.render("forgot-password", { message: "" });
});

// ✅ POST Forgot Password
app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length > 0) {
      res.render("forgot-password", { message: "Password reset link sent to your email." });
    } else {
      res.render("forgot-password", { message: "Email not found." });
    }
  } catch (err) {
    console.error(err);
    res.render("forgot-password", { message: "An error occurred." });
  }
});

// ✅ Quiz Page
app.get("/quiz", (req, res) => {
  if (!req.session.userId) return res.redirect("/login");
  res.render("quiz", { user: req.session.user });
});

// ✅ Logout
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});


// ✅ Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
