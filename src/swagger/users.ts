import { Type } from '@nestjs/common';
import { User } from '../users/users.model';

export const UsersApiDoc = {
    tags: 'userss',
    operations: {
        userCreation: {
            operation: { summary: 'User creation' },
            response: { status: 200, type: User },
        },
        getAllUsers: {
            operation: { summary: 'Getting all users' },
            response: { status: 200, type: [User] },
        },
    },
    properties: {
        id: { example: '1', description: 'primary key id' },
        email: { example: 'user@gmail.com', description: 'unique email' },
        password: { example: '1234', description: 'password' },
        fullName: { example: 'Zovut Syava', description: 'full name, splitted' },
        phoneNumber: { example: '8-989-898-98-98', description: 'phone number like string' },
    }
}