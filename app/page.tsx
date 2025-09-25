"use client"

import { useState } from "react"
import { SurveyForm } from "@/components/survey-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function HomePage() {
  const [showSuccess, setShowSuccess] = useState(false)

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl">✅</span>
            </div>
            <CardTitle className="text-2xl text-green-700">¡Participación Confirmada!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Tu participación ha sido registrada exitosamente. ¡Que Dios nos bendiga en este día especial de comunión!
            </p>
            <div className="space-y-3">
              <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                <Link href="/reporte">Ver Reporte de Participación</Link>
              </Button>
              <Button variant="outline" className="w-full bg-transparent" onClick={() => setShowSuccess(false)}>
                Registrar Otra Participación
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <SurveyForm onSuccess={() => setShowSuccess(true)} />
}
