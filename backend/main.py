import os
import uuid
import json
import re
from typing import Dict, List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import google.generativeai as genai

# --- CONFIGURATION ---
load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Use a widely available model
MODEL_NAME = 'gemini-2.5-flash' 

app = FastAPI()

# Enable CORS for Frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- IN-MEMORY DATABASE ---
games: Dict[str, dict] = {}

# --- DATA MODELS ---
class GameStartRequest(BaseModel):
    difficulty: str

class TestSubmission(BaseModel):
    game_id: str
    test_name: str

class DiagnosisSubmission(BaseModel):
    game_id: str
    diagnosis_name: str

# --- HELPER: ROBUST JSON PARSER ---
def clean_and_parse_json(text):
    # Removes markdown code blocks (```json ... ```)
    text = re.sub(r"```(json)?", "", text).strip()
    
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        print(f"JSON Error. Raw text: {text}")
        return {
            "narrative": "SYSTEM ERROR: DATABANK CORRUPTED. (AI Generation Failed)",
            "test_narrative": "Inconclusive result due to signal interference.",
            "diagnosis_list": [],
            "initial_test_options": []
        }

# --- PROMPTS ---
def get_sys_instruction():
    return "You are a Medical Simulation Engine. You must output ONLY valid JSON without markdown formatting."

def generate_case(difficulty: str):
    model = genai.GenerativeModel(MODEL_NAME, system_instruction=get_sys_instruction())
    
    prompt = f"""
    Generate a realistic medical case for a game. Difficulty: {difficulty}.
    The case must be solvable but require deduction.
    
    Output JSON strictly:
    {{
      "illness_name": "Exact medical name",
      "patient_intro": "2-3 sentences describing patient age, chief complaint, and initial vitals.",
      "correct_test": "The single most definitive test for this illness",
      "symptoms_hidden": "List of internal symptoms found only via tests",
      "explanation_correct": "Brief 1-2 sentence medical explanation of why the symptoms confirm this diagnosis.",
      "explanation_wrong": "Why other similar diagnoses are incorrect.",
      "initial_test_options": [
        "Test Option 1 (The Correct One)",
        "Test Option 2 (Plausible)",
        "Test Option 3 (Plausible)",
        "Test Option 4 (Distractor)",
        "Test Option 5 (Distractor)",
        "Test Option 6 (Distractor)"
      ],
      "diagnosis_list": [
        "Diagnosis 1 (The True Illness)",
        "Diagnosis 2 (Plausible)",
        "Diagnosis 3 (Plausible)",
        "Diagnosis 4 (Wrong)",
        "Diagnosis 5 (Wrong)",
        "Diagnosis 6 (Wrong)"
      ]
    }}
    """
    
    response = model.generate_content(prompt)
    return clean_and_parse_json(response.text)

def analyze_test_result(case_data, test_name):
    model = genai.GenerativeModel(MODEL_NAME, system_instruction=get_sys_instruction())
    
    prompt = f"""
    Patient has: {case_data['illness_name']}.
    Hidden symptoms: {case_data['symptoms_hidden']}.
    User performed test: {test_name}.
    Correct diagnostic test is: {case_data['correct_test']}.

    Output JSON strictly:
    {{
      "narrative": "What does the doctor see? If it's the correct test, reveal the specific hidden symptom. If it's a distractor, show normal or inconclusive results. Keep it clinical."
    }}
    """
    response = model.generate_content(prompt)
    return clean_and_parse_json(response.text)

# --- ROUTES ---

@app.post("/start_game")
async def start_game(req: GameStartRequest):
    game_id = str(uuid.uuid4())
    
    hp_map = {"easy": 100, "medium": 60, "hard": 20}
    start_hp = hp_map.get(req.difficulty, 100)
    
    case_data = generate_case(req.difficulty)
    
    games[game_id] = {
        "case": case_data,
        "hp": start_hp,
        "max_hp": start_hp,
        "difficulty": req.difficulty,
        "log": [],
        "status": "PLAYING"
    }
    
    return {
        "game_id": game_id,
        "patient_intro": case_data['patient_intro'],
        "test_options": case_data['initial_test_options'],
        "hp": start_hp,
        "max_hp": start_hp
    }

@app.post("/submit_test")
async def submit_test(req: TestSubmission):
    game = games.get(req.game_id)
    if not game: raise HTTPException(status_code=404, detail="Game not found")
    
    result = analyze_test_result(game['case'], req.test_name)
    
    game['log'].append({"type": "action", "text": f"Running {req.test_name}..."})
    game['log'].append({"type": "narrative", "text": result['narrative']})
    
    return {
        "narrative": result['narrative'],
        "diagnosis_options": game['case']['diagnosis_list']
    }

@app.post("/submit_diagnosis")
async def submit_diagnosis(req: DiagnosisSubmission):
    game = games.get(req.game_id)
    if not game: raise HTTPException(status_code=404, detail="Game not found")
    
    correct_illness = game['case']['illness_name']
    
    # Fuzzy match
    is_correct = (req.diagnosis_name.lower() in correct_illness.lower()) or \
                 (correct_illness.lower() in req.diagnosis_name.lower())
    
    response_data = {}
    
    if is_correct:
        game['status'] = "WON"
        response_data = {
            "status": "WIN",
            "message": f"CORRECT DIAGNOSIS: {correct_illness}",
            "analysis": game['case']['explanation_correct']
        }
    else:
        game['hp'] -= 20
        
        if game['hp'] <= 0:
            game['status'] = "LOST"
            # NEW: Explicitly formatted to include Illness + Test + Short Explanation
            response_data = {
                "status": "LOSE",
                "message": "PATIENT DECEASED.",
                "analysis": f"The patient actually had {correct_illness}. The definitive test required was {game['case']['correct_test']}. {game['case']['explanation_correct']}"
            }
        else:
            game['status'] = "PLAYING"
            response_data = {
                "status": "CONTINUE",
                "hp": game['hp'],
                "message": "INCORRECT DIAGNOSIS. Patient condition worsening.",
                "analysis": "That diagnosis does not match the clinical findings. Try a different test.",
                "test_options": game['case']['initial_test_options']
            }
            
    return response_data