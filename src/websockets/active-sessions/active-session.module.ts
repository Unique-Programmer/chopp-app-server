import { Module } from '@nestjs/common';
import { ActiveSessionService } from '../active-sessions/active-session.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { ActiveSession } from './active-session.model';

@Module({
    imports: [SequelizeModule.forFeature([ActiveSession])],
    providers: [ActiveSessionService],
    exports: [ActiveSessionService], // Exporting the service
  })
  export class ActiveSessionModule {}
