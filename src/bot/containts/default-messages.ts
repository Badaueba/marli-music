import { Message } from 'discord.js';
import * as dotenv from 'dotenv';
import { sentryCapture } from '../../config/sentry';
dotenv.config();

const INVALID_COMMAND = process.env.INVALID_COMMAND || 'INVALID COMMAND';
const NOT_IN_A_VOICE_CHANNEL =
	process.env.NOT_IN_A_VOICE_CHANNEL || `YOU'RE NOT IN A VOICE CHANNEL`;
const NO_PERMISSION_JOIN_SPEAK =
	process.env.NO_PERMISSION_JOIN_SPEAK ||
	'I HAVE NO PERMISSION TO JOIN OR SPEAK';
const INVALID_INPUT_MESSAGE =
	process.env.INVALID_INPUT_MESSAGE || 'INVALID INPUT MESSAGE';
const CURRENT_PLAYING = process.env.CURRENT_PLAYING || "NOW WE'RE PLAYING";
const MUSIC_PAUSED = process.env.MUSIC_STOPPED || 'PAUSED THE MUSIC';
const MUSIC_STOPPED = process.env.MUSIC_STOPPED || 'STOPPED THE MUSIC';
const MUSIC_RESUMED = process.env.MUSIC_RESUMED || 'RESUMED THE MUSIC';
const PUSHED_TO_QUEUE =
	process.env.PUSHED_TO_QUEUE || 'ADDED A SONG TO THE QUEUE';
const MUSIC_SKIPPED = process.env.MUSIC_SKIPPED || 'SKIPPED THE MUSIC';
const PLAYLIST_ENDED = process.env.PLAYLIST_ENDED || 'PLAYLIST ENDED';

export const BOT_MESSAGES = {
	CURRENT_PLAYING,
	INVALID_COMMAND,
	INVALID_INPUT_MESSAGE,
	MUSIC_PAUSED,
	MUSIC_RESUMED,
	MUSIC_SKIPPED,
	MUSIC_STOPPED,
	NOT_IN_A_VOICE_CHANNEL,
	NO_PERMISSION_JOIN_SPEAK,
	PLAYLIST_ENDED,
	PUSHED_TO_QUEUE,
};

export function sendCommandError(errorMessage: string, message: Message) {
	message.reply({
		content: errorMessage,
	});
	sentryCapture('command.error', new Error(errorMessage));
}