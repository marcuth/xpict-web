import { createCanvas, loadImage } from "@napi-rs/canvas"

// Minimal browser API shims backed by @napi-rs/canvas so the suite can run under Node.
class FakeOffscreenCanvas {
    constructor(width: number, height: number) {
        const canvas: any = createCanvas(width, height)
        canvas.convertToBlob = async ({ type = "image/png" }: { type?: string } = {}) =>
            new Blob([canvas.toBuffer("image/png")], { type })
        return canvas
    }
}

;(globalThis as any).OffscreenCanvas = FakeOffscreenCanvas
;(globalThis as any).createImageBitmap = async (blob: Blob) => loadImage(Buffer.from(await blob.arrayBuffer()))
