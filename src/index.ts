import { WebhookClient, EmbedBuilder } from 'discord.js';
import { io } from 'socket.io-client';
import { setTimeout } from 'timers/promises';
import 'dotenv/config';

const psWebhookClient = new WebhookClient({ url: process.env.PS_WEBHOOK_URL }),
  xboxWebhookClient = new WebhookClient({ url: process.env.XBOX_WEBHOOK_URL }),
  psLogClient = new WebhookClient({ url: process.env.PS_LOG_WEBHOOK_URL }),
  xboxLogClient = new WebhookClient({ url: process.env.XBOX_LOG_WEBHOOK_URL }),
  psIO = io('https://ps-api.exiaroleplay.com/'),
  xboxIO = io('https://xbox-api.exiaroleplay.com/'),
  UpdateEmbed = new EmbedBuilder()
    .setTitle('Undergoing Updates')
    .setDescription(
      'The CAD is currently undergoing updates. This should only take around 3-6 minutes.',
    )
    .setFooter({ text: 'ExiaRoleplay CAD Monitor' })
    .setTimestamp()
    .setColor(0xff5733),
  OutageEmbed = new EmbedBuilder()
    .setTitle('Outage Detected')
    .setDescription(
      'The CAD is currently experiencing an outage. Development has been notified and is looking into the issue.',
    )
    .setFooter({ text: 'ExiaRoleplay CAD Monitor' })
    .setTimestamp()

    .setColor(0xff0000),
  UpEmbed = new EmbedBuilder()
    .setTitle('CAD Online')
    .setDescription(
      'The CAD is now online and operational, thank you for your patience',
    )
    .setFooter({ text: 'ExiaRoleplay CAD Monitor' })
    .setTimestamp()

    .setColor(0x00ff00),
  downHandler = async (server: 'ps' | 'xbox') => {
    if (server === 'ps') {
      //assume im updating at first
      await psWebhookClient.send({
        embeds: [UpdateEmbed],
      });
      await setTimeout(600000); //10 minutes
      if (!psIO.connected) {
        //if it is still down after 10 minutes then it crashed
        await psWebhookClient.send({
          embeds: [OutageEmbed],
        });
        await psLogClient.send({
          embeds: [OutageEmbed],
          content: '@everyone',
        });
      }
    } else {
      //assume im updating at first
      await xboxWebhookClient.send({
        embeds: [UpdateEmbed],
      });
      await setTimeout(600000); //10 minutes
      if (!xboxIO.connected) {
        //if it is still down after 10 minutes then it crashed
        await xboxWebhookClient.send({
          embeds: [OutageEmbed],
        });
        await xboxLogClient.send({
          embeds: [OutageEmbed],
          content: '@everyone',
        });
      }
    }
  },
  upHandler = async (server: 'ps' | 'xbox') => {
    if (server === 'ps') {
      await psWebhookClient.send({
        embeds: [UpEmbed],
      });
    } else {
      await xboxWebhookClient.send({
        embeds: [UpEmbed],
      });
    }
  };

psIO.on('connect', async () => {
  await upHandler('ps');
});
psIO.on('disconnect', async () => {
  await downHandler('ps');
});

xboxIO.on('connect', async () => {
  await upHandler('xbox');
});
xboxIO.on('disconnect', async () => {
  await downHandler('xbox');
});
