import { canvasToBlob, createCanvas, getContext, getImageSize, ImageSource, loadImage, XpictCanvas } from "./canvas"
import { RenderContext } from "./render-context"
import { fontsReady } from "./utils/font"
import { Layer } from "./layers/layer"
import { XpictError } from "./error"

export type TemplateSize = {
    width: number
    height: number
}

export type TemplateConfig = TemplateSize & {
    fill?: string
}

export type InputTemplateOptions<Data> =
    | {
          image?: undefined
          config: TemplateConfig
          layers: Layer<Data>[]
      }
    | {
          config?: undefined
          image: ImageSource
          layers: Layer<Data>[]
      }

export type TemplateOptions<Data> = {
    image?: ImageSource
    config?: TemplateConfig
    layers: Layer<Data>[]
}

export class Template<Data> {
    readonly options: TemplateOptions<Data>

    constructor(options: InputTemplateOptions<Data>) {
        this.options = options
    }

    async render(data: Data): Promise<XpictCanvas> {
        await fontsReady()

        let canvas: XpictCanvas
        let templateConfig: TemplateConfig

        if (this.options.config) {
            const { width, height, fill } = this.options.config
            canvas = createCanvas(width, height)
            templateConfig = this.options.config

            if (fill) {
                const ctx = getContext(canvas)
                ctx.fillStyle = fill
                ctx.fillRect(0, 0, width, height)
            }
        } else if (this.options.image) {
            const backgroundImage = await loadImage(this.options.image)
            const { width, height } = getImageSize(backgroundImage)
            canvas = createCanvas(width, height)
            templateConfig = { width, height }

            getContext(canvas).drawImage(backgroundImage, 0, 0)
        } else {
            throw new XpictError("No config or image provided")
        }

        const ctx = getContext(canvas)

        const renderContext: RenderContext = {
            ctx: ctx,
            offsetX: 0,
            offsetY: 0,
        }

        for (const layer of this.options.layers) {
            if (!layer.shouldRender(data)) continue

            await layer.render({
                context: renderContext,
                data: data,
                templateConfig: templateConfig,
            })
        }

        return canvas
    }

    async renderToBlob(data: Data, type = "image/png", quality?: number): Promise<Blob> {
        return canvasToBlob(await this.render(data), type, quality)
    }
}
