const mongoose = require("mongoose");

const docente = mongoose.Schema(
  {
    correo: {
      type: String,
      required: true,
      unique: true,
    },
    contraseña: {
      type: String,
      required: true,
    },
  },
  { versionKey: false },
);

const curso = mongoose.Schema(
  {
    icono: {
      type: String,
      required: true,
    },
    nombre: {
      type: String,
      required: true,
    },
    docentes: [
      {
        docente: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Docente",
        },
        moderador: {
          type: Boolean,
          default: false,
        },
      },
    ],
    grupos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Grupo",
      },
    ],
  },
  { versionKey: false },
);

const grupo = mongoose.Schema({
  nombre: {
    type: String,
    required: true,
  },
  proyecto: {
    type: String,
    required: true,
  },
  docente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Docente",
    required: true,
  },
});

const Docente = mongoose.model("Docente", docente);
const Curso = mongoose.model("Curso", curso);
const Grupo = mongoose.model("Grupo", grupo);

module.exports = {
  Docente,
  Curso,
  Grupo,
};
