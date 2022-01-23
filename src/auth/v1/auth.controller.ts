import { Body, Controller, HttpCode, HttpException, Post, Query } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compareSync } from 'bcrypt';
import { TemplateService } from 'src/template/template.service';
import { CreationDto, User, UserService } from 'src/user/user.service';
import { AuthServiceV1, LoginDto } from './auth.service';

@Controller('api/v1/auth')
export class AuthControllerV1 {
    constructor(
        private readonly authService: AuthServiceV1,
        private readonly jwtService: JwtService,
        private readonly templateService: TemplateService,
        private readonly userService: UserService
    ) { }
    private readonly mail_templates = this.templateService.getAllCategoryTemplates('mail');

    @Post('confirm')
    @HttpCode(200)
    confirm(@Query('token') token: string) {
        if (token) {
            token = Buffer.from(token, 'base64').toString();
            const id = token.split('-').slice(0, 5).join('-'),
                pass = token.split('-').slice(4)[1],
                request = this.authService.pending_requests.find(request => request.id === id);
            if (request)
                if (request.expiresAt > Date.now())
                    if (request.confirm(pass)) {
                        request.resolve();
                        if (request.type === 'CREATE') {
                            const { hash, pass } = this.authService.createTempPass(64),
                                userModel = Object.assign(request.args[0], { token: hash }) as User;
                            try {
                                new this.userService.userModel(userModel).save()
                                    .then(() => console.log('LOGIN_TOKEN:', pass))
                                    .catch(() => { throw new HttpException('Bad Request', 400); });
                            } catch (error) { throw error; }
                        } else if (request.type === 'LOGIN') return {
                            access_token: this.jwtService.sign({
                                id: request.id, login_token: request.args[0], username: request.username
                            })
                        }
                        else throw new HttpException('Method Not Allowed', 405);
                    } else throw new HttpException('INVALID_PASS', 400);
                else throw new HttpException('CONFIRMATION_EXPIRED', 400);
            else throw new HttpException('Not Found', 404);
        } else throw new HttpException('Bad Request', 400);
    }

    @Post('register')
    async register(@Body() creation_dto: CreationDto) {
        const user = await this.userService.createUser(creation_dto).catch(err => { throw new HttpException(err.message, 400) });
        await this.authService.sendRequest('CREATE', user.username, this.mail_templates['pass'], user.email, [user])
            .catch(err => { throw new HttpException(err.message, 400); });
        return user;
    }

    @Post('login')
    async login(@Body() login_dto: LoginDto) {
        const { email, token, username } = login_dto,
            user = await this.userService.findUserByEmailAndUsername(email, username).catch(() => null) as User;
        if (user)
            if (compareSync(token, user.token))
                this.authService.sendRequest('LOGIN', username, this.mail_templates['pass'], email, [token]);
            else throw new HttpException('Bad Request', 400);
        else throw new HttpException('Bad Request', 400);
    }
}