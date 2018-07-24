
var bchess = {

	whiteToPlay: true,
	turnCount: -1,
	isWorking: false,

	start: function () {
		
		this.worker = new Worker( "js/worker.min.js" );	
		this.worker.addEventListener( "message", this.onWorkerMessage ); 
		
		this.progressbar = document.getElementById( "progressbar" );
		document.getElementById( "uitypeswitch" ).onclick = this.onUITypeClick;
		document.getElementById( "endgame" ).style.display = "none";
		document.getElementById( "endgame" ).style.display = "none";
		
		this.resetBoard();
		
		this.setUIType( "2d"/*, function () {
			
			bchess.draw();		
			bchess.setTurn( true );

		}*/);
				
	},
	
	resetBoard: function () {
		
		this.board = {};
		for ( var x = -2; x < 10; x++ ) {
			this.board[ x ] = {};
			for ( var y = -2; y < 10; y++ ) {
				if ( x >= 0 && x < 8 && y >= 0 && y < 8 ) {
					this.board[ x ][ y ] = { type: "empty" };
				} else {
					this.board[ x ][ y ] = null;
				}
			}
		}
		this.addPiece(0, 1, "pion", false);
        this.addPiece(1, 1, "pion", false);
        this.addPiece(2, 1, "pion", false);
        this.addPiece(3, 1, "pion", false);
        this.addPiece(4, 1, "pion", false);
        this.addPiece(5, 1, "pion", false);
        this.addPiece(6, 1, "pion", false);
        this.addPiece(7, 1, "pion", false);
        this.addPiece(0, 0, "tour", false);
        this.addPiece(7, 0, "tour", false);
        this.addPiece(1, 0, "cheval", false);
        this.addPiece(6, 0, "cheval", false);
        this.addPiece(2, 0, "fou", false);
        this.addPiece(5, 0, "fou", false);
        this.addPiece(3, 0, "dame", false);
        this.addPiece(4, 0, "roi", false);
        
        this.addPiece(0, 6, "pion", true);
        this.addPiece(1, 6, "pion", true);
        this.addPiece(2, 6, "pion", true);
        this.addPiece(3, 6, "pion", true);
        this.addPiece(4, 6, "pion", true);
        this.addPiece(5, 6, "pion", true);
        this.addPiece(6, 6, "pion", true);
        this.addPiece(7, 6, "pion", true);
        this.addPiece(0, 7, "tour", true);
        this.addPiece(7, 7, "tour", true);
        this.addPiece(1, 7, "cheval", true);	   
        this.addPiece(6, 7, "cheval", true);
        this.addPiece(2, 7, "fou", true);
        this.addPiece(5, 7, "fou", true);
        this.addPiece(3, 7, "dame", true);
        this.addPiece(4, 7, "roi", true);
		
	},
	
	compute: function ( callback ) {
	
		this.isWorking = true;
		this.worker.postMessage( { command: "compute", board: this.board, turnCount: this.turnCount } );
	
	},
	
	onWorkerMessage: function ( event ) {
		
		var message = event.data;
		
		if ( message.command == "result" ) {
			
			console.log( message );
			
			bchess.progressbar.style.opacity = 0;
			bchess.progressbar.style.width = 0;
			
			var move = message.bestMove;
			
			if ( move ) {
			
				bchess.ui.animateMove( move.piece, move, function () {
					
					bchess.isWorking = false;
					bchess.board[ move.x ][ move.y ] = JSON.parse( JSON.stringify( bchess.board[ move.piece.x ][ move.piece.y ] ) );
					bchess.board[ move.piece.x ][ move.piece.y ] = { type: "empty" };
					bchess.draw();
					bchess.setTurn( true );
				
				});
			
			} else {
				
				document.getElementById( "endgame" ).style.display = "block";
				document.getElementById( "endgametext" ).innerHTML = "You win :)";
				
			}
			
		} else if ( message.command == "progress" ) {
			
			bchess.isWorking = true;
			bchess.progressbar.style.opacity = 1;
			bchess.progressbar.style.width = ( 2 + message.progress * 100 ) + "%";
			
		} else if ( message.command == "canmoveresult" ) {
			
			if ( message.value ) {
				
				function finish() {
					bchess.board[ message.to.x ][ message.to.y ] = JSON.parse( JSON.stringify( bchess.board[ message.from.x ][ message.from.y ] ) );
					bchess.board[ message.to.x ][ message.to.y ].x = message.to.x;
					bchess.board[ message.to.x ][ message.to.y ].y = message.to.y;
					bchess.board[ message.from.x ][ message.from.y ] = { type: "empty" };				
					bchess.ui.doMove( message.from, message.to );
					bchess.draw();					
					bchess.setTurn( false );
				}

				var b = bchess.board[ message.from.x ][ message.from.y ];		
				if ( b.type == "roi" && b.white && message.from.x == 4 && message.to.x == 6 && message.from.y == 7 ) {	
					bchess.ui.animateMove( { x: 7, y: 7 }, { x: 5, y: 7 }, function () {
						bchess.board[ 5 ][ 7 ] = JSON.parse( JSON.stringify( bchess.board[ 7 ][ 7 ] ) );
						bchess.board[ 5 ][ 7 ].x = 5;
						bchess.board[ 5 ][ 7 ].y = 7;
						bchess.board[ 7 ][ 7 ] = { type: "empty" };
						finish();
					});					
				} else if ( b.type == "roi" && b.white && message.from.x == 4 && message.to.x == 2 && message.from.y == 7 ) {	
					bchess.ui.animateMove( { x: 0, y: 7 }, { x: 3, y: 7 }, function () {
						bchess.board[ 3 ][ 7 ] = JSON.parse( JSON.stringify( bchess.board[ 1 ][ 7 ] ) );
						bchess.board[ 3 ][ 7 ].x = 3;
						bchess.board[ 3 ][ 7 ].y = 7;
						bchess.board[ 1 ][ 7 ] = { type: "empty" };
						finish();
					});					
				} else {
					finish();
				}
								
			} else {
				
				bchess.ui.reset();
				bchess.draw();
				bchess.setTurn( true );
				
			}
		
		} else if ( message.command == "iswhitematresult" ) {
			
			//console.log( "iswhitematresult " + message.value );
			if ( message.value ) {
				
				document.getElementById( "endgame" ).style.display = "block";
				document.getElementById( "endgametext" ).innerHTML = "I win :)";
				
			}
			
		}
		
	},
	
	addPiece: function ( x, y, type, white ) {
		
		this.board[ x ][ y ] = { type: type, white: white };
		
	},
	
	requestUserMove: function ( from, to ) {
		
		//function postmsg() {
			bchess.worker.postMessage( { command: "canmove", board: bchess.board, from: from, to: to } );
		//}
		
	},
	
	setTurn: function ( white ) {
		
		this.whiteToPlay = white;
		this.turnCount++;
		
		this.ui.setTurn( white );
		
		if ( !white ) {
			
			this.compute();
			
		} else {
			
			this.worker.postMessage( { command: "iswhitemat", board: this.board } );
			
		}
		
	},
	
	// ui
	
	onUITypeClick: function () {
		
		if ( bchess.isWorking ) return;
		
		if ( bchess.uiType == "2d" ) bchess.setUIType( "3d" ); else bchess.setUIType( "2d" ); 
		
	},
	
	setUIType: function ( uiType, callback ) {
		
		this.uiType = uiType;
		if ( uiType == "2d" ) this.ui = ui2d; else this.ui = ui3d;
		window.onresize = this.ui.layout;
		this.ui.load( function() { 	
			bchess.ui.layout();
			bchess.ui.reset();
			bchess.ui.draw();
			bchess.ui.setTurn( bchess.whiteToPlay );
			if ( callback ) callback(); 
		} );		
		
		document.getElementById( "uitypeswitch" ).className = "switchcontainer " + ( uiType == "3d" ? "checked" : "" );
		
	},
		
	draw: function () {
		
		this.ui.draw( this );
		
	},
	
	onNewGameClick: function () {
		
		document.getElementById( "endgame" ).style.display = "none";
		bchess.resetBoard();
		bchess.draw();
		bchess.setTurn( true );
		
	},
	
	onTitleClick: function () {
		
		bchess.isInfoPaneVisible = !bchess.isInfoPaneVisible;
		
		var elm = document.getElementById( "infopane" );
		elm.style.opacity = bchess.isInfoPaneVisible ? 1 : 0;
		elm.style.transform = bchess.isInfoPaneVisible ? "translateY(0)" : "translateY(100%)";
		elm.style.pointerEvents = bchess.isInfoPaneVisible ? "all" : "none";
		
	}
};