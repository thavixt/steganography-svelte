const LOG_FREQUENCY = 50;

/**
 * Get a chunk of 4 bites from the start index
 */
const getChunk = (uint8: Uint8ClampedArray, start: number) => {
    return uint8.slice(start, start + 4);
};

/**
* Process an RGBA pixel:
* 1. get the last two bits of each byte (4 * 2 bits),
* 2. concatenate them into a byte (1 byte),
* 3. parse this byte into a decimal and return it.
*/
function getDataFromPixel(chunk: Uint8ClampedArray): number {
    // Get pixel data as 4 * 8bits
    // (1 pixel = RGBA => every 4 elements of the array)
    const numChunk = Array.from(chunk);
    const pixel = numChunk.map((n) => n.toString(2).padStart(8, "0"));
    // Concatenate the last 2 bits of every RGBA component's value into a byte
    const byte = pixel.reduce((prev, cur) => `${prev}${cur.slice(-2)}`, '');
    // Convert this byte to a decimal to get the Unicode representation
    return parseInt(byte, 2);
}

/**
* Steganographic decoder function running in a Web Worker.
* 
* Recives a transferred arrayBuffer object from the main thread and performs the following operations:
* 
* 1. Create a View of the arrayBuffer.
* 2. Loop through the view with increments of 4.
* 3. For each 4 elements, convert the RGBA values into binary (4 * 8 bits per loop).
*      * get the last two bits of each byte (4 * 2 bits per loop).
*      * concatenate them into a byte (1 byte per loop).
*      * parse this byte into a decimal, then get the correspong Unicode character (1 char per loop).
* 4. Push all resulting characters into an array, and transfer the array back to the main thread.
*/
function decodeToText(imgData: WorkerImagePayload) {
    const progressThreshold = Math.round(imgData.buffer.byteLength / LOG_FREQUENCY);
    const start = performance.now();
    self.postMessage({ progress: 0 });

    const charArray = [];
    const view = new Uint8ClampedArray(imgData.buffer);

    const length = (imgData.height * imgData.width) * 4;
    for (let i = 0; i < length; i += 4) {
        // Get pixel data as 4 * 8bits
        // (1 pixel = RGBA => every 4 elements of the array)
        const pixel = view.slice(i, i+4);
        // Get the character from the Unicode representation
        const char = String.fromCharCode(getDataFromPixel(pixel));
        charArray.push(char);
        // Advance the progress bar between 5-95
        if (!(i % progressThreshold)) {
            self.postMessage({
                progress: Math.round((i / length) * 100),
            });
        }
    }

    const time = Math.round(performance.now() - start);
    const string = charArray.join("");
    const uint8 = new TextEncoder().encode(string);

    // Transfer resulting arrayBuffer back to the main thread
    // console.log('Decode worker finished');
    self.postMessage({
        doneMs: time,
        result: {
            type: "text",
            buffer: uint8.buffer,
            // byteLength: uint8.buffer.byteLength,
        },
    }, [uint8.buffer]);
}

/**
* Steganographic decoder function running in a Web Worker.
* 
* Recives a transferred arrayBuffer object from the main thread and performs the following operations:
* 
* 1. Create a View of the arrayBuffer.
* 2. Loop through the view and create 2x2 pixel chunks.
* 3. Process each chunk of pixels:
*      * convert the RGBA values into binary (4 * 8 bits per loop).
*      * get the last two bits of each byte (4 * 2 bits per loop).
*      * concatenate them into a byte (1 byte per loop).
*      * (4x creates and RGBA pixel)
* 4. Push all bytes into an arrayBuffer
* 5. Transfer the resulting arrayBuffer back to the main thread
*/
function decodeToImage(imgData: WorkerImagePayload) {
    const progressThreshold = Math.round(imgData.height / LOG_FREQUENCY);
    const start = performance.now();
    self.postMessage({ progress: 0 });

    const newWidth = Math.floor(imgData.width / 2);
    const newHeight = Math.floor(imgData.height / 2);
    const newImgData = new ImageData(newWidth, newHeight);
    const view = new Uint8ClampedArray(imgData.buffer);

    let curW = 0;
    let curH = 0;
    let newIndex = 0;

    // Slice into 2x2 pixel chunks
    for (let h = 0; h < imgData.height - 1; h += 2) { // Step 2 pixels down
        curH = h * imgData.width * 4;
        // Start from the beginning of the row
        for (let w = 0; w < imgData.width - 1; w += 2) { // Step 2 pixels right
            curW = curH + w * 4;
            // Process the next 2x2 pixel block
            // Top left pixel
            newImgData.data[newIndex] = getDataFromPixel(
                getChunk(view, curW),
            );
            newIndex++;
            // Top right pixel
            newImgData.data[newIndex] = getDataFromPixel(
                getChunk(view, curW + 4),
            );
            newIndex++;
            // Bottom left pixel
            newImgData.data[newIndex] = getDataFromPixel(
                getChunk(view, (imgData.width * 4) + curW),
            );
            newIndex++;
            // Bottom right pixel
            newImgData.data[newIndex] = getDataFromPixel(
                getChunk(view, (imgData.width * 4) + curW + 4),
            );
            newIndex++;
        }
        // Advance the progress bar between 5-95
        if (!(h % progressThreshold)) {
            self.postMessage({
                progress: Math.round((h / imgData.height) * 100),
            });
        }
    }

    const time = Math.round(performance.now() - start);
    const uint8 = newImgData.data;

    // Transfer resulting arrayBuffer back to the main thread
    // console.log('Decode worker finished');
    self.postMessage({
        doneMs: time,
        result: {
            type: "image",
            width: newWidth,
            height: newHeight,
            buffer: uint8.buffer,
            // byteLength: uint8.buffer.byteLength,
        },
    }, [uint8.buffer]);
}

/**
* Handle messages coming from the main thread
*/
function handler(e: MessageEvent<DecodePayload>) {
    // console.log('Decode worker started', e.data);
    if (e.data) {
        if (e.data.mode === "image") {
            decodeToImage(e.data.image);
        } else if (e.data.mode === "text") {
            decodeToText(e.data.image);
        } else {
            console.error("No compatible process type found.");
            self.postMessage({ error: "No compatible processing type found." });
        }
    }
}

globalThis.addEventListener('message', handler);

// https://vitejs.dev/guide/features.html#web-workers
export {}
