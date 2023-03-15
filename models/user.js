const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  first_name: { type: String, required: true, maxLength: 100 },
  family_name: { type: String, required: true, maxLength: 100 },
  email: { type: String, required: true },
  username: { type: String, required: true, maxLength: 25 },
  password: { type: String, required: true },
  membership_status: { 
    type: String,
    enum: ['admin', 'normal', 'gold'],
  },
});

UserSchema.virtual("name").get(function() {
  let fullname = "";
  if (this.first_name && this.family_name) {
    fullname = `${this.family_name}, ${this.first_name}`;
  }
  if (!this.first_name || !this.family_name) {
    fullname = "";
  }
  return fullname;
});

module.exports = mongoose.model("User", UserSchema);