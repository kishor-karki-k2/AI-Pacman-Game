// Game Constants
const CELL_SIZE = 20;
const ROWS = 26;
const COLS = 22;
const PACMAN_SPEED = 2;
const GHOST_SPEED = 1.5;
const DIRECTIONS = {
    UP: { x: 0, y: -1 },
    DOWN: { x: 0, y: 1 },
    LEFT: { x: -1, y: 0 },
    RIGHT: { x: 1, y: 0 }
};

// Sample maze layout (1: wall, 0: path, 2: dot, 3: power pellet, 4: ghost house, 5: pacman spawn)
const mazeLayout = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1],
    [1, 3, 1, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1],
    [1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 2, 1],
    [1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 2, 1],
    [1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 1],
    [1, 1, 1, 1, 1, 2, 1, 1, 1, 0, 1, 0, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 2, 1, 0, 1, 1, 4, 1, 1, 0, 1, 2, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 2, 1, 0, 1, 4, 4, 4, 1, 0, 1, 2, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 2, 0, 0, 1, 4, 4, 4, 1, 0, 0, 2, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 2, 1, 0, 1, 1, 1, 1, 1, 0, 1, 2, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 2, 1, 0, 1, 1, 1, 1, 1, 0, 1, 2, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 2, 1, 0, 1, 1, 1, 1, 1, 0, 1, 2, 1, 1, 1, 1, 1, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1],
    [1, 3, 2, 2, 1, 2, 2, 2, 2, 2, 5, 2, 2, 2, 2, 2, 1, 2, 2, 2, 3, 1],
    [1, 1, 1, 2, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 2, 1, 1, 1, 1],
    [1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

// PacmanGame class
class PacmanGame {
    constructor(canvasId, isAI = false) {
        // Canvas setup
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error(`Canvas with ID ${canvasId} not found!`);
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = COLS * CELL_SIZE + 10;
        this.canvas.height = ROWS * CELL_SIZE + 20;
        
        // Game state
        this.isAI = isAI;
        this.gameStarted = false;
        this.paused = true;
        this.gameOver = false;
        this.gameWon = false;
        this.score = 0;
        this.lives = 3;
        this.powerMode = false;
        this.powerModeTimer = null;
        this.animationFrame = null;
        this.ghostSpawnRate = 1.0;
        this.gameData = [];
        
        // Direction state
        this.currentDirection = DIRECTIONS.RIGHT;
        this.nextDirection = DIRECTIONS.RIGHT;
        
        // Initialize game
        this.reset();
        
        // Setup input handlers for human players
        if (!isAI) {
            this.setupKeyListeners();
        }
        
        // Initial render
        this.render();
        
        console.log(`${isAI ? 'AI' : 'Player'} game initialized with canvas ${canvasId}`);
    }
    
    // Setup keyboard controls for human player
    setupKeyListeners() {
        document.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'ArrowUp':
                    this.nextDirection = DIRECTIONS.UP;
                    break;
                case 'ArrowDown':
                    this.nextDirection = DIRECTIONS.DOWN;
                    break;
                case 'ArrowLeft':
                    this.nextDirection = DIRECTIONS.LEFT;
                    break;
                case 'ArrowRight':
                    this.nextDirection = DIRECTIONS.RIGHT;
                    break;
                case ' ':  // Space bar
                    if (this.gameOver) {
                        this.reset();
                        this.start();
                    } else {
                        this.togglePause();
                    }
                    break;
            }
            
            // Record game data for AI learning if game is running
            if (this.gameStarted && !this.paused) {
                this.recordGameData();
            }
        });
    }
    
    // Start the game
    start() {
        console.log("Starting game...");
        
        // Cancel any existing animation frame
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        
        // Reset the game state if needed
        if (this.gameOver) {
            this.reset();
        }
        
        // Set the game state to running
        this.gameStarted = true;
        this.paused = false;
        this.gameOver = false;
        
        // Start the game loop
        this.runGameLoop();
        
        console.log("Game started");
    }
    
    // Reset the game to initial state
    reset() {
        console.log("Resetting game");
        
        // Reset game state
        this.score = 0;
        this.lives = 3;
        this.gameOver = false;
        this.gameWon = false;
        this.paused = true;
        this.powerMode = false;
        
        // Reset directions
        this.currentDirection = DIRECTIONS.RIGHT;
        this.nextDirection = DIRECTIONS.RIGHT;
        
        // Clear power mode timer
        if (this.powerModeTimer) {
            clearTimeout(this.powerModeTimer);
            this.powerModeTimer = null;
        }
        
        // Reset maze and count dots
        this.maze = JSON.parse(JSON.stringify(mazeLayout));
        this.countDots();
        this.totalDots = this.dotsRemaining;
        
        // Initialize pacman and ghosts
        this.initPacman();
        this.initGhosts();
        
        // Update UI
        this.updateScore();
        this.updateLives();
        
        // Render the initial state
        this.render();
        
        console.log("Game reset complete");
    }
    
    // Run the main game loop
    runGameLoop() {
        let lastTime = performance.now();
        
        const gameLoop = (timestamp) => {
            // Calculate time since last frame
            const deltaTime = timestamp - lastTime;
            
            // Handle large time gaps (tab inactive, etc.)
            if (deltaTime < 0 || deltaTime > 100) {
                lastTime = timestamp;
                this.animationFrame = requestAnimationFrame(gameLoop);
                return;
            }
            
            // Update game state if not paused or game over
            if (!this.paused && !this.gameOver) {
                this.update(deltaTime / 16.67);  // Normalize to roughly 60fps
                lastTime = timestamp;
            }
            
            // Always render
            this.render();
            
            // Continue the loop
            this.animationFrame = requestAnimationFrame(gameLoop);
        };
        
        // Start the loop
        this.animationFrame = requestAnimationFrame(gameLoop);
    }
    
    // Toggle pause state
    togglePause() {
        if (!this.gameOver && this.gameStarted) {
            this.paused = !this.paused;
            console.log(this.paused ? "Game paused" : "Game resumed");
        }
    }
    
    // Update game state
    update(speedFactor = 1) {
        // Skip if game is over or paused
        if (this.gameOver || this.paused) return;
        
        // Check win condition
        if (this.dotsRemaining <= 0) {
            this.gameOver = true;
            this.gameWon = true;
            return;
        }
        
        // Check collisions
        this.checkCollisions();
        
        // Stop if game over after collision
        if (this.gameOver) return;
        
        // Move characters
        this.movePacman();
        this.moveGhosts();
        
        // Check for dot collection
        this.checkDotCollision();
        
        // Record data for AI learning
        if (this.isAI) {
            this.recordGameData();
        }
    }
    
    // Render game state
    render() {
        if (!this.canvas || !this.ctx) return;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background
        this.ctx.fillStyle = this.isAI ? '#1a1a3a' : '#1a2a1a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw maze
        this.drawMaze();
        
        // Draw pacman and ghosts
        if (this.pacman) this.drawPacman();
        if (this.ghosts) this.drawGhosts();
        
        // Draw game messages
        if (this.gameOver) {
            this.drawMessage(this.gameWon ? "You Win!" : "Game Over");
        } else if (this.paused && this.gameStarted) {
            this.drawMessage("Paused");
        }
        
        // Draw border
        this.ctx.strokeStyle = this.isAI ? '#6a2c70' : '#2c6a50';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    // Count dots in the maze
    countDots() {
        this.dotsRemaining = 0;
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                if (this.maze[row][col] === 2 || this.maze[row][col] === 3) {
                    this.dotsRemaining++;
                }
            }
        }
    }
    
    // Update score display
    updateScore() {
        const scoreElement = document.getElementById(this.isAI ? 'ai-score' : 'player-score');
        if (scoreElement) {
            scoreElement.textContent = this.score;
        }
    }
    
    // Update lives display
    updateLives() {
        if (!this.isAI) {
            const livesElement = document.getElementById('player-lives');
            if (livesElement) {
                livesElement.textContent = this.lives;
            }
        }
    }
    
    // Record game data for AI learning
    recordGameData() {
        if (!this.pacman || !this.ghosts) return;
        
        this.gameData.push({
            position: { x: this.pacman.x, y: this.pacman.y },
            direction: this.currentDirection,
            ghosts: this.ghosts.map(ghost => ({ x: ghost.x, y: ghost.y, isVulnerable: ghost.isVulnerable })),
            score: this.score,
            powerMode: this.powerMode,
            dotsEaten: this.totalDots - this.dotsRemaining
        });
        
        // Limit data size to prevent memory issues
        if (this.gameData.length > 10000) {
            this.gameData = this.gameData.slice(-5000);
        }
    }
    
    // Draw message overlay
    drawMessage(message) {
        // Dark overlay
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Message text
        this.ctx.fillStyle = 'white';
        this.ctx.font = '30px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(message, this.canvas.width / 2, this.canvas.height / 2);
        
        // Instructions
        this.ctx.font = '20px Arial';
        this.ctx.fillText('Press Space to continue', this.canvas.width / 2, this.canvas.height / 2 + 40);
    }
    
    // Initialize Pacman
    initPacman() {
        // Y offset for positioning
        const yOffset = 10;
        
        // Default position if spawn not found
        let pacmanX = 11 * CELL_SIZE + CELL_SIZE / 2;
        let pacmanY = 20 * CELL_SIZE + CELL_SIZE / 2 + yOffset;
        
        // Find Pacman spawn point in maze
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                if (this.maze[row][col] === 5) {
                    pacmanX = col * CELL_SIZE + CELL_SIZE / 2;
                    pacmanY = row * CELL_SIZE + CELL_SIZE / 2 + yOffset;
                    this.maze[row][col] = 0; // Clear spawn point
                    break;
                }
            }
        }
        
        // Create Pacman object
        this.pacman = {
            x: pacmanX,
            y: pacmanY,
            speed: PACMAN_SPEED,
            radius: CELL_SIZE / 2 - 2,
            mouthAngle: 0.2,
            animation: 0
        };
        
        // Set initial direction
        this.currentDirection = DIRECTIONS.RIGHT;
        this.nextDirection = DIRECTIONS.RIGHT;
    }
    
    // Initialize ghosts
    initGhosts() {
        this.ghosts = [];
        const yOffset = 10;
        
        // Define ghost spawn positions
        const ghostSpawnPositions = [
            // Blinky (red) at ghost house entry
            { x: 11 * CELL_SIZE + CELL_SIZE / 2, y: 11 * CELL_SIZE + CELL_SIZE / 2 + yOffset },
            // Pinky (pink) in ghost house
            { x: 10 * CELL_SIZE + CELL_SIZE / 2, y: 13 * CELL_SIZE + CELL_SIZE / 2 + yOffset },
            // Inky (blue) in ghost house
            { x: 11 * CELL_SIZE + CELL_SIZE / 2, y: 13 * CELL_SIZE + CELL_SIZE / 2 + yOffset },
            // Clyde (orange) in ghost house
            { x: 12 * CELL_SIZE + CELL_SIZE / 2, y: 13 * CELL_SIZE + CELL_SIZE / 2 + yOffset }
        ];
        
        const ghostColors = ['red', 'pink', 'blue', 'orange'];
        const ghostNames = ['Blinky', 'Pinky', 'Inky', 'Clyde'];
        
        // Calculate number of ghosts to spawn based on spawn rate
        const baseGhostCount = 4;
        const targetGhostCount = Math.max(1, Math.round(baseGhostCount * this.ghostSpawnRate));
        
        // Create ghosts
        for (let i = 0; i < targetGhostCount; i++) {
            const pos = ghostSpawnPositions[i % ghostSpawnPositions.length];
            const ghostColor = ghostColors[i % ghostColors.length];
            const ghostName = ghostNames[i % ghostNames.length];
            
            // Personality traits for different ghost types
            let personality = {
                speedModifier: 1.0,
                directness: 0.7,
                lookAhead: 4
            };
            
            // Customize personality based on ghost type
            switch (ghostColor) {
                case 'red': // Blinky - aggressive
                    personality.speedModifier = 1.05;
                    personality.directness = 0.85;
                    personality.lookAhead = 5;
                    break;
                case 'pink': // Pinky - ambush
                    personality.speedModifier = 1.0;
                    personality.directness = 0.7;
                    personality.lookAhead = 6;
                    break;
                case 'blue': // Inky - unpredictable
                    personality.speedModifier = 0.95;
                    personality.directness = 0.6;
                    personality.lookAhead = 4;
                    break;
                case 'orange': // Clyde - random
                    personality.speedModifier = 0.9;
                    personality.directness = 0.5;
                    personality.lookAhead = 3;
                    personality.scatterDistance = 8;
                    break;
            }
            
            // Create ghost
            this.ghosts.push({
                x: pos.x,
                y: pos.y,
                direction: { x: 0, y: -1 },  // Start moving up
                speed: GHOST_SPEED * personality.speedModifier,
                color: ghostColor,
                name: ghostName,
                personality: personality,
                isVulnerable: false,
                exitingHouse: ghostColor === 'red' ? false : true, // Only red ghost starts outside
                stuck: 0
            });
        }
    }
    
    // Move Pacman
    movePacman() {
        if (!this.pacman) return;
        
        // Calculate next position based on current direction
        const nextPosX = this.pacman.x + this.currentDirection.x * this.pacman.speed;
        const nextPosY = this.pacman.y + this.currentDirection.y * this.pacman.speed;
        
        // Check if trying to change direction
        if (this.nextDirection !== this.currentDirection) {
            // Try changing direction if near a cell center
            if (this.isNearCellCenter(this.pacman.x, this.pacman.y)) {
                // Get grid coordinates
                const col = Math.floor(this.pacman.x / CELL_SIZE);
                const row = Math.floor((this.pacman.y - 10) / CELL_SIZE);
                
                // Calculate center of current cell
                const cellCenterX = col * CELL_SIZE + CELL_SIZE / 2;
                const cellCenterY = row * CELL_SIZE + CELL_SIZE / 2 + 10;
                
                // Test if pacman can move in the desired direction
                const newX = cellCenterX + this.nextDirection.x * CELL_SIZE / 2;
                const newY = cellCenterY + this.nextDirection.y * CELL_SIZE / 2;
                
                // Check if the next direction is valid (not a wall)
                if (!this.isWall(newX, newY)) {
                    // Align with cell center for clean turn
                    this.pacman.x = cellCenterX;
                    this.pacman.y = cellCenterY;
                    this.currentDirection = this.nextDirection;
                }
            }
        }
        
        // Check if next position is valid (not a wall)
        if (!this.isWall(nextPosX, nextPosY)) {
            this.pacman.x = nextPosX;
            this.pacman.y = nextPosY;
            
            // Handle screen wrapping (tunnels)
            this.handleScreenWrapping(this.pacman);
        } else {
            // If hitting a wall, align with grid to prevent sliding
            this.alignWithGrid();
        }
        
        // Update mouth animation
        this.pacman.animation += 0.2;
        this.pacman.mouthAngle = 0.1 + Math.abs(Math.sin(this.pacman.animation)) * 0.4;
    }
    
    // Move Ghosts
    moveGhosts() {
        if (!this.ghosts || !this.pacman) return;
        
        this.ghosts.forEach((ghost, index) => {
            if (!ghost) return;
            
            // Handle ghost house exit logic
            if (ghost.exitingHouse) {
                this.handleGhostHouseExit(ghost, index);
                return;
            }
            
            // Check if ghost is at a grid center point for direction decisions
            if (this.isAtGridCenter(ghost.x, ghost.y)) {
                // Determine next direction using ghost AI
                const nextDirection = this.getGhostNextDirection(ghost);
                if (nextDirection) {
                    ghost.direction = nextDirection;
                    ghost.stuck = 0; // Reset stuck counter when changing direction
                }
            }
            
            // Calculate next position
            const nextX = ghost.x + ghost.direction.x * ghost.speed;
            const nextY = ghost.y + ghost.direction.y * ghost.speed;
            
            // Check if next position is valid
            if (!this.isWall(nextX, nextY)) {
                ghost.x = nextX;
                ghost.y = nextY;
                ghost.stuck = 0; // Reset stuck counter when moving successfully
            } else {
                // Ghost hit wall, try to find a new direction
                const availableDirections = this.getAvailableDirections(ghost.x, ghost.y);
                if (availableDirections.length > 0) {
                    ghost.direction = availableDirections[Math.floor(Math.random() * availableDirections.length)];
                }
                ghost.stuck++; // Increment stuck counter
                
                // If ghost is stuck for too long, teleport
                if (ghost.stuck > 10) {
                    this.ghostBuster(ghost);
                }
            }
            
            // Handle screen wrapping (tunnels)
            this.handleScreenWrapping(ghost);
        });
    }
    
    // Handle ghost exiting the ghost house
    handleGhostHouseExit(ghost, index) {
        // Target position above the ghost house
        const exitX = 11 * CELL_SIZE + CELL_SIZE / 2;
        const exitY = 10 * CELL_SIZE + CELL_SIZE / 2 + 10;
        
        // Move towards exit
        const dx = exitX - ghost.x;
        const dy = exitY - ghost.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < ghost.speed) {
            // Arrived at exit, start normal movement
            ghost.x = exitX;
            ghost.y = exitY;
            ghost.exitingHouse = false;
            ghost.direction = { x: 0, y: -1 }; // Start by moving up
        } else {
            // Move towards exit
            ghost.x += (dx / distance) * ghost.speed;
            ghost.y += (dy / distance) * ghost.speed;
        }
    }
    
    // Get the next direction for a ghost using AI
    getGhostNextDirection(ghost) {
        if (!this.pacman) return { x: 0, y: -1 };
        
        // If ghost is vulnerable, run away
        if (ghost.isVulnerable) {
            return this.getFleeingDirection(ghost);
        }
        
        // Add some randomness to prevent predictable patterns
        if (Math.random() < 0.1) {
            const availableDirections = this.getAvailableDirections(ghost.x, ghost.y);
            if (availableDirections.length > 0) {
                return availableDirections[Math.floor(Math.random() * availableDirections.length)];
            }
        }
        
        // Different strategy for each ghost type
        switch (ghost.color) {
            case 'red': // Directly chase Pacman
                return this.getDirectChasingDirection(ghost);
                
            case 'pink': // Try to ambush by targeting ahead of Pacman
                return this.getAmbushDirection(ghost);
                
            case 'blue': // Clever strategy
                return this.getCleverDirection(ghost);
                
            case 'orange': // Random with some chasing
                // Scatter when close to Pacman
                const distanceToPacman = Math.sqrt(
                    Math.pow(ghost.x - this.pacman.x, 2) + 
                    Math.pow(ghost.y - this.pacman.y, 2)
                );
                
                if (distanceToPacman < (ghost.personality?.scatterDistance || 6) * CELL_SIZE) {
                    return this.getFleeingDirection(ghost);
                } else {
                    return this.getRandomizedChasingDirection(ghost);
                }
                
            default:
                return this.getDirectChasingDirection(ghost);
        }
    }
    
    // Ghost flees from Pacman (used during power mode)
    getFleeingDirection(ghost) {
        // Get available directions
        const availableDirections = this.getAvailableDirections(ghost.x, ghost.y);
        if (availableDirections.length === 0) return ghost.direction;
        
        // Find direction furthest from Pacman
        let bestDirection = null;
        let maxDistance = -1;
        
        for (const dir of availableDirections) {
            const newX = ghost.x + dir.x * CELL_SIZE;
            const newY = ghost.y + dir.y * CELL_SIZE;
            
            const distance = Math.sqrt(
                Math.pow(newX - this.pacman.x, 2) + 
                Math.pow(newY - this.pacman.y, 2)
            );
            
            if (distance > maxDistance) {
                maxDistance = distance;
                bestDirection = dir;
            }
        }
        
        return bestDirection || ghost.direction;
    }
    
    // Red ghost behavior: Direct chasing
    getDirectChasingDirection(ghost) {
        return this.getDirectionToTarget(ghost.x, ghost.y, this.pacman.x, this.pacman.y);
    }
    
    // Pink ghost behavior: Ambush by targeting ahead of Pacman
    getAmbushDirection(ghost) {
        // Target 4 cells ahead of Pacman's direction
        const targetCells = 4;
        const targetX = this.pacman.x + (this.currentDirection.x * CELL_SIZE * targetCells);
        const targetY = this.pacman.y + (this.currentDirection.y * CELL_SIZE * targetCells);
        
        return this.getDirectionToTarget(ghost.x, ghost.y, targetX, targetY);
    }
    
    // Blue ghost behavior: Clever strategy
    getCleverDirection(ghost) {
        // Find the red ghost
        const redGhost = this.ghosts.find(g => g && g.color === 'red');
        
        let targetX, targetY;
        
        if (redGhost) {
            // Position is determined by reflecting Pacman's position relative to red ghost
            const vectorX = this.pacman.x - redGhost.x;
            const vectorY = this.pacman.y - redGhost.y;
            
            targetX = this.pacman.x + vectorX;
            targetY = this.pacman.y + vectorY;
        } else {
            // If no red ghost, just chase
            return this.getDirectChasingDirection(ghost);
        }
        
        return this.getDirectionToTarget(ghost.x, ghost.y, targetX, targetY);
    }
    
    // Orange ghost behavior: Random with some chasing
    getRandomizedChasingDirection(ghost) {
        if (Math.random() < 0.6) {
            return this.getDirectChasingDirection(ghost);
        } else {
            const availableDirections = this.getAvailableDirections(ghost.x, ghost.y);
            if (availableDirections.length > 0) {
                return availableDirections[Math.floor(Math.random() * availableDirections.length)];
            } else {
                return ghost.direction;
            }
        }
    }
    
    // Helper function to get direction to target
    getDirectionToTarget(fromX, fromY, toX, toY) {
        const availableDirections = this.getAvailableDirections(fromX, fromY);
        if (availableDirections.length === 0) return { x: 0, y: -1 };
        
        // Find direction that gets closest to target
        let bestDirection = null;
        let minDistance = Infinity;
        
        for (const dir of availableDirections) {
            const newX = fromX + dir.x * CELL_SIZE;
            const newY = fromY + dir.y * CELL_SIZE;
            
            const distance = Math.sqrt(
                Math.pow(newX - toX, 2) + 
                Math.pow(newY - toY, 2)
            );
            
            if (distance < minDistance) {
                minDistance = distance;
                bestDirection = dir;
            }
        }
        
        return bestDirection || availableDirections[0];
    }
    
    // Get all available directions from a position
    getAvailableDirections(x, y) {
        const directions = [];
        
        // Check each direction
        for (const dir of Object.values(DIRECTIONS)) {
            const newX = x + dir.x * CELL_SIZE / 2;
            const newY = y + dir.y * CELL_SIZE / 2;
            
            if (!this.isWall(newX, newY)) {
                directions.push(dir);
            }
        }
        
        return directions;
    }
    
    // Check if a position is at a grid center
    isAtGridCenter(x, y) {
        const col = Math.floor(x / CELL_SIZE);
        const row = Math.floor((y - 10) / CELL_SIZE);
        const centerX = col * CELL_SIZE + CELL_SIZE / 2;
        const centerY = row * CELL_SIZE + CELL_SIZE / 2 + 10;
        
        return Math.abs(x - centerX) < 3 && Math.abs(y - centerY) < 3;
    }
    
    // Check if a position is near a cell center
    isNearCellCenter(x, y) {
        const col = Math.floor(x / CELL_SIZE);
        const row = Math.floor((y - 10) / CELL_SIZE);
        const centerX = col * CELL_SIZE + CELL_SIZE / 2;
        const centerY = row * CELL_SIZE + CELL_SIZE / 2 + 10;
        
        // Use a threshold for proximity to center
        const threshold = CELL_SIZE * 0.4;
        return Math.abs(x - centerX) < threshold && Math.abs(y - centerY) < threshold;
    }
    
    // Align Pacman with the grid when hitting a wall
    alignWithGrid() {
        if (!this.pacman) return;
        
        const col = Math.floor(this.pacman.x / CELL_SIZE);
        const row = Math.floor((this.pacman.y - 10) / CELL_SIZE);
        
        // Align to center of current cell based on movement direction
        if (this.currentDirection.x !== 0) { // Moving horizontally
            this.pacman.y = row * CELL_SIZE + CELL_SIZE / 2 + 10;
        }
        if (this.currentDirection.y !== 0) { // Moving vertically
            this.pacman.x = col * CELL_SIZE + CELL_SIZE / 2;
        }
    }
    
    // Handle screen wrapping for entities
    handleScreenWrapping(entity) {
        if (!entity) return;
        
        // Wrap horizontally (tunnels)
        if (entity.x < -CELL_SIZE) {
            entity.x = this.canvas.width;
        } else if (entity.x > this.canvas.width + CELL_SIZE) {
            entity.x = 0;
        }
        
        // Constrain vertically
        if (entity.y < 10) { // Account for yOffset
            entity.y = 10;
        } else if (entity.y > this.canvas.height) {
            entity.y = this.canvas.height;
        }
    }
    
    // Ghost rescue function for stuck ghosts
    ghostBuster(ghost) {
        if (!ghost) return;
        
        // Find a valid position
        const validPosition = this.findValidGhostPosition();
        ghost.x = validPosition.x;
        ghost.y = validPosition.y;
        ghost.stuck = 0;
        
        // Assign a new random direction
        const availableDirections = this.getAvailableDirections(ghost.x, ghost.y);
        if (availableDirections.length > 0) {
            ghost.direction = availableDirections[Math.floor(Math.random() * availableDirections.length)];
        } else {
            ghost.direction = { x: 0, y: -1 }; // Default up
        }
    }
    
    // Find a valid position for a ghost
    findValidGhostPosition() {
        const yOffset = 10;
        
        // Try positions near the center of the maze
        for (let row = 11; row < 15; row++) {
            for (let col = 9; col < 14; col++) {
                const x = col * CELL_SIZE + CELL_SIZE / 2;
                const y = row * CELL_SIZE + CELL_SIZE / 2 + yOffset;
                
                if (!this.isWall(x, y)) {
                    return { x, y };
                }
            }
        }
        
        // Fallback to a default position
        return { 
            x: 11 * CELL_SIZE + CELL_SIZE / 2, 
            y: 14 * CELL_SIZE + CELL_SIZE / 2 + yOffset 
        };
    }
    
    // Check if a position is a wall
    isWall(x, y) {
        const yOffset = 10;
        const adjustedY = y - yOffset;
        
        // Get grid coordinates
        const col = Math.floor(x / CELL_SIZE);
        const row = Math.floor(adjustedY / CELL_SIZE);
        
        // Check bounds
        if (col < 0 || col >= COLS || row < 0 || row >= ROWS) {
            // Allow horizontal wrapping for tunnels
            if (row >= 0 && row < ROWS) {
                return false;
            }
            return true;
        }
        
        // Check if position is a wall
        return this.maze[row][col] === 1;
    }
    
    // Draw the maze
    drawMaze() {
        const yOffset = 10;
        
        // Clear the background
        this.ctx.fillStyle = '#000'; 
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw the maze elements
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                const x = col * CELL_SIZE;
                const y = row * CELL_SIZE + yOffset;
                
                // Get the cell type
                const cell = this.maze[row][col];
                
                // Draw different elements based on cell type
                switch (cell) {
                    case 1: // Wall
                        this.drawWall(x, y, CELL_SIZE, CELL_SIZE);
                        break;
                    case 2: // Dot
                        this.drawDot(x, y);
                        break;
                    case 3: // Power pellet
                        this.drawPowerPellet(x, y);
                        break;
                    case 4: // Ghost house
                        this.drawGhostHouse(x, y);
                        break;
                }
            }
        }
        
        // Draw ghost house door
        this.drawGhostHouseDoor();
    }
    
    // Draw wall
    drawWall(x, y, width, height) {
        // Wall color based on game type
        const baseColor = this.isAI ? '#4527A0' : '#00695C';
        
        // Fill wall
        this.ctx.fillStyle = baseColor;
        this.ctx.fillRect(x, y, width, height);
        
        // Add 3D effect with highlights and shadows
        this.ctx.beginPath();
        this.ctx.moveTo(x, y + height);
        this.ctx.lineTo(x, y);
        this.ctx.lineTo(x + width, y);
        this.ctx.strokeStyle = this.lightenColor(baseColor, 50);
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        this.ctx.beginPath();
        this.ctx.moveTo(x, y + height);
        this.ctx.lineTo(x + width, y + height);
        this.ctx.lineTo(x + width, y);
        this.ctx.strokeStyle = this.darkenColor(baseColor, 50);
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }
    
    // Draw dot
    drawDot(x, y) {
        this.ctx.fillStyle = '#FFD700';
        this.ctx.beginPath();
        this.ctx.arc(
            x + CELL_SIZE / 2, 
            y + CELL_SIZE / 2, 
            CELL_SIZE / 10, 
            0, 
            Math.PI * 2
        );
        this.ctx.fill();
    }
    
    // Draw power pellet
    drawPowerPellet(x, y) {
        // Pulsating effect
        const pulseSize = 1 + 0.2 * Math.sin(Date.now() / 200);
        
        // Glow effect
        this.ctx.shadowColor = '#FFD700';
        this.ctx.shadowBlur = 8;
        
        // Draw pellet
        this.ctx.fillStyle = '#FFD700';
        this.ctx.beginPath();
        this.ctx.arc(
            x + CELL_SIZE / 2, 
            y + CELL_SIZE / 2, 
            CELL_SIZE / 4 * pulseSize, 
            0, 
            Math.PI * 2
        );
        this.ctx.fill();
        
        // Reset shadow
        this.ctx.shadowBlur = 0;
        this.ctx.shadowColor = 'transparent';
    }
    
    // Draw ghost house
    drawGhostHouse(x, y) {
        this.ctx.fillStyle = 'rgba(255, 100, 100, 0.1)';
        this.ctx.fillRect(x + 2, y + 2, CELL_SIZE - 4, CELL_SIZE - 4);
    }
    
    // Draw ghost house door
    drawGhostHouseDoor() {
        const yOffset = 10;
        
        // Door position (hardcoded based on maze layout)
        const doorX = 11 * CELL_SIZE;
        const doorY = 11 * CELL_SIZE + yOffset;
        const doorWidth = CELL_SIZE;
        const doorHeight = 3;
        
        // Draw door with gradient
        const doorGrad = this.ctx.createLinearGradient(
            doorX, doorY, doorX + doorWidth, doorY
        );
        doorGrad.addColorStop(0, '#FF6666');
        doorGrad.addColorStop(0.5, '#FF0000');
        doorGrad.addColorStop(1, '#CC0000');
        
        this.ctx.fillStyle = doorGrad;
        this.ctx.fillRect(doorX, doorY, doorWidth, doorHeight);
        
        // Add highlight
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.fillRect(doorX, doorY, doorWidth, 1);
    }
    
    // Draw Pacman
    drawPacman() {
        if (!this.pacman) return;
        
        this.ctx.save();
        
        // Translate to Pacman's position
        this.ctx.translate(this.pacman.x, this.pacman.y);
        
        // Rotate based on direction
        let rotation = 0;
        if (this.currentDirection.x === 1) rotation = 0;
        else if (this.currentDirection.x === -1) rotation = Math.PI;
        else if (this.currentDirection.y === -1) rotation = -Math.PI/2;
        else if (this.currentDirection.y === 1) rotation = Math.PI/2;
        
        this.ctx.rotate(rotation);
        
        // Draw Pacman body
        this.ctx.fillStyle = '#FFFF00';
        this.ctx.beginPath();
        
        // Dynamic mouth angle for chomping animation
        const mouthAngle = this.pacman.mouthAngle;
        
        this.ctx.arc(
            0, 
            0, 
            this.pacman.radius, 
            mouthAngle, 
            Math.PI * 2 - mouthAngle
        );
        
        this.ctx.lineTo(0, 0);
        this.ctx.closePath();
        this.ctx.fill();
        
        this.ctx.restore();
    }
    
    // Draw ghosts
    drawGhosts() {
        if (!this.ghosts) return;
        
        this.ghosts.forEach(ghost => {
            if (!ghost) return;
            
            const { x, y, color, isVulnerable } = ghost;
            const ghostRadius = CELL_SIZE / 2 - 2;
            
            // Determine ghost color
            let ghostColor;
            if (isVulnerable) {
                // Blinking effect when power-up is about to end
                if (this.powerMode && this.powerModeTimer && 
                    Date.now() - (this.powerModeEndTime - 2000) > 0) {
                    // Alternate between blue and white
                    ghostColor = Math.floor(Date.now() / 250) % 2 === 0 ? '#0000FF' : '#FFFFFF';
                } else {
                    ghostColor = '#0000FF'; // Blue when vulnerable
                }
            } else {
                // Normal colors
                switch (color) {
                    case 'red': ghostColor = '#FF0000'; break;
                    case 'pink': ghostColor = '#FFB8FF'; break;
                    case 'blue': ghostColor = '#00FFFF'; break;
                    case 'orange': ghostColor = '#FFB851'; break;
                    default: ghostColor = '#FFFFFF';
                }
            }
            
            // Draw ghost body
            this.ctx.fillStyle = ghostColor;
            this.ctx.beginPath();
            
            // Draw semi-circle for top half
            this.ctx.arc(
                x,
                y - ghostRadius / 4,
                ghostRadius,
                Math.PI,
                0,
                false
            );
            
            // Draw wavy bottom
            this.ctx.lineTo(x + ghostRadius, y + ghostRadius);
            
            // Create the wavy effect at the bottom
            this.ctx.lineTo(x + ghostRadius / 2, y + ghostRadius / 2);
            this.ctx.lineTo(x, y + ghostRadius);
            this.ctx.lineTo(x - ghostRadius / 2, y + ghostRadius / 2);
            this.ctx.lineTo(x - ghostRadius, y + ghostRadius);
            this.ctx.lineTo(x - ghostRadius, y - ghostRadius / 4);
            
            this.ctx.fill();
            
            // Draw eyes
            this.drawGhostEyes(x, y, ghost.direction, isVulnerable);
        });
    }
    
    // Draw ghost eyes
    drawGhostEyes(x, y, direction, isVulnerable) {
        if (isVulnerable) {
            // Draw simple eyes for vulnerable ghosts
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.beginPath();
            this.ctx.arc(x - 5, y - 3, 3, 0, Math.PI * 2);
            this.ctx.arc(x + 5, y - 3, 3, 0, Math.PI * 2);
            this.ctx.fill();
            
            return;
        }
        
        // Eye whites
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.beginPath();
        this.ctx.arc(x - 5, y - 5, 4, 0, Math.PI * 2);
        this.ctx.arc(x + 5, y - 5, 4, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Pupils - position based on direction
        let pupilOffsetX = 0;
        let pupilOffsetY = 0;
        
        if (direction) {
            pupilOffsetX = direction.x * 2;
            pupilOffsetY = direction.y * 2;
        }
        
        this.ctx.fillStyle = '#000000';
        this.ctx.beginPath();
        this.ctx.arc(x - 5 + pupilOffsetX, y - 5 + pupilOffsetY, 2, 0, Math.PI * 2);
        this.ctx.arc(x + 5 + pupilOffsetX, y - 5 + pupilOffsetY, 2, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    // Check for collisions between Pacman and ghosts
    checkCollisions() {
        if (!this.pacman || !this.ghosts) return;
        
        this.ghosts.forEach(ghost => {
            if (!ghost) return;
            
            // Calculate distance between Pacman and ghost
            const distance = Math.sqrt(
                Math.pow(this.pacman.x - ghost.x, 2) + 
                Math.pow(this.pacman.y - ghost.y, 2)
            );
            
            // Collision threshold (sum of radii)
            const collisionThreshold = this.pacman.radius + (CELL_SIZE / 2 - 4);
            
            if (distance < collisionThreshold) {
                if (ghost.isVulnerable) {
                    // Eat the ghost
                    this.score += 200;
                    this.updateScore();
                    
                    // Return ghost to ghost house
                    ghost.exitingHouse = true;
                    ghost.x = 11 * CELL_SIZE + CELL_SIZE / 2;
                    ghost.y = 13 * CELL_SIZE + CELL_SIZE / 2 + 10;
                    ghost.isVulnerable = false;
                } else {
                    // Lose a life or end game
                    this.lives--;
                    this.updateLives();
                    
                    if (this.lives <= 0) {
                        this.gameOver = true;
                    } else {
                        // Reset positions
                        this.initPacman();
                        
                        // Reset ghost positions but keep the game running
                        this.ghosts.forEach(g => {
                            if (g) {
                                g.exitingHouse = true;
                                g.x = 11 * CELL_SIZE + CELL_SIZE / 2;
                                g.y = 13 * CELL_SIZE + CELL_SIZE / 2 + 10;
                            }
                        });
                    }
                }
            }
        });
    }
    
    // Check if Pacman has collected a dot or power pellet
    checkDotCollision() {
        if (!this.pacman) return;
        
        // Get Pacman's grid position
        const col = Math.floor(this.pacman.x / CELL_SIZE);
        const row = Math.floor((this.pacman.y - 10) / CELL_SIZE);
        
        // Check bounds
        if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return;
        
        // Check distance to dot center for more accurate collision
        const cellCenterX = col * CELL_SIZE + CELL_SIZE / 2;
        const cellCenterY = row * CELL_SIZE + CELL_SIZE / 2 + 10;
        const distance = Math.sqrt(
            Math.pow(this.pacman.x - cellCenterX, 2) + 
            Math.pow(this.pacman.y - cellCenterY, 2)
        );
        
        // If close enough to center
        if (distance < CELL_SIZE / 3) {
            if (this.maze[row][col] === 2) {
                // Regular dot
                this.maze[row][col] = 0;
                this.score += 10;
                this.updateScore();
                this.dotsRemaining--;
            } else if (this.maze[row][col] === 3) {
                // Power pellet
                this.maze[row][col] = 0;
                this.score += 50;
                this.updateScore();
                this.dotsRemaining--;
                
                // Activate power mode
                this.activatePowerMode();
            }
        }
    }
    
    // Activate power mode
    activatePowerMode() {
        this.powerMode = true;
        
        // Make ghosts vulnerable
        if (this.ghosts) {
            this.ghosts.forEach(ghost => {
                if (ghost) ghost.isVulnerable = true;
            });
        }
        
        // Clear existing timer
        if (this.powerModeTimer) {
            clearTimeout(this.powerModeTimer);
        }
        
        // Set end time for blinking effect
        this.powerModeEndTime = Date.now() + 8000;
        
        // Set power mode duration
        this.powerModeTimer = setTimeout(() => {
            this.powerMode = false;
            
            // Make ghosts normal again
            if (this.ghosts) {
                this.ghosts.forEach(ghost => {
                    if (ghost) ghost.isVulnerable = false;
                });
            }
            
            this.powerModeTimer = null;
        }, 8000);
    }
    
    // Helper to lighten a color
    lightenColor(color, amount) {
        return this.adjustColor(color, amount);
    }
    
    // Helper to darken a color
    darkenColor(color, amount) {
        return this.adjustColor(color, -amount);
    }
    
    // Helper to adjust a color's brightness
    adjustColor(color, amount) {
        let r, g, b;
        
        if (color.startsWith('#')) {
            color = color.substring(1);
            r = parseInt(color.substring(0, 2), 16);
            g = parseInt(color.substring(2, 4), 16);
            b = parseInt(color.substring(4, 6), 16);
        } else if (color.startsWith('rgb')) {
            const match = color.match(/\d+/g);
            if (match && match.length >= 3) {
                r = parseInt(match[0]);
                g = parseInt(match[1]);
                b = parseInt(match[2]);
            } else {
                return color;
            }
        } else {
            return color;
        }
        
        r = Math.max(0, Math.min(255, r + amount));
        g = Math.max(0, Math.min(255, g + amount));
        b = Math.max(0, Math.min(255, b + amount));
        
        return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
    }
    
    // AI interface methods
    getGameData() {
        return this.gameData;
    }
    
    makeAIMove(direction) {
        if (this.gameOver || !this.gameStarted) return;
        this.nextDirection = direction;
    }
}

// Make the class available globally
window.PacmanGame = PacmanGame; 