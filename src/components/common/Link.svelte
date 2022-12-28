<script lang="ts">
	import Icon from './Icon.svelte';

    /**
     * Target - href
     */
	export let to: string;
    /**
     * Open in same tab (target '_self' instead of '_blank')
     */
	export let self = false;
    /**
     * Italic text
     */
    export let em = false;
    /**
     * Custom class names
     */
	export let style = '';
    /**
     * include an "link" svg icon after the link
     */
    export let icon = false;
    /**
     * **default** Show underline on hover
     */
    export let hover = true;

	let target = '_blank';
	if (self) {
		target = '_self';
	}
    
	const activeClasses: string[] = ['inline-block'];
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
