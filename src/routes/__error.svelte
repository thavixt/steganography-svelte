<script lang="ts">
	import Heading from '../components/common/Heading.svelte';
	import Icon from '../components/common/Icon.svelte';
	import Link from '../components/common/Link.svelte';
</script>

<div class="flex flex-col justify-center items-center m-auto">
    <Heading>Ooops!</Heading>
    <p class="mb-8">This page doesn't exists (yet?)</p>
    <Link to="/" hover={false} self>Go back home<Icon icon="undo"/></Link>
</div>
