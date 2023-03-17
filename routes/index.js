require("dotenv").config();

var express = require("express");
var router = express.Router();

const passport = require("passport");

const user_controller = require("../controllers/userController");
const message_controller = require("../controllers/messageController");

/* GET home page. */
router.get("/", message_controller.message_home);

router.get("/sign-up", user_controller.user_signup_get);
router.post("/sign-up", user_controller.user_signup_post);

router.post(
  "/log-in",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/",
  })
);

router.get("/log-out", user_controller.user_logout);

router.get("/upgrade", user_controller.user_upgrade_get);
router.post("/upgrade", user_controller.user_upgrade_post);

router.get("/admin", user_controller.user_admin_get);
router.post("/admin", user_controller.user_admin_post);

router.get("/create-message", message_controller.message_create_get);
router.post("/create-message", message_controller.message_create_post);

router.get("/messages/:id/delete", message_controller.message_delete_get);
router.post("/messages/:id/delete", message_controller.message_delete_post);

module.exports = router;
