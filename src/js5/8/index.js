const express = require("express");
const path = require("path");
const fs = require("fs").promises;
const { v4: uuid } = require("uuid");

const router = express.Router();

const IMAGE_DIR_PATH = path.join(__dirname, "images");

router.use("/", express.static(path.join(__dirname, "public")));
router.use("/images", express.static(IMAGE_DIR_PATH));

let images; // filename[];

router.get("/api/images", (req, res) => res.json({ images }));

router.post("/api/images", async (req, res) => {
  const { imageData } = req.body;
  if (!imageData)
    return res.status(400).json({ error: "Image data is missing" });
  const id = uuid();
  await fs.writeFile(
    path.join(__dirname, "images", id + ".png"),
    imageData,
    "base64"
  );
  images.push(id);
  return res.json({ id });
});

// Start up
(async () => {
  let savedImages = [];
  try {
    savedImages = await fs.readdir(IMAGE_DIR_PATH);
  } catch (e) {
    await fs.mkdir(IMAGE_DIR_PATH);
  }
  // Remove .png
  images = savedImages.map((image) => image.slice(0, -4));
})();

module.exports = router;
