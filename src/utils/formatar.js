// Converte milissegundos em "m:ss" (ex: 65000 -> "1:05")
export function formatarTempo(ms = 0) {
  const totalSegundos = Math.floor(ms / 1000);
  const minutos = Math.floor(totalSegundos / 60);
  const segundos = String(totalSegundos % 60).padStart(2, '0');
  return `${minutos}:${segundos}`;
}

// Gera nomes como "Gravação 01", "Gravação 02"...
export function nomePadrao(numero) {
  return `Gravação ${String(numero).padStart(2, '0')}`;
}
