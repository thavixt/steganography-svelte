<script lang="ts">
	import ColorInput from '../components/ColorInput.svelte';
    import Columns from '../components/common/Columns.svelte';
	import Heading from '../components/common/Heading.svelte';
	import Icon from '../components/common/Icon.svelte';
	import Row from '../components/common/Row.svelte';
	import ImageSection from '../components/ImageSection.svelte';
	import ProgressBar from '../components/ProgressBar.svelte';
	import Button from '../components/common/Button.svelte';
	import CompareWorker from '../logic/compare.worker?worker';
	import notify from '../logic/notify';

	let compareWorker: Worker | null = null;
	let loadImageResult: (image: ImageData | null) => void;
    let getInputImage1: () => ImageData | null;
    let getInputImage2: () => ImageData | null;
    let working = false;

    let firstImageLoaded = false;
    let secondImageLoaded = false;
	let currentDiffColor: RGBA | null = null;

	$: currentProgress = 0; // 0-100
	$: allowCompare = firstImageLoaded && secondImageLoaded && !!currentDiffColor;

	function onFirstImageLoaded({ detail }: CustomEvent<ImageData>) {
        firstImageLoaded = !!detail;
	}
	function onSecondImageLoaded({ detail }: CustomEvent<ImageData>) {
		secondImageLoaded = !!detail;
	}
    function onColorSelected({ detail }: CustomEvent<RGBA>) {
		if (detail) {
		    currentDiffColor = detail;
		}
    }

	function onComparePress() {
        const firstImage = getInputImage1();
        const secondImage = getInputImage2();
		if (!firstImage || !secondImage || !currentDiffColor) {
		    notify.error('PARAMS_MISSING');
			return;
		}
		working = true;
		currentProgress = 0;
		loadImageResult(null); // clear output
		compareWorker = new CompareWorker();
		compareWorker.addEventListener('message', handleCompareWorkerMessage);
		notify.info('Comparison started...');
		compareWorker.postMessage(
			{
				mode: 'image',
				first: {
					height: firstImage.height,
					width: firstImage.width,
					buffer: firstImage.data.buffer
				},
				second: {
					height: secondImage.height,
					width: secondImage.width,
					buffer: secondImage.data.buffer
				},
                diffColor: currentDiffColor,
			},
			[firstImage.data.buffer, secondImage.data.buffer]
		);
	}

    function handleCompareWorkerMessage(e: MessageEvent<EncodeWorkerData>) {
        console.log(e.data)
        if (e.data.progress) {
            currentProgress = e.data.progress;
        }
        if (e.data.error) {
            notify.error(e.data.error);
			working = false;
        }
        if (typeof e.data.doneMs === 'number') { // allow 0 aswell
            currentProgress = 100;
            notify.success(`Comparison finished in ${e.data.doneMs / 1000} seconds.`);
        }
        if (e.data.result) {
            if (compareWorker) {
                compareWorker.terminate();
                compareWorker = null;
            }
            const uint8Array = new Uint8ClampedArray(e.data.result.buffer);
            const resultImage = new ImageData(uint8Array, e.data.result.width, e.data.result.height);
            loadImageResult(resultImage);
            working = false;
        }
    }
</script>

<div class="space-y-4">
	<Heading level={2} bold>Compare an image with a visually identical one</Heading>
	<ProgressBar widthPercent={currentProgress} />
	<Columns>
		<Row>
			<p class="text-lg font-bold">Inputs</p>
            <ImageSection input on:onImageInput={onFirstImageLoaded} bind:getImage={getInputImage1} disabled={working}>
                <small>Base image</small>
            </ImageSection>
            <ImageSection input on:onImageInput={onSecondImageLoaded} bind:getImage={getInputImage2} disabled={working}>
                <small>Comparison image</small>
            </ImageSection>
            <div class="mt-4 mb-2">
                <ColorInput on:onColorSelected={onColorSelected}>Select a highlight color:</ColorInput>
            </div>
            <Button style="mt-4" onClick={onComparePress} disabled={!allowCompare || working}>
                Compare difference <Icon icon="compare"/>
            </Button>
		</Row>
		<Row>
			<p class="text-lg font-bold">Output</p>
            <ImageSection output bind:loadImage={loadImageResult} disabled={working}>
                <div slot='description' class="flex flex-col self-start">
                    <small>The result highlights the difference of the images</small>
                </div>
            </ImageSection>
		</Row>
	</Columns>
</div>
