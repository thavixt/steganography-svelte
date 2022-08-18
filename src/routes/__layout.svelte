<script lang="ts">
	import '../app.css';
	import Header from '../components/Header.svelte';
	import Footer from '../components/Footer.svelte';
	import Toaster from '../components/Toaster/Toaster.svelte';
</script>

<Header />
<div class="flex flex-col flex-grow items-center px-8 mt-4 mb-20">
	<Toaster />
	<slot />
</div>
<Footer />
