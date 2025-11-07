from django.contrib.auth import get_user_model
from rest_framework import serializers

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

    # source = PhotoSourceSerializer(read_only=True)
    # Make the nested source writable
    source = PhotoSourceSerializer(required=False)

    class Meta:
        model = Photograph
        fields = ["id", "title", "url", "avg_color", "alt_text", "source"]
        read_only_fields = ("id", "date_created", "last_updated")


class PhotographerLimitedSerializer(serializers.ModelSerializer):
    """
    Serializer (limited) for a Photographer model that omits the photographs field.
    Fetches the related `user` field for the parent User data.
    """

    user = UserPublicSerializer(read_only=True)

    class Meta:
        model = Photographer
        fields = ["id", "user", "date_created", "last_updated"]


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

    def create(self, validated_data):
        print(f"VALIDATED_DATA={validated_data}")
        source_data = validated_data.pop("source", None)
        photo = Photograph.objects.create(**validated_data)
        if source_data:
            PhotoSource.objects.create(photograph=photo, **source_data)
        return photo
