/**
 * Main application script for Pacman AI Learning Game
 * Handles initialization, UI interaction, and connections between player and AI games
 */

// Global game objects
let playerGame = null;
let pacmanAI = null;
let aiGame = null;
let hasPlayerPlayed = false;

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded - initializing Pacman game");
    
    // Handle loading screen
    const loadingOverlay = document.getElementById('loading-overlay');
    
    // Hide loading screen after a short delay
    setTimeout(() => {
        if (loadingOverlay) {
            loadingOverlay.style.opacity = '0';
            setTimeout(() => {
                loadingOverlay.style.display = 'none';
                console.log("Loading screen hidden - initializing games");
                
                // Initialize games after loading screen is hidden
                initializeGames();
            }, 500);
        } else {
            // If no loading screen, just initialize
            initializeGames();
        }
    }, 1500);
    
    // Create floating ghosts for decoration
    createFloatingGhosts();
    
    // Prevent arrow keys from scrolling the page
    window.addEventListener('keydown', function(e) {
        if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
            e.preventDefault();
            return false;
        }
    });
});

/**
 * Initialize both player and AI games
 */
function initializeGames() {
    console.log("Initializing games...");
    
    try {
        // Check if canvases exist
        const playerCanvas = document.getElementById('player-game');
        const aiCanvas = document.getElementById('ai-game');
        
        if (!playerCanvas || !aiCanvas) {
            console.error("Game canvases not found in the DOM");
            alert("Error: Game canvases not found. Please refresh the page.");
            return;
        }
        
        // Log canvas dimensions
        console.log(`Player canvas size: ${playerCanvas.width}x${playerCanvas.height}`);
        console.log(`AI canvas size: ${aiCanvas.width}x${aiCanvas.height}`);
        
        // Initialize player game
        playerGame = new PacmanGame('player-game');
        
        // Initialize AI
        pacmanAI = new PacmanAI();
        aiGame = pacmanAI.initGame('ai-game');
        
        // Ensure initial render happens
        playerGame.render();
        aiGame.render();
        
        // Highlight player game initially
        highlightActiveGame('player');
        
        // Set up button event listeners
        setupEventListeners();
        
        console.log("Game initialization complete");
    } catch (error) {
        console.error("Error initializing games:", error);
        alert("Failed to initialize the game. Please refresh the page and try again.");
    }
}

/**
 * Set up all event listeners for the UI
 */
function setupEventListeners() {
    // Player game controls
    document.getElementById('start-game').addEventListener('click', function() {
        console.log("Start player game clicked");
        addClickEffect(this);
        
        if (!playerGame) {
            console.error("Player game object is undefined!");
            return;
        }
        
        // Start the game
        playerGame.start();
        setActiveGame('player');
        hasPlayerPlayed = true; // Mark that player has played
    });
    
    document.getElementById('reset-game').addEventListener('click', function() {
        console.log("Reset player game clicked");
        addClickEffect(this);
        
        if (playerGame) {
            playerGame.reset();
            playerGame.render();
        }
    });
    
    // AI game controls
    document.getElementById('start-ai').addEventListener('click', function() {
        console.log("Start AI game clicked");
        addClickEffect(this);
        
        // Check if player has provided gameplay data
        if (!hasPlayerPlayed) {
            console.log("Player needs to play first");
            showPlayFirstMessage();
            return;
        }
        
        // Get player data
        const playerData = playerGame.getGameData();
        console.log("Player data length:", playerData ? playerData.length : 0);
        
        if (!playerData || playerData.length < 10) {
            console.log("Not enough player data");
            showPlayFirstMessage();
            return;
        }
        
        // Train AI from player data
        console.log("Training AI from player data");
        pacmanAI.trainFromPlayerData(playerGame);
        
        // Start AI game
        pacmanAI.start();
        setActiveGame('ai');
    });
    
    document.getElementById('reset-ai').addEventListener('click', function() {
        console.log("Reset AI game clicked");
        addClickEffect(this);
        
        if (pacmanAI) {
            pacmanAI.reset();
            if (aiGame) {
                aiGame.render();
            }
        }
    });
    
    // Add resize handler to maintain proper scaling
    window.addEventListener('resize', function() {
        // Force re-render of games when window is resized
        if (playerGame && playerGame.render) playerGame.render();
        if (aiGame && aiGame.render) aiGame.render();
    });
}

/**
 * Highlight the active game canvas
 * @param {string} gameId - 'player' or 'ai'
 */
function highlightActiveGame(gameId) {
    const playerCanvas = document.getElementById('player-game');
    const aiCanvas = document.getElementById('ai-game');
    
    if (gameId === 'player') {
        playerCanvas.style.boxShadow = '0 0 30px rgba(0, 255, 200, 0.8)';
        playerCanvas.style.transform = 'scale(1.02)';
        aiCanvas.style.boxShadow = '';
        aiCanvas.style.transform = '';
        
        // Highlight player panel
        playerCanvas.closest('.game-panel').style.transform = 'scale(1.02)';
        aiCanvas.closest('.game-panel').style.transform = '';
    } else if (gameId === 'ai') {
        aiCanvas.style.boxShadow = '0 0 30px rgba(186, 104, 255, 0.8)';
        aiCanvas.style.transform = 'scale(1.02)';
        playerCanvas.style.boxShadow = '';
        playerCanvas.style.transform = '';
        
        // Highlight AI panel
        aiCanvas.closest('.game-panel').style.transform = 'scale(1.02)';
        playerCanvas.closest('.game-panel').style.transform = '';
    }
}

/**
 * Set active game and update UI
 * @param {string} gameId - 'player' or 'ai'
 */
function setActiveGame(gameId) {
    highlightActiveGame(gameId);
}

/**
 * Create and position floating ghost elements
 */
function createFloatingGhosts() {
    const container = document.getElementById('floating-ghosts-container');
    if (!container) {
        console.error("Floating ghosts container not found");
        return;
    }
    
    const ghostColors = ['red', 'pink', 'cyan', 'orange'];
    const numGhosts = 8;
    
    for (let i = 0; i < numGhosts; i++) {
        // Create ghost element
        const ghost = document.createElement('div');
        const color = ghostColors[i % ghostColors.length];
        ghost.className = `floating-ghost ghost-${color}`;
        
        // Set random initial position
        const gameContainer = document.querySelector('.game-container');
        
        if (!gameContainer) {
            console.error("Game container not found");
            return;
        }
        
        const rect = gameContainer.getBoundingClientRect();
        
        // Position ghosts around the game area
        let x, y;
        if (i < numGhosts / 2) {
            // Left or right side
            x = (i % 2 === 0) 
                ? Math.random() * 100 
                : rect.right + Math.random() * 100;
            y = rect.top + Math.random() * rect.height;
        } else {
            // Top or bottom
            x = rect.left + Math.random() * rect.width;
            y = (i % 2 === 0) 
                ? rect.top - 50 - Math.random() * 100
                : rect.bottom + Math.random() * 100;
        }
        
        ghost.style.left = `${x}px`;
        ghost.style.top = `${y}px`;
        
        // Add random animation delay
        ghost.style.animationDelay = `${Math.random() * 5}s`;
        
        // Make ghosts interactive
        ghost.addEventListener('mouseover', function() {
            this.style.transform = 'scale(1.2)';
            this.style.opacity = '0.9';
            this.style.filter = 'blur(0)';
        });
        
        ghost.addEventListener('mouseout', function() {
            this.style.transform = '';
            this.style.opacity = '';
            this.style.filter = '';
        });
        
        // Add to container
        container.appendChild(ghost);
    }
}

/**
 * Show message that player needs to play first
 */
function showPlayFirstMessage() {
    // Create modal dialog
    const modal = document.createElement('div');
    modal.className = 'play-first-modal';
    modal.style.position = 'fixed';
    modal.style.top = '50%';
    modal.style.left = '50%';
    modal.style.transform = 'translate(-50%, -50%)';
    modal.style.background = 'rgba(20, 20, 20, 0.95)';
    modal.style.border = '2px solid #FFCC00';
    modal.style.borderRadius = '16px';
    modal.style.padding = '20px';
    modal.style.boxShadow = '0 0 30px rgba(255, 204, 0, 0.5)';
    modal.style.zIndex = '1000';
    modal.style.color = 'white';
    modal.style.textAlign = 'center';
    modal.style.maxWidth = '400px';
    
    // Add content to modal
    modal.innerHTML = `
        <h3 style="color: #FFCC00; margin-bottom: 15px;">AI Needs Training Data</h3>
        <p style="margin-bottom: 20px;">The AI needs to learn from your gameplay first. Please play the manual game before starting the AI game.</p>
        <button id="modal-close" style="background: #FFCC00; color: black; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer;">Got it!</button>
    `;
    
    // Add to document
    document.body.appendChild(modal);
    
    // Add event listener to close button
    document.getElementById('modal-close').addEventListener('click', function() {
        modal.remove();
        
        // Highlight the player game to guide the user
        const playerCanvas = document.getElementById('player-game');
        const playerPanel = playerCanvas.closest('.game-panel');
        
        playerPanel.style.transform = 'scale(1.02)';
        playerPanel.style.boxShadow = '0 0 30px rgba(0, 255, 200, 0.8)';
        
        setTimeout(() => {
            playerPanel.style.transform = '';
            playerPanel.style.boxShadow = '';
        }, 2000);
    });
}

/**
 * Add visual click effect to buttons
 * @param {HTMLElement} button - Button element
 */
function addClickEffect(button) {
    const circle = document.createElement('span');
    circle.style.position = 'absolute';
    circle.style.top = '50%';
    circle.style.left = '50%';
    circle.style.transform = 'translate(-50%, -50%)';
    circle.style.width = '5px';
    circle.style.height = '5px';
    circle.style.borderRadius = '50%';
    circle.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
    circle.style.pointerEvents = 'none';
    circle.style.zIndex = '10';
    
    button.appendChild(circle);
    
    circle.animate(
        [
            { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
            { transform: 'translate(-50%, -50%) scale(20)', opacity: 0 }
        ],
        {
            duration: 600,
            easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)'
        }
    );
    
    setTimeout(() => {
        circle.remove();
    }, 600);
}

// Add button hover effects 
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('mouseenter', () => {
            button.style.transform = 'scale(1.05)';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'scale(1)';
        });
    });
}); 