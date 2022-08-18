<script lang="ts">
    import Button from '../components/common/Button.svelte';
    import Icon from '../components/common/Icon.svelte';

    export let input = false;
    export let output = false;
    
	import { createEventDispatcher } from 'svelte';
	interface DispatchEvents {
		onImageInput: ImageData | null;
	}
	const dispatch = createEventDispatcher<DispatchEvents>();

	let canvas: HTMLCanvasElement;
    $: hasImage = false;

	function clearImage() {
        hasImage = false;
		const ctx = canvas.getContext('2d');
		if (!ctx) {
			return;
		}
		dispatch('onImageInput', null);
		canvas.width = 300;
		canvas.height = 150;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		return;
	}

	function onInput(e: any) {
		const ctx = canvas.getContext('2d');
		if (!ctx) {
			return;
		}
		ctx.imageSmoothingEnabled = false;
		const file = e.target.files[0];
		if (!file) {
			clearImage();
			return;
		}
		const reader = new FileReader();
		reader.onload = () => {
			let img = new Image();
			img.onload = () => {
				canvas.width = img.width;
				canvas.height = img.height;
				ctx.drawImage(img, 0, 0);
                dispatch('onImageInput', ctx.getImageData(0, 0, canvas.width, canvas.height));
			};
			img.src = reader.result as string;
		};
		reader.readAsDataURL(file);
	}

    const downloadImage = () => {
        if (!hasImage) {
            console.error('No image present to download!')
            return;
        }
        var link = document.createElement('a');
        link.download = `stegojs_image_${(Math.random() * 1_000_000).toFixed()}.png`;
        link.href = canvas.toDataURL()
        link.click();
    }

	export const loadImage = (image: ImageData | null) => {
		if (!image) {
			clearImage();
			return;
		}
		const ctx = canvas.getContext('2d');
		if (!ctx) {
			return;
		}
        hasImage = true;
		canvas.width = image.width;
		canvas.height = image.height;
		ctx.putImageData(image, 0, 0);
	};
</script>

<div class="flex flex-col justify-center items-center my-2">
	<canvas class="border-2 mb-2 p-2 min-h-[150px] max-w-[350px] w-max h-max bg-white" bind:this={canvas} />
    {#if input}
	    <input class="w-full" on:input={onInput} type="file" />
    {/if}
    {#if output}
	    <Button style="w-full mt-4" onClick={downloadImage} disabled={!hasImage}>
            Download <Icon icon="dl"/>
        </Button>
    {/if}
</div>
