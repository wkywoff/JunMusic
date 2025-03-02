from django.db import models

class Artist(models.Model):
    name = models.CharField(max_length=255)
    bio = models.TextField(blank=True)
    photo = models.ImageField(upload_to='artists/', blank=True)

    def __str__(self):
        return self.name

class Album(models.Model):
    title = models.CharField(max_length=255)
    artist = models.ForeignKey(Artist, on_delete=models.CASCADE)
    year = models.IntegerField()
    cover = models.ImageField(upload_to='albums/', blank=True)

    def __str__(self):
        return self.title

class Track(models.Model):
    title = models.CharField(max_length=255)
    album = models.ForeignKey(Album, on_delete=models.CASCADE)
    audio_file = models.FileField(upload_to='tracks/')
    duration = models.DurationField(blank=True, null=True)

    def __str__(self):
        return self.title
