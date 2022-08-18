<script lang="ts">
	export let level = 1;
	export let bold = false;
	export let mt0 = false;
	export let mb0 = false;
    export let inline = false;

	const activeClasses: string[] = [];
	switch (level) {
		case 5:
			activeClasses.push('text-lg font-bold');
			break;
		case 4:
			activeClasses.push('text-xl');
			break;
		case 3:
			activeClasses.push('text-2xl');
			break;
		case 2:
			activeClasses.push('text-3xl');
			break;
		default:
			activeClasses.push('text-4xl');
			break;
	}
    if (inline) {
        activeClasses.push('inline');
    }
	if (bold) {
		activeClasses.push('font-bold');
	}
	if (!mt0) {
		activeClasses.push('mt-4');
	}
	if (!mb0) {
		activeClasses.push('mb-8');
	}
</script>

<h2 class={activeClasses.join(' ')}>
	<slot />
</h2>
