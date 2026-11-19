import { textLayout } from "./text.layout";

export function upstashEmailCounterTxtTemplate(subject: string) {
  const content = `
  Atualizando contador da fila do serviço upstash.
  `.trim();

  return textLayout(content, subject);
}
