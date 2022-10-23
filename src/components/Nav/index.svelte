<script lang="ts">
	import Link from '../../components/common/Link.svelte';
	import NavItem from '../../components/Nav/NavItem.svelte';
</script>

<nav class="w-full flex justify-center pb-2 md:pb-0">
    <div class="flex flex-wrap justify-center gap-y-2 gap-x-2 text-white">
        <NavItem route="/" name="What is this?"/>
        <NavItem route="/decode" name="Decode"/>
        <NavItem route="/decode-text" name="Decode to text"/>
        <NavItem route="/encode" name="Encode"/>
        <NavItem route="/encode-text" name="Encode text"/>
        <NavItem route="/compare" name="Compare"/>
    </div>
</nav>
