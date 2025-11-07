from rest_framework import serializers
from django.contrib.auth import get_user_model

from .models import Photograph, Photographer, PhotoSource


class UserPublicSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        fields = ("id", "username", "email")


class PhotoSourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = PhotoSource
        fields = [
            "id",
            "original",
            "medium",
            "small",
            "tiny",
            "large",
            "large_2x",
            "portrait",
            "landscape",
        ]


# Slim photo (to embed under Photographer without recursion)
class PhotographSlimSerializer(serializers.ModelSerializer):
    source = PhotoSourceSerializer(read_only=True)

    class Meta:
        model = Photograph
        fields = ("id", "title", "url", "avg_color", "alt_text", "source")


# Full photo (for /photos endpoints)
class PhotographSerializer(serializers.ModelSerializer):
    # Avoid recursion by NOT nesting PhotographerSerializer here.
    # Show just basic photographer info or an ID/slug.
    photographer_id = serializers.IntegerField(source="photographer.id", read_only=True)
    source = PhotoSourceSerializer(read_only=True)

    class Meta:
        model = Photograph
        fields = [
            "id",
            "title",
            "url",
            "avg_color",
            "alt_text",
            "photographer_id",
            "source",
            "date_created",
            "last_updated",
        ]


class PhotographerSerializer(serializers.ModelSerializer):
    user = UserPublicSerializer(read_only=True)
    photographs = PhotographSlimSerializer(many=True, read_only=True)

    class Meta:
        model = Photographer
        fields = ["id", "user", "photographs", "date_created", "last_updated"]
