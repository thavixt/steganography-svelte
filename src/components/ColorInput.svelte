<script lang="ts">
	import { hexToRGBA, RGBAToHex } from '../logic/common';
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
</script>

<div class="color-selector">
    <slot/>
    <input class="w-12 border rounded-md p-0.5" type="color" on:input={onColorSelected} value={RGBAToHex(currentColor)}/>
</div>
