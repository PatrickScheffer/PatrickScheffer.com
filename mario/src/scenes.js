// Game scene
// -------------
// Runs the core gameplay loop

Crafty.scene('Game', function() {
  this.victory = false;
  
  // A 2D array to keep track of all occupied tiles
  this.occupied = new Array(Game.map_grid.width);
  for (var i = 0; i < Game.map_grid.width; i++) {
    this.occupied[i] = new Array(Game.map_grid.height);
    for (var y = 0; y < Game.map_grid.height; y++) {
      this.occupied[i][y] = false;
    }
  }

  // Player character, placed at 5, 15 on our grid
  this.player = Crafty.e('PlayerCharacter').at(5, 15);
  this.occupied[this.player.at().x][this.player.at().y] = true;
  
  // create level
  if(level[this.nr] == undefined) this.nr = 0;
  for (var y = 0; y < level[this.nr].length; y++) {
	for(var x = 0; x < level[this.nr][y].length; x++) {
	  if(level[this.nr][y][x] == 1) {
		Crafty.e('GroundTile').at(x,y);
		this.occupied[x][y] = true;
	  }
	  if(level[this.nr][y][x] == 2) {
		Crafty.e('Coin').at(x,y);
		this.occupied[x][y] = true;
	  }
	}
  }

  // Play a ringing sound to indicate the start of the journey
  Crafty.audio.play('ring');

  // Show the victory screen once all coins are picked up
  this.show_victory = this.bind('CoinPickedUp', function() {
    if (!Crafty('Coin').length && !this.victory) {
	  this.victory = true;
      Crafty.scene('Victory');
	  this.nr++;
    }
  });
}, function() {
  // Remove our event binding from above so that we don't
  //  end up having multiple redundant event watchers after
  //  multiple restarts of the game
  this.unbind('CoinPickedUp', this.show_victory);
});


// Victory scene
// -------------
// Tells the player when they've won and lets them start a new game
Crafty.scene('Victory', function() {
  // Display some text in celebration of the victory
  Crafty.e('2D, DOM, Text')
    .text('All coins collected!<p>Stage '+this.nr+' completed!')
    .attr({ x: 0, y: Game.height()/2 - 24, w: Game.width() })
    .css($text_css);

  // Give'em a round of applause!
  Crafty.audio.play('applause');

  this.restart_game = function() {Crafty.scene('Game');};
  this.bind('KeyDown', this.restart_game);
}, function() {
  // Remove our event binding from above so that we don't
  //  end up having multiple redundant event watchers after
  //  multiple restarts of the game
  this.unbind('KeyDown', this.restart_game);
});

// Loading scene
// -------------
// Handles the loading of binary assets such as images and audio files
Crafty.scene('Loading', function(){
  // Draw some text for the player to see in case the file
  //  takes a noticeable amount of time to load
  Crafty.e('2D, DOM, Text')
    .text('Loading; please wait...')
    .attr({ x: 0, y: Game.height()/2 - 24, w: Game.width() })
    .css($text_css);

  // Load our sprite map image
  Crafty.load([
    'assets/16x16_forest_2.gif',
    'assets/hunter.png',
    'assets/door_knock_3x.mp3',
    'assets/door_knock_3x.ogg',
    'assets/door_knock_3x.aac',
    'assets/board_room_applause.mp3',
    'assets/board_room_applause.ogg',
    'assets/board_room_applause.aac',
    'assets/candy_dish_lid.mp3',
    'assets/candy_dish_lid.ogg',
    'assets/candy_dish_lid.aac'
    ], function(){
    // Once the images are loaded...

    // Define the individual sprites in the image
    // Each one (spr_tree, etc.) becomes a component
    // These components' names are prefixed with "spr_"
    //  to remind us that they simply cause the entity
    //  to be drawn with a certain sprite	
	Crafty.sprite(16, 'assets/floor.gif', {
	  spr_floor:	[0, 0]
	});
	
	Crafty.sprite(16, 'assets/coin.gif', {
	  spr_coin:	[0, 0],
	}, 0, 2);

    // Define the PC's sprite to be the first sprite in the third row of the
    //  animation sprite map
    Crafty.sprite(16, 'assets/mario.gif', {
      spr_player:  [0, 0],
    }, 0, 0);

    // Define our sounds for later use
    Crafty.audio.add({
      knock:     ['assets/door_knock_3x.mp3',
                  'assets/door_knock_3x.ogg',
                  'assets/door_knock_3x.aac'],
      applause:  ['assets/board_room_applause.mp3',
                  'assets/board_room_applause.ogg',
                  'assets/board_room_applause.aac'],
      ring:      ['assets/candy_dish_lid.mp3',
                  'assets/candy_dish_lid.ogg',
                  'assets/candy_dish_lid.aac']
    });

    // Now that our sprites are ready to draw, start the game
    Crafty.scene('Game');
  })
});