import { writable } from "svelte/store"
import { StegoError } from "../errors";

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
        catch: (e: Error | StegoError | unknown) => {
            // FIXME: hack...
            // should accept anything, and display an error on the UI
            const message = e instanceof Error ? e.message : (e?.toString() ?? e as string);
            show(message, 'error', DEFAULT_TIMEOUT, 'close');
            // returns a value to save one line in catch clauses where the scope expects a return value
            return null;
        }
    }
}

function getErrorMessage(error: StegoError | string) {
    switch (error) {
        case StegoError.PARAMS_MISSING:
            return 'An input image or text is was not found';
        case StegoError.NOTHING_TO_DL:
            return 'No image or text output present to download';
        case StegoError.READ_FILE:
            return 'Error while trying to read selected file';
        case StegoError.SIZE_DIFFERENCE:
            return 'Incompatible media sizes!';
        default:
            return `An error happened:\n${error}`;
    }
}

const notify = createNotificationStore();

export default notify;
