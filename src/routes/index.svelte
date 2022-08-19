<script lang="ts">
	import Box from '../components/common/Box.svelte';
	import Code from '../components/common/Code.svelte';
	import Heading from '../components/common/Heading.svelte';
	import Quote from '../components/common/Quote.svelte';
	import PixelExample from '../components/PixelExample.svelte';
</script>

<div class="space-y-8 max-w-6xl">
    <Heading>Digital steganography</Heading>
	<div class="grid md:grid-cols-2 grid-cols-1 gap-x-12 gap-y-0">
		<Box>
			<p>
				Steganography includes the concealment of information within computer files. In digital
				steganography, electronic communications may include steganographic coding inside of a
				transport layer, such as a document file, image file, program or protocol. Media files are
				ideal for steganographic transmission because of their large size.
			</p>
			<p>
				For example, a sender might start with an innocuous image file and adjust the color of every
				100th pixel to correspond to a letter in the alphabet, a change so subtle that someone not
				specifically looking for it is unlikely to notice it.
			</p>
            <p>
                <em>Steganographix</em> is a web app that utilizes the below described processes to allow anyone to
                create, discover, and compare steganographic media files.
                <Quote>
                    Currently, this application only works with images (preferably <code>.bmp</code> files), but keep
                    an eye out for future improvements! The next goal is to handle audio files in a similar manner.
                </Quote>
            </p>
		</Box>
		<Box>
			<p>
				<strong>Steganography</strong>
				is the practice of concealing a file, message, image, or video within another file, message,
				image, or video.
			</p>
			<p>
				The advantage of steganography over cryptography alone is that the intended secret message
				does not attract attention to itself as an object of scrutiny. Plainly visible encrypted
				messages — no matter how unbreakable — arouse interest, and may in themselves be
				incriminating in countries where encryption is illegal. Thus, whereas cryptography is the
				practice of protecting the contents of a message alone, steganography is <strong
					>concerned with concealing the fact that a secret message is being sent at all</strong
				>, as well as concealing the contents of the message itself.
			</p>
			<p>Read below about this application's implementation of digital steganography.</p>
			<small>source: WikiPedia</small>
		</Box>
	</div>
	<div>
		<Heading>How is it done?</Heading>
		<p>This section covers the process of encoding and decoding text from a steganograpic image with an example.</p>
	</div>
	<div class="grid md:grid-cols-2 grid-cols-1 gap-12">
		<Box>
            <div>
			    <Heading inline>Decoding</Heading>
			    <Heading inline level={4}>- Reading the hidden data</Heading>
            </div>
			<Box>
                <Heading level={5} mb0>Step 1:</Heading>
                <p>
                    We draw the selected image to a canvas (sometimes in the background), then read it pixel-by-pixel.
                    Each pixel is stored as an array of four 8bit values: red, green, blue and alpha (transparency)
                    respectively.
                </p>
                <Code>[125, 48, 210, 255]</Code>
            </Box>
			<Box>
                <Heading level={5} mb0>Step 2:</Heading>
                <p>These values are then converted to binary.</p>
                <Code>[01111101, 00110000, 11010010, 11111111]</Code>
            </Box>
			<Box>
                <Heading level={5} mb0>Step 3:</Heading>
                <p>We extract the <em>steganographic</em> data by taking the last 2 bits of every byte of each pixel.</p>
                <Code>[01111101, 00110000, 11010010, 11111111]
[      01,       00,       10,       11]</Code>
            </Box>
			<Box>
                <Heading level={5} mb0>Step 4:</Heading>
                <p>The two least significant, steganographic bits are concatenated in pairs of 4 into 1 bytes each.</p>
                <Code>[...01, ...00, ...10, ...11] => 01001011</Code>
            </Box>
			<Box>
                <Heading level={5} mb0>Step 5:</Heading>
                <p>
                    Finally, the bytes are cast to integers, then converted to the appropriate ASCII characters,
                    revealing the steganographic data hidden in the image (if there is any).
                </p>
                <Code>01001011 => 075 => K</Code>
            </Box>
		</Box>
		<Box>
            <div>
			    <Heading inline>Encoding</Heading>
			    <Heading inline level={4}>- Hiding your own data</Heading>
            </div>
			<Box>
                <Heading level={5} mb0>Step 1:</Heading>
                <p>
                    Each character of the message is converted to the ASCII number representation of it,
                    then cast to a single byte.
                </p>
                <Code>a => 097 => 01100001</Code>
            </Box>
			<Box>
                <Heading level={5} mb0>Step 2:</Heading>
                <p>Each byte is cut into 4*2 bits</p>
                <Code>01100001 => 01, 10, 00, 01</Code>
            </Box>
			<Box>
                <Heading level={5} mb0>Step 3:</Heading>
                <p>
                    During the decoding proccess, we stored the 8bit representation of the rgba data of each pixel in
                    the original image to avoid parsing it twice. The bit-pairs from the last step replace the last two
                    bits of every byte in the original image.
                </p>
                <Code>original: 01111101, 00110000, 11010010, 11111111
message:        01,       10,       00,       01
new:      01111101, 00110010, 11010000, 11111101
                </Code>
            </Box>
			<Box>
                <Heading level={5} mb0>Step 4:</Heading>
                <p>
                    The new byte data (with the message injected) is cast to the <em>red</em>, <em>green</em>,
                    <em>blue</em> and <em>alpha</em> channels' integer values. The resulting objects can then be drawn
                    onto the canvas as pixels of the new, steganographic image.
                </p>
                <Code>[125, 50, 208, 253]</Code>
            </Box>
			<Box>
                <Heading level={5} mb0>Step 5:</Heading>
                <p>
                    Comparing a pixel from the original image with the same pixel injected with one character of the
                    secret message, we can see that the rgb color and alpha values have not changed drastically.
                    This change is mostly undetectable by the human eye.
                </p>
                <Code>original:  <PixelExample color="#8030d2"/> [125, 48, 210, 255]
new:       <PixelExample color="#7d32d0"/> [125, 50, 208, 253]
                </Code>
            </Box>
		</Box>
	</div>
</div>
