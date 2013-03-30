var Entity = new Class({

	width: null,
	height: null,
	src: null,
	
	speed: {'x': 0, 'y': 0},
	acc: {'x': 0, 'y': 0},
	
	// Provides the maximum distance to 
	// new entities, created after this one....
	maxDistance: 100,
	
	alive: true,
	safe: true,
	counter: 0,
	invulnerable: false,
	
	initialize: function(x, y) {	
		this.x = x;
		this.y = y;
		
		this.load_image();
	},
	
	load_image: function () {
		
		// Hmm, needs this for some some closure fix in .image.onload
		var cls = this;
		
		this.image = new Image();
		this.image.onload = function () {	
			// Allow for just using the original file size
			if (cls.width == null && cls.width == null) {
				cls.width = cls.image.width;
				cls.height = cls.image.height;
			}
			
			// Allow for proportional scaling by specifiying the height
			else if (cls.width == null) {
				cls.width = cls.image.width / cls.image.height * cls.height;
			}
			
			// Allow for proportional scaling by specifiying the width
			else if (cls.height == null) {
				cls.height = cls.image.height / cls.image.width * cls.width;
			}
			
			this.loaded = true;
		}
		
		this.image.src = this.src;	
	},
	
	draw: function (viewport) {	
		coords = this.coordinates(viewport);
		
		if (this.image.loaded) {
			ctx.drawImage(this.image, coords.x, coords.y, this.width, this.height);
		}
	},
	
	// Calculates the on-screen coordinates from the ingame position
	coordinates: function (viewport) {
		return {'x': this.x, 'y': canvas.height - this.y - this.height + viewport};
	},
	
	move: function () {	
		this.x += this.speed.x;
		this.y += this.speed.y;
		
		// Wrap-around canvas, so to speak
		if (this.x + (this.width / 2) > canvas.width) {
			this.x = -this.width / 2;
		}
		
		else if (this.x + (this.width / 2) < 0) {
			this.x = canvas.width - this.width / 2;
		}
	},
	
	accelerate: function () {
		this.speed.x += this.acc.x;
		this.speed.y += this.acc.y;
	},
	
	checkCollision: function (obj) {
	
		// If we're the same object, we obviously collide, but ignore it ;)
		if (this == obj ||
				
		// Ignore if we're dead too...
			this.alive == false ||
			obj.alive == false) {
			return;
		}
		
		// Quick hack. The object we collide with is always the player.
		// But the player has a hitbix much larger than the actual animation. So we crop the sides a bit.
		// Should have made a hitbox() function and some crop variables, but no time....
		var cropFactor = 4;
		
		// Check all four corners
		if ((this.y + this.height >= obj.y&& 
			 this.y + this.height <= obj.y + obj.height &&
			 this.x + this.width - obj.width/cropFactor >= obj.x &&
			 this.x + obj.width/cropFactor <= obj.x + obj.width) ||
			 
			(this.y + this.height >= obj.y && 
			 this.y + this.height  <= obj.y + obj.height &&
			 this.x + obj.width/cropFactor >= obj.x &&
			 this.x + obj.width/cropFactor <= obj.x + obj.width) ||
			 
			(this.y >= obj.y && 
			 this.y <= obj.y + obj.height &&
			 this.x + this.width - obj.width/cropFactor >= obj.x &&
			 this.x + obj.width/cropFactor<= obj.x + obj.width) ||
			 
			(this.y >= obj.y && 
			 this.y <= obj.y + obj.height &&
			 this.x + obj.width/cropFactor >= obj.x &&
			 this.x + obj.width/cropFactor <= obj.x + obj.width)) {
		
				this.onCollision(obj);
		}
	},
	
	// What should this entity do every frame?
	update: function () {
		this.counter++;
		this.accelerate();
		this.logic();
		this.move();
		this.animate();
	},
	
	clear: function (viewport) {
		coords = this.coordinates(viewport);
		ctx.clearRect(coords.x-1, coords.y-100, this.width+2, this.height+200);
	},
	
	onCollision: function (obj) {

	},
	
	logic: function (obj) {

	},
	
	animate: function () {
	
	},
	
	kill: function () {
		this.alive = false;
	},

	toString: function () {
		return 'Element';
	}
})

var Generic = new Class({
	Extends: Entity,
	
	initialize: function (x, y, width, height, src) {
		this.height = height;
		this.width = width;
		this.src = src;

		this.parent(x, y);
	},
})

var Animated = new Class ({
	
	speedCounter: 0,
	orderCounter: 1,
	currentAnimation: null,
	
	orientation: null,
	
	animate: function () {
		this.speedCounter++;		
		this.animationLogic();
		this.setOrientation();
		
		if (this.currentAnimation != null) {
			var anim = this.animations[this.currentAnimation];

			if (this.speedCounter % anim.speed == 0) {	 							 
				this.image.src = this.getImagePath(this.orientation, this.currentAnimation, this.orderCounter);
				this.orderCounter++;		
				if (this.orderCounter > anim.count) {
					this.setAnimation(anim.onfinish[0], anim.onfinish[1]);
				}
			}
		}
	},
	
	getImagePath: function (orientation, animation, order) {
		if (this.orientation) {	
			return this.src.replace(/([^\/]+)\.(png|gif|jpg)/, 
									orientation + '/$1-' + animation + '-' + order + '.$2');
		}
		
		else {
			return this.src.replace(/([^\/]+)\.(png|gif|jpg)/, 
 	  								'$1-' + animation + '-' + order + '.$2');
		}
	},
	
	setAnimation: function (name, start) {
	
		start = typeof(start) != 'undefined' ? start : 1;
		
		if (this.currentAnimation != name || 
			this.orderCounter > this.animations[this.currentAnimation].count) {
			
			this.currentAnimation = name;
			
			this.speedCounter = 0;
			this.orderCounter = start;
		}
	},
	
	setOrientation: function () {
		if (this.speed.x > 0) {
			this.orientation = 'right';
		}
		
		else if (this.speed.x < 0) {
			this.orientation = 'left';
		}
	},
	
	animationLogic: function () {
		
	},
})

var Player = new Class({
	Extends: Entity,
	Implements: Animated,
	
	width: 70,
	src: 'gfx/entity/tim/tim.png',
	
	animations: {'up': {'count': 3, 
						'speed': 5, 
						'onfinish': ['up', 1]},
						
				 'down': {'count': 3,
				 		  'speed': 5,
				 		  'onfinish': ['down', 1]},
				 		  
				 'transition': {'count': 9,
				 				'speed': 5,
				 				'onfinish': ['down', 1]},
				 				
				 'die': {'count': 9,
				 		 'speed': 5,
				 		 'onfinish': ['die', 7]},
				},
	
	acc: {'x': 0, 'y': -0.3},
	orientation: 'left',
	
	update: function () {
		this.parent();

		if (this.speed.y < 0) {
			this.invulnerable = false;
		}
	},
	
	animationLogic: function () {
	
		if (this.alive == false) {
			this.setAnimation('die');
		}
		
		else if (this.speed.y < 0 && this.currentAnimation != 'down') {
			this.setAnimation('transition');
		}
		
		else if (this.speed.y > 0) {
			this.setAnimation('up');
		}
	},
	
	kill: function () {
		this.parent();
		game.playSound('kill');
		game.end();
	},
	
	jump: function (speed, sound) {
		this.speed.y = speed;
		
		if (speed >= 15) {
			this.invulnerable = true;
		}
		
		if (sound == undefined) {
			sound = 'jump' + Number.random(1, 7); // Different jump sounds
		}
		
		game.playSound(sound);
	},
	
	toString: function () {
		return 'Player';
	},
})

var Platform = new Class({
	Extends: Entity,
	
	src: 'gfx/entity/platform.png',
	width: 100,
	
	maxDistance: 125,
	sound: 'jump',
	
	onCollision: function (obj) {
	
		// Make sure he's moving downwards
		if (obj.speed.y <= 0 &&
		
		//... and that he is atop of the platform, not at the bottom
			obj.y >= this.y + this.height - 10) {
			
			// Now JUMP!
			obj.jump(10, this.sound);
		}
	},
	
	toString: function () {
		return 'Platform';
	},
})

var BrokenPlatform = new Class({
	Extends: Entity, 
	Implements: Animated,
	safe: false,
	
	src: 'gfx/entity/broken/platform.png',
	width: 100,
	
	animations: {'breaking': {'count': 2,
		 		 			  'speed': 1,
		 		 			  'onfinish': ['breaking', 2]}},
	
	onCollision: function (obj) {
	
		// Make sure he's moving downwards
		if (obj.speed.y <= 0 &&
		
		//... and that he is atop of the platform, not at the bottom
			obj.y >= this.y + this.height - 10) {
			
			// Then break the platform...
			this.speed.y = obj.speed.y;
			this.acc.y = obj.acc.y;
			this.setAnimation('breaking');
		}
	},
	
	toString: function () {
		return 'Broken Platform';
	},
})

var OneTimePlatform = new Class({
	Extends: Platform,
	
	src: 'gfx/entity/pinky.png',
	width: 42,
	
	maxDistance: 125,
	sound: 'jump',
	
	onCollision: function (obj) {
		
		// Make sure he's moving downwards
		if (obj.speed.y <= 0 &&
		
		//... and that he is atop of the platform, not at the bottom
			obj.y >= this.y + this.height - 10) {
			
			// Then break the platform...
			this.speed.y = obj.speed.y;
			this.acc.y = obj.acc.y;
			this.parent(obj);
		}
	},
	
	toString: function () {
		return 'One-time Platform';
	},
})

var Spring = new Class({
	Extends: Entity,
	
	width: 15,
	src: 'gfx/entity/spring.png',
	
	maxDistance: 500,
	
	onCollision: function (obj) {
	
		// Make sure he's moving downwards
		if (obj.speed.y <= 0) {
			
			// Now JUMP!
			obj.jump(20, 'bounce');
		}
	},
	
	toString: function () {
		return 'Spring';
	},
})

var Tube = new Class({
	Extends: Entity,
	
	src: 'gfx/entity/tube.png',
	
	width: 80,
	maxDistance: 400,
	
	onCollision: function (obj) {
	
		// Make sure he's moving downwards
		if (obj.speed.y <= 0) {
			
			// Now JUMP!
			obj.jump(25, 'bounce');
		}
	},
	
	toString: function () {
		return 'Tube';
	},
})

var HorizontalLift = new Class ({
	Extends: Platform,
	src: 'gfx/entity/cloud.png',
	
	speed: {'x': 3, 'y': 0},
	sound: 'cloud',

	logic: function () {
	
		if (this.x < 50) {
			this.speed.x = 2;
		}
		
		else if (this.x > canvas.width - this.width - 50) {
			this.speed.x = -2;
		}
	},
	
})

var Monster = new Class({
	Extends: Entity,
	Implements: Animated,
	
	src: 'gfx/entity/monster/monster.png',
	width: 50,
	
	animations: {'walk': {'count': 16, 
				 		'speed': 5, 
				 		'onfinish': ['walk', 1]},
		
				 'die': {'count': 4,
				 		  'speed': 5,
				 		  'onfinish': ['die', 3]},
				},
				
	currentAnimation: 'walk',
	
	maxDistance: 150,
				
	speed: {'x': 1, 'y': 0},				
	path: {'left': 0, 'right': 0},
	
	orientation: 'left',
				
	initialize: function (x, y, left, right) {
		this.parent(x, y);
		this.path.left = left;
		this.path.right = right;	
	},
	
	logic: function () {
		
		if (this.x + 20 < this.path.left) {
			this.speed.x = 1;
		}
		
		else if (this.x + this.width - 20 > this.path.right) {
			this.speed.x = -1;
		}
	},
	
	onCollision: function (obj) {
		
		// Make sure player moving downwards, or very fast
		if (obj.speed.y <= 0 ||
			obj.invulnerable) {
			
			// Now JUMP!
			obj.jump(13, 'bounce');
			
			// And we're dead..
			this.kill();
		}
		
		// Otherwise, the player dies! Harsh ;)
		else {
			obj.speed.y = 0;
			obj.kill();
		}
	},
	
	kill: function () {
		this.parent();
		this.setAnimation('die');
		this.acc.y = -0.15;
	},
	
	toString: function () {
		return 'Monster';
	},
})

var Claw = new Class({
	Extends: Entity,
	Implements: Animated,
	
	src: 'gfx/entity/claw/claw.png',
	width: 50,
	
	animations: {'chomp': {'count': 11, 
				 		'speed': 7, 
				 		'onfinish': ['chomp', 1]}},
				
	currentAnimation: 'chomp',
				
	speed: {'x': 0, 'y': 1},				
	path: {'top': 50, 'bottom': 0},
	
	initialize: function (x, y) {
		this.parent(x, y);
	},
	
	submerged: true,
	
	logic: function () {
		
		if (this.counter % 200 < 50) {
			this.speed.y = 1;
			this.submerged = false;
		}
		
		else if (this.counter % 200 < 50) {
			this.speed.y  = 0;
		}
		
		else if (this.counter % 200 < 100) {
			this.speed.y = -1;
		}
		
		else {
			this.submerged = true;
			this.speed.y  = 0;
		}
	},
	
	onCollision: function (obj) {
		
		if (this.submerged) {
			return;
		}
		
		// This one only dies if we have super speed...
		if (obj.invulnerable) {
			
			// And we're dead..
			this.kill();
		}
		
		// Otherwise, the player dies! Harsh ;)
		else {
			obj.speed.y = 0;
			obj.kill();
		}
	},
	
	kill: function () {
		this.parent();
		this.acc.y = -0.15;
		game.playSound('spikes');
	},
	
	toString: function () {
		return 'Claw';
	},
})