# 8/31/22
# https://figurl.org/f?v=gs://figurl/spikesortingview-8&d=sha1://2b44a7d440f0bda1e0e802716688c51d445d54aa&label=Tiled%20image%20example

import numpy as np
import matplotlib.pyplot as plt
import sortingview.views as vv
import kachery_cloud as kcl


def main():
    kcl.use_sandbox()
    view = example_tiled_image()

    url = view.url(label='Tiled image example')
    print(url)

def example_tiled_image(*, height=500):
    print('Creating Mandelbrot array')
    width = 2000
    height = 2000
    max_iterations = 300
    tile_size=256
    x = mandelbrot(height, width, max_iterations=max_iterations, zoom=1.3)
    x = x.astype(np.float32) / max_iterations
    x[x>1] = 1

    print('Converting to color map uint8')
    RdGy = plt.get_cmap('RdGy')
    y = np.flip((RdGy(x)[:,:,:3]*255).astype(np.uint8), axis=0) # colorize and convert to uint8

    print('Creating TiledImage view')
    layer1 = vv.TiledImageLayer(label='layer 1', data=y)
    y2 = y
    y2[:, :, 0] = 0
    layer2 = vv.TiledImageLayer(label='layer 2', data=y2)
    view = vv.TiledImage(tile_size=tile_size, layers=[layer1, layer2], height=height)
    return view

# Thanks: https://figurl.org/f?v=gs://figurl/spikesortingview-7&d=sha1://cf290fc3c9ebcdeff4231f42982c7c6da5a66e3b&label=test_tiled_image
def mandelbrot(height, width, x=-0.5, y=0, zoom=1, max_iterations=100):
    # To make navigation easier we calculate these values
    x_width = 1.5
    y_height = 1.5 * height / width
    x_from = x - x_width / zoom
    x_to = x + x_width / zoom
    y_from = y - y_height / zoom
    y_to = y + y_height / zoom
    # Here the actual algorithm starts
    x = np.linspace(x_from, x_to, width).reshape((1, width))
    y = np.linspace(y_from, y_to, height).reshape((height, 1))
    c = x + 1j * y
    # Initialize z to all zero
    z = np.zeros(c.shape, dtype=np.complex128)
    # To keep track in which iteration the point diverged
    div_time = np.zeros(z.shape, dtype=int)
    # To keep track on which points did not converge so far
    m = np.full(c.shape, True, dtype=bool)
    for i in range(max_iterations):
        z[m] = z[m]**2 + c[m]
        diverged = np.greater(np.abs(z), 2, out=np.full(c.shape, False), where=m) # Find diverging
        div_time[diverged] = i      # set the value of the diverged iteration number
        m[np.abs(z) > 2] = False    # to remember which have diverged
    return div_time

if __name__ == '__main__':
    main()
