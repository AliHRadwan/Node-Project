const express = require("express");
const router = express.Router();
const register  = require("../controllers/registerController");
const verifyEmail = require("../controllers/verifyemail");
const pass_forgot = require("../controllers/forget_passwordController");
const pass_reset = require("../controllers/reset_passwordController"); 
const path = require("path");

router.post("/register", register);
router.get('/verify/:token', verifyEmail);

router.post("/forgot-password", pass_forgot);
router.post("/reset-password/:token", pass_reset);

router.get("/reset-password/:token", (req, res) => {
  const { token } = req.params;
  res.send(`
    <html>
      <head>
        <title>Reset Password</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            background: #f7f7f7;
          }
          .container {
            background: white;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            width: 300px;
            text-align: center;
          }
          input {
            width: 100%;
            padding: 8px;
            margin: 10px 0;
            border-radius: 8px;
            border: 1px solid #ccc;
          }
          button {
            background: #007bff;
            color: white;
            border: none;
            padding: 10px 16px;
            border-radius: 8px;
            cursor: pointer;
          }
          button:hover {
            background: #0056b3;
          }
          .msg {
            margin-top: 10px;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Reset Your Password</h2>
          <input 
            type="password" 
            id="password"
            placeholder="Enter new password" 
            required
          />
          <button id="submitBtn">Reset Password</button>
          <div class="msg" id="msg"></div>
        </div>

        <script>
          const btn = document.getElementById('submitBtn');
          const msg = document.getElementById('msg');

          btn.addEventListener('click', async () => {
            const password = document.getElementById('password').value.trim();
            if (!password) {
              msg.textContent = 'Please enter a new password.';
              msg.style.color = 'red';
              return;
            }

            try {
              const res = await fetch('/api/auth/reset-password/${token}', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
              });

              const data = await res.json();

              if (res.ok) {
                msg.textContent = data.message || '✅ Password reset successfully!';
                msg.style.color = 'green';
              } else {
                msg.textContent = data.error || '❌ Something went wrong!';
                msg.style.color = 'red';
              }
            } catch (err) {
              msg.textContent = '⚠️ Error connecting to server.';
              msg.style.color = 'red';
            }
          });
        </script>
      </body>
    </html>
  `);
});




module.exports = router;