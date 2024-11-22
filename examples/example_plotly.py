import sortingview.views as vv
import kachery as ka
import plotly.graph_objects as go


def main():
    ka.use_sandbox()
    view = example_plotly()

    url = view.url(label="Plotly example")
    print(url)


def example_plotly():
    fig = go.Figure(data=[go.Scatter(x=[1, 2, 3, 4], y=[10, 11, 12, 13], mode="markers")])
    view = vv.PlotlyFigure(fig=fig)
    return view


if __name__ == "__main__":
    main()
