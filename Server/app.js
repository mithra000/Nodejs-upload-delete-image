const mongoose = require("mongoose");
const express = require("express");
const path = require("path");
const cors = require("cors");
const File = require("./model");
const multer = require("multer");
const mime = require("mime-types");
const fs = require("fs");
require("dotenv").config();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log("Fist cb");
    cb(null, "public");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = mime.extension(file.mimetype);
    console.log("Second CB");
    cb(null, file.fieldname + "-" + uniqueSuffix + `.${extension}`);
  },
});
const upload = multer({ storage: storage });

const app = express();
app.use(express.json());
app.use(cors());
if (!fs.existsSync("./public")) {
  fs.mkdirSync("./public");
}
app.use(express.static("public"));

const initializeDBAndServer = async () => {
  try {
    await mongoose.connect(process.env.mongodbUrl).then(() => {
      console.log("You successfully connected to MongoDB! Atlas");
    });
  } catch (error) {
    console.error("Error connecting to MongoDB Atlas:", error);
  }
};

initializeDBAndServer();
app.listen(process.env.port, () => {
  console.log(`Server is Running at http://localhost/3000`);
});

app.get("/file", async (req, res) => {
  try {
    const files = await File.find();
    res.status(200).json({ files });
  } catch (error) {
    console.log(`Getting Files Error: ${error}`);
    res.status(500).json({ message: "Someting went wrong" });
  }
});

app.post("/file", upload.single("file"), async (req, res) => {
  try {
    console.log("File: ", req.file);
    console.log(req.body);
    const document = await File.findOne({ name: req.file.originalname });
    if (req.body.replace) {
      const filePath = `${process.env.PWD}/public/${
        document.url.split("/")[document.url.split("/").length - 1]
      }`;

      fs.unlink(filePath, (err) => {
        if (err) {
          console.log("Error while deleting file", err);
        }
      });
      document.url = `${process.env.hostUrl}/${req.file.filename}`;
      await document.save();
      res
        .status(200)
        .json({ message: "file replaced successfully", file: document });
    } else {
      if (document) {
        return res.status(400).json({ message: "given file is already exits" });
      }
      const fileObj = {
        name: req.file.originalname,
        url: `${process.env.hostUrl}/${req.file.filename}`,
      };
      const file = await File.create(fileObj);
      res.status(200).json({ message: `file uploaded successfully`, file });
    }
  } catch (error) {
    console.log(`Uploaded File Error: ${error}`);
    res.status(500).json({ message: "Someting went wrong" });
  }
});

app.delete(`/file/:id`, async (req, res) => {
  try {
    const deleteItemId = req.params.id;
    const file = await File.findById(deleteItemId);
    if (file) {
      const filePath = `${process.env.PWD}/public/${
        file.url.split("/")[file.url.split("/").length - 1]
      }`;

      fs.unlink(filePath, (err) => {
        if (err) {
          console.log("Error while deleting file", err);
        }
      });
      await File.deleteOne({ _id: file._id });

      res.status(200).json({ message: "File Deleted Successfully" });
    } else {
      return res.status(404).json({ message: "File Not Found" });
    }
  } catch (error) {
    console.log("Deleting File Error : ", error);
    res.status(500).json({ message: "Something went wrong" });
  }
});
