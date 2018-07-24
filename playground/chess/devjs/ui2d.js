
var ui2d = {

	load: function ( callback ) {
		
		document.getElementById( "ui2d" ).style.display = "block";
		document.getElementById( "scene" ).style.display = "none";
		
		this.cbElm = document.getElementById( "cb" );
		this.progressElm = document.getElementById( "progress" );
		
		var scope = this;
		this.cbElm.ondragover = function( ev ) { ev.preventDefault(); };
		this.cbElm.ondrop = function( ev ) { scope.onDrop( ev ); };
		
		//window.onresize = scope.layout;
		
		this.layout();
		
		callback();
		
	},
	
	onDrop: function ( ev ) {
		
		ev.preventDefault();
		var datatxt = ev.dataTransfer.getData( "text" );
		if ( !datatxt ) return;
		var data = JSON.parse( datatxt );
		var sourcex = parseInt( data.x );
		var sourcey = parseInt( data.y );
		
		var rect = ev.currentTarget.getBoundingClientRect();
		
		var targetx = Math.floor( ( ev.pageX - rect.left ) / ( ev.currentTarget.clientWidth / 8 ) );
		var targety = Math.floor( ( ev.pageY - rect.top ) / ( ev.currentTarget.clientHeight / 8 ) );
		
		//bchess.worker.postMessage( { command: "canmove", board: bchess.board, from: { x: sourcex, y: sourcey }, to: { x: targetx, y: targety } } );
		bchess.requestUserMove( { x: sourcex, y: sourcey }, { x: targetx, y: targety } );
		
	},

	draw: function ( ctrl ) {
	
		this.cbElm.innerHTML = "";
		
		var step = ui2d.cbsize / 8;
		
		var percent = 500 * step / 80;
		
		for ( var x = 0; x < 8; x++ ) {
			for ( var y = 0; y < 8; y++ ) {
				
				var b = bchess.board[ x ][ y ];
				if ( b.type != "empty" ) {
					
					var elm = document.createElement( "div" );
					elm.innerHTML = "<img src='img/" + b.type + ( b.white ? "w" : "b" ) + ".png'/>";
					elm.className = "piece " + ( b.white ? "w " : "b " ); // + b.type;
					elm.style.left = ( x * step ) + "px"; //( x * 100 / 8 ) + "%"; //( x * 80 ) + "px";
					elm.style.top = ( y * step ) + "px"; //( y * 100 / 8 ) + "%"; //( y * 80 ) + "px";
					//elm.style.backgroundSize = percent + "%"; //step*5 + "px";
					//elm.style = "left:" + ( b.x * 80 ) + "px;top:" + ( b.y * 80 ) + "px;";
					
					elm.setAttribute( "x", x );
					elm.setAttribute( "y", y );
					
					this.cbElm.appendChild( elm );
					
				}
				
			}
		}
	
	},
	
	/*setProgress: function ( p ) {
		
		this.progressElm.innerHTML = Math.ceil(p*100) + " %";
		
	},*/
	
	doMove: function () { ; },
	animateMove: function ( piece, move, callback ) {
		
		var pieceElm = document.querySelector( '.piece[x="' +piece.x + '"][y="'+piece.y+'"]' );
		var step = ui2d.cbsize / 8;
		var targetx = move.x * step, targety = move.y * step;
		var initx = parseInt( pieceElm.style.left ), inity = parseInt( pieceElm.style.top );
		
		var steps = 80, tick = 0;
		var dirx = ( targetx - initx ) / steps, diry = ( targety - inity ) / steps;
		
		this.animInterval = setInterval( function () {
			
			pieceElm.style.left = ( initx + tick * dirx ) + "px";
			pieceElm.style.top = ( inity + tick * diry ) + "px";
			tick++;
			if ( tick > steps ) {
				clearInterval( ui2d.animInterval );
				pieceElm.style.left = targetx + "px";
				pieceElm.style.top = targety + "px";
				callback();
			}
			
		}, 40 );
		
		//callback();
		
	},
	reset: function () { /*this.draw();*/ },
	
	setTurn: function ( white ) {
			
		if ( white ) {
			
			document.querySelectorAll( ".piece.w" ).forEach( function ( pieceElm ) {
				
				pieceElm.draggable = "true";
				pieceElm.ondragstart = function( ev ) {
					var x = this.getAttribute( "x" );
					var y = this.getAttribute( "y" );
					ev.dataTransfer.setData( "text", JSON.stringify( { x: x, y: y } ) );
				};
				
			});			
			
		} else {
			
			document.querySelectorAll( ".piece" ).forEach( function ( pieceElm ) {
				
				pieceElm.draggable = "false";
				pieceElm.ondragstart = null;
				
			});
			
		}
				
	},
	
	layout: function () {
		
		ui2d.cbsize = Math.min( window.innerWidth - 24, window.innerHeight - 80 ) ;
		ui2d.cbElm.style.width = ui2d.cbsize + "px";
		ui2d.cbElm.style.height = ui2d.cbsize + "px";
		ui2d.cbElm.style.backgroundSize = ( ui2d.cbsize / 4 ) + "px"; //"background-size:160px;"
		ui2d.draw();
		ui2d.setTurn( bchess.whiteToPlay );
		
	}

}