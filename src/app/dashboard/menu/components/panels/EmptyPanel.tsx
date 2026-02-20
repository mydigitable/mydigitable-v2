export function EmptyPanel() {
    return (
        <div className="w-[340px] bg-white border-l border-slate-200 flex items-center justify-center p-8 flex-shrink-0">
            <div className="text-center">
                <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl">👈</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                    Selecciona un elemento
                </h3>
                <p className="text-sm text-slate-600">
                    Elige un menú, categoría o producto del sidebar para ver sus opciones aquí
                </p>
            </div>
        </div>
    )
}
