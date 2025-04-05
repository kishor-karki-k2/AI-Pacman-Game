/**
 * Main.js - Entry point for Pacman game
 * Handles initialization of both manual and AI gameplay
 */

// Game instances
let manualGame = null;
let aiGame = null;

// Player information
let playerName = null;
let playerClass = null;

// Evolution parameters
const GENERATION_SIZE = 15;
const MUTATION_RATE = 0.25;
const PARAMETER_RANGE = {
    dotWeight: { min: 5, max: 40 },            // Increased to prioritize dot-seeking
    powerPelletWeight: { min: 15, max: 60 },
    ghostWeight: { min: -50, max: -10 },       // Increased negative values for stronger ghost avoidance
    vulnerableGhostWeight: { min: 5, max: 25 },
    explorationWeight: { min: 0.5, max: 8 }
};

// Evolution state
let generation = 1;
let currentAgent = 0;
let agents = [];
let bestAgents = [];
let evolutionInProgress = false;

// Initialize the application
window.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing Pacman game...');
    
    // Get player information from localStorage
    playerName = localStorage.getItem('pacman_player_name');
    playerClass = localStorage.getItem('pacman_player_class');
    
    // Redirect to login if no player info
    if (!playerName || !playerClass) {
        window.location.href = '/login';
        return;
    }
    
    // Initialize constants first
    if (typeof CELL_SIZE === 'undefined' || typeof COLS === 'undefined' || typeof ROWS === 'undefined') {
        console.error('Game constants not loaded! Make sure constants.js is loaded first.');
        alert('Game initialization failed. Please check the console for details.');
        return;
    }
    
    // Fix canvas styling
    const playerCanvas = document.getElementById('player-game');
    const aiCanvas = document.getElementById('ai-game');
    
    // Apply direct styles to ensure canvases are visible
    if (playerCanvas) {
        playerCanvas.style.display = 'block';
        playerCanvas.style.border = '2px solid #00BCA9';
        playerCanvas.style.borderRadius = '5px';
        playerCanvas.style.boxShadow = '0 0 15px rgba(0, 188, 170, 0.7)';
        playerCanvas.style.imageRendering = 'pixelated';
        playerCanvas.style.margin = '0 auto';
        //playerCanvas.style.background = '#000'; // Ensure black background
    } else {
        console.error('Player game canvas not found!');
    }
    
    if (aiCanvas) {
        aiCanvas.style.display = 'block';
        aiCanvas.style.border = '2px solid rgba(132, 0, 255, 0.95)';
        aiCanvas.style.borderRadius = '5px';
        aiCanvas.style.boxShadow = '0 0 15px rgba(123, 6, 218, 0.7)';
        aiCanvas.style.imageRendering = 'pixelated';
        aiCanvas.style.margin = '0 auto';
        aiCanvas.style.background = '#9a7cbc'; // Slightly darker purple
        aiCanvas.style.zIndex = '5'; // Ensure it's above other elements
    } else {
        console.error('AI game canvas not found!');
    }
    
    // Initialize manual game
    try {
        manualGame = new ManualGame('player-game');
        console.log('Manual game initialized successfully');
    } catch (error) {
        console.error('Failed to initialize manual game:', error);
    }
    
    // Initialize AI game
    try {
        aiGame = new AIGame('ai-game');
        console.log('AI game initialized successfully');
    } catch (error) {
        console.error('Failed to initialize AI game:', error);
    }
    
    // Set up UI controls
    setupUIControls();
    
    // Initialize the AI population
    initializeAIPopulation();
    
    // Force render both games initially to ensure they display properly
    if (manualGame) {
        manualGame.render();
    }
    
    if (aiGame) {
        aiGame.initPacman(); // Ensure Pacman is created
        aiGame.render();
    }
    
    // Make both panels visible immediately
    makeAllPanelsVisible();
    
    // Set AI game as locked initially
    lockAIGame();
    
    // Show message that manual game must be played first
    updateAIStatus("Play manual game first");
});

// Set up UI controls
function setupUIControls() {
    // Mode toggle - using the panel headings (for visual feedback only, not for switching)
    const playerPanel = document.querySelector('.game-panel h2');
    const aiPanel = document.querySelectorAll('.game-panel h2')[1];
    
    if (playerPanel) {
        playerPanel.style.cursor = 'pointer';
    }
    
    if (aiPanel) {
        aiPanel.style.cursor = 'pointer';
    }
    
    // Player game controls
    const startGameBtn = document.getElementById('start-game');
    const resetGameBtn = document.getElementById('reset-game');
    
    // AI game controls
    const startAIBtn = document.getElementById('start-ai');
    const resetAIBtn = document.getElementById('reset-ai');
    const showLearningBtn = document.getElementById('show-learning');
    
    // Set up speed control dropdown
    const speedSelector = document.getElementById('speed-selector');
    if (speedSelector) {
        speedSelector.addEventListener('change', function() {
            const speedValue = parseFloat(this.value);
            if (aiGame) {
                aiGame.setGameSpeed(speedValue);
                console.log(`Speed set to ${speedValue}x`);
            }
        });
    }
    
    // Modal elements
    const modal = document.getElementById('learning-curve-modal');
    const closeModalBtn = document.querySelector('.close');
    
    if (startGameBtn) {
        startGameBtn.addEventListener('click', function() {
            if (manualGame) {
                manualGame.start();
            }
        });
    }
    
    if (resetGameBtn) {
        resetGameBtn.addEventListener('click', function() {
            if (manualGame) {
                manualGame.reset();
            }
        });
    }
    
    if (startAIBtn) {
        startAIBtn.addEventListener('click', function() {
            if (isAIGameLocked()) {
                alert('Play the manual game first to unlock AI mode');
                return;
            }
            
            if (evolutionInProgress) {
                stopEvolution();
                startAIBtn.textContent = 'Start AI';
            } else {
                startEvolution();
                startAIBtn.textContent = 'Stop AI';
            }
        });
    }
    
    if (resetAIBtn) {
        resetAIBtn.addEventListener('click', function() {
            if (isAIGameLocked()) {
                alert('Play the manual game first to unlock AI mode');
                return;
            }
            
            stopEvolution();
            initializeAIPopulation();
            startAIBtn.textContent = 'Start AI';
        });
    }
    
    // Setup Show Learning button
    if (showLearningBtn) {
        showLearningBtn.addEventListener('click', function() {
            showLearningCurve();
        });
    }
    
    // Setup modal close button
    if (closeModalBtn && modal) {
        closeModalBtn.addEventListener('click', function() {
            modal.style.display = 'none';
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', function(event) {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
    
    // Remove loading overlay once everything is initialized
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.opacity = '0';
        setTimeout(() => {
            loadingOverlay.style.display = 'none';
        }, 500);
    }
}

// Make all game panels visible
function makeAllPanelsVisible() {
    const manualPanel = document.querySelectorAll('.game-panel-container')[0];
    const aiPanel = document.querySelectorAll('.game-panel-container')[1];
    
    if (manualPanel) {
        manualPanel.style.opacity = '1';
        const canvasContainer = manualPanel.querySelector('.canvas-container');
        if (canvasContainer) {
            canvasContainer.style.border = '2px solid rgba(0, 188, 170, 0.7)';
        }
    }
    
    if (aiPanel) {
        aiPanel.style.opacity = '1';
        const canvasContainer = aiPanel.querySelector('.canvas-container');
        if (canvasContainer) {
            canvasContainer.style.border = '2px solid rgba(132, 0, 255, 0.7)';
        }
    }
    
    // Force render both games
    if (manualGame) {
        manualGame.render();
    }
    
    if (aiGame) {
        aiGame.render();
    }
}

// Lock AI game (disable controls)
function lockAIGame() {
    const aiStartBtn = document.getElementById('start-ai');
    const aiResetBtn = document.getElementById('reset-ai');
    
    if (aiStartBtn) {
        aiStartBtn.disabled = true;
        aiStartBtn.style.opacity = '0.5';
        aiStartBtn.style.cursor = 'not-allowed';
    }
    
    if (aiResetBtn) {
        aiResetBtn.disabled = true;
        aiResetBtn.style.opacity = '0.5';
        aiResetBtn.style.cursor = 'not-allowed';
    }
    
    const aiPanel = document.querySelectorAll('.game-panel-container')[1];
    if (aiPanel) {
        aiPanel.setAttribute('data-locked', 'true');
    }
}

// Unlock AI game (enable controls)
function unlockAIGame() {
    const aiStartBtn = document.getElementById('start-ai');
    const aiResetBtn = document.getElementById('reset-ai');
    
    if (aiStartBtn) {
        aiStartBtn.disabled = false;
        aiStartBtn.style.opacity = '1';
        aiStartBtn.style.cursor = 'pointer';
    }
    
    if (aiResetBtn) {
        aiResetBtn.disabled = false;
        aiResetBtn.style.opacity = '1';
        aiResetBtn.style.cursor = 'pointer';
    }
    
    const aiPanel = document.querySelectorAll('.game-panel-container')[1];
    if (aiPanel) {
        aiPanel.setAttribute('data-locked', 'false');
    }
    
    // Update status to show AI is ready
    updateAIStatus("Ready - Start AI training");
}

// Check if AI game is locked
function isAIGameLocked() {
    const aiPanel = document.querySelectorAll('.game-panel-container')[1];
    if (aiPanel) {
        return aiPanel.getAttribute('data-locked') === 'true';
    }
    return true; // Default to locked if panel not found
}

// Initialize AI population
function initializeAIPopulation() {
    agents = [];
    
    // Create initial random agents
    for (let i = 0; i < GENERATION_SIZE; i++) {
        agents.push({
            id: i,
            parameters: {
                dotWeight: randomInRange(PARAMETER_RANGE.dotWeight.min, PARAMETER_RANGE.dotWeight.max),
                powerPelletWeight: randomInRange(PARAMETER_RANGE.powerPelletWeight.min, PARAMETER_RANGE.powerPelletWeight.max),
                ghostWeight: randomInRange(PARAMETER_RANGE.ghostWeight.min, PARAMETER_RANGE.ghostWeight.max),
                vulnerableGhostWeight: randomInRange(PARAMETER_RANGE.vulnerableGhostWeight.min, PARAMETER_RANGE.vulnerableGhostWeight.max),
                explorationWeight: randomInRange(PARAMETER_RANGE.explorationWeight.min, PARAMETER_RANGE.explorationWeight.max)
            },
            fitness: 0,
            gameData: [],
            dotsEaten: 0,
            score: 0
        });
    }
    
    console.log(`Initialized ${agents.length} AI agents for generation 1`);
    updateGenerationInfo();
}

// Run a specific agent
function runAgent(agentIndex) {
    if (agentIndex >= agents.length) return;
    
    const agent = agents[agentIndex];
    console.log(`Running agent ${agentIndex + 1}/${agents.length} in generation ${generation}`);
    
    // Reset the AI game
    aiGame.reset();
    
    // Set the AI parameters
    aiGame.setAIParameters(agent.parameters);
    
    // Set generation info
    aiGame.setGeneration(generation, agentIndex + 1);
    
    // Start the game
    aiGame.start();
    
    // Set up a check interval
    const checkInterval = setInterval(() => {
        if (aiGame.gameOver) {
            clearInterval(checkInterval);
            
            // Record fitness
            agent.fitness = aiGame.calculateFitness();
            agent.gameData = aiGame.getGameData();
            agent.dotsEaten = aiGame.totalDots - aiGame.dotsRemaining;
            agent.score = aiGame.score;
            
            console.log(`Agent ${agentIndex + 1} finished with fitness ${agent.fitness}`);
            
            // Update UI
            updateAgentInfo(agent);
            
            // Don't automatically proceed - the AI game will call nextAgent when needed
        }
    }, 100);
}

// Move to the next agent
function nextAgent() {
    if (!evolutionInProgress) return;
    
    // Move to next agent
    currentAgent++;
    
    // Check if we've completed a generation
    if (currentAgent >= agents.length) {
        finishGeneration();
    } else {
        // Still have agents to run in this generation
        setTimeout(() => runAgent(currentAgent), 500); // Reduced delay to speed up evolution
    }
}

// Finish the current generation
function finishGeneration() {
    console.log(`Generation ${generation} complete.`);
    
    // Sort agents by fitness
    agents.sort((a, b) => b.fitness - a.fitness);
    
    // Save the best agents
    bestAgents.push({
        generation: generation,
        agent: {...agents[0]},
        fitness: agents[0].fitness,
        dotsEaten: agents[0].dotsEaten || 0,
        score: agents[0].score || 0
    });
    
    // Save data to the server
    saveGenerationData(bestAgents[bestAgents.length - 1]);
    
    // Update UI
    updateGenerationResults();
    
    // Show message
    const messageElement = document.getElementById('evolution-message');
    if (messageElement) {
        messageElement.textContent = `Generation ${generation} complete. Best fitness: ${agents[0].fitness.toFixed(2)}`;
    }
    
    // Now proceed to the next generation if still running
    if (evolutionInProgress) {
        setTimeout(() => {
            startNextGeneration();
        }, 1000); // Reduced delay between generations
    }
}

// Start the next generation
function startNextGeneration() {
    // Increment generation counter
    generation++;
    console.log(`Starting Generation ${generation}`);
    
    // Create next generation
    evolveNextGeneration();
    
    // Reset current agent index
    currentAgent = 0;
    
    // Update UI
    updateGenerationInfo();
    
    // Start running agents in the new generation
    runAgent(currentAgent);
}

// Start the evolution process
function startEvolution() {
    evolutionInProgress = true;
    
    if (currentAgent >= agents.length) {
        // Reset for new run
        currentAgent = 0;
    }
    
    runAgent(currentAgent);
}

// Stop the evolution process
function stopEvolution() {
    evolutionInProgress = false;
    
    if (aiGame) {
        aiGame.gameOver = true;
        aiGame.paused = true;
        if (aiGame.animationFrame) {
            cancelAnimationFrame(aiGame.animationFrame);
            aiGame.animationFrame = null;
        }
    }
}

// Save generation data to the server for learning curve visualization
function saveGenerationData(generationData) {
    // Add player information to the data
    generationData.playerName = playerName;
    generationData.playerClass = playerClass;
    
    // Send to server
    fetch('/save_generation_data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(generationData)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Generation data saved successfully:', data);
    })
    .catch((error) => {
        console.error('Error saving generation data:', error);
    });
}

// Update stats for the current agent
function updateAgentStats(stats) {
    if (!agents || currentAgent >= agents.length) return;
    
    // Update the current agent's stats
    agents[currentAgent].fitness = stats.fitness;
    agents[currentAgent].dotsEaten = stats.dotsEaten;
    agents[currentAgent].score = stats.score;
    
    // Update UI
    updateAgentInfo(agents[currentAgent]);
}

// Show learning curve visualization
function showLearningCurve() {
    // Get the modal element
    const modal = document.getElementById('learning-curve-modal');
    const modalContent = document.getElementById('learning-curve-content');
    
    if (modal && modalContent) {
        // Show loading indicator
        modalContent.innerHTML = '<div class="loading">Loading learning curve...</div>';
        modal.style.display = 'block';
        
        // Fetch learning curve data from server
        fetch('/get_learning_curve')
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    // Display the chart
                    modalContent.innerHTML = `<img src="data:image/png;base64,${data.plot}" alt="Learning Curve" style="width:100%;">`;
                } else {
                    // Show error message
                    modalContent.innerHTML = `<div class="error">${data.message}</div>`;
                }
            })
            .catch(error => {
                console.error('Error fetching learning curve:', error);
                modalContent.innerHTML = '<div class="error">Failed to load learning curve.</div>';
            });
    }
}

// Evolve the next generation using genetic algorithm
function evolveNextGeneration() {
    // Sort current agents by fitness
    agents.sort((a, b) => b.fitness - a.fitness);
    
    // Get the top 40% as elite parents
    const numElites = Math.max(2, Math.floor(agents.length * 0.2));
    const elites = agents.slice(0, numElites);
    
    // Create new generation
    const newAgents = [];
    
    // Keep the best agent (elitism)
    newAgents.push({
        id: 0,
        parameters: {...agents[0].parameters},
        fitness: 0,
        gameData: [],
        dotsEaten: 0,
        score: 0
    });
    
    // Add a slightly mutated version of the best agent
    newAgents.push({
        id: 1,
        parameters: mutateParameters({...agents[0].parameters}, MUTATION_RATE * 1.5),
        fitness: 0,
        gameData: [],
        dotsEaten: 0,
        score: 0
    });
    
    // Use tournament selection for the rest
    for (let i = 2; i < GENERATION_SIZE; i++) {
        // Select parents using tournament selection
        const parent1 = tournamentSelect(agents, 3); // Tournament size of 3
        let parent2 = tournamentSelect(agents, 3);
        
        // Make sure parents are different
        while (parent2 === parent1) {
            parent2 = tournamentSelect(agents, 3);
        }
        
        // Create child through crossover
        const childParams = crossover(parent1.parameters, parent2.parameters);
        
        // Apply mutation
        const mutatedParams = mutateParameters(childParams, MUTATION_RATE);
        
        // Create child
        const child = {
            id: i,
            parameters: mutatedParams,
            fitness: 0,
            gameData: [],
            dotsEaten: 0,
            score: 0
        };
        
        newAgents.push(child);
    }
    
    // Add one completely random agent for exploration
    if (GENERATION_SIZE > 5) {
        const randomIndex = Math.floor(Math.random() * (GENERATION_SIZE - 3)) + 3;
        newAgents[randomIndex] = {
            id: randomIndex,
            parameters: generateRandomParameters(),
            fitness: 0,
            gameData: [],
            dotsEaten: 0,
            score: 0
        };
    }
    
    // Replace the old generation
    agents = newAgents;
    
    console.log(`Created generation ${generation} with ${agents.length} agents`);
}

// Tournament selection
function tournamentSelect(agents, tournamentSize) {
    let best = null;
    
    // Select random agents and find the best
    for (let i = 0; i < tournamentSize; i++) {
        const randomIndex = Math.floor(Math.random() * agents.length);
        const candidate = agents[randomIndex];
        
        if (best === null || candidate.fitness > best.fitness) {
            best = candidate;
        }
    }
    
    return best;
}

// Crossover parameters
function crossover(params1, params2) {
    const childParams = {};
    
    // For each parameter
    for (const key in params1) {
        // Use different crossover methods
        if (Math.random() < 0.7) {
            // Standard crossover - take from either parent
            childParams[key] = Math.random() < 0.5 ? params1[key] : params2[key];
        } else {
            // Blend crossover - weighted average of both parents
            const blendRatio = Math.random();
            childParams[key] = params1[key] * blendRatio + params2[key] * (1 - blendRatio);
        }
    }
    
    return childParams;
}

// Mutate parameters
function mutateParameters(params, mutationRate) {
    const mutatedParams = {...params};
    
    // For each parameter
    for (const key in mutatedParams) {
        // Mutation: randomly adjust value
        if (Math.random() < mutationRate) {
            const range = PARAMETER_RANGE[key];
            
            // Dynamic mutation amount based on generation progress
            const dynamicFactor = Math.max(0.1, 1 - (generation / 50)); // Decreases as generations progress
            const mutationAmount = (range.max - range.min) * 0.25 * dynamicFactor * (Math.random() * 2 - 1);
            
            mutatedParams[key] += mutationAmount;
            
            // Clamp to valid range
            mutatedParams[key] = Math.max(range.min, Math.min(range.max, mutatedParams[key]));
        }
    }
    
    return mutatedParams;
}

// Generate completely random parameters
function generateRandomParameters() {
    const params = {};
    
    for (const key in PARAMETER_RANGE) {
        const range = PARAMETER_RANGE[key];
        params[key] = randomInRange(range.min, range.max);
    }
    
    return params;
}

// Random number in range
function randomInRange(min, max) {
    return min + Math.random() * (max - min);
}

// Update generation info in UI
function updateGenerationInfo() {
    // Update generation display
    const generationElement = document.getElementById('ai-generation');
    if (generationElement) {
        generationElement.textContent = `${generation}`;
    }
    
    // Update agent status
    updateAIStatus(`Running Generation ${generation}, Agent ${currentAgent + 1}/${agents.length}`);
}

// Update agent info in UI
function updateAgentInfo(agent) {
    const agentInfoElement = document.getElementById('agent-info');
    if (agentInfoElement) {
        let infoHtml = `<h3>Agent ${agent.id + 1} (Fitness: ${agent.fitness.toFixed(2)})</h3>`;
        infoHtml += '<ul>';
        for (const key in agent.parameters) {
            infoHtml += `<li>${key}: ${agent.parameters[key].toFixed(2)}</li>`;
        }
        infoHtml += '</ul>';
        agentInfoElement.innerHTML = infoHtml;
    }
}

// Generate results table with clear progression
function updateGenerationResults() {
    const resultsElement = document.getElementById('generation-results');
    if (resultsElement) {
        let resultsHtml = '<h3>Learning Progress</h3>';
        resultsHtml += '<table><tr><th>Gen</th><th>Fitness</th><th>Dots</th><th>Score</th><th>Improvement</th></tr>';
        
        // Show progression over generations
        const bestAgentsToShow = bestAgents.slice(-10); // Show up to last 10 generations
        let prevFitness = 0;
        
        for (const bestAgent of bestAgentsToShow) {
            const dotsEaten = bestAgent.dotsEaten || 0;
            const score = bestAgent.score || 0;
            
            // Calculate improvement percentage
            let improvement = '';
            if (prevFitness > 0) {
                const improvementPercent = ((bestAgent.fitness - prevFitness) / prevFitness * 100);
                const improvementColor = improvementPercent >= 0 ? 'green' : 'red';
                improvement = `<span style="color:${improvementColor}">${improvementPercent > 0 ? '+' : ''}${improvementPercent.toFixed(1)}%</span>`;
            }
            
            resultsHtml += `<tr>
                <td>${bestAgent.generation}</td>
                <td>${bestAgent.fitness.toFixed(1)}</td>
                <td>${dotsEaten}</td>
                <td>${score}</td>
                <td>${improvement}</td>
            </tr>`;
            
            prevFitness = bestAgent.fitness;
        }
        
        resultsHtml += '</table>';
        resultsElement.innerHTML = resultsHtml;
    }
    
    // Update AI status
    updateAIStatus(`Generation ${generation} completed`);
}

// Helper function to update AI status display
function updateAIStatus(status) {
    console.log(`AI Status update: ${status}`);
    
    // Only update generation display
    const genElement = document.getElementById('ai-generation');
    if (genElement) {
        genElement.textContent = generation;
    }
    
    // Update score display directly
    const scoreElement = document.getElementById('ai-score');
    if (scoreElement && aiGame) {
        scoreElement.textContent = aiGame.score || 0;
    }
    
    // Force render AI game to ensure status is reflected
    if (aiGame) {
        aiGame.render();
    }
}

// Export functions for use in HTML
window.pacmanAI = {
    startEvolution,
    stopEvolution,
    nextAgent,
    unlockAIGame
};

// Load this at the end of the script
window.nextAgent = nextAgent;
window.updateAgentStats = updateAgentStats;
window.showLearningCurve = showLearningCurve;
window.unlockAIGame = unlockAIGame;