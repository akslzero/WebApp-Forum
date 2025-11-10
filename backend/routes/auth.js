const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const auth = require("../middleware/auth");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me", auth, authController.getMe);
router.put("/email", auth, authController.updateEmail);
router.put("/password", auth, authController.updatePassword);
router.put("/username", auth, authController.updateUsername);
router.delete("/delete", auth, authController.deleteAccount);

module.exports = router;
