import { XpictError } from "./error"

export type XpictCanvas = HTMLCanvasElement | OffscreenCanvas

export type XpictContext = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D

export type XpictImage = ImageBitmap | HTMLImageElement | XpictCanvas

export type ImageSource = string | URL | Blob | ArrayBuffer | ArrayBufferView | XpictImage

export function createCanvas(width: number, height: number): XpictCanvas {
    if (typeof document !== "undefined") {
        const canvas = document.createElement("canvas")
        canvas.width = width
        canvas.height = height
        return canvas
    }

    return new OffscreenCanvas(width, height)
}

export function getContext(canvas: XpictCanvas): XpictContext {
    const ctx = canvas.getContext("2d") as XpictContext | null

    if (!ctx) {
        throw new XpictError("Failed to get a 2D context from the canvas")
    }

    return ctx
}

export function getImageSize(image: XpictImage) {
    if (typeof HTMLImageElement !== "undefined" && image instanceof HTMLImageElement) {
        return { width: image.naturalWidth, height: image.naturalHeight }
    }

    return { width: image.width, height: image.height }
}

export async function loadImage(source: ImageSource): Promise<XpictImage> {
    if (typeof source === "string" || source instanceof URL) {
        const response = await fetch(source)

        if (!response.ok) {
            throw new XpictError(`Failed to load image (${String(source)}): HTTP ${response.status}`)
        }

        return createImageBitmap(await response.blob())
    }

    if (source instanceof Blob) {
        return createImageBitmap(source)
    }

    if (source instanceof ArrayBuffer || ArrayBuffer.isView(source)) {
        return createImageBitmap(new Blob([source as BlobPart]))
    }

    return source
}

export async function canvasToBlob(canvas: XpictCanvas, type = "image/png", quality?: number): Promise<Blob> {
    if ("convertToBlob" in canvas) {
        return canvas.convertToBlob({ type, quality })
    }

    return new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
            (blob) => (blob ? resolve(blob) : reject(new XpictError("Failed to convert canvas to Blob"))),
            type,
            quality,
        )
    })
}
