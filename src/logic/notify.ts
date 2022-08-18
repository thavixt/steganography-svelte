import { writable } from "svelte/store"

export type ToastNotificationType = 'info' | 'success' | 'warning' | 'error';
export type ToastNotificationIcon = 'info' | 'check' | 'error' | 'close';
export interface ToastNotification {
    id: string;
    type: ToastNotificationType;
    message: string;
    icon?: ToastNotificationIcon;
    timeout: number;
}

const DEFAULT_TIMEOUT = 3000
const createId = () => Math.random().toString(36).substring(2, 9);

function createNotificationStore() {
    const notificationStore = writable<ToastNotification[]>([]);

    function send(
        message: string,
        type: ToastNotificationType = 'info',
        timeout = DEFAULT_TIMEOUT,
        icon?: ToastNotificationIcon,
    ) {
        const newToast = { id: createId(), type, message, timeout, icon };
        notificationStore.update(state => {
            return [...state, newToast]
        });
        setTimeout(() => {
            notificationStore.update(state => state.filter(t => t.id !== newToast.id))
        }, timeout);
    }

    return {
        store: notificationStore,
        send,
        info: (msg: string, timeout = DEFAULT_TIMEOUT) => send(msg, 'info', timeout, 'info'),
        success:  (msg: string, timeout = DEFAULT_TIMEOUT) => send(msg, 'success', timeout, 'check'),
        warning: (msg: string, timeout = DEFAULT_TIMEOUT) => send(msg, 'warning', timeout, 'error'),
        error: (msg: string, timeout = DEFAULT_TIMEOUT) => send(msg, 'error', timeout, 'close'),
    }
}

const notify = createNotificationStore();

export default notify;
