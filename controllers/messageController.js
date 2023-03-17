const Message = require("../models/message");

const async = require("async");
const { body, validationResult } = require("express-validator");

exports.message_home = (req, res, next) => {
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
};

exports.message_create_get = (req, res, next) => {
  res.render("create-message-form");
};

exports.message_create_post = [
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
];

exports.message_delete_get = (req, res, next) => {
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
};

exports.message_delete_post = (req, res, next) => {
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
};