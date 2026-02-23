from pydantic import BaseModel, Field
from typing import Optional


class FoodBase(BaseModel):
    food_item: str = Field(..., min_length=1, max_length=255)
    category: Optional[str] = Field(None, max_length=100)

    calories_kcal: Optional[float] = Field(None, ge=0)
    protein_g: Optional[float] = Field(None, ge=0)
    carbohydrates_g: Optional[float] = Field(None, ge=0)
    fat_g: Optional[float] = Field(None, ge=0)
    fiber_g: Optional[float] = Field(None, ge=0)
    sugars_g: Optional[float] = Field(None, ge=0)
    sodium_mg: Optional[float] = Field(None, ge=0)
    cholesterol_mg: Optional[float] = Field(None, ge=0)

    source: Optional[str] = Field(None, max_length=100)


class FoodCreate(FoodBase):
    pass


class FoodUpdate(BaseModel):
    food_item: Optional[str] = Field(None, min_length=1, max_length=255)
    category: Optional[str] = Field(None, max_length=100)

    calories_kcal: Optional[float] = Field(None, ge=0)
    protein_g: Optional[float] = Field(None, ge=0)
    carbohydrates_g: Optional[float] = Field(None, ge=0)
    fat_g: Optional[float] = Field(None, ge=0)
    fiber_g: Optional[float] = Field(None, ge=0)
    sugars_g: Optional[float] = Field(None, ge=0)
    sodium_mg: Optional[float] = Field(None, ge=0)
    cholesterol_mg: Optional[float] = Field(None, ge=0)

    source: Optional[str] = Field(None, max_length=100)


class FoodOut(FoodBase):
    id_food: int

    class Config:
        from_attributes = True