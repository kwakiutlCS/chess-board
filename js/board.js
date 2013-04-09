$(document).ready(function() {
    game.startGame({ size: 400, player: "both", orientation: "white", turn: "white" });
        
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

    possibleMoves: [],

    passant: "-",

    promotionPending: false,

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

	 this.preparePromotion();
	 

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

	 // allow square selection and piece movement
	 $("#board").on("click", ".square", this.addBoardEvents);

	 
	 
    },

    preparePromotion: function() {
	 $("#table").append("<div id='promotionTable'><div>Promotion</div></div>");
	 $("#promotionTable").append("<div class='colorPromotionTable' id='whitePromotionTable'></div>");
	 $("#promotionTable").append("<div class='colorPromotionTable' id='blackPromotionTable'></div>");

	 $("#whitePromotionTable").append("<div class='promotionSquare' id='whitePromotionQueen' data-piece='Q'></div>");
	 $("#whitePromotionTable").append("<div class='promotionSquare' id='whitePromotionRook' data-piece='R'></div>");
	 $("#whitePromotionTable").append("<div class='promotionSquare' id='whitePromotionBishop' data-piece='B'></div>");
	 $("#whitePromotionTable").append("<div class='promotionSquare' id='whitePromotionKnight' data-piece='N'></div>");

	 $("#blackPromotionTable").append("<div class='promotionSquare' id='blackPromotionQueen' data-piece='q'></div>");
	 $("#blackPromotionTable").append("<div class='promotionSquare' id='blackPromotionRook' data-piece='r'></div>");
	 $("#blackPromotionTable").append("<div class='promotionSquare' id='blackPromotionBishop' data-piece='b'></div>");
	 $("#blackPromotionTable").append("<div class='promotionSquare' id='blackPromotionKnight' data-piece='n'></div>");

	 $("#promotionTable, .colorPromotionTable").hide();

	 
	 $("#promotionTable").on('click', '.promotionSquare', function() {
	     
	     var columnsName = ["a", "b", "c", "d", "e", "f", "g", "h", ];

	     for ( var i = 0; i < 8; i++ ) {
		  if ( game.position[columnsName[i]+"8"] === "P" ) {
		      var pSq = $(this);
		      game.position[columnsName[i]+"8"] = pSq.data("piece");
		      var square = $("#"+columnsName[i]+"8");
		      square.children().last().data("piece",  pSq.data("piece"));
		      square.children().removeClass("P").addClass(pSq.data("piece"));
		  }
		  else if ( game.position[columnsName[i]+"1"] === "p" ) {
		      var pSq = $(this);
		      game.position[columnsName[i]+"1"] = pSq.data("piece");
		      var square = $("#"+columnsName[i]+"1");
		      square.children().last().data("piece",  pSq.data("piece"));
		      square.children().removeClass("p").addClass(pSq.data("piece"));
		  }
	     }
	     
	     $("#board").on("click", ".square", game.addBoardEvents);
	     $("#promotionTable, #whitePromotionTable, #blackPromotionTable").hide();
	 });
    },
    

    addBoardEvents: function() {
	 var square = $(this);
	 var selectedSquare = $(".square.selected");
	 
	 // if piece selected and movement possible, move it
	 var end = square.attr("id");
	 var start = selectedSquare.attr("id");
	 
	 if ( selectedSquare.length === 1 && game.possibleMoves.indexOf(end) !== -1 ) {
	     game.movePiece(start, end);
	 }
	 

	 // select only squares with pieces and is player to move
	 else {
	     square.children().each( function(){
		  var piece = $(this);
		  if ( piece.hasClass("piece") && ( piece.data("color") === game.player || game.player === "both" ) && piece.data("color") === game.turn ) {
		      square.addClass("selected");
		      
		      // updates "possibleMoves" for selected piece
		      var nextTurn = game.turn === "white" ? "black" : "white";
		      start = square.attr("id");
		      
		      game.possibleMoves = game.filterIllegalMoves(start,game.getPossibleMoves(square.attr("id"), game.position),nextTurn);
		      
		      console.log(game.possibleMoves);
		  }
	     });
	 }

	 // remove selections
	 selectedSquare.removeClass("selected");
	     
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
		  $("#"+k).append("<div class='piece white "+this.position[k]+"' data-color='white' data-piece='"+this.position[k]+"'></div>");

	     // if piece is black
	     else 
		  $("#"+k).append("<div class='piece black "+this.position[k]+"' data-color='black' data-piece='"+this.position[k]+"'></div>");
	     
	 }
    },


    
    movePiece: function(start, end) {
	 
	 $(".previousEnd").removeClass("previousEnd");
	 $(".previousStart").removeClass("previousStart");
	 

	 // board update
	 
	 //en passant piece removal
	 if (this.position[start].toLowerCase() === "p" && end === this.passant ) {
	     
	     // if white
	     if ( this.position[start] === "P" ) {
		  $("#"+[end.split("")[0],5].join("")).children().remove();
	     }
	     // if black
	     else {
		  $("#"+[end.split("")[0],4].join("")).children().remove();
	     }

	 }
	 
	 var passant = this.passant;
	 // register passant square
	 if ( this.position[start] === "P" && start.split("")[1] === "2" && end.split("")[1] === "4" )
	     this.passant = end.split("")[0]+"3";
	 else if ( this.position[start] === "p" && start.split("")[1] === "7" && end.split("")[1] === "5" )
	     this.passant = end.split("")[0]+"6";
	 else 
	     this.passant = "-";

	 // register castling possibilities
	 if ( this.castling !== "-" ) {
	     if ( this.position[start] === "K" ) {
		  this.castling = this.castling.replace("K","");
		  this.castling = this.castling.replace("Q","");
		  
	     }
	     else if ( this.position[start] === "k" ) {
		  this.castling = this.castling.replace("k","");
		  this.castling = this.castling.replace("q","");
		  
	     }
	     else if ( start === "h1" )  this.castling = this.castling.replace("K","");
	     else if ( start === "h8" )  this.castling = this.castling.replace("k","");
	     else if ( start === "a1" )  this.castling = this.castling.replace("Q","");
	     else if ( start === "a8" )  this.castling = this.castling.replace("q","");
	 }

	 // board update

	 // castling 
	 if ( start === "e1" && this.position[start] === "K") {
	     if ( end === "g1" ) {
		  var rook = $("#h1").children().last().detach();
		  $("#f1").append(rook);
	     }
	     else if ( end === "c1" ) {
		  var rook = $("#a1").children().last().detach();
		  $("#d1").append(rook);
	     }
	     
	 } 
	 else if ( start === "e8" && this.position[start] === "k") {
	     if ( end === "g8" ) {
		  var rook = $("#h8").children().last().detach();
		  $("#f8").append(rook);
	     }
	     else if ( end === "c8" ) {
		  var rook = $("#a8").children().last().detach();
		  $("#d8").append(rook);
	     }
	     
	 } 


	 // game position
	 this.position = this.generateNewPosition(start, end, passant);
	 

	 // board update

	 // normal pick the piece
	 var start = $("#"+start);
	 var piece = start.children().each(function() {
	     var p = $(this);
	     if ( p.hasClass("piece") )
		  p.detach();
	 });
	 
	 // normal drop the piece
	 var endSquare = $("#"+end);
	 endSquare.children().remove();
	 endSquare.append(piece);

	 
	 // update turn
	 this.turn = this.turn === "white" ? "black" : "white";

	 // TODO
	 // update log

	 // register the move on the board
	 endSquare.addClass("previousEnd");
	 start.addClass("previousStart");
	 

	 // deals with promotions
	 if ( (end[1] === "8" && this.position[end] === "P") || (end[1] === "1" && this.position[end] === "p") ) {
	     $("#board").off("click", ".square");
	     $("#promotionTable").show();
	     
	     if ( end[1] === "1" ) {
		  $("#blackPromotionTable").show();
	     }
	     else
		  $("#whitePromotionTable").show();

	     
	 }
	 
    },
	 




    // deletes board and redraws it upside down
    rotateBoard: function() {
	 this.orientation = this.orientation === "white" ? "black" : "white";

	 $("#table").children().remove();

	 this.loadBoard();

	 this.drawPieces();

    },


    getPossibleMoves: function(square, pos) {
	 
	 var possibleMoves = [];

	 // pieces coordinates
	 var squareArray = square.split("");
	 var y, x;
	 var columnsName = ["a", "b", "c", "d", "e", "f", "g", "h", ];

	 
	 // ROOK
	 if ( pos[square].toUpperCase() === "R"  || pos[square].toUpperCase() === "Q" ) {
	     
	     // movement to the right
	     y = parseInt(squareArray[1]);
	     x = squareArray[0].charCodeAt(0)-97;
	 
	     while ( x < 7 ) {
		  x++;

		  // path is clear
		  if ( !( columnsName[x]+y in pos ) )
		      possibleMoves.push(columnsName[x]+y);

		  // enemy piece
		  else if ( this.isEnemyPresent(columnsName[x]+y, square, pos) ) {
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
		  if ( !( columnsName[x]+y in pos ) )
		      possibleMoves.push(columnsName[x]+y);

		  // enemy piece
		  else if ( this.isEnemyPresent(columnsName[x]+y, square, pos) ) {
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
		  if ( !( columnsName[x]+y in pos ) )
		      possibleMoves.push(columnsName[x]+y);

		  // enemy piece
		  else if ( this.isEnemyPresent(columnsName[x]+y, square, pos) ) {
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
		  if ( !( columnsName[x]+y in pos ) )
		      possibleMoves.push(columnsName[x]+y);

		  // enemy piece
		  else if ( this.isEnemyPresent(columnsName[x]+y, square, pos) ) {
		      possibleMoves.push(columnsName[x]+y); 
		      break;
		  }
		      
		  // friendly piece
		  else 
		      break;
	     }
    
	 }
	 

	 // BISHOP
	 if ( pos[square].toUpperCase() === "B"  || pos[square].toUpperCase() === "Q" ) {
	     
	     // movement to NE
	     y = parseInt(squareArray[1]);
	     x = squareArray[0].charCodeAt(0)-97;
	 
	     while ( x < 7 && y < 8) {
		  x++;
		  y++;

		  // path is clear
		  if ( !( columnsName[x]+y in pos ) )
		      possibleMoves.push(columnsName[x]+y);

		  // enemy piece
		  else if ( this.isEnemyPresent(columnsName[x]+y, square, pos) ) {
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
		  if ( !( columnsName[x]+y in pos ) )
		      possibleMoves.push(columnsName[x]+y);

		  // enemy piece
		  else if ( this.isEnemyPresent(columnsName[x]+y, square, pos) ) {
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
		  if ( !( columnsName[x]+y in pos ) )
		      possibleMoves.push(columnsName[x]+y);

		  // enemy piece
		  else if ( this.isEnemyPresent(columnsName[x]+y, square, pos) ) {
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
		  if ( !( columnsName[x]+y in pos ) )
		      possibleMoves.push(columnsName[x]+y);

		  // enemy piece
		  else if ( this.isEnemyPresent(columnsName[x]+y, square, pos) ) {
		      possibleMoves.push(columnsName[x]+y); 
		      break;
		  }
		      
		  // friendly piece
		  else 
		      break;
	     }
    
	 }

	 // KNIGHT
	 if ( pos[square].toUpperCase() === "N" ) {
	     
	     // NE movement (2 steps N 1 step E)
	     y = parseInt(squareArray[1]);
	     x = squareArray[0].charCodeAt(0)-97;

	     if ( y < 7 && x < 7 ) { // square is in the board
		  y += 2;
		  x++;
		  
		  if ( !( columnsName[x]+y in pos ) || this.isEnemyPresent(square, columnsName[x]+y, pos) )
		      possibleMoves.push(columnsName[x]+y);
	     }
	     
	     // NW movement 
	     y = parseInt(squareArray[1]);
	     x = squareArray[0].charCodeAt(0)-97;

	     if ( y < 7 && x > 0 ) { // square is in the board
		  y += 2;
		  x--;
		  
		  if ( !( columnsName[x]+y in pos ) || this.isEnemyPresent(square, columnsName[x]+y, pos) )
		      possibleMoves.push(columnsName[x]+y);
	     }
	     
	     // EN movement 
	     y = parseInt(squareArray[1]);
	     x = squareArray[0].charCodeAt(0)-97;

	     if ( y < 8 && x < 6 ) { // square is in the board
		  y ++;
		  x += 2;
		  
		  if ( !( columnsName[x]+y in pos ) || this.isEnemyPresent(square, columnsName[x]+y, pos) )
		      possibleMoves.push(columnsName[x]+y);
	     }
	     
	     // WN movement 
	     y = parseInt(squareArray[1]);
	     x = squareArray[0].charCodeAt(0)-97;

	     if ( y < 8 && x > 1 ) { // square is in the board
		  y ++;
		  x -= 2;
		  
		  if ( !( columnsName[x]+y in pos ) || this.isEnemyPresent(square, columnsName[x]+y, pos) )
		      possibleMoves.push(columnsName[x]+y);
	     }
	     
	     // WS movement 
	     y = parseInt(squareArray[1]);
	     x = squareArray[0].charCodeAt(0)-97;

	     if ( y > 1 && x > 1 ) { // square is in the board
		  y --;
		  x -= 2;
		  
		  if ( !( columnsName[x]+y in pos ) || this.isEnemyPresent(square, columnsName[x]+y, pos) )
		      possibleMoves.push(columnsName[x]+y);
	     }
	     
	     // ES movement 
	     y = parseInt(squareArray[1]);
	     x = squareArray[0].charCodeAt(0)-97;

	     if ( y > 1 && x < 6 ) { // square is in the board
		  y --;
		  x += 2;
		  
		  if ( !( columnsName[x]+y in pos ) || this.isEnemyPresent(square, columnsName[x]+y, pos) )
		      possibleMoves.push(columnsName[x]+y);
	     }
	     
	     // SW movement 
	     y = parseInt(squareArray[1]);
	     x = squareArray[0].charCodeAt(0)-97;

	     if ( y > 2 && x > 0 ) { // square is in the board
		  y -= 2;
		  x --;
		  
		  if ( !( columnsName[x]+y in pos ) || this.isEnemyPresent(square, columnsName[x]+y, pos) )
		      possibleMoves.push(columnsName[x]+y);
	     }
	     
	     // SE movement 
	     y = parseInt(squareArray[1]);
	     x = squareArray[0].charCodeAt(0)-97;

	     if ( y > 2 && x < 7 ) { // square is in the board
		  y -= 2;
		  x ++;
		  
		  if ( !( columnsName[x]+y in pos ) || this.isEnemyPresent(square, columnsName[x]+y, pos) )
		      possibleMoves.push(columnsName[x]+y);
	     }
	 }
	 


	 // KING
	 if ( pos[square].toUpperCase() === "K" ) {
	     
	     // N movement 
	     y = parseInt(squareArray[1]);
	     x = squareArray[0].charCodeAt(0)-97;

	     if ( y < 8 ) { // square is in the board
		  y ++;
		  
		  if ( !( columnsName[x]+y in pos ) || this.isEnemyPresent(square, columnsName[x]+y, pos) )
		      possibleMoves.push(columnsName[x]+y);
	     }
	     
	     // W movement 
	     y = parseInt(squareArray[1]);
	     x = squareArray[0].charCodeAt(0)-97;

	     if ( x > 0 ) { // square is in the board
		  x--;
		  
		  if ( !( columnsName[x]+y in pos ) || this.isEnemyPresent(square, columnsName[x]+y, pos) )
		      possibleMoves.push(columnsName[x]+y);
	     }
	     
	     // E movement 
	     y = parseInt(squareArray[1]);
	     x = squareArray[0].charCodeAt(0)-97;

	     if ( x < 7 ) { // square is in the board
		  x++;
		  
		  if ( !( columnsName[x]+y in pos ) || this.isEnemyPresent(square, columnsName[x]+y, pos) )
		      possibleMoves.push(columnsName[x]+y);
	     }
	     
	     // S movement 
	     y = parseInt(squareArray[1]);
	     x = squareArray[0].charCodeAt(0)-97;

	     if ( y > 1 ) { // square is in the board
		  y --;
		  
		  if ( !( columnsName[x]+y in pos ) || this.isEnemyPresent(square, columnsName[x]+y, pos) )
		      possibleMoves.push(columnsName[x]+y);
	     }
	     
	     // SW movement 
	     y = parseInt(squareArray[1]);
	     x = squareArray[0].charCodeAt(0)-97;

	     if ( y > 1 && x > 0 ) { // square is in the board
		  y --;
		  x --;
		  
		  if ( !( columnsName[x]+y in pos ) || this.isEnemyPresent(square, columnsName[x]+y, pos) )
		      possibleMoves.push(columnsName[x]+y);
	     }
	     
	     // SE movement 
	     y = parseInt(squareArray[1]);
	     x = squareArray[0].charCodeAt(0)-97;

	     if ( y > 1 && x < 7 ) { // square is in the board
		  y --;
		  x ++;
		  
		  if ( !( columnsName[x]+y in pos ) || this.isEnemyPresent(square, columnsName[x]+y, pos) )
		      possibleMoves.push(columnsName[x]+y);
	     }
	     
	     // NE movement 
	     y = parseInt(squareArray[1]);
	     x = squareArray[0].charCodeAt(0)-97;

	     if ( y < 8 && x < 7 ) { // square is in the board
		  y ++;
		  x ++;
		  
		  if ( !( columnsName[x]+y in pos ) || this.isEnemyPresent(square, columnsName[x]+y, pos) )
		      possibleMoves.push(columnsName[x]+y);
	     }
	     
	     // NW movement 
	     y = parseInt(squareArray[1]);
	     x = squareArray[0].charCodeAt(0)-97;

	     if ( y < 8 && x > 0 ) { // square is in the board
		  y ++;
		  x --;
		  
		  if ( !( columnsName[x]+y in pos ) || this.isEnemyPresent(square, columnsName[x]+y, pos) )
		      possibleMoves.push(columnsName[x]+y);
	     }

	     // castling moves
	     // white king
	     /*if ( pos[square] === "K" ) {
		  if  ( this.castling.indexOf("K") !== -1 && !this.areSquaresAttacked(["e1","f1","g1"],"black") && !("f1" in pos) && !("g1" in pos) )
		      possibleMoves.push("g1");
		  if ( this.castling.indexOf("Q") !== -1 && !this.areSquaresAttacked(["e1","d1","c1"],"black") && !("c1" in pos) && !("d1" in pos) && !("b1" in pos) )
		      possibleMoves.push("c1");
	     }
	     else if ( pos[square] === "k" ) {
		  if  ( this.castling.indexOf("k") !== -1  && !this.areSquaresAttacked(["e8","f8","g8"],"white") && !("f8" in pos) && !("g8" in pos) )
		      possibleMoves.push("g8");
		  if ( this.castling.indexOf("q") !== -1 && !this.areSquaresAttacked(["e8","d8","c8"],"white") && !("c8" in pos) && !("d8" in pos) && !("b8" in pos) )
		      possibleMoves.push("c8");
	     }*/
	     
	     
	 }


	 // WHITE PAWN
	 if ( pos[square] === "P" ) {
	     
	     y = parseInt(squareArray[1]);
	     x = squareArray[0].charCodeAt(0)-97;

	     // 2 squares ahead
	     if ( y === 2 && !( columnsName[x]+"4" in pos ) ) {
		  possibleMoves.push(columnsName[x]+"4");
	     }
	     
	     // 1 square ahead
	     if ( !( columnsName[x]+(y+1) in pos ) ) {
		  possibleMoves.push(columnsName[x]+(y+1));
	     }

	     // takes right
	     if ( x < 7 && ( this.isEnemyPresent(square, columnsName[x+1]+(y+1), pos) || this.passant === columnsName[x+1]+(y+1) )) {
		  possibleMoves.push(columnsName[x+1]+(y+1));
	     }
	     
	     // takes left
	     if ( x > 0 && ( this.isEnemyPresent(square, columnsName[x-1]+(y+1), pos) || this.passant === columnsName[x-1]+(y+1) )) {
		  possibleMoves.push(columnsName[x-1]+(y+1));
	     }
	     
	 }


	 // LEFT PAWN
	 if ( pos[square] === "p" ) {
	     
	     y = parseInt(squareArray[1]);
	     x = squareArray[0].charCodeAt(0)-97;

	     // 2 squares ahead
	     if ( y === 7 && !( columnsName[x]+"5" in pos ) ) {
		  possibleMoves.push(columnsName[x]+"5");
	     }
	     
	     // 1 square ahead
	     if ( !( columnsName[x]+(y-1) in pos ) ) {
		  possibleMoves.push(columnsName[x]+(y-1));
	     }

	     // takes left
	     if ( x < 7 && ( this.isEnemyPresent(square, columnsName[x+1]+(y-1), pos) || this.passant === columnsName[x+1]+(y+-1) )) {
		  possibleMoves.push(columnsName[x+1]+(y-1));
	     }
	     
	     // takes right
	     if ( x > 0 && ( this.isEnemyPresent(square, columnsName[x-1]+(y-1), pos) || this.passant === columnsName[x-1]+(y-1) )) {
		  possibleMoves.push(columnsName[x-1]+(y-1));
	     }
	     
	 }

	 
	 return possibleMoves;
    },

    
    // returns a copy of current position
    copyPosition: function(position) {
	 var pos = {};
	 
	 for ( var i in position )
	     pos[i] = position[i];
	 
	 return pos;

    },

    



    // returns a copy of current position after a move
    generateNewPosition: function(start, end, passant) {
	 var pos = this.copyPosition(this.position);
	 

	 // replaces piece position
	 pos[end] = pos[start];
	 delete pos[start];
	 
	 // deletes en passant pawn
	 if ( end === passant ) {
	     var endArray = end.split("");
	     if ( this.turn === "white" ) 
		  delete pos[[end[0],parseInt(end[1])-1].join("")];
	     else
		  delete pos[[end[0],parseInt(end[1])+1].join("")];
	 }

	 // deals with castling
	 if ( start === "e1" && end === "g1" && pos[end] === "K" ) {
	     pos["f1"] = "R";
	     delete pos["h1"];
	 }
	 else if ( start === "e1" && end === "c1" && pos[end] === "K" ) {
	     pos["d1"] = "R";
	     delete pos["a1"];
	 }
	 else if ( start === "e8" && end === "g8" && pos[end] === "k" ) {
	     pos["f8"] = "r";
	     delete pos["h8"];
	 }
	 else if ( start === "e8" && end === "c8" && pos[end] === "k" ) {
	     pos["d8"] = "r";
	     delete pos["a8"];
	 }
	 
	 return pos;
    },


    // checks if position is legal - if white is to move and black king is already in check or vice versa
    isPositionLegal: function(position,turn) {
	 
	 // gets king position
	 var kingPosition;
	 for ( var k in position ) {
	     if ( (turn === "black" && position[k] === "K") || (turn === "white" && position[k] === "k") ) {
		  kingPosition = k;
		  break;
	     }
	 }
	 
	 
	 for ( var k in position ) {
	 
	     var moves = [];

	     // select pieces only from current color
	     if ( turn === "white" && position[k] === position[k].toUpperCase() ) {
		  moves = this.getPossibleMoves(k, position);
	     }
	     else if ( turn === "black" && position[k] === position[k].toLowerCase() ) {
		  moves = this.getPossibleMoves(k, position);
	     }

	     // if king is attacked
	     if ( moves.indexOf(kingPosition) !== -1 )
		  return false;
	 }

	 // king not attacked
	 return true;

    },
    

    // remove illegal moves from possible moves
    filterIllegalMoves: function(start,moves,turn) {
	var possible = [];

	for ( var m in moves ) {
	    // register king square
	    if ( this.position[start] === "K" || this.position[start] === "k" ) {
		var kingSquare = moves[m];
	    }
	    else {
		//if king to watch is white
		if ( turn === "black" ) {
		    for ( var k in this.position ) {
			if ( this.position[k] === "K" ) {
			    var kingSquare = k;
			    break;
			}
		    }
		}
		//if king to watch is black
		else {
		    for ( var k in this.position ) {
			if ( this.position[k] === "k" ) {
			    var kingSquare = k;
			    break;
			}
		    }
		}
		
	    }
	    
	    // if king is attacked
	    var pos = this.generateNewPosition(start,moves[m],this.passant);
	    if ( !this.areSquaresAttacked([kingSquare],turn,pos) )
		possible.push(moves[m]);
	}

	return possible;
    },

    
    // helper function to know if move is illegal
    areSquaresAttacked: function(squares, color,pos) {
	
	var columnsName = ["a", "b", "c", "d", "e", "f", "g", "h", ];

	for ( var sq in squares ) {
	    
	    var sqArray = squares[sq].split("");

	    // North attack
	    var x = sqArray[0];
	    var y = parseInt(sqArray[1]);
	    while ( y < 8 ) {
		
		y++;
		
		var newSq = [x,y].join("");
		// piece on the position
		if ( newSq in pos ) {
		    // friendly piece
		    if ( !(this.isEnemyPresent(squares[sq], newSq, pos) ) ) {
			break;
		    }

		    // enemy piece
		    else {
			if ( pos[newSq].toUpperCase() === "R" || pos[newSq].toUpperCase() === "Q" || ( pos[newSq].toUpperCase() === "K" && y-parseInt(sqArray[1]) === 1 ) ) {
			    return true;
			}
			break;
		    }
		}
	    }

	    // South attack
	    var x = sqArray[0];
	    var y = parseInt(sqArray[1]);
	    while ( y > 1 ) {
		
		y--;

		var newSq = [x,y].join("");
		// piece on the position
		if ( newSq in pos ) {
		    // friendly piece
		    if ( !(this.isEnemyPresent(squares[sq], newSq, pos) ) ) {
			break;
		    }

		    // enemy piece
		    else {
			if ( pos[newSq].toUpperCase() === "R" || pos[newSq].toUpperCase() === "Q" || ( pos[newSq].toUpperCase() === "K" && y-parseInt(sqArray[1]) === -1 ) ) {
			    return true;
			}
			break;
		    }
		}
	    }

	    // East attack
	    var x = sqArray[0].charCodeAt(0)-97;
	    var y = sqArray[1];
	    while ( x < 7 ) {
		
		x++;

		var newSq = [columnsName[x],y].join("");
		// piece on the position
		if ( newSq in pos ) {
		    // friendly piece
		    if ( !(this.isEnemyPresent(squares[sq], newSq, pos) ) ) {
			break;
		    }

		    // enemy piece
		    else {
			if ( pos[newSq].toUpperCase() === "R" || pos[newSq].toUpperCase() === "Q" || ( pos[newSq].toUpperCase() === "K" && x-(sqArray[0].charCodeAt(0)-97) === 1 ) ) {
			    return true;
			}
			break;
		    }
		}
	    }
			    

	    // West attack
	    var x = sqArray[0].charCodeAt(0)-97;
	    var y = sqArray[1];

	    while ( x > 0 ) {
		
		x--;

		var newSq = [columnsName[x],y].join("");
		// piece on the position
		if ( newSq in pos ) {
		    // friendly piece
		    if ( !(this.isEnemyPresent(squares[sq], newSq, pos) ) ) {
			break;
		    }

		    // enemy piece
		    else {
			if ( pos[newSq].toUpperCase() === "R" || pos[newSq].toUpperCase() === "Q" || ( pos[newSq].toUpperCase() === "K" && x-(sqArray[0].charCodeAt(0)-97) === -1 ) ) {
			    return true;
			}
			break;
		    }
		}
	    }

	    // NorthEast attack
	    var x = sqArray[0].charCodeAt(0)-97;
	    var y = parseInt(sqArray[1]);

	    while ( x < 7 && y < 8) {
		
		x++;
		y++;

		var newSq = [columnsName[x],y].join("");
		// piece on the position
		if ( newSq in pos ) {
		    // friendly piece
		    if ( !(this.isEnemyPresent(squares[sq], newSq, pos) ) ) {
			break;
		    }

		    // enemy piece
		    else {
			if ( pos[newSq].toUpperCase() === "B" || pos[newSq].toUpperCase() === "Q" || ( pos[newSq].toUpperCase() === "K" && x-(sqArray[0].charCodeAt(0)-97) === 1 ) || ( pos[newSq] === "p" && x-(sqArray[0].charCodeAt(0)-97) === 1 ) ) {
			    return true;
			}
			break;
		    }
		}
	    }

	    // NorthWest attack
	    var x = sqArray[0].charCodeAt(0)-97;
	    var y = parseInt(sqArray[1]);

	    while ( x > 0 && y < 8) {
		
		x--;
		y++;

		var newSq = [columnsName[x],y].join("");
		// piece on the position
		if ( newSq in pos ) {
		    // friendly piece
		    if ( !(this.isEnemyPresent(squares[sq], newSq, pos) ) ) {
			break;
		    }

		    // enemy piece
		    else {
			if ( pos[newSq].toUpperCase() === "B" || pos[newSq].toUpperCase() === "Q" || ( pos[newSq].toUpperCase() === "K" && x-(sqArray[0].charCodeAt(0)-97) === -1 ) || ( pos[newSq] === "p" && x-(sqArray[0].charCodeAt(0)-97) === -1 ) ) {
			    return true;
			}
			break;
		    }
		}
	    }

	    // SouthWest attack
	    var x = sqArray[0].charCodeAt(0)-97;
	    var y = parseInt(sqArray[1]);

	    while ( x > 0 && y > 1) {
		
		x--;
		y--;

		var newSq = [columnsName[x],y].join("");
		// piece on the position
		if ( newSq in pos ) {
		    // friendly piece
		    if ( !(this.isEnemyPresent(squares[sq], newSq, pos) ) ) {
			break;
		    }

		    // enemy piece
		    else {
			if ( pos[newSq].toUpperCase() === "B" || pos[newSq].toUpperCase() === "Q" || ( pos[newSq].toUpperCase() === "K" && x-(sqArray[0].charCodeAt(0)-97) === -1 ) || ( pos[newSq] === "P" && x-(sqArray[0].charCodeAt(0)-97) === -1 ) ) {
			    return true;
			}
			break;
		    }
		}
	    }
	
	    // SouthEast attack
	    var x = sqArray[0].charCodeAt(0)-97;
	    var y = parseInt(sqArray[1]);

	    while ( x < 7 && y > 1) {
		
		x++;
		y--;

		var newSq = [columnsName[x],y].join("");
		// piece on the position
		if ( newSq in pos ) {
		    // friendly piece
		    if ( !(this.isEnemyPresent(squares[sq], newSq, pos) ) ) {
			break;
		    }

		    // enemy piece
		    else {
			if ( pos[newSq].toUpperCase() === "B" || pos[newSq].toUpperCase() === "Q" || ( pos[newSq].toUpperCase() === "K" && x-(sqArray[0].charCodeAt(0)-97) === 1 ) || ( pos[newSq] === "P" && x-(sqArray[0].charCodeAt(0)-97) === 1 ) ) {
			    return true;
			}
			break;
		    }
		}
	    }

	    
	    // Knight attacks
	    var x = sqArray[0].charCodeAt(0)-97;
	    var y = parseInt(sqArray[1]);

	    // white knight
	    if ( color === "white" ) {
		for ( var k in pos ) {
		    if ( pos[k] === "N" ) {
			if ( [columnsName[x+1],y+2].join("") === k || [columnsName[x-1],y+2].join("") === k || [columnsName[x+2],y+1].join("") === k || [columnsName[x-2],y+1].join("") === k || [columnsName[x+2],y-1].join("") === k || [columnsName[x-2],y-1].join("") === k || [columnsName[x-1],y-2].join("") === k || [columnsName[x-1],y+2].join("") === k )
			    return true;

		    }
		}
	    }
	    // black knight
	    else  {
		for ( var k in pos ) {
		    if ( pos[k] === "n" ) {
			if ( [columnsName[x+1],y+2].join("") === k || [columnsName[x-1],y+2].join("") === k || [columnsName[x+2],y+1].join("") === k || [columnsName[x-2],y+1].join("") === k || [columnsName[x+2],y-1].join("") === k || [columnsName[x-2],y-1].join("") === k || [columnsName[x-1],y-2].join("") === k || [columnsName[x-1],y+2].join("") === k )
			    return true;

		    }
		}
	    }
	}
	
	
	return false;
    },


    // checks if enemy pieces are present at given squares 
    isEnemyPresent: function(s1, s2, pos) {
	 
	 // if no piece is present at location 
	 if ( !(s1 in pos && s2 in pos) )
	     return false;

	 // lower case piece version
	 var s1L = pos[s1].toLowerCase();
	 var s2L = pos[s2].toLowerCase();

	 // if piece are the same color
	 if ( s1L === pos[s1] ) {
	     if ( s2L === pos[s2] ) {
		  return false;
	     }
	 }
	 else if ( s1L !== pos[s1] ) {
	     if ( s2L !== pos[s2] ) {
		  return false;
	     }
	 }

	 // if piece are different
	 return true;
    },
}


