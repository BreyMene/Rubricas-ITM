export interface Rubrica {
  _id: number;
  nombre: string;
  temas: Tema[];
}

export interface Tema {
  nombre: string;
  rows: Criterio[];
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
}

export interface Grupo {
  _id: string;
  nombre: string;
  docente: Docente;
  estudiantes: Estudiante[];
}

export interface Estudiante {
  nombre: string;
  correo: string;
  promedio: number;
}

export interface Docente {
  _id: string;
  correo: string;
}
