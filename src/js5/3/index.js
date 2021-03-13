const express = require("express");
const jimp = require("jimp");

const imageCache = {}; // src: {Image, timestamp}

const route = express.Router();

const getImage = async (src) => {
  if (imageCache[src]) {
    return imageCache[src].image.clone();
  }

  const image = await jimp.read(src);
  const timestamp = Date.now();
  imageCache[src] = { image, timestamp };

  if (Object.keys(imageCache).length > 10) {
    const expired = Object.entries(imageCache).reduce(
      (expiredKey, [key, { timestamp }]) =>
        imageCache[expiredKey] < timestamp ? expiredKey : key,
      src // Start with newest Image key
    );
    delete imageCache[expired];
  }
  return image.clone();
};

route.get("/memegen/api/:text", async (req, res) => {
  const { text } = req.params;
  const { src = "https://placeimg.com/640/480/any" } = req.query;
  const blur = parseInt(req.query.blur) || 0;
  const black = req.query.black === "true";

  const font = await jimp.loadFont(
    black ? jimp.FONT_SANS_32_BLACK : jimp.FONT_SANS_32_WHITE
  );

  try {
    const image = await getImage(src);
    if (blur) image.blur(blur);

    image.print(font, 0, 0, text);

    const imageMime = image.getMIME();
    const imageBuffer = await image.getBufferAsync(imageMime);
    res.set("content-type", imageMime).send(imageBuffer);
  } catch (e) {
    res.send(`Could not process given image. Error:<br>${e}`);
  }
});

module.exports = route
