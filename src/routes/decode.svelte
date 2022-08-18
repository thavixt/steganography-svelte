<script lang="ts">
	import Button from '../components/common/Button.svelte';
	import Heading from '../components/common/Heading.svelte';
	import Icon from '../components/common/Icon.svelte';
	import ImageSection from '../components/ImageSection.svelte';
	import ProgressBar from '../components/ProgressBar.svelte';
	import DecodeWorker from '../logic/decode.worker?worker';
	import notify from '../logic/notify';

	let decodeWorker: Worker | null = null;
	let loadImageResult: (image: ImageData | null) => void;
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
		loadImageResult(null); // clear output
		decodeWorker = new DecodeWorker();
		decodeWorker.addEventListener('message', handleDecodeWorkerMessage);
		notify.info('Decoding started...');
		decodeWorker.postMessage(
			{
				mode: 'image',
				image: {
					height: currentImageData.height,
					width: currentImageData.width,
					buffer: currentImageData.data.buffer
				}
			},
			[currentImageData.data.buffer]
		);
	}

	function handleDecodeWorkerMessage(e: MessageEvent<DecodeWorkerData>) {
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
		if (e.data.result?.type === 'image') {
			console.log(e.data.result);
			if (decodeWorker) {
				decodeWorker.terminate();
				decodeWorker = null;
			}
			const uint8Array = new Uint8ClampedArray(e.data.result.buffer);
			const resultImage = new ImageData(uint8Array, e.data.result.width, e.data.result.height);
			loadImageResult(resultImage);
			allowDecode = true;
		}
	}

	function onImageInput({ detail }: CustomEvent<ImageData>) {
		if (!detail) {
			currentImageData = null;
			allowDecode = false;
			return;
		}
		currentImageData = detail;
		allowDecode = true;
	}
</script>

<div class="space-y-4">
	<Heading level={2} bold>Extract the steganographic visual data from an image</Heading>
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
			<ImageSection output bind:loadImage={loadImageResult} />
		</div>
	</div>
</div>
