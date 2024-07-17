#  rhythm chess level maker

## Startup
install npm packages
`npm install`

launch frontend
`npm run dev`

launch backend
`npm run backend`

## .rcl files (rhythm chess level files)
.rcl files are the files that store level data and are used by the RhythmChess game.\
The data contains meta info in the head and a body of a move mapping for each position. (for reachable position the best move for the oponent is mapped to the position). To represent a position a compact fen notation is used.

### compact fen notation
The compact notation is like the standard fen notation with the following differences
- contains just the basic position (no information about who's turn it is ...)
- no slashes, as information can be inferred
- the compact fen is a sequence of 4 bit characters which are defined in the following table

| 4 bit value | character |
|---|---|
| 0 | [fen end] |
| 1 | 1 |
| 2 | 2 |
| 3 | 3 |
| 4 | 4 |
| 5 | 5 |
| 6 | 6 |
| 7 | 7 |
| 8 | 8 |
| 9 | [unused] |
| A | a (player) |
| B | p (pawn) |
| C | n (knight) |
| D | b (bishop) |
| E | r (rook) |
| F | q (queen) |

### Header
the header is structured as follow
- max rank (4 bits)
- max file (4 bits)
- starting fen (in compact fen notation)
- flag region
- disabled fields

The flag region and disabled fields are stored as a sequence of fields which are a tuple of 4 bit values (the first value is the x position (file) and the second the y position (rank))

the value A (1111) signals the end of the sequence

### move matrix
the move matrix is the mapping from each reachable position to the optiomal move for the opponent. It consists of a sequence of compact fens and its corresponding optimal move. The optimal move is stored as a tuple of two fields (which are stored as described above)
