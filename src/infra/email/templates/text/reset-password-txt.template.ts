import { textLayout } from "./text.layout";

export function resetPasswordTextTemplate(userName: string, resetUrl: string) {
  const content = `
Olá, ${userName}!

Recebemos uma solicitação para redefinir a senha da sua conta.

Atenção: Se você não solicitou isso, ignore este email.

Para redefinir sua senha, acesse o link abaixo:

${resetUrl}

Atenção: Esse link expira em 15 minutos.

Se você não conseguir clicar no link, copie e cole o endereço completo no seu navegador.
`.trim();

  return textLayout(content, "Recuperação de Senha");
}
