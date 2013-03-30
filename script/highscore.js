// Saves our highscores
// Persistent if localStorage is supported

var Highscore = new Class({
	
	limit: 10,
	scores: [],
	
	initialize: function () {
		this.loadPersistent();
	},
	
	// Load scores from localStorage if available
	loadPersistent: function () {
		if (Modernizr.localstorage) {
			var i = 0;
			while (typeof(localStorage['highscore.' + i]) == 'string' && i < this.limit) {
				var score = Number(localStorage['highscore.' + i]);
				
				if (score > 0) {
					this.scores.push(score);
				}
				
				i++;
			}
		}
	},
	
	// Save the scores in localStorage
	savePersistent: function () {
		if (Modernizr.localstorage) {
			for (var i = 0; i < this.scores.length; i++) {
				localStorage['highscore.' + i] = this.scores[i];
			}
		}
	},
	
	// Adds a score to our highscore-list, returning what place you
	// came in, or 0 if you didn't "make it to the highscore list"
	add: function (score) {
		
		if (Number(score) == NaN) {
			return;
		}
		
		// Find the correct spot to insert the score
		for (var i = 0; i <= this.scores.length; i++) {
			if (score > this.scores[i]) {
				break;
			}
		}
		
		this.scores.splice(i, 0, [score]);
		
		while (this.scores.length > this.limit) {
			this.scores.pop();
		}
		
		this.savePersistent();
		
		// Did we "make it to the highscore list"?
		if (i < this.limit) {
			return i + 1;
		}
		
		// If not, just return 0
		return 0;

	},
	
	getPlace: function (place) {
		if (place <= this.scores.length) {
			return this.scores[place-1];
		}
		
		return 0;
	}
	
})