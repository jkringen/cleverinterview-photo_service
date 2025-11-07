from django.urls import path
from .views import (
    PhotoList,
    PhotoDetail,
    PhotographersList,
    PhotographerDetail,
    PhotographerPhotos,
)

urlpatterns = [
    path("photographers", PhotographersList.as_view(), name="api_photographers"),
    path(
        "photographers/<int:photographer_id>",
        PhotographerDetail.as_view(),
        name="api_photographers",
    ),
    path(
        "photographers/<int:photographer_id>/photos",
        PhotographerPhotos.as_view(),
        name="api_photographers_photos",
    ),
    path("photos", PhotoList.as_view(), name="api_photos"),
    path("photos/<int:photo_id>", PhotoDetail.as_view(), name="api_photo"),
]
