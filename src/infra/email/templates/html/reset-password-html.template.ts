import { buttonPartial } from "./button.partial";
import { htmlLayout } from "./html.layout";

export function resetPasswordHtmlTemplate(userName: string, resetUrl: string) {
  const content = `
      <p
        style="margin: 0 0 15px; font-size: 16px; line-height: 24px; color: #333333; font-family: Arial, Helvetica, sans-serif;">
        Olá, <strong>${userName}</strong>!
      </p>
  
      <p
        style="margin: 0 0 20px; font-size: 16px; line-height: 24px; color: #555555; font-family: Arial, Helvetica, sans-serif;">
        Recebemos uma solicitação para redefinir a senha da sua conta.
      </p>
  
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%"
        style="margin: 25px 0;">
        <tr>
          <td bgcolor="#fff3cd" style="padding: 15px; border-left: 4px solid #ffc107;">
            <p
              style="margin: 0; font-size: 14px; line-height: 20px; color: #856404; font-family: Arial, Helvetica, sans-serif;">
              <strong>⚠️ Atenção:</strong> Se você não solicitou isso, ignore este email.
            </p>
          </td>
        </tr>
      </table>
  
      <p
        style="margin: 0 0 25px; font-size: 16px; line-height: 24px; color: #555555; text-align: center; font-family: Arial, Helvetica, sans-serif;">
        Clique no botão abaixo para redefinir sua senha:
      </p>
  
      ${buttonPartial({
        href: resetUrl,
        text: "Redefinir senha",
        BgColor: "#61856a",
        textColor: "#e7ffea",
      })}
  
      <p
        style="margin: 30px 0 0; font-size: 12px; line-height: 18px; color: #999999; text-align: center; font-family: Arial, Helvetica, sans-serif;">
        Ou copie e cole este link no navegador:<br />
        <a href="${resetUrl}" style="color: #007bff; word-break: break-all;">${resetUrl}</a>
      </p>
  
      <p
        style="margin: 20px 0; font-size: 14px; line-height: 20px; color: #dc3545; text-align: center; font-family: Arial, Helvetica, sans-serif;">
        Este link expira em <strong>15 minutos</strong>.
      </p>
    `;

  return htmlLayout(content, "Recuperação de Senha");
}
