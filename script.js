$( document ).ready(function() {
	var randomWordRequest = "http://api.wordnik.com:80/v4/words.json/randomWord?hasDictionaryDef=true&includePartOfSpeech=noun&excludePartOfSpeech=abbreviation&minCorpusCount=0&maxCorpusCount=-1&minDictionaryCount=1&maxDictionaryCount=-1&minLength=5&maxLength=12&api_key=a2a73e7b926c924fad7001ca3111acd55af2ffabf50eb4ae5",
			wordDefinitionRequest = "http://api.wordnik.com:80/v4/word.json/test/definitions?limit=200&includeRelated=true&useCanonical=false&includeTags=false&api_key=a2a73e7b926c924fad7001ca3111acd55af2ffabf50eb4ae5",
			blankLetterId = 0,
			errorCount = 0,
			selectedWordAry,
			indexOfCorrectLetters = [],
			playersAnswer = [],
			hintButton = document.getElementById("hint"),
			errorCounter = document.getElementById('errorCountWrappper'),
			lynch = [" head", " torso", " rHand", " lHand", " rLeg", " lLeg"],
			modal = document.getElementById("modal");

	function randomNumber(minimum, maximum){
	  return Math.round( Math.random() * (maximum - minimum - 1) + minimum);
	}

	function giveMeAHint() {
		event.preventDefault();
		var hintValue = selectedWordAry[randomNumber(0, selectedWordAry.length)];

		if(playersAnswer.indexOf(hintValue) > -1){
				giveMeAHint();
		} else {
			checkIfCorrect( hintValue, selectedWordAry);
		}

		document.getElementById("hint").removeEventListener("click", giveMeAHint);
		document.getElementById("hint").className += " disable";
	}

	function updateErrorCount(errorCount){
		errorCounter.removeChild(errorCounter.childNodes[0]);
		var errorCountElement = document.createElement('span');
		errorCountElement.innerHTML = errorCount+"/6";
		errorCounter.appendChild(errorCountElement);
	}

	function checkIfCorrect(userInput, answerAry) {
		var filtered = answerAry.filter(doesTheLetterExistInTheWord);

		function doesTheLetterExistInTheWord(currentElement, index) {
		  if (currentElement == userInput){
		  	var theCharacterExists = indexOfCorrectLetters.indexOf(index) > -1;
		  	if(!theCharacterExists){
		  		playersAnswer.push(userInput);
		  		indexOfCorrectLetters.push(index);
		  		var addAnswer = document.createElement('span');
					addAnswer.innerHTML = userInput;
					document.getElementById(index).appendChild(addAnswer);
		  	}
		  	if(indexOfCorrectLetters.length == answerAry.length){
		  		modal.className += " show";
		  		document.getElementById('success').className += " show";
		  	}
		  	return true;
		  }
		};

		//if the character is wrong
		if(!filtered.length){
	  	document.getElementById('right-container').className += lynch[errorCount];
	  	errorCount ++;
			var wrongLettersContainer = document.getElementById('wrongLetter'),
					c = " ";

			if(wrongLettersContainer.innerHTML){
				c = " , "
			}
			wrongLettersContainer.innerHTML = wrongLettersContainer.innerHTML+ c + userInput;
			updateErrorCount(errorCount);
			if(errorCount >= 6){
				modal.className += " show";
		  	document.getElementById('lost').className += " show";
			}
		}

		//reset input box
		document.getElementById("answer").value = "";
	}

	function generateBlankSpace(answer, number) {
	  var text = document.createElement('div');
	  text.className = "blankInput";
	  text.id = blankLetterId;
	  blankLetterId ++;
	  document.getElementById('hangman-interface').appendChild(text);
	}

	function RandomWord() {
    var requestStr = randomWordRequest;

    $.ajax({
      type: "GET",
      url: requestStr,
      dataType: "jsonp",
      success : RandomWordComplete
    })
	}

	function RandomWordComplete(data) {
	  selectedWordAry = data.word.replace(/\s+/g, '').split('');
	  //if the word is hypenated re-run the get request
	  if(selectedWordAry.indexOf('-') > -1){
	  	RandomWord();
	  } else {
			//add the input fields
			for (var i = 0; i < selectedWordAry.length; i++){
				generateBlankSpace();
			}

			document.getElementById("answer").addEventListener("keyup", function(event){
				//check if input was a-z
				if (event.keyCode >= 65 && event.keyCode <= 90){
					checkIfCorrect(event.target.value.replace(/\s+/g, '').toLowerCase(), selectedWordAry)
				} else if ( event.keyCode !== 8) {
					alert ("Please enter a valid alphabetical character!");
				}
			});
	  }
	};

  RandomWord();
  hintButton.addEventListener("click", giveMeAHint, false);
});
