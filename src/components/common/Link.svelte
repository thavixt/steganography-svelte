<script lang="ts">
	import Icon from './Icon.svelte';

	export let to: string;
	export let self = false;
    export let em = false; // italic text
	export let style = ''; // custom class names from prop
    export let icon = false; // include an svg icon after the link
    export let hover = true;

	let target = '_blank';
	if (self) {
		target = '_self';
	}
    
	const activeClasses: string[] = [];
	if (em) {
		activeClasses.push('italic');
	}
    if (hover) {
		activeClasses.push('hover:text-gray-100', 'hover:underline', 'underline-offset-4');
    }
    if (style) {
        activeClasses.push(...style.split(' '));
    }
</script>

<a class={activeClasses.join(' ')} href={to} target={target}>
    <slot/>
    {#if icon}<Icon icon="link"/>{/if}
</a>
