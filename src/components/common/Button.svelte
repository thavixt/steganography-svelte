<script lang="ts">
    export let onClick: ClickEvent = () => {};
    export let disabled = false;
    export let style = '';
</script>

<button
    class="disabled:text-gray-400 border-2 hover:border-gray-300 bg-white hover:bg-gray-200 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-md px-2 py-1 {style}"
    on:click={onClick}
    disabled={disabled}
>
	<slot />
</button>
