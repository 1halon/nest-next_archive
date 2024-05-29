import { Injectable } from '@nestjs/common';
import { InjectModel, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';
import { Model, Schema as _Schema } from 'mongoose';
const str = _Schema.Types.String as any;
str.checkRequired((v) => v !== null);

export interface CreationDto {
  display_name?: string;
  email: string;
  username: string;
}

@Schema()
export class User {
  @Prop({ default: Date.now, immutable: true, required: true })
  createdAt: number;
  @Prop({ required: true })
  display_name: string;
  @Prop({ immutable: true, lowercase: true, trim: true })
  email: string;
  @Prop({
    default: () => randomUUID().split('-').join(''),
    immutable: true,
    required: true,
    unique: true,
  })
  id: string;
  @Prop({ required: true })
  token: string;
  @Prop({ immutable: true, lowercase: true, trim: true, unique: true })
  username: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

@Injectable()
export class UserService {
  constructor(@InjectModel('User') public readonly userModel: Model<User>) {}

  private readonly mail_regex =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  async createUser(creation_dto: CreationDto) {
    let { display_name, email, username } = creation_dto;
    if (typeof display_name !== 'string' || display_name === '')
      display_name = username;
    if (display_name.length < 3) throw new Error('INVALID_DISPLAYNAME');
    if (
      typeof email !== 'string' ||
      email === '' ||
      !email.toLowerCase().match(this.mail_regex) ||
      (await this.userModel.find({ email: email })).length >= 3
    )
      throw new Error('INVALID_EMAIL');
    if (typeof username !== 'string' || username === '' || username.length < 3)
      throw new Error('INVALID_USERNAME');
    username = username.toLowerCase().trim();
    const ex_user = await this.userModel
      .findOne({ username })
      .catch(() => null);
    if (ex_user) throw new Error('USERNAME_EXISTS');
    return {
      display_name,
      email,
      username,
    } as User;
  }
}
