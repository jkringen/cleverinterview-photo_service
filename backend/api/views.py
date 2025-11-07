from rest_framework import status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from photos.models import Photograph, Photographer
from photos.serializers import (
    PhotographerLimitedSerializer,
    PhotographSerializer,
    PhotographSlimSerializer,
)
from photos.validators import validate_photograph, ValidatedData


class PhotographersView(APIView):
    """
    List all photographers, or create a new photographer.
    """

    def get(self, request):
        photos = Photographer.objects.all().select_related("user")
        serializer = PhotographerLimitedSerializer(photos, many=True)
        return Response(serializer.data)

    def post(self, request):
        # body: user_id, photos?
        # validation: user_id must exist in DB,
        pass


class PhotographerView(APIView):
    """
    Retrieve, update, or delete a Photographer record.
    """

    def get(self, request, photographer_id: int):
        photo = Photographer.objects.filter(id=photographer_id).first()
        serializer = PhotographerLimitedSerializer(photo)
        return Response(serializer.data)

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
        photos = Photograph.objects.filter(photographer_id=photographer_id).all()
        serializer = PhotographSlimSerializer(photos, many=True)
        return Response(serializer.data)


class PhotosView(APIView):
    """
    List all photos, or create a new photo.
    """

    def get(self, request):
        photos = Photograph.objects.all().select_related("photographer")
        serializer = PhotographSerializer(photos, many=True)
        return Response(serializer.data)

    def post(self, request: Request):
        # validate incoming photograph post data
        validated_data: ValidatedData = validate_photograph(request.data)
        if not validated_data.success:
            return Response(validated_data.errors, status=status.HTTP_400_BAD_REQUEST)

        # create Photograph record and return it or the resulting errors
        serializer = PhotographSerializer(data=validated_data.data.model_dump())
        photographer = Photographer.objects.filter(
            id=validated_data.data.photographer_id
        ).first()
        if serializer.is_valid():
            serializer.save(photographer=photographer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class PhotoView(APIView):
    """
    Retrieve, update or delete a Photograph instance.
    """

    def get(self, request, photo_id: int):
        photo = Photograph.objects.filter(id=photo_id).first()
        serializer = PhotographSlimSerializer(photo)
        return Response(serializer.data)

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
