"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Simular un pequeño delay para mejor UX
    await new Promise((resolve) => setTimeout(resolve, 500))

    if (password === "mrnt2025") {
      setIsAuthenticated(true)
    } else {
      setError("Clave incorrecta. Intenta nuevamente.")
      setPassword("")
    }

    setIsLoading(false)
  }

  if (isAuthenticated) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-3xl">🔐</span>
          </div>
          <CardTitle className="text-2xl text-gray-900">Acceso Restringido</CardTitle>
          <p className="text-gray-600 text-sm">Ingresa la clave para acceder al reporte de participación</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Clave de Acceso</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa la clave"
                className="text-center text-lg tracking-wider"
                disabled={isLoading}
                autoFocus
              />
            </div>

            {error && (
              <div className="text-center p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isLoading || !password.trim()}
            >
              {isLoading ? "Verificando..." : "Acceder al Reporte"}
            </Button>
          </form>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <Link href="/">
              <Button variant="outline" className="w-full bg-transparent">
                ← Volver al Formulario
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
