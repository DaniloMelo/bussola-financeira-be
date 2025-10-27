import { PrismaService } from "src/prisma/prisma.service";

export async function cleanDatabase(prisma: PrismaService) {
  const tablesToClean = ["users"];

  const cleanSql = tablesToClean
    .map((table) => {
      return `TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE;`;
    })
    .join("");

  try {
    await prisma.$executeRawUnsafe(cleanSql);
  } catch (error) {
    console.error("Erro ao limpar o banco de dados:", error);
    throw error;
  }
}
