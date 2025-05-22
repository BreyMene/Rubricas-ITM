const express = require("express");
const router = express.Router();
const { Rubrica, Curso, Grupo } = require("../utils/types");
const { ClonarRubrica } = require("../utils/clone")

// Create rubric
router.post("/", async (req, res) => {
  try {
    const { nombre, estado, temas, docente } = req.body;

    const r = new Rubrica({nombre, estado, temas, docente});
    await r.save();

    res.status(201).json(r._id);
  } catch {
    res.status(500).json({ error: "failed to create rubric" });
  }
});

// Clone a rubric
router.get('/clone/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const rubric = await Rubrica.findById(id);
        if (!rubric) {
            return res.status(404).json({ message: 'Rúbrica no encontrada' });
        }

        // Create a new rubric with the same data but without _id
        const newRubric = new Rubrica({
            nombre: `${rubric.nombre} (Copia)`,
            estado: 'borrador',
            temas: rubric.temas,
            docente: rubric.docente
        });

        await newRubric.save();
        res.json(newRubric);
    } catch (error) {
        console.error('Error cloning rubric:', error);
        res.status(500).json({ message: 'Error al clonar la rúbrica' });
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
    const rubricas = [];

    // Get rubrics from courses where user is moderator
    const cursos = await Curso.find({
      docentes: {
        $elemMatch: {
          _id: id,
          moderador: true
        }
      }
    }, { rubricasGuia: 1 }).populate({
      path: "rubricasGuia",
      select: "nombre estado"
    });

    // Get rubrics from groups created by user
    const grupos = await Grupo.find({ docente: id }, {rubricas: 1})
    .populate({path: "rubricas", select: "nombre estado"});

    // Get draft rubrics directly associated with the docente
    const draftRubrics = await Rubrica.find({ docente: id, estado: 'borrador' });

    const agregarRubrica = (rubrica) => {
      if (rubrica && !rubricas.some(r => r._id.equals(rubrica._id))){
        rubricas.push({
          _id: rubrica._id,
          nombre: rubrica.nombre,
          estado: rubrica.estado
        });
      }
    };

    cursos.forEach(curso => {
      curso.rubricasGuia.forEach(agregarRubrica);
    });

    grupos.forEach(grupo => {
      grupo.rubricas.forEach(agregarRubrica);
    });

    // Add draft rubrics
    draftRubrics.forEach(agregarRubrica);

    res.status(200).json(rubricas);
  } catch {
    res.status(500).json({ error: "failed to get rubrics" });
  }
});

// Update a rubric
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, estado, temas } = req.body;

    const rubrica = await Rubrica.findById(id);
    if (!rubrica) {
      return res.status(404).json({ error: "rubric not found" });
    }

    // Update fields if provided
    if (nombre) rubrica.nombre = nombre;
    if (estado) rubrica.estado = estado;
    if (temas) rubrica.temas = temas;

    await rubrica.save();
    res.status(200).json({ message: "rubric updated successfully" });
  } catch {
    res.status(500).json({ error: "failed to update rubric" });
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

    // Deactivate all previous guide rubrics
    if (curso.rubricasGuia && curso.rubricasGuia.length > 0) {
      await Promise.all(curso.rubricasGuia.map(async (prevRubricId) => {
        const prevRubric = await Rubrica.findById(prevRubricId);
        if (prevRubric) {
          prevRubric.estado = 'inactivo';
          await prevRubric.save();
        }
      }));
    }

    // Set the new rubric as active and add it to the course's guide rubrics
    rubric.estado = 'activo';
    await rubric.save();
    
    // Add the new rubric to the array if it's not already there
    if (!curso.rubricasGuia.includes(r)) {
      curso.rubricasGuia.push(r);
      await curso.save();
    }

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

    await Promise.all(ids.map(async (id) => {
      const grupo = await Grupo.findById(id);
      if (grupo) {
        // Deactivate previous rubrics in the group
        for (const prevRubricId of grupo.rubricas) {
          const prevRubric = await Rubrica.findById(prevRubricId);
          if (prevRubric) {
            prevRubric.estado = 'inactivo';
            await prevRubric.save();
          }
        }
        // Add the new rubric to the group's rubrics array
        if (!grupo.rubricas.includes(r)) {
          grupo.rubricas.push(r);
          await grupo.save();
        }
      }
    }));

    res.status(200).json({ message: "rubric assigned to groups successfully" });
  } catch {
    res.status(500).json({ error: "failed to assign rubric to group" });
  }
});

// Delete a rubric
router.delete('/:id', async (req, res) => {
    try {
        const rubric = await Rubrica.findById(req.params.id);
        if (!rubric) {
            return res.status(404).json({ message: 'Rúbrica no encontrada' });
        }

        // Remove rubric from any courses that reference it
        await Curso.updateMany(
            { rubricasGuia: rubric._id },
            { $pull: { rubricasGuia: rubric._id } }
        );

        // Remove rubric from any groups that reference it
        await Grupo.updateMany(
            { rubricas: rubric._id },
            { $pull: { rubricas: rubric._id } }
        );

        // Delete the rubric
        await Rubrica.findByIdAndDelete(req.params.id);

        res.json({ message: 'Rúbrica eliminada exitosamente' });
    } catch (error) {
        console.error('Error deleting rubric:', error);
        res.status(500).json({ message: 'Error al eliminar la rúbrica' });
    }
});

// Get active guide rubric for a course
router.get('/course/:courseId/active', async (req, res) => {
    try {
        const course = await Curso.findById(req.params.courseId)
            .populate({
                path: 'rubricasGuia',
                match: { estado: 'activo' }
            });

        if (!course) {
            return res.status(404).json({ message: 'Curso no encontrado' });
        }

        const activeRubric = course.rubricasGuia.find(r => r.estado === 'activo');
        if (!activeRubric) {
            return res.status(404).json({ message: 'No hay rúbrica guía activa' });
        }

        res.json(activeRubric);
    } catch (error) {
        console.error('Error getting active guide rubric:', error);
        res.status(500).json({ message: 'Error al obtener la rúbrica guía activa' });
    }
});

module.exports = router;