import { defineStore } from "pinia";

export const useDocenteStore = defineStore("docente", {
  state: () => ({ docente: null as Docente | null }),

  actions: {
    setDocente(d: Docente) {
      this.docente = d;
    },
    logout() {
      this.docente = null;
    },
  },
  persist: {
    storage: piniaPluginPersistedstate.cookies({
      maxAge: 3600, // 1 hora
      sameSite: 'lax'
    })
  },

  getters: {
    getCorreo: (state): string => {
      return state.docente?.correo ?? "";
    },
    getID: (state): string => {
      return state.docente?._id ?? "";
    },
  },
});

export const useCursoStore = defineStore('curso', {
  state: () => ({
    cursoActivo: null as Curso | null,
    grupoActivo: null as Grupo | null,
  }),
  actions: {
    setCurso(c: Curso) {
      this.cursoActivo = c
    },
    clearCurso() {
      this.cursoActivo = null
    },
    setGrupo(grupo: Grupo) {
      this.grupoActivo = grupo;
    },
    clearGrupo() {
      this.grupoActivo = null;
    },
  },
  persist: true,
})