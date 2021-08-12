import sortingview.figurl as fig
import altair as alt
import pandas as pd

source = pd.DataFrame({
    'a': ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'],
    'b': [28, 55, 43, 91, 81, 53, 19, 87, 52]
})
chart = alt.Chart(source).mark_bar().encode(
    x='a',
    y='b'
)

F1 = fig.Altair(chart)
F2 = fig.Altair(chart)
F = fig.BoxLayout(
    [
        fig.BoxLayout([F1, F2], direction='row'),
        F2,
        F1
    ],
    direction="column"
)

url = F.url()
print(url)
