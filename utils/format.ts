export function formatDateTime(iso: string) {
  const d = new Date(iso);
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' }).format(d);
}
