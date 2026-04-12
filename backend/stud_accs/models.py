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
