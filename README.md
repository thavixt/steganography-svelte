# Steganogryphy - Svelte

Basic web app to be used for steganograpy.

This repo is actually a remake of my original steganography app found [here](https://github.com/thavixt/steganography-js), but made with Svelte, to try out the current Svelte Kit.

## TODO

Fixes:

- [ ] handle transfering back the original buffers on worker answers
  - this is to fix ex: `decode.svelte:30 Uncaught DOMException: Failed to execute 'postMessage' on 'Worker': ArrayBuffer at index 0 is already detached.`

Improvements:

- [x] create some basic ui/layout components for better reusability
- [ ] notification placements should be fixed
- [ ] jump to the progress bar on starting a process
- [ ] have proper error message handling
  - should be using enums maybe? instead of just a string union type
