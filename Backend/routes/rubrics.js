const express = require("express");
const router = express.Router();
const { Rubrica, Curso, Grupo } = require("../utils/types");
const { ClonarRubrica } = require("../utils/clone")

// Create rubric
router.post("/", async (req, res) => {
  try {
    const { rubrica } = req.body;
    let r = await Rubrica.findOne({ nombre: rubrica.nombre })

    r = new Rubrica(rubrica);
    await r.save();
    res.status(201).json({ message: "rubric created successfully" });
  } catch {
    res.status(500).json({ error: "failed to create rubric" });
  }
});

// Clone an existing rubric (Prototype)
router.get("/clone/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const original = await Rubrica.findById(id);
    if (!original) {
      return res.status(404).json({ error: "rubric not found" });
    }

    const rubrica = ClonarRubrica(original);

    res.status(200).json(rubrica);
  } catch {
    res.status(500).json({ error: "failed to clone rubric" });
  }
});

// Get a specific rubric
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const rubrica = await Rubrica.findById(id);
    if (!rubrica) {
      return res.status(404).json({ error: "rubric not found" });
    }

    res.status(200).json(rubrica);
  } catch {
    res.status(500).json({ error: "failed to create rubric" });
  }
});

// Get all the rubrics that a user is allowed to see, for example in a course where the user is a moderator
// or in the groups a user created. It`s used in rubrics page
router.get("/user/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const rubricasSet = new Map();

    const cursos = await Curso.find({ "docentes._id": id, "docentes.moderador": true },
      {rubricaGuia: 1}
    ).populate("rubricaGuia", "nombre");

    const grupos = await Grupo.find({ docente: id }, {rubricas: 1})
    .populate("rubricas", "nombre");

    cursos.forEach((curso) => {
      if (curso.rubricaGuia) {
        rubricasSet.set(curso.rubricaGuia._id.toString(), {
          _id: curso.rubricaGuia._id,
          nombre: curso.rubricaGuia.nombre,
        });
      }
    });

    grupos.forEach((grupo) => {
      grupo.rubricas.forEach((r) => {
        rubricasSet.set(r._id.toString(), {
          _id: r._id,
          nombre: r.nombre,
        });
      });
    });

    const rubricas = Array.from(rubricasSet.values());
    res.status(200).json(rubricas);
  } catch {
    res.status(500).json({ error: "failed to get rubrics" });
  }
});

// Assign a rubric to a course as RubricaGuia
router.put("/:r/course/:cId", async (req, res) => {
  try {
    const { cId, r } = req.params;

    const rubric = await Rubrica.findById(r);
    if (!rubric) {
      return res.status(404).json({ error: "rubric not found" });
    }
    const curso = await Curso.findById(cId);
    if (!curso) {
      return res.status(404).json({ error: "course not found" });
    }

    curso.rubricaGuia = r;
    await curso.save();

    res.status(200).json({ message: "rubric assigned to course successfully" });
  } catch {
    res.status(500).json({ error: "failed to assign rubric to course" });
  }
});

// Assign a rubric to a group
router.put("/:r/group", async (req, res) => {
  try {
    const { r } = req.params;
    const { ids } = req.body;

    const rubric = await Rubrica.findById(r);
    if (!rubric) {
      return res.status(404).json({ error: "rubric not found" });
    }

    for (const id of ids) {
      const grupo = await Grupo.findById(id);
      if (!grupo) continue;

      if (!grupo.rubricas.includes(r)) {
        grupo.rubricas.push(r);
        await grupo.save();
      }
    }

    res.status(200).json({ message: "rubric assigned to groups successfully" });
  } catch {
    res.status(500).json({ error: "failed to assign rubric to group" });
  }
});

module.exports = router;