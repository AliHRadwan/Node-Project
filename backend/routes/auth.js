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
//router.post("/reset-password/:token", pass_reset);

router.get("/reset-password/:token", (req, res) => {
  const { token } = req.params;
  res.send(`
    <html>
      <head><title>Reset Password</title></head>
      <body style="font-family: sans-serif; text-align:center;">
        <h2>Reset Your Password</h2>
        <form action="/api/auth/reset-password/${token}" method="POST">
          <input 
            type="password" 
            name="password" 
            placeholder="Enter new password" 
            required 
            style="padding:8px; margin:10px;"
          />
          <br/>
          <button type="submit" style="padding:8px 16px;">Reset Password</button>
        </form>
      </body>
    </html>
  `);
});



module.exports = router;