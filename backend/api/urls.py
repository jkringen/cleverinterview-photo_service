from django.urls import path

from .views import (
    PhotographerPhotosView,
    PhotographersView,
    PhotographerView,
    PhotosView,
    PhotoView,
)

urlpatterns = [
    path("photographers", PhotographersView.as_view(), name="api_photographers"),
    path(
        "photographers/<int:photographer_id>",
        PhotographerView.as_view(),
        name="api_photographers",
    ),
    path(
        "photographers/<int:photographer_id>/photos",
        PhotographerPhotosView.as_view(),
        name="api_photographers_photos",
    ),
    path("photos", PhotosView.as_view(), name="api_photos"),
    path("photos/<int:photo_id>", PhotoView.as_view(), name="api_photo"),
]
