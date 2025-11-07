from rest_framework import serializers
from django.contrib.auth import get_user_model

from .models import Photograph, Photographer, PhotoSource


class UserPublicSerializer(serializers.ModelSerializer):
    """Serializer for our custom User model."""

    class Meta:
        model = get_user_model()
        fields = ("id", "username", "email", "first_name", "last_name")


class PhotoSourceSerializer(serializers.ModelSerializer):
    """Serializer for a PhotoSource model."""

    class Meta:
        model = PhotoSource
        fields = (
            "id",
            "original",
            "medium",
            "small",
            "tiny",
            "large",
            "large_2x",
            "portrait",
            "landscape",
        )


class PhotographSlimSerializer(serializers.ModelSerializer):
    """
    Serializer (slim) for a Photograph model that omits the Photographer field.
    Fetches the related `source` field for PhotoSource info.
    """

    source = PhotoSourceSerializer(read_only=True)

    class Meta:
        model = Photograph
        fields = ["id", "title", "url", "avg_color", "alt_text", "source"]


class PhotographerLimitedSerializer(serializers.ModelSerializer):
    """
    Serializer (limited) for a Photographer model that omits the photographs field.
    Fetches the related `user` field for the parent User data.
    """

    user = UserPublicSerializer(read_only=True)

    class Meta:
        model = Photographer
        fields = ["id", "user", "date_created", "last_updated"]


class PhotographerSerializer(PhotographerLimitedSerializer):
    """
    Serializer for a Photographer model that extends the `PhotographerLimitedSerializer`.
    Adds an additional fetch for the related `photographs` field to include all Photograph
    records owned by the Photographer.
    """

    photographs = PhotographSlimSerializer(many=True, read_only=True)

    class Meta(PhotographerLimitedSerializer.Meta):
        fields = PhotographerLimitedSerializer.Meta.fields + [
            "photographs",
        ]


class PhotographSerializer(PhotographSlimSerializer):
    """
    Serializer for a Photograph model that extends the `PhotographSlimSerializer`.
    Adds an additional fetch for the related `photographer` field to include the
    link to Photographer information.
    """

    # photographer_id = serializers.IntegerField(source="photographer.id", read_only=True)
    photographer = PhotographerLimitedSerializer(read_only=True)

    class Meta(PhotographSlimSerializer.Meta):
        fields = PhotographSlimSerializer.Meta.fields + [
            "photographer",
        ]
