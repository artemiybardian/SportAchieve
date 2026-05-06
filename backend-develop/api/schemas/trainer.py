from typing import List
from ninja import Schema

from api.schemas.muscle import MuscleSchema
from api.schemas.exercise import ExerciseCardSchema

class TrainerSchema(Schema):
    id: int
    uuid: str
    name: str
    photo: str
    description: str
    muscles: List[MuscleSchema]
    exercises: List[ExerciseCardSchema]
    