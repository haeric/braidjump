
//
// Map Generators...
// ANCIENT ELVEN MAGIC; BEWARE!
//

var MapGenerator = new Class ({
	entities: {},
	multiplier: 1,
	distance: 50,
	
	map: [],
	likelyhoodMap: [],
	
	initialize: function (map, from, to) {
		this.map = map;
		this.generateLikelyhoods();
		this.generateMap(from, to);
	},
	
	// Creates a list of items where an entry represents a chance to get generated
	generateLikelyhoods: function () {
		for (var name in this.entities) {
			for (var i = 0; i < this.entities[name]; i++) {
				this.likelyhoodMap.push(name);
			}
		}
	},
	
	// Generate entities from a y coordinate to another
	generateMap: function (from, to) {
		var current = from;
		
		while (current < to) {
			this.generateEntity(current);		
			
			// Find the last entity that is "safe" to jump on
			for (var i = this.map.length-1; i >= 0; i--) {				
				var lastEntity = this.map[i];
				
				if (lastEntity.safe) {
					break;
				}
			}
			
			// Randomize the next Y position somewhat, but always keep it so low that we can reach it!
			current += Number.random(this.distance, lastEntity.maxDistance);
			
			if (current > lastEntity.y + lastEntity.maxDistance) {
				current = lastEntity.y + lastEntity.maxDistance;
			}
		}
	},
	
	// Generate an item randomly, and put it in the map
	generateEntity: function (y) {
		var x = Number.random(0, canvas.width-100);
		
		// Select a random element from our likelyhoodMap...
		var luckyOne = this.likelyhoodMap[Number.random(0, this.likelyhoodMap.length-1)]
		
		// Congratulations, you've won CREATION!
		var newbies = this.create(luckyOne, x, y);
	
		this.map.append(newbies);
	},
	
	// Creates an entity directly from the class name if it exists,
	// otherwise it will use a special function (usually creates several elements)
	// Returns a list of entities
	create: function (name, x, y) {
		
		if (name == 'Empty') {
			return []
		}
		
		if (this['make' + name] != undefined) {
			return this['make' + name](x, y);
		}
		
		 if (window[name]) {
			return [new window[name](x, y)];
		}

		throw('Unknown entity or function "' + name + '" at map generation.');

	},
	
	//
	// Special cases of entities, for instance a platform with a monster on top...
	//
	
	// Monster needs a platform!
	makeMonster: function (x, y) {
		var p = new Platform(x, y);
		var e = new Monster(x, y+10, x, x+p.width);
		
		return [p, e];
	},
	
	// Spring needs a platform!
	makeSpring: function (x, y) {
		var p = new Platform(x-45, y);
		var e = new Spring(x, y+10);
		
		return [p, e];
	},
	
	// Claw needs a tube!
	makeClaw: function (x, y) {
		var c = new Claw(x, y);
		var t = new Tube(x-15, y-5);
		
		return [c, t];
	},
})

var StartGenerator = new Class({
	Extends: MapGenerator,
	
	entities: {'Platform': 1},
	
})

var EasyGenerator = new Class({
	Extends: MapGenerator,
	
	entities: {'Platform': 4,
			   'Monster': 1,
			   'HorizontalLift': 1,
			   'Spring': 1,
			   'BrokenPlatform': 1},
	
})

var MediumGenerator = new Class({
	Extends: MapGenerator,
	
	entities: {'Platform': 2,
			   'Monster': 1,
			   'HorizontalLift': 2,
			   'Spring': 1,
			   'BrokenPlatform': 3},
	
})

var HardGenerator = new Class({
	Extends: MapGenerator,
	distance: 200,
	
	entities: {'Platform': 8,
	   		   'Monster': 2,
	           'HorizontalLift': 2,
	           'Spring': 2,
	           'BrokenPlatform': 6,
	           'Claw': 1,
	           'OneTimePlatform': 2},
	
})

var ReallyHardGenerator = new Class({
	Extends: MapGenerator,
	distance: 200,
	
	entities: {'Monster': 1,
	           'HorizontalLift': 1,
	           'Spring': 1,
	           'BrokenPlatform': 3,
	           'Claw': 1,
	           'OneTimePlatform': 1},
	
})

var OneTimeGenerator = new Class({
	Extends: MapGenerator,
	distance: 200,
	
	entities: {'OneTimePlatform': 1}
	
})

var CloudyGenerator = new Class({
	Extends: MapGenerator,
	
	entities: {'HorizontalLift': 1},
	
})