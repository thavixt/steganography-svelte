/**
 * Common helper types
 */
type ClickEvent<T = HTMLButtonElement> = (
	event: Event & { currentTarget: EventTarget & T }
) => void;
type DOMEvent<T = HTMLInputElement> = Event & { target: EventTarget & T; currentTarget: EventTarget & T };
type EventParam<E extends Event = Event, T extends EventTarget = HTMLElement> = E & { currentTarget: EventTarget & T};

/**
 * Text stuff
 */
interface TextData {
    length: number;
    buffer: ArrayBufferLike;
}

/**
 * Image stuff
 */
interface RGBA {
    r: number;
    g: number;
    b: number;
    a: number;
}

/**
 * Shared worker-related stuff
 */
interface WorkerImagePayload {
	height: number;
	width: number;
	buffer: Uint8ClampedArray;
}
interface WorkerTextPayload {
	length: number;
	buffer: Uint8ClampedArray;
}
// Possible base response messages from a worker
interface WorkerMessage {
    progress?: number;
    error?: string;
};

/**
 * Decode worker
 */
// postMessage to decode.worker.ts
type DecodePayload = {
	image: WorkerImagePayload;
	mode: 'image' | 'text';
};
// postMessage from decode.worker.ts
interface DecodeWorkerData extends WorkerMessage {
	doneMs?: number;
	result?:
		| {
				type: 'image';
				// name: string;
				width: number;
				height: number;
				buffer: ArrayBuffer;
				// byteLength: number;
		  }
		| {
				type: 'text';
				buffer: ArrayBuffer;
				// byteLength: number;
		  };
}

/**
 * Encode worker
 */
// postMessage to encode.worker.ts
type EncodePayload =
	| {
			image: WorkerImagePayload;
			payload: WorkerImagePayload;
			mode: 'image';
	  }
	| {
			image: WorkerImagePayload;
			payload: WorkerTextPayload;
			mode: 'text';
	  };
// postMessage from encode.worker.ts
interface EncodeWorkerData extends WorkerMessage {
	doneMs?: number;
	result?: {
		type: 'image';
		// name: string;
		width: number;
		height: number;
		buffer: ArrayBuffer;
		// byteLength: number;
	};
}


/**
 * Compare/Diff worker
 */
// postMessage to compare.worker.ts
interface ComparePayload {
	first: WorkerImagePayload;
	second: WorkerImagePayload;
	diffColor: RGBA;
	mode: 'image';
}
// postMessage from compare.worker.ts
interface CompareWorkerData extends WorkerMessage {
	doneMs?: number;
	result?: {
		type: 'image';
		// name: string;
		width: number;
		height: number;
		buffer: ArrayBuffer;
		// byteLength: number;
	};
}
