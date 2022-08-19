<script lang="ts">
	import { onMount } from 'svelte';
	import Link from '../common/Link.svelte';
	export let route: string;
	export let name: string;

	let isActive = false;
    $: activeClasses = isActive ? 'text-black bg-red-500' : '';
	onMount(() => {
        isActive = location ? location.pathname === route : false;
	});
</script>

<div class="text-xl hover:bg-red-500 {activeClasses}">
    <Link style="px-4 py-3" hover={false} self to={route}>{name}</Link>
</div>
