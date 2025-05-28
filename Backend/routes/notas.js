const express = require('express');
const router = express.Router();
const { Grupo } = require('../utils/types');

// Add a new nota to a group
router.post('/:groupId/notas', async (req, res) => {
    try {
        const { numero, rubrica, fecha } = req.body;
        const groupId = req.params.groupId;

        // Validate required fields
        if (!numero || !rubrica || !fecha) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Find the group and add the nota
        const group = await Grupo.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Add the new nota
        group.notas.push({
            numero,
            rubrica,
            fecha: new Date(fecha)
        });

        // Save the updated group
        await group.save();

        // Return the updated group
        res.status(201).json(group);
    } catch (error) {
        console.error('Error adding nota:', error);
        res.status(500).json({ message: 'Error adding nota' });
    }
});

// Get all notas for a group
router.get('/:groupId/notas', async (req, res) => {
    try {
        const groupId = req.params.groupId;

        const group = await Grupo.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        res.json(group.notas);
    } catch (error) {
        console.error('Error getting notas:', error);
        res.status(500).json({ message: 'Error getting notas' });
    }
});

// Get a specific nota from a group
router.get('/:groupId/notas/:notaNumero', async (req, res) => {
    try {
        const { groupId, notaNumero } = req.params;

        const group = await Grupo.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        const nota = group.notas.find(n => n.numero === parseInt(notaNumero));
        if (!nota) {
            return res.status(404).json({ message: 'Nota not found' });
        }

        res.json(nota);
    } catch (error) {
        console.error('Error getting nota:', error);
        res.status(500).json({ message: 'Error getting nota' });
    }
});

// Delete a nota from a group
router.delete('/:groupId/notas/:notaNumero', async (req, res) => {
    try {
        const { groupId, notaNumero } = req.params;

        const group = await Grupo.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Find the nota to get its rubrica ID
        const notaToDelete = group.notas.find(n => n.numero === parseInt(notaNumero));
        if (!notaToDelete) {
            return res.status(404).json({ message: 'Nota not found' });
        }

        // Remove the nota
        group.notas = group.notas.filter(n => n.numero !== parseInt(notaNumero));

        // Remove corresponding grades from all students' calificaciones
        group.estudiantes.forEach(student => {
            student.calificaciones = student.calificaciones.filter(
                c => c.rubrica.toString() !== notaToDelete.rubrica.toString()
            );
        });

        // Save the updated group
        await group.save();

        res.json({ message: 'Nota and associated grades deleted successfully' });
    } catch (error) {
        console.error('Error deleting nota:', error);
        res.status(500).json({ message: 'Error deleting nota' });
    }
});

// Save grade for a nota
router.put('/:groupId/notas/:notaNumero/grade', async (req, res) => {
    try {
        const { groupId, notaNumero } = req.params;
        const { temas, estudiante } = req.body;

        // Find the group
        const group = await Grupo.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Find the nota in the group
        const nota = group.notas.find(n => n.numero === parseInt(notaNumero));
        if (!nota) {
            return res.status(404).json({ message: 'Nota not found' });
        }

        // Find the student in the group
        const student = group.estudiantes.find(e => e.correo === estudiante);
        if (!student) {
            return res.status(404).json({ message: 'Student not found in group' });
        }

        // Initialize calificaciones array if it doesn't exist
        if (!nota.calificaciones) {
            nota.calificaciones = [];
        }

        // Find if there's an existing grade for this student in the nota
        const existingGradeIndex = nota.calificaciones.findIndex(c => c.estudiante === estudiante);
        
        if (existingGradeIndex !== -1) {
            // Update existing grade in nota
            nota.calificaciones[existingGradeIndex].temas = temas;
        } else {
            // Add new grade to nota
            nota.calificaciones.push({
                estudiante,
                temas
            });
        }

        // Calculate final grade
        const calificacionFinal = temas.reduce((sum, tema) => {
            return sum + tema.criterios.reduce((temaSum, criterio) => 
                temaSum + ((criterio.peso || 0) * (criterio.calificacion || 0)), 0);
        }, 0);

        // Update or add grade in student's calificaciones
        const existingStudentGradeIndex = student.calificaciones.findIndex(
            c => c.rubrica.toString() === nota.rubrica.toString()
        );

        if (existingStudentGradeIndex !== -1) {
            // Update existing grade
            student.calificaciones[existingStudentGradeIndex] = {
                rubrica: nota.rubrica,
                fecha: new Date(),
                calificacionFinal,
                temas
            };
        } else {
            // Add new grade
            student.calificaciones.push({
                rubrica: nota.rubrica,
                fecha: new Date(),
                calificacionFinal,
                temas
            });
        }

        // Save the updated group
        await group.save();

        res.json({ message: 'Grade saved successfully' });
    } catch (error) {
        console.error('Error saving grade:', error);
        res.status(500).json({ message: 'Error saving grade' });
    }
});

// Get a student's grade for a specific nota
router.get('/:groupId/notas/:notaNumero/estudiante/:estudiante', async (req, res) => {
    try {
        const { groupId, notaNumero, estudiante } = req.params;

        const group = await Grupo.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        const nota = group.notas.find(n => n.numero === parseInt(notaNumero));
        if (!nota) {
            return res.status(404).json({ message: 'Nota not found' });
        }

        // Find the student in the group
        const student = group.estudiantes.find(e => e.correo === estudiante);
        if (!student) {
            return res.status(404).json({ message: 'Student not found in group' });
        }

        // First check student's calificaciones
        const studentGrade = student.calificaciones.find(
            c => c.rubrica.toString() === nota.rubrica.toString()
        );

        if (studentGrade) {
            return res.json(studentGrade);
        }

        // If not found in student's calificaciones, check nota's calificaciones
        if (nota.calificaciones) {
            const notaGrade = nota.calificaciones.find(c => c.estudiante === estudiante);
            if (notaGrade) {
                return res.json(notaGrade);
            }
        }

        // If no grade found anywhere, return empty response
        return res.json({ temas: [] });
    } catch (error) {
        console.error('Error getting student grade:', error);
        res.status(500).json({ message: 'Error getting student grade' });
    }
});

module.exports = router; 