const { handlebars } = require("hbs");

handlebars.registerHelper("ifInsider", function (arg1, options) {
  return arg1 === "Insider" ? options.fn(this) : options.inverse(this);
});

handlebars.registerHelper("ifNormal", function (arg1, options) {
  return arg1 === "Normal" ? options.fn(this) : options.inverse(this);
});

handlebars.registerHelper("ifAdmin", function(arg, options) {
  return arg ? options.fn(this) : options.inverse(this);
})

handlebars.registerHelper("ifNotAdmin", function (arg, options) {
  return !arg ? options.fn(this) : options.inverse(this);
});