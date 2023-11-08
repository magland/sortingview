# 7/1/22
# https://figurl.org/f?v=gs://figurl/spikesortingview-6&d=sha1://cc088aed729608a0c113e5f824cd61e7f93839d1&label=test_unit_similarity_matrix

from typing import List
import sortingview.views as vv
import spikeinterface as si
import spikeinterface.extractors as se


def main():
    recording, sorting = se.toy_example(num_units=12, duration=300, seed=0)
    assert isinstance(recording, si.BaseRecording)

    view = test_unit_unit_similarity_matrix(recording=recording, sorting=sorting)

    url = view.url(label="test_unit_similarity_matrix")
    print(url)


def test_unit_unit_similarity_matrix(*, recording: si.BaseRecording, sorting: si.BaseSorting):
    recording.get_num_channels()  # so that it is not marked as unused by linter
    unit_ids = list(sorting.get_unit_ids())
    similarity_scores: List[vv.UnitSimilarityScore] = []
    for u1 in unit_ids:
        for u2 in unit_ids:
            similarity_scores.append(vv.UnitSimilarityScore(unit_id1=u1, unit_id2=u2, similarity=1 - abs(u1 - u2) / (u1 + u2 + 1)))  # fake similarity score for testing

    view = vv.UnitSimilarityMatrix(unit_ids=unit_ids, similarity_scores=similarity_scores)
    return view


if __name__ == "__main__":
    main()
