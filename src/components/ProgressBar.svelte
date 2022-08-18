<script lang="ts">
	export let widthPercent = 0;
</script>

<div class="w-full flex items-center h-2.5">
    <div class="bg-gray-200 rounded-full w-full">
        <div class="bg-blue-600 h-2.5 rounded-full" style="width: {widthPercent}%" />
    </div>
    <span class="pl-2 text-sm text-gray-500">{widthPercent ? `${widthPercent}%` : ''}</span>
</div>
