
const VisionSection = () => {
  return (
    <section id="vision" className="py-20 md:py-32 text-center bg-black text-white">
      <div className="max-w-3xl mx-auto scroll-animation px-6">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tighter">
          Planifica la Operación,<br />
          no el Documento Fiscal.
        </h2>
        <p className="mt-6 text-lg text-gray-400">
          Nuestra filosofía es simple: tú te enfocas en la logística de tu viaje —el cliente, la ruta, la carga— y nuestra plataforma, como un copiloto experto, se encarga de que cada documento fiscal sea una consecuencia automática y perfecta de tu planeación.
        </p>
      </div>
      <div className="mt-12 px-4 sm:px-6">
        <div className="mx-auto max-w-6xl px-2 sm:px-4">
          <div className="relative bg-gray-800 rounded-t-lg sm:rounded-t-2xl lg:rounded-t-3xl p-1 sm:p-2 shadow-2xl">
            <div className="bg-gray-900 rounded-t-lg sm:rounded-t-xl lg:rounded-t-2xl px-2 sm:px-4 py-1 sm:py-2 flex items-center space-x-1 sm:space-x-2">
              <div className="flex space-x-1 sm:space-x-2">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full"></div>
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
              </div>
              <div className="flex-1 text-center">
                <div className="bg-gray-700 rounded px-2 sm:px-3 py-0.5 sm:py-1 text-xs text-gray-300 inline-block max-w-[200px] sm:max-w-none truncate">
                  <span className="hidden sm:inline">https://app.interconecta.mx/dashboard</span>
                  <span className="sm:hidden">interconecta.mx</span>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-b-lg sm:rounded-b-xl lg:rounded-b-2xl p-2 sm:p-4 md:p-6 min-h-[200px] sm:min-h-[300px] md:min-h-[400px]">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 sm:mb-6 space-y-2 sm:space-y-0">
                <div>
                  <h2 className="text-sm sm:text-xl md:text-2xl font-bold text-gray-900">Dashboard</h2>
                  <p className="text-xs sm:text-sm text-gray-600">Bienvenido a Interconecta</p>
                </div>
                <div className="flex space-x-1 sm:space-x-2">
                  <div className="bg-blue-600 text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs">ViajeWizard</div>
                  <div className="bg-green-600 text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs">Activo</div>
                </div>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-6">
                <div className="bg-white rounded-md sm:rounded-lg p-2 sm:p-3 md:p-4 shadow-sm border">
                  <div className="text-xs text-gray-600">Viajes Hoy</div>
                  <div className="text-sm sm:text-lg md:text-2xl font-bold text-blue-600">12</div>
                </div>
                <div className="bg-white rounded-md sm:rounded-lg p-2 sm:p-3 md:p-4 shadow-sm border">
                  <div className="text-xs text-gray-600">Cartas Porte</div>
                  <div className="text-sm sm:text-lg md:text-2xl font-bold text-green-600">8</div>
                </div>
                <div className="bg-white rounded-md sm:rounded-lg p-2 sm:p-3 md:p-4 shadow-sm border">
                  <div className="text-xs text-gray-600">Vehículos</div>
                  <div className="text-sm sm:text-lg md:text-2xl font-bold text-purple-600">24</div>
                </div>
                <div className="bg-white rounded-md sm:rounded-lg p-2 sm:p-3 md:p-4 shadow-sm border">
                  <div className="text-xs text-gray-600">Conductores</div>
                  <div className="text-sm sm:text-lg md:text-2xl font-bold text-orange-600">18</div>
                </div>
              </div>
              <div className="bg-white rounded-md sm:rounded-lg p-2 sm:p-3 md:p-4 shadow-sm border">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <h3 className="font-semibold text-gray-900 text-xs sm:text-sm md:text-base">ViajeWizard</h3>
                  <span className="text-xs bg-blue-100 text-blue-800 px-1 sm:px-2 py-0.5 sm:py-1 rounded">Nuevo</span>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-600 mb-1">Próximo viaje programado</div>
                    <div className="text-xs sm:text-sm md:text-base font-medium truncate">CDMX → Guadalajara</div>
                    <div className="text-xs text-gray-500">Salida: Mañana 08:00</div>
                  </div>
                  <button className="bg-blue-600 text-white px-2 sm:px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors w-full sm:w-auto">
                    Gestionar
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-700 h-2 sm:h-3 lg:h-4 rounded-b-lg sm:rounded-b-2xl lg:rounded-b-3xl mx-auto w-3/4 shadow-lg"></div>
          <div className="bg-gray-800 h-1 sm:h-1.5 lg:h-2 rounded-b-md sm:rounded-b-xl lg:rounded-b-2xl mx-auto w-1/2"></div>
        </div>
      </div>
    </section>
  );
};

export default VisionSection;
