const express = require("express");
const router = express.Router();
const { Rubrica } = require("../utils/types");

router.post("/", async (req, res) => {
  try {
    const { rubrica } = req.body;
    const r = new Rubrica({ rubrica });
    await r.save();
  } catch {
    res.status(500).json({ error: "failed to create rubric" });
  }
});
