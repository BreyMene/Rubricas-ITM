const { Rubrica } = require("../utils/types");

function ClonarRubrica(rubrica) {
    const cloned = {
        nombre: rubrica.nombre ,
        temas: rubrica.temas.map((tema) => ({
            nombre: tema.nombre,
            criterios: tema.criterios.map((c) => ({
                criterio: c.criterio,
                peso: c.peso,
                calificacion: c.calificacion,
                acumulado: c.acumulado,
                observaciones: c.observaciones,
            })),
        })),
    };

    return new Rubrica(cloned);
}

module.exports = ClonarRubrica