import { afterEach, describe, expect, it, vi } from "vitest"

import { canvasToBlob, createCanvas, getContext, getImageSize, loadImage, XpictError } from "../src"
import { dataUrl, solidPng } from "./helpers"
import xpict from "../src"

describe("canvas helpers", () => {
    afterEach(() => vi.unstubAllGlobals())

    it("creates an OffscreenCanvas when there is no document", () => {
        const canvas = createCanvas(4, 3)
        expect([canvas.width, canvas.height]).toEqual([4, 3])
    })

    it("creates an HTMLCanvasElement when a document exists", () => {
        const el = { width: 0, height: 0 }
        vi.stubGlobal("document", { createElement: vi.fn(() => el) })
        expect(createCanvas(5, 6)).toBe(el)
        expect([el.width, el.height]).toEqual([5, 6])
    })

    it("throws when the 2d context is unavailable", () => {
        expect(() => getContext({ getContext: () => null } as any)).toThrow(XpictError)
    })

    it("reads the natural size of HTMLImageElement", () => {
        class FakeImg {
            naturalWidth = 7
            naturalHeight = 9
        }
        vi.stubGlobal("HTMLImageElement", FakeImg)
        expect(getImageSize(new FakeImg() as any)).toEqual({ width: 7, height: 9 })
        expect(getImageSize({ width: 2, height: 3 } as any)).toEqual({ width: 2, height: 3 })
    })

    it("loads images from URL strings, URL objects, blobs and binary data", async () => {
        const png = solidPng(4, 2)
        for (const source of [
            dataUrl(png),
            new URL(dataUrl(png)),
            new Blob([png]),
            png,
            png.buffer.slice(png.byteOffset, png.byteOffset + png.byteLength),
        ]) {
            expect(getImageSize(await loadImage(source as any))).toEqual({ width: 4, height: 2 })
        }
    })

    it("passes ready-made images and canvases through", async () => {
        const canvas = createCanvas(2, 2)
        expect(await loadImage(canvas)).toBe(canvas)
    })

    it("rejects when the request fails", async () => {
        vi.stubGlobal("fetch", async () => ({ ok: false, status: 404 }))
        await expect(loadImage("https://x/y.png")).rejects.toBeInstanceOf(XpictError)
    })

    it("converts canvases to blobs (OffscreenCanvas and HTMLCanvasElement flavours)", async () => {
        const blob = await canvasToBlob(createCanvas(2, 2))
        expect(blob.type).toBe("image/png")

        const html = { toBlob: (cb: (b: Blob | null) => void) => cb(new Blob(["x"])) }
        expect(await canvasToBlob(html as any)).toBeInstanceOf(Blob)

        const failing = { toBlob: (cb: (b: Blob | null) => void) => cb(null) }
        await expect(canvasToBlob(failing as any)).rejects.toBeInstanceOf(XpictError)
    })

    it("renders a template straight to a blob", async () => {
        const t = xpict.template<object>({ config: { width: 3, height: 3, fill: "#f00" }, layers: [] })
        expect((await t.renderToBlob({})).size).toBeGreaterThan(0)
    })
})
