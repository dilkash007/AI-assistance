import os
import webbrowser
import datetime
import google.generativeai as genai
from flask import Flask, render_template, request, jsonify

# ==============================================================================
# === 1. CONFIGURATION (API KEY AUR MODEL) =====================================
# ==============================================================================

try:
    API_KEY = os.environ.get("AIzaSyDOqjMZ77FuEH3yOQkGq-vUe6IimqCecdo")
    genai.configure(api_key="AIzaSyDOqjMZ77FuEH3yOQkGq-vUe6IimqCecdo")
except TypeError:
    print("❌ GENAI_API_KEY environment variable not set.")
    API_KEY = input("Please paste your Gemini API key here: ")
    genai.configure(api_key=API_KEY)

model = genai.GenerativeModel('gemini-2.0-flash')
chat_session = model.start_chat(history=[])

# ==============================================================================
# === 2. FLASK APP SETUP =======================================================
# ==============================================================================

app = Flask(__name__)

# ==============================================================================
# === 3. CORE LOGIC (INTENT ANALYSIS & EXECUTION) ==============================
# ==============================================================================

def analyze_user_input(prompt):
    lower_prompt = prompt.lower().strip()
    if not lower_prompt: return "Unknown"
    
    information_keywords = ['kaise', 'kya', 'kyon', 'kab', 'kahan', 'kon', 'who', 'what', 'where', 'when', 'why', 'how', '?', 'batao', 'samjhao', 'explain', 'tell me', 'define']
    action_keywords = ['play', 'run', 'open', 'start', 'execute', 'close', 'create', 'send', 'bajao', 'chalao', 'kholo', 'band karo', 'time', 'samay']
    
    if any(keyword in lower_prompt for keyword in information_keywords): return "Question"
    if any(keyword in lower_prompt for keyword in action_keywords): return "Command"
    return "Question" # Default to question if unsure

def execute_command(command):
    cmd = command.lower()
    response_text = ""
    
    if 'open youtube' in cmd:
        webbrowser.open("https://www.youtube.com")
        response_text = "Thik hai, YouTube khol raha hoon..."
    elif 'open google' in cmd:
        webbrowser.open("https://www.google.com")
        response_text = "Thik hai, Google khol raha hoon..."
    elif 'time kya hai' in cmd or 'samay batao' in cmd:
        current_time = datetime.datetime.now().strftime("%I:%M %p")
        response_text = f"Abhi samay hai: {current_time}"
    else:
        # Note: 'os.system' and file access commands are not suitable for a web server.
        # They will run on the server, not the user's computer.
        # We are keeping this simple for demonstration.
        response_text = f"Maaf kijiye, main web interface se '{command}' execute nahi kar sakta."
        
    return response_text

def get_ai_response(prompt):
    try:
        response = chat_session.send_message(prompt)
        return response.text
    except Exception as e:
        return f"AI se response lene mein error aaya: {e}"

# ==============================================================================
# === 4. FLASK ROUTES ==========================================================
# ==============================================================================

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/chat", methods=["POST"])
def chat():
    user_message = request.json.get("message")
    
    intent = analyze_user_input(user_message)
    
    if intent == "Command":
        bot_response = execute_command(user_message)
    else: # Question or Unknown
        bot_response = get_ai_response(user_message)
        
    return jsonify({"reply": bot_response})

# ==============================================================================
# === 5. RUN THE APP ===========================================================
# ==============================================================================

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)