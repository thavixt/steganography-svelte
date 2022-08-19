<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
    
	interface DispatchEvents {
        onColorSelected: RGBA;
	}
	const dispatch = createEventDispatcher<DispatchEvents>();

    export let defaultColor = '#ee33bb';
    $: currentColor = hexToRGBA(defaultColor);

    onMount(() => {
        dispatch('onColorSelected', currentColor);
    })

    function onColorSelected(e: any) {
        if (e.target) {
            currentColor = { ...hexToRGBA(e.target.value) };
		    dispatch('onColorSelected', currentColor);
        }
    }
    
    const hexToRGBA = (hexColor: string) => {
        const hex = hexColor.split("#").pop()!;
        const bigint = parseInt(hex, 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return { r, g, b, a: 255 };
    }
    const RGBAToHex = (rgba: RGBA) => {
        const hex = "#" + componentToHex(rgba.r) + componentToHex(rgba.g) + componentToHex(rgba.b);
        return hex;
    }
    const componentToHex = (c: number) => {
        const hex = c.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    }
</script>

<div class="color-selector">
    <slot/>
    <input class="w-12 border rounded-md p-0.5" type="color" on:input={onColorSelected} value={RGBAToHex(currentColor)}/>
</div>
