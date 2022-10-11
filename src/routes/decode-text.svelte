<script lang="ts">
	import Button from '../components/common/Button.svelte'
    import Columns from '../components/common/Columns.svelte';;
	import Heading from '../components/common/Heading.svelte';
	import Icon from '../components/common/Icon.svelte';
	import Row from '../components/common/Row.svelte';
	import ImageSection from '../components/ImageSection.svelte';
	import TextSection from '../components/TextSection.svelte';
	import ProgressBar from '../components/ProgressBar.svelte';
	import DecodeWorker from '../logic/decode.worker?worker';
	import notify from '../logic/notify';

	let decodeWorker: Worker | null = null;
	let loadTextResult: (text: ArrayBufferLike | null) => void;
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
		loadTextResult(null); // clear output
		decodeWorker = new DecodeWorker();
		decodeWorker.addEventListener('message', handleEncodeWorkerMessage);
		notify.info('Decoding started...');
		decodeWorker.postMessage(
			{
				mode: 'text',
				image: {
					height: image.height,
					width: image.width,
					buffer: image.data.buffer
				}
			},
			[image.data.buffer]
		);
	}

	function handleEncodeWorkerMessage(e: MessageEvent<DecodeWorkerData>) {
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
		if (e.data.result?.type === 'text') {
			if (decodeWorker) {
				decodeWorker.terminate();
				decodeWorker = null;
			}
			loadTextResult(e.data.result.buffer);
			working = false;
		}
	}

	function onImageInput({ detail }: CustomEvent<ImageData>) {
		allowDecode = !!detail;
	}
</script>

<div class="space-y-4">
	<Heading level={2} bold>Extract the steganographic text data from an image</Heading>
	<ProgressBar widthPercent={currentProgress} />
	<Columns>
		<Row>
			<p class="text-lg font-bold">Input</p>
			<ImageSection input on:onImageInput={onImageInput} bind:getImage={getInputImage} />
			<Button style="mt-4" onClick={onDecodePress} disabled={!allowDecode}>
                Decode <Icon icon="fileRemove"/>
            </Button>
		</Row>
		<Row>
			<p class="text-lg font-bold">Output</p>
			<TextSection output bind:loadText={loadTextResult} />
		</Row>
	</Columns>
</div>
