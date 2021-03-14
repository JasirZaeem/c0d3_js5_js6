const express = require("express");
const multer = require("multer");
const Tesseract = require("tesseract.js");
const { v4: uuid } = require("uuid");
const fs = require("fs").promises;

const EXPIRATION_DURATION = 1000 * 60 * 5; // Milliseconds in 5 minutes
const jobs = {};

const router = express.Router();
const upload = multer({ dest: "uploads" });

const doJob = async (job) => {
  try {
    const {
      data: { text },
    } = await Tesseract.recognize(job.path, "eng");
    job.text = text;
    job.status = "completed";
  } catch (e) {
    job.status = "error";
  } finally {
    job.expireTimeout = setTimeout(async () => {
      await fs.unlink(job.path);
      delete jobs[job.id];
    }, EXPIRATION_DURATION);
  }
};

router.post("/files", upload.array("userFiles"), (req, res) => {
  const jobsSpawned = req.files.map(({ path, originalname }) => {
    const id = uuid();
    const job = {
      path,
      filename: originalname,
      status: "pending",
      timestamp: Date.now(),
    };
    jobs[id] = job;
    doJob(job);
    return {
      jobid: id,
      filename: originalname,
      url: `${req.hostname}/js5/7/api/jobs/${id}`,
    };
  });
  return res.status(202).json({ jobs: jobsSpawned });
});

router.get("/api/jobs/:id", express.json(), (req, res) => {
  const { filename, status, text = "" } = jobs[req.params.id] || {};
  if (!status) return res.status(404).json({ error: "Job not found" });
  return res.json({ filename, status, text });
});

module.exports = router;
