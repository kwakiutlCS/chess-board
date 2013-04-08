$(document).ready(function() {
    game.startGame({ size: 400, player: "both", orientation: "white", turn: "black", fen: "rnbqkbnr/pppppppp/8/8/nn2k1kk/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1" });
        
});



var game = {

    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",

    position: {},

    turn: "white",

    player: "white",

    result: "active",

    castling: "KQkq",

    size: 400,

    orientation: "white",



    startGame: function(params) {

	 // allows default values 
	 if ( "fen" in params )
	     this.fen = params["fen"];

	 if ( "size" in params )
	     this.size = params["size"];

	 if ( "player" in params )
	     this.player = params["player"];

	 if ( "orientation" in params )
	     this.orientation = params["orientation"];

	 if ( "turn" in params )
	     this.turn = params["turn"];


	 // gets board and piece position in log
	 this.getInitialPosition();

	 this.prepareTable();

	 this.loadBoard();


	 // allow board rotation
	 $(document).on("keypress", function() {
	     game.rotateBoard();
	 });

	 this.drawPieces();

	 
    },


    prepareTable: function() {
	 $("body").append("<div id='table'></div>");
	 $("#table").css({ width: this.size, height: this.size });
    },

    
    loadBoard: function() {
	 
	 $("#table").append("<div id='board'></div>");
    
	 // draw squares
	 this.drawSquares(this.size/8);

	 // allow square selection
	 $("#board").on("click", ".square", function() {
	     $(".square.selected").removeClass("selected");
	      
	     var square = $(this);
	     
	     // select only squares with pieces and is player to move
	     square.children().each( function(){
		  var piece = $(this);
		  if ( piece.hasClass("piece") && ( piece.data("color") === game.player || game.player === "both" ) && piece.data("color") === game.turn ) {
		      square.addClass("selected");
		      game.getPossibleMoves(square.attr("id"));
		  }
	     });
	 });
	 
    },


    drawSquares: function(squareSize) {

	 var columnsName = ["a", "b", "c", "d", "e", "f", "g", "h", ];

	 for ( var i = 1; i < 9; i++ ) {

	     // 8 squares per row
	     for ( var j = 0; j < 8; j++ ) {
	     
		  // append a square to the board depending on the orientation
		  if ( this.orientation === "white" )
		      $("#board").append("<div class='square' id='"+columnsName[j]+i+"'></div>");
		  else
		      $("#board").append("<div class='square' id='"+columnsName[7-j]+(9-i)+"'></div>");

		  // choose square position
		  $(".square").last().css( { left:j*squareSize, top: (8-i)*squareSize } );

		  // choose square color
		  if ( (i+j)%2 ) 
		      $(".square").last().addClass("dark");
		  else
		      $(".square").last().addClass("light");

	     }
	 }  

   
    }, 


    getInitialPosition: function() {

	 var fenArray = this.fen.split(" ");

	 var position = fenArray[0].split("/");

	 var columnsName = ["a", "b", "c", "d", "e", "f", "g", "h", ];

	 var y = 8; // starts with row 8
	 // 8 rows
	 for ( var row in position ) {

	     var x = 0; // starts with column 'e'
	     // 8 squares per row
	     for ( var square in position[row] ) {
		  
		  // if piece is in position mark it
		  if ( isNaN(parseInt(position[row][square])) ) {
		      this.position[columnsName[x]+y] = position[row][square];
		      x++; // advance cursor x by 1
		  }
		  // if piece is not in position advance (x,y) cursor
		  else {
		      x += parseInt(position[row][square]);
		  }
	     }

	     y--; // next row
	 }
	 
    },


    drawPieces: function() {

	 for ( var k in this.position ) {

	     // if piece is white
	     if ( this.position[k].toUpperCase() === this.position[k] )
		  $("#"+k).append("<div class='piece "+this.position[k]+"' data-color='white' data-piece='"+this.position[k]+"'></div>");

	     // if piece is black
	     else 
		  $("#"+k).append("<div class='piece "+this.position[k]+"' data-color='black' data-piece='"+this.position[k]+"'></div>");
	     
	 }
    },


    
    movePiece: function(start, end) {
	 // game log
	 this.position[end] = this.position[start];
	 delete this.position[start];
	 
	 // actual board update

	 // picks the piece
	 var piece = $("#"+start).children().each(function() {
	     var p = $(this);
	     if ( p.hasClass("piece") )
		  p.detach();
	 });
	 
	 // drops the piece
	 var end = $("#"+end);
	 end.children().remove();
	 end.append(piece);

	 // TODO 
	 // castling and en passant taking
    },
	 

    // deletes board and redraws it upside down
    rotateBoard: function() {
	 this.orientation = this.orientation === "white" ? "black" : "white";

	 $("#table").children().remove();

	 this.loadBoard();

	 this.drawPieces();

    },


    getPossibleMoves: function(square) {
	 
	 var possibleMoves = [];

	 // pieces coordinates
	 var squareArray = square.split("");
	 var y, x;
	 var columnsName = ["a", "b", "c", "d", "e", "f", "g", "h", ];

	 
	 // ROOK
	 if ( this.position[square].toUpperCase() === "R"  || this.position[square].toUpperCase() === "Q" ) {
	     
	     // movement to the right
	     y = parseInt(squareArray[1]);
	     x = squareArray[0].charCodeAt(0)-97;
	 
	     while ( x < 7 ) {
		  x++;

		  // path is clear
		  if ( !( columnsName[x]+y in this.position ) )
		      possibleMoves.push(columnsName[x]+y);

		  // enemy piece
		  else if ( this.isEnemyPresent(columnsName[x]+y, square) ) {
		      possibleMoves.push(columnsName[x]+y); 
		      break;
		  }
		      
		  // friendly piece
		  else 
		      break;
	     }

	     // movement to the left
	     y = parseInt(squareArray[1]);
	     x = squareArray[0].charCodeAt(0)-97;
	 
	     while ( x > 0 ) {
		  x--;

		  // path is clear
		  if ( !( columnsName[x]+y in this.position ) )
		      possibleMoves.push(columnsName[x]+y);

		  // enemy piece
		  else if ( this.isEnemyPresent(columnsName[x]+y, square) ) {
		      possibleMoves.push(columnsName[x]+y); 
		      break;
		  }
		      
		  // friendly piece
		  else 
		      break;
	     }

	     // movement up
	     y = parseInt(squareArray[1]);
	     x = squareArray[0].charCodeAt(0)-97;
	 
	     while ( y < 8 ) {
		  y++;

		  // path is clear
		  if ( !( columnsName[x]+y in this.position ) )
		      possibleMoves.push(columnsName[x]+y);

		  // enemy piece
		  else if ( this.isEnemyPresent(columnsName[x]+y, square) ) {
		      possibleMoves.push(columnsName[x]+y); 
		      break;
		  }
		      
		  // friendly piece
		  else 
		      break;
	     }

	     // movement up
	     y = parseInt(squareArray[1]);
	     x = squareArray[0].charCodeAt(0)-97;
	 
	     while ( y > 1 ) {
		  y--;

		  // path is clear
		  if ( !( columnsName[x]+y in this.position ) )
		      possibleMoves.push(columnsName[x]+y);

		  // enemy piece
		  else if ( this.isEnemyPresent(columnsName[x]+y, square) ) {
		      possibleMoves.push(columnsName[x]+y); 
		      break;
		  }
		      
		  // friendly piece
		  else 
		      break;
	     }
    
	 }
	 

	 // BISHOP
	 if ( this.position[square].toUpperCase() === "B"  || this.position[square].toUpperCase() === "Q" ) {
	     
	     // movement to NE
	     y = parseInt(squareArray[1]);
	     x = squareArray[0].charCodeAt(0)-97;
	 
	     while ( x < 7 && y < 8) {
		  x++;
		  y++;

		  // path is clear
		  if ( !( columnsName[x]+y in this.position ) )
		      possibleMoves.push(columnsName[x]+y);

		  // enemy piece
		  else if ( this.isEnemyPresent(columnsName[x]+y, square) ) {
		      possibleMoves.push(columnsName[x]+y); 
		      break;
		  }
		      
		  // friendly piece
		  else 
		      break;
	     }

	     // movement to NW
	     y = parseInt(squareArray[1]);
	     x = squareArray[0].charCodeAt(0)-97;
	 
	     while ( x > 0 && y < 8 ) {
		  x--;
		  y++;

		  // path is clear
		  if ( !( columnsName[x]+y in this.position ) )
		      possibleMoves.push(columnsName[x]+y);

		  // enemy piece
		  else if ( this.isEnemyPresent(columnsName[x]+y, square) ) {
		      possibleMoves.push(columnsName[x]+y); 
		      break;
		  }
		      
		  // friendly piece
		  else 
		      break;
	     }

	     // movement SE
	     y = parseInt(squareArray[1]);
	     x = squareArray[0].charCodeAt(0)-97;
	 
	     while ( y > 1 && x < 7 ) {
		  y--;
		  x++;

		  // path is clear
		  if ( !( columnsName[x]+y in this.position ) )
		      possibleMoves.push(columnsName[x]+y);

		  // enemy piece
		  else if ( this.isEnemyPresent(columnsName[x]+y, square) ) {
		      possibleMoves.push(columnsName[x]+y); 
		      break;
		  }
		      
		  // friendly piece
		  else 
		      break;
	     }

	     // movement SW
	     y = parseInt(squareArray[1]);
	     x = squareArray[0].charCodeAt(0)-97;
	 
	     while ( y > 1 && x > 0 ) {
		  y--;
		  x--;

		  // path is clear
		  if ( !( columnsName[x]+y in this.position ) )
		      possibleMoves.push(columnsName[x]+y);

		  // enemy piece
		  else if ( this.isEnemyPresent(columnsName[x]+y, square) ) {
		      possibleMoves.push(columnsName[x]+y); 
		      break;
		  }
		      
		  // friendly piece
		  else 
		      break;
	     }
    
	 }

	 // KNIGHT
	 if ( this.position[square].toUpperCase() === "N" ) {
	     
	     // NE movement (2 steps N 1 step E)
	     y = parseInt(squareArray[1]);
	     x = squareArray[0].charCodeAt(0)-97;

	     if ( y < 7 && x < 7 ) { // square is in the board
		  y += 2;
		  x++;
		  
		  if ( !( columnsName[x]+y in this.position ) || this.isEnemyPresent(square, columnsName[x]+y) )
		      possibleMoves.push(columnsName[x]+y);
	     }
	     
	     // NW movement 
	     y = parseInt(squareArray[1]);
	     x = squareArray[0].charCodeAt(0)-97;

	     if ( y < 7 && x > 0 ) { // square is in the board
		  y += 2;
		  x--;
		  
		  if ( !( columnsName[x]+y in this.position ) || this.isEnemyPresent(square, columnsName[x]+y) )
		      possibleMoves.push(columnsName[x]+y);
	     }
	     
	     // EN movement 
	     y = parseInt(squareArray[1]);
	     x = squareArray[0].charCodeAt(0)-97;

	     if ( y < 8 && x < 6 ) { // square is in the board
		  y ++;
		  x += 2;
		  
		  if ( !( columnsName[x]+y in this.position ) || this.isEnemyPresent(square, columnsName[x]+y) )
		      possibleMoves.push(columnsName[x]+y);
	     }
	     
	     // WN movement 
	     y = parseInt(squareArray[1]);
	     x = squareArray[0].charCodeAt(0)-97;

	     if ( y < 8 && x > 1 ) { // square is in the board
		  y ++;
		  x -= 2;
		  
		  if ( !( columnsName[x]+y in this.position ) || this.isEnemyPresent(square, columnsName[x]+y) )
		      possibleMoves.push(columnsName[x]+y);
	     }
	     
	     // WS movement 
	     y = parseInt(squareArray[1]);
	     x = squareArray[0].charCodeAt(0)-97;

	     if ( y > 1 && x > 1 ) { // square is in the board
		  y --;
		  x -= 2;
		  
		  if ( !( columnsName[x]+y in this.position ) || this.isEnemyPresent(square, columnsName[x]+y) )
		      possibleMoves.push(columnsName[x]+y);
	     }
	     
	     // ES movement 
	     y = parseInt(squareArray[1]);
	     x = squareArray[0].charCodeAt(0)-97;

	     if ( y > 1 && x < 6 ) { // square is in the board
		  y --;
		  x += 2;
		  
		  if ( !( columnsName[x]+y in this.position ) || this.isEnemyPresent(square, columnsName[x]+y) )
		      possibleMoves.push(columnsName[x]+y);
	     }
	     
	     // SW movement 
	     y = parseInt(squareArray[1]);
	     x = squareArray[0].charCodeAt(0)-97;

	     if ( y > 2 && x > 0 ) { // square is in the board
		  y -= 2;
		  x --;
		  
		  if ( !( columnsName[x]+y in this.position ) || this.isEnemyPresent(square, columnsName[x]+y) )
		      possibleMoves.push(columnsName[x]+y);
	     }
	     
	     // SE movement 
	     y = parseInt(squareArray[1]);
	     x = squareArray[0].charCodeAt(0)-97;

	     if ( y > 2 && x < 7 ) { // square is in the board
		  y -= 2;
		  x ++;
		  
		  if ( !( columnsName[x]+y in this.position ) || this.isEnemyPresent(square, columnsName[x]+y) )
		      possibleMoves.push(columnsName[x]+y);
	     }
	 }
	 


	 // KING
	 if ( this.position[square].toUpperCase() === "K" ) {
	     
	     // N movement 
	     y = parseInt(squareArray[1]);
	     x = squareArray[0].charCodeAt(0)-97;

	     if ( y < 8 ) { // square is in the board
		  y ++;
		  
		  if ( !( columnsName[x]+y in this.position ) || this.isEnemyPresent(square, columnsName[x]+y) )
		      possibleMoves.push(columnsName[x]+y);
	     }
	     
	     // W movement 
	     y = parseInt(squareArray[1]);
	     x = squareArray[0].charCodeAt(0)-97;

	     if ( x > 0 ) { // square is in the board
		  x--;
		  
		  if ( !( columnsName[x]+y in this.position ) || this.isEnemyPresent(square, columnsName[x]+y) )
		      possibleMoves.push(columnsName[x]+y);
	     }
	     
	     // E movement 
	     y = parseInt(squareArray[1]);
	     x = squareArray[0].charCodeAt(0)-97;

	     if ( x < 7 ) { // square is in the board
		  x++;
		  
		  if ( !( columnsName[x]+y in this.position ) || this.isEnemyPresent(square, columnsName[x]+y) )
		      possibleMoves.push(columnsName[x]+y);
	     }
	     
	     // S movement 
	     y = parseInt(squareArray[1]);
	     x = squareArray[0].charCodeAt(0)-97;

	     if ( y > 1 ) { // square is in the board
		  y --;
		  
		  if ( !( columnsName[x]+y in this.position ) || this.isEnemyPresent(square, columnsName[x]+y) )
		      possibleMoves.push(columnsName[x]+y);
	     }
	     
	     // SW movement 
	     y = parseInt(squareArray[1]);
	     x = squareArray[0].charCodeAt(0)-97;

	     if ( y > 1 && x > 0 ) { // square is in the board
		  y --;
		  x --;
		  
		  if ( !( columnsName[x]+y in this.position ) || this.isEnemyPresent(square, columnsName[x]+y) )
		      possibleMoves.push(columnsName[x]+y);
	     }
	     
	     // SE movement 
	     y = parseInt(squareArray[1]);
	     x = squareArray[0].charCodeAt(0)-97;

	     if ( y > 1 && x < 7 ) { // square is in the board
		  y --;
		  x ++;
		  
		  if ( !( columnsName[x]+y in this.position ) || this.isEnemyPresent(square, columnsName[x]+y) )
		      possibleMoves.push(columnsName[x]+y);
	     }
	     
	     // NE movement 
	     y = parseInt(squareArray[1]);
	     x = squareArray[0].charCodeAt(0)-97;

	     if ( y < 8 && x < 7 ) { // square is in the board
		  y ++;
		  x ++;
		  
		  if ( !( columnsName[x]+y in this.position ) || this.isEnemyPresent(square, columnsName[x]+y) )
		      possibleMoves.push(columnsName[x]+y);
	     }
	     
	     // NW movement 
	     y = parseInt(squareArray[1]);
	     x = squareArray[0].charCodeAt(0)-97;

	     if ( y < 8 && x > 0 ) { // square is in the board
		  y ++;
		  x --;
		  
		  if ( !( columnsName[x]+y in this.position ) || this.isEnemyPresent(square, columnsName[x]+y) )
		      possibleMoves.push(columnsName[x]+y);
	     }
	 }


	 console.log(possibleMoves);
    },

    
    isEnemyPresent: function(s1, s2) {
	 var s1L = this.position[s1].toLowerCase();
	 var s2L = this.position[s2].toLowerCase();

	 if ( s1L === this.position[s1] ) {
	     if ( s2L === this.position[s2] ) {
		  return false;
	     }
	 }
	 else if ( s1L !== this.position[s1] ) {
	     if ( s2L !== this.position[s2] ) {
		  return false;
	     }
	 }

	 return true;
    },
}