<script lang="ts">
	import ColorInput from '../components/ColorInput.svelte';
	import Heading from '../components/common/Heading.svelte';
	import Icon from '../components/common/Icon.svelte';
	import ImageSection from '../components/ImageSection.svelte';
	import ProgressBar from '../components/ProgressBar.svelte';
	import Button from '../components/common/Button.svelte';
	import CompareWorker from '../logic/compare.worker?worker';
	import notify from '../logic/notify';

	let compareWorker: Worker | null = null;
	let loadImageResult: (image: ImageData | null) => void;

	let currentFirstImageData: ImageData | null = null;
	let currentSecondImageData: ImageData | null = null;

	$: currentProgress = 0; // 0-100
	$: allowCompare = false;

	function onFirstImageLoaded({ detail }: CustomEvent<ImageData>) {
		if (!detail) {
			currentFirstImageData = null;
			allowCompare = false;
			return;
		}
		currentFirstImageData = detail;
		allowCompare = Boolean(currentSecondImageData);
	}
	function onSecondImageLoaded({ detail }: CustomEvent<ImageData>) {
		if (!detail) {
			currentSecondImageData = null;
			allowCompare = false;
			return;
		}
		currentSecondImageData = detail;
		allowCompare = Boolean(currentFirstImageData);
	}

	function onComparePress() {
		if (!currentFirstImageData || !currentSecondImageData) {
			console.error('Missing at least one image for comparison');
		    notify.error('Missing at least one image for comparison');
			return;
		}
		allowCompare = false;
		currentProgress = 0;
		loadImageResult(null); // clear output
		compareWorker = new CompareWorker();
		compareWorker.addEventListener('message', handleCompareWorkerMessage);
		notify.info('Comparison started...');
		compareWorker.postMessage(
			{
				mode: 'image',
				first: {
					height: currentFirstImageData.height,
					width: currentFirstImageData.width,
					buffer: currentFirstImageData.data.buffer
				},
				second: {
					height: currentSecondImageData.height,
					width: currentSecondImageData.width,
					buffer: currentSecondImageData.data.buffer
				},
                diffColor: { r: 255, g: 20, b: 144, a: 255 }
			},
			[currentFirstImageData.data.buffer, currentSecondImageData.data.buffer]
		);
	}

    function handleCompareWorkerMessage(e: MessageEvent<EncodeWorkerData>) {
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
            notify.success(`Comparison finished in ${e.data.doneMs / 1000} seconds.`);
        }
        if (e.data.result) {
            console.log(e.data.result);
            if (compareWorker) {
                compareWorker.terminate();
                compareWorker = null;
            }
            const uint8Array = new Uint8ClampedArray(e.data.result.buffer);
            const resultImage = new ImageData(uint8Array, e.data.result.width, e.data.result.height);
            loadImageResult(resultImage);
            allowCompare = true;
        }
    }
</script>

<div class="space-y-4">
	<Heading level={2} bold>Compare an image with another one!</Heading>
	<ProgressBar widthPercent={currentProgress} />
	<div class="mt-4 flex flex-wrap justify-around gap-y-4 gap-x-8">
		<div class="flex flex-col space-y-4">
			<p class="text-lg font-bold">Inputs</p>
			<div class="flex flex-col">
				<small>Base image</small>
				<ImageSection input on:onImageInput={onFirstImageLoaded} />
			</div>
			<div class="flex flex-col">
				<small>Payload image (should be at least 4x smaller)</small>
				<ImageSection input on:onImageInput={onSecondImageLoaded} />
                <ColorInput/>
				<Button style="mt-4" onClick={onComparePress} disabled={!allowCompare}>
                    Compare difference <Icon icon="compare"/>
                </Button>
			</div>
		</div>
		<div class="flex flex-col space-y-4">
			<p class="text-lg font-bold">Output</p>
			<div class="flex flex-col">
				<small>The resulting image is based on the first image,</small>
				<small>highlighting it's different pixels with the other one.</small>
				<ImageSection output bind:loadImage={loadImageResult} />
			</div>
		</div>
	</div>
</div>
