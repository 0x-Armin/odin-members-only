var bcrypt = require("bcryptjs");
const passport = require("passport");

require("dotenv").config();

var express = require("express");
var router = express.Router();

const async = require("async");
const { body, validationResult } = require("express-validator");

const User = require("../models/user");
const Message = require("../models/message");

/* GET home page. */
router.get("/", (req, res, next) => {
  async.parallel(
    {
      async messages() {
        try {
          const messages = await Message.find().populate("user");
          return messages;
        } catch (err) {
          return next(err);
        }
      },
    },
    (err, results) => {
      res.render("index", {
        title: "Members Only",
        user: req.user,
        messages: results.messages,
      });
    }
  );
});

router.get("/sign-up", (req, res) => {
  res.render("sign-up-form");
});

router.post("/sign-up", [
  body("firstName", "First name must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("lastName", "Last name must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("email", "Email must not be empty.")
    .trim()
    .isEmail()
    .normalizeEmail({ gmail_remove_dots: false }),
  body("username", "Username must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("password", "Password must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("passwordCfm")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .custom((val, { req }) => val === req.body.password)
    .withMessage("The passwords do not match"),

  async (req, res, next) => {
    const errors = validationResult(req);

    bcrypt.genSalt(10, function (err, salt) {
      if (err) console.log(err);
      else {
        bcrypt.hash(req.body.password, salt, function (err, hash) {
          const user = new User({
            first_name: req.body.firstName,
            last_name: req.body.lastName,
            email: req.body.email,
            username: req.body.username,
            password: hash,
            membership_status: "Normal",
            admin_status: false,
          });

          // Errors in form field(s). Ask user to re-submit
          if (!errors.isEmpty()) {
            res.render("sign-up-form", {
              title: "Sign up",
              user,
              errors: errors.array(),
            });
            return;
          }

          user
            .save()
            .then(res.redirect("/"))
            .catch((err) => {
              return next(err);
            });
        });
      }
    });
  },
]);

router.post(
  "/log-in",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/",
  })
);

router.get("/log-out", (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

router.get("/upgrade", (req, res, next) => {
  res.render("upgrade-form");
});

router.post("/upgrade", [
  body("passcode")
    .exists({ checkFalsy: true })
    .withMessage("You must type a passcode")
    .custom((value) => value === process.env.INSIDER_PASSCODE)
    .withMessage("Incorrect passcode!"),

  async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.render("upgrade-form", {
        errors: errors.array(),
      });
      return;
    }

    User.findByIdAndUpdate(res.locals.currentUser.id, {
      membership_status: "Insider",
    })
      .then(res.redirect("/"))
      .catch((err) => {
        return next(err);
      });
  },
]);

router.get("/create-message", (req, res, next) => {
  res.render("create-message-form");
});

router.post("/create-message", [
  body("title", "Title must not be empty").trim().isLength({ min: 1 }).escape(),
  body("msgText", "Message text must not be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),

  async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.render("create-message-form", {
        title: req.body.title,
        msgText: req.body.msgText,
        errors: errors.array(),
      });
      return;
    }

    const message = new Message({
      title: req.body.title,
      timestamp: new Date(),
      text: req.body.msgText,
      user: res.locals.currentUser,
    });

    message
      .save()
      .then(res.redirect("/"))
      .catch((err) => {
        return next(err);
      });
  },
]);

router.get("/admin", (req, res, next) => {
  res.render("admin-form");
});

router.post("/admin", [
  body("passcode")
    .exists({ checkFalsy: true })
    .withMessage("You must type a passcode")
    .custom((value) => value === process.env.ADMIN_PASSCODE)
    .withMessage("Incorrect passcode!"),

  async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.render("admin-form", {
        errors: errors.array(),
      });
      return;
    }

    User.findByIdAndUpdate(res.locals.currentUser.id, {
      admin_status: true,
    })
      .then(res.redirect("/"))
      .catch((err) => {
        return next(err);
      });
  },
]);

router.get("/messages/:id/delete", (req, res, next) => {
  async.parallel(
    {
      async message() {
        const message = await Message.findById(req.params.id);
        return message;
      },
    },
    (err, results) => {
      if (err) return next(err);
      if (results.message == null) res.redirect("/");

      res.render("message_delete", {
        title: "Delete message",
        message: results.message,
      });
    }
  );
});

router.post("/messages/:id/delete", (req, res, next) => {
  async.parallel(
    {
      async message() {
        const message = await Message.findById(req.body.messageid);
        return message;
      },
    },
    (err, results) => {
      if (err) return next(err);
      if (results.message == null) {
        return;
      }
      Message.findByIdAndRemove(req.body.messageid)
        .then(() => {
          res.redirect("/");
        })
        .catch((err) => {
          return next(err);
        });
    }
  );
});

module.exports = router;
