import Temas from "./Temas";

class Rubricas {
    constructor(id, Nombre, Temas = []) {
        this.id = id;
        this.Nombre = Nombre;
        this.Temas = Temas;
    }

    notaFinal() 
    {}
}
// Export Rubricas Class
export default Rubricas;