# AI Pacman Game

A web-based implementation of Pacman with AI learning capabilities, featuring both manual gameplay and AI-controlled gameplay modes.

## Features

- **Dual Game Modes**
  - Manual gameplay with keyboard controls
  - AI-controlled gameplay using Q-learning
- **Real-time Learning Visualization**
  - Live performance metrics
  - Learning progress graphs
  - Generation tracking
- **Interactive UI**
  - Modern, responsive design
  - Floating ghost animations
  - Real-time stats display
- **AI Learning Features**
  - Q-learning implementation
  - Adaptive exploration rate
  - Performance tracking
  - Generation-based learning

## Prerequisites

- Python 3.7+
- Flask
- Matplotlib
- NumPy
- Pandas

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd AI-Pacman
```

2. Install required packages:
```bash
pip install -r requirements.txt
```

## Running the Application

1. Start the server:
```bash
python app.py
```

2. Access the application:
- Open your web browser
- Navigate to `http://127.0.0.1:5001` (or the port specified in the console)
- Login to access the game

Note: If port 5000 is in use (common on macOS), the application will automatically use port 5001.

## Game Controls

### Manual Mode
- **Arrow Keys**: Move Pacman
- **Space**: Pause/Resume game
- **R**: Reset game

### AI Mode
- **Start/Stop**: Control AI gameplay
- **Reset**: Restart AI learning
- **View Stats**: Monitor AI performance

## Project Structure

```
AI-Pacman/
├── app.py              # Main application entry point
├── static/             # Static assets
│   ├── js/            # JavaScript files
│   ├── css/           # Stylesheets
│   └── img/           # Images
├── templates/          # HTML templates
└── requirements.txt    # Python dependencies
```

## Features in Detail

### AI Learning
- Q-learning algorithm for decision making
- Adaptive exploration rate
- Performance tracking across generations
- Real-time learning visualization

### Game Mechanics
- Classic Pacman gameplay
- Ghost AI with different behaviors
- Power pellets and scoring system
- Collision detection

### UI/UX
- Responsive design
- Real-time stats display
- Interactive controls
- Visual feedback for AI learning

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Acknowledgments

- Original Pacman game by Namco
- Q-learning algorithm implementation
- Flask web framework
- Matplotlib for data visualization 
