from rest_framework import status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from photos.db import (
    DbResult,
    get_photograph,
    get_photographer,
    get_photographers,
    get_photographs,
    serialize_and_save_photograph,
    update_photograph,
)
from photos.validators import ValidatedData, validate_photograph


class PhotographersView(APIView):
    """
    View for Photographers records.
    """

    def get(self, request):
        # return list of all photographer records, returning error if something went wrong
        result = get_photographers()
        if not result.success:
            return Response(result.errors, status=result.http_code)
        return Response(result.result, status=status.HTTP_200_OK)


class PhotographerView(APIView):
    """
    View for getting a specific Photographer record.
    """

    def get(self, request, photographer_id: int):
        # get and return photographer by ID, returning error if something went wrong
        result: DbResult = get_photographer(photographer_id)
        if not result.success:
            return Response(result.errors, status=result.http_code)
        return Response(result.result, status=status.HTTP_200_OK)


class PhotographerPhotosView(APIView):
    """
    Retrieve all photos related to the provided `photographer_id`.
    """

    def get(self, request, photographer_id: int):
        # return all photographs by specific Photographer, returning error if something went wrong
        result: DbResult = get_photographs(photographer_id=photographer_id)
        if not result.success:
            return Response(result.errors, status=result.http_code)
        return Response(result.result, status=status.HTTP_200_OK)


class PhotosView(APIView):
    """
    List all photos, or create a new photo.
    """

    def get(self, request):
        # return all photograph records, returning error if something went wrong
        result: DbResult = get_photographs()
        if not result.success:
            return Response(result.errors, status=result.http_code)
        return Response(result.result, status=status.HTTP_200_OK)

    def post(self, request: Request):
        # validate incoming photograph post data
        validated_data: ValidatedData = validate_photograph(request.data)
        if not validated_data.success:
            return Response(validated_data.errors, status=status.HTTP_400_BAD_REQUEST)

        # create Photograph record and return it or the resulting errors
        result: DbResult = serialize_and_save_photograph(validated_data)
        if not result.success:
            return Response(result.errors, status=result.http_code)
        return Response(result.result, status=status.HTTP_201_CREATED)


class PhotoView(APIView):
    """
    Retrieve, update or delete a Photograph instance.
    """

    def get(self, request, photo_id: int):
        # get photograph record by provided ID, returning error if something went wrong
        result: DbResult = get_photograph(photo_id)
        if not result.success:
            return Response(result.errors, status=result.http_code)
        return Response(result.result, status=status.HTTP_200_OK)

    def put(self, request, photo_id: int):
        # update photograph with provided data
        return self._update_photograph(request, photo_id)

    def patch(self, request, photo_id: int):
        # update photograph with provided data
        return self._update_photograph(request, photo_id)

    def _update_photograph(self, request, photo_id: int):
        # validate incoming photograph update data
        validated_data: ValidatedData = validate_photograph(request.data, is_update=True)
        if not validated_data.success:
            return Response(validated_data.errors, status=status.HTTP_400_BAD_REQUEST)

        # update Photograph record and return it or the resulting errors
        result: DbResult = update_photograph(photo_id, validated_data)
        if not result.success:
            return Response(result.errors, status=result.http_code)
        return Response(result.result, status=status.HTTP_201_CREATED)
