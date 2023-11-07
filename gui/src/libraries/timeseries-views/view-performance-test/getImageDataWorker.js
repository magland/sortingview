const drawSquiggleLine = (context, x0, y0, y1, numSquiggles) => {
    context.beginPath()
    context.moveTo(x0, y0)
    for (let i = 1; i <= numSquiggles; i++) {
        const dx = i % 2 === 0 ? 10 : -10
        context.lineTo(x0 + dx, y0 + (y1 - y0) * (i / numSquiggles))
    }
    context.stroke()
}

onmessage = (e) => {
    const {filteredColors, pixelTimes, margins, numSquiggles, panelWidth, panelHeight} = e.data
    const cc = new OffscreenCanvas(panelWidth, panelHeight)
    const context2 = cc.getContext('2d')
    if (!context2) return
    pixelTimes.forEach((t, i) => {
        context2.strokeStyle = filteredColors[i]
        drawSquiggleLine(context2, t, margins.top, panelHeight - margins.bottom, numSquiggles)
    })
    postMessage({imageData: context2.getImageData(0, 0, panelWidth, panelHeight)})
}

