# 7/13/22
# https://figurl.org/f?v=gs://figurl/spikesortingview-6&d=sha1://e1db9d25d6cff896b0c65d800e4e19cd3093991e&label=test_markdown

import sortingview.views as vv


def main():
    view = test_markdown()

    url = view.url(label="test_markdown")
    print(url)


def test_markdown():
    view = vv.Markdown(
        """
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
"""
    )
    return view


if __name__ == "__main__":
    main()
