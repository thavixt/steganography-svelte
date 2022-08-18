<script lang="ts">
	import Heading from '../components/common/Heading.svelte';
	import Icon from '../components/common/Icon.svelte';
	import ImageSection from '../components/ImageSection.svelte';
	import ProgressBar from '../components/ProgressBar.svelte';
	import Button from '../components/common/Button.svelte';
	import EncodeWorker from '../logic/encode.worker?worker';
	import notify from '../logic/notify';

	let encodeWorker: Worker | null = null;
	let loadImageResult: (image: ImageData | null) => void;

	let currentSourceImageData: ImageData | null = null;
	let currentPayloadImageData: ImageData | null = null;

	$: currentProgress = 0; // 0-100
	$: allowEncode = false;

	function onSourceImageLoaded({ detail }: CustomEvent<ImageData>) {
		if (!detail) {
			currentSourceImageData = null;
			allowEncode = false;
			return;
		}
		currentSourceImageData = detail;
		allowEncode = Boolean(currentPayloadImageData);
	}
	function onPayloadImageLoaded({ detail }: CustomEvent<ImageData>) {
		if (!detail) {
			currentPayloadImageData = null;
			allowEncode = false;
			return;
		}
		currentPayloadImageData = detail;
		allowEncode = Boolean(currentSourceImageData);
	}

	function onEncodePress() {
		if (!currentSourceImageData || !currentPayloadImageData) {
			console.error('No source or payload image set');
			notify.error('No source or payload image set');
			return;
		}
		allowEncode = false;
		currentProgress = 0;
		loadImageResult(null); // clear output
		encodeWorker = new EncodeWorker();
		encodeWorker.addEventListener('message', handleEncodeWorkerMessage);
		notify.info('Encoding started...');
		encodeWorker.postMessage(
			{
				mode: 'image',
				image: {
					height: currentSourceImageData.height,
					width: currentSourceImageData.width,
					buffer: currentSourceImageData.data.buffer
				},
				payload: {
					height: currentPayloadImageData.height,
					width: currentPayloadImageData.width,
					buffer: currentPayloadImageData.data.buffer
				}
			},
			[currentSourceImageData.data.buffer, currentPayloadImageData.data.buffer]
		);
	}

    function handleEncodeWorkerMessage(e: MessageEvent<EncodeWorkerData>) {
        console.log(e.data);
        if (e.data.progress) {
            currentProgress = e.data.progress;
        }
        if (e.data.error) {
            console.error(e.data.error);
            notify.error(e.data.error);
        }
        if (e.data.doneMs) {
            currentProgress = 100;
            notify.success(`Encoding finished in ${e.data.doneMs / 1000} seconds.`);
        }
        if (e.data.result) {
            console.log(e.data.result);
            if (encodeWorker) {
                encodeWorker.terminate();
                encodeWorker = null;
            }
            const uint8Array = new Uint8ClampedArray(e.data.result.buffer);
            const resultImage = new ImageData(uint8Array, e.data.result.width, e.data.result.height);
            loadImageResult(resultImage);
            allowEncode = true;
        }
    }
</script>

<div class="space-y-4">
	<Heading level={2} bold>Hide an image in another image!</Heading>
	<ProgressBar widthPercent={currentProgress} />
	<div class="mt-4 flex flex-wrap justify-around gap-y-4 gap-x-8">
		<div class="flex flex-col space-y-4">
			<p class="text-lg font-bold">Inputs</p>
			<div class="flex flex-col">
				<small>Base image</small>
				<ImageSection input on:onImageInput={onSourceImageLoaded} />
			</div>
			<div class="flex flex-col">
				<small>Payload image (should be at least 4x smaller)</small>
				<ImageSection input on:onImageInput={onPayloadImageLoaded} />
				<Button style="mt-4" onClick={onEncodePress} disabled={!allowEncode}>
                    Encode <Icon icon="fileAdd"/>
                </Button>
			</div>
		</div>
		<div class="flex flex-col space-y-4">
			<p class="text-lg font-bold">Output</p>
			<div class="flex flex-col">
				<small>The result is a combination of the two input images.</small>
				<ImageSection output bind:loadImage={loadImageResult} />
			</div>
		</div>
	</div>
</div>
