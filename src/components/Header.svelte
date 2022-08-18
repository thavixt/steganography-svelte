<script lang="ts">
	import Link from '../components/common/Link.svelte';
	import Nav from '../components/Nav/index.svelte';
</script>

<header class="px-8 bg-gray-900 text-white pt-4 border-b-8 border-red-500">
	<h1 class="mb-4 text-2xl">
		<Link to="https://github.com/thavixt">thavixt</Link>
		/
		<Link to="/" self>StegoJS</Link>
	</h1>
    <Nav />
</header>
