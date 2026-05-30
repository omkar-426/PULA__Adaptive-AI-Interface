# 🌐 Pula — Adaptive AI Assistant

Pula is an adaptive AI chatbot that changes its entire UI and behavior based on who is using it.
Built for people who are often left out of technology — children, elderly, and those with special needs.

## ✨ Profiles

| Profile | Experience |
|---|---|
| 👶 Kids Mode | Colorful, simple words, picture buttons, fun voice |
| 🧓 Senior Mode | Large text, slow calm voice, easy navigation |
| 🌟 Calm Mode | Gentle, patient, voice-first for special needs |
| 🧑 Standard | Clean modern chat experience |

## 🛠 Tech Stack

- **Backend** — Python, Django, Django REST Framework
- **Frontend** — React.js
- **AI** — Groq API (LLaMA 3.3 70B)
- **Speech to Text** — Groq Whisper
- **Text to Speech** — Edge TTS (Microsoft Neural Voices)
- **Languages** — English, Hindi, Marathi

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js v18+
- Groq API key (free at [console.groq.com](https://console.groq.com))

### Backend Setup

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
```

Create your `.env` file:
```bash
cp .env.example .env
# Now edit .env and add your keys
```

Run migrations and start server:
```bash
python manage.py migrate
python manage.py runserver
```

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

### One-click Launch (Windows)
```bash
# From root Pula/ folder
start.bat
```

App runs at → http://localhost:3000

## 📁 Project Structure

Pula/
├── backend/                  # Django API
│   ├── chat/
│   │   ├── views.py         # API endpoints
│   │   ├── profiles.py      # AI profile configs
│   │   ├── whisper.py       # Speech to text
│   │   └── tts.py           # Text to speech
│   ├── core/                # Django settings
│   ├── .env.example         # Environment template
│   └── requirements.txt
│
├── frontend/                 # React app
│   └── src/
│       ├── pages/           # ProfileSelector, ChatPage, Onboarding
│       ├── components/      # MessageBubble, InputArea, PictureButtons
│       ├── hooks/           # useChat, useSpeech
│       └── config/          # profiles.js
│
├── start.bat                 # One-click launcher (Windows)
└── README.md

## 🔑 Environment Variables

| Variable | Description | Where to get |
|---|---|---|
| `GROQ_API_KEY` | Groq API key | [console.groq.com](https://console.groq.com) |
| `SECRET_KEY` | Django secret key | Generate with Django command |

## 🌍 Future Scope

- PWA support (installable on phones/tablets)
- User accounts and personalization
- More languages
- School/hospital deployment
- Native mobile app

## 👨‍💻 Built by

U. Omkar