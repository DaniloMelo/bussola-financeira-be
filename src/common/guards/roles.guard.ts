import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PrismaService } from "src/prisma/prisma.service";
import { Role } from "../enums/role.enum";
import { ROLES_KEY } from "../decorators/roles.decorator";
import { IRequestWithUser } from "src/auth/interfaces/request-user.interface";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getClass(),
      context.getHandler(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request: IRequestWithUser = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.id) {
      throw new ForbiddenException("Usuário não identificado");
    }

    const storedUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        deletedAt: true,
        roles: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!storedUser || storedUser.deletedAt) {
      throw new ForbiddenException("Usuário não encontrado ou desativado.");
    }

    const dbUserRoles = storedUser.roles.map((r) => r.name);
    const hasRole = requiredRoles.some((r) => dbUserRoles.includes(r));

    if (!hasRole) {
      throw new ForbiddenException("Acesso negado. Permissões insuficientes.");
    }

    request.user.roles = dbUserRoles;

    return true;
  }
}
