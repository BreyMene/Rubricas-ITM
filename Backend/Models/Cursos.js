import Grupos from './Grupos.js';

class Cursos {
    constructor(id, Nombre, Descripcion, Grupos= []) {
        this.id = id;
        this.Nombre = Nombre;
        this.Descripcion = Descripcion;
        this.Grupos = Grupos;
    }
}

// Export Cursos Class
export default Cursos
