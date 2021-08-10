from .Figure import Figure
import altair as alt

class Altair(Figure):
    def __init__(self, chart: alt.Chart):
        data = {
            'spec': chart.to_dict()
        }
        super().__init__(type='VegaLite.1', data=data)