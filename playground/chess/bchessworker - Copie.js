
var bchessworker = {

	turnCount: -1,

	compute: function ( board, turnCount, parameters ) {
		
		//this.board = board;
		this.turnCount = turnCount;
		
		this.maxRecurLevel = ( parameters && parameters.maxRecurLevel ) || 2;
		
		//var score = this.evaluateRecursive( newBoard );
		
		var moves = [];
		
		var progress = 0, progressstep = 1 / 64;
		
		for ( var x = 0; x < 8; x++ ) { 
			for ( var y = 0; y < 8; y++ ) { 
				var b = board[ x ][ y ];
				if ( b.type != "empty" && !b.white ) {
					
					var piece = { x: x, y: y, type: b.type, white: b.white };
					var movesToEval = this.getPieceMoves( piece, board );
					console.log( "piece: " + moves.length + " moves to eval" );
					for ( var i = 0; i < movesToEval.length; i++ ) {
						
						var moveToEval = movesToEval[ i ];
						
						var newBoard = JSON.parse( JSON.stringify( board ) );
						this.applyMove( newBoard, piece, moveToEval );
						moveToEval.score = this.evaluateRecursive( newBoard, false, 0 );
						moveToEval.piece = piece;
						moves.push( moveToEval );
						
						console.log( "move eval done. x=" + x + ",y="+y+",i="+i+",moves.length=" + moves.length );
						
					}					
				}
				progress += progressstep;
				self.postMessage( { command: "progress", progress: progress } );
			}
		}
		
		var bestMove = { score: -9999999999 };
		for ( var i = 0; i < moves.length; i++ ) {
			var m = moves[ i ];
			if ( m.score > bestMove.score ) bestMove = m;			
		}
		
		self.postMessage( { command: "result", bestMove: bestMove } );
		
	},
	
	evaluateRecursive: function ( board, white, recurlevel, movedPiece ) {
		
		if ( recurlevel >= this.maxRecurLevel ) {
			
			return this.evaluate( board, white, movedPiece );
			
		} else {
			
			var adverseMoveScores = [];
			
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
							
							var adverseScore = this.evaluateRecursive( newBoard, !white, recurlevel+1, piece );
							
							adverseMoveScores.push( { move: move, score: adverseScore } );
							
						}
						
					}
					
				}
			}
			
			if ( adverseMoveScores.length == 0 ) {
				
				alert( "mat ou pat" );
				return 9999999999;
				
			}
			
			var bestScore = -3333333333;
			//var bestScoreAndMove = null;
			for ( var i = 0; i < adverseMoveScores.length; i++ ) {
				var s = adverseMoveScores[ i ];
				if ( s.score > bestScore ) {
					bestScore = s.score;
					//bestScoreAndMove = s;
				}
			}
			return 3333333333 - bestScore;
			
		}
		
	},
	
	evaluate: function ( board, white, movedPiece ) {
		
		var score = 0
        for ( var x = 0; x < 8; x++ ) {
			for ( var y = 0; y < 8; y++ ) {
				var b = board[ x ][ y ];
				b.x = x;
				b.y = y;
				if ( b.type != "empty" ) score += this.getPieceScore( b, white );
			}
        }
		
		/*if ( !white && movedPiece && !movedPiece.white ) {
			
			if ( this.turnCount < 7 ) {
						
				if ( movedPiece.x == 0 || movedPiece.x == 7 ) score -= 20;
				if ( movedPiece.x == 1 || movedPiece.x == 6 ) score -= 10;
			
			} else if ( this.turnCount < 11 ) {
				
				//if ( piece.x == 1 || piece.x == 6 ) score += 1;
				if ( movedPiece.x == 2 || movedPiece.x == 5 ) score += 3;
				if ( movedPiece.x == 3 || movedPiece.x == 4 ) score += 5;
				
			}

			if ( this.turnCount <= 6 && movedPiece.type == "pion" ) score += 5;
			if ( this.turnCount <= 9 && movedPiece.type == "cheval" ) score += 4;
			if ( this.turnCount <= 12 && movedPiece.type == "fou" ) score += 3;

		}*/
		
        return score;
		
	},
	
	getPieceScore: function( piece, white ) {
		
		var score = 0;
		
        if ( piece.white == white ) {
			
			if (piece.type == "pion") { score += 1000; /*if (piece.y == 0) score += 3500;*/ }
			else if (piece.type == "cheval") score += 2500;
			else if (piece.type == "fou") score += 2500;
			else if (piece.type == "tour") score += 3000;
			else if (piece.type == "dame") score += 4000;
			else if (piece.type == "roi") score += 100000;
	 
			if ( piece.type != "roi" ) {
				if ( white ) {
					score += 7 - piece.y;
				} else {				
					score += piece.y;
				}
				//score += 7 - piece.y;
			}
				
		} else {
		//if ( piece.white != white ) {
			
			if (piece.type == "pion") { score -= 1000; /*if (piece.y == 0) score -= 3500;*/ }
			else if (piece.type == "cheval") score -= 2500;
			else if (piece.type == "fou") score -= 2500;
			else if (piece.type == "tour") score -= 3000;
			else if (piece.type == "dame") score -= 4000;
			else if (piece.type == "roi") score -= 100000;
			
			//score += piece.y;
			//if (piece.x > 1 && piece.x < 6) score += 1;
			
        }
		
        return score;
	},	
	
	applyMove: function ( board, piece, move ) {
		
		var x = piece.x;
		var y = piece.y;
		/*piece.x = move.x;
		piece.y = move.y;
		board[ move.x ][ move.y ] = JSON.parse( JSON.stringify( piece ) );*/
		var b = board[ move.x ][ move.y ];
		b.type = piece.type;
		b.white = piece.white;
		b.x = move.x;
		b.y = move.y;
		board[ x ][ y ] = { type: "empty" };
		
	},

	getPieceMoves: function ( piece, board, noCheckTest ) {
		
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
						
						/*var testCheckBoard = JSON.parse( JSON.stringify( board ) );
						this.applyMove( testCheckBoard, piece, move );
						
						if ( !this.testCheck( testCheckBoard, piece.white ) ) {*/
						
							possibleMoves.push( move );
						
						//}
						
					}
					
				}
				
			}
			
		}

        return possibleMoves;
		
	},
	
	testCheck: function ( board, white ) {
		
		var king = this.getKingPiece( board, white );
		
		for ( var x = 0; x < 8; x++ ) {
			for ( var y = 0; y < 8; y++ ) {
				
				var b = board[ x ][ y ];
				if ( b.type != "empty" && b.white != white ) {
				
					var moves = this.getPieceMoves( b, board, true );
					for ( var i = 0; i < moves.length; i++ ) {
						
						var move = moves[ i ];
						if ( move.x == king.x && move.y == king.y ) return true;
					}
					
				}			
				
			}
		}
		
		return false;
		
	},
	
	getKingPiece: function( board, white ) {
		
		for ( var x = 0; x < 8; x++ ) {
			for ( var y = 0; y < 8; y++ ) {
				var b = board[ x ][ y ];
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
	
	/*cloneBoard: function ( board ) {
		
		var newb = {};
		for ( var x = -2; x < 10; x++ ) {
			this.board[ x ] = {};
			for ( var y = -2; y < 10; y++ ) this.board[ x ][ y ] = { type: "empty" };
		}
		
	},*/


};


self.addEventListener( "message", function( event ) {
	
	var message = event.data;
	
	if ( message.command == "compute" ) {
		
		self.postMessage( { command: "progress", value: 0 } );
		
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
		
	}
	
});