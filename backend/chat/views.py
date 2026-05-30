import os
import base64
import requests
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from dotenv import load_dotenv
from .profiles import get_profile, get_all_profiles
from .whisper import transcribe_audio
from .tts import synthesize_speech

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

GROQ_API_KEY = os.getenv('GROQ_API_KEY')
GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'


@api_view(['GET'])
def get_profiles(request):
    return Response(get_all_profiles())


@api_view(['POST'])
def transcribe(request):
    """Receive audio from frontend, transcribe via Groq Whisper."""
    audio_b64 = request.data.get('audio')
    language = request.data.get('language', 'en')

    if not audio_b64:
        return Response(
            {'error': 'No audio provided'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        audio_bytes = base64.b64decode(audio_b64)
        text = transcribe_audio(audio_bytes, language)

        if not text:
            return Response(
                {'error': 'Could not understand audio'},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response({'text': text})

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
def text_to_speech(request):
    """Convert text to speech using edge-tts, return MP3 base64."""
    text = request.data.get('text', '')
    profile_key = request.data.get('profile', 'normal')
    lang = request.data.get('language', 'en')

    if not text:
        return Response(
            {'error': 'No text provided'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        audio_bytes = synthesize_speech(text, profile_key, lang)
        audio_b64 = base64.b64encode(audio_bytes).decode('utf-8')
        return Response({'audio': audio_b64, 'format': 'mp3'})

    except Exception as e:
        print("TTS error:", str(e))
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
def chat(request):
    data = request.data
    profile_key = data.get('profile', 'normal')
    messages = data.get('messages', [])
    user_message = data.get('message', '')

    if not user_message:
        return Response(
            {'error': 'Message is required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if not GROQ_API_KEY:
        return Response(
            {'error': 'API key not configured'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    profile = get_profile(profile_key)
    system_prompt = profile['system_prompt']

    groq_messages = [{'role': 'system', 'content': system_prompt}]
    recent = messages[-10:] if len(messages) > 10 else messages
    for msg in recent:
        groq_messages.append({
            'role': msg['role'],
            'content': msg['content'],
        })
    groq_messages.append({'role': 'user', 'content': user_message})

    headers = {
        'Authorization': f'Bearer {GROQ_API_KEY}',
        'Content-Type': 'application/json',
    }

    payload = {
        'model': 'llama-3.3-70b-versatile',
        'max_tokens': 1024,
        'messages': groq_messages,
    }

    try:
        response = requests.post(GROQ_API_URL, json=payload, headers=headers)
        response.raise_for_status()
        result = response.json()
        reply = result['choices'][0]['message']['content']
        return Response({'reply': reply, 'profile': profile_key})

    except requests.exceptions.RequestException as e:
        error_detail = ""
        if hasattr(e, 'response') and e.response is not None:
            error_detail = e.response.text
        print("GROQ ERROR:", str(e))
        print("GROQ ERROR DETAIL:", error_detail)
        return Response(
            {'error': f'API error: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )