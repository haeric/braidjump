
//
// Main game class
// Handles the game loop logic, keyboard-bindings
// and global game states
//

var Game = new Class({
	
	viewport: 0,
	generator: null,
	
	score: 0,
	images: [],
	highscore: new Highscore(),
	
	player: null,
	map: [],
	
	exit: false,
	
	preloadObjects: [new Platform(), 
		             new Player(), 
		             new Monster(),
		             new HorizontalLift(),
		             new BrokenPlatform(),
		             new Spring(),
		             new Claw(),
		             new Tube(),
		             new OneTimePlatform],
	
	initialize: function (highscore) {
		this.preload();
	},
	
	// Preload images to avoid flickering when showing
	// them for the first time....
	preload: function () {
		var images = [];
		
		ctx.fillStyle = "#000";
		ctx.font = "bold 50px georgia";
		ctx.textAlign = "center";
		ctx.fillText("BraidJump!", canvas.width/2, canvas.height/2-100);
		
		ctx.font = "normal 18px georgia";
		ctx.fillText("a/d or left/right: move", canvas.width/2, canvas.height/2 - 40);
		ctx.fillText("Enter: restart game", canvas.width/2, canvas.height/2-15);
		ctx.fillText("M: toggle music", canvas.width/2, canvas.height/2+10);
		
		ctx.fillText("Loading, please wait...", canvas.width/2, canvas.height/2+100);
		
		for (var i = 0; i < this.preloadObjects.length; i++) {
			var e = this.preloadObjects[i];
			images.push(e.src);
			
			if (e.animations) {
				for (name in e.animations) {
					var anim = e.animations[name];
					
					for (var j = 1; j <= anim.count; j++) {
						images.push(e.getImagePath('left', name, j));
						images.push(e.getImagePath('right', name, j));
					}
				}
			}
		}
		
		// When all the images are loaded, we can start!
		this.images = Asset.images(images, {
			onComplete: this.reportReady
		})
	},
	
	reportReady: function () {
		game.ready = true;
		
		ctx.font = "normal 18px georgia";
		ctx.clearRect(0, canvas.height/2+50, canvas.width, 100);
		ctx.fillText("Press any key to start", canvas.width/2, canvas.height/2+100);
	},
	
	start: function () {
		game.ready = false;
		$('sound').play();
		game.generateStart();	
		game.loop();
	},
	
	// Create the start map
	generateStart: function () {
		
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		this.player = new Player(100, 250);
		
		var p1 = new Platform(100, 200);
		var p2 = new Platform(300, 300);
		var p3 = new Platform(400, 400);
		var p4 = new BrokenPlatform(550, 300);
		
		this.map = [this.player, p1, p2, p3, p4];
		new StartGenerator(this.map, 400, 1200);
	},
	
	// Game loop outer wrapper, tries to keep
	// us at 60fps sharp....
	loop: function () {
		var startTime = new Date();

		game.update();
		
		// To attempt smooth-ish running at 60fps, we remove the processing time of this frame
		// from the timeout to the next frame
		var timeDifference = new Date().getTime() - startTime.getTime();
		
		setTimeout(game.loop, 17 - timeDifference);
	},
	
	// The main game update function, do everything
	// that is needed each frame
	update: function () {
		this.clearCanvas();
		this.drawMap();
		this.drawOverlay();
		this.updateState();
		this.generateMap();
		this.keyFire();
	},
	
	// Clear only the parts we need
	clearCanvas: function () {
		for (var i = 0; i < this.map.length; i++) {
			this.map[i].clear(this.viewport);
		}
		
		// Clear below the text too
		ctx.clearRect(canvas.width - 100, 26, 100, 35);
		
		// Clear the right lane for the highscores
		ctx.clearRect(canvas.width - 37, 0, 37, canvas.height);
		
		// If we're dead, the score is showing. Need to clear there too.
		if (!this.player.alive) {
			ctx.clearRect(canvas.width/4, 0, canvas.width/2, canvas.height);
		}
	},
	
	// Draw all our entities on canvas
	drawMap: function () {
		
		for (var i = 0; i < this.map.length; i++) {
			var el = this.map[i];
			el.update();		
			el.checkCollision(this.player);
			el.draw(this.viewport); 
			
			// Remove off-screen elements
			if (el.coordinates(this.viewport).y > canvas.height) {
				this.map.splice(i, 1);
				i--;
			}
		}
	},
	
	updateState: function () {
		
		// Update the score
		if (this.score < this.viewport - 1 && this.player.alive) {
			this.score = Math.round(this.viewport);
		}
		
		// Kill the player if he goes below the viewport.
		if (this.player.y < this.viewport &&
			this.player.alive) {
			this.player.kill();
		}
		
		// Push the 'viewport' upwards when we go up
		if (this.player.y - this.viewport > canvas.height / 2) {
			this.viewport = this.player.y - canvas.height / 2;
		}
		
		
		// Move the viewport downwards when we have died and are falling...
		if (this.player.y - this.viewport < canvas.height / 12 && 
			this.viewport > 0 &&
			!this.player.alive) {
			this.viewport = this.player.y - canvas.height / 12;
		}
		
		// Move the background a bit when we go up
		//canvas.style.backgroundPosition = '0px ' + this.viewport/10 + 'px';
	},
	
	// Draws overlay information like on-screen text, score and such...
	drawOverlay: function () {
		
		// Draw score
		ctx.fillStyle = "#000";
		ctx.font = "26px georgia";
		ctx.textAlign = "left";		
		ctx.fillText(this.score, canvas.width - 100, 50);
		
		// Show some text at the middle of the screen, if defined
		if (this.header) {
			ctx.font = "bold 40px georgia";
			ctx.textAlign = "center";
			ctx.fillText(this.header, canvas.width/2, canvas.height/2 - 100);
		}
		
		if (this.text) {
			ctx.font = "30px georgia";
			ctx.textAlign = "center";
			
			var lines = this.text.split('\n');
			for (var i = 0; i < lines.length; i++) {
				ctx.fillText(lines[i], canvas.width/2, canvas.height/2 + i*60);
			}
		}
		
		if (this.player.y < 0) {
			ctx.font = "16px georgia";
			ctx.textAlign = "center";
			ctx.fillText('Press any key to try again', canvas.width/2, canvas.height - 100);
		}
		
		// Show highscores on the side
		var lastScore = 999999;
		for (var i = 0; i < this.highscore.scores.length; i++) {		
			
			var val = this.highscore.scores[i];
			
			// Ensure that there is some space between each placement
			if (lastScore - 20 < val) {
				val = lastScore - 20;
			}
			
			ctx.font = "18px georgia";
			ctx.textAlign = "left";
			ctx.fillText(this.nth(i + 1) + "-", canvas.width - 35, canvas.height/2 - val + this.viewport);
			
			lastScore = val;
		}
	},
	
	lastChange: 0,
	
	// Generate the map as we go upwards
	generateMap: function () {	
		
		if (this.lastChange + 500 < this.viewport) {
			this.lastChange = this.viewport;
			
			if (this.score < 1000) {
				var generators = [EasyGenerator];
			}
			
			else if (this.score < 2000) {
				var generators = [EasyGenerator, MediumGenerator];
			}
			
			else if (this.score < 5000) {
				var generators = [MediumGenerator, HardGenerator, CloudyGenerator];
			}
			
			else {
				var generators = [HardGenerator, ReallyHardGenerator, OneTimeGenerator, CloudyGenerator];
			}
			
			new generators[Number.random(0, generators.length-1)](this.map, this.viewport+canvas.height, this.viewport+canvas.height+500);
		}
	},
	
	// Called when we die....
	end: function () {
		var place = game.highscore.add(game.score);
		this.header = "Game over!";
		this.text = "Highscore: " + this.highscore.getPlace(1) +
		            "\nYour score: " + this.score;
		
		if (place == 1) {
			this.text += "\nNew highscore!!";
		}
		
		else if (place > 0) {
			this.text += "\n" + this.nth(place) + " best score!";
		}
	},
	
	// Just a helper function for making 1st, 2nd etc
	nth: function (num) {
		var conv = ['0', '1st', '2nd', '3rd'];
		
		if (num < 4) {
			return conv[num];
		}
		
		return num + 'th';
	},
	
	// Reset the game
	reset: function () {
		this.score = 0;
		this.viewport = 0;
		this.map = [];
		this.header = null;
		this.text = null;
		this.lastChange = 0;		
		
		this.generateStart();
	},
	
	//
	// Keyboard actions
	//
	
	keyPressed: null,
	
	keyDown: function (e) {
		
		if (!game) {
			return;
		}
		
		if (game.ready) {
			game.start();
		}
		
		if (game.player) {
			if (e.key == 'enter' || (!game.player.alive && game.player.y < 0)) {
				game.reset();
			}
		}
		
		if (e.key == 'm') {
			if ($('sound').paused) {
				$('sound').play();
			}
			
			else {
				$('sound').pause();
			}
		}
		
		else {			
			game.keyPressed = e.key;
		}
	},
	
	keyUp: function (e) {
		
		game.keyPressed = null;
		
		if (game.player) {
			game.player.speed.x = 0;
		}
	},
	
	keyFire: function () {

		if (this.keyPressed == 'd' || this.keyPressed == 'right') {
			this.player.speed.x = 5;
		}

		else if (this.keyPressed == 'a' || this.keyPressed == 'left') {
			this.player.speed.x = -5;
		}
	},
	
	playSound: function (name) {	
		if (!$('sound').paused) {
			new Audio('sound/' + name + '.wav').play();
		}
	}
})

// Global variables are of course extremely taboo,
// but these are the only ones, I swear! (Except for entity classes and such, of course)
var canvas;
var ctx;
var game;

window.addEvent('domready', function() {  
	canvas = $('game');
	ctx = canvas.getContext('2d');
	
	// Preloads and then runs the game
	game = new Game();

	document.addEvent('keyup', game.keyUp);
	document.addEvent('keydown', game.keyDown);
});
