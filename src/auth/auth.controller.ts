import { MailerService } from '@nestjs-modules/mailer';
import { Body, Controller, HttpCode, HttpException, Post, Res } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compareSync } from 'bcrypt';
import { TemplateService } from 'src/template/template.service';
import { CreationDto, User, UserService } from 'src/user/user.service';
import { AuthService, ConfirmDto, LoginDto } from './auth.service';

@Controller('api/auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly jwtService: JwtService,
        private readonly mailerService: MailerService,
        private readonly templateService: TemplateService,
        private readonly userService: UserService
    ) { }
    private readonly mail_templates = this.templateService.getAllCategoryTemplates('mail');

    @Post('confirm')
    @HttpCode(200)
    confirm(@Body() confirm_dto: ConfirmDto) {
        const { id, pass } = confirm_dto,
            request = this.authService.pending_requests.find(request => request.id === id);
        if (request)
            if (request.expiresAt > Date.now())
                if (request.confirm(pass)) {
                    request.resolve();
                    if (request.type === 'CREATE') {
                        const { hash, pass } = this.authService.createTempPass(64),
                            userModel = Object.assign(request.args[0], { login_token: hash }) as User;
                        try {
                            new this.userService.userModel(userModel).save()
                                .then(() => console.log('LOGIN_TOKEN:', pass))
                                /*this.mailerService.sendMail({
                                    html: this.mail_templates['pass']({ id: userModel.id, pass: pass }),
                                    subject: 'Your Login Token',
                                    to: userModel.email
                                }).catch(() => { throw new HttpException('Bad Request', 400) }))*/
                                .catch(() => { throw new HttpException('Bad Request', 400); });
                        } catch (error) { throw error; }
                    } else if (request.type === 'LOGIN') {
                        return {
                            access_token: this.jwtService.sign({ pass, username: request.username }, { secret: process.env.ACCESS_SECRET })
                        }
                    } else throw new HttpException('Method Not Allowed', 405);
                } else throw new HttpException('INVALID_PASS', 400);
            else throw new HttpException('CONFIRMATION_EXPIRED', 400);
        else throw new HttpException('Not Found', 404);
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
        const { email, login_token, username } = login_dto;
        const user = await this.userService.userModel.findOne({ email, username }).catch(() => null) as User;
        if (user)
            if (compareSync(login_token, user.login_token)) {
                this.authService.sendRequest('LOGIN', username, this.mail_templates['pass'], email);
            } else throw new HttpException('Bad Request', 400);
        else throw new HttpException('Bad Request', 400);
    }
}
