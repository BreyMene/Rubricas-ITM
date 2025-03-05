export interface Rubrica {
    id: number,
    nombre: string,
    temas: Tema[],
}

export interface Tema {
    nombre: string
    isEditing: boolean
    rows: RubricaRow[]
}

export interface RubricaRow {
    criterio: string
    peso: number
    calificacion: number
    acumulado: number
    observaciones: string
}
  
export interface Curso {
    id: number,
    nombre: string,
    grupos: Grupo[]
}

export interface Grupo {
    id: string,
    nombre: string,
    manager: string,
    estudiantes: Estudiante[]
}

export interface Estudiante {
    id: number,
    email: string,
    promedio: number
}