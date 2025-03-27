from flask import Flask, render_template, jsonify
import os

app = Flask(__name__, 
            static_folder='static',
            template_folder='templates')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/save_game_data', methods=['POST'])
def save_game_data():
    # This endpoint will be used to save the game play data for AI training
    # Will be implemented later
    return jsonify({"status": "success"})

if __name__ == '__main__':
    app.run(debug=True)     