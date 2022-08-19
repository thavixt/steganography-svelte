<script lang="ts">
	import { createEventDispatcher } from 'svelte';
    import Button from '../components/common/Button.svelte';
	import Icon from '../components/common/Icon.svelte';
	import notify from '../logic/notify';

    export let input = false;
    export let output = false;
    
	interface DispatchEvents {
		onTextInput: TextData | null;
	}
	const dispatch = createEventDispatcher<DispatchEvents>();

	let textArea: HTMLTextAreaElement;
    $: currentText = '';

	function clearText() {
        currentText = '';
		if (!textArea) {
			return;
		}
		dispatch('onTextInput', null);
        textArea.value = '';
		return;
	}

    function onInput(e: any) {
		const file = e.target.files[0];
		if (!file) {
			clearText();
			return;
		}
        const reader = new FileReader();
        reader.onload = () => {
            const textContent = reader.result;
            if (typeof textContent === 'string') {
                currentText = textContent;
                textArea.value = textContent;
                const encoder = new TextEncoder();
                const textData: TextData = {
                    buffer: encoder.encode(textContent).buffer,
                    length: textContent.length,
                };
                dispatch('onTextInput', textData);
            } else {
                notify.error(StegoError.READ_FILE);
            }
        }
        reader.readAsText(file);
	}

    function onChange(e: any) {
        if (e.target) {
            currentText = e.target.value;
            const encoder = new TextEncoder();
            const textData: TextData = {
                buffer: encoder.encode(currentText).buffer,
                length: currentText.length,
            };
            dispatch('onTextInput', textData);
        }
	}

    const downloadText = async () => {
        if (!currentText) {
            notify.error(StegoError.NOTHING_TO_DL)
            return;
        }
        var link = document.createElement('a');
        link.download = `stegojs_text_${(Math.random() * 1_000_000).toFixed()}.txt`;
        link.href = `data:text/plain;charset=utf-8,${encodeURIComponent(currentText)}`;
        link.click();
    }

	export const loadText = (text: ArrayBufferLike | null) => {
		if (!text) {
			clearText();
			return;
		}
		if (!textArea) {
			return;
		}
        const decodedText = (new TextDecoder()).decode(text);
        currentText = decodedText;
        if (currentText.length > 200) {
            textArea.value = 'This document is too long to display - press the "Download" button below!';
        } else {
            textArea.value = decodedText;
        }
	};
</script>

<div class="flex flex-col space-y-2 my-2">
    <slot/>
    <slot name="description"/>
    <div class="flex flex-col justify-center items-center">
        <textarea 
            class="border-2 mb-2 p-2 h-[170px] w-[320px] bg-white text-sm font-mono" 
            bind:this={textArea} 
            on:change={onChange}
        />
        {#if input}
            <input class="w-full" on:input={onInput} type="file" />
        {/if}
        {#if output}
            <Button style="w-full mt-4" onClick={downloadText} disabled={!currentText}>
                Download <Icon icon="dl"/>
            </Button>
        {/if}
    </div>
</div>
