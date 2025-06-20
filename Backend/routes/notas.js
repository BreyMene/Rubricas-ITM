const express = require('express');
const router = express.Router();
const { Grupo } = require('../utils/types');
const { sendRubricPDF } = require('../utils/mailer');
const { Rubrica } = require('../utils/types');

// Add a new nota to a group
router.post('/:groupId/notas', async (req, res) => {
    try {
        const { numero, rubrica, fecha, porcentaje } = req.body;
        const groupId = req.params.groupId;

        // Validate required fields
        if (!numero || !rubrica || !fecha || porcentaje === undefined) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Validate porcentaje
        if (porcentaje < 0 || porcentaje > 100) {
            return res.status(400).json({ message: 'Porcentaje must be between 0 and 100' });
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
            fecha: new Date(fecha),
            porcentaje
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

        // Remove corresponding grades from all students' calificaciones and recalculate promedio
        group.estudiantes.forEach(student => {
            // Remove the calificación for this nota
            student.calificaciones = student.calificaciones.filter(
                c => c.rubrica.toString() !== notaToDelete.rubrica.toString()
            );
            
            // Recalculate promedio based on remaining calificaciones
            const sumaNotas = student.calificaciones.reduce((sum, cal) => sum + cal.calificacionFinal, 0);
            student.promedio = Number(sumaNotas.toFixed(2));
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
        const { temas, estudiante, observaciones } = req.body;

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

        // Calculate final grade (now considering the nota's percentage)
        const calificacionFinal = Number(temas.reduce((sum, tema) => {
            return sum + tema.criterios.reduce((temaSum, criterio) =>
                temaSum + ((criterio.peso || 0) * (criterio.calificacion || 0)), 0);
        }, 0).toFixed(2));

        // Calculate weighted grade based on nota's percentage
        const weightedGrade = (calificacionFinal * nota.porcentaje) / 100;

        // Update or add grade in student's calificaciones
        const existingStudentGradeIndex = student.calificaciones.findIndex(
            c => c.rubrica.toString() === nota.rubrica.toString()
        );

        if (existingStudentGradeIndex !== -1) {
            // Update existing grade
            student.calificaciones[existingStudentGradeIndex] = {
                rubrica: nota.rubrica,
                fecha: new Date(),
                calificacionFinal: weightedGrade,
                temas,
                observaciones
            };
        } else {
            // Add new grade
            student.calificaciones.push({
                rubrica: nota.rubrica,
                fecha: new Date(),
                calificacionFinal: weightedGrade,
                temas,
                observaciones
            });
        }

        // Calculate new promedio based on all weighted calificacionFinal values
        const sumaNotas = student.calificaciones.reduce((sum, cal) => sum + cal.calificacionFinal, 0);
        student.promedio = Number(sumaNotas.toFixed(2));
        
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
            console.log('Group not found:', groupId);
            return res.status(404).json({ message: 'Group not found' });
        }

        const nota = group.notas.find(n => n.numero === parseInt(notaNumero));
        if (!nota) {
            console.log('Nota not found:', { notaNumero, groupNotas: group.notas });
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

        // If no grade found anywhere, return empty response with observaciones
        return res.json({ temas: [], observaciones: '' });
    } catch (error) {
        console.error('Error getting student grade:', error);
        res.status(500).json({ message: 'Error getting student grade' });
    }
});

// Send email with rubric PDF
router.post('/:groupId/notas/:notaNumero/send-email', async (req, res) => {
    try {
        const { groupId, notaNumero } = req.params;
        const { to, studentName, rubricName, subject, body, pdfBase64 } = req.body;

        // Convert base64 to buffer
        const pdfBuffer = Buffer.from(pdfBase64, 'base64');

        // Send email with PDF
        sendRubricPDF(to, studentName, rubricName, pdfBuffer, subject, body);

        res.json({ message: 'Email sent successfully' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ message: 'Error sending email' });
    }
});

// Update a nota's percentage
router.patch('/:groupId/notas/:notaNumero', async (req, res) => {
    try {
        const { groupId, notaNumero } = req.params;
        const { porcentaje } = req.body;

        const group = await Grupo.findById(groupId);

        const nota = group.notas.find(n => n.numero === parseInt(notaNumero));

        // Update the nota's percentage
        nota.porcentaje = porcentaje;

        // Update all student grades that use this nota
        group.estudiantes.forEach(student => {
            const grade = student.calificaciones.find(
                c => c.rubrica.toString() === nota.rubrica.toString()
            );
            if (grade) {
                // Calculate the raw grade (without percentage)
                const rawGrade = grade.temas.reduce((sum, tema) => {
                    return sum + tema.criterios.reduce((temaSum, criterio) =>
                        temaSum + ((criterio.peso || 0) * (criterio.calificacion || 0)), 0);
                }, 0);

                // Apply the new percentage to get the weighted grade
                grade.calificacionFinal = Number(((rawGrade * porcentaje) / 100).toFixed(2));
            }

            // Recalculate student's promedio based on all weighted grades
            const sumaNotas = student.calificaciones.reduce((sum, cal) => sum + cal.calificacionFinal, 0);
            student.promedio = Number(sumaNotas.toFixed(2));
        });

        // Save the updated group
        await group.save();

        res.json({ message: 'Nota updated successfully', nota });
    } catch (error) {
        console.error('Error updating nota:', error);
        res.status(500).json({ message: 'Error updating nota' });
    }
});

// Revert a student's rubric to its original state
router.post('/:groupId/notas/:notaNumero/revert/:correo', async (req, res) => {
    try {
        const { groupId, notaNumero, correo } = req.params;

        const group = await Grupo.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Find the nota and student
        const nota = group.notas.find(n => n.numero === parseInt(notaNumero));
        const student = group.estudiantes.find(e => e.correo === correo);

        // Remove the grade from student's calificaciones
        student.calificaciones = student.calificaciones.filter(
            c => c.rubrica.toString() !== nota.rubrica.toString()
        );

        // Recalculate student's promedio
        const sumaNotasTotal = student.calificaciones.reduce((sum, cal) => sum + cal.calificacionFinal, 0);
        student.promedio = Number(sumaNotasTotal.toFixed(2));

        await group.save();

        res.json({ message: 'Rubric reverted successfully'});
    } catch (error) {
        res.status(500).json({ message: 'Error reverting rubric', error: error.message });
    }
});

module.exports = router;