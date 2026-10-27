/**
 * Modal retro de aviso/error del sistema GigMatch.
 * Construido 100% con utilidades de Tailwind CSS y estética pixel art.
 */
export default function ErrorModal({ errorInfo, onClose, onRetry }) {
  if (!errorInfo) return null;

  return (
    <div
      className="fixed inset-0 bg-[#0f1e23]/70 backdrop-blur-xs flex items-center justify-center z-50 p-5 animate-in fade-in duration-200"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="error-modal-title"
    >
      <section className="w-full max-w-[560px] bg-[#d9d9d9] border-4 border-[#111111] shadow-[8px_8px_0_rgba(0,0,0,0.5)]">
        {/* Barra de título de la ventana retro */}
        <div className="bg-[#a31d37] text-white px-3.5 py-2.5 text-[10px] flex justify-between items-center border-b-[3px] border-[#660e20]">
          <span id="error-modal-title" className="tracking-wider">! AVISO DEL SISTEMA</span>
          <button
            type="button"
            className="bg-[#d9d9d9] hover:bg-white text-[#111111] border-2 border-[#111111] px-1.5 py-0.5 text-[8px] cursor-pointer"
            onClick={onClose}
            aria-label="Cerrar modal de error"
          >
            X
          </button>
        </div>

        {/* Cuerpo del error */}
        <div className="p-5 flex flex-col gap-4">
          <div className="flex gap-4 items-start bg-[#fdf2f4] border-[3px] border-[#f8b4c0] p-4">
            <span className="text-[28px] leading-none shrink-0" aria-hidden="true">⚠️</span>
            <div className="flex-1 min-w-0">
              <h2 className="text-[11px] text-[#7b2b3a] mb-2 leading-relaxed font-normal">
                {errorInfo.title}
              </h2>
              <p className="text-[8px] text-[#222222] leading-loose break-words">
                {errorInfo.desc}
              </p>
              {errorInfo.tip && (
                <p className="mt-2.5 text-[8px] text-[#8b1f4d] bg-[#8b1f4d]/10 p-2 border-l-[3px] border-[#8b1f4d] leading-relaxed">
                  💡 {errorInfo.tip}
                </p>
              )}
            </div>
          </div>

          {/* Acciones */}
          <div className="flex gap-3 justify-end pt-1">
            <button
              type="button"
              className="bg-[#e0cba5] hover:bg-[#ebd9b8] text-[#111111] border-[3px] border-[#111111] shadow-[3px_3px_0_#111111] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_#111111] px-4 py-2.5 text-[8px] cursor-pointer transition-transform"
              onClick={onClose}
            >
              CERRAR
            </button>
            {onRetry && (
              <button
                type="button"
                className="bg-[#7b2b3a] hover:bg-[#8f243a] text-white border-[3px] border-[#111111] shadow-[3px_3px_0_#111111] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_#111111] px-4 py-2.5 text-[8px] cursor-pointer transition-transform"
                onClick={onRetry}
              >
                REINTENTAR
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
