const mongoose = require('mongoose');

const docente = mongoose.Schema({
    correo: {
        type: String,
        required: true,
        unique: true,
    },
    contraseña: {
        type: String,
        required: true
    }
}, {versionKey: false})

const Docente = mongoose.model('Docente', docente)

module.exports = {
    Docente
}