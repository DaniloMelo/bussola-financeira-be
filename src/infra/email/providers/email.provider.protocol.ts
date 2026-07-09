export interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export abstract class EmailProviderProtocol {
  abstract sendMail(options: SendMailOptions): Promise<void>;
}
