import { Body, Controller, HttpCode, HttpException, Post, Query, Res, Req } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compareSync } from 'bcrypt';
import { Response, Request } from 'express';
import { TemplateService } from 'src/template/template.service';
import { CreationDto, User, UserService } from 'src/user/user.service';
import { AuthServiceV1, LoginDto } from './auth.service';

@Controller({ host: 'localhost', path: 'api/v1/auth' })
export class AuthControllerV1 {
    constructor(
        private readonly authService: AuthServiceV1,
        private readonly jwtService: JwtService,
        private readonly templateService: TemplateService,
        private readonly userService: UserService
    ) { };

    private readonly mail_templates = this.templateService.getAllCategoryTemplates('mail');

    @Post('confirm')
    @HttpCode(200)
    async confirm(@Res() res: Response, @Req() req: Request, @Query('token') token: string) {
        if (token) {
            const [id, pass] = Buffer.from(token, 'base64').toString().split('-'),
                request = this.authService.confirmation_requests[id];
            if (request)
                if (request.exp > Date.now())
                    if (request.confirm(pass))
                        try {
                            const callback = await request.handle(request);
                            callback.apply(this, [req, res]);
                        } catch (error) { throw new HttpException('Bad Request', 400); }
                    else throw new HttpException('INVALID_PASS', 400);
                else throw new HttpException('CONFIRMATION_EXPIRED', 400);
            else throw new HttpException('Not Found', 404);
        } else throw new HttpException('Bad Request', 400);
    }

    @Post('login')
    async login(@Req() req: Request, @Body() login_dto: LoginDto) {
        const { email, token, username } = login_dto;
        if (token) {
            const user = await this.userService.userModel.findOne({ email, username }).catch(() => null) as User;
            if (user)
                if (compareSync(token, user.token))
                    try {
                        return this.authService.createRequest('LOGIN', username, req.identifier.toString(), [user]).token;
                    } catch (error) { throw new HttpException(error.message, 400); }
                else throw new HttpException('Bad Request', 400);
        } else throw new HttpException('Bad Request', 400);
    }

    @Post('register')
    async register(@Req() req: Request, @Body() creation_dto: CreationDto) {
        const user = await this.userService.createUser(creation_dto)
            .catch(err => { throw new HttpException(err.message, 400) }) as Omit<User, 'token'>;
        try {
            return this.authService.createRequest('REGISTER', user.username, req.identifier.toString(), [user]).token;
        } catch (error) { throw new HttpException(error.message, 400); }
        //return user;
    }
}