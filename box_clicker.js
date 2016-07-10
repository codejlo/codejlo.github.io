// ######### helper functions #########

// find a random integer in the tile space
function getRandomIntInclusive(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// find the after-click class of a given tile
function getTileClass(myId, board_classes) {
	tile = parseInt(myId,10);
	return board_classes[tile];
}

// For a given mine, determine the correct geometry of warning tile placement
// i.e. if a mine is along a wall, you don't need to set warning tiles on the wall
// side of the mine.
function findWarningGeometry(tile_index, board_width) {
	
	var mine_geometry_all = [-board_width-1, -board_width, -board_width+1, -1, +1, +board_width-1, +board_width, +board_width+1];
	var mine_geometry_right_wall = [-board_width-1, -board_width, -1, +board_width-1, +board_width];
	var mine_geometry_left_wall = [-board_width, -board_width+1, +1, +board_width, +board_width+1];


	if ((tile_index+1)%board_width == 0) {
		return mine_geometry_right_wall;
	}
	else if (tile_index%board_width == 0) {
		return mine_geometry_left_wall;
	}
	else {
		return mine_geometry_all;
	}
}


// ######### game setup #########

// Build the board
function buildBoard(user_difficulty) {

	// define board variables
	var board_width = 8
	var board_length = 12
	var num_tiles = board_width * board_length;
	var board_ids = Array.apply(null, {length: num_tiles}).map(Number.call, Number);
	var board_classes = new Array(num_tiles);
	var tiles_available = 0;  // this variable will be used to help determine when you have won the game

	// define game difficulty factors by relative mines per board size
	var difficulty;

	switch (user_difficulty) {
		case 'easy':
			difficulty = 1/20;
			break;
		case 'medium':
			difficulty = 1/13;
			break;
		case 'hard':
			difficulty = 1/9;
	}

	// define mine variables
	var num_mines = Math.floor(num_tiles * difficulty);	
	var mine_ids = [];

	// randomly place mines in the board space
	for (var i = 0; i<num_mines; i++) {
		if (mine_ids.indexOf(i) >= 0) {
			// do nothing if duplicate
		}
		else {
			mine_ids.push(getRandomIntInclusive(0,num_tiles-1));
		}
	};

	// assign all the tiles of the board with an underlying state
	// begin by setting the whole board to 'tile_safe'
	for (var i = 0; i<num_tiles; i++) {
		board_classes[i] = 'tile_safe';
		tiles_available++;
		// tiles available at the end of this loop will equal all the tiles on the board,
		// later to be reduced as we place the mines and warning tiles
	}


	// place the mines and warning tiles
	for (mine_place in mine_ids) {
		
		mine_location = mine_ids[mine_place];
		current_tile_class = getTileClass(mine_location, board_classes);

		// For a given mine, determine the correct geometry of warning tile placement
		// i.e. if a mine is along a wall, you don't need to set warning tiles on the wall
		// side of the mine.
		warning_zone = findWarningGeometry(mine_location, board_width)
		
		// Place the mines in the board space.
		// Sometimes, our random assignment will pick the same tile twice to receive a bomb.
		// If it does, don't repeat this action.

		if (current_tile_class != 'tile_mine') {
			if (current_tile_class != 'tile_warning') {
				tiles_available--; // For every mine placed, there is one less tile 'available' for play
			}
			board_classes[mine_location] = 'tile_mine';
		}

		// Place the warning tiles around each mine.
		for (warning_index in warning_zone) {
			target_tile = mine_ids[mine_place]+warning_zone[warning_index]
			target_tile_class = board_classes[target_tile]

			if (target_tile_class == 'tile_mine' // already designated as a mine
				|| target_tile_class >= num_tiles   // target is outside of the tile space (the bottom of the board)
				|| target_tile_class <= 0) {		  // target is outside of the tile space (the top of the board)
				// do nothing
			}
			else if (target_tile_class != undefined && target_tile_class.indexOf('tile_warning') >= 0) {
				var new_warning_number = (parseInt(target_tile_class[12],10)+1).toString();
				var new_target_tile_class = target_tile_class.substring(0,12) + new_warning_number;
				board_classes[target_tile] = new_target_tile_class;
			}
			else  {
				// set current tile class to warning
				board_classes[target_tile] = 'tile_warning1';
			}
		}
	}
	return [board_classes, tiles_available];
}

// ######### DOM Manipulation #########

$(document).ready(function() {
	
	// Assemble the board html

	// Assign each tile an id, in order from left to right, top to bottom
	var j = 0;
	var gameOver = false;
	var user_difficulty = null;
	var board_classes = [];
	var tiles_available = 0;

	$('.difficulty').click(function() {
		$(this).css("background-color","var(--button-click-color)");

		user_difficulty = $(this).attr('id');

		[board_classes, tiles_available] = buildBoard(user_difficulty);

		$('#starter').animate({
			top: '-100vh'
		});
	});

	$('.tile').each(function() {
		var js = j.toString();
		$(this).attr('id', js);
		$(this).attr('data-clicked', 'not_clicked');
		j++;
	});

	// Whenever a tile is clicked, change its class to the under-layer
	// i.e. click on a tile with a mine under it, and change it to "tile_mine"
	var gameScore=0;

	$('.tile').click(function() {
		if ($(this).attr('data-clicked') != 'clicked') {
			
			// add a point to the score
			gameScore++;

			// note that this tile has been clicked so it cannot be clicked again
			$(this).attr('data-clicked', 'clicked');

			// change the class of this tile based on previously-determined board geometry
			$(this).removeClass('tile');
			$(this).addClass(function() {
				this_class = getTileClass($(this).attr('id'),board_classes)
				if (this_class == 'tile_mine') {
					gameOver = true;
				}
				return this_class;
			});

			// if you hit a mine this turn, end the game
			if (gameOver==true) {
				// show all remaining tiles in an uncovered state
				$(".tile").each(function() {
					$(this).toggleClass(function() {
						return getTileClass($(this).attr('id'),board_classes);
					});
				});

				// write the game over text to the html
				$('#result').html('Ouch! Game over.');
				
				// bring the dropdown overlay down
				$('#dropDown').animate({
					top: '10vh'
				});

				// reload the game if desired
				$('#button').click(function() {
					$('#button').css("background-color","var(--button-click-color)")
					location.reload();
				});
			}

			if (gameScore == tiles_available) {
				// show all remaining tiles in an uncovered state
				$(".tile").each(function() {
					$(this).toggleClass(function() {
						return getTileClass($(this).attr('id'),board_classes);
					});
				});

				// write the win text to the html
				$('#result').html('You win!!!');
				
				// bring the dropdown overlay down
				$('#dropDown').animate({
					top: '10vh'
				});

				// reload the game if desired
				$('#button').click(function() {
					$('#button').css("background-color","var(--button-click-color)")
					location.reload();
				});
			}


			$('#score').html("Score: "+gameScore);
		}
	});

});