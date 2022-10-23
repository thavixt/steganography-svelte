<script lang="ts">
	import Columns from '../components/common/Columns.svelte';
    import Button from '../components/common/Button.svelte';
	import Heading from '../components/common/Heading.svelte';
	import Icon from '../components/common/Icon.svelte';
	import Row from '../components/common/Row.svelte';
	import ImageSection from '../components/ImageSection.svelte';
	import ProgressBar from '../components/ProgressBar.svelte';
	import DecodeWorker from '../logic/decode.worker?worker';
	import { scrollToTop } from '../logic/common';
	import notify from '../logic/notify';

	let decodeWorker: Worker | null = null;
	let loadImageResult: (image: ImageData | null) => void;
    let getInputImage: () => ImageData | null;
    let working = false;

	$: currentProgress = 0; // 0-100
	$: allowDecode = false;

	function onDecodePress() {
        const image = getInputImage();
		if (!image) {
			notify.error('PARAMS_MISSING');
			return;
		}
		working = true;
		currentProgress = 0;
		loadImageResult(null); // clear output
		decodeWorker = new DecodeWorker();
		decodeWorker.addEventListener('message', handleDecodeWorkerMessage);
        scrollToTop();
		notify.info('Decoding started...');
		decodeWorker.postMessage(
			{
				mode: 'image',
				image: {
					height: image.height,
					width: image.width,
					buffer: image.data.buffer
				}
			},
			[image.data.buffer]
		);
	}

	function handleDecodeWorkerMessage(e: MessageEvent<DecodeWorkerData>) {
		if (e.data.progress) {
			currentProgress = e.data.progress;
		}
		if (e.data.error) {
			notify.error(e.data.error);
			working = false;
		}
		if (typeof e.data.doneMs === 'number') {
			currentProgress = 100;
			notify.success(`Decoding finished in ${e.data.doneMs / 1000} seconds.`);
		}
		if (e.data.result?.type === 'image') {
			if (decodeWorker) {
				decodeWorker.terminate();
				decodeWorker = null;
			}
			const uint8Array = new Uint8ClampedArray(e.data.result.buffer);
			const resultImage = new ImageData(uint8Array, e.data.result.width, e.data.result.height);
			loadImageResult(resultImage);
			working = false;
		}
	}

	function onImageInput({ detail }: CustomEvent<ImageData>) {
		allowDecode = !!detail;
	}
</script>

<div class="space-y-4">
	<Heading level={2} bold>Extract the steganographic image from another one</Heading>
	<ProgressBar widthPercent={currentProgress} />
	<Columns>
		<Row>
            <p class="text-lg font-bold">Input</p>
			<ImageSection input on:onImageInput={onImageInput} bind:getImage={getInputImage} disabled={working} />
			<Button style="mt-4" onClick={onDecodePress} disabled={!allowDecode || working}>
                Decode <Icon icon="fileRemove"/>
            </Button>
		</Row>
		<Row>
			<p class="text-lg font-bold">Output</p>
			<ImageSection output bind:loadImage={loadImageResult} />
		</Row>
	</Columns>
</div>
