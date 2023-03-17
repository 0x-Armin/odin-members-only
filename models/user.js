const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  first_name: { type: String, required: true, maxLength: 100 },
  last_name: { type: String, required: true, maxLength: 100 },
  email: { type: String, required: true },
  username: { type: String, required: true, maxLength: 25 },
  password: { type: String, required: true },
  membership_status: { 
    type: String,
    enum: ['Normal', 'Insider'],
  },
  admin_status: { type: Boolean, default: false },
});

UserSchema.virtual("full_name").get(function() {
  let fullname = "";
  if (this.first_name && this.last_name) {
    fullname = `${this.last_name}, ${this.first_name}`;
  }
  if (!this.first_name || !this.last_name) {
    fullname = "";
  }
  return fullname;
});

module.exports = mongoose.model("User", UserSchema);