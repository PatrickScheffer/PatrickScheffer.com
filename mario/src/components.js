// The Grid component allows an element to be located
//  on a grid of tiles
Crafty.c('Grid', {
  init: function() {
    this.attr({
      w: Game.map_grid.tile.width,
      h: Game.map_grid.tile.height
    })
  },

  // Locate this entity at the given position on the grid
  at: function(x, y) {
    if (x === undefined && y === undefined) {
      return { x: this.x/Game.map_grid.tile.width, y: this.y/Game.map_grid.tile.height }
    } else {
      this.attr({ x: x * Game.map_grid.tile.width, y: y * Game.map_grid.tile.height });
      return this;
    }
  }
});

// An "Actor" is an entity that is drawn in 2D on canvas
//  via our logical coordinate grid
Crafty.c('Actor', {
  init: function() {
    this.requires('2D, Canvas, Grid, Gravity');
  },
});

Crafty.c('GroundTile', {
  init: function() {
	this.requires('Actor, Solid, spr_floor');
  }
});

// mario
Crafty.c('PlayerCharacter', {
  init: function() {
    this.requires('Actor, Twoway, Collision, spr_player, SpriteAnimation')
      .twoway(2,5)
      .stopOnSolids()
      .onHit('Village', this.visitVillage)
	  .onHit('Coin', this.pickupCoin)
      .animate('PlayerJumpingRight',    2, 0, 0) // animation name, x, y, number of frames to play
      .animate('PlayerJumpingLeft',    2, 1, 0)
      .animate('PlayerMovingRight', 0, 0, 1)
      .animate('PlayerMovingLeft',  0, 1, 1)
	  .gravity('GroundTile');
	  
	var direction = 'right';
	var moving = false;
	var animation_speed = 4;
	  
	// check elke frame of je aan het jumpen bent, zo ja, pas de sprite aan
	this.bind('EnterFrame', function(data) {
	  if(this._up) {
	    if(direction == 'right') {
		  this.animate('PlayerJumpingRight', 100, 0);
		} else if(direction == 'left') {
		  this.animate('PlayerJumpingLeft', 100, 0);
		}
	  } else if(this._currentReelId != null && moving) {
		if(direction == 'right') {
		  this.animate('PlayerMovingRight', animation_speed, -1);
		} else if(direction == 'left') {
		  this.animate('PlayerMovingLeft', animation_speed, -1);
		}
	  }
	});

    // pas de sprite aan als je van richting veranderd
    this.bind('NewDirection', function(data) {
	  if (data.x > 0) {
		direction = 'right';
		moving = true;
		if(!this._up) {
		  this.animate('PlayerMovingRight', animation_speed, -1);
		}
      } else if (data.x < 0) {
	    direction = 'left';
		moving = true;
		if(!this._up) {
		  this.animate('PlayerMovingLeft', animation_speed, -1);
		}
      } else {
		moving = false;
        this.stop();
      }
    });
  },

  // stop als je een Solid object raakt
  stopOnSolids: function() {
    this.onHit('Solid', this.stopMovement);

    return this;
  },

  // Stop
  stopMovement: function() {
    this._speed = 0;
    if (this._movement) {
      this.x -= this._movement.x;
      this.y -= this._movement.y;
    }
  },
  
  // pak een muntje op
  pickupCoin: function(data) {
	Coin = data[0].obj;
	Coin.pickup();
  }
});

// coin
Crafty.c('Coin', {
  init: function() {
	this.requires('Actor, spr_coin, SpriteAnimation')
	.animate('rotate', 0, 0, 3);
	
	this.animate('rotate', 14, -1);
  },
  
  pickup: function() {
	this.destroy();
	Crafty.audio.play('knock');
	Crafty.trigger('CoinPickedUp', this);
  }
});