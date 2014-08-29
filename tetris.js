var tetris = {
	params:
	{
		intervals:
		{
			checkOver: 5 	//Check every 5ms if the game is gameOver
		},
		gameOver: false,		//Defines if game is gameOver or not
		height: 20,			// Height of Board
		width: 20,			// Width of Board
		initialPoint: 10,	//Point where next pieces is introduced
		draw: function()
		{
			tetris.panel.array.gamePlay( "tetris" ); //HTML Element where game is shown
		},
	},
	pieceStatus:		// Tracks the current status of the game pieces
	{
		introduced: false,
		resting: false,
	},
	gameOver: function()
	{
		tetris.pieces.shift = function(){}
		tetris.params.gameOver = true;
	},
	init: function() 	// Initialize the game (load panel, load pieces)
	{
		window.onkeyup = tetris.listenToKeyboard;
		tetris.panel.loadPanel();
		tetris._checkloop = window.setInterval( tetris.tetrisloop, tetris.params.intervals.checkOver );
		tetris.pieces.nextPiece = tetris.pieces.randomize();
		tetris.panel.loadNewPiece( tetris.params.initialPoint, tetris.pieces.nextPiece );
	},
	tetrisloop: function()
	{
		if( tetris.params.gameOver ) 
		{	
			alert("Game Over");
			window.close();
		}
	},
	listenToKeyboard: function( event )
	{
		switch( event.keyCode )
		{
			case 68:		// D key for moving right
			case 102:
				if ( tetris.pieces.shift( 1 ) == false)
					alert("Play Again");
				else
					tetris.pieces.shift();
				break;

			case 65:		// A key for moving left
			case 100:
				if ( tetris.pieces.shift( -1 ) == false)
					alert("Play Again");
				else
					tetris.pieces.shift();
				break;

			case 87:		// W key for Clockwise turn
			case 104:
				if(tetris.pieces.turn(1) == false)
					alert("Invalid Move");
				break;

			case 83:		// S key for counter-Clockwise turn
			case 98:
				if(tetris.pieces.turn(-1) == false)
					alert("Invalid Move");
				break;
		}
	},
	
	panel:
	{
		loop: function( method )	// Loops through the whole panel to check for suitable objects
		{
			for( var y = 0; y < tetris.panel.array.length; y++ )
			{
				for( var x = 0; x < tetris.panel.array[ y ].length; x++ )
				{
					if( method( tetris.panel.array[ y ][ x ], x, y ) )
					{
						break;
					}
				}	
			}
		},
		
		loadNewPiece: function( coords, pieces )	//Loads a random new piece
		{
			tetris.pieces.nextPiece = tetris.pieces.randomize();
			tetris.pieceStatus.newpieces = true;
			tetris.panel.array[ 0 ][ coords ] = tetris.pieces.newPiece( pieces );
			tetris.panel.populate();
		},
		
		loadPanel: function()	//Loads the panel array
		{
			tetris.panel.array = new Array( tetris.params.height );

			for( var index = 0; index < tetris.panel.array.length; index++ )
			{
				tetris.panel.array[ index ] = new Array( tetris.params.width );
			}
		},
		check: function()
		{
			for( var y = 0; y < tetris.panel.array.length; y++ )
			{
				for( var x = 0; x < tetris.panel.array[ y ].length; x++ )
				{
					if( typeof( tetris.panel.array[ y ][ x ] ) !== "object" ) break;
					if( tetris.panel.array[ y ][ x ].name !== "Fixed" ) break;
	
					if( x === 19 )
					{
						tetris.panel.array.splice( y, 1 );
						tetris.panel.array.reverse();
						tetris.panel.array.push( new Array( 10 ) );
						tetris.panel.array.reverse();
					}
				}
			}
		},
		clean: function() // Hides the current piece to be redrawn
		{
			tetris.panel.loop( function( cell, x, y ){
				if( typeof( cell ) === "object" && cell.name == "Current" )
				{
					tetris.panel.array[ y ][ x ] = "";
				}
			});
		},
		
		populate: function() // Populates the panel with fixed and current pieces
		{
			var object		= tetris.pieces.find();
			var Fixed		= object[ 0 ];
			var positions	= object[ 1 ];
			var offsets		= tetris.pieces.orientations[ Fixed.type ][ Fixed.rotation ];

			for( var index = 0; index < offsets.length; index++  )
			{
				var y = offsets[ index ][ 0 ];
				var x = offsets[ index ][ 1 ];

				try
				{
					tetris.panel.array[ positions[ 0 ] + y ][ positions[ 1 ] + x ] = new Object();
					tetris.panel.array[ positions[ 0 ] + y ][ positions[ 1 ] + x ].name = "Current";
					tetris.panel.array[ positions[ 0 ] + y ][ positions[ 1 ] + x ].type = Fixed.type;
				}
				catch(er){}
			}
			tetris.params.draw();
		}
	},
	pieces:
	{
		names: [ "I", "L", "J", "Z", "O"],
		orientations: [
			[ [ [0,-2], [0,-1], [0,1] ], [ [-1,0], [1,0], [2,0] ] ], //1 I
			[ [ [0,-1], [0,1], [1,-1] ], [ [-1,0], [1,0], [1,1] ], [ [0,-1], [0,1], [-1,1] ], [ [-1,-1], [-1,0], [1,0] ] ] //2 L
			[ [ [0,-1], [0,1], [1,1] ], [ [-1,0], [-1,1], [1,0] ], [ [-1,-1], [0,-1], [0,1] ], [ [-1,0], [1,-1], [1,0] ] ], //3 J
			[ [ [0,-1], [1,0], [1,1] ], [ [-1,1], [0,1], [1,0] ] ], //4 Z
			[ [ [0,1], [-1,1], [-1,0] ] ], //5 O
		],
		nextPiece: 0,		//Index of next piece in queue
		randomize: function()
		{
			return Number( Math.floor( Math.random() * tetris.pieces.orientations.length ) );
		},
		find: function() 	//Looks up the current location of piece
		{
			var piece = false;
			tetris.panel.loop( function( cell, x, y ){
				if( typeof( cell ) === "object" )
				{
					if( cell.name == "piece" )
					{
						piece = [ cell, [ y, x ] ];
						return true;
					}
				}
			});
			return piece;
		},
		newPiece: function( index )		// Defines a new piece of definite kind
		{
			var piece 		= new Object();
			piece.name		= "piece";
			piece.type		= index;
			piece.rotation	= 0;
			return piece;
		},
		turn: function(direction)		// Controls the turning of the piece in any direction
		{
			var r = confirm(direction>0?"W : Clockwise":"S : Counter-Clockwise");
			if (r == true) 
			{
				var piece				= tetris.pieces.find();
				var Fixed				= piece[ 0 ];
				var positions			= piece[ 1 ];
				var turnOptions			= tetris.pieces.orientations[ Fixed.type ].length;
				var newRotation			= Fixed.rotation + direction;
				
				if ( newRotation < 0 ) newRotation = turnOptions - 1;
				if ( newRotation == turnOptions ) newRotation = 0;

				var offsets	= tetris.pieces.orientations[ Fixed.type ][ newRotation ];

				tetris.panel.clean();

				for( var index = 0; index < offsets.length; index++  )
				{
					var y = offsets[ index ][ 0 ];
					var x = offsets[ index ][ 1 ];
					try
					{
						var neighbour = tetris.panel.array[ positions[ 0 ] + y ][ positions[ 1 ] + x ];
		
						if( positions[ 1 ] + x < 1 || positions[ 1 ] + x > 19 || ( typeof( neighbour ) == "object" ) )
						{
							tetris.panel.populate();
							return false;
						}
					}catch(er){}
				}
				Fixed.rotation = Fixed.rotation + direction;

				if ( Fixed.rotation < 0 ) Fixed.rotation = turnOptions - 1;
				if ( Fixed.rotation == turnOptions ) Fixed.rotation = 0;
				
				tetris.panel.populate();
				tetris.pieces.shift();
			}
		},
		shift: function( direction )	// Controls the Horizontal movement of piece
		{
			if (typeof( direction ) !== "undefined")
			var r = confirm(direction>0?"D : Right":"A : Left");
			if (r == false)
				return false;
					
			var Fixed		= tetris.pieces.find();
			this.left	= true;
			this.right	= true;
			this.down	= true;

			for( var y = 0; y < tetris.panel.array.length; y++ )
			{
				for( var x = 0; x < tetris.panel.array[ y ].length; x++ )
				{
					if( typeof( tetris.panel.array[ y ][ x ] ) == "object" )
					{
						if( tetris.panel.array[ y ][ x ].name == "Current" || tetris.panel.array[ y ][ x ] == Fixed[ 0 ] )
						{
							if( x === 1 && direction < 0 ) this.left			= false;
							if( x === 19 && direction > 0 ) this.right			= false;
							if( y === tetris.panel.array.length -2 ) this.down	= false;
			
							switch( direction )
							{
								case -1: //left
									if( typeof( tetris.panel.array[ y ][ x -1 ] ) == "object" )
									{
										if( tetris.panel.array[ y ][ x -1 ].name == "Fixed" )
										{
											this.left = false;
										}
									}
								break;
		
								case 1: //right
									if( typeof( tetris.panel.array[ y ][ x + 1 ] ) == "object" )
									{
										if( tetris.panel.array[ y ][ x + 1 ].name == "Fixed" )
										{
											this.right = false;
										}
									}
								break;
	
								default:
					
									if( y !== tetris.panel.array.length - 2 )
									{
										if( typeof( tetris.panel.array[ y + 1 ][ x ] ) == "object" )
										{
											if( tetris.panel.array[ y + 1 ][ x ].name == "Fixed" )
											{
												if( tetris.pieceStatus.resting )
												{
													tetris.pieces.resting();
										
													return true;
												}
									
												this.down			= false;
												tetris.pieceStatus.resting	= true;
											}
										}
									}
									else
									{
										tetris.pieces.resting();
										return true;
									}
								break;
							}
						}
					}
				}	
			}

			tetris.panel.clean();

			var newY = 0;
			var newX = 0;


			if( direction < 0 && this.left )								var newX = -1;
			else if( direction > 0 && this.right )							var newX = 1;
			else if( typeof( direction ) == "undefined" && this.down )
			{
				tetris.pieceStatus.newpieces = false;
				var newY = 1;
			}
			tetris.panel.array[ Fixed[ 1 ][ 0 ] ][ Fixed[ 1 ][ 1 ] ] = "";
			tetris.panel.array[ Fixed[ 1 ][ 0 ] + newY ][ Fixed[ 1 ][ 1 ] + newX ] = Fixed[ 0 ];
			tetris.panel.populate();
			if (typeof( direction ) !== "undefined" && (!this.left || !this.right))
				return false
			
		},
		resting: function()		// Converts a "Current" type piece into "Fixed" piece
		{
			tetris.pieceStatus.resting	= false;

			var object		= tetris.pieces.find();
			
			tetris.panel.loop( function( cell, x, y ){
				if( typeof( cell ) == "object" )
					{
						if( cell.name == "Current" || cell == object[ 0 ] )
						{
							tetris.panel.array[ y ][ x ].name = "Fixed";
						}
					}
			});

			tetris.panel.check();

			if( tetris.pieceStatus.newpieces == true )
			{
				tetris.gameOver();
			}
			else
			{
				tetris.panel.loadNewPiece( tetris.params.initialPoint, tetris.pieces.nextPiece );
			}
		},
	}
};

window.onload = tetris.init;

Array.prototype.gamePlay = function( div )
{
	var output = "";
	
	for( var y = 0; y < this.length-1; y++ )
	{
		this[y][this.length]="*"; 	//Border on Right
		this[y][0]="*";				//Border on Left
		
		for( var x = 0; x < this[ y ].length; x++ )
		{
			var _this = this[ y ][ x ];
			

			switch( typeof( _this ) )
			{
				case "undefined":
					_this = " ";
					break;
		
				case "object":
					if( _this.name == "Block" ) _this = "*";
					else _this = "*"; 
					break;
				case "number":
	
					break;
				case "string":
					if( _this === "" ) _this = " ";
					
					break;
			}
			output += _this;
		}
		output += "\n";
	}
	for( var x = 0; x <= this.length; x++ )
		output += "*"; 	//Border on bottom
	document.getElementById( div ).innerHTML = output;
	
	return this;
}
