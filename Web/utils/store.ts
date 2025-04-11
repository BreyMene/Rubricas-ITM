import { defineStore } from 'pinia'

export const useDocenteStore = defineStore('docente', {
  state: () => ({docente: null as Docente | null}),

  actions: {
    setDocente(d: Docente) {
      this.docente = d
    },
    logout() {
      this.docente = null
    }
  },

  getters: {
    getEmail: (state): string => {
        return state.docente?.email ?? ""
    }
  }
})
