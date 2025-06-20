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
        _id: {
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
    rubricasGuia: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rubrica",
      required: false
    }]
  },
  { versionKey: false },
);

const grupo = mongoose.Schema({
  nombre: {
    type: String,
    required: true,
  },
  estudiantes: [
    {
      _id: false,
      nombre: {
        type: String,
        required: true,
      },
      correo: {
        type: String,
        required: true,
      },
      promedio: {
        type: Number,
        default: 0
      },
      calificaciones: [{
        _id: false,
        rubrica: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Rubrica",
          required: true
        },
        fecha: {
          type: Date,
          default: Date.now
        },
        calificacionFinal: {
          type: Number,
          required: true
        },
        temas: [{
          _id: false,
          nombre: String,
          criterios: [{
            _id: false,
            criterio: String,
            peso: Number,
            calificacion: Number,
            acumulado: Number,
            observaciones: String
          }]
        }]
      }]
    }
  ],
  docente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Docente",
    required: true,
  },
  rubricas: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rubrica",
    }
  ],
  notas: [{
    numero: {
      type: Number,
      required: true
    },
    rubrica: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rubrica",
      required: true
    },
    fecha: {
      type: Date,
      default: Date.now
    },
    porcentaje: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    }
  }]
},
{ versionKey: false },
);

const rubrica = mongoose.Schema({
  nombre: {
    type: String,
    required: true,
  },
  estado: {
    type: String,
    required: true,
    default: "borrador",
    enum: ["borrador", "activo", "inactivo"]
  },
  docente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Docente",
    required: false
  },
  temas: [{
    _id: false,
    nombre: String,
    criterios: [{
      _id: false,
      criterio: String,
      peso: Number,
      calificacion: Number,
      acumulado: Number,
      observaciones: String,
    }]
  }]
},
{ versionKey: false },);

const Docente = mongoose.model("Docente", docente);
const Curso = mongoose.model("Curso", curso);
const Grupo = mongoose.model("Grupo", grupo);
const Rubrica = mongoose.model("Rubrica", rubrica);

module.exports = {
  Docente,
  Curso,
  Grupo,
  Rubrica,
};
