from django.urls import path
from .views import PhotoList, PhotoDetail

urlpatterns = [
    # path("photographers", PhotosView.as_view(), name="api_photographers"),
    # path(
    #     "photographer/<int:photographer_id>",
    #     PhotosView.as_view(),
    #     name="api_photographer",
    # ),
    # path(
    #     "photographer/<int:photographer_id>/photos",
    #     PhotosView.as_view(),
    #     name="api_photographer_photos",
    # ),
    path("photos", PhotoList.as_view(), name="api_photos"),
    path("photos/<int:photo_id>", PhotoDetail.as_view(), name="api_photo"),
]
