import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { genSaltSync, hashSync } from 'bcrypt';
import { randomUUID } from 'crypto';
import { generate } from "generate-password"
import { Model, Schema } from 'mongoose';
const str = Schema.Types.String as any;
str.checkRequired(v => v != null);

export interface User {
    display_name: string,
    id: number,
    email: string,
    pass: string,
    username: string
}

export const UserSchema = new Schema({
    display_name: { type: String, required: true },
    id: { type: Number, required: true },
    email: { type: String, required: true },
    pass: { type: String, required: true },
    username: { type: String, required: true },
});

@Injectable()
export class UserService {
    constructor(
        @InjectModel('User') private readonly userModel: Model<User>
    ) { }
    private readonly salt = genSaltSync(8);

    async createUser(user: { display_name: string, email: string, username: string }) {
        const { display_name, email, username } = user;
        const exs_user = await this.findUserByUsername(username).catch(() => null);
        if (user) throw new Error('A user exists with this username.');
        const model = { display_name, email, id: randomUUID(), pass: '', username };
        const creation = await (new this.userModel(model).save());
        return model;
    }

    async createTempPassword(email?: string) {
        const password = generate({ length: 32, lowercase: true, numbers: true, strict: true, symbols: false, uppercase: true }),
            hash = hashSync(password, this.salt);
        if (email) {
            this.userModel.findOneAndUpdate({ email: email }, { $set: { pass: password } }, {}, function (err, user) {
                if (err) throw err;
            });
        }
        return { password, hash };
    }

    async findUser(type: 'email', email: string): Promise<User>;
    async findUser(type: 'id', id: number): Promise<User>;
    async findUser(type: 'username', username: string): Promise<User>;
    async findUser(p0: 'email' | 'id' | 'username', p1: number | string): Promise<User> {
        return new Promise<User>((resolve, reject) => this.userModel.findOne({ [p0]: p1 }, {}, function (err, user: User) { if (err) reject(err); resolve(user); }));
    }
    async findUserByEmail(email: string) {
        return this.findUser('email', email);
    }
    async findUserByID(id: number) {
        return this.findUser('id', id);
    }
    async findUserByUsername(username: string) {
        return this.findUser('username', username);
    }
}
