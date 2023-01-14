const k = 32;
let players = JSON.parse(localStorage.getItem('players')) || [];

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
    
    draw(expectedWinPercent) {
         this.draws++;
        this.updateRating(k * (0.5 - expectedWinPercent));
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
    
    draw() {
        this.player1.draw(this.e1);
        this.player2.draw(this.e2);
    }
}

function findPlayerByName(name) {
    return players.find(p => p.name === name) || new Player(name, 1000);
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

    localStorage.setItem('players', JSON.stringify(players));
}

function createListItem(player) {
    let row = document.createElement("tr");
    row.append(createCell(player.name));
    row.append(createCell(Math.round(player.rating)));
    row.append(createCell(Math.round(player.change)));
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

function declareWinner(winner) {
    switch (winner) {
        case 1:
            game.player1Won();
            break;
        case 2:
            game.player2Won();
            break;
        default:
            game.draw();
    }
    updatePlayers(players);
    createGame();
}

function addPlayer() {
    let name = document.getElementById("newPlayerName").value;
    if(!players.find(p => p.name === name)) {
        players.push(new Player(name, 1000));
        updatePlayers(players);
    }
}

updatePlayers(players);
let game = null;
createGame();

function exportData() {
    download('players.json', JSON.stringify(players));
}

function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

navigator.serviceWorker.register('/sw.js');
