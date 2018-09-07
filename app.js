/*
    TIC TAC TOE
    Travis Ryan
    August 30, 2018

    Board represented by an array with the following corresponding values:
    [0, 1, 2
     3, 4, 5
     6, 7, 8]
*/

// Global map of game states (X, O, empty) to the file locations of the corresponding image
// Each theme is its own JSON child object which maps X, O, and empty to relevant images
var imageMap = {
    "classic": {
        "X": "img/X.png",
        "O": "img/O.png",
        "empty": "img/white.png"
    },
    "cowboysAndAliens": {
        "X": "img/cowboy.png",
        "O": "img/alien.png",
        "empty": "img/white.png"
    },
    "piratesAndNinjas": {
        "X": "img/ninja.svg",
        "O": "img/pirate.svg",
        "empty": "img/white.png"
    }
}

// Global statistics vars (every win/loss/tie on every difficulty)
var easyPlayerWon = 0;
var easyComputerWon = 0;
var easyTied = 0;
var mediumPlayerWon = 0;
var mediumComputerWon = 0;
var mediumTied = 0;
var hardPlayerWon = 0;
var hardComputerWon = 0;
var hardTied = 0;

// Global boolean that keeps track of whether the game is over and actions should be locked
var gameOver = false;

// Global int that keeps track of which turn the computer is taking
var computerTurnNumber = 1;

// Global boolean that keeps track of whether the computer went first this game (default false)
var computerWentFirstThisGame = false;

// Global string keeping track of current game difficulty
var gameDifficulty = "hard";

// Global array of coordinates that result in a win for player or computer
var winConditions = [
    [0, 1, 2], // horizontal row 1
    [3, 4, 5], // horizontal row 2
    [6, 7, 8], // horizontal row 3
    [0, 4, 8], // diagonal
    [6, 4, 2], // diagonal
    [0, 3, 6], // vertical column 1
    [1, 4, 7], // vertical column 2
    [2, 5, 8] // vertical column 3
]

// Global array to keep track of the game state for every tile (First row 0-2, Second row 3-5, Third row 6-8)
// Inititalized empty
var gameState = ["empty", "empty", "empty", 
                "empty", "empty", "empty", 
                "empty", "empty", "empty"];

function pageLoaded() { // Hide inactive tabs and start a game of Tic Tac Toe
    //$("#gameBoard").hide();
    $("#about").hide();
    $("#settings").hide();
    $("#statistics").hide();
    startGame();
}

// Function to start (or restart) a game by emptying all tiles and updating the screen
function startGame() {
    gameOver = false;
    setDifficulty();
    $("#headerMessage").html("<h1>Tic Tac Toe</h1>");
    for (tile in gameState) {
        gameState[tile] = "empty";
    }
    computerTurnNumber = 1;
    updateEntireScreen();
    if (document.getElementById('turnCheckbox').checked) {
        computerWentFirstThisGame = true;
        processComputerMove();
    } else {
        computerWentFirstThisGame = false;
    }
}

// Processes the player's tile selection by placing an X and updating board state
function processPlayerMove(chosenTile) {
    if (gameState[chosenTile] == "empty" && !gameOver) {
        gameState[chosenTile] = "X";
        updateEntireScreen();
        if (checkForWin("X"))
            playerWins();
        else if (checkForTie())
            gameTied();
        else
            processComputerMove();
    }
}

// Processes the next move for the computer, places a O, and updates board state
function processComputerMove() {
    if (!gameOver) {
        if(gameDifficulty=="hard")
            var optimalTile = findHardMove();
        else if(gameDifficulty=="medium")
            var optimalTile = findMediumMove();
        else if(gameDifficulty=="easy")
            var optimalTile = findEasyMove();
        gameState[optimalTile] = "O";
        updateEntireScreen();
        if (checkForWin("O"))
            computerWins();
        else if (checkForTie()) {
            gameTied();
        }
        computerTurnNumber++;
    }
}

// Updates every tile on the screen based on the game state
function updateEntireScreen() {
    for (var i = 0; i < 9; i++) {
        if (imageMap[gameState[i]] != $('#image' + i).attr('src'));
        $("#image" + i).attr("src", imageMap["cowboysAndAliens"][gameState[i]]);
    }
}

// Checks for a won game for either computer or player (input side should equal X or O)
function checkForWin(side) {
    for (var winCondition in winConditions) {
        if (gameState[winConditions[winCondition][0]] == side &&
            gameState[winConditions[winCondition][1]] == side &&
            gameState[winConditions[winCondition][2]] == side) {
            return true;
        }
    }
    return false;
}

// Checks for a tie by returning true if all tiles are taken
function checkForTie() {
    for (var i = 0; i < gameState.length; i++) {
        if (gameState[i] == "empty")
            return false;
    }
    return true;
}

// Alert when a player wins. (The game is unwinnable on Hard difficulty, so this only happens on Easy/Medium.)
function playerWins() {
    $("#headerMessage").html("<h1>Player wins!</h1>");
    gameOver = true;
    if(gameDifficulty=="hard"){
        hardPlayerWon++;
    } else if(gameDifficulty=="medium"){
        mediumPlayerWon++;
    } else if(gameDifficulty=="easy"){
        easyPlayerWon++;
    }
}

// Alert when the computer wins by updating the header message
function computerWins() {
    $("#headerMessage").html("<h1>Computer wins!</h1>");
    gameOver = true;
    if(gameDifficulty=="hard"){
        hardComputerWon++;
    } else if(gameDifficulty=="medium"){
        mediumComputerWon++;
    } else if(gameDifficulty=="easy"){
        easyComputerWon++;
    }
}

// Alert when the game ends in a tie
function gameTied() {
    $("#headerMessage").html("<h1>Game tied</h1>");
    gameOver = true;
    if(gameDifficulty=="hard"){
        hardTied++;
    } else if(gameDifficulty=="medium"){
        mediumTied++;
    } else if(gameDifficulty=="easy"){
        easyTied++;
    }
}

// Finds the optimal move for the computer using the given board state on hard difficulty
// Always checks the turn number, and whether or not the computer went first
// Strategy logic determined by this source: http://www.chessandpoker.com/tic_tac_toe_strategy.html
function findHardMove() {
    var winningMove = getWinningOrBlockingMove("O"); // Win game if possible
    if (winningMove != -1)
        return winningMove;
    var blockingMove = getWinningOrBlockingMove("X"); // If win isn't possible, block opponent win if necessary
    if (blockingMove != -1)
        return blockingMove;
    // Other possible game logic for first several turns 
    // Strategy defined through switch/case conditions based on link above
    switch (computerTurnNumber) {
        case 1:
            switch (computerWentFirstThisGame) {
                case true:
                    return 0; // If given first move, always pick upper-left corner
                case false:
                    if (gameState[4] == "empty") //take center square if available
                        return 4;
                    else
                        return 0; //else take upper-left corner
            }
        case 2:
            switch (computerWentFirstThisGame) {
                case true:
                    if (gameState[4] == "X") // User chose center square
                        return 8; // Take bottom-right square
                    else if (gameState[2] == "X" || gameState[6] == "X") // User chose a corner that isn't bottom-right
                        return 8; // Take bottom-right square
                    else if (gameState[8] == "X") // User chose bottom-right corner
                        return 6; // Take bottom-left square
                    else if (gameState[1] == "X" || gameState[3] == "X" || gameState[5] == "X" || gameState[7] == "X") // User picks edge square
                        return 4; // Take center square
                case false:
                    if (gameState[4] == "X") { // if user got center square and still isn't threatening a win, take an available corner
                        if (gameState[2] == "empty")
                            return 2;
                        else if (gameState[6] == "empty")
                            return 6;
                        else if (gameState[8] == "empty")
                            return 8;
                    } else if ((gameState[0] == "X" && gameState[8] == "X") || (gameState[2] == "X" && gameState[6] == "X")) { //caddy-corner X's
                        return 1; // threaten a win (because we have the center square). (Player must block and tie game.)
                    }
            }
        default: // Default case: Game can't be lost at this point, so just pick the first available tile.
            for (var i = 0; i < gameState.length; i++) {
                if (gameState[i] == "empty")
                    return i;
            }
    }
}

// Finds a move for the computer on medium difficulty
// Always wins the game or blocks if possible. Otherwise, just iterates and picks first available tile
function findMediumMove(){
    var winningMove = getWinningOrBlockingMove("O"); // Win game if possible
    if (winningMove != -1)
        return winningMove;
    var blockingMove = getWinningOrBlockingMove("X"); // If win isn't possible, block opponent win if necessary
    if (blockingMove != -1)
        return blockingMove;
    for (var i = 0; i < gameState.length; i++) {
        if (gameState[i] == "empty")
            return i;
    }
}

// Finds a move for the computer on easy difficulty
// Always just takes the first tile available
function findEasyMove(){
    for (var i = 0; i < gameState.length; i++) {
        if (gameState[i] == "empty")
            return i;
    }
}

// Determines if the game can either be won by the computer or needs to be blocked by the player
// Input to this function should be X or O
function getWinningOrBlockingMove(computerOrPlayer) {
    for (var winCondition in winConditions) { // Check all win conditions
        var computerTileCount = 0;
        var emptyTileCount = 0;
        var possibleWin = winConditions[winCondition];
        var emptyTile = -1;
        for (var i = 0; i < possibleWin.length; i++) { // For each possible win, see if there are 2 filled tiles and 1 empty tile
            if (gameState[possibleWin[i]] == "empty") {
                emptyTileCount++;
                emptyTile = possibleWin[i]; // Keep track of the empty tile
            } else if (gameState[possibleWin[i]] == computerOrPlayer)
                computerTileCount++;
            if (emptyTileCount == 1 && computerTileCount == 2) { // If possible to win, return the empty tile
                return emptyTile;
            }
        }
    }
    return -1; // Return -1 if no win/block found
}

function setDifficulty(){
    console.log($("difficultyDropdown").val());
    gameDifficulty = "hard";
}

/* Tab Navigation Functions */

// Function takes in which tab to switch to, hides all tabs, and then activates the tab's highlight and shows its contents
function switchTabs(newTabNumber) {
    if (newTabNumber == 0) { // Game window
        hideAllTabs();
        $("#gameBoard").show();
        $("#gameTab").addClass("active");
    } else if (newTabNumber == 1) { // Settings
        hideAllTabs();
        $("#settings").show();
        $("#settingsTab").addClass("active");
    } else if (newTabNumber == 2) { // Statistics
        hideAllTabs();
        $("#statistics").show();
        $("#statisticsTab").addClass("active");
        updateStatisticsTab(); // When navigating to Statistics tabs, update all values
    } else if (newTabNumber == 3) { // About
        hideAllTabs();
        $("#about").show();
        $("#aboutTab").addClass("active");
    }
}

// A simple helper function that uses JQuery to hide all tab content and de-activate their tab highlighting
function hideAllTabs(){
    $("#gameBoard").hide();
    $("#gameTab").removeClass("active");
    $("#settings").hide();
    $("#settingsTab").removeClass("active");
    $("#statistics").hide();
    $("#statisticsTab").removeClass("active");
    $("#about").hide();
    $("#aboutTab").removeClass("active");
}

// Updates the statistics tab to reflect all game records
function updateStatisticsTab(){
    // Update easy mode statistics
    var easyTotal = easyPlayerWon+easyComputerWon+easyTied;
    $("#easyGamesPlayed").html("Games Played: "+easyTotal);
    $("#easyPlayerWon").html("Player Won: "+easyPlayerWon);
    $("#easyComputerWon").html("Computer Won: "+easyComputerWon);
    $("#easyTied").html("Tied: "+easyTied);

    // Update medium mode statistics
    var mediumTotal = mediumPlayerWon+mediumComputerWon+mediumTied;
    $("#mediumGamesPlayed").html("Games Played: "+mediumTotal);
    $("#mediumPlayerWon").html("Player Won: "+mediumPlayerWon);
    $("#mediumComputerWon").html("Computer Won: "+mediumComputerWon);
    $("#mediumTied").html("Tied: "+mediumTied);

    // Update hard mode statistics
    var hardTotal = hardPlayerWon+hardComputerWon+hardTied;
    $("#hardGamesPlayed").html("Games Played: "+hardTotal);
    $("#hardPlayerWon").html("Player Won: "+hardPlayerWon);
    $("#hardComputerWon").html("Computer Won: "+hardComputerWon);
    $("#hardTied").html("Tied: "+hardTied);
}