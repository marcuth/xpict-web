export type FontOptions = {
    size: number
    color?: string
    name?: string
    weight?: string
}

export type FontConfigOptions = {
    color?: string
    name: string
    /** URL (string) or binary data of the font file, registered through the browser's FontFace API. */
    source?: string | ArrayBuffer | ArrayBufferView
    /** Descriptors passed to FontFace (e.g. `{ weight: "700", style: "italic" }`). */
    descriptors?: FontFaceDescriptors
    weight?: string
}

export type PartialFontOptions = {
    size: number
    color?: string
    weight?: string
}

export type Font = FontOptions

const pendingFonts = new Set<Promise<unknown>>()

/** Resolves once every font registered through `font({ source })` has finished loading. */
export async function fontsReady() {
    await Promise.all(pendingFonts)
}

export function font(options: FontConfigOptions) {
    if (options.source) {
        const source = typeof options.source === "string" ? `url(${JSON.stringify(options.source)})` : options.source
        const fontFace = new FontFace(options.name, source as string | BufferSource, options.descriptors)

        const promise = fontFace.load().then((loaded) => {
            const fonts = (globalThis as any).document?.fonts ?? (globalThis as any).fonts
            fonts.add(loaded)
        })

        const release = () => pendingFonts.delete(promise)

        pendingFonts.add(promise)
        promise.then(release, release)
    }

    return (partialOptions: PartialFontOptions): Font => {
        const {
            source: _source,
            descriptors: _descriptors,
            ...rest
        } = {
            ...options,
            ...partialOptions,
        }

        return rest
    }
}
