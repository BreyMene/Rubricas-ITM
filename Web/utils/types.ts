export interface Rubrica {
    id: number,
    nombre: string,
    temas: Tema[],
}

export interface Tema {
    nombre: string
    rows: Criterio[]
}

export interface Criterio {
    criterio: string
    peso: number
    calificacion: number
    acumulado: number
    observaciones: string
}

export interface Curso {
    id: number,
    nombre: string,
    docentes: Docente[],
    grupos: Grupo[]
}

export interface Grupo {
    id: string,
    nombre: string,
    manager: string,
    estudiantes: Estudiante[]
}

export interface Estudiante {
    nombre: string,
    email: string,
    promedio: number
}

export interface Docente {
    email: string
}