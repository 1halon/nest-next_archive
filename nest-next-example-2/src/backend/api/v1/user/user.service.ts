import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Schema as _Schema } from 'mongoose';
import { User } from './user.schema';
const str: any = _Schema.Types.String,
  num: any = _Schema.Types.Number;
str.checkRequired((v) => v !== null);
num.checkRequired((v) => v !== null);

export interface CreateDTO {
  display_name?: string;
  email: string;
  username: string;
}

@Injectable()
export default class UserService {
  constructor(@InjectModel('User') public readonly model: Model<User>) {
    model.schema.pre('save', async function (next) {
      model
        .find({ email: this.email })
        .then(({ length }) => {
          if (length >= 5) {
            const message =
              "Can't have the same email for more than 5 accounts.";
            this.invalidate('email', message);
            next(new Error(message));
          } else next();
        })
        .catch(next);
    });
  }

  static readonly MailRegex =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  async create({ email, username, display_name }: CreateDTO) {
    if (!display_name) display_name = username;
    await this.model
      .validate({ display_name, email, username })
      .catch((error) => {
        const { display_name, email, username } = error.errors;
        console.log(error.errors);
        if (display_name) var message = display_name.message;
        else if (email) var message = email.message;
        else if (username) var message = username.message;
        throw new Error(message);
      });

    return this.model.create({
      display_name,
      email,
      username,
    });
  }
}
