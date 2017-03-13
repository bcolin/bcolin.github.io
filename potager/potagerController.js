
/*
	http://permaculturefacile.fr/quoi-planter/
	http://www.aujardin.info/fiches/associations.php
*/

controllers.controller('PotagerController',
    ['$scope', '$http', '$interval', 
    function ($scope, $http, $interval) {
  
		$scope.gridW = 8;
		$scope.gridH = 8;
		$scope.grid = [];
		$scope.blocks = [];
		$scope.plants = plants;
		 
		for (var x = 0; x < $scope.gridW; x++) {
			$scope.grid[x] = [];
			for (var y = 0; y < $scope.gridH; y++) {
				var block = { t: 'gazon', x: x, y: y }
				$scope.grid[x][y] = block;
				$scope.blocks.push(block);
			}
		}
		
		$scope.clickBlock = function (block) {
			var wasInfoPaneVisible = block.infoPaneVisible;
			$scope.blocks.forEach(function(b) {
				b.infoPaneVisible = false;
			});
			if (block.plant) {				
				block.infoPaneVisible = !wasInfoPaneVisible;
				return;
			}
			
			if (block.t != 'terre') {
				block.t = 'terre';
			} else {
				block.t = 'gazon';
			}
		};
		
		$scope.compute = function() {						
			
			var rotatorWorker = new Worker('rotatorWorker.js');
			rotatorWorker.addEventListener("message", function (event) {
				
				var message = event.data;
				if (message.command == 'result') {
					$scope.$apply(function() {
						message.data.map.forEach(function(row) {
							row.forEach(function(block) {
								//$scope.grid[block.x][block.y].t = block.t;
								$scope.grid[block.x][block.y].plant = angular.copy($scope.plants.filter(function(p) { return p.id == block.t; })[0]);
							});
						});
						$scope.computing = false;
					});
				} else if (message.command == 'progress') {
					updateProgress(message.data);
				}
			}, false);

			rotatorWorker.postMessage( { command: 'start', blocks: $scope.blocks, plants: $scope.plants } );					
			
			$scope.computing = true;
		};
	}]);
	
//var evaluateProgress = 0;

function updateProgress(data) {
	var progress = (data.evaluatedCount*100/data.evaluateToDoCount);
	document.getElementById('progressbar').style.width = progress+'%';
	document.getElementById('progresstext').innerHTML = data.evaluatedCount + ' sur ' + data.evaluateToDoCount;
}