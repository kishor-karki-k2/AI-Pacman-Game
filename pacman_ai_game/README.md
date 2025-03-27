# Pacman AI Learning Game

A web-based Pacman game that demonstrates AI learning through gameplay. This project is designed as an educational tool for K12 students to learn about AI concepts.

## Features

- Authentic Pacman gameplay with classic mechanics
- Dual game panels: Human player and AI player
- AI learning system that learns from human gameplay
- Generational learning with up to 100 generations
- Visual progress tracking of AI learning
- Attractive and intuitive user interface

## How It Works

1. Students play the game manually using the arrow keys in the left panel
2. The AI observes and learns from the student's gameplay
3. Students can then start the AI in the right panel to see how well it has learned
4. The AI will go through multiple generations, improving with each one
5. Performance metrics show the AI's learning progress

## Educational Value

This game demonstrates several key AI concepts:
- Reinforcement learning
- Q-learning algorithm
- Generational learning and evolution
- State representation
- Action selection and exploration vs. exploitation

## Technical Implementation

- Frontend: HTML, CSS, JavaScript
- Backend: Python with Flask
- AI: Custom Q-learning implementation

## Installation

1. Clone this repository
2. Install requirements:
   ```
   pip install -r requirements.txt
   ```
3. Run the application:
   ```
   python app.py
   ```
4. Open a web browser and navigate to:
   ```
   http://localhost:5000
   ```

## Controls

- **Arrow Keys**: Move Pacman (in the player game)
- **Space**: Pause/Resume game
- **Start Game**: Begin player gameplay
- **Reset Game**: Reset player game to initial state
- **Start AI**: Begin AI gameplay (after training from player data)
- **Reset AI**: Reset AI learning and generations

## Project Structure

```
pacman_ai_game/
├── app.py               # Flask application
├── static/
│   ├── css/
│   │   └── style.css    # Game styling
│   ├── js/
│   │   ├── game.js      # Core game logic
│   │   ├── ai.js        # AI learning implementation 
│   │   └── main.js      # Main app initialization
│   └── images/          # Game assets (optional)
├── templates/
│   └── index.html       # Main game page
├── models/              # For saving AI models (optional)
└── requirements.txt     # Python dependencies
```

## Credits

Created for educational purposes to teach K12 students about artificial intelligence concepts through interactive gameplay. 