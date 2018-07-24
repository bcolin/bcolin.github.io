
var me = {};

function messageHandler(event) {
    var messageSent = event.data;
    switch (messageSent.command) {
        case 'start':
		
			me.worker = this;
			me.blocks = messageSent.blocks;
			me.plants = messageSent.plants;
			me.activeBlocks = me.blocks.filter(function(b) { return b.t == 'terre'; });			
			me.selectedPlants = me.plants.filter(function(p) { return p.selected; });

			var allowedValues = [];
			me.selectedPlants.forEach(function(p) {
				allowedValues.push(p.id);
			});			
			
			var index = 0;		
			var computeResults = [];			
			me.activeBlocks.forEach(function(block) {
				block.rotator = new Rotator(index, allowedValues, me.activeBlocks, me.selectedPlants, computeResults);
				index++;
			});
			
			var previousRotator = null;
			me.activeBlocks.forEach(function(block) {
				block.rotator.child = previousRotator;
				previousRotator = block.rotator;
			});
			
			me.evaluateToDoCount = Math.pow(me.selectedPlants.length, me.activeBlocks.length);
			me.evaluatedCount = 0;
				
			progress = 0;
            rotator = me.activeBlocks[me.activeBlocks.length-1].rotator;
			rotator.makeIteration();
			
			var computeResults = rotator.computeResults;					
			
			var maxScore = -999999;
			var bestResult = null;
			computeResults.forEach(function(cr) {
				if (cr.score > maxScore) {
					maxScore = cr.score;
					bestResult = cr;
				}
			});			
			this.postMessage({ command: 'result', data: bestResult });	
            break;			
        default: break;
    }
}

this.addEventListener('message', messageHandler, false);
var progress = 0;

function Rotator(index, allowedValues, blocks, plants, computeResults) {
	this.index = index;
	this.allowedValues = allowedValues;
	this.currentValue = allowedValues[0]; 
	this.blocks = blocks;
	this.plants = plants;
	this.computeResults = computeResults;
	this.worker = null;	
	var scope = this;
	this.makeIteration = function() {				
		scope.allowedValues.forEach(function(value, index) {						
			scope.currentValue = value;			
			if (scope.child) {
				scope.child.makeIteration();
			} else {				
				var result = evaluate(scope.blocks, scope.plants);
				if (result && result.score >= currentComputedBestScore) {
					scope.computeResults.push(result);						
				}
			}
		});	
	};	
}

var evcount = 0;
var currentComputedBestScore = -99999999;
var globalprogress = 0;
function evaluate(blocks, plants) {
	evcount++;	
	var quantityScore = 1000;	
	var grid = [];
	blocks.forEach(function(b) {			
		if (!grid[b.x]) grid[b.x] = [];
		grid[b.x][b.y] = {x: b.x, y: b.y, t: b.rotator.currentValue };
	});		
	var globalQuantity = Math.floor(blocks.length / plants.length);
	plants.forEach(function(p) {
		var plantQuantity = 0;
		blocks.forEach(function(b) {			
			if (b.rotator.currentValue && b.rotator.currentValue == p.id) plantQuantity++;					
		});					
		quantityScore += 500 - (Math.abs(globalQuantity - plantQuantity)*200);		
		if (plantQuantity <= globalQuantity-1.5) quantityScore -= 20000;
		if (plantQuantity >= globalQuantity+1.5) quantityScore -= 20000;
	});	
	var friendnessScore = 1000;
	blocks.forEach(function(b) {			
		if (b.rotator.currentValue) {
			var plant = plants.filter(function(p) { return p.id == b.rotator.currentValue })[0];
			var friend = getGrid(b.x, b.y-1, grid);
			var friendScore = (friend  == plant.id ? .75 : plant.friends.filter(function(f) { return f == friend; }).length) * 50;
			friendnessScore += friendScore;
			friend = getGrid(b.x, b.y+1, grid);
			friendScore = (friend  == plant.id ? .75 : plant.friends.filter(function(f) { return f == friend; }).length) * 50;
			friendnessScore += friendScore;
			friend = getGrid(b.x-1, b.y, grid);
			friendScore = (friend  == plant.id ? .75 : plant.friends.filter(function(f) { return f == friend; }).length) * 50;
			friendnessScore += friendScore;
			friend = getGrid(b.x+1, b.y, grid);
			friendScore = (friend  == plant.id ? .75 : plant.friends.filter(function(f) { return f == friend; }).length) * 50;
			friendnessScore += friendScore;
		}
	});	
	var eneminessScore = 0;
	blocks.forEach(function(b) {			
		if (b.rotator.currentValue) {
			var plant = plants.filter(function(p) { return p.id == b.rotator.currentValue })[0];
			var enemy = getGrid(b.x, b.y-1, grid);
			var enemyScore = plant.enemies.filter(function(f) { return f == enemy; }).length * 100;
			eneminessScore += enemyScore;
			enemy = getGrid(b.x, b.y+1, grid);
			enemyScore = plant.enemies.filter(function(f) { return f == enemy; }).length * 100;
			eneminessScore += enemyScore;
			enemy = getGrid(b.x-1, b.y, grid);
			enemyScore = plant.enemies.filter(function(f) { return f == enemy; }).length * 100;
			eneminessScore += enemyScore;
			enemy = getGrid(b.x+1, b.y, grid);
			enemyScore = plant.enemies.filter(function(f) { return f == enemy; }).length * 100;
			eneminessScore += enemyScore;
			// diags
			enemy = getGrid(b.x-1, b.y-1, grid);
			enemyScore = plant.enemies.filter(function(f) { return f == enemy; }).length * 100;
			eneminessScore += enemyScore;
			enemy = getGrid(b.x-1, b.y+1, grid);
			enemyScore = plant.enemies.filter(function(f) { return f == enemy; }).length * 100;
			eneminessScore += enemyScore;
			enemy = getGrid(b.x+1, b.y-1, grid);
			enemyScore = plant.enemies.filter(function(f) { return f == enemy; }).length * 100;
			eneminessScore += enemyScore;
			enemy = getGrid(b.x+1, b.y+1, grid);
			enemyScore = plant.enemies.filter(function(f) { return f == enemy; }).length * 100;
			eneminessScore += enemyScore;
		}
	});		
	me.evaluatedCount++;
	if (me.evaluatedCount % 300 == 0) {
		me.worker.postMessage({ command: 'progress', data: { evaluatedCount: me.evaluatedCount, evaluateToDoCount: me.evaluateToDoCount } });
	}		
	var score = quantityScore + friendnessScore - eneminessScore;	
	if (score > currentComputedBestScore) {
		currentComputedBestScore = score;		
	}
	return { score: score, map: grid, friendnessScore: friendnessScore, eneminessScore: eneminessScore, quantityScore: quantityScore };
}
function getGrid(x, y, grid) {
	if (!grid[x]) return null;
	if (!grid[x][y]) return null;
	return grid[x][y].t;
}