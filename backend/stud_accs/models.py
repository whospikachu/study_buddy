from django.db import models
from django.contrib.auth.models import User
# Create your models here.
#exam model
class Exam(models.Model):
    user = models.ForeignKey(User,on_delete=models.CASCADE, related_name='exams')
    subject_name = models.CharField(max_length=200)
    exam_date = models.DateTimeField()
    
    def __str__(self):
        return f"{self.subject_name} - {self.exam_date} - {self.user.username}"

    @property
    def progress(self):
        #calculates the percentage of the syllabus completed
        total = self.syllabus_items.count()
        if total == 0:
            return 0
        completed = self.syllabus_items.filter(is_completed = True).count()
        return round((completed/total) * 100, 2)


class SyllabusItem(models.Model):
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name='syllabus_items')
    topic_name = models.CharField(max_length=400)
    is_completed = models.BooleanField(default = False)

    def __str__(self):
        return f"{self.topic_name} - {self.exam.subject_name}"


class Todo(models.Model):
    user = models.ForeignKey(User,on_delete=models.CASCADE)
    task = models.CharField(max_length=500)
    is_done = models.BooleanField(default=False)
    
    def __str__(self):
        return self.task

class StudySession(models.Model):
    user = models.ForeignKey(User,on_delete=models.CASCADE)
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    duration_seconds = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.user.username} - {self.duration_seconds //60} mins"