/**
 * AI Pacman Game
 * For AI-controlled evolutionary gameplay
 */

class AIGame {
    constructor(canvasId) {
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
        this.isAI = true;
        this.gameStarted = false;
        this.paused = true;
        this.gameOver = false;
        this.gameWon = false;
        this.score = 0;
        this.lives = 1; // AI has only one life per run
        this.powerMode = false;
        this.powerModeTimer = null;
        this.animationFrame = null;
        this.gameData = [];
        this.generationCount = 1;
        this.agentNumber = 1;
        this.ghostExitCheckDone = false;
        this.powerPelletCount = 0;
        this.ghostsEaten = 0;
        this.lastPosition = null;
        
        // Direction state
        this.currentDirection = {...DIRECTIONS.RIGHT};
        this.nextDirection = {...DIRECTIONS.RIGHT};
        
        // AI parameters (will be set by main.js)
        this.aiParameters = {
            dotWeight: 10,
            powerPelletWeight: 20,
            ghostWeight: -10,
            vulnerableGhostWeight: 8,
            explorationWeight: 2
        };
        
        // Initialize game
        this.reset();
        
        // Initial render
        this.render();
        
        console.log("AI game initialized with canvas", canvasId);
    }
    
    // Start the game
    start() {
        if (this.gameStarted && !this.paused) return;
        
        console.log("Starting AI game...");
        this.gameStarted = true;
        this.paused = false;
        this.runGameLoop();
    }
    
    // Reset the game
    reset() {
        console.log("Resetting AI game");
        
        // Reset game state
        this.gameStarted = false;
        this.paused = true;
        this.gameOver = false;
        this.gameWon = false;
        this.score = 0;
        this.lives = 1;
        this.powerMode = false;
        this.powerModeTime = 0;
        this.gameData = [];
        this.ghostExitCheckDone = false;
        this.powerPelletCount = 0;
        this.ghostsEaten = 0;
        this.lastPosition = null;
        
        // Cancel any animations
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        
        // Clear timers
        if (this.powerModeTimer) {
            clearTimeout(this.powerModeTimer);
            this.powerModeTimer = null;
        }
        
        // Initialize maze, counting dots
        this.maze = JSON.parse(JSON.stringify(DEFAULT_MAZE));
        this.dotsRemaining = 0;
        this.totalDots = 0;
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                if (this.maze[row][col] === 2 || this.maze[row][col] === 3) {
                    this.totalDots++;
                    this.dotsRemaining++;
                }
            }
        }
        
        // Reset characters
        this.initPacman();
        this.initGhosts();
        
        // Reset directions
        this.currentDirection = {...DIRECTIONS.RIGHT};
        this.nextDirection = {...DIRECTIONS.RIGHT};
        
        // Update UI
        this.updateScore();
        
        console.log("AI game reset complete");
    }
    
    // Run the game loop
    runGameLoop() {
        if (this.paused || this.gameOver) return;
        
        this.update();
        this.render();
        
        // Make an AI decision every few frames
        if (Math.random() < 0.1) {
            this.makeAIDecision();
        }
        
        // Force ghosts to exit if they're still in house after 5 seconds
        if (this.gameStarted && !this.ghostExitCheckDone && this.gameData.length > 50) {
            this.ghostExitCheckDone = true;
            let anyGhostsInHouse = false;
            
            for (const ghost of this.ghosts) {
                if (ghost.exitingHouse) {
                    // Force ghost out of house
                    ghost.exitingHouse = false;
                    ghost.x = GHOST_HOUSE.exitX;
                    ghost.y = GHOST_HOUSE.exitY;
                    ghost.direction = {...DIRECTIONS.LEFT};
                    anyGhostsInHouse = true;
                }
            }
            
            if (anyGhostsInHouse) {
                console.log("Forced ghosts out of house after timeout");
            }
        }
        
        // Schedule next frame
        this.animationFrame = requestAnimationFrame(() => this.runGameLoop());
    }
    
    // Update game state
    update() {
        if (this.gameOver) {
            // Only track the win for regular games
            return;
        }
        
        // Check win condition
        if (this.dotsRemaining <= 0) {
            this.gameWon = true;
            this.gameOver = true;
            console.log("All dots eaten - AI wins!");
            
            // Calculate fitness for this run
            const fitness = this.calculateFitness();
            console.log(`Final fitness for Agent ${this.agentNumber} in Generation ${this.generationCount}: ${fitness}`);
            
            // Update stats for this agent
            if (window.updateAgentStats) {
                window.updateAgentStats({
                    generation: this.generationCount,
                    agent: this.agentNumber,
                    fitness: fitness,
                    dotsEaten: this.totalDots - this.dotsRemaining,
                    score: this.score
                });
            }
            
            // Trigger next agent automatically after a brief delay
            setTimeout(() => {
                if (window.nextAgent) {
                    window.nextAgent();
                }
            }, 3000); // Longer delay to show win screen
            
            return;
        }
        
        // Move Pacman
        this.movePacman();
        
        // Move ghosts
        this.moveGhosts();
        
        // Check for dot collisions
        this.checkDotCollision();
        
        // Check for ghost collisions
        this.checkCollisions();
        
        // Record data for AI learning
        this.recordGameData();
        
        // Handle power mode timing
        if (this.powerMode && !this.powerModeTimer) {
            this.powerModeTimer = setTimeout(() => {
                this.powerMode = false;
                this.powerModeTimer = null;
                
                // Reset ghost vulnerability
                for (const ghost of this.ghosts) {
                    ghost.isVulnerable = false;
                }
            }, POWER_MODE_DURATION);
        }
    }
    
    // Render the game
    render() {
        // Ensure canvas is ready
        if (!this.canvas || !this.ctx) {
            console.error("Cannot render: Canvas or context is not available");
            return;
        }
        
        // Clear canvas with a solid background
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw game elements
        this.drawMaze();
        
        // Ensure pacman exists before drawing
        if (!this.pacman) {
            console.warn("Pacman not initialized, creating now...");
            this.initPacman();
        }
        
        // Draw characters
        this.drawGhosts();
        this.drawPacman();
        
        // Draw score info
        this.ctx.font = '16px Arial';
        this.ctx.fillStyle = 'white';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Score: ${this.score}`, 10, 20);
        
        // Draw game over message if won
        if (this.gameOver && this.gameWon) {
            this.drawGameMessage("LEVEL COMPLETE!", "#FFD700");
        }
    }
    
    // Draw a centered message on the screen
    drawGameMessage(message, color) {
        this.ctx.save();
        
        // Semi-transparent background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Text settings
        this.ctx.font = 'bold 36px Arial';
        this.ctx.fillStyle = color;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // Draw main message
        this.ctx.fillText(message, this.canvas.width / 2, this.canvas.height / 2 - 20);
        
        // Draw score
        this.ctx.font = '24px Arial';
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillText(`Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 20);
        
        // Draw dots eaten
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`Dots eaten: ${this.totalDots - this.dotsRemaining}/${this.totalDots}`, 
            this.canvas.width / 2, this.canvas.height / 2 + 50);
        
        this.ctx.restore();
    }
    
    // Move Pacman
    movePacman() {
        if (!this.pacman) return;
        
        // Calculate the current grid cell
        const cellX = Math.floor(this.pacman.x / CELL_SIZE);
        const cellY = Math.floor((this.pacman.y - Y_OFFSET) / CELL_SIZE);
        
        // If we're near the center of a cell, check if we can change direction
        if (this.isNearCellCenter(this.pacman.x, this.pacman.y)) {
            // Get the next cell in the desired direction
            const nextCellX = cellX + this.pacman.nextDirection.x;
            const nextCellY = cellY + this.pacman.nextDirection.y;
            
            // If the next cell is valid (not a wall), change direction
            if (nextCellY >= 0 && nextCellY < ROWS && 
                nextCellX >= 0 && nextCellX < COLS && 
                this.maze[nextCellY][nextCellX] !== 1) {
                // Snap to grid center for clean turns
                if (Math.abs(this.pacman.nextDirection.x) > 0) {
                    this.pacman.y = cellY * CELL_SIZE + CELL_SIZE / 2 + Y_OFFSET;
                } else {
                    this.pacman.x = cellX * CELL_SIZE + CELL_SIZE / 2;
                }
                
                // Change direction
                this.pacman.direction = {...this.pacman.nextDirection};
            }
        }
        
        // Calculate next position
        const nextX = this.pacman.x + this.pacman.direction.x * this.pacman.speed;
        const nextY = this.pacman.y + this.pacman.direction.y * this.pacman.speed;
        
        // Check if the next position is a wall
        const nextCellX = Math.floor(nextX / CELL_SIZE);
        const nextCellY = Math.floor((nextY - Y_OFFSET) / CELL_SIZE);
        
        // Move if not hitting a wall
        if (nextCellY >= 0 && nextCellY < ROWS && 
            nextCellX >= 0 && nextCellX < COLS && 
            this.maze[nextCellY][nextCellX] !== 1) {
            this.pacman.x = nextX;
            this.pacman.y = nextY;
        }
        
        // Handle screen wrapping for Pacman
        this.handleScreenWrapping(this.pacman);
    }
    
    // Check if near cell center
    isNearCellCenter(x, y) {
        const cellX = Math.floor(x / CELL_SIZE);
        const cellY = Math.floor((y - Y_OFFSET) / CELL_SIZE);
        
        const centerX = cellX * CELL_SIZE + CELL_SIZE / 2;
        const centerY = cellY * CELL_SIZE + CELL_SIZE / 2 + Y_OFFSET;
        
        // Check if we're close to a cell center
        const distance = Math.sqrt(
            Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
        );
        
        return distance < 5; // Within 5 pixels of center
    }
    
    // Get available directions from a grid position
    getAvailableDirections(x, y) {
        const availableDirections = [];
        
        // Check each direction
        const directions = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
        
        for (const dir of directions) {
            const dirVector = DIRECTIONS[dir];
            
            // Skip NONE
            if (dirVector.x === 0 && dirVector.y === 0) continue;
            
            // Calculate new position
            const newX = x + dirVector.x;
            const newY = y + dirVector.y;
            
            // Check bounds and if not a wall
            if (newY >= 0 && newY < ROWS && newX >= 0 && newX < COLS && 
                this.maze[newY][newX] !== 1) {
                availableDirections.push(dir);
            }
        }
        
        return availableDirections;
    }
    
    // Handle screen wrapping
    handleScreenWrapping(object) {
        // Screen wrapping (tunnel)
        if (object.x < 0) {
            object.x = COLS * CELL_SIZE - 1;
        } else if (object.x >= COLS * CELL_SIZE) {
            object.x = 0;
        }
        
        // No vertical wrapping for typical Pacman mazes
    }
    
    // Check if a position is a wall
    isWall(x, y) {
        // Get the row and column in the maze
        const col = Math.floor(x / CELL_SIZE);
        const row = Math.floor((y - Y_OFFSET) / CELL_SIZE);
        
        // Check if out of bounds
        if (row < 0 || row >= ROWS || col < 0 || col >= COLS) {
            return false; // Allow movement off-screen for wrapping
        }
        
        // Check if it's a wall (code 1) or ghost house wall (code 5)
        return this.maze[row][col] === 1 || this.maze[row][col] === 5;
    }
    
    // Check if a position is inside the ghost house
    isInGhostHouse(x, y) {
        const col = Math.floor(x / CELL_SIZE);
        const row = Math.floor((y - Y_OFFSET) / CELL_SIZE);
        
        if (row < 0 || row >= ROWS || col < 0 || col >= COLS) {
            return false;
        }
        
        return this.maze[row][col] === 6; // Ghost house
    }
    
    // Check collision with dots and power pellets
    checkDotCollision() {
        if (!this.pacman) return;
        
        // Get Pacman's grid position
        const gridX = Math.floor(this.pacman.x / CELL_SIZE);
        const gridY = Math.floor((this.pacman.y - Y_OFFSET) / CELL_SIZE);
        
        // Check bounds
        if (gridY < 0 || gridY >= ROWS || gridX < 0 || gridX >= COLS) return;
        
        // Get the cell type
        const cellType = this.maze[gridY][gridX];
        
        // Check for dot
        if (cellType === 2) {
            // Regular dot
            this.score += 10;
            this.maze[gridY][gridX] = 0; // Remove dot
            this.dotsRemaining--;
            this.updateScore();
        } 
        // Check for power pellet
        else if (cellType === 3) {
            // Power pellet
            this.score += 50;
            this.maze[gridY][gridX] = 0; // Remove power pellet
            this.dotsRemaining--;
            this.powerPelletCount++; // Increment power pellet count
            this.updateScore();
            
            // Activate power mode
            this.powerMode = true;
            this.powerModeTime = POWER_MODE_DURATION;
            
            // Reset any existing timer
            if (this.powerModeTimer) {
                clearTimeout(this.powerModeTimer);
                this.powerModeTimer = null;
            }
            
            // Make ghosts vulnerable
            for (const ghost of this.ghosts) {
                ghost.isVulnerable = true;
            }
            
            // Set a new timer to end power mode
            this.powerModeTimer = setTimeout(() => {
                this.powerMode = false;
                this.powerModeTime = 0;
                this.powerModeTimer = null;
                
                // Reset ghost vulnerability
                for (const ghost of this.ghosts) {
                    ghost.isVulnerable = false;
                }
            }, POWER_MODE_DURATION);
            
            console.log("Power mode activated!");
        }
    }
    
    // Check collisions with ghosts
    checkCollisions() {
        if (!this.pacman) return;
        
        for (const ghost of this.ghosts) {
            // Skip ghosts in the house
            if (ghost.exitingHouse) continue;
            
            // Calculate distance between Pacman and ghost
            const distance = Math.sqrt(
                Math.pow(this.pacman.x - ghost.x, 2) + 
                Math.pow(this.pacman.y - ghost.y, 2)
            );
            
            // If collision (adjusting for radius)
            if (distance < this.pacman.radius + CELL_SIZE / 2 - 2) {
                if (ghost.isVulnerable) {
                    // REWARD: Player ate a ghost
                    this.score += 200;
                    this.ghostsEaten++;
                    this.updateScore();
                    
                    // Reset ghost to the ghost house
                    ghost.x = GHOST_HOUSE.exitX;
                    ghost.y = GHOST_HOUSE.exitY;
                    ghost.exitingHouse = true;
                    ghost.isVulnerable = false;
                    
                    console.log("Ghost eaten! Total eaten: " + this.ghostsEaten);
                } else {
                    // PUNISHMENT: Ghost caught Pacman - end this agent's run
                    this.gameOver = true;
                    console.log("PUNISHMENT: Ghost caught Pacman - ending this agent's run");
                    
                    // Calculate fitness for this run
                    const fitness = this.calculateFitness();
                    console.log(`Final fitness for Agent ${this.agentNumber} in Generation ${this.generationCount}: ${fitness}`);
                    
                    // Update stats for this agent
                    if (window.updateAgentStats) {
                        window.updateAgentStats({
                            generation: this.generationCount,
                            agent: this.agentNumber,
                            fitness: fitness,
                            dotsEaten: this.totalDots - this.dotsRemaining,
                            score: this.score
                        });
                    }
                    
                    // Trigger next agent automatically (but not next generation)
                    setTimeout(() => {
                        if (window.nextAgent) {
                            window.nextAgent();
                        }
                    }, 500);
                    
                    return;
                }
            }
        }
    }
    
    // Update the score display
    updateScore() {
        const aiScoreElement = document.getElementById('ai-score');
        if (aiScoreElement) {
            aiScoreElement.textContent = this.score;
        }
    }
    
    // Record game data for AI evaluation
    recordGameData() {
        if (!this.pacman) return;
        
        // Calculate movement since last frame
        let moved = { x: 0, y: 0 };
        if (this.lastPosition) {
            moved = {
                x: this.pacman.x - this.lastPosition.x,
                y: this.pacman.y - this.lastPosition.y
            };
        }
        
        // Save current position for next frame
        this.lastPosition = { x: this.pacman.x, y: this.pacman.y };
        
        // Check if a ghost is nearby (within 4 cells)
        let nearGhost = false;
        let closestGhostDistance = Infinity;
        
        for (const ghost of this.ghosts) {
            // Skip ghosts in the house
            if (ghost.exitingHouse) continue;
            
            const distance = Math.sqrt(
                Math.pow(this.pacman.x - ghost.x, 2) + 
                Math.pow(this.pacman.y - ghost.y, 2)
            );
            
            if (distance < 4 * CELL_SIZE) {
                nearGhost = true;
                closestGhostDistance = Math.min(closestGhostDistance, distance);
            }
        }
        
        // Get current grid position
        const gridX = Math.floor(this.pacman.x / CELL_SIZE);
        const gridY = Math.floor((this.pacman.y - Y_OFFSET) / CELL_SIZE);
        
        // Record the data for this frame
        this.gameData.push({
            frame: this.gameData.length,
            position: { x: this.pacman.x, y: this.pacman.y },
            moved: moved,
            direction: { ...this.pacman.direction },
            dots: this.totalDots - this.dotsRemaining,
            dotsEaten: this.totalDots - this.dotsRemaining,
            score: this.score,
            powerMode: this.powerMode,
            nearGhost: nearGhost,
            ghostDistance: closestGhostDistance,
            gridPosition: { x: gridX, y: gridY }
        });
    }
    
    // Draw message overlay - removed or simplified messages
    drawMessage(message) {
        // Removed messages
    }
    
    // Draw generation info - removed
    drawGenerationInfo() {
        // Removed generation info
    }
    
    // Draw the maze
    drawMaze() {
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                const cellType = this.maze[row][col];
                const x = col * CELL_SIZE;
                const y = row * CELL_SIZE + Y_OFFSET;
                
                if (cellType === 1) { // Wall
                    this.drawWall(x, y, CELL_SIZE, CELL_SIZE);
                } else if (cellType === 2) { // Dot
                    this.drawDot(x + CELL_SIZE/2, y + CELL_SIZE/2);
                } else if (cellType === 3) { // Power pellet
                    this.drawPowerPellet(x + CELL_SIZE/2, y + CELL_SIZE/2);
                } else if (cellType === 5) { // Ghost house wall
                    this.drawGhostHouseWall(x, y, CELL_SIZE, CELL_SIZE);
                } else if (cellType === 6) { // Ghost house
                    this.drawGhostHouse(x, y, CELL_SIZE, CELL_SIZE);
                }
            }
        }
    }
    
    // Draw a wall cell
    drawWall(x, y, width, height) {
        // Main wall color - slightly darker purple
        this.ctx.fillStyle = '#9a7cbc'; // Darker purple but not too dark
        this.ctx.fillRect(x, y, width, height);
        
        // 3D effect with slightly darker color
        this.ctx.fillStyle = '#8469a8'; // Darker shade for 3D effect
        this.ctx.fillRect(x + 2, y + 2, width - 4, height - 4);
        
        // Add black border around each block
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x, y, width, height);
    }
    
    // Draw a ghost house wall
    drawGhostHouseWall(x, y, width, height) {
        this.ctx.fillStyle = '#FF756C'; // Pink for ghost house walls
        this.ctx.fillRect(x, y, width, height);
        
        // Add a 3D effect
        this.ctx.fillStyle = '#FF5349'; // Darker pink for 3D effect
        this.ctx.fillRect(x + 2, y + 2, width - 4, height - 4);
    }
    
    // Draw the ghost house
    drawGhostHouse(x, y, width, height) {
        this.ctx.fillStyle = 'rgba(255, 182, 193, 0.2)'; // Light pink, semi-transparent
        this.ctx.fillRect(x, y, width, height);
    }
    
    // Draw a dot
    drawDot(x, y) {
        this.ctx.fillStyle = '#FFB8AE'; // Light pink dots
        this.ctx.beginPath();
        this.ctx.arc(x, y, 2, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    // Draw a power pellet
    drawPowerPellet(x, y) {
        // Add pulsating effect
        const pulseSize = 4 + Math.sin(Date.now() / 200) * 2;
        
        this.ctx.fillStyle = '#FFD700'; // Gold color
        this.ctx.beginPath();
        this.ctx.arc(x, y, pulseSize, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Add glow effect
        this.ctx.shadowColor = '#FFD700';
        this.ctx.shadowBlur = 10;
        this.ctx.beginPath();
        this.ctx.arc(x, y, pulseSize - 1, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.shadowBlur = 0; // Reset shadow
    }
    
    // Draw Pacman
    drawPacman() {
        if (!this.pacman) return;
        
        const ctx = this.ctx;
        
        // Calculate mouth opening angle based on animation frame
        const frame = Math.floor(Date.now() / 100) % 10;
        const mouthAngle = Math.PI / 4 * (frame < 5 ? frame : 10 - frame) / 5;
        
        // Calculate rotation based on direction
        let rotation = 0;
        if (this.pacman.direction.x === -1) rotation = Math.PI;
        if (this.pacman.direction.y === -1) rotation = Math.PI * 1.5;
        if (this.pacman.direction.y === 1) rotation = Math.PI / 2;
        
        // Save context for rotation
        ctx.save();
        ctx.translate(this.pacman.x, this.pacman.y);
        ctx.rotate(rotation);
        
        // Draw Pacman body
        ctx.beginPath();
        ctx.fillStyle = "#FFFF00"; // Bright yellow for Pacman
        ctx.arc(0, 0, CELL_SIZE / 2 - 2, mouthAngle, Math.PI * 2 - mouthAngle);
        ctx.lineTo(0, 0);
        ctx.fill();
        
        // Restore context after rotation
        ctx.restore();
    }
    
    // Draw ghosts
    drawGhosts() {
        // Draw each ghost
        for (let i = 0; i < this.ghosts.length; i++) {
            const ghost = this.ghosts[i];
            const {x, y, color} = ghost;
            
            // Consistent ghost size
            const radius = CELL_SIZE / 2;
            
            this.ctx.save();
            
            // Use different colors for vulnerable ghosts (flashing near end of vulnerability)
            if (ghost.isVulnerable) {
                // Flashing effect near end of vulnerability
                const isBlinking = this.powerMode && (this.powerModeTime > 0) && 
                                 (this.powerModeTime < 2000) && (Math.floor(Date.now() / 250) % 2 === 0);
                this.ctx.fillStyle = isBlinking ? '#FFF' : '#2121DE';
            } else {
                this.ctx.fillStyle = color;
            }
            
            // Draw ghost body - improved shape to prevent cut-off
            this.ctx.beginPath();
            
            // Top arc (semi-circle)
            this.ctx.arc(x, y - radius/3, radius, Math.PI, 0, false);
            
            // Draw the wavy bottom of the ghost - extended to ensure complete shape
            const waveHeight = 4;
            const segments = 4;
            const width = radius * 2;
            const height = radius + 4; // Increased height to prevent cut-off
            
            this.ctx.lineTo(x + radius, y + height - waveHeight);
            
            // Draw waves at the bottom more carefully
            for (let i = 0; i < segments; i++) {
                const waveDirection = i % 2 === 0 ? -1 : 1;
                const waveX = x + radius - ((i + 1) / segments) * width;
                
                this.ctx.lineTo(
                    waveX,
                    y + height + waveDirection * waveHeight
                );
            }
            
            this.ctx.lineTo(x - radius, y - radius/3);
            this.ctx.fill();
            
            // Draw eyes in the adjusted position
            this.drawGhostEyes(x, y - 4, ghost.direction);
            
            this.ctx.restore();
        }
    }
    
    // Draw ghost eyes
    drawGhostEyes(x, y, direction) {
        const eyeRadius = 4;
        const pupilRadius = 2;
        const eyeOffset = 5;
        
        // White part of eyes
        this.ctx.fillStyle = '#FFF';
        this.ctx.beginPath();
        this.ctx.arc(x - eyeOffset, y - 2, eyeRadius, 0, Math.PI * 2);
        this.ctx.arc(x + eyeOffset, y - 2, eyeRadius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Calculate pupil offset based on direction
        let pupilOffsetX = 0;
        let pupilOffsetY = 0;
        
        if (direction.x > 0) pupilOffsetX = 1;
        if (direction.x < 0) pupilOffsetX = -1;
        if (direction.y > 0) pupilOffsetY = 1;
        if (direction.y < 0) pupilOffsetY = -1;
        
        // Pupils
        this.ctx.fillStyle = '#000';
        this.ctx.beginPath();
        this.ctx.arc(x - eyeOffset + pupilOffsetX, y - 2 + pupilOffsetY, pupilRadius, 0, Math.PI * 2);
        this.ctx.arc(x + eyeOffset + pupilOffsetX, y - 2 + pupilOffsetY, pupilRadius, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    // Move ghosts
    moveGhosts() {
        for (let i = 0; i < this.ghosts.length; i++) {
            const ghost = this.ghosts[i];
            
            // Handle ghosts exiting the house
            if (ghost.exitingHouse) {
                this.moveGhostOutOfHouse(ghost);
                continue;
            }
            
            // Move ghost based on current direction
            ghost.x += ghost.direction.x * ghost.speed;
            ghost.y += ghost.direction.y * ghost.speed;
            
            // Handle screen wrapping
            this.handleScreenWrapping(ghost);
            
            // Change direction at intersections
            if (this.isAtIntersection(ghost.x, ghost.y)) {
                this.decideGhostDirection(ghost);
            }
            
            // If ghost gets stuck, force a new direction
            if (this.isGhostStuck(ghost)) {
                const availableDirections = this.getAvailableDirections(
                    Math.floor(ghost.x / CELL_SIZE),
                    Math.floor((ghost.y - Y_OFFSET) / CELL_SIZE)
                );
                
                if (availableDirections.length > 0) {
                    const newDir = availableDirections[Math.floor(Math.random() * availableDirections.length)];
                    ghost.direction = {...DIRECTIONS[newDir]};
                    
                    // Adjust position slightly to prevent getting stuck in walls
                    ghost.x = Math.floor(ghost.x / CELL_SIZE) * CELL_SIZE + CELL_SIZE / 2;
                    ghost.y = Math.floor((ghost.y - Y_OFFSET) / CELL_SIZE) * CELL_SIZE + CELL_SIZE / 2 + Y_OFFSET;
                }
            }
        }
    }
    
    // Move ghost out of the ghost house
    moveGhostOutOfHouse(ghost) {
        // Use the centralized ghost house exit position from constants.js
        const exitX = GHOST_HOUSE.exitX;
        const exitY = GHOST_HOUSE.exitY;
        
        // First move up to the top of the ghost house
        if (ghost.y > exitY) {
            ghost.y -= ghost.speed * 1.5; // Move slightly faster to exit
            
            // Ensure it doesn't overshoot
            if (ghost.y < exitY) {
                ghost.y = exitY;
            }
        } 
        // Then move to the exit position horizontally if needed
        else {
            if (ghost.x < exitX) {
                ghost.x += ghost.speed * 1.5;
                if (ghost.x > exitX) ghost.x = exitX;
            } else if (ghost.x > exitX) {
                ghost.x -= ghost.speed * 1.5;
                if (ghost.x < exitX) ghost.x = exitX;
            }
            
            // When ghost reaches exit position, set it as no longer exiting
            if (Math.abs(ghost.x - exitX) < 2 && Math.abs(ghost.y - exitY) < 2) {
                ghost.exitingHouse = false;
                ghost.direction = {...DIRECTIONS.LEFT}; // Start moving left
                console.log("Ghost exited house:", ghost.color);
            }
        }
    }
    
    // Check if ghost is stuck
    isGhostStuck(ghost) {
        // If ghost was already marked as stuck, decrement counter
        if (ghost.stuck > 0) {
            ghost.stuck--;
            return ghost.stuck === 0;
        }
        
        // Check if ghost is at a valid position but can't move in current direction
        const nextX = ghost.x + ghost.direction.x * ghost.speed;
        const nextY = ghost.y + ghost.direction.y * ghost.speed;
        
        const gridX = Math.floor(nextX / CELL_SIZE);
        const gridY = Math.floor((nextY - Y_OFFSET) / CELL_SIZE);
        
        // Check if next position is a wall
        if (gridY >= 0 && gridY < ROWS && gridX >= 0 && gridX < COLS) {
            if (this.maze[gridY][gridX] === 1) {
                ghost.stuck = 3; // Set stuck counter
                return true;
            }
        }
        
        return false;
    }
    
    // Check if at an intersection
    isAtIntersection(x, y) {
        // Check if position is in the center of a cell
        const cellX = Math.floor(x / CELL_SIZE);
        const cellY = Math.floor((y - Y_OFFSET) / CELL_SIZE);
        const centerX = cellX * CELL_SIZE + CELL_SIZE / 2;
        const centerY = cellY * CELL_SIZE + CELL_SIZE / 2 + Y_OFFSET;
        
        const distance = Math.sqrt(
            Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
        );
        
        // Must be near center of cell and at an intersection
        if (distance < 5) {
            const availableDirections = this.getAvailableDirections(cellX, cellY);
            return availableDirections.length > 2; // More than 2 possible ways to go
        }
        
        return false;
    }
    
    // Decide ghost direction
    decideGhostDirection(ghost) {
        const cellX = Math.floor(ghost.x / CELL_SIZE);
        const cellY = Math.floor((ghost.y - Y_OFFSET) / CELL_SIZE);
        
        // Get available directions from current position
        const availableDirections = this.getAvailableDirections(cellX, cellY);
        
        // Filter out reverse direction (unless that's the only option)
        const nonReverseDirections = availableDirections.filter(dir => {
            const dirVector = DIRECTIONS[dir];
            return !(dirVector.x === -ghost.direction.x && dirVector.y === -ghost.direction.y);
        });
        
        const directions = nonReverseDirections.length > 0 ? nonReverseDirections : availableDirections;
        
        if (directions.length === 0) return; // No valid directions
        
        // Different behavior based on ghost vulnerability
        if (ghost.isVulnerable) {
            // Run away from Pacman
            this.chooseFleeingDirection(ghost, directions);
        } else {
            // Chase Pacman based on personality
            this.chooseChaseDirection(ghost, directions);
        }
    }
    
    // Choose direction to flee from Pacman
    chooseFleeingDirection(ghost, availableDirections) {
        // Get direction away from Pacman
        const dx = ghost.x - this.pacman.x;
        const dy = ghost.y - this.pacman.y;
        
        // Choose the direction that maximizes distance from Pacman
        let bestDirection = availableDirections[0];
        let bestDistance = -Infinity;
        
        for (const dir of availableDirections) {
            const dirVector = DIRECTIONS[dir];
            const newDistance = dirVector.x * dx + dirVector.y * dy; // Dot product
            
            // Add randomness to prevent predictable movement
            const randomFactor = Math.random() * 10;
            
            if (newDistance + randomFactor > bestDistance) {
                bestDistance = newDistance + randomFactor;
                bestDirection = dir;
            }
        }
        
        ghost.direction = {...DIRECTIONS[bestDirection]};
    }
    
    // Choose direction to chase Pacman
    chooseChaseDirection(ghost, availableDirections) {
        // Target position is ahead of Pacman based on personality
        const targetX = this.pacman.x + (this.pacman.direction.x * CELL_SIZE * ghost.personality.lookAhead);
        const targetY = this.pacman.y + (this.pacman.direction.y * CELL_SIZE * ghost.personality.lookAhead);
        
        // Choose the direction that minimizes distance to target
        let bestDirection = availableDirections[0];
        let bestDistance = Infinity;
        
        for (const dir of availableDirections) {
            const dirVector = DIRECTIONS[dir];
            const newX = ghost.x + dirVector.x * CELL_SIZE;
            const newY = ghost.y + dirVector.y * CELL_SIZE;
            
            const distance = Math.sqrt(
                Math.pow(newX - targetX, 2) + Math.pow(newY - targetY, 2)
            );
            
            // Add randomness based on ghost personality
            const randomFactor = Math.random() * ghost.personality.randomness * 100;
            
            // Apply directness - smaller distance is better but balanced by randomness
            const adjustedDistance = distance * (1 - ghost.personality.directness) + randomFactor;
            
            if (adjustedDistance < bestDistance) {
                bestDistance = adjustedDistance;
                bestDirection = dir;
            }
        }
        
        ghost.direction = {...DIRECTIONS[bestDirection]};
    }
    
    // Initialize Pacman
    initPacman() {
        // Use the centralized Pacman start position from constants.js
        // Create Pacman object
        this.pacman = {
            x: PACMAN_START_POSITION.x,
            y: PACMAN_START_POSITION.y,
            radius: CELL_SIZE / 2 - 2,
            speed: PACMAN_SPEED,
            direction: {...DIRECTIONS.RIGHT},
            nextDirection: {...DIRECTIONS.RIGHT}
        };
        
        console.log("AI Pacman initialized at:", this.pacman.x, this.pacman.y);
    }
    
    // Initialize ghosts
    initGhosts() {
        this.ghosts = [];
        
        // Create ghosts using the centralized configurations
        for (let i = 0; i < GHOST_CONFIGS.length; i++) {
            const config = GHOST_CONFIGS[i];
            
            // All ghosts start in the ghost house and are ready to exit
            this.ghosts.push({
                x: config.startPosition.x,
                y: config.startPosition.y,
                color: config.color,
                speed: GHOST_SPEED,
                isVulnerable: false,
                exitingHouse: true, // All ghosts start in exiting mode
                direction: {...DIRECTIONS.UP},
                personality: {
                    directness: config.personalityFactor,
                    lookAhead: 4 - i, // How far ahead to target
                    randomness: 0.3 * (4 - i) // More randomness for later ghosts
                },
                stuck: 0
            });
        }
        
        console.log("AI Ghosts initialized:", this.ghosts.length);
    }
    
    // Set the AI parameters
    setAIParameters(params) {
        this.aiParameters = {...params};
        console.log("AI parameters set:", this.aiParameters);
    }
    
    // Set the generation and agent info
    setGeneration(generation, agent) {
        this.generationCount = generation;
        this.agentNumber = agent;
    }
    
    // Make an AI decision
    makeAIDecision() {
        if (!this.pacman || this.paused || this.gameOver) return;
        
        // Get current position
        const currentX = Math.floor(this.pacman.x / CELL_SIZE);
        const currentY = Math.floor((this.pacman.y - Y_OFFSET) / CELL_SIZE);
        
        // Get available directions from current position
        const availableDirections = this.getAvailableDirections(currentX, currentY);
        
        // If we're near a cell center, consider changing direction
        if (this.isNearCellCenter(this.pacman.x, this.pacman.y) && availableDirections.length > 0) {
            // Filter out the reverse direction (unless it's the only option)
            const reversalDirection = this.getReverseDirection(this.pacman.direction);
            const forwardDirections = availableDirections.filter(dir => 
                dir !== this.getDirectionName(reversalDirection)
            );
            
            // Use forward directions if available, otherwise use all directions
            const directions = forwardDirections.length > 0 ? forwardDirections : availableDirections;
            
            // Score each available direction based on AI parameters
            const directionScores = this.scoreDirections(directions, currentX, currentY);
            
            // Get the best direction
            let bestDirection = this.getBestDirection(directionScores);
            
            // Set next direction
            this.pacman.nextDirection = {...DIRECTIONS[bestDirection]};
            
            // If Pacman is already at a center point, change direction immediately
            if (Math.abs(this.pacman.x - (currentX * CELL_SIZE + CELL_SIZE / 2)) < 2 &&
                Math.abs(this.pacman.y - (currentY * CELL_SIZE + CELL_SIZE / 2 + Y_OFFSET)) < 2) {
                this.pacman.direction = {...this.pacman.nextDirection};
                
                // Log the decision
                console.log("AI decided to move:", bestDirection);
            }
        }
    }
    
    // Score directions based on AI parameters
    scoreDirections(directions, currentX, currentY) {
        const scores = {};
        
        // If AI parameters aren't set, use defaults
        const params = this.aiParameters || {
            dotWeight: 10,
            powerPelletWeight: 25,
            ghostWeight: -10,
            vulnerableGhostWeight: 8,
            explorationWeight: 2
        };
        
        // Score each direction
        for (const direction of directions) {
            let score = 0;
            const dirVector = DIRECTIONS[direction];
            
            // Look ahead up to 5 cells
            let dotSeen = false;
            let powerPelletSeen = false;
            let ghostDistance = 999;
            let vulnerableGhostDistance = 999;
            
            // Search in this direction
            for (let dist = 1; dist <= 5; dist++) {
                const checkX = currentX + dirVector.x * dist;
                const checkY = currentY + dirVector.y * dist;
                
                // Skip if out of bounds
                if (checkY < 0 || checkY >= ROWS || checkX < 0 || checkX >= COLS) {
                    continue;
                }
                
                // Check for wall
                if (this.maze[checkY][checkX] === 1) {
                    break; // Stop looking if we hit a wall
                }
                
                // Check for dot - weight decreases with distance
                if (this.maze[checkY][checkX] === 2 && !dotSeen) {
                    score += params.dotWeight / Math.pow(dist, 0.7);
                    dotSeen = true;
                }
                
                // Check for power pellet - higher weight
                if (this.maze[checkY][checkX] === 3 && !powerPelletSeen) {
                    score += params.powerPelletWeight / Math.pow(dist, 0.5);
                    powerPelletSeen = true;
                }
                
                // Check for ghosts in this cell
                for (const ghost of this.ghosts) {
                    const ghostCellX = Math.floor(ghost.x / CELL_SIZE);
                    const ghostCellY = Math.floor((ghost.y - Y_OFFSET) / CELL_SIZE);
                    
                    // Skip ghosts in the house
                    if (ghost.exitingHouse) continue;
                    
                    if (ghostCellX === checkX && ghostCellY === checkY) {
                        if (ghost.isVulnerable) {
                            // Vulnerable ghost - we want to catch them
                            if (dist < vulnerableGhostDistance) {
                                vulnerableGhostDistance = dist;
                            }
                        } else {
                            // Normal ghost - we want to avoid them
                            if (dist < ghostDistance) {
                                ghostDistance = dist;
                            }
                        }
                    }
                }
            }
            
            // Add ghost-related scores
            if (ghostDistance < 999) {
                // More negative for closer ghosts
                score += params.ghostWeight / Math.pow(ghostDistance, 0.8);
            }
            
            if (vulnerableGhostDistance < 999) {
                // More positive for closer vulnerable ghosts
                score += params.vulnerableGhostWeight / Math.pow(vulnerableGhostDistance, 0.6);
            }
            
            // Add exploration score for directions with more empty space
            const explorationScore = this.getExplorationScore(direction, currentX, currentY);
            score += explorationScore * params.explorationWeight;
            
            // Add a small random factor to prevent getting stuck in patterns
            score += Math.random() * 2; 
            
            scores[direction] = score;
        }
        
        return scores;
    }
    
    // Get exploration score based on available paths
    getExplorationScore(direction, currentX, currentY) {
        const dirVector = DIRECTIONS[direction];
        let score = 0;
        let nextX = currentX + dirVector.x;
        let nextY = currentY + dirVector.y;
        
        // Don't explore outside the maze
        if (nextY < 0 || nextY >= ROWS || nextX < 0 || nextX >= COLS) {
            return 0;
        }
        
        // If next cell is a wall, no exploration possible
        if (this.maze[nextY][nextX] === 1) {
            return 0;
        }
        
        // Breadth-first search to find the number of cells that can be reached
        const visited = new Set();
        const queue = [[nextX, nextY, 1]]; // x, y, depth
        
        while (queue.length > 0 && visited.size < 20) {
            const [x, y, depth] = queue.shift();
            const key = `${x},${y}`;
            
            if (visited.has(key)) continue;
            visited.add(key);
            
            // Add to score (farther cells add less to the score)
            score += 1 / depth;
            
            // Check all four directions
            for (const dir of ['UP', 'DOWN', 'LEFT', 'RIGHT']) {
                const v = DIRECTIONS[dir];
                const nx = x + v.x;
                const ny = y + v.y;
                
                // Skip if out of bounds
                if (ny < 0 || ny >= ROWS || nx < 0 || nx >= COLS) {
                    continue;
                }
                
                // Skip walls
                if (this.maze[ny][nx] === 1) {
                    continue;
                }
                
                // Add to queue if not visited
                if (!visited.has(`${nx},${ny}`)) {
                    queue.push([nx, ny, depth + 1]);
                }
            }
        }
        
        return score;
    }
    
    // Get the best direction based on scores
    getBestDirection(scores) {
        let bestDirection = null;
        let bestScore = -Infinity;
        
        for (const direction in scores) {
            if (scores[direction] > bestScore) {
                bestScore = scores[direction];
                bestDirection = direction;
            }
        }
        
        return bestDirection;
    }
    
    // Get the reverse direction
    getReverseDirection(direction) {
        if (direction.x === 0 && direction.y === 0) return DIRECTIONS.NONE;
        return {
            x: -direction.x,
            y: -direction.y
        };
    }
    
    // Get name of a direction from vector
    getDirectionName(dirVector) {
        for (const [name, vector] of Object.entries(DIRECTIONS)) {
            if (vector.x === dirVector.x && vector.y === dirVector.y) {
                return name;
            }
        }
        return 'NONE';
    }
    
    // Get game data for evaluation
    getGameData() {
        return this.gameData;
    }
    
    // Fitness function for genetic algorithm
    calculateFitness() {
        // REWARD: Dot eating is the primary reward
        const dotsEaten = this.totalDots - this.dotsRemaining;
        const dotPercentage = dotsEaten / this.totalDots;
        
        // Basic reward for dots eaten (exponential to reward progress)
        const dotReward = Math.pow(dotPercentage * 10, 1.8) * 150;
        
        // REWARD: Power pellets eaten
        const powerPelletReward = this.powerPelletCount * 100;
        
        // REWARD: Ghosts eaten
        const ghostsEatenReward = this.ghostsEaten * 200;
        
        // PUNISHMENT: Time penalty to encourage efficiency
        // But only apply if dots were eaten (to avoid punishing early deaths too harshly)
        const timeEfficiencyFactor = dotsEaten > 0 ? 
            Math.min(1.0, dotsEaten / (this.gameData.length * 0.1)) : 0;
        
        // Calculate the final fitness score
        let fitness = dotReward + powerPelletReward + ghostsEatenReward;
        
        // Apply time efficiency factor
        fitness *= (0.7 + 0.3 * timeEfficiencyFactor);
        
        // PUNISHMENT: Major penalty if no dots were eaten
        if (dotsEaten === 0) {
            fitness = Math.max(1, fitness / 10);
        }
        
        // REWARD: Major bonus for winning (eating all dots)
        if (dotsEaten === this.totalDots) {
            fitness *= 3;
        }
        
        console.log(`Fitness breakdown: Dots=${dotReward.toFixed(1)}, PowerPellets=${powerPelletReward}, GhostsEaten=${ghostsEatenReward}, Efficiency=${timeEfficiencyFactor.toFixed(2)}`);
        
        return Math.max(1, fitness);
    }
}

// Export the class
window.AIGame = AIGame; 