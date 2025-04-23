const { Docente } = require("../utils/types");

async function ValidarDocentes(docentes) {
    const docentesF = [];

    for (const d of docentes) {
        const existente = await Docente.findOne({ correo: d.correo });

        if (existente) {
        docentesF.push({
            _id: existente._id,
            moderador: d.moderador,
        });
        }
    }

    return docentesF;
}

module.exports = {
    ValidarDocentes,
}