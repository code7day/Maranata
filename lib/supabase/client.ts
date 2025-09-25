// Versión simplificada para evitar problemas de importación
export function createClient() {
  // Para el entorno de desarrollo, usaremos una implementación mock
  return {
    from: (table: string) => ({
      insert: async (data: any) => {
        console.log(`[MOCK] Insertando en ${table}:`, data)
        // Simular éxito
        return { data: { id: Math.random().toString() }, error: null }
      },
      select: (columns = "*") => ({
        order: (column: string, options?: any) => ({
          then: async (callback: any) => {
            console.log(`[MOCK] Seleccionando de ${table}`)
            // Datos de ejemplo para mostrar en el reporte
            const mockData = [
              {
                id: "1",
                full_name: "Juan Pérez",
                seats_reserved: 2,
                transport_option: "bus",
                created_at: new Date().toISOString(),
              },
              {
                id: "2",
                full_name: "María González",
                seats_reserved: 1,
                transport_option: "individual",
                created_at: new Date().toISOString(),
              },
            ]
            return callback({ data: mockData, error: null })
          },
        }),
      }),
    }),
  }
}
