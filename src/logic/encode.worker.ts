const LOG_FREQUENCY = 50;

/**
 * Swap the last two bits of the source number with the provided 2bit message.
 */
function swapLSB(decimalSource: number, message: string) {
    const binarySource = decimalSource.toString(2).padStart(8, "0");
    const binaryResult = binarySource.slice(0, 6) + message[0] + message[1];
    const decimalResult = parseInt(binaryResult, 2);
    return decimalResult;
}

/**
 * Steganographic encoder function running in a Web Worker.
 * 
 * Recives a message string and a transferred arrayBuffer object from the main thread 
 * and performs the following operations:
 * 
 * 1. Create a View of the arrayBuffer to make changes on
 * 2. Map the message string to a byte array
 * 3. Loop through the View, and for each element:
 *      * get the current RGBA values
 *      * for each value:
 *          * convert to binary
 *          * swap the last 2 bits with the next 2 bits of the message
 *          * convert back to uint8
 * 4. Transfer the arrayBuffer back to the main thread
 */
function encodeText(imgData: WorkerImagePayload, message: WorkerTextPayload) {
    const start = performance.now();
    self.postMessage({ progress: 0 });

    const stringView = new DataView(message.buffer, 0, message.buffer.byteLength);
    const textDecoder = new TextDecoder();
    const messageString = textDecoder.decode(stringView);
    // Parse the decoded text into a JSON object then split into an array
    const charArray: string[] = messageString.split("");
    console.log('charArray', charArray);
    // Create a view (iterable array) of the transferred arrayBuffer object
    const view = new Uint8ClampedArray(imgData.buffer);

    // Create an array based in the Unicode representation of the message's characters
    const bitPairs: string[] = [];
    charArray.forEach((x) => {
        // Pad to 8 bits
        // Get the Unicode value for x, then convert it to binary
        const byte: string = x.charCodeAt(0).toString(2).padStart(8, "0")
        // Push to the array in 2bit parts
        bitPairs.push(byte[0] + byte[1]);
        bitPairs.push(byte[2] + byte[3]);
        bitPairs.push(byte[4] + byte[5]);
        bitPairs.push(byte[6] + byte[7]);
    });

    // Calculate the loop count
    const loopLimit = Math.min(view.length, bitPairs.length);
    const LOGINTERVAL = (loopLimit / LOG_FREQUENCY);

    // Set new values
    for (let i = 0; i < loopLimit; i++) {
        // Get the first 6 bit pairs of the current R/G/B/A value
        const oldByteMSB = view[i].toString(2).padStart(8, "0").slice(0, 6);
        // Set the 2 LSB bit-pairs to the bits from the payload
        view[i] = parseInt(`${oldByteMSB}${bitPairs[i]}`, 2);

        if (!(i % LOGINTERVAL)) {
            self.postMessage({ progress: Math.round(100 * i / loopLimit) });
        }
    }
    const time = Math.round(performance.now() - start);

    // Transfer resulting buffer back to the main thread
    console.log('Encode worker finished');
    postMessage({
        doneMs: time,
        type: "text",
        result: {
            width: imgData.width,
            height: imgData.height,
            buffer: view.buffer,
            // byteLength: view.buffer.byteLength,
        },
    }, [view.buffer]);
}

/**
 * Steganographic encoder function running in a Web Worker.
 * 
 * Recives two transferred arrayBuffer objects from the main thread 
 * and performs the following operations:
 * 
 * 1. Create a View of the arrayBuffer to make changes on
 * 2. Create a View of the message buffer
 * 3. Process the source view in 2x2 pixel chunks
 * 4. Loop through the chunks, and for each element of them:
 *      * get the current RGBA values
 *      * for each value:
 *          * convert to binary
 *          * swap the last 2 bits with the next 2 bits of the message
 *          * convert back to uint8
 * 5. Transfer the arrayBuffer back to the main thread
 */
function encodeImage(source: WorkerImagePayload, payload: WorkerImagePayload) {
    const start = performance.now();
    self.postMessage({ progress: 0 });

    // Create a view (iterable array) of the transferred arrayBuffer objects
    const sourceView = new Uint8ClampedArray(source.buffer);
    const payloadView = new Uint8ClampedArray(payload.buffer);

    // Stage 1

    const bitPairs: string[] = [];
    const bitPairProgressLogThreshold = Math.round(payloadView.length / 20);
    let bitPairProgress = 0;
    for (let i = 0; i < payloadView.length; i++) {
        // Pad binary to 8 bits
        const byte = payloadView[i].toString(2).padStart(8, "0");
        // Push to the array in 2bit parts
        bitPairs.push(byte[0] + byte[1]);
        bitPairs.push(byte[2] + byte[3]);
        bitPairs.push(byte[4] + byte[5]);
        bitPairs.push(byte[6] + byte[7]);
        if (!(i % bitPairProgressLogThreshold)) {
            bitPairProgress++;
            self.postMessage({ progress: bitPairProgress });
        }
    }
    self.postMessage({progress: 20});

    // Stage 2

    // Calculate the loop count
    const loopLimit = Math.min(source.height - 1, payload.height * 2);
    const LOGINTERVAL = Math.round(loopLimit / LOG_FREQUENCY) * 2;

    let bpIndex = 0;
    let index = 0;
    let curW = 0;
    let curH = 0; // Pixel coordinates

    // Set new values
    // Slice into 2x2 pixel chunks
    for (
        let h = 0;
        ((h < source.height - 1) && (h < payload.height * 2));
        h += 2
    ) { // Step 2 pixels down
        curH = h * source.width * 4;

        for (
            let w = 0;
            ((w < source.width - 1) && (w < payload.width * 2));
            w += 2
        ) { // Step 2 pixels right
            curW = curH + w * 4;

            // Top left pixel
            index = curW;
            for (let i = 0; i < 4; i++) {
                sourceView[index + i] = swapLSB(
                    sourceView[index + i],
                    bitPairs[bpIndex],
                );
                bpIndex++;
            }
            // Top right pixel
            index = curW + 4;
            for (let i = 0; i < 4; i++) {
                sourceView[index + i] = swapLSB(
                    sourceView[index + i],
                    bitPairs[bpIndex],
                );
                bpIndex++;
            }
            // Bottom left pixel
            index = (source.width * 4) + curW;
            for (let i = 0; i < 4; i++) {
                sourceView[index + i] = swapLSB(
                    sourceView[index + i],
                    bitPairs[bpIndex],
                );
                bpIndex++;
            }
            // Bottom right pixel
            index = (source.width * 4) + curW + 4;
            for (let i = 0; i < 4; i++) {
                sourceView[index + i] = swapLSB(
                    sourceView[index + i],
                    bitPairs[bpIndex],
                );
                bpIndex++;
            }
        }

        if (!(h % LOGINTERVAL)) {
            self.postMessage({ progress: 20 + Math.round(80 * h / loopLimit) });
        }
    }

    const time = Math.round(performance.now() - start);

    // Transfer resulting buffer back to the main thread
    console.log('Encode worker finished');
    postMessage({
        doneMs: time,
        type: "image",
        result: {
            width: source.width,
            height: source.height,
            buffer: sourceView.buffer,
            // byteLength: sourceView.buffer.byteLength,
        },
    }, [sourceView.buffer]);
}

/**
* Handle messages coming from the main thread
*/
function handler(e: MessageEvent<EncodePayload>) {
    console.log('Encode worker started', e.data);
    if (e.data) {
        if (e.data.mode === "text") {
            encodeText(e.data.image, e.data.payload);
        } else if (e.data.mode === "image") {
            encodeImage(e.data.image, e.data.payload);
        } else {
            console.error("No compatible process type found.");
        }
        return;
    }
}

globalThis.addEventListener('message', handler);

// https://vitejs.dev/guide/features.html#web-workers
export {}
