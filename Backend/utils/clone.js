export function ClonarRubrica(rubrica) {
    const cloned = {
        nombre: rubrica.nombre,
        estado: rubrica.estado,
        temas: rubrica.temas?.map((tema) => ({
            nombre: tema.nombre || "",
            criterios: tema.criterios?.map((c) => ({
                criterio: c.criterio || "",
                peso: c.peso || 0,
                calificacion: c.calificacion || 0,
                acumulado: c.acumulado || 0,
                observaciones: c.observaciones || "",
            })),
        })),
    };

    return cloned
}