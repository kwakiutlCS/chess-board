var chessBoard = {

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

    lastMove: [],

    label: false,

    container: "chessBoardHolder",

    gameHistoryContainer: "gameHistoryDiv",

    type: "game",
    
    lines: [],

    cursor: 0,


    ///////////////////////////////////////////////////////////////////////////////
    //
    //                   functions from board api
    //
    ///////////////////////////////////////////////////////////////////////////////
    



    // function called to initialize the board
    
    // it takes as parameters an object with the optionals keys:
    // size -> size in pixels for the board width and height ( not counting the labels ), defaults to 400px
    // player -> pieces that users are allowed to move, "white", "black" or "both", defaults to  white
    // orientation -> perspective which the board is seen "white" or "black", defaults to player moving perspective
    // label -> true or false sets the names of rows and columns, defaults to false
    // fen -> fen string describing the position, defaults to initial chess position
    // lastMove -> array or string describing last move played i.e. ["e2","e4"] or "e2 e4"
    // container -> div id where  to put the board, defaults to "chessBoardHolder"
    startChessBoard: function(params) {

	 // allows default values 
	 if ( "fen" in params && params["fen"])
	     this.fen = params["fen"];

	 if ( "size" in params )
	     this.size = params["size"];

	 if ( "player" in params )
	     this.player = params["player"];

	 if ( "orientation" in params )
	     this.orientation = params["orientation"];
	 else if ( this.player === "black" )
	     this.orientation = "black";

	 if ( "label" in params )
	     this.label = params["label"];

	 if ( "lastMove" in params && params["lastMove"] ) {
	     if ( Object.prototype.toString.call( params["lastMove"] ) === '[object Array]' ) 
		  this.lastMove = params["lastMove"];
	     else 
		  this.lastMove = params["lastMove"].split(" ");
	 }

	 if ( "container" in params )
	     this.container = params["container"];

	 if ( "type" in params )
	     this.type = params["type"];

	 if ( "lines" in params )
	     this.lines = params["lines"];


	 // gets board and piece position in log
	 this.getInitialPosition();

	 this.prepareTable();

	 this.loadBoard();

	 this.addLabel();
	 
	 this.preparePromotion();
	 
	 // allow board rotation
	 /*$(document).on("keypress", function() {
	     chessBoard.rotateBoard();
	 });*/

	 this.drawPieces();

	 
    },



      


    // gets the game result in the board
    // if it's checkmate returns a string "black" or "white" depending on who won
    // if it's a stalemate returns "draw"
    // draw by repetion not yet implemented
    // else returns "active"

    getResult: function(position, turn, passant) {
	 if (typeof position === "undefined")
	     position = this.position;
	 if (typeof turn === "undefined")
	     turn = this.turn;
	 if (typeof passant === "undefined")
	     passant = this.passant;
	 
	 
	 // return "draw" if bare kings
	 var draw = true;
	 for (var k in position) {
	     if (position[k].toUpperCase() !== "K") {
		  draw = false;
		  break;
	     }
	 }
	 if (draw)
	     return "draw";

	 if (turn === "black") {
	     
	     // black king square
	     var kingSquare;
	     for (var k in position) {
		  if (position[k] === "k") {
		      kingSquare = k;
		      break;
		  }
	     }
	     
	     //check if there is a saving move
	     var moves;

	     for ( var k in position ) {
		  
		  // get all the black pieces
		  if (position[k].toLowerCase() === position[k] ) {
		      moves = this.filterIllegalMoves(k, this.getPossibleMoves(k, position), "white",position, passant);
		      
		      if ( moves.length !== 0 )
			   return "active";
		  }
	     }
	     
	     // if black king is attacked
	     if ( this.areSquaresAttacked([kingSquare], "white", position) ) {
		  return "white";
	     }
	     // if king is not attacked
	     else {
		  return "draw";
	     }
	 }

	 else {
	     
	     // white king square
	     var kingSquare;
	     for ( var k in position ) {
		  if (position[k] === "K" ) {
		      kingSquare = k;
		      break;
		  }
	     }
	     
	     
	     //check if there is a saving move
	     var moves;

	     for ( var k in position ) {
		  // get all the white pieces
		  if (position[k].toUpperCase() === position[k] ) {
		      moves = this.filterIllegalMoves(k, this.getPossibleMoves(k, position), "black", position, passant);
		      if ( moves.length !== 0 )
			   return "active";
		  }
	     }
	     
	     
	     // if black king is attacked
	     if ( this.areSquaresAttacked([kingSquare],"black", position) ) {
		  return "black";
	     }
	     // if king is not attacked
	     else {
		  return "draw";
	     }
	 }
    },




    // returns the fen string representing the game position
    // moves number not yet implemented
    getFen: function() {
	 
	 var fen = "";
	 
	 var columnsName = ["a", "b", "c", "d", "e", "f", "g", "h"];
	 
	 // writes the position
	 for ( var i = 8; i > 0; i-- ) {
	     
	     counter = 0;
	     for ( var j = 0; j < 8; j++ ) {
		  
		  if ( columnsName[j]+i in this.position ) {
		      if ( counter ) {
			   fen += counter;
			   counter = 0
		      }
		      fen += this.position[columnsName[j]+i];
		  }
		  else {
		      counter += 1;
		  }
	     }	  
	
	     if ( counter )
		  fen += counter;
	     if ( i !== 1) 
		  fen += "/"	     
	 } 

	 // writes turn
	 var turn = this.turn === "white" ? "w" : "b";
	 fen += " "+turn;

	 // writes castling
	 fen += " "+this.castling;

	 // writes passant
	 fen += " "+this.passant;

	 // writes number of moves 
	 // TODO
	 fen += " 0 1";
	 
	 return fen;
    },



    // returns the last move played as a string p.e. "e2 e4"
    getLastMove: function() {
	 if ( this.lastMove.length === 0 )
	     return false;
	 return this.lastMove.join(" ");

    },



    ///////////////////////////////////////////////////////////////////////////////////////////
    //
    //                       helper functions not called directly by the web page
    //
    ///////////////////////////////////////////////////////////////////////////////////////////
    


    completePuzzle: function() {
	 var moved = false;
	 
	 var newLines = [];

	 // checks if a acceptable move was made
	 for ( var l in this.lines ) {

	     var line = this.lines[l];

	     if (line[0][0] === this.lastMove[0] && line[0][1] === this.lastMove[1] ) {
		  
		  // checks if puzzle is complete
		  if ( line.length === 1 ) {
		      this.lines = "solved";
		      try {
			   updatePageAfterChessBoardMove();
		      }
		      catch(e) {
			   
		      }
		      return;
		  }

		  // if not completed and not moved, move opponent
		  if ( !moved ) {
		      moved = true;
		      try {
			   updatePageAfterChessBoardMove();
		      }
		      catch(e) {
		      }
		      chessBoard.movePiece(line[1][0],line[1][1]);
		      
		  }
		  
		  // update possible lines
		  newLines.push(line.slice(2));
	     }
	     
	 }

	 if ( !moved ) {
	     this.lines = "failed";
	     try {
		  updatePageAfterChessBoardMove();
	     }
	     catch(e) {
		  
	     }
	     return;
	 }
	 this.lines = newLines;
	 
    },

    
    getPuzzleResult: function() {
	 if ( typeof this.lines !== "string" ) {
	     return "active";
	 }
	 else {
	     return this.lines;
	 }
    },
	 
    

    prepareTable: function() {
	 $("#"+this.container).append("<div id='chessBoardGameTable'></div>");
	 $("#chessBoardGameTable").css({ width: this.size, height: this.size });
    },

    
    loadBoard: function() {
	 
	 $("#chessBoardGameTable").append("<div id='chessBoardGameBoard'></div>");
    
	 // draw squares
	 this.drawSquares(this.size/8);

	 // last moves marked on the board
	 if ( this.lastMove.length === 2 ) {
	     $("#"+this.lastMove[1]).addClass("chessBoardPreviousEnd");
	     $("#"+this.lastMove[0]).addClass("chessBoardPreviousStart");
	 }
 
	 // allow square selection and piece movement
	 $("#chessBoardGameBoard").on("click", ".chessBoardSquare", this.addBoardEvents);
	 	 
	 // game replay
	 var chessBoard = this;
	 $("#"+this.gameHistoryContainer).on("click",".nextMove", function(){
	     chessBoard.moveHistory(1);
	 });
	 $("#"+this.gameHistoryContainer).on("click",".previousMove", function(){
	     chessBoard.moveHistory(-1);
	 });
    },

    preparePromotion: function() {
	 $("#chessBoardGameTable").append("<div id='chessBoardPromotionTable' class='chessBoardText'><div>Promotion</div></div>");
	 $("#chessBoardPromotionTable").append("<div class='chessBoardColorPromotionTable' id='whitePromotionTable'></div>");
	 $("#chessBoardPromotionTable").append("<div class='chessBoardColorPromotionTable' id='blackPromotionTable'></div>");

	 $("#whitePromotionTable").append("<div class='chessBoardPromotionSquare' id='whitePromotionQueen' data-piece='Q'></div>");
	 $("#whitePromotionTable").append("<div class='chessBoardPromotionSquare' id='whitePromotionRook' data-piece='R'></div>");
	 $("#whitePromotionTable").append("<div class='chessBoardPromotionSquare' id='whitePromotionBishop' data-piece='B'></div>");
	 $("#whitePromotionTable").append("<div class='chessBoardPromotionSquare' id='whitePromotionKnight' data-piece='N'></div>");

	 $("#blackPromotionTable").append("<div class='chessBoardPromotionSquare' id='blackPromotionQueen' data-piece='q'></div>");
	 $("#blackPromotionTable").append("<div class='chessBoardPromotionSquare' id='blackPromotionRook' data-piece='r'></div>");
	 $("#blackPromotionTable").append("<div class='chessBoardPromotionSquare' id='blackPromotionBishop' data-piece='b'></div>");
	 $("#blackPromotionTable").append("<div class='chessBoardPromotionSquare' id='blackPromotionKnight' data-piece='n'></div>");

 $("#chessBoardPromotionTable, .chessBoardColorPromotionTable").hide();

	 
	 $("#chessBoardPromotionTable").on('click', '.chessBoardPromotionSquare', function() {
	     
	     var columnsName = ["a", "b", "c", "d", "e", "f", "g", "h", ];

	     for ( var i = 0; i < 8; i++ ) {
		  if ( chessBoard.position[columnsName[i]+"8"] === "P" ) {
		      var pSq = $(this);
		      chessBoard.position[columnsName[i]+"8"] = pSq.data("piece");
		      var square = $("#"+columnsName[i]+"8");
		      square.children().last().data("piece",  pSq.data("piece"));
		      square.children().removeClass("chessBoardP").addClass("chessBoard"+pSq.data("piece"));
		  }
		  else if ( chessBoard.position[columnsName[i]+"1"] === "p" ) {
		      var pSq = $(this);
		      chessBoard.position[columnsName[i]+"1"] = pSq.data("piece");
		      var square = $("#"+columnsName[i]+"1");
		      square.children().last().data("piece",  pSq.data("piece"));
		      square.children().removeClass("chessBoardp").addClass("chessBoard"+pSq.data("piece"));
		  }
	     }
	     
	     $("#chessBoardGameBoard").on("click", ".chessBoardSquare", chessBoard.addBoardEvents);
	     // activate deactivate dragging
	     if ( chessBoard.turn === "white" ) {
		  $(".chessBoardPiece.white").draggable("enable");
	     }
	     else {
		  $(".chessBoardPiece.black").draggable("enable");
	     }
	     $("#chessBoardPromotionTable, #whitePromotionTable, #blackPromotionTable").hide();
	     /*$(document).on("keypress", function() {
		  chessBoard.rotateBoard();
	     });*/

	     // update result
	     chessBoard.result = chessBoard.getResult(this.position, this.turn, this.passant);
	     if ( chessBoard.result !== "active" ) {
		  $("#chessBoardGameBoard").off("click", ".chessBoardSquare");
		  $(".chessBoardPiece").draggable("disable");
	     }
	     
	     try {
		  updatePageAfterChessBoardMove();
	     }
	     catch(e) {
	     }
	 });
    },
    

    addLabel: function() {
	 
	 var columnsName = ["a", "b", "c", "d", "e", "f", "g", "h", ];

	 $("#chessBoardGameTable").append("<div id='chessBoardVerticalLabel'><div>");
	 $("#chessBoardGameTable").append("<div id='chessBoardHorizontalLabel'><div>");
	     
	 if ( this.orientation === "white" ) {
	     for ( var i = 8; i > 0; i--) 
		  $("#chessBoardVerticalLabel").append("<div class='chessBoardText chessBoardVerticalLabelSquare'>"+i+"</div>");
	     for ( var i = 0; i < 8; i++) 
		  $("#chessBoardHorizontalLabel").append("<div class='chessBoardText chessBoardHorizontalLabelSquare'>"+columnsName[i]+"</div>");
	 }
	 else {
	     for ( var i = 1; i < 9; i++) 
		  $("#chessBoardVerticalLabel").append("<div class='chessBoardText chessBoardVerticalLabelSquare'>"+i+"</div>");
	     for ( var i = 7; i >= 0; i--) 
		  $("#chessBoardHorizontalLabel").append("<div class='chessBoardText chessBoardHorizontalLabelSquare'>"+columnsName[i]+"</div>");
	 }

	 if (!this.label) 
	     $("#chessBoardVerticalLabel, #chessBoardHorizontalLabel").addClass("chessBoardHidden");
    },


    addBoardEvents: function() {
	 var square = $(this);
	 var selectedSquare = $(".chessBoardSquare.chessBoardSelectedSquare");
	 
	 // if piece selected and movement possible, move it
	 var end = square.attr("id");
	 var start = selectedSquare.attr("id");
	 
	 if ( selectedSquare.length === 1 && chessBoard.possibleMoves.indexOf(end) !== -1 ) {
	     chessBoard.movePiece(start, end);
	 }
	 

	 // select only squares with pieces and is player to move
	 else {
	     square.children().each( function(){
		  var piece = $(this);
		  if ( piece.hasClass("chessBoardPiece") && ( piece.data("color") === chessBoard.player || chessBoard.player === "both" ) && piece.data("color") === chessBoard.turn ) {
		      square.addClass("chessBoardSelectedSquare");
		      
		      // updates "possibleMoves" for selected piece
		      var nextTurn = chessBoard.turn === "white" ? "black" : "white";
		      start = square.attr("id");
		      
		      chessBoard.possibleMoves = chessBoard.filterIllegalMoves(start,chessBoard.getPossibleMoves(start, chessBoard.position),nextTurn, chessBoard.position, chessBoard.passant);
		      
		     
		  }
	     });
	 }

	 // remove selections
        if (chessBoard.type !== "selection")
	     selectedSquare.removeClass("chessBoardSelectedSquare");

	 if (chessBoard.type === "selection") {
	     square.toggleClass("keySquare");
	 }
	 
	     
    },

    drawSquares: function(squareSize) {

	 var columnsName = ["a", "b", "c", "d", "e", "f", "g", "h", ];

	 for ( var i = 1; i < 9; i++ ) {

	     // 8 squares per row
	     for ( var j = 0; j < 8; j++ ) {
	     
		  // append a square to the board depending on the orientation
		  if ( this.orientation === "white" )
		      $("#chessBoardGameBoard").append("<div class='chessBoardSquare' id='"+columnsName[j]+i+"'></div>");
		  else
		      $("#chessBoardGameBoard").append("<div class='chessBoardSquare' id='"+columnsName[7-j]+(9-i)+"'></div>");

		  // choose square position
		  $(".chessBoardSquare").last().css( { left:j*squareSize, top: (8-i)*squareSize } );

		  // choose square color

		  if ( (i+j)%2 ) 
		      $(".chessBoardSquare").last().addClass("chessBoardDarkSquare");
		  else
		      $(".chessBoardSquare").last().addClass("chessBoardLightSquare");
	     }
		  
	 }
	   

   
    }, 


    getInitialPosition: function() {

	 var fenArray = this.fen.split(" ");

	 var position = fenArray[0].split("/");

	 this.castling = fenArray[2];
	 
	 this.passant = fenArray[3];
	 
	 this.turn = fenArray[1] === "w" ? "white" : "black";
	 

	 // TODO
	 //moves info

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
		  $("#"+k).append("<div class='chessBoardPiece white chessBoard"+this.position[k]+"' data-color='white' data-piece='"+this.position[k]+"'></div>");

	     // if piece is black
	     else 
		  $("#"+k).append("<div class='chessBoardPiece black chessBoard"+this.position[k]+"' data-color='black' data-piece='"+this.position[k]+"'></div>");
	     
	 }

	 $(".chessBoardPiece").draggable( { containment: "#chessBoardGameBoard", revert: true, zIndex: 5, revertDuration: 0, distance: 10 } );

	 $("#chessBoardGameBoard").on("dragstart", ".chessBoardPiece", function() {
	     var square = $(this).parent();
	     
	     // updates "possibleMoves" for selected piece
	     var nextTurn = chessBoard.turn === "white" ? "black" : "white";
	     var start = square.attr("id");
	     
	     chessBoard.possibleMoves = chessBoard.filterIllegalMoves(start,chessBoard.getPossibleMoves(start, chessBoard.position),nextTurn, chessBoard.position, chessBoard.passant);
	     
	     $(".chessBoardSelectedSquare").removeClass("chessBoardSelectedSquare");
	     
	 });

	 $("#chessBoardGameBoard").on("dragstop", ".chessBoardSquare", function(evt, ui) {
	     
	     var columnsName = ["a", "b", "c", "d", "e", "f", "g", "h", ];

	     var start = $(this).attr("id").split("");
	     start[0] = start[0].charCodeAt(0)-97;
	     start[1] = parseInt(start[1]);

	     var end = chessBoard.getSquare(ui.position, start);
	     
	     start = columnsName[start[0]]+start[1];
	     end = columnsName[end[0]]+end[1];
	    
	     for ( var i in chessBoard.possibleMoves ) {
		  if ( chessBoard.possibleMoves[i] === end ) {
		      chessBoard.movePiece(start, end);
		      break;
		  }
	     }
	 });

	 if ( this.turn === "white" || this.player === "white" || this.player == "locked") 
	     $(".chessBoardPiece.black").draggable("disable");
	 if ( this.turn === "black" || this.player === "black" || this.player == "locked") 
	     $(".chessBoardPiece.white").draggable("disable");
    },


    getSquare: function(pos,  start) {
	 
	 var squareSize = this.size/8;
	 
	 var dx = parseInt(pos.left/squareSize) + (pos.left%squareSize > squareSize/2 ? 1 : ( pos.left%squareSize < -squareSize/2 ? -1 : 0 ));
	 var dy = -(parseInt(pos.top/squareSize) + (pos.top%squareSize > squareSize/2 ? 1 : ( pos.top%squareSize < -squareSize/2 ? -1 : 0 ))); 

	 if ( this.orientation === "black" ) {
	     dx *= -1;
	     dy *= -1;
	 }

	 var x = dx + start[0];
	 var y = dy + start[1];

	 return [x,y];
	 
    },
    
    // updates board with recorded moves
    moveHistory: function(direction) {

	 if (this.type === "history") {
	     this.cursor += direction;
	     if (this.cursor < 0 || this.cursor > this.lines.length)
		  this.cursor -= direction;

	     var localCursor = 0;
	     var passant = "";
	     var localPosition = this.copyPosition(this.position);
	     
	     while (localCursor < this.cursor) {
		  var start = this.lines[localCursor][0];
		  var end = this.lines[localCursor][1];

		  localPosition[end] = localPosition[start];
		  delete localPosition[start];

		  // deals with promotion
		  if (this.lines[localCursor].length === 3)
		      localPosition[end] = this.lines[localCursor][2]
		  
		  localCursor += 1;
		  
		  // removes passsant pawn
		  if (end === passant) {
		      if (passant[1] === "3") {
			   delete localPosition[passant[0]+"4"];
		      }
		      else {
			   delete localPosition[passant[0]+"5"];
		      }
		  }
		  
		  // marks passant square
		  if (localPosition[end] === "P" && start[1] === "2" && end[1] === "4")
		      passant = start[0]+"3";
		  else if (localPosition[start] === "p" && start[1] === "7" && end[1] === "5")
		      passant = start[0]+"6";
		  else
		      passant = "";

		  // solves castling
		  if (localPosition[end] === "K" && start == "e1") {
		      if (end == "g1") {
			   delete localPosition["h1"];
			   localPosition["f1"] = "R";
		      }
		      else {
			   delete localPosition["a1"];
			   localPosition["d1"] = "R";
		      }
		  }
		  if (localPosition[end] === "k" && start == "e8") {
		      if (end == "g8") {
			   delete localPosition["h8"];
			   localPosition["f8"] = "r";
		      }
		      else {
			   delete localPosition["a8"];
			   localPosition["d8"] = "r";
		      }
		  }
	     }

	     var startSquare = $("#"+start);
	     var endSquare = $("#"+end);
	     
	     // register the move on the board
	     $(".chessBoardPreviousEnd").removeClass("chessBoardPreviousEnd");
	     $(".chessBoardPreviousStart").removeClass("chessBoardPreviousStart");
	     
	     endSquare.addClass("chessBoardPreviousEnd");
	     startSquare.addClass("chessBoardPreviousStart");
	     $(".chessBoardPiece").remove();
	     
	     
	     for ( var k in localPosition ) {

		  // if piece is white
		  if ( localPosition[k].toUpperCase() === localPosition[k] )
		      $("#"+k).append("<div class='chessBoardPiece white chessBoard"+localPosition[k]+"' data-color='white' data-piece='"+localPosition[k]+"'></div>");

		  // if piece is black
		  else 
		      $("#"+k).append("<div class='chessBoardPiece black chessBoard"+localPosition[k]+"' data-color='black' data-piece='"+localPosition[k]+"'></div>");
	     
	     }
	     
	     
	 }

    },

    movePiece: function(start, end) {
	 var dt = 0;
	 if ( this.type === "puzzle" && this.turn !== this.player )
	     dt = 500;
	 
	 $(".chessBoardPreviousEnd").removeClass("chessBoardPreviousEnd");
	 $(".chessBoardPreviousStart").removeClass("chessBoardPreviousStart");
	 
	 this.lastMove = [start,end];

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


	 // chessBoard position
	 this.position = this.generateNewPosition(start, end, passant, this.position);
	 

	 // board update

	 // normal pick the piece
	 var start = $("#"+start);
	 var piece = start.children().each(function() {
	     var p = $(this);
	     if ( p.hasClass("chessBoardPiece") )
		  p.detach();
	 });
	 
	 // normal drop the piece
	 var endSquare = $("#"+end);
	 endSquare.children().remove();
	 endSquare.append(piece);

	 
	 // update turn
	 this.turn = this.turn === "white" ? "black" : "white";

	 

	 // register the move on the board
	 endSquare.addClass("chessBoardPreviousEnd");
	 start.addClass("chessBoardPreviousStart");
	 
	 
	 // activate deactivate dragging
	 if ( this.turn === "white" ) {
	     $(".chessBoardPiece.black").draggable("disable");
	     if ( this.player !== "black" )
		  $(".chessBoardPiece.white").draggable("enable");
	 }
	 else {
	     $(".chessBoardPiece.white").draggable("disable");
	     if ( this.player !== "white" )
		  $(".chessBoardPiece.black").draggable("enable");
	 }
	 

	 // deals with promotions
	 if ( (end[1] === "8" && this.position[end] === "P") || (end[1] === "1" && this.position[end] === "p") ) {
	     $("#chessBoardGameBoard").off("click", ".chessBoardSquare");
	     $(".chessBoardPiece").draggable("disable");
	     $("#chessBoardPromotionTable").show();
	     
	     if ( end[1] === "1" ) {
		  $("#blackPromotionTable").show();
	     }
	     else
		  $("#whitePromotionTable").show();
	     $(document).off("keypress");
	 }

	 // no promotion move complete
	 else {
	     // update result
	     this.result = this.getResult(this.position, this.turn, this.passant);
	     if ( this.result !== "active" ) {
		  $("#chessBoardGameBoard").off("click", ".chessBoardSquare");
		  $(".chessBoardPiece").draggable("disable");
	     }
	     

	     
	     if (this.type !== "puzzle") {
		  try {
		      updatePageAfterChessBoardMove();
		  }
		  catch(e) {
		 
		  }
	     }

	     if ( this.type === "puzzle" && this.turn !== this.player ) {
		  setTimeout(function() {
		      chessBoard.completePuzzle();
		      
		  },700);
	     }
	 }
	 

	 // TODO
	 // update log
    },
	 


    



    // deletes board and redraws it upside down
    rotateBoard: function() {
	 this.orientation = this.orientation === "white" ? "black" : "white";

	 $("#chessBoardGameTable").children().remove();

	 this.loadBoard();
	 
	 this.addLabel();

	 this.preparePromotion();
	 
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
	     if ( pos[square] === "K" ) {
		  if  ( this.castling.indexOf("K") !== -1 && !("f1" in pos) && !("g1" in pos) && !this.areSquaresAttacked(["e1","f1","g1"],"black", pos) )
		      possibleMoves.push("g1");
		  
		  if ( this.castling.indexOf("Q") !== -1 && !("c1" in pos) && !("d1" in pos) && !("b1" in pos) && !this.areSquaresAttacked(["e1","d1","c1"],"black", pos) ) {
		      possibleMoves.push("c1");
		  }
	     }
	     else if ( pos[square] === "k" ) {
		  if  ( this.castling.indexOf("k") !== -1 && !("f8" in pos) && !("g8" in pos)  && !this.areSquaresAttacked(["e8","f8","g8"],"white", pos) )
		      possibleMoves.push("g8");
		  if ( this.castling.indexOf("q") !== -1 && !("c8" in pos) && !("d8" in pos) && !("b8" in pos) && !this.areSquaresAttacked(["e8","d8","c8"],"white", pos) )
		      possibleMoves.push("c8");
	     }
	     
	     
	 }


	 // WHITE PAWN
	 if ( pos[square] === "P" ) {
	     
	     y = parseInt(squareArray[1]);
	     x = squareArray[0].charCodeAt(0)-97;

	     // 2 squares ahead
	     if ( y === 2 && !( columnsName[x]+"4" in pos ) ) {
		  if ( typeof this.position[columnsName[x]+"3"] === "undefined")
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
		  if ( typeof this.position[columnsName[x]+"6"] === "undefined")
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
    generateNewPosition: function(start, end, passant,position) {
	 var pos = this.copyPosition(position);
	 
	 
	 // replaces piece position
	 pos[end] = pos[start];
	 delete pos[start];
	 delete pos[undefined];
	 
	 
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


        

    // remove illegal moves from possible moves
    filterIllegalMoves: function(start,moves,turn,position,passant) {
	 
	var possible = [];

	 if (this.player === "locked")
	     return possible;

	for ( var m in moves ) {
	    // register king square
	    if ( position[start] === "K" || position[start] === "k" ) {
		var kingSquare = moves[m];
	    }
	    else {
		//if king to watch is white
		if ( turn === "black" ) {
		    for ( var k in position ) {
			if ( position[k] === "K" ) {
			    var kingSquare = k;
			    break;
			}
		    }
		}
		//if king to watch is black
		else {
		    for ( var k in position ) {
			if ( position[k] === "k" ) {
			    var kingSquare = k;
			    break;
			}
		    }
		}
		
	    }
	 
	    // if king is attacked
	    var pos = this.generateNewPosition(start,moves[m],passant, position);
	    if ( !this.areSquaresAttacked([kingSquare],turn,pos) )
		possible.push(moves[m]);
	}

	return possible;
    },

    
    // helper function to know if move is illegal
    areSquaresAttacked: function(squares, color,pos) {
	
	var columnsName = ["a", "b", "c", "d", "e", "f", "g", "h"];

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
		    if ( ( pos[newSq] === pos[newSq].toUpperCase() && color === "black" ) || ( pos[newSq] === pos[newSq].toLowerCase() && color === "white" ) ) {
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
		    if ( ( pos[newSq] === pos[newSq].toUpperCase() && color === "black" ) || ( pos[newSq] === pos[newSq].toLowerCase() && color === "white" ) ) {
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
		    if ( ( pos[newSq] === pos[newSq].toUpperCase() && color === "black" ) || ( pos[newSq] === pos[newSq].toLowerCase() && color === "white" ) ) {
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
		    if ( ( pos[newSq] === pos[newSq].toUpperCase() && color === "black" ) || ( pos[newSq] === pos[newSq].toLowerCase() && color === "white" ) ) {
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
		    if ( ( pos[newSq] === pos[newSq].toUpperCase() && color === "black" ) || ( pos[newSq] === pos[newSq].toLowerCase() && color === "white" ) ) {
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
		    if ( ( pos[newSq] === pos[newSq].toUpperCase() && color === "black" ) || ( pos[newSq] === pos[newSq].toLowerCase() && color === "white" ) ) {
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
		    if ( ( pos[newSq] === pos[newSq].toUpperCase() && color === "black" ) || ( pos[newSq] === pos[newSq].toLowerCase() && color === "white" ) ) {
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
		    if ( ( pos[newSq] === pos[newSq].toUpperCase() && color === "black" ) || ( pos[newSq] === pos[newSq].toLowerCase() && color === "white" ) ) {
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
			if ( [columnsName[x+1],y+2].join("") === k || [columnsName[x-1],y+2].join("") === k || [columnsName[x+2],y+1].join("") === k || [columnsName[x-2],y+1].join("") === k || [columnsName[x+2],y-1].join("") === k || [columnsName[x-2],y-1].join("") === k || [columnsName[x-1],y-2].join("") === k || [columnsName[x+1],y-2].join("") === k )
			    return true;

		    }
		}
	    }
	    // black knight
	    else  {
		for ( var k in pos ) {
		    if ( pos[k] === "n" ) {
			if ( [columnsName[x+1],y+2].join("") === k || [columnsName[x-1],y+2].join("") === k || [columnsName[x+2],y+1].join("") === k || [columnsName[x-2],y+1].join("") === k || [columnsName[x+2],y-1].join("") === k || [columnsName[x-2],y-1].join("") === k || [columnsName[x-1],y-2].join("") === k || [columnsName[x+1],y-2].join("") === k )
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
    }


}


