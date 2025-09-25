// Versión simplificada para el servidor
export async function createClient() {
  return {
    from: (table: string) => ({
      select: (columns = "*") => ({
        order: (column: string, options?: any) => {
          console.log(`[MOCK SERVER] Seleccionando de ${table}`)
          // Datos de ejemplo para el reporte
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
            {
              id: "3",
              full_name: "Carlos Rodríguez",
              seats_reserved: 3,
              transport_option: "bus",
              created_at: new Date().toISOString(),
            },
          ]
          return Promise.resolve({ data: mockData, error: null })
        },
      }),
    }),
  }
}
