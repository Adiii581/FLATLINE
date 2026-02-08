# FLATLINE

FLATLINE is a retro/arcade style medical simulation/game where players uses tests and diagnoses to solve infinite, AI-generated patient cases. This game is powered by Google Gemini API and a FastAPI backend.

## Tech Stack

- **Frontend**: JavaScript, React (Vite), HTML, Tailwind CSS
- **Backend**: Python, FastAPI, RestAPI, and Pydantic
- **AI Engine**: Google Gemini API (gemini-2.5-flash)

## Prerequisites

Before running the game, ensure you have the following installed:

- Node.js (v16 or higher)
- Python (v3.9 or higher)
- A Google Gemini API Key ([Get one here](https://makersuite.google.com/app/apikey))

## Installation & Setup

Follow these steps to get the system running locally. You will need two terminal windows open: one for the backend and one for the frontend.

### Step 1: Clone the Repository

```bash
git clone https://github.com/Adiii581/FLATLINE.git
cd flatline
```

### Step 2: Backend Setup (Terminal 1)

Navigate to the backend directory:

```bash
cd backend
```

Create a virtual environment:

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Mac/Linux
python3 -m venv venv
source venv/bin/activate
```

Install dependencies:

```bash
pip install fastapi uvicorn google-generativeai python-dotenv pydantic
```

Configure Environment Variables:

Create a file named `.env` inside the backend folder and add your API key:

```
GEMINI_API_KEY=your_actual_api_key_here
```

Start the Server:

```bash
python -m uvicorn main:app --reload
```

The backend should now be running at http://localhost:8000.

### Step 3: Frontend Setup (Terminal 2)

Navigate to the project root:

```bash
cd frontend
```

Install Node dependencies:

```bash
npm install
```

Start the React Application:

```bash
npm run dev
```

Open your browser and navigate to the Localhost URL shown in the terminal (usually http://localhost:5173).

## How to Play

- **Select Difficulty**: Choose Easy, Medium, or Hard.
- **Review the Case**: Read the patient's initial symptoms and vitals.
- **Order Tests**: Select diagnostic tests from the menu.
- **Diagnose**: Once you have enough information, submit a diagnosis. Be careful, if the diagnosis is wrong then the patient's condition worsens.
- **Flatline**: If the patient's vitality hits 0, the game is over.