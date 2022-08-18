<script lang="ts">
    $: currentColor = { r:200, g:200, b:200, a:255 } as RGBA;

    function selectColor(e: any) {
        if (e.target) {
            currentColor = { ...hexToRGBA(e.target.value) };
        }
    }
    
    const hexToRGBA = (hexColor: string) => {
        const hex = hexColor.split("#").pop()!;
        const bigint = parseInt(hex, 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return { r, g, b, a: 255 };
    }

    const RGBToHex = (r: number, g: number, b: number) => {
        const hex = "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
        return hex;
    }

    const componentToHex = (c: number) => {
        const hex = c.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    }
</script>

<div class="color-selector">
    Select color:
    <input type="color" onChange={selectColor} value={RGBToHex(150, 0, 100)}/>
    <!-- <span
        className="color-selector-preview"
        style={{
            backgroundColor: `rgba(${Object.values(this.state).join(",")})`,
        }}
    >
    </span> -->
</div>
