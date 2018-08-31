$(function () {
    //Create Player 1 and Player 2
    const player1 = new Player('sheriff');
    const player2 = new Player('criminal');

    const newBoard = new BoardGame(8, 9, player1, player2); //Create a board with provided arguments
    function generateRandomCells(numCells) {
        let arr = [];
        let i = 0;
        while (i < numCells) {
        let randomCell = Math.floor(Math.random() * newBoard.totalCell) + 1;
        if (arr.indexOf(randomCell) === -1) {
            arr.push(randomCell);
            i++;
        }
        }; 
        return arr;
    }

    let cellArray = generateRandomCells(12); //Generate random cells for all the objects of the game

    //Locate Players randomly
    newBoard.locatePlayer(player1.character, cellArray[0]);
    newBoard.locatePlayer(player2.character, cellArray[1]);
    cellArray.splice(0, 2); //Remove 2 used elements from cellArray 

    //Locate 6 obstacles randomly
    for (let i = 0; i < 6; i++) {
        newBoard.locateObstacles(cellArray[i]);//Location of obstacles are picked from cellArray containing random cells
    }
    cellArray.splice(0, 6); //Remove 6 used elements from cellArray

    //Create 4 different weapons type and Locate them on board
    const gun = new Weapon('gun', 20);
    const wand = new Weapon('wand', 30);
    const hammer = new Weapon('hammer', 40);
    const quiver = new Weapon('quiver', 50)
    const weapons = [gun, wand, hammer, quiver];
    for (let i = 0; i < weapons.length; i++) {
        newBoard.locateWeapons(weapons[i].type, cellArray[i]);
    }
    //Default weapon for both players
    defaultWeapon = new Weapon('spray', 10);
    player1.weapon = defaultWeapon;
    player2.weapon = defaultWeapon;

    function defineWeapon(type) {
        let weapon;
        switch (type) {
            case 'gun':
                weapon = gun;
                break;
            case 'wand':
                weapon = wand;
                break;
            case 'hammer':
                weapon = hammer;
                break;
            case 'quiver':
                weapon = quiver;
                break;
            default:
                weapon = defaultWeapon;
        }
        return weapon;
    }

    //Drop current weapon and pick new one
    function collectWeapon(activePlayer, currentPlayerCell, newPlayerCell) {
        let dropWeapon = (cell) => {
            let currentWeaponType = activePlayer.weapon.type;
            activePlayer.weapon = defineWeapon($(`[cell = ${cell}]`).attr('type'));
            $(`[cell = ${cell}]`).removeAttr('type').attr('type', `${currentWeaponType}`);
            $(`#${activePlayer.character}Weapon`).attr('src', `images/${activePlayer.weapon.type}.png`);
            $(`#${activePlayer.character}WeaponDamage`).text(`Damage Point: ${activePlayer.weapon.damage}`);
        }

        if (newBoard.leftCells.includes(newPlayerCell)) {
            for (let i = 0; i < (currentPlayerCell - newPlayerCell); i++) {
                if ($(`[cell = ${newPlayerCell + i}]`).hasClass('weapon')) {
                    dropWeapon(newPlayerCell + i);
                    break;
                }
            }
        }

        else if (newBoard.rightCells.includes(newPlayerCell)) {
            for (let i = 0; i < (newPlayerCell - currentPlayerCell); i++) {
                if ($(`[cell = ${newPlayerCell - i}]`).hasClass('weapon')) {
                    dropWeapon(newPlayerCell - i);
                    break;
                }
            }
        }

        else if (newBoard.upperCells.includes(newPlayerCell)) {
            for (let i = 0; i < ((currentPlayerCell - newPlayerCell) / newBoard.columns); i++) {
                if ($(`[cell = ${newPlayerCell + (newBoard.columns * i)}]`).hasClass('weapon')) {
                    dropWeapon(newPlayerCell + (newBoard.columns * i));
                    break;
                }
            }
        }

        else if (newBoard.lowerCells.includes(newPlayerCell)) {
            for (let i = 0; i < ((newPlayerCell - currentPlayerCell) / newBoard.columns); i++) {
                if ($(`[cell = ${newPlayerCell - (newBoard.columns * i)}]`).hasClass('weapon')) {
                    dropWeapon(newPlayerCell - (newBoard.columns * i));
                    break;
                }
            }
        }
    }

    //Check if one player is in another's player adjacent square
    function fightCondition(newPlayerCell) {
        let adjacentSquares = [newPlayerCell - newBoard.columns, newPlayerCell + newBoard.columns];
        //Check if leftAdjacent and rightAdjacent are in the same row with player's new cell
        if (Number(newBoard.getRow(newPlayerCell - 1)) === Number(newBoard.getRow(newPlayerCell))) {
            adjacentSquares.push(newPlayerCell - 1);
        }
        if (Number(newBoard.getRow(newPlayerCell + 1)) === Number(newBoard.getRow(newPlayerCell))) {
            adjacentSquares.push(newPlayerCell + 1);
        }

        for (const adjacentSquare of adjacentSquares) {
            if ($(`[cell = ${adjacentSquare}]`).hasClass('player')) {
                return true;
                break;
            }
        }

    }

    //Start the fight if 2 players get too close
    function startFight(activePlayer, passivePlayer) {
        let hidingButton = (player) => $(`#${player.character}Buttons`).hide();
        let showingButton = (player) => $(`#${player.character}Buttons`).show();
        let defend = () => $(`#${activePlayer.character}`).attr('defend', 'true');
        let attack = () => {
            let currenthealth = passivePlayer.health;
            if (document.getElementById(`${passivePlayer.character}`).hasAttribute('defend')) {
                passivePlayer.health = currenthealth - (activePlayer.weapon.damage / 2);
            } else {
                passivePlayer.health = currenthealth - activePlayer.weapon.damage;
            }
            if(passivePlayer.health <= 0) {
                $(`#${passivePlayer.character}Health`).text(`Health Point: 0`); 
            } else {
                $(`#${passivePlayer.character}Health`).text(`Health Point: ${passivePlayer.health}`);
            }
        }

        function switchTurn() {
            let oldActive = activePlayer;
            activePlayer = passivePlayer;
            passivePlayer = oldActive;
        }

        hidingButton(passivePlayer);

        $(`.attack`).click(function () {
            if (document.getElementById(`${activePlayer.character}`).hasAttribute('defend')) {
                $(`#${activePlayer.character}`).removeAttr('defend');
            }
            attack();
            //Check if the game is over 
            if (hasWinner(passivePlayer)) {
                hidingButton(activePlayer);
                hidingButton(passivePlayer);
                $(`#${activePlayer.character}Status`).text('WINNER');
                $(`#${passivePlayer.character}Status`).text('LOSER');
            } else {
                switchTurn();
                hidingButton(passivePlayer);
                showingButton(activePlayer);
            }
        });

        $(`.defend`).click(function () {
            defend();
            switchTurn();
            hidingButton(passivePlayer);
            showingButton(activePlayer);
        });

    }

    //Check if player's health point is still greater than 0, otherwise inform the winner
    function hasWinner(player) {
        if (player.health > 0) {
            return false;
        } else {
            return true;
        }
    }

    //Click, switch player's turn function & collect weapons
    function turnBased() {
        newBoard.highlightMoves(newBoard.activePlayer.character);
        $('.col').click((event) => {
            if ($(event.target).hasClass('highlight')) {
                let currentPlayerCell = Number($(`#${newBoard.activePlayer.character}`).attr('cell'));
                newBoard.movePlayer(newBoard.activePlayer.character);
                $(event.target).addClass('player').attr('id', `${newBoard.activePlayer.character}`);
                let newPlayerCell = Number($(`#${newBoard.activePlayer.character}`).attr('cell'));
                collectWeapon(newBoard.activePlayer, currentPlayerCell, newPlayerCell);
                newBoard.switchPlayer();
                if (fightCondition(newPlayerCell) === true) {
                    alert('The fight starts now');
                    startFight(newBoard.activePlayer, newBoard.passivePlayer);
                }
                else {
                    newBoard.highlightMoves(newBoard.activePlayer.character);
                }
            }
        })
    }

    turnBased();



})