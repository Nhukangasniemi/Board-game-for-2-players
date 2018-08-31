//Create the board game class
class BoardGame {
    constructor(rows, columns, active, passive) {
        this.rows = rows;
        this.columns = columns;
        this.totalCell = rows * columns;
        this.activePlayer = active;
        this.passivePlayer = passive;
        this.validMoves = null;
        this.createBoard();
        
    }

    createBoard() {
        for (let row = 1; row <= this.rows; row++) {
            const rowElement = $('<div>').attr('row', row);
            for (let col = 1; col <= this.columns; col++) {
                let cellNumber = (this.columns * (row -1)) + col;
                const colElement = $('<div>').addClass('col empty').attr('cell', cellNumber);
                rowElement.append(colElement); 
            }
            $('#board').append(rowElement);
        }
    }

    getCell(cell) {
        return $(`[cell = ${cell}]`);
    }

    getRow(cell) {
        return this.getCell(cell).parent().attr('row');
    }

    locatePlayer(character, cell) {
        const currentCell = this.getCell(cell);
        currentCell.removeClass('empty').addClass('player').attr('id', `${character}`);
    }


    locateObstacles(cell) {
        const obstacle = this.getCell(cell);
        obstacle.removeClass('col empty').addClass('obstacle');
    }

    locateWeapons (weapon, cell) {
        const weaponCell = this.getCell(cell);
        weaponCell.removeClass('empty').addClass('weapon').attr('type', `${weapon}`);
    }

    //Define next possible moves for players
    highlightMoves (activePlayer) {
        //Get the current cell number and row number of player
        const cellNum = Number($(`#${activePlayer}`).attr('cell')); 
        const rowNum = Number(this.getRow(cellNum));

        //Find valid steps
        let moves = [];
        this.leftCells = [];
        this.rightCells = [];
        this.upperCells = [];
        this.lowerCells = [];
        for (let i = 1; i <=3; i++) {
            let leftCell = cellNum - i; 
            let leftCellRow = Number(this.getRow(leftCell));
            if(leftCellRow === rowNum) {
            this.leftCells.push(leftCell);
            }    
            let rightCell = cellNum + i;
            let rightCellRow = Number(this.getRow(rightCell));
            if(rightCellRow === rowNum) {
            this.rightCells.push(rightCell);
            }
            let upperCell = cellNum - (this.columns * i);
            this.upperCells.push(upperCell);
            let lowerCell = cellNum + (this.columns * i);
            this.lowerCells.push(lowerCell);
        }

        //Check if the cell doesn't have Obstacle then push it to moves array, otherwise break the loop and stop pushing
        let filter = (array) => {
            for(let i = 0; i < array.length; i++) {
                let cellElement = this.getCell(array[i]);
                if (cellElement.hasClass('obstacle') === false && cellElement.hasClass('player') === false) {
                moves.push(array[i]);
                }
                else { break; }
            }
            return moves;
        }
        filter(this.leftCells);
        filter(this.rightCells);
        filter(this.upperCells);
        filter(this.lowerCells);
        this.validMoves = moves.filter((move) => (move > 0 && move <= this.totalCell)); //Return valid cell number
        for (const validMove of this.validMoves) {
            this.getCell(validMove).addClass('highlight');
            this.getCell(validMove).mouseover(() => this.getCell(validMove).addClass(`mouseOver${activePlayer}`));
            this.getCell(validMove).mouseout(() => this.getCell(validMove).removeClass(`mouseOver${activePlayer}`));  
        }
        
        return this.validMoves;
    }

    
    movePlayer(activePlayer) {
        $(`#${activePlayer}`).removeAttr('id').removeClass('player');
        for(const validMove of this.validMoves) {
            $(`[cell = ${validMove}]`).removeClass('highlight');
            $(`[cell = ${validMove}]`).mouseover(() => $(`[cell = ${validMove}]`).removeClass(`mouseOver${activePlayer}`)); 
        }
    }

    switchPlayer() {
       let oldActive = this.activePlayer;
       this.activePlayer = this.passivePlayer;
       this.passivePlayer = oldActive;
       return this.activePlayer;
    }


}
