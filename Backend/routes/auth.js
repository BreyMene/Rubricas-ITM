const express = require("express");
const router = express.Router();
const { Docente } = require("../utils/types");
const redis = require("../utils/cache");
const { sendCodeEmail } = require("../utils/mailer");

// Create Account
router.post("/register", async (req, res) => {
  try {
    const { correo, contraseña } = req.body;
    let docente = await Docente.findOne({ correo });
    if (docente) {
      return res.status(401).json({ error: "account already created" });
    }
    const result = new Docente({ correo: correo, contraseña: contraseña });
    await result.save();
    docente = result.toObject();
    delete docente.contraseña;
    res.status(201).json(docente);
  } catch {
    res.status(500).json({ error: "failed to create docente" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { correo, contraseña } = req.body;
    const docente = await Docente.findOne({ correo, contraseña }).select(
      "-contraseña",
    );
    if (!docente) {
      return res.status(401).json({ error: "failed to login" });
    }
    res.status(200).json(docente);
  } catch {
    res.status(500).json({ error: "failed to login" });
  }
});

// Send OTP
router.post("/recover", async (req, res) => {
  try {
    const { correo } = req.body;

    const docente = await Docente.findOne({ correo });
    if (!docente) return res.status(404).json({ error: "failed to get user" });

    const code = await redis.get(`recover:${correo}`);
    if (!existingCode) {
      code = Math.floor(100000 + Math.random() * 900000).toString();

      await redis.setex(`recover:${correo}`, 600, code);
    }

    await sendCodeEmail(correo, code);

    res.status(200).json({ message: "code sent correctly" });
  } catch(error) {
    console.log("Error en /recover:", error);
    res.status(500).json({ error: "failed to create code" });
  }
});

// Validate OTP
router.post("/validate", async (req, res) => {
  try {
    const { correo, codigo } = req.body;

    const docente = await Docente.findOne({ correo });
    if (!docente) return res.status(404).json({ error: "failed to get user" });

    const storedCode = await redis.get(`recover:${correo}`);
    if (!storedCode || storedCode !== codigo) {
      return res.status(400).json({ error: "invalid code or expired code" });
    }
    await redis.del(`recover:${correo}`);

    res.status(200).json({ message: "valid code" });
  } catch {
    res.status(500).json({ error: "failed to create code" });
  }
});

// Chage password
router.put("/change-password", async (req, res) => {
  try{
    const { correo, contraseña } = req.body;

    const docente = await Docente.findOne({ correo });
    if (!docente) return res.status(404).json({ error: "failed to get user" });

    docente.contraseña = contraseña;
    await docente.save();

    res.status(200).json({ message: "password changed" });
  } catch {
    res.status(500).json({ error: "failed to change password" });
  }
});

module.exports = router;
