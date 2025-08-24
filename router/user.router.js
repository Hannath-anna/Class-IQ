const router = require("express").Router();
const userController = require("../controllers/user.controller")

router.get("/", userController.getAllUsers);
router.patch("/block", userController.blockUser);
router.patch("/verify", userController.approveStudent);

module.exports = router;