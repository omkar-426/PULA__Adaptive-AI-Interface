import os
import tempfile
from groq import Groq
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

client = Groq(api_key=os.getenv('GROQ_API_KEY'))

def transcribe_audio(audio_data: bytes, language: str = "en") -> str:
    lang_map = {
        "en": "en",
        "hi": "hi",
        "mr": "mr",
    }

    print(f"Audio size received: {len(audio_data)} bytes")

    try:
        # try webm first, then mp4, then ogg
        for ext in ["webm", "mp4", "ogg", "wav"]:
            tmp_path = None
            try:
                with tempfile.NamedTemporaryFile(suffix=f".{ext}", delete=False) as tmp:
                    tmp.write(audio_data)
                    tmp_path = tmp.name

                with open(tmp_path, "rb") as audio_file:
                    transcription = client.audio.transcriptions.create(
                        model="whisper-large-v3-turbo",
                        file=(f"audio.{ext}", audio_file, f"audio/{ext}"),
                        language=lang_map.get(language, "en"),
                        response_format="text",
                    )

                os.unlink(tmp_path)
                print(f"Transcription success with {ext}:", transcription)
                return transcription if isinstance(transcription, str) else str(transcription)

            except Exception as e:
                print(f"Failed with {ext}:", str(e))
                if tmp_path and os.path.exists(tmp_path):
                    os.unlink(tmp_path)
                continue

        return ""

    except Exception as e:
        print("Whisper error:", str(e))
        return ""