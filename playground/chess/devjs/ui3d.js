
if ( typeof TouchEvent == "undefined" ) {
	TouchEvent = function() { ; };
}

var ui3d = {
	
	mouse: new THREE.Vector2(),

	load: function ( callback ) {
		
		var scope = this;
		
		document.getElementById( "ui2d" ).style.display = "none";
		scope.sceneElm = document.getElementById( "scene" );
		scope.sceneElm.style.display = "block";
		
		if ( scope.scene ) { callback(); return; }
		scope.scene = new THREE.Scene();		
		scope.sceneElm.onmousedown = scope.onMouseDown;
		scope.sceneElm.onmousemove = scope.onMouseMove;
		scope.sceneElm.onmouseup = scope.onMouseUp;
		scope.sceneElm.ontouchstart = scope.onMouseDown;
		scope.sceneElm.ontouchmove = scope.onMouseMove;
		scope.sceneElm.ontouchend = scope.onMouseUp;
		//window.onresize = scope.layout;
		
		var loader = new THREE.JSONLoader();
		
		scope.geos = {};
		var geoscale = .42;
		loader.load( "scene/pion.json", function ( geo ) {
		geo.scale( geoscale, geoscale, geoscale );
		scope.geos.pion = geo;
		loader.load( "scene/tour.json", function ( geo ) {
		geo.scale( geoscale, geoscale, geoscale );
		scope.geos.tour = geo;
		loader.load( "scene/cheval.json", function ( geo ) {
		geo.scale( geoscale, geoscale, geoscale );
		scope.geos.cheval = geo;
		loader.load( "scene/fou.json", function ( geo ) {
		geo.scale( geoscale, geoscale, geoscale );
		scope.geos.fou = geo;
		loader.load( "scene/dame.json", function ( geo ) {
		geo.scale( geoscale, geoscale, geoscale );
		scope.geos.dame = geo;
		loader.load( "scene/roi.json", function ( geo ) {
		geo.rotateY( Math.PI/2 );
		geo.scale( geoscale, geoscale, geoscale );
		scope.geos.roi = geo;
		
		( new THREE.TextureLoader() ).load( "scene/wood.jpg", function ( woodtex ) {
		
			scope.meshes = [];
			
			var whitemat = new THREE.MeshPhongMaterial( { color:0xeeeeee, map: woodtex } );
			var blackmat = new THREE.MeshPhongMaterial( { color:0x555555, map: woodtex } );
			
			for ( var x = 0; x < 8; x++ ) { 
				for ( var y = 0; y < 8; y++ ) { 
					var b = bchess.board[ x ][ y ];
					if ( b.type != "empty" && scope.geos[ b.type ] ) {
						b.x = x;
						b.y = y;
						
						var mesh = new THREE.Mesh( scope.geos[ b.type ], b.white ? whitemat : blackmat );
						
						mesh.position.set( ( -3.5 + x ), 0, ( -3.5 + y ) );
						mesh.castShadow = true;
						mesh.rotation.y = ( b.type == "cheval" ) ? ( b.white ? -Math.PI/2 : Math.PI/2 ) : 0;
						mesh.userData.piece = JSON.parse( JSON.stringify( b ) );
						scope.meshes.push( mesh );
						
						scope.scene.add( mesh );
						
					}
				}
			}
			
			scope.loadScene( callback );
			
		});
		});
		});
		});
		});
		});
		});
		
	},
	
	loadScene: function ( callback ) {
		
		var scope = this;
		
		scope.renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
		scope.renderer.setPixelRatio( Math.min( 2, window.devicePixelRatio || 1 ) );
		//scope.renderer.setSize( window.innerWidth, window.innerHeight );
		
		scope.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // THREE.BasicShadowMap THREE.PCFSoftShadowMap THREE.PCFShadowMap
		scope.renderer.shadowMap.enabled = true;
		scope.renderer.shadowMap.renderReverseSided = false;
		
		//scope.domElement = document.getElementById( "scene" );
		scope.sceneElm.appendChild( scope.renderer.domElement );			
				
		scope.aspect = window.innerWidth / window.innerHeight;
		scope.camera = new THREE.PerspectiveCamera( 38, scope.aspect, .25, 1000 );			
		scope.scene.add( scope.camera );			
		scope.lookpoint = new THREE.Vector3( 0, 0, .12 );		
		//scope.camera.position.set( 0, 14, 10 );
		
		scope.layout();
		
		scope.scene.add( new THREE.AmbientLight( 0xffffff, .58 ) );
		var light1 = new THREE.PointLight( 0xffffff, .66 );
		light1.position.set( 6, 10, 6 );
		scope.scene.add( light1 );
		var light2 = new THREE.PointLight( 0xffffff, .23 );
		light2.position.set( -5, 5, -5 );
		scope.scene.add( light2 );
		
		var d = .2; 
		light1.castShadow = true;
		light1.shadow.mapSize.width = 512;
		light1.shadow.mapSize.height = 512;
		light1.shadow.camera.near = 0.01; 
		light1.shadow.camera.far = 1000;		
		light1.shadow.camera.left = -d;
		light1.shadow.camera.right = d;
		light1.shadow.camera.top = d;
		light1.shadow.camera.bottom = -d;
		
		var shadowmat = new THREE.ShadowMaterial( { opacity: .18 } );
		var planegeo = new THREE.PlaneGeometry( 12, 12 );
		planegeo.rotateX( -Math.PI/2 );
		var shadowmesh = new THREE.Mesh( planegeo, shadowmat );
		shadowmesh.receiveShadow = true;
		scope.scene.add( shadowmesh );
		
		( new THREE.TextureLoader() ).load( "scene/cb.png", function ( floortiletex ) {
			
			floortiletex.wrapS = THREE.RepeatWrapping;
			floortiletex.wrapT = THREE.RepeatWrapping;
			floortiletex.repeat.set( 1, 1 );
			var planegeo = new THREE.PlaneGeometry( 8, 8 );
			planegeo.rotateX( -Math.PI/2 );
			scope.planemesh = new THREE.Mesh( planegeo, new THREE.MeshLambertMaterial( { map: floortiletex, color: 0xdadada } ) );
			//scope.planemesh.receiveShadow = true;
			scope.planemesh.position.set( 0, -0.01, 0 );
			scope.scene.add( scope.planemesh );
			
			scope.raycaster = new THREE.Raycaster();
			
			callback();
			 
		});
		
		
	},
	
	onMouseDown: function ( ev ) {
		
		if ( !bchess.whiteToPlay ) return;
		
		var x = 0, y = 0;
		if ( ev instanceof TouchEvent ) {
			var touch = ev.changedTouches[ 0 ];
			x = touch.clientX;
			y = touch.clientY;
		} else {
			x = ev.clientX;
			y = ev.clientY;
		}
		
		ui3d.mouse.x = ( x / window.innerWidth ) * 2 - 1;
		ui3d.mouse.y = - ( y / window.innerHeight ) * 2 + 1;
		ui3d.raycaster.setFromCamera( ui3d.mouse, ui3d.camera );
		
		var intersects = ui3d.raycaster.intersectObject( ui3d.planemesh );
		
		var intersect = intersects[ 0 ];
		if ( intersect ) {
			
			var x = Math.floor( intersect.uv.x * 8 );
			var y = 7 - Math.floor( intersect.uv.y * 8 );
			
			var b = bchess.board[ x ][ y ];
			if ( b.type != "empty" && b.white ) {
				ui3d.draggedPiece = b;
				ui3d.draggedMesh = ui3d.meshes.filter( function ( m ) { return m.userData.piece.x == x && m.userData.piece.y == y; } )[ 0 ];
				ui3d.draw();				
			} else {
				ui3d.draggedPiece = null;
			}
			
		}
		
	},
	
	onMouseMove: function ( ev ) {
				
		if ( ui3d.draggedPiece ) {
			
			var x = 0, y = 0;
			if ( ev instanceof TouchEvent ) {
				var touch = ev.changedTouches[ 0 ];
				x = touch.clientX;
				y = touch.clientY;
			} else {
				x = ev.clientX;
				y = ev.clientY;
			}
			
			ui3d.mouse.x = ( x / window.innerWidth ) * 2 - 1;
			ui3d.mouse.y = - ( y / window.innerHeight ) * 2 + 1;
			ui3d.raycaster.setFromCamera( ui3d.mouse, ui3d.camera );
		
			var intersects = ui3d.raycaster.intersectObject( ui3d.planemesh );
		
			var intersect = intersects[ 0 ];
			if ( intersect ) {				
				ui3d.draggedMesh.position.set( intersect.point.x, 0, intersect.point.z );
				ui3d.draw();
			}
			
		}
		
	},
	
	onMouseUp: function ( ev ) {
		
		if ( ui3d.draggedPiece ) {
			
			var x = 0, y = 0;
			if ( ev instanceof TouchEvent ) {
				var touch = ev.changedTouches[ 0 ];
				x = touch.clientX;
				y = touch.clientY;
			} else {
				x = ev.clientX;
				y = ev.clientY;
			}
			
			ui3d.mouse.x = ( x / window.innerWidth ) * 2 - 1;
			ui3d.mouse.y = - ( y / window.innerHeight ) * 2 + 1;
			ui3d.raycaster.setFromCamera( ui3d.mouse, ui3d.camera );
		
			var intersects = ui3d.raycaster.intersectObject( ui3d.planemesh );
		
			var intersect = intersects[ 0 ];
			if ( intersect ) {
				
				var x = Math.floor( intersect.uv.x * 8 );
				var y = 7 - Math.floor( intersect.uv.y * 8 );
				bchess.requestUserMove( { x: ui3d.draggedPiece.x, y: ui3d.draggedPiece.y }, { x: x, y: y } );
		
			}
			
		}
		
		ui3d.draggedPiece = null;
		
	},

	draw: function ( ctrl ) {
	
		//this.camera.lookAt( this.meshes[ 0 ].position );
	
		this.renderer.render( this.scene, this.camera );
		
		/*this.camera.lookAt( this.meshes[ 0 ].position );
	
		this.renderer.render( this.scene, this.camera );*/
	
	},
	
	doMove: function ( from, to ) {
		
		this.movedMesh = ui3d.meshes.filter( function ( m ) { return m.userData.piece.x == from.x && m.userData.piece.y == from.y; } )[ 0 ];
		
		var eatenMesh = ui3d.meshes.filter( function ( m ) { return m.userData.piece.x == to.x && m.userData.piece.y == to.y; } )[ 0 ];
		if ( eatenMesh ) this.animateEaten( eatenMesh );
		
		this.movedMesh.userData.piece.x = to.x;
		this.movedMesh.userData.piece.y = to.y;
		this.movedMesh.position.set( -3.5 + this.movedMesh.userData.piece.x, 0, -3.5 + this.movedMesh.userData.piece.y );
		
	},
	
	animateMove: function ( from, to, callback ) {
		
		this.movedMesh = ui3d.meshes.filter( function ( m ) { return m.userData.piece.x == from.x && m.userData.piece.y == from.y; } )[ 0 ];
		
		var eatenMesh = ui3d.meshes.filter( function ( m ) { return m.userData.piece.x == to.x && m.userData.piece.y == to.y; } )[ 0 ];
		if ( eatenMesh ) this.animateEaten( eatenMesh, true );
		
		var tick = 0, steps = 80;
		
		this.animTarget = new THREE.Vector3();
		this.animTarget.set( -3.5 + to.x, 0, ( -3.5 + to.y ) );
		this.animDir = new THREE.Vector3();
		this.animDir.copy( this.animTarget ).sub( this.movedMesh.position ).multiplyScalar( 1 / steps );
		this.animInterval = setInterval( function() {
			
			tick++;			
			ui3d.movedMesh.position.add( ui3d.animDir );
			
			if ( tick > steps ) { 				
				ui3d.movedMesh.userData.piece.x = to.x;
				ui3d.movedMesh.userData.piece.y = to.y;
				ui3d.movedMesh.position.set( -3.5 + ui3d.movedMesh.userData.piece.x, 0, -3.5 + ui3d.movedMesh.userData.piece.y );
				clearInterval( ui3d.animInterval );
				callback();
			}
			
			ui3d.draw();
			
		}, 40 );
		
	},
	
	animateEaten: function ( mesh, dontDraw ) {
		
		var tick = 0;
		
		this.animEatInterval = setInterval( function() {
			
			tick++;
			
			mesh.position.y += .025;
			
			if ( tick > 120 ) {
				
				mesh.visible = false;
				mesh.userData.piece.x = -1;
				mesh.userData.piece.y = -1;
				clearInterval( ui3d.animEatInterval );
				
			}
			
			if ( !dontDraw ) ui3d.draw();
			
		}, 40 );
		
	},
	
	/*setProgress: function ( p ) {
	
	},*/
	
	setTurn: function ( white ) { ; 	},
	
	reset: function () {		
		
		this.meshes.forEach( function ( m ) {

			m.position.set( -3.5 + m.userData.piece.x, 0, -3.5 + m.userData.piece.y );
			
		});
		
	},
	
	layout: function () {
	
		if ( ui3d.renderer ) {
			
			ui3d.renderer.setSize( window.innerWidth, window.innerHeight );
			
		}
		if ( ui3d.camera ) {
			
			var wsize =  window.innerWidth; //Math.max( window.innerWidth, window.innerHeight );
			//var dist = Math.max( 7, ( 2500 - Math.min( 1600, wsize ) ) * 10  ) * .0005;
			var dist = Math.max( 7.8, 30 - Math.pow( wsize, 1.2 ) * .0126 );
			console.log( dist );
			
			ui3d.camera.position.set( 0, 1.4 *  dist, dist )
			ui3d.camera.lookAt( ui3d.lookpoint );
			
			ui3d.aspect = window.innerWidth / window.innerHeight;
			ui3d.camera.aspect = ui3d.aspect;
			ui3d.camera.updateProjectionMatrix();
			ui3d.draw();
		
		}
	
	},

}