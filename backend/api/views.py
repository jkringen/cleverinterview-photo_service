from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from photos.models import Photograph, Photographer
from photos.serializers import (
    PhotographerLimitedSerializer,
    PhotographerSerializer,
    PhotographSerializer,
    PhotographSlimSerializer,
)


class PhotographersList(APIView):
    """
    List all photographers, or create a new photographer.
    """

    def get(self, request):
        photos = Photographer.objects.all().select_related("user")
        serializer = PhotographerLimitedSerializer(photos, many=True)
        return Response(serializer.data)


class PhotographerDetail(APIView):
    """
    List all photographers, or create a new photographer.
    """

    def get(self, request, photographer_id: int):
        photo = Photographer.objects.filter(id=photographer_id).first()
        serializer = PhotographerLimitedSerializer(photo)
        return Response(serializer.data)


class PhotographerPhotos(APIView):
    """
    List all photographers, or create a new photographer.
    """

    def get(self, request, photographer_id: int):
        photos = Photograph.objects.filter(photographer_id=photographer_id).all()
        serializer = PhotographSlimSerializer(photos, many=True)
        return Response(serializer.data)


class PhotoList(APIView):
    """
    List all photos, or create a new photo.
    """

    def get(self, request):
        photos = Photograph.objects.all().select_related("photographer")
        serializer = PhotographSerializer(photos, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = PhotographSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PhotoDetail(APIView):
    """
    Retrieve, update or delete a Photograph instance.
    """

    def get(self, request, photo_id: int):
        photo = Photograph.objects.filter(id=photo_id).first()
        serializer = PhotographSlimSerializer(photo)
        return Response(serializer.data)
