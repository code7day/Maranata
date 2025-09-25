"use client"

import type React from "react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import Image from "next/image"

interface SurveyFormProps {
  onSuccess: () => void
}

export function SurveyForm({ onSuccess }: SurveyFormProps) {
  const [fullName, setFullName] = useState("")
  const [seatsReserved, setSeatsReserved] = useState("1")
  const [transportOption, setTransportOption] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const totalSeats = 45
  const reservedSeats = 33 // This would come from database in real app
  const availableSeats = totalSeats - reservedSeats
  const isBusDisabled = availableSeats <= 0

  const handleTransportChange = (value: string) => {
    console.log("[v0] Transport option selected:", value)
    if (value === "bus" && isBusDisabled) {
      return
    }
    setTransportOption(value)
    setError(null) // Clear any previous errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!fullName.trim() || !transportOption) {
      setError("Por favor completa todos los campos")
      return
    }

    if (transportOption === "bus" && !seatsReserved) {
      setError("Por favor indica el número de participantes para el transporte en bus")
      return
    }

    let seats = 1
    if (transportOption === "bus") {
      seats = Number.parseInt(seatsReserved)
      if (seats < 1 || seats > 10) {
        setError("El número de participantes debe estar entre 1 y 10")
        return
      }
    }

    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error: insertError } = await supabase.from("survey_responses").insert({
        full_name: fullName.trim(),
        seats_reserved: seats,
        transport_option: transportOption,
      })

      if (insertError) throw insertError

      onSuccess()
    } catch (error: any) {
      console.error("Error al enviar encuesta:", error)
      setError("Error al enviar la encuesta. Por favor intenta nuevamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-cyan-50 to-green-100 flex flex-col">
      <div className="w-full">
        <div className="relative w-full h-48 md:h-64 lg:h-80">
          <Image
            src="/images/maranata-spring-header.jpg"
            alt="Maranata Spring - Misión Peruana del Norte"
            fill
            className="object-cover object-center"
            priority
          />
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 -mt-16 relative z-10">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 bg-white/90 backdrop-blur-sm px-6 py-3 rounded-lg shadow-lg">
              Cierre de Semana de Maranata Spring
            </h1>
            <p className="text-lg text-gray-700 mb-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg">
              Distrito Misionero de La Alameda
            </p>
            <p className="text-base text-gray-600 bg-white/70 backdrop-blur-sm px-4 py-2 rounded-lg">
              Un día de adoración, comunión y confraternización en el campo
            </p>
          </div>

          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-xl text-gray-900">Formulario de Participación</CardTitle>
              <CardDescription className="text-base">
                Confirma tu asistencia a este evento especial de nuestra comunidad de fe
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nombre completo */}
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-base font-medium">
                    Nombre y Apellidos
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Ingresa tu nombre completo"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="h-12 text-base"
                    required
                  />
                </div>

                <div className="space-y-4">
                  <Label className="text-base font-medium">Elige tu opción de transporte</Label>

                  <div className="space-y-4">
                    {/* Opción Bus */}
                    <div className="relative">
                      <input
                        type="radio"
                        id="bus"
                        name="transport"
                        value="bus"
                        checked={transportOption === "bus"}
                        onChange={(e) => {
                          console.log("[v0] Bus radio changed:", e.target.value)
                          handleTransportChange(e.target.value)
                        }}
                        disabled={isBusDisabled}
                        className="sr-only peer"
                      />
                      <label
                        htmlFor="bus"
                        onClick={() => {
                          console.log("[v0] Bus label clicked")
                          handleTransportChange("bus")
                        }}
                        className={`flex items-start space-x-4 p-6 rounded-xl border-2 transition-all ${
                          isBusDisabled
                            ? "border-gray-300 bg-gray-100 cursor-not-allowed opacity-60"
                            : `cursor-pointer hover:border-blue-300 ${
                                transportOption === "bus" ? "border-blue-500 bg-blue-50" : "border-gray-200"
                              }`
                        }`}
                      >
                        <div
                          className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                            isBusDisabled ? "bg-gray-200" : "bg-blue-100"
                          }`}
                        >
                          <span className="text-2xl">{isBusDisabled ? "🚫" : "🚌"}</span>
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-lg text-gray-900 mb-2">
                            {isBusDisabled ? "Transporte en Bus - AGOTADO" : "Transporte Comunitario en Bus"}
                          </div>

                          <div className={`space-y-2 text-sm ${isBusDisabled ? "text-gray-500" : "text-gray-600"}`}>
                            <div className="flex items-center space-x-2">
                              <span>💰</span>
                              <span>
                                <strong>S/ 20 soles total</strong> (S/ 10 entrada + S/ 10 pasaje)
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span>🕐</span>
                              <span>Salida desde la puerta de la iglesia</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span>❤️</span>
                              <span>Viajamos juntos como familia de fe</span>
                            </div>
                          </div>

                          <div className="mt-4 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <span className="text-lg">🚌</span>
                                <span className="font-medium text-gray-900 text-sm">Disponibilidad</span>
                              </div>
                              <div className="text-right">
                                <div
                                  className={`text-2xl font-bold ${isBusDisabled ? "text-red-600" : "text-orange-600"}`}
                                >
                                  {isBusDisabled ? "0" : availableSeats}
                                </div>
                                <div className="text-xs text-gray-500 -mt-1">
                                  {isBusDisabled ? "agotado" : "disponibles"}
                                </div>
                              </div>
                            </div>

                            {isBusDisabled ? (
                              <div>
                                <div className="flex items-center space-x-2 mb-2">
                                  <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                                    <div className="h-full bg-red-500 w-full"></div>
                                  </div>
                                </div>
                                <div className="text-center">
                                  <div className="text-xs font-medium text-red-600 bg-red-100 px-3 py-1 rounded-full">
                                    ❌ Todos los cupos reservados
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div>
                                <div className="flex items-center space-x-2 mb-2">
                                  <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                                    <div
                                      className="h-full bg-gradient-to-r from-orange-400 to-red-500 transition-all duration-300"
                                      style={{ width: `${(reservedSeats / totalSeats) * 100}%` }}
                                    ></div>
                                  </div>
                                </div>
                                <div className="flex justify-between text-xs">
                                  <span className="text-gray-600">
                                    {reservedSeats} de {totalSeats} reservados
                                  </span>
                                  <span className="font-bold text-orange-600">¡Solo {availableSeats} cupos!</span>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="mt-3 flex items-center space-x-2">
                            {isBusDisabled ? (
                              <div className="text-xs bg-red-100 text-red-800 px-3 py-1 rounded-full">
                                🚫 Sin cupos disponibles
                              </div>
                            ) : (
                              <>
                                <div className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                                  ¡Comunión desde el viaje!
                                </div>
                                {availableSeats <= 15 && (
                                  <div className="text-xs bg-orange-100 text-orange-800 px-3 py-1 rounded-full animate-pulse">
                                    ⚡ ¡Últimos cupos!
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </label>
                    </div>

                    {/* Opción Individual */}
                    <div className="relative">
                      <input
                        type="radio"
                        id="individual"
                        name="transport"
                        value="individual"
                        checked={transportOption === "individual"}
                        onChange={(e) => {
                          console.log("[v0] Individual radio changed:", e.target.value)
                          handleTransportChange(e.target.value)
                        }}
                        className="sr-only peer"
                      />
                      <label
                        htmlFor="individual"
                        onClick={() => {
                          console.log("[v0] Individual label clicked")
                          handleTransportChange("individual")
                        }}
                        className={`flex items-start space-x-4 p-6 rounded-xl border-2 cursor-pointer transition-all hover:border-green-300 ${
                          transportOption === "individual" ? "border-green-500 bg-green-50" : "border-gray-200"
                        }`}
                      >
                        <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-2xl">🚗</span>
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-lg text-gray-900 mb-2">Transporte Personal</div>
                          <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-center space-x-2">
                              <span>💰</span>
                              <span>
                                <strong>S/ 10 soles</strong> (solo entrada al club)
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span>🚗</span>
                              <span>Llegas directamente al lugar del evento</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span>🕐</span>
                              <span>Horario flexible de llegada</span>
                            </div>
                          </div>
                          <div className="mt-3 text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full inline-block">
                            Mayor flexibilidad personal
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {transportOption === "bus" && (
                  <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                    <Label htmlFor="seats" className="text-base font-medium">
                      Número de Participantes
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">👥</span>
                      <Input
                        id="seats"
                        type="number"
                        min="1"
                        max={Math.min(10, availableSeats)}
                        value={seatsReserved}
                        onChange={(e) => setSeatsReserved(e.target.value)}
                        className="h-12 text-base pl-10"
                        disabled={isBusDisabled}
                        required
                      />
                    </div>
                    <p className="text-sm text-gray-600">
                      Incluye familiares que te acompañarán en el bus
                      {!isBusDisabled && (
                        <span className="block text-orange-600 font-medium mt-1">
                          Máximo {Math.min(10, availableSeats)} personas por reserva
                        </span>
                      )}
                    </p>
                  </div>
                )}

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600 font-medium">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? "Registrando..." : "Confirmar Participación"}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <Link
                    href="/reporte"
                    className="text-sm text-blue-600 hover:text-blue-500 underline underline-offset-4"
                  >
                    Ver reporte de participación →
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
