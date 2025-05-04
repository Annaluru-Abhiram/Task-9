const express = require("express");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const app = express();

const SECRET_KEY = "f47ac10b58cc4372a5670e02b2c3d479b3b93a134b32d5f5e9f1631b76e1732f";

app.use(bodyParser.json());

const users = [
  { id: 1, username: "user1", password: "pass1" },
  { id: 2, username: "user2", password: "pass2" }
];

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: "1h" });
    res.json({ token });
  } else {
    res.status(401).send("Invalid credentials");
  }
});

app.get("/api/protected", (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    res.json({ message: "This is protected data." });
  });
});

app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>JWT Auth</title>
</head>
<body>
  <h1>Login</h1>
  <form id="login-form">
    <input type="text" id="username" placeholder="Username" required /><br />
    <input type="password" id="password" placeholder="Password" required /><br />
    <button type="submit">Login</button>
  </form>
  <button id="fetch-protected">Fetch Protected Data</button>
  <pre id="result"></pre>

  <script>
    let token = "";

    document.getElementById("login-form").addEventListener("submit", async e => {
      e.preventDefault();
      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;

      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      if (res.ok) {
        const data = await res.json();
        token = data.token;
        document.getElementById("result").textContent = "Login successful. Token acquired.";
      } else {
        document.getElementById("result").textContent = "Login failed.";
      }
    });

    document.getElementById("fetch-protected").addEventListener("click", async () => {
      const res = await fetch("/api/protected", {
        headers: { Authorization: \`Bearer \${token}\` }
      });
      const data = await res.json();
      document.getElementById("result").textContent = JSON.stringify(data, null, 2);
    });
  </script>
</body>
</html>
  `);
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
