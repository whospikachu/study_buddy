from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Exam, SyllabusItem
class RegisterSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ('username','password','email')
        extra_kwargs = {"password":{"write_only":True}}
    def create(self,validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class SyllabusItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = SyllabusItem
        fields = ['id','topic_name','is_completed']


class ExamSerializer(serializers.ModelSerializer):
    #nested serializer lets us see syllabus items inside exam object
    syllabus_items = SyllabusItemSerializer(many = True, read_only=True)
    progress = serializers.ReadOnlyField()
    class Meta:
        model = Exam
        fields = ['id','subject_name','exam_date','syllabus_items','progress']