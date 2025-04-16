import Criterios from "/Criterios.js";

class Temas { 
    constructor(id, Nombre, Criterios = []) {
        this.id = id;
        this.Nombre = Nombre;
        this.Criterios = Criterios;
    }
}

// Export Temas Class
export default Temas;