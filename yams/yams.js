
var Yams = {
	
		
};

var Sheet = null;
function zero ( v ) { if ( typeof v == "undefined" || v == null || v == "" ) return 0; else return parseInt( v ); }
function isempty ( v ) { return ( typeof v == "undefined" || v == null || ( v == "" && v != 0 ) ); }

function getcellv ( col, rowModelId ) { return col.data.filter( function ( c ) { return c.rowModelId == rowModelId; } )[ 0 ].v; }
function getcell ( col, rowModelId ) { return col.data.filter( function ( c ) { return c.rowModelId == rowModelId; } )[ 0 ]; }


var RowModels = {
	
	//"1": { isNullable: true, pickValue: [ 0, 1, 2, 3, 4, 5 ], v: null },
	"1": { isNullable: true, displayName: "1", pickValue: [ 
		{ v: 0, helper: [] }, { v: 1, helper: [ 1 ] }, { v: 2, helper: [ 1, 1 ] }, { v: 3, helper: [ 1, 1, 1 ] },
		{ v: 4, helper: [ 1, 1, 1, 1 ] }, { v: 5, helper: [ 1, 1, 1, 1, 1 ] } 
	], v: null },
	
	"2": { isNullable: true, displayName: "2", pickValue: [ 
		{ v: 0, helper: [] }, { v: 2, helper: [ 2 ] }, { v: 4, helper: [ 2, 2 ] }, { v: 6, helper: [ 2, 2, 2 ] },
		{ v: 8, helper: [ 2, 2, 2, 2 ] }, { v: 10, helper: [ 2, 2, 2, 2, 2 ] } 
	], v: null },
	"3": { isNullable: true, displayName: "3", pickValue: [ 
		{ v: 0, helper: [] }, { v: 3, helper: [ 3 ] }, { v: 6, helper: [ 3, 3 ] }, { v: 9, helper: [ 3, 3, 3 ] },
		{ v: 12, helper: [ 3, 3, 3, 3 ] }, { v: 15, helper: [ 3, 3, 3, 3, 3 ] } 
	], v: null },
	"4": { isNullable: true, displayName: "4", pickValue: [ 
		{ v: 0, helper: [] }, { v: 4, helper: [ 4 ] }, { v: 8, helper: [ 4, 4 ] }, { v: 12, helper: [ 4, 4, 4 ] },
		{ v: 16, helper: [ 4, 4, 4, 4 ] }, { v: 20, helper: [ 4, 4, 4, 4, 4 ] } 
	], v: null },
	"5": { isNullable: true, displayName: "5", pickValue: [ 
		{ v: 0, helper: [] }, { v: 5, helper: [ 5 ] }, { v: 10, helper: [ 5, 5 ] }, { v: 15, helper: [ 5, 5, 5 ] },
		{ v: 20, helper: [ 5, 5, 5, 5 ] }, { v: 25, helper: [ 5, 5, 5, 5, 5 ] } 
	], v: null },
	"6": { isNullable: true, displayName: "6", pickValue: [ 
		{ v: 0, helper: [] }, { v: 6, helper: [ 6 ] }, { v: 12, helper: [ 6, 6 ] }, { v: 18, helper: [ 6, 6, 6 ] },
		{ v: 24, helper: [ 6, 6, 6, 6 ] }, { v: 30, helper: [ 6, 6, 6, 6, 6 ] } 
	], isBottomBorder: true, v: null },
	
	"numberbonus": { notFillable: true, displayName: '&ge;', computed: true, isBonusDisplay:true,
		computeFunc: function ( col ) {
			
			if ( getcellv( col, "1" ) + getcellv( col, "2" ) + getcellv( col, "3" ) + getcellv( col, "4" ) + getcellv( col, "5" ) + getcellv( col, "6" ) >= 63 ) {
				this.v = 35;
			} else {
				this.v = null;
			}
			//return this.v;
				
		}, v: null
	},
	"numbertotal": { notFillable: true, displayName: 'Total', isBottomBorder: true, computed: true, 
		computeFunc: function ( col ) {
			
			var bonus = zero( getcellv( col, "numberbonus" ) ); //.computeFunc( col ) );
			var total = zero( getcellv( col, "1" ) ) + zero( getcellv( col, "2" ) ) + zero( getcellv( col, "3" ) ) + zero( getcellv( col, "4" ) ) + zero( getcellv( col, "5" ) ) + zero( getcellv( col, "6" ) ) + bonus;
			
			this.isTempDisplay = ( isempty( getcellv( col, "1" ) ) || isempty( getcellv( col, "2" ) ) || isempty( getcellv( col, "3" ) ) || isempty( getcellv( col, "4" ) ) || isempty( getcellv( col, "5" ) ) || isempty( getcellv( col, "6" ) ) );
			
			if ( total != 0 ) this.v = total;
			
		}, v: null
	},
	
	"spacer1": { notFillable: true, displayName: ' ', v: null, isSpacer: true },
	
	"brelan": { isNullable: true, displayName: 'Brelan', pickValue: [ 
		{ v: 3, helper: [ 1, 1, 1 ] }, { v: 6, helper: [ 2, 2, 2 ] }, { v: 9, helper: [ 3, 3, 3 ] },
		{ v: 12, helper: [ 4, 4, 4 ] }, { v: 15, helper: [ 5, 5, 5 ] }, { v: 18, helper: [ 6, 6, 6 ] } 
	], v: null },
	"ps": { isNullable: true, displayName: 'Petite s.', pickValue: [ 
		{ v: 30, helper: [ 1, 2, 3, 4, 5 ] }
	], v: null },
	"gs": { isNullable: true, displayName: 'Grande s.', pickValue: [ 
		{ v: 30, helper: [ 2, 3, 4, 5, 6 ] }
	], v: null },
	"full": { isNullable: true, displayName: 'Full', isFullPick: true, v: null },
	"carre": { isNullable: true, displayName: 'Carré', pickValue: [ 
		{ v: 40 + 4*1, helper: [ 1, 1, 1, 1 ] }, { v: 40 + 4*2, helper: [ 2, 2, 2, 2 ] },
		{ v: 40 + 4*3, helper: [ 3, 3, 3, 3 ] }, { v: 40 + 4*4, helper: [ 4, 4, 4, 4 ] },
		{ v: 40 + 4*5, helper: [ 5, 5, 5, 5 ] }, { v: 40 + 4*6, helper: [ 6, 6, 6, 6 ] },
	], v: null },
	"yams": { isNullable: true, displayName: "Yam's", pickValue: [ 
		{ v: 50 + 5*1, helper: [ 1, 1, 1, 1, 1 ] }, { v: 50 + 5*2, helper: [ 2, 2, 2, 2, 2 ] },
		{ v: 50 + 5*3, helper: [ 3, 3, 3, 3, 3 ] }, { v: 50 + 5*4, helper: [ 4, 4, 4, 4, 4 ] },
		{ v: 50 + 5*5, helper: [ 5, 5, 5, 5, 5 ] }, { v: 50 + 5*6, helper: [ 6, 6, 6, 6, 6 ] },
	], v: null },
	"8b": { isNullable: true, displayName: '8 bord', pickValue: [ { v: 30, helper: [ "Réussi" ] } ], isBottomBorder: true, },
	
	"combototal": { notFillable: true, displayName: 'Total', isBottomBorder: true, computed: true, 
		computeFunc: function ( col ) {
						
			var total = zero( getcellv( col, "brelan" ) ) + zero( getcellv( col, "ps" ) ) + zero( getcellv( col, "gs" ) ) + zero( getcellv( col, "full" ) ) + zero( getcellv( col, "carre" ) ) + zero( getcellv( col, "yams" ) ) + zero( getcellv( col, "8b" ) );
			
			this.isTempDisplay = ( isempty( getcellv( col, "brelan" ) ) || isempty( getcellv( col, "ps" ) ) || isempty( getcellv( col, "gs" ) ) || isempty( getcellv( col, "full" ) ) || isempty( getcellv( col, "carre" ) ) || isempty( getcellv( col, "yams" ) ) || isempty( getcellv( col, "8b" ) ) );
			
			if ( total != 0 ) this.v = total;
			
		}, v: null
	},
	
	"spacer2": { notFillable: true, displayName: ' ', v: null, isSpacer: true },
	
	"max": { isNullable: false, displayName: 'Max', isFreePick: true, v: null },
	"min": { isNullable: false, displayName: 'Min', isFreePick: true, v: null },
	"delta": { notFillable: true, displayName: '&Delta;', computed: true, isBottomBorder: true,
		computeFunc: function ( col ) {
			
			this.v = null;
			var max = getcellv( col, "max" );
			var min = getcellv( col, "min" );			
			
			if ( !isempty( max ) && !isempty( min ) ) {				
				this.v = zero( max ) - zero( min );				
			}
			
		}, v: null
	},
	"minmaxtotal": { notFillable: true, displayName: 'Total', computed: true, isBottomBorder: true,
		computeFunc: function ( col, playerId ) {
			
			this.v = null;
			var max = getcellv( col, "max" );
			var min = getcellv( col, "min" );	
			var delta = getcellv( col, "delta" );	
			
			var maxGain = 0, minGain =0, deltaGain = 0;
			
			if ( !isempty( max ) ) {		
				max = zero( max );			
				var isBestMax = true;
				var existOtherEmptyMax = false;
				var otherMaxs = [];
				Sheet.players.filter(function(p) { return p.id != playerId; } ).forEach( function ( p ) {					
					var otherCol = p.cols.filter( function(c) { return c.id == col.id; })[ 0 ];
					var otherMax = getcellv( otherCol, "max" );
					if ( isempty( otherMax ) ) existOtherEmptyMax = true; else otherMaxs.push( zero( otherMax ) );
				});				
				if ( !existOtherEmptyMax ) {					
					var hasLost = false;
					var equalityCount = 0;
					otherMaxs.forEach( function ( om ) {						
						if ( om > max ) hasLost = true;
						if ( om == max ) equalityCount++;						
					});					
					if ( !hasLost ) {						
						maxGain = 70 / ( 1 + equalityCount );						
					}	
				}
			}
			
			if ( !isempty( min ) ) {		
				min = zero( min );			
				var isBestMin = true;
				var existOtherEmptyMin = false;
				var otherMins = [];
				Sheet.players.filter(function(p) { return p.id != playerId; } ).forEach( function ( p ) {					
					var otherCol = p.cols.filter( function(c) { return c.id == col.id; })[ 0 ];
					var otherMin = getcellv( otherCol, "min" );
					if ( isempty( otherMin ) ) existOtherEmptyMin = true; else otherMins.push( zero( otherMin ) );
				});				
				if ( !existOtherEmptyMin ) {					
					var hasLost = false;
					var equalityCount = 0;
					otherMins.forEach( function ( om ) {						
						if ( om < min ) hasLost = true;
						if ( om == min ) equalityCount++;						
					});					
					if ( !hasLost ) {						
						minGain = 70 / ( 1 + equalityCount );						
					}	
				}
			}
			
			if ( !isempty( delta ) ) {		
				delta = zero( delta );			
				var isBestDelta = true;
				var existOtherEmptyDelta = false;
				var otherDeltas = [];
				Sheet.players.filter(function(p) { return p.id != playerId; } ).forEach( function ( p ) {					
					var otherCol = p.cols.filter( function(c) { return c.id == col.id; })[ 0 ];
					var otherDelta = getcellv( otherCol, "delta" );
					if ( isempty( otherDelta ) ) existOtherEmptyDelta = true; else otherDeltas.push( zero( otherDelta ) );
				});				
				if ( !existOtherEmptyDelta ) {					
					var hasLost = false;
					var equalityCount = 0;
					otherDeltas.forEach( function ( om ) {						
						if ( om > delta ) hasLost = true;
						if ( om == delta ) equalityCount++;						
					});					
					if ( !hasLost ) {						
						deltaGain = parseInt( 30 / ( 1 + equalityCount ) );						
					}	
				}
			}
			
				
			var tempTotal = maxGain + minGain + deltaGain;
			
			if ( !existOtherEmptyDelta ) this.v = tempTotal;
				
			
		}, v: null
	},
	
	"spacer3": { notFillable: true, displayName: ' ', v: null, isSpacer: true, isBottomBorder: true },
	
	"coltotal": { notFillable: true, displayName: 'TOTAL', computed: true, isBottomBorder: true,
		computeFunc: function ( col ) {
			
			
			this.isTempDisplay = ( isempty( getcellv( col, 'numbertotal' ) ) || isempty( getcellv( col, 'combototal' ) ) || isempty( getcellv( col, 'minmaxtotal' ) ) );
			
			this.v = ( zero( getcellv( col, 'numbertotal' ) ) + zero( getcellv( col, 'combototal' ) ) + zero( getcellv( col, 'minmaxtotal' ) ) );
			
		}, v: null
	},
	
	"finaltotal": { notFillable: true, displayName: 'FINAL', computed: true, isBottomBorder: true, isOnly3Col: true,
		computeFunc: function ( col, playerId ) {
			
			var col1 = Sheet.players[ playerId ].cols[ 0 ];
			var col2 = Sheet.players[ playerId ].cols[ 1 ];
			var col3 = Sheet.players[ playerId ].cols[ 2 ];
			
			var celltot1 = getcell( col1, 'coltotal' );
			var isTot1Temp = isempty( celltot1.v ) || celltot1.isTempDisplay;
			var celltot2 = getcell( col2, 'coltotal' );
			var isTot2Temp = isempty( celltot2.v ) || celltot2.isTempDisplay;
			var celltot3 = getcell( col3, 'coltotal' );
			var isTot3Temp = isempty( celltot3.v ) || celltot3.isTempDisplay;
			
			this.isTempDisplay = isTot1Temp || isTot2Temp || isTot3Temp;
			
			this.v = ( zero( getcellv( col1, 'coltotal' ) ) + zero( getcellv( col2, 'coltotal' ) ) + zero( getcellv( col3, 'coltotal' ) ) );
			
		}, v: null
	},
	
	
};

for ( prop in RowModels ) {
	if ( RowModels.hasOwnProperty( prop ) ) {
		
		var row = RowModels[ prop ];
		row.isHoverable = !row.notFillable;
		
	}	
}



var UI = {
	
	_computeSheet: function () {
		
		for ( var i = 0; i < 2; i++ ) {
		
			Sheet.players.forEach( function ( p ) {
				
				p.cols.forEach( function ( col ) {
					
					col.data.forEach( function( cell ) {
						
						if ( cell.computed ) {
						
							cell.computeFunc( col, p.id );
							
						}
						
					});
					
				});
				
			});
		
		}
		
	},
	
	
	onDocClick: function ( ) {
		
		UI.isScorePicksVisible = false;
		UI._unlightCells();
		UI._computeSheet();
		
	},
	
	onScorePick: function ( evt, vm ) {
		
		if ( !UI.selectedCell.isFullPick ) {
			
			UI.selectedCell.v = vm.scorepick.v;
			
			UI._computeSheet();
			UI.isScorePicksVisible = false;
			evt.stopPropagation(); evt.preventDefault();
			
			
			if ( UI.selectedCell.rowModelId == "yams" || ( parseInt( UI.selectedCell.rowModelId ) > 0 && parseInt( UI.selectedCell.rowModelId ) < 7 && vm.scorepick.helper.length == 5 ) ) {
			
				playSound( 'applause' );
				
			}
			
		} else {
			
			if ( !UI.isFullSecondPick ) {
				
				UI.fullFirstPick = vm.scorepick.v;
				UI.scorePicks = [ 
					{ v: 2, helper: [ 1, 1 ], dice: 1 }, { v: 4, helper: [ 2, 2 ], dice: 2 }, 
					{ v: 6, helper: [ 3, 3 ], dice: 3 },	{ v: 8, helper: [ 4, 4 ], dice: 4 }, 
					{ v: 10, helper: [ 5, 5 ], dice: 5 }, { v: 12, helper: [ 6, 6 ], dice: 6 }
				];
				var impossiblePick = UI.scorePicks.filter( function ( sp ) { return sp.dice == vm.scorepick.dice; } )[ 0 ];
				UI.scorePicks.splice( UI.scorePicks.indexOf( impossiblePick ), 1 );
				UI.isFullSecondPick = true;				
				evt.stopPropagation(); evt.preventDefault();
				
			} else {
				
				UI.isFullSecondPick = false;
				UI.selectedCell.v = 25 + UI.fullFirstPick + vm.scorepick.v;
				UI._computeSheet();
				UI.isScorePicksVisible = false;
				evt.stopPropagation(); evt.preventDefault();
				
			}
					
		}
		
		UI.saveState();		
		
	},
	
	onScorePickMiss: function ( evt ) {
		
		UI.selectedCell.v = 0;
		UI._computeSheet();
		UI.isScorePicksVisible = false;
		evt.stopPropagation(); evt.preventDefault();
		
		if ( UI.selectedCell.v == 0 && parseInt( UI.selectedCell.rowModelId ) > 0 && parseInt( UI.selectedCell.rowModelId ) < 7 ) {
			
			playSound( 'haha' );
		
		}
		
		UI.saveState();
		
	},
	
	onScorePickClear: function ( evt ) {
		
		UI.selectedCell.v = null;
		UI._computeSheet();
		UI.isScorePicksVisible = false;
		evt.stopPropagation(); evt.preventDefault();
		
		UI.saveState();
		
	},
	
	onCellClick: function ( evt, vm ) {
		
		var cell = vm.cell;
		
		if ( cell.isFreePick ) {
			
			UI.scorePicks = [];
			UI.isFreeValueVisible = true;
			setTimeout( function () { document.getElementById( 'freeValue' ).focus() }, 100 );
			
		} else if ( cell.isFullPick ) {
			
			UI.isFreeValueVisible = false
			UI.scorePicks = [ 
				{ v: 3, helper: [ 1, 1, 1 ], dice: 1 }, { v: 6, helper: [ 2, 2, 2 ], dice: 2 }, 
				{ v: 9, helper: [ 3, 3, 3 ], dice: 3 },	{ v: 12, helper: [ 4, 4, 4 ], dice: 4 }, 
				{ v: 15, helper: [ 5, 5, 5 ], dice: 5 }, { v: 18, helper: [ 6, 6, 6 ], dice: 6 }
			];
			UI.isFullSecondPick = false;
			
		} else {
			
			UI.isFreeValueVisible = false;
			UI.scorePicks = cell.pickValue.slice( 0 );
			
		}
		
		
		UI.scorePicks.push( "Vider" );
		UI.isScorePicksVisible = true;
		
		setTimeout( function () {
			
				var rect = evt.target.getBoundingClientRect();
				var pane = document.getElementById( 'scorepickpane' );
				var panerect = pane.getBoundingClientRect();
				pane.style.left = ( rect.right + 4 ) + 'px'; //(evt.clientX + 0)+'px';
				pane.style.top = ( rect.top - panerect.height * ( /*window.innerHeight - */ evt.clientY * .0015 ) ) + 'px'; //(evt.clientY + 0) +'px';			
			
		}, 5);
		
		UI._higlightCell( cell );
		evt.stopPropagation(); evt.preventDefault();
	
	
	},
	
	onFreeValueKeyUp: function ( evt ) {
		
		if ( evt.keyCode == 13 ) {
			
			UI._computeSheet();
			UI.isScorePicksVisible = false;
			
		}
		
	},
	
	/*onCellInputClick: function ( evt ) {
		
		evt.stopPropagation(); evt.preventDefault();
		
	},*/
	
	_higlightCell: function ( cell ) {				
		this._unlightCells();		
		cell.isSelected = true;		
		UI.selectedCell = cell;
	},
	_unlightCells: function () {		
		UI.selectedCell = null;
		Sheet.players.forEach( function ( p ) {
			p.cols.forEach( function ( col ) {
				col.data.forEach( function ( cell ) {
					cell.isSelected = false;					
				});				
			});			
		});		
	},
	
	getDesImg: function ( des ) {
		
		return 'img/d' + des + '.png';
		
	},
	
	
	newGamePlayerCount: 3,
	newGameColumnCount: 1,
	
	onNewGameClick: function () {
		
		UI.dialogHTML = "Nombre de joueurs ?";
		UI.isDialogStartGame = true;
		UI.isDialogVisible = true;
		UI.newGamePlayerCount = 2;
		UI.newGameColumnCount = 1;
		UI.dialogButtons = [ 
			{ 
				html: "Annuler", 
				onClick: function () {
					UI.isDialogVisible = false;			
				}				
			},
			{ 
				html: "OK",
				isHL: true,
				onClick: UI.onBuildSheet
			}
		];
		
	},
	
	onNewGameDelPlayer: function() { UI.newGamePlayerCount--; },
	onNewGameAddPlayer: function() { UI.newGamePlayerCount++; },
	
	onBuildSheet: function () {
		
		Sheet = {
			
			playersCount: UI.newGamePlayerCount,
			columnsPerPlayer: UI.newGameColumnCount,
			
			players: [ ]
			
		};
		
		for ( var i = 0; i < UI.newGamePlayerCount; i++ ) {
			
			var player = {
				id: i,
				name: 'player ' + i,
				cols: []				
			};
			
			for ( var j = 0; j < UI.newGameColumnCount; j++ ) {
				
				var col = {
					id: 'col-' + j,
					type: ( j == 0 ? 'normal' : j == 1 ? 'up' : j == 2 ? 'down' : '' ),
					data: []					
				};
				
				for ( var rowId in RowModels ) {
					
					if ( RowModels.hasOwnProperty( rowId ) ) {
						
						var cellmodel = RowModels[ rowId ];
						
						var cell = { rowModelId: rowId };
						
						for ( var cellprop in cellmodel ) {
							
							if ( cellmodel.hasOwnProperty( cellprop ) ) {
								
								cell[ cellprop ] = cellmodel[ cellprop ];
								
							}
							
						}
						
						if ( !cell.isOnly3Col || ( cell.isOnly3Col && Sheet.columnsPerPlayer == 3 && j == 0 ) ) {
						
							col.data.push( cell );
						
						}
						
					}
					
				}
				
				player.cols.push( col );
				
			}
			
			Sheet.players.push( player );
			
		}
		
		UI.isDialogVisible = false;
		
		UI.displayRows = [];
		
		for ( var rowId in RowModels ) {
					
			if ( RowModels.hasOwnProperty( rowId ) ) {
				
				//var displayName = RowModels[ rowId ].displayName || rowId;
				
				var rowModel = RowModels[ rowId ];
				
				if ( !rowModel.isOnly3Col || ( rowModel.isOnly3Col && Sheet.columnsPerPlayer == 3 ) ) {
				
					UI.displayRows.push( rowModel );
				
				}
				
			}
					
		}
		
		UI.sheet = Sheet;
		
		UI.columnStyle = "width:" + ( Sheet.columnsPerPlayer == 3 ? 45 : 120 ) + "px;";
		
	},
	
	
	onFullScreenClick: function () {
		
		var elem = document.getElementById('view');
		if (elem.requestFullscreen) {
		  elem.requestFullscreen();
		} else if (elem.msRequestFullscreen) {
		  elem.msRequestFullscreen();
		} else if (elem.mozRequestFullScreen) {
		  elem.mozRequestFullScreen();
		} else if (elem.webkitRequestFullscreen) {
		  elem.webkitRequestFullscreen();
		}
		
	},
	
	
	// persist
	
	saveState: function () {
	
		var saving = UI._getSheetSimpleData();
		window.localStorage.setItem( 'cursheet', JSON.stringify( saving ) );		
		
	},
	
	_getSheetSimpleData: function() {
		
		var data = JSON.parse( JSON.stringify( Sheet ) );
		data.players.forEach( function ( p ) {				
			p.cols.forEach( function ( col ) {
				for ( var i = 0; i < col.data.length; i++ ) {
					col.data[ i ] = col.data[ i ].v;					
				}				
			});			
		});
		return data;
		
	},
	
	loadState: function () {
		
		var saved = window.localStorage.getItem( 'cursheet' );
		
		if ( saved ) {
			
			saved = JSON.parse( saved );
			UI.newGamePlayerCount = saved.playersCount;
			UI.newGameColumnCount = saved.columnsPerPlayer;
			UI.onBuildSheet();
			
			for ( var playerIndex = 0; playerIndex < UI.newGamePlayerCount; playerIndex++ ) {
			
				var sheetPlayer = Sheet.players[ playerIndex ];
				var savedPlayer = saved.players[ playerIndex ];
				
				sheetPlayer.name = savedPlayer.name;
			
				for ( var colIndex = 0; colIndex < UI.newGameColumnCount; colIndex++ ) {
					
					var sheetCol = sheetPlayer.cols[ colIndex ];
					var savedCol = savedPlayer.cols[ colIndex ];
					
					for ( var cellIndex = 0; cellIndex < sheetCol.data.length; cellIndex++ ) {
				
						sheetCol.data[ cellIndex ].v = savedCol.data[ cellIndex ];
				
					}
				
				}				
				
			}
			
			UI._computeSheet();
			
		} else {
			
			UI.onBuildSheet();
			
		}
		
	},
	
	onStatAddClick: function () {
		
		if ( confirm( 'Ajouter cette partie aux statistiques ?' ) ) {
			
			var stats = window.localStorage.getItem( 'stats' );
			
			if ( !stats ) {
				stats = {
					playerStats: {},
					/*bestOneColScore: 0,
					bestOneColScorePlayerName: '',
					bestThreeColScore: 0,
					bestThreeColScorePlayerName: '',*/				
				}; 
			} else stats = JSON.parse( stats );
			
			
			Sheet.players.forEach( function ( p ) {		
			
				if ( !stats.playerStats[ p.name ] ) stats.playerStats[ p.name ] = {
					gamePlayedCount: 0,
					gameWinCount: 0,
					numberBonusCount: 0,
					smallSuiteCount: 0,
					bigSuiteCount: 0,
					fullCount: 0,
					carreCount: 0,
					yamsCount: 0,
					bordelaisCount: 0,
					/*bestMaxCount: 0,
					bestMinCount 0,
					bestDeltaCount 0,*/				
					bestScoreOneCol: 0,
					bestScoreThreeCol: 0,					
				};
				
				var playerStat = stats.playerStats[ p.name ];
				
				playerStat.gamePlayedCount++;
				
				// qui est vainqueur?
				var isMeWon = true;
				var myScore = Sheet.columnsPerPlayer > 1 ? zero( getcellv( p.cols[ 0 ], "finaltotal" ) ) : zero( getcellv( p.cols[ 0 ], "coltotal" ) );
				Sheet.players.forEach( function ( p2 ) {
					p2.cols.forEach( function ( col2 ) {
						
						var otherScore = Sheet.columnsPerPlayer > 1 ? zero( getcellv( col2, "finaltotal" ) ) : zero( getcellv( col2, "coltotal" ) );
						
						if ( p2.id != p.id && otherScore >= myScore ) isMeWon = false;					
					});
				});
				
				if ( isMeWon ) playerStat.gameWinCount++;
			
				p.cols.forEach( function ( col ) {
					
					if ( zero( getcellv( col, "numberbonus" ) ) > 0 ) playerStat.numberBonusCount++;
					
					if ( zero( getcellv( col, "ps" ) ) > 0 ) playerStat.smallSuiteCount++;
					if ( zero( getcellv( col, "gs" ) ) > 0 ) playerStat.bigSuiteCount++;
					if ( zero( getcellv( col, "full" ) ) > 0 ) playerStat.fullCount++;
					if ( zero( getcellv( col, "carre" ) ) > 0 ) playerStat.carreCount++;
					if ( zero( getcellv( col, "yams" ) ) > 0 ) playerStat.yamsCount++;
					if ( zero( getcellv( col, "8b" ) ) > 0 ) playerStat.bordelaisCount++;
					
				});
			
				if ( myScore > playerStat.bestScore ) playerStat.bestScore = myScore;
				
				if ( Sheet.columnsPerPlayer == 1 && myScore > playerStat.bestScoreOneCol ) {
					
					playerStat.bestScoreOneCol = myScore;
					
				}
				if ( Sheet.columnsPerPlayer > 1 && myScore > playerStat.bestScoreThreeCol ) {
					
					playerStat.bestScoreThreeCol = myScore;
					
				}
				
			});
			
			
			window.localStorage.setItem( 'stats', JSON.stringify( stats ) );
			
			/*var simplesheet = UI._getSheetSimpleData();
			
			for ( var test = 0; test < 1000; test++ ) {
				
				stats.push( simplesheet );
			
				try {
					window.localStorage.setItem( 'stats', JSON.stringify(stats) );
				} catch ( ex ) {
					
					alert('test ' + test + ' storage error ' + ex );
					
				}
				
			}*/
			
			alert( "C'est fait" );
			
		}
		
	}
	
}


document.addEventListener( 'DOMContentLoaded', function() {

	rivets.bind( document.getElementById( 'view' ), { ui: UI } );
		
	//UI.onBuildSheet();	
	UI.loadState();
	
});


function playSound( id ) {
	
	var elm = document.getElementById( id );
	elm.currentTime = 0;
	elm.play();
	
}