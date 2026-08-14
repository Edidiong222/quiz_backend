import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User)
    private userReository: Repository<User>
  ) {}

  create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userReository.create(createUserDto);
    return this.userReository.save(user);
  }

  async findAll() {
    return this.userReository.find();
  }

  async findById(id: number) {
    return this.userReository.findOne({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });
  }

  async findByEmail(email: string) {
    return this.userReository.findOne({
      where: { email }
    });
  }

  findOne(id: number) {
    return this.userReository.findOne({ where: { id } });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);
    if (!user) return null;
    Object.assign(user, updateUserDto);
    return this.userReository.save(user);
  }

  remove(id: number) {
    return this.userReository.delete(id);
  }
}
