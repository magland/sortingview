# 8/31/22
# https://figurl.org/f?v=gs://figurl/spikesortingview-8&d=sha1://1c894158e5518d6ff05fa36373ba8a543f1ee28f&label=Markdown%20example

import sortingview.views as vv
import kachery_cloud as kcl


def main():
    kcl.use_sandbox()
    view = example_markdown()

    url = view.url(label='Markdown example')
    print(url)

def example_markdown(*, height: int=500):
    view = vv.Markdown(
'''
# Test markdown

Example markdown source

* list item 1
* list item 2
* list item 3

Code snippet:

```python
import spikeinterface as si

print(si.__version__)
```
''',
        height=height
    )
    return view

if __name__ == '__main__':
    main()
