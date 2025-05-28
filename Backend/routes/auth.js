const express = require("express");
const router = express.Router();
const { Docente } = require("../utils/types");
const redis = require("../utils/cache");
const { sendCodeEmail, sendPasswordChangeCode } = require("../utils/mailer");

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

    let code = await redis.get(`recover:${correo}`);
    if (!code) {
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

// Verify current password
router.post("/verify-password", async (req, res) => {
  try {
    const { contraseña, correo } = req.body;
    const docente = await Docente.findOne({ correo, contraseña });
    
    if (!docente) {
      return res.status(401).json({ valid: false, error: "invalid password" });
    }
    
    res.status(200).json({ valid: true });
  } catch {
    res.status(500).json({ valid: false, error: "failed to verify password" });
  }
});

// Send password change OTP
router.post("/send-password-change-code", async (req, res) => {
  try {
    const { correo } = req.body;

    const docente = await Docente.findOne({ correo });
    if (!docente) return res.status(404).json({ error: "failed to get user" });

    let code = await redis.get(`password-change:${correo}`);
    if (!code) {
      code = Math.floor(100000 + Math.random() * 900000).toString();
      await redis.setex(`password-change:${correo}`, 600, code);
    }

    await sendPasswordChangeCode(correo, code);

    res.status(200).json({ message: "code sent correctly" });
  } catch(error) {
    console.log("Error en /send-password-change-code:", error);
    res.status(500).json({ error: "failed to create code" });
  }
});

// Validate password change OTP
router.post("/validate-password-change", async (req, res) => {
  try {
    const { correo, codigo } = req.body;

    const docente = await Docente.findOne({ correo });
    if (!docente) return res.status(404).json({ error: "failed to get user" });

    const storedCode = await redis.get(`password-change:${correo}`);
    if (!storedCode || storedCode !== codigo) {
      return res.status(400).json({ error: "invalid code or expired code" });
    }
    await redis.del(`password-change:${correo}`);

    res.status(200).json({ message: "valid code" });
  } catch {
    res.status(500).json({ error: "failed to validate code" });
  }
});

module.exports = router;
