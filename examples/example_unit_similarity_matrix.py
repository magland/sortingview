# 8/31/22
# https://figurl.org/f?v=gs://figurl/spikesortingview-8&d=sha1://57cc13756bf540f12aeda31e23a2061bfcc6c8a4&label=Unit%20similarity%20matrix%20example

from typing import List
import sortingview.views as vv
import spikeinterface as si
import spikeinterface.extractors as se
import kachery_cloud as kcl


def main():
    kcl.use_sandbox()
    recording, sorting = se.toy_example(num_units=12, duration=300, seed=0, num_segments=1)

    view = example_unit_unit_similarity_matrix(recording=recording, sorting=sorting)

    url = view.url(label='Unit similarity matrix example')
    print(url)

def example_unit_unit_similarity_matrix(*, recording: si.BaseRecording, sorting: si.BaseSorting, height=400):
    recording.get_num_channels() # so that it is not marked as unused by linter
    unit_ids = list(sorting.get_unit_ids())
    similarity_scores: List[vv.UnitSimilarityScore] = []
    for u1 in unit_ids:
        for u2 in unit_ids:
            similarity_scores.append(
                vv.UnitSimilarityScore(
                    unit_id1=u1,
                    unit_id2=u2,
                    similarity=1 - abs(u1 - u2) / (u1 + u2 + 1) # fake similarity score for testing
                )
            )

    view = vv.UnitSimilarityMatrix(
        unit_ids=unit_ids,
        similarity_scores=similarity_scores,
        height=height
    )
    return view

if __name__ == '__main__':
    main()
