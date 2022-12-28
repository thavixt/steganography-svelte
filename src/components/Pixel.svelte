<script lang="ts">
    /**
     * Must be a valid CSS color - RGB/A, HEX, string
    */
    export let color: string;
</script>

<div class="w-8 h-8 inline-block translate-y-1" style="background-color: {color}"/>
