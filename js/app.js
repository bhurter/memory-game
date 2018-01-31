/*
 * Global variables to track flipped cards; matched cards; and to hold card back
 */

let flippedId = [];
let nFlipped = 0;
let cardBack = 'img/Rainbow.png';
let totalMatches = 0;
let matched = 0;
let tries = 0;
let myTimer = '';
let hours = 0;
let minutes = 0;
let seconds = 0;

let userDifficulty = 'beginner';
let alreadyMatched = [];
let hideTimeout = true;
let numStars = 3;
let nDim = 0;

let myMoves = document.getElementById( 'moves' );
let myGameTimer = document.getElementById( 'myGameTimer' );
let deck = document.getElementById( 'gameBoard' );
let cards = document.getElementById( 'gameBoard' );

// set up media listener to catch when screen gets below 600px so we can restrict
// medium and hard levels to web only

let mediaSize = window.matchMedia( ' ( max-width: 767px ) ' );
mediaSize.addListener( setButtons );
setButtons( mediaSize );

// add event listener for reset button
document.getElementById( 'restart' ).addEventListener( 'click', function () {
	buildDeck( userDifficulty );
} );

// add event listener for replay button from modal

document.getElementById( 'modalReplay' ).addEventListener( 'click', replayGame );

// add event listeners for beginner and easy levels (always present in game)
// let setButtons handle event listeners for medium and hard buttons, depending
// on media mediaSize

document.getElementById( 'beginner' ).addEventListener( 'click', function () {
	buildDeck( 'beginner' );
} );

document.getElementById( 'easy' ).addEventListener( 'click', function () {
	buildDeck( 'easy' );
} );

function setButtons( mediaSize ) {
	/*
	 * Set up event listeners on buttons to determine grid size (4x4, 6x6, 8x8, and 10x10)
	 * Only show beginner and easy levels if screen width < 600px to avoid click frustration
	 */
	var medButton = document.getElementById( 'medium' );
	var hardButton = document.getElementById( 'hard' );

	// if media query matches, remove medium and hard setButtons
	if ( mediaSize.matches ) {

		if ( medButton !== null ) {
			medButton.parentNode.removeChild( medButton );
			medButton.removeEventListener( 'click', buildDeck );
		}
		if ( hardButton !== null ) {
			hardButton.parentNode.removeChild( hardButton );
			hardButton.removeEventListener( 'click', buildDeck );
		}

	} else {
		//add medium and hard buttons if they don't already exist

		var levelButtonPanel = document.getElementById( 'levelButtons' );
		medButton = document.createElement( 'BUTTON' );
		hardButton = document.createElement( 'BUTTON' );


		medButton.className = 'col-xs-6 col-sm-3 button-panel my-medium';
		medButton.id = 'medium';
		medButton.innerHTML = 'Rocking It';

		hardButton.className = 'col-xs-6 col-sm-3 button-panel hard';
		hardButton.id = 'hard';
		hardButton.innerHTML = 'Climbing Mt. Everest';

		// append new buttons to button panel
		levelButtonPanel.appendChild( medButton );
		levelButtonPanel.appendChild( hardButton );

		// now add event listeners for click
		medButton.addEventListener( 'click', function () {
			buildDeck( 'medium' );
		} );

		hardButton.addEventListener( 'click', function () {
			buildDeck( 'hard' );
		} );

	}
}

function buildDeck( difficulty ) {

	// reset instructions to click a card
	document.getElementById( 'inst' ).innerHTML = 'Click any two cards to find a match';

	// determine deck size
	nDim = getDeckSize( difficulty );

	// clear the table
	clearCards();

	// reset the gameboard
	resetGame();

	// load new card images into a random array

	let gameImages = getImages( nDim );

	// Determine total number of matches needed to win game.  Since working with a square grid, this is row x column / 2
	totalMatches = nDim * nDim / 2;

	// build out the game board

	let nImage = 0;

	for ( let i = 0; i < nDim; i++ ) {

		// create a table row to hold the cards

		let newRow = document.createElement( 'tr' );

		for ( let j = 0; j < nDim; j++ ) {

			// create each card as a column in the table.  Use the image index into the array as the unique ID for the event listener

			let newCol = document.createElement( 'td' );
			newCol.id = nImage;
			alreadyMatched[ nImage ] = false;

			// add the event listener so we know when the cell is clicked

			//newCol.addEventListener('click', matchMe);

			// add the image, set image classes, and image source.  Set the image to the card back so that when the table shows
			// you will see the back of the card.  Use the alt text to hold the actual image file.  This does two things:
			//    1.  Lets you quickly get the image name without having to persist the array of images as global variables
			//    2.  Helps support accessibility

			let newImg = document.createElement( 'IMG' );
			newImg.className = 'img-responsive img-rounded card card-image no-match match card-flip';
			newImg.setAttribute( 'src', cardBack );
			newImg.setAttribute( 'alt', gameImages[ nImage ] );
			newImg.classList.toggle( 'match', false );
			newImg.classList.toggle( 'card-flip', false );

			// append image to the column, then append column to the row

			newCol.appendChild( newImg );
			newRow.appendChild( newCol );
			nImage = nImage + 1;
		}

		// append row to the table

		cards.appendChild( newRow );
	}
	// add the event listener to the myTable

	cards.addEventListener( 'click', matchMe );
}

function getDeckSize( difficulty ) {
	let nDeckSize = 0;
	//  note:  consider changing this to accept row and column dimensions.  This gets quite challenging for children after 6x6.
	switch ( difficulty ) {
	case 'beginner':
		nDeckSize = 4;
		break;
	case 'easy':
		nDeckSize = 6;
		break;
	case 'medium':
		nDeckSize = 8;
		break;
	case 'hard':
		nDeckSize = 10;
		break;
	default:
		nDeckSize = 4;
	}
	userDifficulty = difficulty;
	return nDeckSize;
}

function clearCards() {
	/*
	 *  Clear out the current deck of cards by removing the table rows.  Don't know if it matters or not, but I chose to remove from *  the bottom of the table up, instead of from the top down.
	 */

	cards = document.getElementById( 'gameCards' );
	let rowCount = cards.rows.length;
	for ( let i = rowCount - 1; i >= 0; i-- ) {
		cards.deleteRow( i );
	}
}

function resetGame() {

	/*
	 *  Clear out global game variables when the game is reset
	 */

	nFlipped = 0;
	matched = 0;
	tries = 0;
	updateMoves();
	resetStars();
	stopTimer( true );
	hours = 0;
	minutes = 0;
	seconds = 0;


}

function resetStars() {

	/*
	 * Reset all stars to filled in.  This uses font awesome solid star icon
	 */

	document.getElementById( 'star1' ).innerHTML = '<i class="fa fa-star gold-star"></i>';
	document.getElementById( 'star2' ).innerHTML = '<i class="fa fa-star gold-star"></i>';
	document.getElementById( 'star3' ).innerHTML = '<i class="fa fa-star gold-star"></i>';

}

function getImages( nDim ) {
	/*
	 * For my images, I chose to use the emoji images instead of font-awesome fonts.  I thought they
	 * would be more interesting to my grandchildren.  I don't use all of the emoji's, but downloaded a
	 * lot of different ones from emojiisland.com.  I have more than needed, even for the 10x10 game, so that there will always
	 * be a variety in the game for the kids
	 *
	 * Since HTML cannot access the hard drive, I have listed them all out here in an array.  This function will
	 * randomize the array of all images, then take the first n images to use to build out the list for the game.
	 */

	let images = [ 'img/a.png', 'img/b.png', 'img/c.png', 'img/d.png',
		'img/e.png', 'img/f.png', 'img/g.png', 'img/h.png',
		'img/i.png', 'img/j.png', 'img/k.png', 'img/l.png',
		'img/m.png', 'img/n.png', 'img/o.png', 'img/p.png',
		'img/q.png', 'img/r.png', 'img/s.png', 'img/t.png',
		'img/u.png', 'img/v.png', 'img/w.png', 'img/x.png',
		'img/y.png', 'img/z.png',
		'img/aa.png', 'img/bb.png', 'img/cc.png', 'img/dd.png',
		'img/ee.png', 'img/ff.png', 'img/gg.png', 'img/hh.png',
		'img/ii.png', 'img/jj.png', 'img/kk.png', 'img/ll.png',
		'img/mm.png', 'img/nn.png', 'img/oo.png', 'img/pp.png',
		'img/qq.png', 'img/rr.png', 'img/ss.png', 'img/tt.png',
		'img/uu.png', 'img/vv.png', 'img/ww.png', 'img/xx.png',
		'img/yy.png', 'img/zz.png',
		'img/aaa.png', 'img/bbb.png', 'img/ccc.png', 'img/ddd.png',
		'img/eee.png', 'img/fff.png', 'img/ggg.png', 'img/hhh.png',
		'img/iii.png', 'img/jjj.png', 'img/kkk.png', 'img/lll.png',
		'img/mmm.png', 'img/nnn.png', 'img/ooo.png', 'img/ppp.png',
		'img/qqq.png', 'img/rrr.png', 'img/sss.png', 'img/ttt.png',
		'img/uuu.png', 'img/vvv.png', 'img/www.png', 'img/xxx.png',
		'img/yyy.png', 'img/zzz.png',
		'img/aaaa.png', 'img/bbbb.png', 'img/cccc.png', 'img/dddd.png'
	];

	let tempImages = [];

	// Calculate the total number of different cards needed

	totalMatches = nDim * nDim / 2;

	// randomize the Images

	images = shuffle( images );

	for ( let i = 0; i < totalMatches; i++ ) {
		// put the same card in the array twice so that the cards are fully randomized
		tempImages[ i ] = images[ i ];
		tempImages[ i + totalMatches ] = images[ i ];
	}

	// now shuffle the final deck

	tempImages = shuffle( tempImages );

	return tempImages;
}

function matchMe() {
	/*
	 * This function is called every time a card is clicked to see if there is a match or not.
	 */

	// Set the timer if this is the very first card click

	if ( myTimer == null ) {
		myTimer = setInterval( gameTimer, 1000 );
	}
	let cardID = event.target.parentElement.id;
	let alreadyFlipped = false;
	// first, check to see if there are two cards alreay flipped.  If so, and they are not a match, then need to cancel the
	// 1.5 second timer and hide them (user is ready to move on)
	if ( nFlipped >= 2 ) {
		clearTimeout( hideTimeout );
		hideCards();
	}
	// first check to see if user clicked on a card that was already matched or if user clicked somewhere in the table margin/border.  If so, do nothing
	if ( alreadyMatched[ cardID ] !== true && cardID !== '' ) {
		if ( nFlipped > 0 ) {
			for ( let i = 0; i < nFlipped; i++ ) {
				if ( flippedId[ i ] === cardID ) {
					alreadyFlipped = true;
				}
			}
		}

		// if the card clicked has not already been flipped, then flip this card

		if ( alreadyFlipped !== true ) {
			flipCard( cardID );
		}
	}
}

function flipCard( thisCardID ) {
	/*
	 * This function flips the card, checks for a match, updates the moves counter and game screen, sets the stars,
	 * and checks to see if all matches have been made (game over)
	 */

	// flip the card by setting the image source = the file stored in the alt text
	let thisCard = document.getElementById( thisCardID );

	// TODO: smooth out animation at some point.  not really happy with this, but it works.

	thisCard.classList.toggle( 'card-flip', true );
	thisCard.querySelector( 'img' ).src = thisCard.querySelector( 'img' ).alt;

	// track the card ID in the flipped array
	flippedId[ nFlipped ] = thisCardID;
	nFlipped = nFlipped + 1;

	// if there are 2 cards flipped, check for a match, update number of moves, and set stars,
	if ( nFlipped === 2 ) {
		tries = tries + 1;
		isMatch();
		updateMoves();
		setStars();
	}
	// if the user has matched all cards, then the game is ofer
	if ( matched === totalMatches ) {
		gameOver();
	}
}

function isMatch() {
	/*
	 * Check for a match by comparing the alt text on the card image.  If they match, then the user has found a match.
	 * Call the foundMatch function to remove event listeners.  Also may want to consider additional functionality later.
	 */
	let card1 = document.getElementById( flippedId[ 0 ] );
	let card2 = document.getElementById( flippedId[ 1 ] );

	// check to see if alt text matches.  If so, it is a match.
	if ( card1.querySelector( 'img' ).alt === card2.querySelector( 'img' ).alt ) {
		foundMatch();
	} else {
		// if the alt text does not match, then call the noMatch function after 1 1/2 seconds
		// to give the user time to view the flipped cards

		//cards.removeEventListener('click', matchMe);
		hideTimeout = setTimeout( hideCards, 1500, card1, card2 );
	}

}

function foundMatch() {

	/*
	 * This function removes the event listener for matched cards so that they are no longer clickable.
	 * It also increments the number of matches found in the game.
	 */

	let id1 = flippedId[ 0 ];
	let id2 = flippedId[ 1 ];
	let img1 = document.getElementById( id1 );
	let img2 = document.getElementById( id2 );

	alreadyMatched[ id1 ] = true;
	alreadyMatched[ id2 ] = true;

	// set class to remove pointer
	img1.firstElementChild.classList.toggle( 'no-match', false );
	img1.firstElementChild.classList.toggle( 'match', true );
	img2.firstElementChild.classList.toggle( 'no-match', false );
	img2.firstElementChild.classList.toggle( 'match', true );

	matched = matched + 1;
	nFlipped = 0;

}

function hideCards() {

	/*
	 * This function resets the card image to the cardBack.
	 *
	 */
	let card1 = document.getElementById( flippedId[ 0 ] );
	let card2 = document.getElementById( flippedId[ 1 ] );
	card1.querySelector( 'img' ).src = cardBack;
	card2.querySelector( 'img' ).src = cardBack;
	card1.classList.toggle( 'card-flip', false );
	card2.classList.toggle( 'card-flip', false );
	// reset number of cards flipped
	nFlipped = 0;

}

function updateMoves() {
	// update game board to show number of moves

	if ( tries === 1 ) {
		myMoves.innerHTML = 'You made 1 Move';
	} else {
		myMoves.innerHTML = 'You made ' + tries + ' Moves';
	}
}

function setStars() {
	/*
	 * Sets the number of stars to show based on the number of moves the user has made.
	 *  3 stars <= # matches * 2
	 *  2 stars <= # matches * 3
	 *  1 star = > # matches  * 3
	 */
	if ( tries <= totalMatches * 2 ) {
		numStars = 3;
	} else if ( tries <= totalMatches * 3 ) {
		numStars = 2;
		document.getElementById( 'star3' ).innerHTML = '<i class="fa fa-star-o gold-star"></i>';
	} else {
		numStars = 1;
		document.getElementById( 'star2' ).innerHTML = '<i class="fa fa-star-o gold-star"></i>';
		document.getElementById( 'star3' ).innerHTML = '<i class="fa fa-star-o gold-star"></i>';
	}
}

function stopTimer( clearDisplay ) {
	/*
	 * Stop the timer.
	 * If clearDisplay is TRUE, then reset the display to 00:00:00
	 * If clearDisplay is FALSE, then do not reset the display
	 */

	if ( myTimer !== null ) {
		myTimer = clearInterval( myTimer );
	}
	if ( clearDisplay ) {
		myGameTimer.innerHTML = 'Time:  00:00:00';
	}
}

function gameTimer() {
	/*
	 * Increment the game timer display.
	 */

	// Increase the seconds counter by 1 every time the interval timer fires
	seconds = seconds + 1;

	// if seconds gets to 60, then reset to 0 and increment the minutes by 1
	if ( seconds === 60 ) {
		seconds = 0;
		minutes = minutes + 1;
	}
	// if minutes gets to 60, then reset to - and increment the hours by 1
	if ( minutes === 60 ) {
		minutes = 0;
		hours = hours + 1;
	}

	// want to show hours, minutes, and seconds padded with zeros.  To do this, I will concatenate the hours, minutes,
	// and seconds to a '0', and then slice off the last 2 digits for display.  I recognize that hours "could" get to 100+,
	// but at that point, who's counting?

	let myHours = '0' + hours;
	let myMinutes = '0' + minutes;
	let mySeconds = '0' + seconds;

	myGameTimer.innerHTML = ' Time:  ' + myHours.slice( -2 ) + ':' + myMinutes.slice( -2 ) + ':' + mySeconds.slice( -2 );
}

function gameOver() {
	/*
	 * Game is over here.  All listeners have been turned off except for the interval timer.
	 * Need to turn it off.
	 * Enhancements:  Add some bells and whistles to congratulate the user on winning the game
	 */

	stopTimer( false );
	$( '#congratulations' ).modal();
	document.getElementById( 'modalMoves' ).innerHTML = myMoves.innerHTML;
	document.getElementById( 'modalTimer' ).innerHTML = myGameTimer.innerHTML;
	if ( numStars === 1 ) {
		document.getElementById( 'modal-star2' ).innerHTML = '<i class="fa fa-star-o modal-star"></i>';
		document.getElementById( 'modal-star3' ).innerHTML = '<i class="fa fa-star-o modal-star"></i>';
	} else if ( numStars === 2 ) {
		document.getElementById( 'modal-star3' ).innerHTML = '<i class="fa fa-star-o modal-star"></i>';
	}

}

function replayGame() {
	buildDeck( userDifficulty );
}

/*
 * Shuffle function from http://stackoverflow.com/a/2450976 - I did not
 * write this
 */
function shuffle( array ) {
	let currentIndex = array.length,
		temporaryValue, randomIndex;

	while ( currentIndex !== 0 ) {
		randomIndex = Math.floor( Math.random() * currentIndex );
		currentIndex -= 1;
		temporaryValue = array[ currentIndex ];
		array[ currentIndex ] = array[ randomIndex ];
		array[ randomIndex ] = temporaryValue;
	}

	return array;
}
