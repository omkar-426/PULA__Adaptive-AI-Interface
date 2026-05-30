import asyncio
import edge_tts
import tempfile
import os

VOICES = {
    "children": {
        "en": "en-US-JennyNeural",
        "hi": "hi-IN-SwaraNeural",
        "mr": "mr-IN-AarohiNeural",
    },
    "special": {
        "en": "en-US-JennyNeural",
        "hi": "hi-IN-SwaraNeural",
        "mr": "mr-IN-AarohiNeural",
    },
    "elderly": {
        "en": "en-GB-RyanNeural",
        "hi": "hi-IN-MadhurNeural",
        "mr": "mr-IN-ManoharNeural",
    },
    "normal": {
        "en": "en-US-AriaNeural",
        "hi": "hi-IN-SwaraNeural",
        "mr": "mr-IN-AarohiNeural",
    },
}

RATES = {
    "children": "+0%",
    "special":  "-10%",
    "elderly":  "-20%",
    "normal":   "+0%",
}

PITCHES = {
    "children": "+5Hz",
    "special":  "+0Hz",
    "elderly":  "-5Hz",
    "normal":   "+0Hz",
}


async def _synthesize(text: str, voice: str, rate: str, pitch: str) -> bytes:
    tmp = tempfile.NamedTemporaryFile(suffix=".mp3", delete=False)
    tmp.close()
    try:
        communicate = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch)
        await communicate.save(tmp.name)
        with open(tmp.name, "rb") as f:
            return f.read()
    finally:
        if os.path.exists(tmp.name):
            os.unlink(tmp.name)


def synthesize_speech(text: str, profile_key: str = "normal", lang: str = "en") -> bytes:
    """Convert text to speech using edge-tts. Returns MP3 bytes."""
    voice = VOICES.get(profile_key, VOICES["normal"]).get(lang, VOICES["normal"]["en"])
    rate = RATES.get(profile_key, "+0%")
    pitch = PITCHES.get(profile_key, "+0Hz")

    # clean text
    clean = text.replace("#", "").replace("*", "").replace("`", "").strip()

    return asyncio.run(_synthesize(clean, voice, rate, pitch))