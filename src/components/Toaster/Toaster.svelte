<script lang="ts">
    import { flip } from "svelte/animate";
    import { fly } from "svelte/transition";
    import notify from "../../logic/notify.js";
    import type { ToastNotificationType } from "../../logic/notify.js";

    const notificationStore = notify.store;

    // use tailwind classes instead of hex?
    let colors: Record<ToastNotificationType, string> = {
        info: "#5bc0de",
        success: "#84C991",
        warning: "#f0ad4e",
        error: "#e26d69",
    };
</script>

<div class="notifications absolute right-0 top-10 z-50 flex flex-col content-start items-end">
    {#each $notificationStore as notification (notification.id)}
        <div
            animate:flip
            class="flex mb-3 items-center px-2"
            style="background: {colors[notification.type]};"
            transition:fly={{ x: 30 }}
        >
            {#if notification.icon}
                <span class="material-icons md-24 text-white">{notification.icon}</span>
            {/if}
            <div class="p-3 block text-white">{notification.message}</div>
        </div>
    {/each}
</div>
