# This example requires figurl-electron (see README.md)

import sortingview.views as vv
import kachery_cloud as kcl

# os.environ['SORTINGVIEW_VIEW_URL'] = 'http://localhost:3001'

def square(x):
    return x ** 2

def cube(x):
    return x ** 3

def main():
    kcl.use_sandbox()

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

    view.run(label='test_live_evaluate_function', port=0)

if __name__ == '__main__':
    main()
