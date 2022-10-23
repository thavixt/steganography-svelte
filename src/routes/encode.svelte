<script lang="ts">
    import Columns from '../components/common/Columns.svelte';
	import Heading from '../components/common/Heading.svelte';
	import Icon from '../components/common/Icon.svelte';
	import Row from '../components/common/Row.svelte';
	import ImageSection from '../components/ImageSection.svelte';
	import ProgressBar from '../components/ProgressBar.svelte';
	import Button from '../components/common/Button.svelte';
	import { scrollToTop } from '../logic/common';
	import EncodeWorker from '../logic/encode.worker?worker';
	import notify from '../logic/notify';

	let encodeWorker: Worker | null = null;
	let loadImageResult: (image: ImageData | null) => void;
    let getBaseImage: () => ImageData | null;
    let getPayloadImage: () => ImageData | null;
    let working = false;

    let baseImageLoaded = false;
    let payloadImageLoaded = false;

	$: currentProgress = 0; // 0-100
	$: allowEncode = baseImageLoaded && payloadImageLoaded;

	function onSourceImageLoaded({ detail }: CustomEvent<ImageData>) {
        baseImageLoaded = !!detail;
	}
	function onPayloadImageLoaded({ detail }: CustomEvent<ImageData>) {
		payloadImageLoaded = !!detail;
	}

	function onEncodePress() {
        const firstImage = getBaseImage();
        const secondImage = getPayloadImage();
		if (!firstImage || !secondImage) {
			notify.error('PARAMS_MISSING');
			return;
		}
		working = true;
		currentProgress = 0;
		loadImageResult(null); // clear output
		encodeWorker = new EncodeWorker();
		encodeWorker.addEventListener('message', handleEncodeWorkerMessage);
        scrollToTop();
		notify.info('Encoding started...');
		encodeWorker.postMessage(
			{
				mode: 'image',
				image: {
					height: firstImage.height,
					width: firstImage.width,
					buffer: firstImage.data.buffer
				},
				payload: {
					height: secondImage.height,
					width: secondImage.width,
					buffer: secondImage.data.buffer
				}
			},
			[firstImage.data.buffer, secondImage.data.buffer]
		);
	}

    function handleEncodeWorkerMessage(e: MessageEvent<EncodeWorkerData>) {
        if (e.data.progress) {
            currentProgress = e.data.progress;
        }
        if (e.data.error) {
            notify.error(e.data.error);
            working = false;
        }
        if (typeof e.data.doneMs === 'number') {
            currentProgress = 100;
            notify.success(`Encoding finished in ${e.data.doneMs / 1000} seconds.`);
        }
        if (e.data.result) {
            if (encodeWorker) {
                encodeWorker.terminate();
                encodeWorker = null;
            }
            const uint8Array = new Uint8ClampedArray(e.data.result.buffer);
            const resultImage = new ImageData(uint8Array, e.data.result.width, e.data.result.height);
            loadImageResult(resultImage);
            working = false;
        }
    }
</script>

<div class="space-y-4">
	<Heading level={2} bold>Hide an image in another image</Heading>
	<ProgressBar widthPercent={currentProgress} />
	<Columns>
		<Row>
			<p class="text-lg font-bold">Inputs</p>
            <ImageSection input on:onImageInput={onSourceImageLoaded} bind:getImage={getBaseImage} disabled={working}>
                <small>Base image</small>
            </ImageSection>
            <ImageSection input on:onImageInput={onPayloadImageLoaded} bind:getImage={getPayloadImage} disabled={working}>
                <small>Payload image (should be at least 4x smaller)</small>
            </ImageSection>
            <Button style="mt-4" onClick={onEncodePress} disabled={!allowEncode || working}>
                Encode <Icon icon="fileAdd"/>
            </Button>
		</Row>
		<Row>
			<p class="text-lg font-bold">Output</p>
            <ImageSection output bind:loadImage={loadImageResult} disabled={working}>
                <small>The result is a combination of the two input images.</small>
            </ImageSection>
		</Row>
	</Columns>
</div>
