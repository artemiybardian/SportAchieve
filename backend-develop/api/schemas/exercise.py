from ninja import Schema
from typing import List, Optional

from api.models.ExerciseInstructionType import ExerciseInstructionType
from api.schemas.muscle import MuscleSchema


class InstructionItem(Schema):
    id: str
    type: str
    data: dict

class ExerciseSchema(Schema):
    id: int
    name: str
    access_type: str
    description: str
    muscles: List[MuscleSchema]
    instruction_type: ExerciseInstructionType
    instruction: Optional[List[InstructionItem]] = None
    video_url: Optional[str] = None
    cover: Optional[str] = None

class ExerciseCardSchema(Schema):
    id: int
    name: str
    description: str
    access_type: str
    cover: Optional[str] = None

