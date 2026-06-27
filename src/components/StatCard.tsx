export function StatCard({
  titulo,
  valor,
  subtitulo,
  alerta
}: {
  titulo: string;
  valor: string | number;
  subtitulo?: string;
  alerta?: boolean;
}) {
  return (
    <div className={`card ${alerta ? "border-amber-300 bg-amber-50" : ""}`}>
      <p className="text-sm font-medium text-slate-500">{titulo}</p>
      <p className="mt-2 text-3xl font-bold text-slate-900">{valor}</p>
      {subtitulo && <p className="mt-1 text-xs text-slate-500">{subtitulo}</p>}
    </div>
  );
}
