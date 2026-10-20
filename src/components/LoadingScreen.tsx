export function LoadingScreen() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
      <div className="size-16 animate-pulse rounded-full bg-green shadow-[0_0_0_8px_rgba(88,204,2,0.18)]" />
      <h1 className="text-2xl font-extrabold text-white">Carregando a trilha…</h1>
      <p className="text-sm text-muted">Preparando lições, progresso local e o leitor de voz.</p>
      <div className="h-2 w-48 overflow-hidden rounded-full bg-line">
        <div className="h-full w-1/2 animate-[slide_1.1s_ease-in-out_infinite] rounded-full bg-green" />
      </div>
    </div>
  )
}
