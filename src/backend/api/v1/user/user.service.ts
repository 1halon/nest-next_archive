import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type {
  RedisClientType,
  RedisFunctions,
  RedisModules,
  RedisScripts,
} from '@redis/client';
import { hashSync } from 'bcrypt';
import { generate } from 'generate-password';
import { Document, Model } from 'mongoose';
import { User } from './user.schema';

interface CreationDTO {
  username: string;
  /**
   * @default username
   */
  display_name?: string;
}

@Injectable()
export default class UserService {
  constructor(
    @InjectModel('User') public readonly model: Model<User>,
    @Inject('REDIS_CLIENT')
    private readonly redis: RedisClientType<
      RedisModules,
      RedisFunctions,
      RedisScripts
    >,
  ) {
    this.create({ username: 'halon' });
  }

  static readonly salt = process.env['HASH_SALT'];
  static readonly tempass_length = 32;

  async create(
    creation_dto: CreationDTO,
  ): Promise<
    [model: Document<unknown, any, User> & User, pass: string, hSet: Function]
  > {
    let { username, display_name } = creation_dto ?? {};
    if (!display_name) display_name = username;

    const [hash, pass] = this.tempass(),
      model = new this.model({
        display_name,
        username,
      });

    return [
      model,
      pass,
      this.redis.hSet.bind(this.redis, 'HASH', model.id, hash),
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
}
