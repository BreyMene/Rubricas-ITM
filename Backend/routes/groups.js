const express = require("express");
const router = express.Router();
const { Grupo, Curso } = require("../utils/types");

// Create a new group
router.post("/", async (req, res) => {
  try {
    const { cursoId, nombre, estudiantes, docente } = req.body;
    const curso = await Curso.findById(cursoId).populate("grupos");
    if (!curso) {
      return res.status(404).json({ error: "course not found" });
    }
    const grupoE = curso.grupos.find((g) => g.nombre === nombre);
    if (grupoE) {
      return res.status(409).json({ error: "group already created" });
    }

    const grupo = new Grupo({ nombre, estudiantes, docente });
    await grupo.save();
    await grupo.populate("docente");

    curso.grupos.push(grupo._id);
    await curso.save();

    res.status(201).json(grupo);
  } catch {
    res.status(500).json({ error: "failed to create group" });
  }
});

// Get a group
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const grupo = await Grupo.findById(id).populate([
      {
        path: "docente",
      },
      {
        path: "rubricas",
        select: "nombre",
      }
    ]);
    res.status(200).json(grupo);
  } catch {
    res.status(500).json({ error: "failed to get groups" });
  }
});

// To get the grups created by a user
router.get("/course/:cId/user/:uId", async (req, res) => {
  try {
    const { cId, uId } = req.params;

    const curso = await Curso.findById(cId).populate({
      path: "grupos",
      match: { docente: uId }
    });
    if (!curso) {
      return res.status(404).json({ error: "course not found" });
    }
    const grupos = curso.grupos;
    if (!grupos || grupos.length === 0) {
      return res.status(404).json({ error: "no groups found for this user in this course" });
    }

    res.status(200).json(grupos);
  } catch (error) {
    res.status(500).json({ error: "failed to get course groups" });
  }
});

// delete users from a group
router.delete("/:id/user/:c", async (req, res) => {
  try {
    const { id, c } = req.params;
    const grupo = await Grupo.findById(id);
    if (!grupo) {
      return res.status(404).json({ error: "group not found" });
    }

    grupo.estudiantes = grupo.estudiantes.filter((e) => e.correo !== c);
    await grupo.save();

    res.status(200).json({ message: "estudiante removed successfully" });
  } catch {
    res.status(500).json({ error: "failed to delete docente" });
  }
});

// Add students in a group already created
router.put("/:gId/estudiantes", async (req, res) => {
  try {
    const { gId } = req.params;
    const { estudiantes } = req.body;

    const grupo = await Grupo.findById(gId);
    if (!grupo) {
      return res.status(404).json({ error: "group not found" });
    }

    // Get existing students emails for validation
    const existingEmails = grupo.estudiantes.map(e => e.correo);

    // Filter out students that are already in the course
    const newStudents = estudiantes.filter(e => !existingEmails.includes(e.correo));

    // Get list of students that were rejected because they're already in the course
    const alreadyInCourse = estudiantes.filter(d => existingEmails.includes(d.correo))
      .map(e => e.correo);

    if (newStudents.length === 0) {
      return res.status(409).json({ error: "all students are already in this course", alreadyInCourse });
    }

    grupo.estudiantes = [...grupo.estudiantes, ...newStudents];
    await grupo.save();

    res.status(200).json(grupo);

  } catch (error) {
    res.status(500).json({ error: "failed to add docentes to course" });
  }
});

// Update student in a group
router.put('/:gId/user/:c', async (req, res) => {
  try {
    const { gId, c } = req.params;
    const { field, value } = req.body;

    const grupo = await Grupo.findById(gId);
    if (!grupo) {
      return res.status(404).json({ error: "group not found" });
    }

    const estudianteIndex = grupo.estudiantes.findIndex((e) => e.correo === c);
    if (estudianteIndex === -1) {
      return res.status(404).json({ error: "student not found in group" });
    }

    // Update the specified field
    grupo.estudiantes[estudianteIndex][field] = value;

    await grupo.save();
    res.status(200).json(grupo);
  } catch (error) {
    res.status(500).json({ error: "failed to update student" });
  }
});

// Update group name
router.put("/:id/update", async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;

    const grupo = await Grupo.findById(id);
    if (!grupo) {
      return res.status(404).json({ error: "group not found" });
    }

    // Check if a group with the new name already exists in the same course
    const curso = await Curso.findOne({ grupos: id });
    if (!curso) {
      return res.status(404).json({ error: "course not found" });
    }

    const existingGroup = await Grupo.findOne({
      _id: { $ne: id },
      nombre: nombre,
      _id: { $in: curso.grupos }
    });

    if (existingGroup) {
      return res.status(409).json({ error: "a group with this name already exists in this course" });
    }

    grupo.nombre = nombre;
    await grupo.save();

    res.status(200).json(grupo);
  } catch (error) {
    res.status(500).json({ error: "failed to update group" });
  }
});

// Delete group
router.delete("/:id/delete", async (req, res) => {
  try {
    const { id } = req.params;

    const curso = await Curso.findOne({ grupos: id });
    if (!curso) {
      return res.status(404).json({ error: "course not found" });
    }

    // Remove the group from the course's grupos array
    curso.grupos = curso.grupos.filter(g => g.toString() !== id);
    await curso.save();

    // Delete the group
    await Grupo.findByIdAndDelete(id);

    res.status(200).json({ message: "group deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "failed to delete group" });
  }
});

module.exports = router;
