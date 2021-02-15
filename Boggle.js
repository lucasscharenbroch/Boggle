const dice = [
["N" ,"L" ,"D" ,"P" ,"U" ,"E"],
["E" ,"O" ,"I" ,"E" ,"W" ,"S"],
["A" ,"H" ,"I" ,"S" ,"N" ,"P"],
["R" ,"K" ,"I" ,"T" ,"O" ,"U"],
["E" ,"M" ,"I" ,"Qu" ,"O" ,"A"],
["I" ,"X" ,"U" ,"B" ,"R" ,"F"],
["E" ,"R" ,"A" ,"G" ,"L" ,"W"],
["E" ,"H" ,"I" ,"F" ,"Y" ,"E"],
["D" ,"M" ,"N" ,"D" ,"A" ,"E"],
["I" ,"L" ,"O" ,"R" ,"C" ,"S"],
["A" ,"N" ,"E" ,"D" ,"Z" ,"V"],
["U" ,"T" ,"E" ,"C" ,"O" ,"A"],
["S" ,"B" ,"T" ,"L" ,"I" ,"A"],
["B" ,"L" ,"J" ,"K" ,"Y" ,"G"],
["P" ,"N" ,"C" ,"G" ,"T" ,"V"],
["T" ,"H" ,"Y" ,"S" ,"O" ,"A"]
]


///Rolling
var roll = [];

function random(highest){ //random number, 0 through (highest-1)
	let randint = Math.random() * highest
	return Math.floor(randint);
}

function scramble(){
	roll = [[], [], [], []];
	
	var setOfDice = dice.slice(0, dice.length);

	for(let x = 0; x < 4; x++){
		for(let y = 0; y < 4; y++){
			let randint = random(setOfDice.length);
			let die = setOfDice[randint];
			setOfDice.splice(randint, 1); 

			roll[x].push(die[random(6)]);	
			document.getElementById("cell" + ((x*4)+y).toString()).innerHTML = roll[x][y];
		}
	}
}


///Lookup
const guessLabel = document.getElementById("guessLabel");
const guessBox = document.getElementById("guessBox");
const surroundingTiles = [[-1, 1], [0, 1], [1, 1], [-1, 0], [1, 0], [-1, -1], [0, -1], [1, -1]];// [x,y] coordinate pair 

function arrayInArray(needle, haystack){
	//takes array(2), and array(array(2)); returns bool: is needle in haystack?
	
	for(let i = 0; i < haystack.length; i++){
		if(needle[0] == haystack[i][0] && needle[1] == haystack[i][1])
			return true;
	}
	return false;
}	

function parse(s){
	//given a string, return an array of uppercase letters; ("Q" -> "Qu")
	s = s.toUpperCase();
	let charArr = [];
	for(let i = 0; i < s.length; i++){
		if(s[i] == "Q" && s[i+1] == "U"){
			charArr.push("Qu");
			i++;
		}else{
			charArr.push(s[i]);
		}
	}
	return charArr;
}

function findCoors(charArr, usedCoors, coor){
	//[] coor means any start (passed in the first call of the function)
	//given an array of possible dice, if array can be created with current roll, return array of indices. otherwise, return an empty array
	if(charArr.length == 0) return [coor];

	let rest = charArr.slice(1);
	let tilesToSearch = [];
	if(coor.length == 0){
		//tiles to search = all tiles
		for(let x = 0; x < 4; x++){
			for(let y = 0; y < 4; y++){
				tilesToSearch.push([x,y]);
			}
		}
	}else{
		usedCoors.push(coor);
		//tiles to search = all surrounding tiles that are not in usedCoors
		for(let i = 0; i < surroundingTiles.length; i++){
			let tile = [coor[0] + surroundingTiles[i][0], coor[1] + surroundingTiles[i][1]];
			let notUsed = !(arrayInArray(tile, usedCoors));
			if(notUsed && tile[0] >= 0 && tile[1] >= 0 && tile[0] < 4 && tile[1] < 4) //tile isn't used nor out of bounds
				tilesToSearch.push(tile);
		}

	}


	for(let i = 0; i < tilesToSearch.length; i++){
		if(roll[tilesToSearch[i][0]][tilesToSearch[i][1]] == charArr[0]){//if the character in this tile matches the wanted one
			let test = findCoors(rest, usedCoors, tilesToSearch[i]);
			if(test.length > 0){
				if(coor.length > 0) test.unshift(coor); // insert coor at index 0
				return test;
			}
		}
	}

	return [];
}

function highlight(coors){
	//highlights boxes with given coordinates
	
	let tableCoors = [];
	for(let i = 0; i < coors.length; i++){
		tableCoors.push(coors[i][0]*4 + coors[i][1]);
	}
	
	for(let i = 0; i < 16; i++){
		let cell = document.getElementById("cell" + i);
		if(tableCoors.indexOf(i) != -1){
			cell.style.backgroundColor = "yellow";
		}else{
			cell.style.backgroundColor = "white";
		}

	}	
	
}

function lookup(word){
	//returns bool : can word can be found in roll
	charArr = parse(word);
	return(findCoors(charArr, [], []).length > 0);

}

function userLookup(){
	//if user input can be formed by roll, highlight tiles. 
	let userInput = guessBox.value;
	charArr = parse(userInput);
	highlight(findCoors(charArr, [], []));
}

guessBox.onkeyup = function(){userLookup();};

/// Guessing
const guessesDiv = document.getElementById("guesses");
const pointsBox = document.getElementById("points");
var guessing = false;// guessBox serves as a lookup when the timer isn't running
var points = 0;
var guesses = [];
var guessHtmlElements = [];

function guess(keypress){
	//adds user input to guesses
	if(keypress.keyCode == 13){
	let userInput = guessBox.value;
	guesses.push(userInput);

	let elementText = document.createTextNode(userInput);
	let element = document.createElement("p");
	element.appendChild(elementText);
	guessesDiv.appendChild(element);
	guessHtmlElements.push(element);

	guessBox.value = "";
	}
}

function clearGuesses(){
	guesses = [];

	for(let i = 0; i < guessHtmlElements.length; i++){
		guessHtmlElements[i].remove();
	}

	guessHtmlElements = [];
	points = 0;
	pointsBox.innerHTML = "Points: 0";
}


function updateGuessMode(){
	if(timing && ! guessing){
		guessLabel.innerHTML = "Guess:";
		guessBox.onkeyup = function(event){guess(event)};	
		guessing = true;
	}else if(! timing && guessing){
		guessLabel.innerHTML = "Lookup:";
		guessBox.onkeyup = function(){userLookup();};
		guessing = false;
	}
}

function getPoints(word){
	//returns number of points that word is worth
	if(word.length < 3) return 0;
	else if(word.length <= 4) return 1; 
	else if(word.length == 5) return 2;
	else if(word.length == 6) return 3;
	else if(word.length == 7) return 5;
	else if(word.length >= 8) return 11;
}

function score(){
	points = 0;
	for(let i = 0; i < guesses.length; i++){
		if(lookup(guesses[i])){
			let pointsGained = getPoints(guesses[i]); 
			points += pointsGained;
			guessHtmlElements[i].innerHTML = guesses[i] + ` (+${pointsGained})`; 
			if(pointsGained > 0){
				guessHtmlElements[i].style.color = "green";
			}else{
				guessHtmlElements[i].style.color = "grey";
			}
		}else{
			guessHtmlElements[i].style.color = "red";
		}
	}
	pointsBox.innerHTML = `Points: ${points}`;
}

///Timer
const timer = document.getElementById("timer");
const startstopButton = document.getElementById("startstop");
var defaultMinutes = 3;
var defaultSeconds = 0;
var minutes = defaultMinutes;
var seconds = defaultSeconds;
var timing = false;

function updateTimerHtml(){
	if(seconds < 10) timer.innerHTML = `${minutes}:0${seconds}`;
	else timer.innerHTML = `${minutes}:${seconds}`;
}

function startstop(){
	if(timing){
		timing = false;
		startstopButton.innerHTML = "Start";
	}else{
		timing = true;
		startstopButton.innerHTML = "Stop";
	}
	updateGuessMode();
}

function updateTimer(){
	if(timing){
		updateTimerHtml();
		if(seconds > 0){
			seconds --;
		}else if(minutes > 0){
			minutes --;
			seconds += 59;
		}else{// timer is at 0:00
			startstop();
			updateGuessMode();
		}
	}
}

function startAndScramble(){
	if(!timing){
		startstop();
		scramble();
	}
	updateGuessMode();
}

function resetTimer(){
	minutes = defaultMinutes;
	seconds = defaultSeconds;
	updateTimerHtml();
}

var clock = 10;
function main(){
	if(clock == 0){
		updateTimer();
		clock = 10;
	}else{
		clock --;
	}
}

setInterval(main, 97);
scramble();
