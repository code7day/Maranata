import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AuthGuard } from "@/components/auth-guard"
import Link from "next/link"

interface SurveyResponse {
  id: string
  full_name: string
  seats_reserved: number
  transport_option: string
  created_at: string
}

async function ReporteContent() {
  const supabase = await createClient()

  const { data: responses, error } = await supabase
    .from("survey_responses")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching data:", error)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <p className="text-red-600">Error al cargar los datos</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const surveyResponses = (responses as SurveyResponse[]) || []

  // Calcular estadísticas
  const busResponses = surveyResponses.filter((r) => r.transport_option === "bus")
  const individualResponses = surveyResponses.filter((r) => r.transport_option === "individual")

  const totalBusSeats = busResponses.reduce((sum, r) => sum + r.seats_reserved, 0)
  const totalIndividualSeats = individualResponses.reduce((sum, r) => sum + r.seats_reserved, 0)
  const totalParticipants = totalBusSeats + totalIndividualSeats

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Button asChild variant="outline" size="sm">
              <Link href="/" className="flex items-center space-x-2">
                <span>←</span>
                <span>Volver al Formulario</span>
              </Link>
            </Button>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-full mb-4">
              <span className="text-xl text-white">⛪</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Reporte de Participación</h1>
            <p className="text-lg text-gray-600 mb-1">Cierre de Semana de Maranata Spring</p>
            <p className="text-base text-gray-600">Distrito Misionero de La Alameda</p>
          </div>
        </div>

        {/* Estadísticas Generales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">👥</span>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{totalParticipants}</p>
                  <p className="text-sm text-gray-600">Total Participantes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🚌</span>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{totalBusSeats}</p>
                  <p className="text-sm text-gray-600">Transporte Comunitario</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🚗</span>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{totalIndividualSeats}</p>
                  <p className="text-sm text-gray-600">Transporte Personal</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">📊</span>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{surveyResponses.length}</p>
                  <p className="text-sm text-gray-600">Total Registros</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Información para Organización */}
        {totalBusSeats > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>🚌</span>
                <span>Información para Contratar Bus</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{totalBusSeats}</p>
                  <p className="text-sm text-blue-800">Asientos Necesarios</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{Math.ceil(totalBusSeats / 45)}</p>
                  <p className="text-sm text-green-800">Bus(es) de 45 asientos</p>
                </div>
                <div className="text-center p-4 bg-amber-50 rounded-lg">
                  <p className="text-2xl font-bold text-amber-600">S/ {totalBusSeats * 10}</p>
                  <p className="text-sm text-amber-800">Ingresos por Pasajes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lista de Reservas */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Participantes Registrados</CardTitle>
            <CardDescription>Todos los registros ordenados por fecha de inscripción</CardDescription>
          </CardHeader>
          <CardContent>
            {surveyResponses.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Aún no hay participantes registrados</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Nombre</th>
                      <th className="text-left p-2">Participantes</th>
                      <th className="text-left p-2">Transporte</th>
                      <th className="text-left p-2">Fecha de Registro</th>
                    </tr>
                  </thead>
                  <tbody>
                    {surveyResponses.map((response) => (
                      <tr key={response.id} className="border-b">
                        <td className="p-2 font-medium">{response.full_name}</td>
                        <td className="p-2">{response.seats_reserved}</td>
                        <td className="p-2">
                          <span
                            className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
                              response.transport_option === "bus"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {response.transport_option === "bus" ? (
                              <>
                                <span>🚌</span>
                                <span>Comunitario</span>
                              </>
                            ) : (
                              <>
                                <span>🚗</span>
                                <span>Personal</span>
                              </>
                            )}
                          </span>
                        </td>
                        <td className="p-2 text-sm text-gray-600">
                          {new Date(response.created_at).toLocaleDateString("es-PE", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function ReportePage() {
  return (
    <AuthGuard>
      <ReporteContent />
    </AuthGuard>
  )
}
