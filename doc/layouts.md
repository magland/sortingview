# SortingView Layouts

SortingView layouts allow you to compose views in Python during figure curation using a declarative syntax. All views within the composite figure will then have synchronized state.

## Overview

There are four types of layouts:

* [Box layouts](#box-layouts)
* [Splitter layouts](#splitter-layouts)
* [Tab layouts](#tab-layouts)
* [Mountain layout](#mountain-layout)

Here is an example that uses the first three types

```python
import sortingview.views as vv

# Define the individual views
# These may be layout views themselves
view1 = ...
view2 = ...
view3 = ...
view4 = ...
view5 = ...

# Create the composite view
view_composite = vv.Box(
    # Vertical box layout
    direction='vertical',
    items=[
        # top
        vv.LayoutItem(
            vv.Splitter(
                # Splitter layout - resizable in the horizontal direction
                direction='horizontal',
                item1=vv.LayoutItem(view1, max_size=400),
                item2=vv.LayoutItem(view2),
                height=1000
            ),
            stretch=1
        ),
        # bottom
        vv.LayoutItem(
            vv.TabLayout(
                items=[
                    # First tab
                    vv.TabLayoutItem(
                        label='Raster plot',
                        view=view3
                    ),
                    # Second tab
                    vv.TabLayoutItem(
                        label='Markdown',
                        view=view4
                    ),
                    # Third tab
                    vv.TabLayoutItem(
                        label='Spike locations',
                        view=view5
                    )
                ]
            ),
            stretch=1.5
        )
    ],
    height=1000
)
view
```

## Box layouts

Box layouts layout a list of items in a horizontal row or a vertical column. The item sizes automatically adjust when the parent window is resized. Items must be wrapped in the `vv.LayoutItem` objects as in the example above. The size of each item is controlled by three optional parameters: `min_size`, `max_size`, and `stretch`. The `min_size` and `max_size` are in units of pixels and control the minimum and maximum allowable sizes in the direction of the layout. The `stretch` parameter optionally specifies the relative weight of that item in occupying the remaining available space.

```python
# Box layout usage
v = vv.BoxLayout(
    direction='horizontal', # or 'vertical'
    items=[
        vv.LayoutItem(
            view1,
            min_size=100, #optional
            max_size=300, #optional
            stretch=1 #optional
        ),
        vv.LayoutItem(
            view2,
            stretch=2 #optional
        ),
        ...
    ]
)
```

![image](https://user-images.githubusercontent.com/3679296/187763239-4fb324e6-56b6-4c42-8e61-fd18afe2bf3d.png)

## Splitter layouts

Splitter layouts are similar to box layouts, but they allow the user to resize the views by dragging a splitter grip area. Unlike the box layout which handles any number of subitems, the splitter layout handles exactly two items.

```python
# Splitter layout usage
v = vv.SplitterLayout(
    direction='horizontal', # or 'vertical'
    item1=vv.LayoutItem(
            view1,
            min_size=100, #optional
            max_size=300, #optional
            stretch=1 #optional
        ),
    item2=vv.LayoutItem(
            view2,
            stretch=2 #optional
        ),
    ]
)
```

![image](https://user-images.githubusercontent.com/3679296/187781629-a03237ea-6674-46d8-9deb-54a0834c7236.png)

## Tab Layouts

Tab layouts stack a list of views so that only one is visible at a time, with a tab bar allowing the user to select which view is displayed.

```python
## Tab layout usage
v = vv.TabLayout(
    items=[
        vv.TabLayoutItem(
            label='Tab label 1',
            view=view1,
        ),
        vv.TabLayoutItem(
            label='Tab label 2',
            view=view2
        )
    ]
)
```

![image](https://user-images.githubusercontent.com/3679296/187783614-24833827-f12e-41f3-be56-9834b6b7400d.png)

## Mountain layout

The mountain layout is a special kind of layout that allows moving views around between two tab widgets. See the examples for information on how to use this type of layout.

![image](https://user-images.githubusercontent.com/3679296/187782025-dbe781ec-d950-453a-8ca6-5c13317ff539.png)

