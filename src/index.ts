import 'isomorphic-fetch';

import * as dotenv from 'dotenv';
import express, { Express, Request, Response, Router } from 'express';

import { Redis } from '@upstash/redis';

import { CommandsHandler } from './bot/commands-handler';
import { MarliMusic } from './bot/marli-music';
import { YtdlSourceStream } from './sources/ytdl-source/ytdl-source';

dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN;
const BOT_PREFIX = process.env.BOT_PREFIX;

const botHandler = new CommandsHandler(new YtdlSourceStream());

const redis = new Redis({
	token: process.env.REDIS_TOKEN,
	url: process.env.REDIS_URL,
});

const marliMusic = new MarliMusic(
	{
		prefix: BOT_PREFIX,
		token: BOT_TOKEN,
	},
	botHandler,
	redis,
	{
		intents: [
			'Guilds',
			'GuildMessages',
			'MessageContent',
			'GuildVoiceStates',
			'DirectMessageReactions',
			'GuildEmojisAndStickers',
			'GuildMembers',
			'GuildMessageTyping',
			'GuildMessageReactions',
		],
	},
);

const server: Express = express();
const router = Router();
server.use(router);

const port = process.env.PORT || 3000;

router.get('/', (_request: Request, response: Response) => {
	return response.sendFile('./public/index.html', { root: '.' });
});

router.post('/health-check', (_request: Request, response: Response) => {
	return response.json({
		message: marliMusic.healthCheck(),
	});
});

server.listen(port, () => {
	console.log(`Server listening to: ${port}`);
});
