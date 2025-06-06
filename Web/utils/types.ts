export interface Rubrica {
  _id: string;
  nombre: string;
  estado: string;
  temas: Tema[];
  docente?: string;
}

export interface Tema {
  nombre: string;
  criterios: Criterio[];
}

export interface Criterio {
  criterio: string;
  peso: number;
  calificacion: number;
  acumulado: number;
  observaciones: string;
}

export interface DocenteEnCurso extends Docente {
  moderador: boolean;
}

export interface Curso {
  _id: string;
  icono: string;
  nombre: string;
  docentes: DocenteEnCurso[];
  grupos: Grupo[];
  rubricasGuia?: Rubrica[];
}

export interface Grupo {
  _id: string;
  nombre: string;
  docente: Docente;
  estudiantes: Estudiante[];
  rubricas: Rubrica[];
  notas: Nota[];
}

export interface Estudiante {
  nombre: string;
  correo: string;
  promedio: number;
  calificaciones: Calificacion[];
}

export interface Calificacion {
  rubrica: string;
  fecha: string;
  calificacionFinal: number;
  temas: Tema[];
  observaciones?: string;
}

export interface Docente {
  _id: string;
  correo: string;
}

export interface Nota {
  _id: string;
  numero: number;
  rubrica: string;
  fecha: string;
}
