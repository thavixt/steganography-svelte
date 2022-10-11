/**
 * Notify - Error messages
 */
// Are enums just not working right with SvelteKit ???
export enum StegoError {
    NOTHING_TO_DL = 'Nothing to download',
    PARAMS_MISSING = 'A parameter is missing',
    READ_FILE = 'Error while reading file',
    SIZE_DIFFERENCE = 'Incompatible sizes',
}
// using string error codes for now...
// type StegoError = 'NOTHIND_TO_DL'|'PARAMS_MISSING'|'READ_FILE'|'SIZE_DIFFERENCE';
