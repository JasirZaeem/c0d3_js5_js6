const express = require("express");
const fs = require("fs").promises;

const router = express.Router();

const files = {}; // name : expirationTimeout

const path = `${__dirname}/filesDir/`;
const STORAGE_DURATION = 5 * 60 * 1000; // Milliseconds in 5 minutes

const fileList = () => Object.keys(files);

const deleteFile = async (filename) => {
  if (!files[filename]) return;
  await fs.unlink(path + filename);
  delete files[filename];
};

const saveFile = async (filename, data) => {
  if (files[filename]) clearTimeout(files[filename]); // If file is being overwritten
  await fs.writeFile(path + filename, data);
  files[filename] = setTimeout(deleteFile, STORAGE_DURATION, filename);
};

router.post("/api/files", async (req, res) => {
  const { filename, content } = req.body;
  console.log(req.body);
  try {
    await saveFile(filename, content);
    res.sendStatus(201);
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
});

router.get("/api/files", (req, res) => {
  res.json(fileList());
});

router.get("/api/files/:filename", async (req, res) => {
  const { filename } = req.params;
  if (!files[filename]) return res.sendStatus(404);

  try {
    return res.json({
      name: filename,
      content: await fs.readFile(path + filename, "utf-8"),
    });
  } catch (e) {
    return res.send("Error reading file.");
  }
});

module.exports = router
