import { useState } from 'react'
import { CreditCard, Lock, Shield, CheckCircle, AlertTriangle } from 'lucide-react'

function SubscriptionWall({ onClose }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handlePayment = async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/billing/create-preference', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (response.ok && data.init_point) {
        // Redirigir a Mercado Pago
        window.location.href = data.init_point
      } else {
        setError(data.error || 'Error al procesar el pago')
      }
    } catch (err) {
      setError('Error de conexión. Inténtalo nuevamente.')
      console.error('Error creating payment preference:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-95 backdrop-blur-sm flex items-center justify-center p-4">
      {/* Ambient background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Main modal */}
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl">
        
        {/* Header */}
        <div className="text-center px-8 pt-8 pb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full mb-4 shadow-lg">
            <Lock className="w-8 h-8 text-white" />
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-2">
            Suscripción Pendiente
          </h1>
          
          <p className="text-slate-400 leading-relaxed">
            Tu acceso a la Plataforma Datix está pendiente de activación. 
            Realiza el pago para continuar usando todos los módulos.
          </p>
        </div>

        {/* Features list */}
        <div className="px-8 pb-6">
          <div className="bg-slate-800/50 rounded-lg p-4 mb-6">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-cyan-400" />
              Licenciamiento Anual
            </h3>
            
            <div className="space-y-2">
              {[
                'Acceso completo a todos los módulos',
                'Soporte técnico especializado',
                'Actualizaciones y mejoras incluidas',
                'Almacenamiento seguro en la nube'
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-slate-300">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  {feature}
                </div>
              ))}
            </div>
          </div>

          {/* Price display */}
          <div className="text-center mb-6 p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-lg border border-cyan-500/20">
            <div className="text-3xl font-bold text-white">
              $813.960
              <span className="text-lg font-normal text-slate-400 ml-1">CLP</span>
            </div>
            <p className="text-sm text-slate-400 mt-1">Pago único anual</p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-sm text-red-400">{error}</span>
            </div>
          )}

          {/* Payment button */}
          <button
            onClick={handlePayment}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3 shadow-lg"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                Procesando...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                Pagar con Mercado Pago
              </>
            )}
          </button>

          {/* Footer note */}
          <p className="text-xs text-slate-500 text-center mt-4">
            Serás redirigido a Mercado Pago para completar el pago de forma segura
          </p>
        </div>

        {/* Security badge */}
        <div className="bg-slate-800/30 px-8 py-4 border-t border-slate-700">
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
            <Shield className="w-4 h-4 text-emerald-400" />
            Pago 100% seguro con Mercado Pago
          </div>
        </div>
      </div>
    </div>
  )
}

export default SubscriptionWall