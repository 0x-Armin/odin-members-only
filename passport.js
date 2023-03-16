const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

var bcrypt = require("bcryptjs");

const User = require("./models/user");

passport.use(
  new LocalStrategy((username, password, done) => {
    User.findOne({ username: username })
      .then((user) => {
        if (!user) {
          return done(null, false, { message: "Incorrect username" });
        }
        bcrypt.compare(password, user.password, (err, res) => {
          if (res) {
            // passwords match! log user in
            return done(null, user);
          } else {
            // passwords do not match
            return done(null, false, { message: "Incorrect password" });
          }
        })
      })
      .catch((err) => {
        return done(err);
      });
  })
);

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(async function (id, done) {
  try {
    const user = await User.findById(id);
    if (user) {
      done(null, user);
    }
  } catch (error) {
    console.log(error);
    done(error);
  }
});

module.exports = passport;