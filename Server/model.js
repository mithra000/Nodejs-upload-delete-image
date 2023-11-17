const mongoose = require("mongoose");

const fileShcema = mongoose.Schema(
  {
    name: String,
    url: String,
  },
  { timeStamps: true }
);

const File = new mongoose.model("file", fileShcema);

module.exports = File;
