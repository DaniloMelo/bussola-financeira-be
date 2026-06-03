export function textLayout(content: string, subject: string) {
  return `
Bússola Financeira - ${subject}

${content}

© ${new Date().getFullYear()} Bússola Financeira. Todos os direitos reservados.

Política de Privacidade: ${process.env.FRONTEND_URL_ORIGIN}/privacy
Termos de Uso: ${process.env.FRONTEND_URL_ORIGIN}/terms
`.trim();
}
