const LOG_FREQUENCY = 50;

/**
 * Compare two pixels. If they're not equal, return a new pixel based on the diffColor parameter.
 */
function getDiffPixel(firstPixel: number[], secondPixel: number[], diffColor: number[]): number[] | false {
    const areEqual = firstPixel.join('') === secondPixel.join('');
    if (areEqual) {
        return false;
    }
    // return blendPixels(firstPixel, diffColor);
    // Use the full selected highlight color
    return diffColor;
}

/**
 * Combine (additive mode) two RGBA colors.
 */
function blendPixels(base: number[], added: number[]): number[] {
    const mix = [
        averageColor(base[0], added[0]),
        averageColor(base[1], added[1]),
        averageColor(base[2], added[2]),
        averageColor(base[2], added[2]),
    ];
    // Calculate the blended color
    return constrainColor({
        r: mix[0],
        g: mix[1],
        b: mix[2],
        a: mix[3],
    });
}

/**
 * Average of two color values.
 */
function averageColor(color1: number, color2: number, magnitude = 1): number {
    return Math.round((color1 + color2) / 2 * magnitude);
}

/**
 * Constrain the RGBA values and return an array containing four valid number values.
 */
function constrainColor(diffColorObj: RGBA): number[] {
    const red = constrainChannel(diffColorObj.r);
    const green = constrainChannel(diffColorObj.g);
    const blue = constrainChannel(diffColorObj.b);
    const alpha = constrainChannel(diffColorObj.a);

    return [red, green, blue, alpha];
}
/**
 * Constrain a single pixel channel value to the valid 0-255 range.
 */
function constrainChannel(value: number) {
    return Math.min(Math.max(value, 0), 255);
}

/**
 * Compare two images pixel-by-pixel and return an image with the differing pixels highlighted
 */
function compareImages(
    firstImage: WorkerImagePayload,
    secondImage: WorkerImagePayload,
    diffColor: RGBA = { r: 255, g: 20, b: 144, a: 255 },
) {
    const start = performance.now();
    self.postMessage({ progressBar: 0 });

    // Create a view (iterable array) of the transferred arrayBuffer object
    const firstView = new Uint8ClampedArray(firstImage.buffer);
    const secondView = new Uint8ClampedArray(secondImage.buffer);

    // Determine which image to base the diff on
    // NOTE: For now, only allow same-size images
    if (firstView.length !== secondView.length) {
        // Operation not allowed - size difference
        // Transfer the first image back to the main thread
        self.postMessage({
            error: "SIZE_DIFFERENCE",
            type: "image",
            mode: "image",
        }, [firstImage.buffer, secondImage.buffer]);
        return false;
    }

    // Check if the diffColor is appropriate
    const diffColors = constrainColor(diffColor);
    const LOGINTERVAL = Math.round(firstView.length / LOG_FREQUENCY) * 2;

    for (let index = 0; index < firstView.length; index += 4) {
        // Process the two pixels at the same index
        const diffPixel = getDiffPixel(
            [
                firstView[index],
                firstView[index + 1],
                firstView[index + 2],
                firstView[index + 3],
            ],
            [
                secondView[index],
                secondView[index + 1],
                secondView[index + 2],
                secondView[index + 3],
            ],
            diffColors,
        );

        if (diffPixel) {
            // Set the new pixel
            firstView[index] = diffPixel[0];
            firstView[index + 1] = diffPixel[1];
            firstView[index + 2] = diffPixel[2];
            firstView[index + 3] = diffPixel[3];
        }

        if (index % LOGINTERVAL === 0) {
            self.postMessage(
                { progress: Math.round(100 * index / firstView.length) },
            );
        }
    }

    const time = Math.round(performance.now() - start);

    // Transfer resulting arrayBuffer back to the main thread
    self.postMessage({
        doneMs: time,
        result: {
            type: "image",
            width: firstImage.width,
            height: firstImage.height,
            buffer: firstView.buffer,
            // byteLength: firstView.buffer.byteLength,
        },
    }, [firstImage.buffer, secondImage.buffer, firstView.buffer]);
}

/**
 * Handle messages coming from the main thread
 */
function handler(e: MessageEvent<ComparePayload>) {
    // console.log('Compare worker started', e.data);
    if (e.data.mode == "image") {
        compareImages(e.data.first, e.data.second, e.data.diffColor);
    } else {
        console.error("No compatible processing type found.");
        self.postMessage({ error: "No compatible processing type found." });
    }
    return;
}

globalThis.addEventListener('message', handler);

// https://vitejs.dev/guide/features.html#web-workers
export {}
