const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const path = require("path");
const bcrypt = require("bcrypt");
const pool = require("./db");

const app = express();
const saveScoresRoute = require('./routes/savescores');
app.use('/', saveScoresRoute);

const PORT = process.env.PORT || 10000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
  secret: "your_secret_key",
  resave: false,
  saveUninitialized: true
}));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// Existing middleware
app.use(session({
  secret: "your_secret_key",
  resave: false,
  saveUninitialized: true
}));

// ✅ Add this to make `user` available in EJS templates
app.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
});


// Home Page
app.get("/", (req, res) => {
  res.render("index", { user: req.session.user });
});

// Login Page
app.get("/login", (req, res) => {
  res.render("login", { error_msg: "", formData: {} });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      const match = await bcrypt.compare(password, user.password);
      if (match) {
        req.session.userId = user.id;
        req.session.user = user;
        return res.redirect("/quiz");
      }
    }
    if (match) {
  req.session.userId = user.id;

  // ✅ Add this to store user info
  req.session.user = {
    id: user.id,
    firstname: user.firstname,
    email: user.email
  };

  return res.redirect("/quiz");
}

    res.render("login", { error_msg: "Invalid email or password", formData: req.body });
  } catch (err) {
    console.error(err);
    res.render("login", { error_msg: "An error occurred", formData: req.body });
  }
});

// Signup Page
app.post('/signup', async (req, res) => {
  const { firstname, lastname, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  
  try {
    await pool.query(
      'INSERT INTO users (firstname, lastname, email, password) VALUES ($1, $2, $3, $4)',
      [firstname, lastname, email, hashedPassword]
    );
    res.redirect('/login'); // or wherever you want
  } catch (err) {
    console.error(err);
    res.send("Error during signup");
  }
});

// Forgot Password
app.get("/forgot-password", (req, res) => {
  res.render("forgot-password", { message: "" });
});

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

// Quiz Page (protected)
app.get("/quiz", (req, res) => {
  if (!req.session.userId) return res.redirect("/login");
  res.render("quiz", { user: req.session.user });
});

// Logout
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
