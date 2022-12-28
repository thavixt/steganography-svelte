<script lang="ts">
	import { createEventDispatcher } from 'svelte';
    import Button from '../components/common/Button.svelte';
    import Icon from '../components/common/Icon.svelte';
	import { StegoError } from '../errors';
	import notify from '../logic/notify';

    export let input = false;
    export let output = false;
    export let disabled = false;
    
	interface DispatchEvents {
		onImageInput: ImageData | null;
	}
	const dispatch = createEventDispatcher<DispatchEvents>();

	let canvas: HTMLCanvasElement;
    $: hasImage = false;

    // https://github.com/sveltejs/svelte/issues/4965
    let defaultContext: CanvasRenderingContext2D | undefined;
    $: currentContext = defaultContext;
    function getContext() {
        if (currentContext) {
            return currentContext;
        } else {
            // https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext#parameters
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            if (!ctx) {
                throw new Error('Unexpected error - please refresh the page and try again');
            }
            currentContext = ctx;
            return currentContext;
        }
    }

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
            // pass - don't clear already loaded image
			// clearImage();
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
            notify.error(StegoError.NOTHING_TO_DL);
            return;
        }
        var link = document.createElement('a');
        link.download = `stegojs_image_${(Math.random() * 1_000_000).toFixed()}.bmp`;
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

    export const getImage = (): ImageData | null => {
        try {
            const ctx = getContext();
            return ctx.getImageData(0, 0, canvas.width, canvas.height);
        } catch (e) {
            return notify.catch(e);
        }
    }
</script>

<div class="flex flex-col space-y-2 my-2">
    <slot/>
    <slot name="description"/>
    <div class="flex flex-col justify-center items-center">
        <canvas class="border-2 mb-2 p-2 min-h-[150px] max-w-[350px] w-max h-max bg-white" bind:this={canvas} />
        {#if input}
            <input class="w-full" on:input={onInput} type="file" accept="image/*" disabled={disabled} />
        {/if}
        {#if output}
            <Button style="w-full mt-4" onClick={downloadImage} disabled={!hasImage || disabled}>
                Download <Icon icon="dl"/>
            </Button>
        {/if}
    </div>
</div>
