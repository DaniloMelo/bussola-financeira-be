import { MailerService } from "@nestjs-modules/mailer";
import { Injectable } from "@nestjs/common";

interface ResetPasswordParams {
  name: string;
  email: string;
  resetUrl: string;
}

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async resetPassword(params: ResetPasswordParams) {
    const { name, email, resetUrl } = params;

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: "Recuperação de senha",
        html: `<h1>${name}<h1> <a href="${resetUrl}">resert url</a>`,
        text: `${name}, ${resetUrl}`,
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
