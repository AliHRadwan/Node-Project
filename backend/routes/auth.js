const express = require("express");
const router = express.Router();
const register  = require("../controllers/registerController");
const  verifyEmail = require("../controllers/verifyemail");

router.post("/register", register);
router.get('/verify/:token', verifyEmail);

module.exports = router;