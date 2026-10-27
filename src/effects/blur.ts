import { TransformOptions } from "../layers/image-layer"
import { createCanvas, getContext } from "../canvas"

export function blur<Data>(radius: number) {
    return ({ canvas, ctx }: TransformOptions<Data>) => {
        if (radius <= 0) return

        const tempCanvas = createCanvas(canvas.width, canvas.height)
        const tempCtx = getContext(tempCanvas)
        tempCtx.drawImage(canvas, 0, 0)

        ctx.save()
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.filter = `blur(${radius}px)`
        ctx.drawImage(tempCanvas, 0, 0)
        ctx.restore()
    }
}
