
class Reportes {
  constructor(id, Tipo, Filtros = [], Formato) {
    this.id = id;
    this.Filtros = Filtros;
    this.Tipo = Tipo;
    this.Formato = Formato;
  }

  ExportarReporte()
  {}
}
// Export Reportes Class
export default Reportes;