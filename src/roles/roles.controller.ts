import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Role } from './roles.model';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';


@ApiTags('roles')
@Controller('roles')
export class RolesController {
    constructor(private rolesService: RolesService) {}

    @ApiOperation({ summary: 'Role creation' })
    @ApiResponse({ status: 200, type: Role })
    @Post()
    create(@Body() userDto: CreateRoleDto) {
        return this.rolesService.createRole(userDto);
    }

    @ApiOperation({ summary: 'Getting role by role value path param' })
    @ApiResponse({ status: 200, type: Role })
    @Get('/:value')
    getByValue(@Param('value') value: string) {
        return this.rolesService.getRoleByValue(value);
    }
}
