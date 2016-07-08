
// JQuery Manipulation

$(document).ready(function() {
	
	//$('#dropDown').animate({
	//	top: '-100px'
	//});

	//game setup

	var num_squares = 96;
	var num_bombs = 8;	
	var square_ids = Array.apply(null, {length: num_squares}).map(Number.call, Number);
	var square_classes = new Array(num_squares);
	var squares_available = 0;
	
	function getRandomIntInclusive(min, max) {
	  return Math.floor(Math.random() * (max - min + 1)) + min;
	};

	var bomb_ids = [];
	var bomb_geometry_all = [-9, -8, -7, -1, +1, +7, +8, +9];
	var bomb_geometry_right_wall = [-9, -8, -1, +7, +8];
	var bomb_geometry_left_wall = [-8, -7, +1, +8, +9];

	for (var i = 0; i<num_bombs; i++) {
		bomb_ids.push(getRandomIntInclusive(0,num_squares-1));
	};

	for (var i = 0; i<num_squares; i++) {
		square_classes[i] = 'column_safe';
		squares_available++;
	}


	for (bomb_place in bomb_ids) {
		
		// For each bomb placement, determine where to place the 'close' squares
		if ((bomb_ids[bomb_place]+1)%8 == 0) {
			close_to_bomb = bomb_geometry_right_wall;
		}
		else if ((bomb_ids[bomb_place])%8 == 0) {
			close_to_bomb = bomb_geometry_left_wall;
		}
		else {
			close_to_bomb = bomb_geometry_all;
		}
			
		if (square_classes[bomb_ids[bomb_place]] != 'column_bomb') {
			if (square_classes[bomb_ids[bomb_place]] != 'column_close') {
				squares_available--;
			}
			square_classes[bomb_ids[bomb_place]] = 'column_bomb';
			console.log("BOMB: "+bomb_ids[bomb_place])
		}

		for (close in close_to_bomb) {
			if (square_classes[bomb_ids[bomb_place]+close_to_bomb[close]] == 'column_close'
				|| square_classes[bomb_ids[bomb_place]+close_to_bomb[close]] == 'column_bomb'
				|| square_classes[bomb_ids[bomb_place]+close_to_bomb[close]] >= num_squares
				|| square_classes[bomb_ids[bomb_place]+close_to_bomb[close]] <= 0) {
				// do nothing
			}
			else  {
				square_classes[bomb_ids[bomb_place]+close_to_bomb[close]] = 'column_close';
			}
		}
	}
	
	// Helper function to return the after-click class of a given square
	var gameOver = false;

	function getMyClass(myId) {
		myId = parseInt(myId,10);
		if (square_classes[myId] == 'column_bomb') {
			gameOver = true;
		}
		return square_classes[myId];
	}

	// Assign each square an id, in order from left to right, top to bottom
	var j = 0;

	$('.column').each(function() {
		var js = j.toString()
		$(this).attr('id', js)
		j++;
	});

	// Whenever a square is clicked, change its class to the under-layer
	// i.e. click on a square with a bomb under it, and change it to "column_bomb"
	var gameScore=0
	var scoreOutput = ""

	$('.column').click(function() {
		if ($(this).attr('data-clicked') != 'clicked') {
			
			gameScore++;

			$(this).attr('data-clicked', 'clicked');
		

			$(this).toggleClass(function() {
				return getMyClass($(this).attr('id'));
			});

			if (gameOver==true) {
				$('#result').html('Ouch! Game over.');
				$('#dropDown').animate({
					top: '10vh'
				});
				$('#button').click(function() {
					$('#button').css("background-color","magenta")
					location.reload();
				});
			}

			if (gameScore == squares_available) {
				$('#result').html('You win!!!');
				$('#dropDown').animate({
					top: '10vh'
				});
				$('#button').click(function() {
					$('#button').css("background-color","magenta")
					location.reload();
				});
			}


			$('#score').html("Score: "+gameScore);
		}
	});


});