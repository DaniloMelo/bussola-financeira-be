/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable } from "@nestjs/common";
import { SanitizeProtocol } from "./sanitize.protocol";
import sanitizeHtml from "sanitize-html";

@Injectable()
export class SanitizeService implements SanitizeProtocol {
  sanitizeText(input: string): string {
    if (!input || typeof input !== "string") return "";

    return sanitizeHtml(input, {
      allowedTags: [],
      allowedAttributes: {},
    });
  }

  escapeHtml(input: string) {
    if (!input || typeof input !== "string") return "";

    const map: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#x27;",
      "/": "&#x2F;",
    };

    return input.replace(/[&<>"'/]/g, (char) => map[char]);
  }

  removeUnicode(input: string): string {
    if (!input || typeof input !== "string") return "";

    let cleaned = input.replace(/[\u200B-\u200D\uFEFF]/g, "");

    // eslint-disable-next-line no-control-regex
    cleaned = cleaned.replace(/[\u0000-\u001F\u007F-\u009F]/g, "");

    cleaned = cleaned.normalize("NFC");

    return cleaned;
  }
}
