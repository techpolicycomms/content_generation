import { UserRepository } from './user.repository';

const userRepo = new UserRepository();

export class UserService {
  async getUser(id: string) {
    const user = await userRepo.findById(id);
    if (!user) throw new Error('User not found');
    return user;
  }

  async listUsers(page: number, limit: number) {
    return userRepo.findAll(page, limit);
  }

  async updateUser(id: string, data: { name?: string; avatarUrl?: string }) {
    return userRepo.update(id, data);
  }

  async deleteUser(id: string) {
    return userRepo.delete(id);
  }
}
