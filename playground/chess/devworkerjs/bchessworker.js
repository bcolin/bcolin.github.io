
var bchessworker = {

	turnCount: -1,

	compute: function ( board, turnCount, parameters ) {
		
		//this.board = board;
		this.turnCount = turnCount;
		
		this.maxRecurLevel = ( parameters && parameters.maxRecurLevel ) || 2;
		
		//var score = this.evaluateRecursive( newBoard );
		
		var moves = [];
		
		var progress = 0, progressstep = 1 / 64;
		
		this.minSkipScore = 0; //437;
		
		for ( var x = 0; x < 8; x++ ) { 
			for ( var y = 0; y < 8; y++ ) { 
				var b = board[ x ][ y ];
				if ( b.type != "empty" && !b.white ) {
					
					var piece = { x: x, y: y, type: b.type, white: b.white };
					var movesToEval = this.getPieceMoves( piece, board );
					
					console.log( JSON.stringify( piece ) + " : " + movesToEval.length + " moves" );
					
					for ( var i = 0; i < movesToEval.length; i++ ) {
						
						var moveToEval = movesToEval[ i ];
						
						var newBoard = JSON.parse( JSON.stringify( board ) );
						this.applyMove( newBoard, piece, moveToEval );
						
						var skipscore = this.evaluate( newBoard, false, piece );
						//console.log( " move skipcore : " + skipscore );
						
						//if ( skipscore >= this.minSkipScore ) {
						
							moveToEval.score = this.evaluateRecursive( newBoard, false, 0, piece );
							console.log( " evaluated move : " + JSON.stringify( moveToEval ) );
							
						/*} else {
							
							console.log( " skipped move " + JSON.stringify( piece ) + " to " + JSON.stringify( moveToEval ) + ": skipscore " + skipscore );
							moveToEval.score = this.minSkipScore;
							
						}*/
						
						moveToEval.piece = piece;
						moves.push( moveToEval );
						
						//console.log( "move eval done. x=" + x + ",y="+y+",i="+i+",moves.length=" + moves.length );
						
					}					
				}
				progress += progressstep;
				self.postMessage( { command: "progress", progress: progress } );
			}
		}
		
		//var bestMove = { score: -9999999999 };
		var bestScore = -9999999999;
		var bestMoves = [];
		for ( var i = 0; i < moves.length; i++ ) {
			var m = moves[ i ];
			if ( m.score > bestScore ) {
				bestScore = m.score;
			}			
		}
		for ( var i = 0; i < moves.length; i++ ) {
			var m = moves[ i ];
			if ( m.score == bestScore ) {
				bestMoves.push( m );
			}			
		}
		
		var bestMove = bestMoves[ Math.floor( Math.random() * bestMoves.length ) ];
		
		self.postMessage( { command: "result", bestMove: bestMove } );
		
	},
	
	evaluateRecursive: function ( board, white, recurlevel, movedPiece ) {
		
		if ( recurlevel >= this.maxRecurLevel ) {
			
			return this.evaluate( board, white, movedPiece );
			
		} else {
			
			var moveScores = [];
			
			for ( var x = 0; x < 8; x++ ) { 
				for ( var y = 0; y < 8; y++ ) { 
					var b = board[ x ][ y ];
					if ( b.type != "empty" && b.white != white ) {
						
						var piece = { x: x, y: y, type: b.type, white: b.white };
						var moves = this.getPieceMoves( piece, board );
						for ( var i = 0; i < moves.length; i++ ) {
							
							var move = moves[ i ];						
							var newBoard = JSON.parse( JSON.stringify( board ) );
							this.applyMove( newBoard, piece, move );
							
							/*if ( !white ) {
								
								var skipscore = this.evaluate( newBoard, false, piece );
								if ( skipscore >= this.minSkipScore ) {
									
									var adverseScore = this.evaluateRecursive( newBoard, !white, recurlevel+1, piece );								
									moveScores.push( { move: move, score: adverseScore } );
									
								} else {
									console.log( "recur skip" );
								}
								
							} else {*/
							
								var adverseScore = this.evaluateRecursive( newBoard, !white, recurlevel+1, piece );								
								moveScores.push( { move: move, score: adverseScore } );
								
							/*}*/
							
						}
						
					}
					
				}
			}
			
			if ( moveScores.length == 0 ) {
				
				console.log( "mat ou pat!" );
				//if ( white ) return 9999999999; else return -9999999999;
				return 99999999;
				
			}			
			
			var bestScore = -99999999;
			for ( var i = 0; i < moveScores.length; i++ ) {
				var s = moveScores[ i ];
				if ( s.score > bestScore ) {
					bestScore = s.score;
				}
			}
			
			return 99999999 - bestScore;
			
		}
		
	},
	
	evaluate: function ( board, white, movedPiece ) {
		
		var score = 0;
		var otherKing = null;
		if ( !white ) otherKing = this.getKingPiece( board, !white );
		
        for ( var x = 0; x < 8; x++ ) {
			for ( var y = 0; y < 8; y++ ) {
				var b = board[ x ][ y ];
				b.x = x;
				b.y = y;
				if ( b.type != "empty" ) score += this.getPieceScore( b, white, otherKing );
			}
        }
		
		/*if ( !white && movedPiece && !movedPiece.white ) {
			
			if ( this.turnCount <= 6 && movedPiece.type == "pion" ) {				
				if ( movedPiece.x == 3 || movedPiece.x == 4 ) score += 22;
				if ( movedPiece.x == 2 || movedPiece.x == 5 ) score += 10;
			}
			//if ( this.turnCount <= 9 && movedPiece.type == "cheval" ) score += 12;
			//if ( this.turnCount <= 12 && movedPiece.type == "fou" ) score += 12;

		}*/
		
		if ( this.testCheck( board, !white ) ) {
			
			score += 50;
			
		}
		
        return score;
		
	},
	
	getPieceScore: function( piece, white, otherKing ) {
		
		var score = 0;
		
        if ( piece.white == white ) {
			
			var piecedanger = 1;
			
			if ( piece.type == "pion") { score += 10000; /*if ( this.turnCount <= 4 ) piecedanger = 1.5; */}
			else if (piece.type == "cheval") { score += 25000; piecedanger = 1.5; }
			else if (piece.type == "fou") { score += 25000; piecedanger = 1.5; }
			else if (piece.type == "tour") { score += 30000; piecedanger = 2; }
			else if (piece.type == "dame") { score += 40000; piecedanger = 3; }
			else if (piece.type == "roi") { score += 180000; piecedanger = 0; }
	 	 
			if ( !white ) {
				
				score += 50;
				if  ( piece.y < 2 ) score -= 5;
				
				var avancebonus = 0;
				
				if ( piece.type == "pion" ) {
					if ( this.turnCount <= 8 ) {
						if ( piece.x == 3 || piece.x == 4 ) {
							avancebonus = ( piece.y > 3 ? 12 : ( piece.y == 3 ? 10 : 0 ) );
						}
					} 
					if ( this.turnCount <= 16 ) {
						if ( piece.type == "pion" && ( piece.x == 0 || piece.x == 7 ) && piece.y > 1 ) avancebonus = -20;
					}
				}
				
				score += avancebonus;
				
				//if ( this.turnCount <= 8 && piece.type == "pion" && ( piece.x == 0 || piece.x == 7 ) && piece.y > 1 ) score -= 20;
				
				
				//score += Math.log( 1 + piece.y * piecedanger * .5 );
	 
				//if ( this.turnCount <= 8 ) score += Math.abs( piece.x - 3.5 ) * .05;
			
				var/* nearkingbonus = 0;
				if ( this.turnCount < 8 ) {*/
					nearkingbonus = ( 15 - ( Math.abs( otherKing.x - piece.x ) + Math.abs( otherKing.y - piece.y ) ) ) * .08; // * Math.max( 1, ( this.turnCount - 6 ) * .5 );
				//}
				
				score += nearkingbonus;
				
			}
	 
			/*if ( !white && piece.type != "roi" ) {
				
				score += ( 1 + Math.min( 6, piece.y ) ) * piecedanger * .5;
				if ( this.turnCount <= 8 ) {						
					//if ( piece.x == 0 || piece.x == 7 ) score += 1;*/
				/*	if ( piece.x == 1 || piece.x == 6 ) score += 2;	
					if ( piece.x == 2 || piece.x == 5 ) score += 30;
					if ( piece.x == 3 || piece.x == 4 ) score += 50;	*/				
			/*	}				
				
			}*/
				
		} else {
		//if ( piece.white != white ) {
			
			if (piece.type == "pion") { score -= 10000; /*if (piece.y == 0) score -= 3500;*/ }
			else if (piece.type == "cheval") score -= 25000;
			else if (piece.type == "fou") score -= 25000;
			else if (piece.type == "tour") score -= 30000;
			else if (piece.type == "dame") score -= 40000;
			else if (piece.type == "roi") score -= 180000;
			
			//score += piece.y;
			//if (piece.x > 1 && piece.x < 6) score += 1;
			
        }
		
        return score;
	},	
	
	applyMove: function ( board, piece, move ) {
		
		var x = piece.x;
		var y = piece.y;
		var b = board[ move.x ][ move.y ];
		b.type = piece.type;
		b.white = piece.white;
		b.x = move.x;
		b.y = move.y;
		board[ x ][ y ] = { type: "empty" };
		
	},

	getPieceMoves: function ( piece, board, noCheckTest ) {
		
		/*if ( !noCheckTest ) {
			if ( piece.type != "roi" && this.testCheck( board, piece.white ) ) {
				return [];
			}
		}*/
		
		var moves = [];
        if ( piece.type == "pion" && piece.white && piece.y > 0 )
        { 	
			if ( board[ piece.x ][ piece.y - 1 ].type == "empty" ) {				
				moves.push( {x: piece.x, y: piece.y-1} );
				if ( piece.y == 6 && board[piece.x][piece.y-2].type == "empty" ) moves.push( {x: piece.x, y: piece.y-2} );
			}
			var test = board[piece.x-1][piece.y-1];
			if (piece.x>0 && test && ( test.type != "empty" && !test.white )) moves.push( {x: piece.x-1, y: piece.y-1} );
			var test = board[piece.x+1][piece.y-1];
			if (piece.x<7 && test &&( test.type != "empty" && !test.white )) moves.push( {x: piece.x+1, y: piece.y-1} );
			
        } else if ( piece.type == "pion" && !piece.white && piece.y < 7 ) {
			
			if ( board[piece.x][piece.y+1].type == "empty" ) {				
				moves.push( {x: piece.x, y: piece.y+1} );
				if ( piece.y == 1 && board[piece.x][piece.y+2].type == "empty") moves.push( {x: piece.x, y: piece.y+2 } );
			}
			var test = board[piece.x-1][piece.y+1];
			if ( piece.x>0 && test && ( test.type != "empty" && test.white )) moves.push( {x: piece.x-1, y: piece.y+1} );
			var test = board[piece.x+1][piece.y+1];
			if ( piece.x<7 && test && ( test.type != "empty" && test.white )) moves.push( {x: piece.x+1, y: piece.y+1} );

        } else if (piece.type == "cheval") {
			
			moves.push( {x: piece.x+1, y: piece.y-2} );
			moves.push( {x: piece.x+2, y: piece.y-1} );
			moves.push( {x: piece.x+1, y: piece.y+2} );
			moves.push( {x: piece.x+2, y: piece.y+1} );
			moves.push( {x: piece.x-1, y: piece.y-2} );
			moves.push( {x: piece.x-2, y: piece.y-1} );
			moves.push( {x: piece.x-1, y: piece.y+2} );
			moves.push( {x: piece.x-2, y: piece.y+1} );
				
        } else if ( piece.type == "tour" ) {
				
			moves = moves.concat( this.getMovesForDir( piece, { x: 1, y: 0 }, board ) );
			moves = moves.concat( this.getMovesForDir( piece, { x: -1, y: 0 }, board ) );
			moves = moves.concat( this.getMovesForDir( piece, { x: 0, y: 1 }, board ) );
			moves = moves.concat( this.getMovesForDir( piece, { x: 0, y: -1 }, board ) );
		
        } else if (piece.type == "fou") {
                
			moves = moves.concat( this.getMovesForDir( piece, { x: 1, y: 1 }, board ) );
			moves = moves.concat( this.getMovesForDir( piece, { x: -1, y: 1 }, board ) );
			moves = moves.concat( this.getMovesForDir( piece, { x: -1, y: -1 }, board ) );
			moves = moves.concat( this.getMovesForDir( piece, { x: 1, y: -1 }, board ) );
				
        } else if (piece.type == "dame") {
			
			moves = moves.concat( this.getMovesForDir( piece, { x: 1, y: 0 }, board ) );
			moves = moves.concat( this.getMovesForDir( piece, { x: -1, y: 0 }, board ) );
			moves = moves.concat( this.getMovesForDir( piece, { x: 0, y: 1 }, board ) );
			moves = moves.concat( this.getMovesForDir( piece, { x: 0, y: -1 }, board ) );
			
			moves = moves.concat( this.getMovesForDir( piece, { x: 1, y: 1 }, board ) );
			moves = moves.concat( this.getMovesForDir( piece, { x: -1, y: 1 }, board ) );
			moves = moves.concat( this.getMovesForDir( piece, { x: -1, y: -1 }, board ) );
			moves = moves.concat( this.getMovesForDir( piece, { x: 1, y: -1 }, board ) );
				              
        } else if (piece.type == "roi") {
			
			moves.push( {x: piece.x+1, y: piece.y} );
			moves.push( {x: piece.x-1, y: piece.y} );
			moves.push( {x: piece.x, y: piece.y+1} );
			moves.push( {x: piece.x, y: piece.y-1} );
			moves.push( {x: piece.x+1, y: piece.y+1} );
			moves.push( {x: piece.x-1, y: piece.y+1} );
			moves.push( {x: piece.x+1, y: piece.y-1} );
			moves.push( {x: piece.x-1, y: piece.y-1} );
			
			if ( piece.white && piece.x == 4 && piece.y == 7 ) {
				if ( board[ piece.x + 1 ][ piece.y ].type == "empty" && board[ piece.x + 2 ][ piece.y ].type == "empty" ) {
					var tour = board[ piece.x + 3 ][ piece.y ];
					if ( tour.type == "tour" && tour.white ) {
						moves.push( { x: piece.x + 2, y: piece.y } );
					}
				} else if ( board[ piece.x - 1 ][ piece.y ].type == "empty" && board[ piece.x - 2 ][ piece.y ].type == "empty" && board[ piece.x - 3 ][ piece.y ].type == "empty" ) {
					var tour = board[ 0 ][ 7 ];
					if ( tour.type == "tour" && tour.white ) {
						moves.push( { x: piece.x - 2, y: piece.y } );
					}					
				}
			}
			
        }

        var possibleMoves = [];
		
		for ( var i = 0; i < moves.length; i++ ) {
			
			var move = moves[ i ];
			
			if ( this.isInBoard( move.x, move.y ) ) {
				
				var target = board[ move.x ][ move.y ];
				
				if ( target.type == "empty" || ( piece.white != target.white ) ) {
					
					if ( noCheckTest ) {
						
						possibleMoves.push( move );
						
					} else {
						
						var testCheckBoard = JSON.parse( JSON.stringify( board ) );
						this.applyMove( testCheckBoard, piece, move );
						
						if ( !this.testCheck( testCheckBoard, piece.white ) ) {
						
							possibleMoves.push( move );
						
						}
						
					}
					
				}
				
			}
			
		}

        return possibleMoves;
		
	},
	
	testCheck: function ( board, white ) {
		
		var king = this.getKingPiece( board, white );
		
		if ( king ) {
			
			for ( var x = 0; x < 8; x++ ) {
				for ( var y = 0; y < 8; y++ ) {
					
					var b = board[ x ][ y ];
					if ( b.type != "empty" && b.white != white ) {						
						b.x = x;
						b.y = y;
						var moves = this.getPieceMoves( b, board, true );
						for ( var i = 0; i < moves.length; i++ ) {							
							var move = moves[ i ];
							if ( move.x == king.x && move.y == king.y ) return true;
						}
						
					}			
					
				}
			}
		
			return false;
			
		} else return true;
		
	},
	
	getKingPiece: function( board, white ) {
		
		for ( var x = 0; x < 8; x++ ) {
			for ( var y = 0; y < 8; y++ ) {
				var b = board[ x ][ y ];
				b.x = x;
				b.y = y;
				if ( b.type == "roi" && b.white == white ) return b;
			}
		}				
		
	},
	
	getMovesForDir: function ( piece, dir, board ) {
		
		var moves = [];
		var x = piece.x, y = piece.y;
		
		for ( var step = 0; step < 8; step++ ) {			
			x += dir.x;
			y += dir.y;
			if ( this.isInBoard( x, y ) ) {
				var b = board[ x ][ y ];
				if ( b.type == "empty" ) moves.push( { x: x, y: y } );
				else if ( b.white != piece.white ) {
					moves.push( { x: x, y: y } );
					return moves;
				} else {
					return moves;
				}
			} else return moves;
		}
		
		return moves;
		
	},

	isInBoard: function ( x, y ) {
		
		return ( x >= 0 && x < 8 && y >= 0 && y < 8 );
		
	},
	
};


self.addEventListener( "message", function( event ) {
	
	var message = event.data;
	
	if ( message.command == "compute" ) {
		
		self.postMessage( { command: "progress", progress: 0 } );
		
		bchessworker.compute( message.board, message.turnCount, null );
		
	} else if ( message.command == "canmove" ) {
		
		var piece = message.board[ message.from.x ][ message.from.y ];
		piece.x = message.from.x;
		piece.y = message.from.y;
		
		var moves = bchessworker.getPieceMoves( piece, message.board, false );
		
		for ( var i = 0; i < moves.length; i++ ) {
			var move = moves[ i ];
			
			if ( move.x == message.to.x && move.y == message.to.y ) {				
				self.postMessage( { command: "canmoveresult", value: true, from: message.from, to: message.to } );
				return;				
			}
			
		}
		
		self.postMessage( { command: "canmoveresult", value: false } );
		
	} else if ( message.command == "iswhitemat" ) {
		
		for ( var x = 0; x < 8; x++ ) {
			for ( var y = 0; y < 8; y++ ) {
				var b = message.board[ x ][ y ];
				if ( b.type != "empty" && b.white ) {
					b.x = x;
					b.y = y;
					var moves = bchessworker.getPieceMoves( b, message.board, false );
					if ( moves.length > 0 ) {
						self.postMessage( { command: "iswhitematresult", value: false } );
						return;	
					}
				}
			}
		}
		
		self.postMessage( { command: "iswhitematresult", value: true } );
		
	}
	
});