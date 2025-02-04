import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  UseGuards,
  UsePipes,
  Headers,
  Query,
  Put,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from './users.model';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles-auth.guard';
import { Roles } from 'src/auth/roles-auth.decorator';
import { ValidationPipe } from 'src/pipes/validation.pipe';
import { AuthService } from 'src/auth/auth.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateAdminDto } from './dto/create-admin.dto';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(
    private usersService: UsersService,
    private authService: AuthService,
  ) {}

  @Post('/createAdmin')
  @ApiOperation({ summary: 'Create an admin account' })
  @ApiResponse({
    status: 201,
    description: 'Admin created successfully.',
    type: User,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @UsePipes(new ValidationPipe())
  // TODO: Текущий флоу создания админа надо пересмотреть. Защита сейчас заключается в том, чтобы прислать на /createAdmin нужные логин и пароль суперадмина
  // @UseGuards(JwtAuthGuard)
  async createAdmin(@Body() createAdminDto: CreateAdminDto) {
    // Проверка учетных данных суперадмина
    const isAuthenticated = await this.authService.authenticateSuperAdmin(
      createAdminDto.superadminLogin,
      createAdminDto.superadminPassword,
    );

    if (!isAuthenticated) {
      throw new HttpException(
        'Superadmin authentication failed',
        HttpStatus.FORBIDDEN,
      );
    }

    return this.usersService.createAdmin({
      adminLogin: createAdminDto.adminLogin,
      adminPassword: createAdminDto.adminPassword,
    });
  }

  @ApiOperation({ summary: 'User creation' })
  @ApiResponse({ status: 200, type: User })
  @UsePipes(ValidationPipe)
  @Post()
  create(@Body() userDto: CreateUserDto) {
    return this.usersService.createUser(userDto);
  }

  @ApiOperation({
    summary: 'roles: includes [ADMIN] Guarded! Getting all users',
  })
  @ApiResponse({ status: 200, type: [User] })
  @UseGuards(JwtAuthGuard)
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Get()
  getAll(
    // need add params validation
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search = '',
    @Query('sort') sort = 'fullName',
    @Query('order') order = 'asc',
    // default getting all users without requester, need add check by boolean type
    @Query('isRequesterIncluded') isRequesterIncluded = false,
    @Headers() headers,
  ) {
    const authHeader = headers.authorization;
    const accessToken = authHeader.split(' ')[1];

    const payload = this.authService.verifyToken(
      accessToken,
      process.env.JWT_ACCESS_SECRET_HEX,
    );

    return this.usersService.getAllUsers(page, limit, search, sort, order, isRequesterIncluded, payload.id);
  }

  @ApiOperation({ summary: 'Getting current user' })
  @ApiResponse({ status: 200, type: User })
  @UseGuards(JwtAuthGuard)
  @Get('/currentUser')
  currentUser(@Headers() headers) {
    const authHeader = headers.authorization;
    const token = authHeader.split(' ')[1];
    const user = this.authService.getUserByTokenPayload(token);

    return user;
  }

  @ApiOperation({ summary: 'Getting current user' })
  @ApiResponse({ status: 200, type: User })
  @UseGuards(JwtAuthGuard)
  @UsePipes(ValidationPipe)
  @Put('/currentUser')
  async updateUser(@Headers() headers, @Body() payload: UpdateUserDto) {
    const authHeader = headers.authorization;

    const token: string = authHeader.split(' ')[1];

    const payloadKeysExist = Object.keys(payload).length;

    if (!payloadKeysExist) {
      throw new HttpException('Nothing to update', HttpStatus.BAD_REQUEST);
    }

    const user = await this.authService.getUserByTokenPayload(token);

    const updatedUser = this.usersService.updateCurrentUser(payload, user);

    return updatedUser;
  }

  @ApiOperation({ summary: 'Getting user by id' })
  @ApiResponse({ status: 200, type: User })
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getUser(@Param() params) {
    const { id } = params;

    if (!id) {
      throw new HttpException('Incorrect user id', HttpStatus.BAD_REQUEST);
    }

    const user = await this.usersService.getUserByFieldName(params.id, 'id');

    if (!user?.id) {
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    }

    return user;
  }
}
