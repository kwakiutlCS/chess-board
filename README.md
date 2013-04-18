chess-board
===========

simple javascript chess board to add to web pages to play or review games


 <br /> 
  

initialize board
---

	 chessBoard.startChessBoard(params);

  
  
this will draw a board in a div with id "chessBoardHolder", this div should be already included in the page
  
 

params is a javascript object with the keys

+ size -> size in pixels for the board width and height ( not counting the labels ), defaults to 400px  
+ player -> pieces that users are allowed to move, "white", "black" or "both", defaults to  white  
+ orientation -> perspective which the board is seen "white" or "black", defaults to player moving perspective  
+ label -> true or false sets the names of rows and columns, defaults to false  
+ fen -> fen string describing the position, defaults to initial chess position  
+ lastMove -> array or string describing last move played i.e. ["e2","e4"] or "e2 e4"
+ container -> overrides the div id  


<br />

usage
---


	 chessBoard.getFen();

returns the fen string representing the position, currently the number of moves section of the fen isn't correct

  
<br />    
    

	chessBoard.getResult();

returns a string representing the game result

+ "white"  ->  white delivered checkmate  
+ "black"  ->  black delivered checkmate  
+ "draw"   ->  stalemate  
+ "active" ->  normal move  

  
<br />   
    

	  chessBoard.getLastMove();

returns a string representing the last move played, like "e2 e4"


  
<br />  
    
Code executed after move
---
  
To execute some code after a move is made, the following function should be defined  
  
  
	 
	 var updatePageAfterChessBoardMove = function() {

  	 	// code to execute

	 }
	


