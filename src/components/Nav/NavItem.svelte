<script lang="ts">
	import { onMount } from 'svelte';
	export let route: string;

	let isActive = false;
	onMount(() => {
        isActive = location ? location.pathname === route : false;
	});
    $: activeClasses = isActive ? 'text-black bg-red-500' : '';
</script>

<div class="text-xl px-2 py-1 hover:bg-red-500 {activeClasses}">
	<slot />
</div>
