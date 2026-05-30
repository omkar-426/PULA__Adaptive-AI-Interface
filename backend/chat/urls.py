from django.urls import path
from . import views

urlpatterns = [
    path('profiles/', views.get_profiles, name='get_profiles'),
    path('chat/', views.chat, name='chat'),
    path('transcribe/', views.transcribe, name='transcribe'),
    path('tts/', views.text_to_speech, name='tts'),
]