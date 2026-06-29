import { textLayout } from "./text.layout";

export function resetPasswordNotificationTextTemplate(
  userName: string,
  subject: string,
) {
  const content = `
  Olá, ${userName}!

  Estamos notificando que a sua senha foi alterada.

  Se você não alterou sua senha, orientamos que entre no sistema e faça a troca da senha por precaução.

  Caso não consiga entrar com sua senha atual no sistema, entre em contato com nosso time de suporte

  Se você não conseguir clicar no link, copie e cole o endereço completo no seu navegador.
`.trim();

  return textLayout(content, subject);
}
