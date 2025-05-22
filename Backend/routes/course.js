const express = require("express");
const router = express.Router();
const { Curso } = require("../utils/types");
const { ValidarDocentes } = require("../utils/validations");

// Create Course
router.post("/", async (req, res) => {
  try {
    const { icono, nombre, docentes } = req.body;
    let curso = await Curso.findOne({ nombre });
    if (curso) {
      return res.status(409).json({ error: "course already created" });
    }

    const docentesF = await ValidarDocentes(docentes);

    curso = new Curso({ icono: icono, nombre: nombre, docentes: docentesF });
    await curso.save();
    await curso.populate("docentes._id");

    const cursoObj = curso.toObject();
    cursoObj.docentes = cursoObj.docentes.map((d) => {
      return {
        moderador: d.moderador,
        _id: d._id._id,
        correo: d._id.correo,
      };
    });
    res.status(201).json(cursoObj);
  } catch {
    res.status(500).json({ error: "failed to create course" });
  }
});

// Get courses where the user is
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const cursos = await Curso.find({ "docentes._id": id }).populate(
      "docentes._id",
    ).populate("rubricasGuia", "nombre estado");
    const cursosObj = cursos.map((curso) => {
      const c = curso.toObject();
      c.docentes = c.docentes.map((d) => ({
        moderador: d.moderador,
        _id: d._id._id,
        correo: d._id.correo,
      }));
      return c;
    });
    res.status(200).json(cursosObj);
  } catch {
    res.status(500).json({ error: "failed to get courses" });
  }
});

// it is used when the web app is opened by URL in a specific course
router.get("/get/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const curso = await Curso.findById(id).populate("docentes._id").populate("rubricasGuia", "nombre estado");
    const cursoObj = curso.toObject();
    cursoObj.docentes = cursoObj.docentes.map((d) => {
      return {
        moderador: d.moderador,
        _id: d._id._id,
        correo: d._id.correo,
      };
    });
    res.status(200).json(cursoObj);
  } catch {
    res.status(500).json({ error: "failed to get courses" });
  }
});

// Get groups of a specific course
router.get("/groups/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const curso = await Curso.findById(id).populate({
      path: "grupos",
      populate: {
        path: "docente",
      },
    });

    res.status(200).json(curso.grupos);
  } catch {
    res.status(500).json({ error: "failed to get groups" });
  }
});

// Delete user from a course
router.delete("/:cId/user/:c", async (req, res) => {
  try {
    const { cId, c } = req.params;
    const curso = await Curso.findById(cId).populate("docentes._id");
    if (!curso) {
      return res.status(404).json({ error: "course not found" });
    }

    curso.docentes = curso.docentes.filter((d) => d._id.correo !== c);
    await curso.save();

    res.status(200).json({ message: "docente removed successfully" });
  } catch {
    res.status(500).json({ error: "failed to delete docente" });
  }
});

// Make user a moderator
router.put("/:cId/moderator/:c", async (req, res) => {
  try {
    const { cId, c } = req.params;
    const { moderador } = req.body;

    const curso = await Curso.findById(cId).populate("docentes._id");
    if (!curso) {
      return res.status(404).json({ error: "course not found" });
    }

    const docenteIndex = curso.docentes.findIndex((d) => d._id.correo === c);
    curso.docentes[docenteIndex].moderador = moderador;
    await curso.save();

    res.status(200).json({ message: "moderator status updated successfully" });
  } catch {
    res.status(500).json({ error: "failed to update moderator status" });
  }
});

// Add users in a course already created
router.put("/:cId/docentes", async (req, res) => {
  try {
    const { cId } = req.params;
    const { docentes } = req.body;

    const curso = await Curso.findById(cId).populate("docentes._id");
    if (!curso) {
      return res.status(404).json({ error: "course not found" });
    }

    // Get existing docentes emails for validation
    const existingEmails = curso.docentes.map(d => d._id.correo);

    // Filter out docentes that are already in the course
    const newDocentes = docentes.filter(d => !existingEmails.includes(d.correo));

    // Get list of docentes that were rejected because they're already in the course
    const alreadyInCourse = docentes.filter(d => existingEmails.includes(d.correo))
      .map(d => d.correo);

    if (newDocentes.length === 0) {
      return res.status(409).json({ error: "all docentes are already in this course", alreadyInCourse });
    }

    const validatedDocentes = await ValidarDocentes(newDocentes);

    curso.docentes = [...curso.docentes, ...validatedDocentes];
    await curso.save();
    await curso.populate("docentes._id");

    const cursoObj = curso.toObject();
    cursoObj.docentes = cursoObj.docentes.map((d) => {
      return {
        moderador: d.moderador,
        _id: d._id._id,
        correo: d._id.correo,
      };
    });

    res.status(200).json(cursoObj);

  } catch (error) {
    res.status(500).json({ error: "failed to add docentes to course" });
  }
});

// Update course name and icon
router.put('/:cId', async (req, res) => {
  try {
    const { cId } = req.params;
    const { nombre, icono } = req.body;
    const course = await Curso.findById(cId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // This part check if the course name or icon has changed
    let changed = false;
    if (typeof nombre === 'string' && nombre !== course.nombre) {
      course.nombre = nombre;
      changed = true;
    }
    if (typeof icono === 'string' && icono !== course.icono) {
      course.icono = icono;
      changed = true;
    }
    if (!changed) {
      return res.status(200).json(course);
    }
    await course.save();
    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update course' });
  }
});

// Update teacher in a course
router.put('/:cId/user/:c', async (req, res) => {
  try {
    const { cId, c } = req.params;
    const { field, value } = req.body;

    const curso = await Curso.findById(cId).populate("docentes._id");
    if (!curso) {
      return res.status(404).json({ error: "course not found" });
    }

    if (field === 'correo') {
      console.log("Updating email from", c, "to", value);
      
      // Validate if the new email exists in the system first
      const validatedDocentes = await ValidarDocentes([{ correo: value }]);      
      if (validatedDocentes.length === 0) {
        return res.status(404).json({ error: "teacher email does not exist in the system" });
      }

      // Check if the new email is already in use in this course
      const emailExists = curso.docentes.some(d => d._id.correo === value);
      if (emailExists) {
        return res.status(409).json({ error: "email already in use in this course" });
      }

      // Find the teacher to update using the old email (c)
      const docenteIndex = curso.docentes.findIndex((d) => d._id.correo === c);
      
      if (docenteIndex === -1) {
        // If we can't find the teacher with the old email, check if the new email is valid
        // and add it as a new teacher
        curso.docentes.push({
          _id: validatedDocentes[0]._id,
          moderador: false
        });
      } else {
        // Update existing teacher
        curso.docentes[docenteIndex]._id = validatedDocentes[0]._id;
      }
    }

    await curso.save();
    await curso.populate("docentes._id");

    const cursoObj = curso.toObject();
    cursoObj.docentes = cursoObj.docentes.map((d) => {
      return {
        moderador: d.moderador,
        _id: d._id._id,
        correo: d._id.correo,
      };
    });

    res.status(200).json(cursoObj);
  } catch (error) {
    console.error("Error updating teacher:", error);
    res.status(500).json({ error: "failed to update teacher" });
  }
});

// Delete a course by ID
router.delete('/:cId', async (req, res) => {
  try {
    const { cId } = req.params;
    await Curso.findByIdAndDelete(cId);
    
    res.status(200).json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete course' });
  }
});

module.exports = router;
