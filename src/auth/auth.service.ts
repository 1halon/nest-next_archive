import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';

interface User {

}

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly userService: UserService
    ) { }

    login(user: { email: string, password: string }) {
        const { email, password } = user; 
        return {
            access_token: this.jwtService.sign({ email, password }, { secret: process.env.ACCESS_SECRET }),
            refresh_token: this.jwtService.sign({ email, password }, { secret: process.env.REFRESH_SECRET })
        }
    }
}
