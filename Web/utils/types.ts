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
    id: string,
    icon: string,
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
    correo: string,
    promedio: number
}

export interface Docente {
    correo: string
}