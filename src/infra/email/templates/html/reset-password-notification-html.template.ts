import { htmlLayout } from "./html.layout";

export function resetPasswordNotificationHtmlTemplate(
  userName: string,
  subject: string,
) {
  // TODO: pegar geolocalizaçao e user agent, salvar no banco de dados e depois adicionar infos no email.

  const content = `
    <p
      style="margin: 0 0 15px; font-size: 16px; line-height: 24px; color: #333333; font-family: Arial, Helvetica, sans-serif;">
      Olá, <strong>${userName}</strong>!
    </p>

    <p
      style="margin: 0 0 20px; font-size: 16px; line-height: 24px; color: #555555; font-family: Arial, Helvetica, sans-serif;">
      Estamos notificando que a sua <b>senha foi alterada</b>.
    </p>

    <!-- TODO: Adicionar informações de localizaçao aqui -->

    <p
      style="margin: 0 0 20px; font-size: 16px; line-height: 24px; color: #555555; font-family: Arial, Helvetica, sans-serif;">
      Se você não alterou sua senha, orientamos que entre no sistema e faça a troca da senha por precaução.
    </p>

    <p
      style="margin: 0 0 20px; font-size: 16px; line-height: 24px; color: #555555; font-family: Arial, Helvetica, sans-serif;">
      Caso não consiga entrar com sua senha atual no sistema, entre em contato com nosso time de suporte
      clicando <a href="#">aqui</a>
    </p>
  `;

  return htmlLayout(content, subject);
}
