import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';
import { Model, Schema } from 'mongoose';
const str = Schema.Types.String as any;
str.checkRequired(v => v != null);

export interface User {
    createdAt: number;
    display_name: string;
    email: string;
    id: string;
    token: string;
    username: string;
}

export interface CreationDto {
    display_name: string;
    email: string;
    username: string;
}

export const UserSchema = new Schema({
    createdAt: { type: Number, required: true, immutable: true },
    display_name: { type: String, required: true },
    email: { type: String, required: true, immutable: true, lowercase: true, trim: true },
    id: { type: String, required: true, immutable: true, unique: true },
    login_token: { type: String, required: true },
    username: { type: String, required: true, immutable: true, lowercase: true, trim: true, unique: true },
});

@Injectable()
export class UserService {
    constructor(
        @InjectModel('User') public readonly userModel: Model<User>
    ) { }
    private readonly mail_regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    async createUser(creation_dto: CreationDto) {
        const { display_name, email, username } = creation_dto;
        if (typeof display_name !== 'string' ||
            display_name === '' ||
            display_name.length < 3)
            throw new Error('INVALID_DISPLAYNAME');
        if (typeof email !== 'string' ||
            email === '' ||
            !email.toLowerCase().match(this.mail_regex) ||
            (await this.userModel.find({ email: email })).length >= 3)
            throw new Error('INVALID_EMAIL');
        if (typeof username !== 'string' ||
            username === '' ||
            username.length < 3)
            throw new Error('INVALID_USERNAME');
        const ex_user = await this.findUserByUsername(username).catch(() => null);
        if (ex_user) throw new Error('USERNAME_EXISTS');
        return { createdAt: Date.now(), display_name, email, id: randomUUID(), username } as User;
    }

    async findUser(type: 'email', email: string): Promise<User | User[]>;
    async findUser(type: 'username', username: string): Promise<User | User[]>;
    async findUser(p0: 'email' | 'id' | 'username', p1: number | string): Promise<User | User[]> {
        return await this.userModel.find({ [p0]: p1 });
    }
    async findUserByEmailAndUsername(email: string, username: string) {
        return await this.userModel.findOne({ email, username });
    }
    async findUserByUsername(username: string) {
        return await this.findUser('username', username)[0];
    }
    async findUsersByEmail(email: string) {
        return await this.findUser('email', email);
    }
}
