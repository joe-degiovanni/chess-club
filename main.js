const k = 32;
let players = [];

class Player {
    constructor(name, rating) {
        this.name = name;
        this.rating = rating;
        this.change = 0;
        this.wins = 0;
        this.losses = 0;
        this.draws = 0;
    }

    updateRating(delta) {
        this.change = delta;
        this.rating += delta;
    }
    
    win(expectedWinPercent) {
        this.wins++;
        this.updateRating(k * (1 - expectedWinPercent));
    }
    
    lose(expectedWinPercent) {
        this.losses++
        this.updateRating(k * (0 - expectedWinPercent));
    }
    
    draw() {
         this.draws++;
    }
}

class Game {
    constructor(p1, p2) {
        this.player1 = findPlayerByName(p1);
        this.player2 = findPlayerByName(p2);
        this.e1 = 1 / (1 + Math.pow(10, (this.player2.rating - this.player1.rating) / 400))
        this.e2 = 1 / (1 + Math.pow(10, (this.player1.rating - this.player2.rating) / 400))
    }
    
    player1Won() {
        this.player1.win(this.e1);
        this.player2.lose(this.e2);
    }
    
    player2Won() {
        this.player1.lose(this.e1);
        this.player2.win(this.e2);
    }
}

function findPlayerByName(name) {
    return players.find(p => p.name === name) || new Player(name, 1000);
}

function getJSON(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';
    xhr.onload = function() {
        callback(xhr.response);
    };
    xhr.send();
}

function loadPlayers() {
    getJSON('data/players.json', (r) => updatePlayers(r));
}

function updatePlayers(array) {
    players = array.map(p => Object.assign(new Player(), p));
    let list = document.getElementById("players");
    list.innerHTML = ''; // clear the old list
    players.sort((a, b) => b.rating - a.rating).forEach(p => list.append(createListItem(p)));
    
    let p1Options = document.getElementById("player1");
    p1Options.innerHTML = ''
    players.forEach(p => p1Options.append(createOption(p)));    
    let p2Options = document.getElementById("player2");
    p2Options.innerHTML = ''
    players.forEach(p => p2Options.append(createOption(p)));
}

function createListItem(player) {
    let row = document.createElement("tr");
    row.append(createCell(player.name));
    row.append(createCell(`${Math.round(player.rating)} (${Math.round(player.change)})`));
    row.append(createCell(`${player.wins}-${player.losses}-${player.draws}`));
    return row;
}

function createCell(text) {
    let cell = document.createElement("td");
    cell.innerText = text;
    return cell;
}

function createOption(player) {
    let item = document.createElement("option");
    item.value=player.name;
    item.innerText = `${player.name}`;
    return item;
}

function createGame() {
    game = new Game(
        document.getElementById("player1").value,
        document.getElementById("player2").value,
    )
    document.getElementById("expectedOutcome").innerText = `Expected chances of player1 winning are ${Math.round(game.e1 * 100)}%. Player 1 wins = ${Math.round(k * (1-game.e1))}. Player 2 wins = ${Math.round(k * (1-game.e2))}`
}

function declareWinner(p1) {
    p1 ? game.player1Won() : game.player2Won();
    updatePlayers(players);
    createGame();
}

loadPlayers();
let game = null;
createGame();
