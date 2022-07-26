import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { hashSync } from 'bcrypt';
import { generate } from 'generate-password';
import {
  CallbackWithoutResultAndOptionalError,
  Document,
  Model,
  Types,
} from 'mongoose';
import { User } from './user.schema';

export interface CreateDTO {
  display_name?: string;
  email: string;
  username: string;
}

@Injectable()
export default class UserService {
  constructor(@InjectModel('User') public readonly model: Model<User>) {
    model.schema.pre('save', prehook);
    model.schema.pre('validate', prehook);

    async function prehook(
      this: Document<unknown, any, User> &
        User & {
          _id: Types.ObjectId;
        },
      next: CallbackWithoutResultAndOptionalError,
    ) {
      model
        .find({ email: this.email })
        .then(({ length }) => {
          console.log(length);
          if (length >= 2) {
            const message =
              "Can't have the same email for more than 5 accounts.";
            this.invalidate('email', message);
            next(new Error(message));
          } else next();
        })
        .catch(console.log);
    }
  }

  static readonly salt = process.env['HASH_SALT'];
  static readonly tempass_length = 32;

  async create({
    email,
    username,
    display_name,
  }: CreateDTO): Promise<
    [model: Document<unknown, any, User> & User, pass: string]
  > {
    if (!display_name) display_name = username;
    await this.model
      .validate({ display_name, email, username })
      .catch((error) => {
        const { display_name, email, username } = error.errors;
        if (display_name) var message = display_name.message;
        else if (email) var message = email.message;
        else if (username) var message = username.message;
        if (message) throw new Error(message);
      });

    const [hash, pass] = this.tempass();

    return [
      new this.model({
        display_name,
        email,
        username,
        token: hash,
      }),
      pass,
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
