import { TransformOptions } from "../layers/image-layer"
import { createCanvas, getContext } from "../canvas"

export function grayscale<Data>(amount: number = 100) {
    return ({ canvas, ctx }: TransformOptions<Data>) => {
        if (amount <= 0) return

        const tempCanvas = createCanvas(canvas.width, canvas.height)
        const tempCtx = getContext(tempCanvas)
        tempCtx.drawImage(canvas, 0, 0)

        ctx.save()
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.filter = `grayscale(${amount}%)`
        ctx.drawImage(tempCanvas, 0, 0)
        ctx.restore()
    }
}
