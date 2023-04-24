import { afterAll, describe, expect, it, vi } from 'vitest';
import {
	ResultAudioSearch,
	SourceStream,
	StreamInfo,
} from '../../src/sources/source-stream';
import { Readable } from 'stream';

describe('src/sources/source-stream.ts', () => {
	const mockURLStream = 'https://some.stream.io?stream=03310';
	const mockResultAudio: ResultAudioSearch = {
		duration: '1:40',
		id: '1',
		title: 'some-stream-audio',
		url: mockURLStream,
	};

	const mockStreamInfo: StreamInfo = {
		title: 'some-stream',
		url: mockURLStream,
	};

	class TestSourceStream implements SourceStream {
		getStream(_url: string): Readable | Promise<Readable> {
			const readable = new Readable({
				encoding: 'utf-8',
			});
			return readable;
		}

		getStreamInfo(_input: string): Promise<StreamInfo> {
			return Promise.resolve(mockStreamInfo);
		}

		search(_input: string): ResultAudioSearch[] | Promise<ResultAudioSearch[]> {
			return [mockResultAudio];
		}
	}

	afterAll(() => {
		vi.clearAllMocks();
	});

	it('should have correct instance of SourceStream', () => {
		const testStream = new TestSourceStream();
		expect(testStream.getStream).toBeDefined();
		expect(testStream.search).toBeDefined();
		expect(testStream.getStreamInfo).toBeDefined();
	});

	it('should run search correctly', () => {
		vi.spyOn(TestSourceStream.prototype, 'search');

		const testStream = new TestSourceStream();
		const result = testStream.search('test');

		expect(TestSourceStream.prototype.search).toHaveBeenCalledOnce();
		expect(TestSourceStream.prototype.search).toBeCalledWith('test');
		expect(result).toEqual([mockResultAudio]);
	});
	it('should run getStreamInfo correctly', async () => {
		vi.spyOn(TestSourceStream.prototype, 'getStreamInfo');

		const testStream = new TestSourceStream();
		const result = await testStream.getStreamInfo('test');

		expect(TestSourceStream.prototype.getStreamInfo).toHaveBeenCalledOnce();
		expect(TestSourceStream.prototype.getStreamInfo).toBeCalledWith('test');
		expect(result).toEqual(mockStreamInfo);
	});
	it('should run getStream correctly', async () => {
		vi.spyOn(TestSourceStream.prototype, 'getStream');

		const readableStream = new Readable({ encoding: 'utf-8' });

		const testStream = new TestSourceStream();
		const result = await testStream.getStream('test');

		expect(TestSourceStream.prototype.getStream).toHaveBeenCalledOnce();
		expect(TestSourceStream.prototype.getStream).toBeCalledWith('test');
		expect(result).toEqual(readableStream);
	});
});