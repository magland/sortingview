# 7/13/22
#

import os
import sortingview.views as vv

# os.environ['SORTINGVIEW_VIEW_URL'] = 'http://localhost:3001'

def square(x):
    return x ** 2

def cube(x):
    return x ** 3

def main():
    view1 = vv.LiveEvaluateFunction(
        function=square,
        function_id='square.001'
    )
    view2 = vv.LiveEvaluateFunction(
        function=cube,
        function_id='cube.001'
    )

    view = vv.Box(
        direction='horizontal',
        items=[
            vv.LayoutItem(view1),
            vv.LayoutItem(view2)
        ]
    )

    view.run(label='test_live_evaluate_function', port=4048)

if __name__ == '__main__':
    main()
