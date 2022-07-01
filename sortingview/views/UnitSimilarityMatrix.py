import numpy as np
from typing import List, Union
from .View import View


class UnitSimilarityScore:
    def __init__(self,
        unit_id1: Union[int, str],
        unit_id2: Union[int, str],
        similarity: float
    ) -> None:
        self.unit_id1 = unit_id1
        self.unit_id2 = unit_id2
        self.similarity = similarity
    def to_dict(self):
        return {
            'unitId1': self.unit_id1,
            'unitId2': self.unit_id2,
            'similarity': self.similarity
        }

class UnitSimilarityMatrix(View):
    def __init__(self,
        unit_ids: List[Union[int, str]],
        similarity_scores: List[UnitSimilarityScore]
    ) -> None:
        super().__init__('UnitSimilarityMatrix')
        self._unit_ids = unit_ids
        self._similarity_scores = similarity_scores
    def to_dict(self) -> dict:
        ret = {
            'type': self.type,
            'unitIds': self._unit_ids,
            'similarityScores': [a.to_dict() for a in self._similarity_scores]
        }
        return ret
    def child_views(self) -> List[View]:
        return []
