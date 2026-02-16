export function getCorsConfig() {
  const allowedOrigins = [process.env.FRONTEND_URL_ORIGIN];

  const origins = allowedOrigins.filter(Boolean) as string[];

  return {
    origin: origins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  };
}
