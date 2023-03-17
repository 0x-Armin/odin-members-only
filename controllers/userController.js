var bcrypt = require("bcryptjs");

const User = require("../models/user");

const { body, validationResult } = require("express-validator");

exports.user_signup_get = (req, res) => {
  res.render("sign-up-form");
};

exports.user_signup_post = [
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
];

exports.user_logout = (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
};

exports.user_upgrade_get = (req, res, next) => {
  res.render("upgrade-form");
};

exports.user_upgrade_post = [
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
];

exports.user_admin_get = (req, res, next) => {
  res.render("admin-form");
};

exports.user_admin_post = [
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
];

