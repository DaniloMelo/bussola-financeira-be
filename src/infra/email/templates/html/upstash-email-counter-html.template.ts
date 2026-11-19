import { htmlLayout } from "./html.layout";

export function upstashEmailCounterHtmlTemplate(subject: string) {
  const content = `
      <p
        style="margin: 0 0 20px; font-size: 16px; line-height: 24px; color: #555555; font-family: Arial, Helvetica, sans-serif;">
        Atualizando contador da fila do serviço upstash.
      </p>
    `;

  return htmlLayout(content, subject);
}
