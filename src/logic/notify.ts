import { writable } from "svelte/store"
import type { StegoError } from "../errors";

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

    function show(
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
        show,
        info: (msg: string, timeout = DEFAULT_TIMEOUT) => show(msg, 'info', timeout, 'info'),
        success:  (msg: string, timeout = DEFAULT_TIMEOUT) => show(msg, 'success', timeout, 'check'),
        warning: (msg: string, timeout = DEFAULT_TIMEOUT) => {
            console.warn(`[Steganographix]`, msg);
            show(msg, 'warning', timeout, 'error');
        },
        error: (msg: StegoError | string, timeout = DEFAULT_TIMEOUT) => {
            const errorMessage = getErrorMessage(msg);
            console.error(`[Steganographix]`, errorMessage);
            show(errorMessage, 'error', timeout, 'close');
        },
    }
}

function getErrorMessage(error: StegoError | string) {
    switch (error) {
        case 'PARAMS_MISSING':
            return 'At least on input image or text is missing!';
        case 'NOTHING_TO_DL':
            return 'No image or text output present to download';
        case 'READ_FILE':
            return 'Error while trying to read selected file';
        case 'SIZE_DIFFERENCE':
            return 'Incompatible media sizes!';
        default:
            return `An error happened:\n${error}`;
    }
}

const notify = createNotificationStore();

export default notify;
