import {
	AudioPlayer,
	AudioPlayerStatus,
	VoiceConnection,
	VoiceConnectionStatus,
} from '@discordjs/voice';
import { sentryCapture } from '../config/sentry';
import { logger } from '../config/winston';

export function startBotHooks(
	connection: VoiceConnection,
	player: AudioPlayer,
) {
	connection.on('debug', (message) => {
		logger.log('info', 'connection debug', message);
	});

	connection.on('error', (error: Error) => {
		connection.rejoin();
		logger.log('error', 'connection error', error);
		sentryCapture('connection.error', error);
	});

	connection.on('stateChange', (oldState, newState) => {
		logger.log('info', 
			`connection changes from ${oldState.status} to ${newState.status} `,
		);
	});

	connection.on(VoiceConnectionStatus.Disconnected, () => {
		logger.log('info', 'disconnect');
		connection.destroy();
	});

	player.on('stateChange', (oldState, newState) => {
		logger.log('info', `audio player changes from ${oldState.status} to ${newState.status}`,);
		if (newState.status === AudioPlayerStatus.Paused) player.unpause();
		if (newState.status === AudioPlayerStatus.AutoPaused) removeAutoPause(player)
	});

	player.on(AudioPlayerStatus.Idle, () => {
		if (connection.state.status !== VoiceConnectionStatus.Destroyed)
			connection.destroy();
	});

	player.on(AudioPlayerStatus.Playing, () => {
		logger.log('info', 'Audio Player is currently playing');
		clearRemoveAutoPuase(player)
	});

	player.on('error', (error: Error) => {
		logger.log('error', 'audio player error', error);
		sentryCapture('player.error', error);
	});
}


const removeAutoPause = (player: AudioPlayer) => setInterval(() => {
	player.checkPlayable()
	player.unpause()
	logger.log("info", `removeAutoPause: ${player.state.status}`)
}, 1000)

const clearRemoveAutoPuase = (player:AudioPlayer) => {
	clearInterval(removeAutoPause.bind(player));
}