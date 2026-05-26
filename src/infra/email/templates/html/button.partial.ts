interface ButtonPartialParams {
  href: string;
  text: string;
  BgColor: string;
  textColor: string;
}

export function buttonPartial(params: ButtonPartialParams) {
  const { href, text, BgColor, textColor } = params;

  return `
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="center" style="padding: 10px 0 30px;">
          <a href="${href}"
            style="display: inline-block; padding: 14px 32px; background-color: ${BgColor}; color: ${textColor}; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; font-family: Arial, Helvetica, sans-serif;">
            ${text}
          </a>
        </td>
      </tr>
    </table>
  `;
}
