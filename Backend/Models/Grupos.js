import Estudiantes from './Estudiantes.js';

class Grupos {
    constructor(id, Nombre, Proyecto, Estudiantes= []) {
        this.id = id;
        this.Nombre = Nombre;
        this.Proyecto = Proyecto;
        this.Estudiantes = Estudiantes;
    }
}

// Export Grupos Class
export default Grupos
