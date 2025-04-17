const express = require("express");
const router = express.Router();
const { Docente } = require("../types");

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

module.exports = router;
