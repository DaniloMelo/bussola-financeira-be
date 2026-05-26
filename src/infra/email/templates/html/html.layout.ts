export function htmlLayout(content: string, subject: string) {
  return `
    <!DOCTYPE html
      PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml" lang="pt-BR">

    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />

      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <title>${subject} - Bússola Financeira</title>
    </head>

    <body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #dedede;">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#dedede;">
        <tr>
          <td align="center">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%"
              style="width:100%; max-width:600px; background-color:#ffffff;">
              <tr>
                <td align="center" bgcolor="#ade9c4" style="padding: 30px 20px; border-radius: 0 0 20px 20px;">
                  <img
                    src="https://res.cloudinary.com/dyvingiy9/image/upload/v1777750834/bussola-financeira-logo_dtuflh.png"
                    alt="Bússola Financeira Logo Marca" width="50" height="50"
                    style="display: block; margin: 0 auto 15px;" />
                  <h1
                    style="margin: 0; font-size: 24px; font-weight: bold; color: #47624e; font-family: Arial, Helvetica, sans-serif;">
                    ${subject}
                  </h1>
                </td>
              </tr>

              <tr>
                <td style="padding: 40px 30px;">
                  ${content}
                </td>
              </tr>

              <tr>
                <td style="padding: 0 30px;">
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td style="border-top: 1px solid #e0e0e0;"></td>
                    </tr>
                  </table>
                </td>
              </tr>

              <tr>
                <td align="center"
                  style="padding: 30px; font-size: 12px; line-height: 18px; color: #999999; font-family: Arial, Helvetica, sans-serif;">
                  <p style="margin: 0 0 8px;">© ${new Date().getFullYear().toString()} Bússola Financeira. Todos os direitos reservados.</p>
                  <p style="margin: 0;">
                    <a href="${process.env.FRONTEND_URL_ORIGIN}/privacy" style="color: #007bff; text-decoration: none;">Política de Privacidade</a>
                    <span style="color: #cccccc;"> | </span>
                    <a href="${process.env.FRONTEND_URL_ORIGIN}/terms" style="color: #007bff; text-decoration: none;">Termos de Uso</a>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  `;
}
