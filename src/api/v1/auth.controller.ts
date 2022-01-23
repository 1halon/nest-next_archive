import { Body, Controller, HttpCode, HttpException, Post, Query, Res } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compareSync } from 'bcrypt';
import { Response } from 'express';
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
    confirm(@Query('token') token: string, @Res() res: Response) {
        if (token) {
            const [id, pass] = Buffer.from(token, 'base64').toString().split('-'),
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
                            } catch (error) { throw new HttpException('Bad Request', 400); }
                        } else if (request.type === 'LOGIN') {
                            const token = this.jwtService.sign({
                                id: request.id, userID: request.args[0], username: request.username
                            });
                            console.log(token);
                            res.cookie('token', token, {
                                httpOnly: true,
                                sameSite: 'strict',
                                secure: true,
                                signed: false
                            }).send({ token });
                        }
                        else throw new HttpException('Method Not Allowed', 405);
                    } else throw new HttpException('INVALID_PASS', 400);
                else throw new HttpException('CONFIRMATION_EXPIRED', 400);
            else throw new HttpException('Not Found', 404);
        } else throw new HttpException('Bad Request', 400);
    }

    @Post('login')
    async login(@Body() login_dto: LoginDto) {
        const { email, token, username } = login_dto;
        if (token) {
            const user = await this.userService.userModel.findOne({ email, username }).catch(() => null) as User;
            if (user)
                if (compareSync(token, user.token))
                    return this.authService.sendRequest('LOGIN', username, this.mail_templates['pass'], email, [user.id]);
                else throw new HttpException('Bad Request', 400);
        } else throw new HttpException('Bad Request', 400);
    }

    @Post('register')
    async register(@Body() creation_dto: CreationDto) {
        const user = await this.userService.createUser(creation_dto).catch(err => { throw new HttpException(err.message, 400) });
        await this.authService.sendRequest('CREATE', user.username, this.mail_templates['pass'], user.email, [user])
            .catch(err => { throw new HttpException(err.message, 400); });
    }
}