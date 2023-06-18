import { Client, ClientOptions, Message } from 'discord.js';

import { CommandsHandler } from './commands-handler';
import { BOT_MESSAGES } from './default-messages';
import { sentryCapture } from '../config/sentry';
import { logger } from '../config/winston';
import { ERRORS } from 'shared/errors';

interface BotInfo {
	prefix: string;
	token: string;
}

export class MarliMusic extends Client {
	prefix: string;

	constructor(
		private botInfo: BotInfo,
		private handler: CommandsHandler,
		options?: ClientOptions,
	) {
		super(options);

		this.prefix = botInfo.prefix;

		this.login(this.botInfo.token).catch((reason) => {
			logger.log('error', ERRORS.BOT_STARTUP_ERROR, reason);
			sentryCapture(ERRORS.BOT_STARTUP_ERROR, new Error(reason));
		});

		this.once('ready', () => {
			this.healthCheck();
		});

		this.on('error', (error: Error) => {
			logger.log('error', ERRORS.BOT_STARTUP_ERROR, error);
			sentryCapture(ERRORS.BOT_STARTUP_ERROR, error);
		});

		this.once('reconnecting', () => {
			logger.log('info', 'Bot Reconnecting!');
		});
		this.once('disconnect', () => {
			logger.log('info', 'Bot Disconnect!');
		});

		this.on('messageCreate', async (message: Message) => {
			this.onMessage(message, this.prefix);
		});
	}

	public healthCheck() {
		const healthString = `${this.user.username} online ${this.uptime}`;
		logger.log('debug', healthString);
		return healthString;
	}

	private async onMessage(message: Message, botPrefix: string) {
		if (message.author.bot) return;
		if (!message.content.startsWith(botPrefix)) return;
		if (!this.validate(message)) return;

		const args = message.content.split(' ');
		const input = message.content.replace(args[0], '');
		const command = args[0].replace(botPrefix, '');

		switch (command) {
			case 'search':
				this.handler.search(message, input);
				break;
			case 'play':
				this.handler.play(message, input);
				break;
			case 'pause':
				this.handler.pause(message);
				break;
			case 'resume':
				this.handler.resume(message);
				break;
			case 'stop':
				this.handler.stop(message);
				break;
			default:
				message.reply(BOT_MESSAGES.INVALID_COMMAND);
		}
	}

	private validate(message: Message) {
		const voiceChannel = message.member.voice.channel;
		if (!voiceChannel) {
			message.channel.send(BOT_MESSAGES.NOT_IN_A_VOICE_CHANNEL);
			return false;
		}

		const permissions = voiceChannel.permissionsFor(message.client.user);

		if (!permissions.has('Connect') || !permissions.has('Speak')) {
			message.channel.send(BOT_MESSAGES.NO_PERMISSION_JOIN_SPEAK);
			return false;
		}
		return true;
	}
}
