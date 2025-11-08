from rest_framework import status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from photos.db import (
    get_photographer,
    get_photographers,
    get_photographs,
    get_photograph,
    serialize_and_save_photograph,
)
from photos.validators import ValidatedData, validate_photograph


class PhotographersView(APIView):
    """
    List all photographers, or create a new photographer.
    """

    def get(self, request):
        result = get_photographers()
        if not result.success:
            return Response(result.errors, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(result.result, status=status.HTTP_200_OK)

    def post(self, request):
        # body: user_id, photos?
        # validation: user_id must exist in DB,
        pass


class PhotographerView(APIView):
    """
    Retrieve, update, or delete a Photographer record.
    """

    def get(self, request, photographer_id: int):
        result = get_photographer(photographer_id)
        if not result.success:
            return Response(result.errors, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(result.result, status=status.HTTP_200_OK)

    def put(self, request):
        # full resource update
        # body: user_id, photos?
        # validation: user_id must exist in DB,
        pass

    def patch(self, request):
        # partial resource update
        # body: user_id, photos?
        # validation: user_id must exist in DB,
        pass


class PhotographerPhotosView(APIView):
    """
    Retrieve all photos related to the provided `photographer_id`.
    """

    def get(self, request, photographer_id: int):
        result = get_photographs(photographer_id=photographer_id)
        if not result.success:
            return Response(result.errors, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(result.result, status=status.HTTP_200_OK)


class PhotosView(APIView):
    """
    List all photos, or create a new photo.
    """

    def get(self, request):
        result = get_photographs()
        if not result.success:
            return Response(result.errors, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(result.result, status=status.HTTP_200_OK)

    def post(self, request: Request):
        # validate incoming photograph post data
        validated_data: ValidatedData = validate_photograph(request.data)
        if not validated_data.success:
            return Response(validated_data.errors, status=status.HTTP_400_BAD_REQUEST)

        # create Photograph record and return it or the resulting errors
        result = serialize_and_save_photograph(validated_data)
        if not result.success:
            return Response(result.errors, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(result.result, status=status.HTTP_201_CREATED)


class PhotoView(APIView):
    """
    Retrieve, update or delete a Photograph instance.
    """

    def get(self, request, photo_id: int):
        result = get_photograph(photo_id)
        if not result.success:
            return Response(result.errors, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(result.result, status=status.HTTP_200_OK)

    def put(self, request):
        # full resource update
        # body: user_id, photos?
        # validation: user_id must exist in DB,
        pass

    def patch(self, request):
        # partial resource update
        # body: user_id, photos?
        # validation: user_id must exist in DB,
        pass
