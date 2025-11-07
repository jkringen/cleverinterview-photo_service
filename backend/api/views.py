from django.http import Http404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import csv

# from django.db.models import Prefetch
# from rest_framework import generics, viewsets
from photos.models import Photograph, Photographer
from photos.serializers import PhotographSerializer, PhotographerSerializer


# class PhotosView(generics.ListCreateAPIView):
#     queryset = Photograph.objects.all()
#     serializer_class = PhotographSerializer


# class PhotoDetailView(PhotosView):
#     lookup_url_kwarg = "photo_id"


# class PhotographersView(generics.ListCreateAPIView):
#     queryset = Photographer.objects.all()
#     serializer_class = PhotographerSerializer


class PhotoList(APIView):
    """
    List all photos, or create a new photo.
    """

    def get(self, request):
        photos = Photograph.objects.all()
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
        photos = Photograph.objects.all()
        serializer = PhotographSerializer(photos, many=True)
        return Response(serializer.data)

    # def post(self, request, photo_id: int):
    #     serializer = PhotographSerializer(data=request.data)
    #     if serializer.is_valid():
    #         serializer.save()
    #         return Response(serializer.data, status=status.HTTP_201_CREATED)
    #     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
