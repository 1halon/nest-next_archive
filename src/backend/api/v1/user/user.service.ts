import { Inject, Injectable } from '@nestjs/common';
import type {
  RedisClientType,
  RedisFunctions,
  RedisModules,
  RedisScripts,
} from '@redis/client';
import { hashSync } from 'bcrypt';
import { generate } from 'generate-password';

export interface CreationDTO {
  username: string;
  display_name?: string;
}

export interface User {
  createdAt: number;
  display_name: string;
  password: string;
  username: string;
}

@Injectable()
export default class UserService {
  constructor(
    @Inject('REDIS_CLIENT')
    private readonly redis: RedisClientType<
      RedisModules,
      RedisFunctions,
      RedisScripts
    >,
  ) {}

  static readonly salt = process.env['HASH_SALT'];
  static readonly tempass_length = 32;

  async create(
    creation_dto: CreationDTO,
  ): Promise<[user: User, pass: string, hSet: Function]> {
    let { username, display_name } = creation_dto;

    const user = await this.validate({ username, display_name });

    const [hash, pass] = this.tempass();
    user.password = hash;

    return [
      user,
      pass,
      () => {
        for (const key in user)
          key !== 'username' && this.redis.hSet(user.username, key, user[key]);
      },
    ];
  }

  tempass(length = UserService.tempass_length): [hash: string, pass: string] {
    const pass = generate({
        length: length ?? UserService.tempass_length,
        lowercase: true,
        numbers: true,
        strict: true,
        symbols: false,
        uppercase: true,
      }),
      hash = hashSync(pass, UserService.salt);

    return [hash, pass];
  }

  async validate(user: Partial<User>) {
    const checks = {
      createdAt: (timestamp: number) =>
        typeof timestamp !== 'number' || timestamp.toString().length !== 13,
      display_name: (name: string) =>
        (typeof name !== 'string' && 'INVALID_TYPE') ||
        (name.length < 3 && 'INSUFFICENT_LENGTH') ||
        (name.length > 32 && 'EXCEEDING_LENGTH'),
      username: async (name: string) =>
        checks.display_name(name) ||
        ((await this.redis.exists(name)) && 'USERNAME_EXISTS'),
    };

    const start = performance.now();
    user.username =
      typeof user.username === 'string' ? user.username.trim() : undefined;
    console.log(performance.now() - start);
    const username = await checks.username(user.username);
    console.log(performance.now() - start);
    if (username) throw new Error(username);

    if (checks.display_name(user.display_name))
      user.display_name = user.username;
    if (checks.createdAt(user.createdAt)) user.createdAt = Date.now();

    return user as User;
  }
}
