export default class MoveManager {

    constructor(movelistOpponent) {
        this.movelistOpponent = movelistOpponent
    }

    getMoveOpponent(fen) {
        return this.movelistOpponent[fen] ? this.movelistOpponent[fen] : 'a1a1'
    }
}