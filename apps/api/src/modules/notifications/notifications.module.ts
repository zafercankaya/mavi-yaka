import { Module, Global } from '@nestjs/common';
import { ExpoPushService } from './expo-push.service';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { InternalNotifyController } from './internal-notify.controller';

@Global()
@Module({
  controllers: [NotificationsController, InternalNotifyController],
  providers: [ExpoPushService, NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
