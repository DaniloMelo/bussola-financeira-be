import { Injectable } from "@nestjs/common";
import { UserRepository } from "../repositories/user.repository";

@Injectable()
export class UserAuthService {
  constructor(private readonly userRepository: UserRepository) {}

  async saveRefreshTokenAndLastLoginAt(
    userId: string,
    refreshTokenHash: string,
  ) {
    return await this.userRepository.saveRefreshTokenAndLastLoginAt(
      userId,
      refreshTokenHash,
    );
  }

  async updateRefreshToken(userId: string, refreshTokenHash: string | null) {
    return await this.userRepository.updateRefreshToken(
      userId,
      refreshTokenHash,
    );
  }

  async findOneByIdWithCredentials(userId: string) {
    return this.userRepository.findOneByIdWithCredentials(userId);
  }

  async findOneByEmailWithCredentials(email: string) {
    return this.userRepository.findOneByEmailWithCredentials(email);
  }
}
