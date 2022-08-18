<script lang="ts">
	import Button from '../components/common/Button.svelte';
	import Heading from '../components/common/Heading.svelte';
	import Icon from '../components/common/Icon.svelte';
	import ImageSection from '../components/ImageSection.svelte';
	import TextSection from '../components/TextSection.svelte';
	import ProgressBar from '../components/ProgressBar.svelte';
	import DecodeWorker from '../logic/decode.worker?worker';
	import notify from '../logic/notify';

	let decodeWorker: Worker | null = null;
	let loadTextResult: (text: ArrayBufferLike | null) => void;
	let currentImageData: ImageData | null = null;
	$: currentProgress = 0; // 0-100
	$: allowDecode = false;

	function onDecodePress() {
		if (!currentImageData) {
			console.error('No current image set');
			notify.error('No current image set');
			return;
		}
		allowDecode = false;
		currentProgress = 0;
		loadTextResult(null); // clear output
		decodeWorker = new DecodeWorker();
		decodeWorker.addEventListener('message', handleEncodeWorkerMessage);
		notify.info('Decoding started...');
		decodeWorker.postMessage(
			{
				mode: 'text',
				image: {
					height: currentImageData.height,
					width: currentImageData.width,
					buffer: currentImageData.data.buffer
				}
			},
			[currentImageData.data.buffer]
		);
	}

	function handleEncodeWorkerMessage(e: MessageEvent<DecodeWorkerData>) {
		if (e.data.progress) {
			currentProgress = e.data.progress;
		}
		if (e.data.error) {
			console.error(e.data.error);
			notify.error(e.data.error);
		}
		if (e.data.doneMs) {
			currentProgress = 100;
			notify.success(`Decoding finished in ${e.data.doneMs / 1000} seconds.`);
		}
		if (e.data.result?.type === 'text') {
			console.log(e.data.result);
			if (decodeWorker) {
				decodeWorker.terminate();
				decodeWorker = null;
			}
			loadTextResult(e.data.result.buffer);
			allowDecode = true;
		}
	}

	function onImageInput({ detail }: CustomEvent<ImageData>) {
		if (!detail) {
			currentImageData = null;
		}
		currentImageData = detail;
		allowDecode = true;
	}
</script>

<div class="space-y-4">
	<Heading level={2} bold>Extract the steganographic text data from an image</Heading>
	<ProgressBar widthPercent={currentProgress} />
	<div class="mt-4 flex flex-wrap justify-around gap-y-4 gap-x-8">
		<div class="flex flex-col">
			<p class="text-lg font-bold">Input</p>
			<ImageSection input on:onImageInput={onImageInput} />
			<Button style="mt-4" onClick={onDecodePress} disabled={!allowDecode}>
                Decode <Icon icon="fileRemove"/>
            </Button>
		</div>
		<div class="flex flex-col">
			<p class="text-lg font-bold">Output</p>
			<TextSection output bind:loadText={loadTextResult} />
		</div>
	</div>
</div>
