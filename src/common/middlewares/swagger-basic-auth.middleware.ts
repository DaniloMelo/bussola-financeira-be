import { NextFunction, Request, Response } from "express";

const SWAGGER_USER = process.env.SWAGGER_USER || "local_swagger_user";
const SWAGGER_PASS = process.env.SWAGGER_PASS || "local_swagger_pass";

export function swaggerBasicAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.setHeader("WWW-Authenticate", "Basic realm='Api Documentation'");
    return res.status(401).send("Faça login.");
  }

  const [scheme, credentials] = authHeader.split(" ");

  if (scheme !== "Basic" && !credentials) {
    return res.status(401).send("Formato de dados inválido.");
  }

  const decodedCredentials = Buffer.from(credentials, "base64").toString();

  const [user, password] = decodedCredentials.split(":");

  if (user !== SWAGGER_USER || password !== SWAGGER_PASS) {
    res.setHeader("WWW-Authenticate", "Basic realm='Api Documentation'");
    return res.status(401).send("Credenciais inválidas.");
  }

  return next();
}
