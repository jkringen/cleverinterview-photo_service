import os
import django

# import and ensure Django is setup/loaded first
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

import csv
from dataclasses import dataclass
from django.contrib.auth import get_user_model
import secrets
from photos.models import Photograph, Photographer, PhotoSource
from faker import Faker

CSV_FILE = "photos.csv"
UserModel = get_user_model()
fake = Faker()


@dataclass
class PhotoRow:
    id: int
    width: int
    height: int
    url: str
    photographer: str
    photographer_url: str
    photographer_id: int
    avg_color: str
    src_original: str
    src_large2x: str
    src_large: str
    src_medium: str
    src_small: str
    src_portrait: str
    src_landscape: str
    src_tiny: str
    alt: str


def _get_csv_data() -> list[PhotoRow]:
    photos: list[PhotoRow] = []
    with open(CSV_FILE, "r") as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            photos.append(PhotoRow(**row))
    return photos


def run():
    photos: list[PhotoRow] = _get_csv_data()
    # insert records for each Photographer first, ignoring pre-defined IDs, but re-mapping
    for photo in photos:
        # need a Django user
        # need to generate a email address from the name/id
        email_addr = f"photographer.{photo.photographer_id}@gmail.com"
        user_record = UserModel.objects.filter(email=email_addr).first()
        if not user_record:
            # random password
            password: str = secrets.token_urlsafe(15)
            # try to determine first & last name
            name_chunks: list[str] = photo.photographer.split(" ", 1)
            first_name: str = name_chunks[0].strip()
            last_name: str = name_chunks[len(name_chunks) - 1].strip()
            # create user record
            user_record = UserModel.objects.create_user(
                username=email_addr,
                email=email_addr,
                password=password,
                first_name=first_name,
                last_name=last_name,
            )
            print(f"Created User: {email_addr} id={user_record.id} password={password}")

        # make sure we have a Photographer record for this user
        photographer: Photographer = Photographer.objects.filter(
            user=user_record
        ).first()
        if not photographer:
            photographer = Photographer.objects.create(user=user_record)
            # photographer.save()
            print(f"Created Photographer: id={photographer.id}")

        # add Photograph record tied to user
        photograph: Photograph = Photograph.objects.create(
            **{
                "title": fake.unique.text(max_nb_chars=20),
                "url": photo.url,
                "avg_color": photo.avg_color,
                "alt_text": photo.alt,
                "photographer": photographer,
            }
        )
        print(f"Created Photograph: id={photograph.id} {photo.url}")

        # add PhotoSource record tied to photo
        photo_source: PhotoSource = PhotoSource.objects.create(
            **{
                "photograph": photograph,
                "original": photo.src_original,
                "large_2x": photo.src_large2x,
                "large": photo.src_large,
                "medium": photo.src_medium,
                "small": photo.src_small,
                "portrait": photo.src_portrait,
                "landscape": photo.src_landscape,
                "tiny": photo.src_landscape,
            }
        )
        print(f"Created PhotoSource: id={photo_source.id}")

        print("\n")


if __name__ == "__main__":
    run()
