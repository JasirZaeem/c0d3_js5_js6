const express = require("express");
const path = require("path");
const fs = require("fs").promises;
const Jimp = require("jimp");

const router = express.Router();

const IMAGE_DIR_PATH = path.join(__dirname, "images");

router.use("/", express.static(path.join(__dirname, "public")));
router.use("/images", express.static(IMAGE_DIR_PATH));

const users = {}; // username: lastModified;

let font;

const getLoggedInUser = (req, res, next) => {
  const {
    headers: { cookie },
  } = req;

  req.cookies = cookie?.split(";").reduce((cookies, cookie) => {
    const [name, value] = cookie.trim().split("=");
    return { ...cookies, [name]: value };
  }, {});

  if (!req.cookies?.user)
    return res.status(400).json({ error: "User not logged in" });
  next();
};

router.get("/api/users", getLoggedInUser, (req, res) => res.json({ users }));

router.post("/api/users/", getLoggedInUser, async (req, res) => {
  const { user } = req.cookies;
  console.log({ user });

  const { imageData: data, meme } = req.body;
  const memeText = meme?.trim();
  if (!memeText || !data)
    return res.status(400).json({ error: "Image and meme are required" });

  const imageData = await Buffer.from(data, "base64");
  const image = await Jimp.read(imageData);
  image.print(font, 0, 0, memeText);
  await image.writeAsync(path.join(IMAGE_DIR_PATH, `${user}.png`));

  users[user] = Date.now();
  return res.json({ user, lastModified: users[user] });
});

// Start up
(async () => {
  let savedImages = [];
  try {
    savedImages = await fs.readdir(IMAGE_DIR_PATH);
  } catch (e) {
    await fs.mkdir(IMAGE_DIR_PATH);
  }
  // Remove .png and initialise users
  const now = Date.now();
  savedImages.forEach((image) => (users[image.slice(0, -4)] = now));
  font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
})();

module.exports = router;