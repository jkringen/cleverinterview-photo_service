from dataclasses import dataclass
from typing import Any, Optional, Type, TypeVar

from django.db.models import Model, QuerySet
from rest_framework.serializers import ModelSerializer

from photos.models import Photograph, Photographer
from photos.serializers import PhotographSerializer, PhotographSlimSerializer, PhotographerSerializer
from photos.validators import ValidatedData


M = TypeVar("M", bound=Model)
"""Represents a generic type for a Django Model, used to genericize types for QuerySet."""


@dataclass
class DbResult:
    """
    Represents a result of one of the operation functions in this module.
    If `success` is True, `result` should be populate with the result of the operation.
    If `success` is False, `errors` will be populate with the error(s) from the operation.
    """

    success: bool
    result: Optional[Any] = None
    errors: Optional[list[Any]] = None


def get_photographers() -> DbResult:
    queryset: QuerySet[M] = Photographer.objects.all().select_related("user")
    serializer: PhotographerSerializer = PhotographerSerializer(queryset, many=True)
    return DbResult(success=True, result=serializer.data)


def get_photographer(id: int) -> DbResult:
    photographer: Photographer = Photographer.objects.filter(id=id).select_related("user").first()
    serializer: PhotographerSerializer = PhotographerSerializer(photographer)
    return DbResult(success=True, result=serializer.data)


def get_photographs(photographer_id: Optional[int] = None, prefetch_photographer: Optional[bool] = False) -> DbResult:
    """
    Returns list of Photograph records, optionally filtered by `photographer_id`.
    If `prefetch_photographer` is True, the `photographer` field will be fetched and populated.
    """
    # build initial queryset (optionally filtering on photographer_id)
    queryset: QuerySet[M] = (
        Photograph.objects.filter(photographer_id=photographer_id).all()
        if photographer_id
        else Photograph.objects.all()
    )

    # instantiate full or limited serializer and returned serialized result
    serializer: Type[ModelSerializer] = _get_photograph_serializer(
        queryset, many=True, prefetch_photographer=prefetch_photographer
    )
    return DbResult(success=True, result=serializer.data)


def get_photograph(id: int, prefetch_photographer: Optional[bool] = False) -> DbResult:
    """
    Returns a specific Photograph record that has an ID matching `photo_id`.
    If `prefetch_photographer` is True, the `photographer` field will be fetched and populated.
    """
    # get photograph record by ID, return serialized result
    queryset: QuerySet[M] = Photograph.objects.filter(id=id).first()
    serializer: Type[ModelSerializer] = _get_photograph_serializer(
        queryset, prefetch_photographer=prefetch_photographer
    )
    return DbResult(success=True, result=serializer.data)


def serialize_and_save_photograph(validated_data: ValidatedData) -> DbResult:
    """Serializes and saves provided validated Photograph data."""
    # serialize data, return error if serializer did not validate the data
    serializer = PhotographSerializer(data=validated_data.data.model_dump())
    if not serializer.is_valid():
        return DbResult(success=False, errors=serializer.errors)

    # save to database and return success respone
    photographer = Photographer.objects.filter(id=validated_data.data.photographer_id).first()
    serializer.save(photographer=photographer)
    # TODO: could improve to return more details HTTP codes based on problems seen here?
    return DbResult(success=True, result=serializer.data)


def _get_photograph_serializer(
    queryset: QuerySet[M],
    prefetch_photographer: Optional[bool] = False,
    many: Optional[bool] = False,
) -> Type[ModelSerializer]:
    """Returns a full or limimted Photograph serializer (depending on `prefetch_photographer`)."""
    # if we need to prefetch Photographer, add that to the queryset now
    if prefetch_photographer:
        queryset = queryset.select_related("photographer")

    # construct full/limited serializer and return it
    SerializerCls: Type[ModelSerializer] = PhotographSerializer if prefetch_photographer else PhotographSlimSerializer
    return SerializerCls(queryset, many=many)
