<script lang="ts">
	import Link from '../../components/common/Link.svelte';
	import NavItem from '../../components/Nav/NavItem.svelte';
</script>

<nav class="w-full flex justify-center pb-2 md:pb-0">
    <div class="flex flex-wrap justify-around gap-y-2 gap-x-2 text-white">
        <NavItem route="/">
            <Link style="p-2" self to="/">Home</Link>
        </NavItem>
        <NavItem route="/decode" >
            <Link style="p-2" self to="/decode">Decode</Link>
        </NavItem>
        <NavItem route="/decode-text" >
            <Link style="p-2" self to="/decode-text">Decode to text</Link>
        </NavItem>
        <NavItem route="/encode" >
            <Link style="p-2" self to="/encode">Encode</Link>
        </NavItem>
        <NavItem route="/encode-text" >
            <Link style="p-2" self to="/encode-text">Encode text</Link>
        </NavItem>
        <NavItem route="/compare" >
            <Link style="p-2" self to="/compare">Compare</Link>
        </NavItem>
    </div>
</nav>
