<script lang="ts">
    import { flip } from "svelte/animate";
    import { fly } from "svelte/transition";
    import notify from "../../logic/notify.js";
    import type { ToastNotificationType } from "../../logic/notify.js";

    const notificationStore = notify.store;

    let colors: Record<ToastNotificationType, string> = {
        info: "bg-blue-400",
        success: "bg-green-500",
        warning: "bg-yellow-500",
        error: "bg-red-600",
    };
</script>

<div class="notifications absolute right-0 top-10 z-50 flex flex-col content-start items-end">
    {#each $notificationStore as notification (notification.id)}
        <div
            animate:flip
            class="flex mb-3 items-center px-2 {colors[notification.type]}"
            transition:fly={{ x: 30 }}
        >
            {#if notification.icon}
                <span class="material-icons md-24 text-white">{notification.icon}</span>
            {/if}
            <div class="p-3 block text-white">{notification.message}</div>
        </div>
    {/each}
</div>
