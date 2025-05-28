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
  promedio?: number;
  notas?: Nota[];
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
  temas?: TemaCalificacion[];
}

export interface TemaCalificacion {
  nombre: string;
  criterios: CriterioCalificacion[];
}

export interface CriterioCalificacion {
  nombre: string;
  peso: number;
  calificacion: number;
  observaciones?: string;
}
