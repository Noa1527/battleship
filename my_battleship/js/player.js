/*jslint browser this */
/*global _, shipFactory, player, utils */

(function (global) {
    "use strict";

    var sheep = {dom: {parentNode: {removeChild: function (target, accepted) {
        if (accepted == "true") {
            target.hidden = "true";
        }
    }}}};

    var player = {
        grid: [],
        tries: [],
        fleet: [],
        game: null,
        activeShip: 0,
        setGame: function (thisgame) {
            this.game = thisgame;
        },
        init: function () {
            // créé la flotte
            this.fleet.push(shipFactory.build(shipFactory.TYPE_BATTLESHIP));
            this.fleet.push(shipFactory.build(shipFactory.TYPE_DESTROYER));
            this.fleet.push(shipFactory.build(shipFactory.TYPE_SUBMARINE));
            this.fleet.push(shipFactory.build(shipFactory.TYPE_SMALL_SHIP));

            // créé les grilles
            this.grid = utils.createGrid(10, 10);
            this.tries = utils.createGrid(10, 10);
            this.shootgrid = utils.createGrid(10, 10);
            
            // la facons don l'ia shoot dans la grill
            for (let i = 0; i < 10; i++) {
                for (let ii = 0; ii < 10; ii++) {

                    this.shootgrid[i][ii] = Math.round((((Math.round(Math.sin((i+1)/Math.PI)*100)/100)+(Math.round(Math.sin((ii+1)/Math.PI)*100)/100))/2)*10)/10
                }
                
            }
        },
        play: function (col, line) {
            // appel la fonction fire du game, et lui passe une calback pour récupérer le résultat du tir
            this.game.fire(this, col, line, _.bind(function (hasSucced) {
                this.tries[line][col] = hasSucced;
                
                var node = this.game.grid.querySelector('.row:nth-child(' + (line + 1) + ') .cell:nth-child(' + (col + 1) + ')');
                if (this.tries[line][col] == true) {
                    node.style.background = "no-repeat center/80% url('./img/boom.gif')"
                } else {
                    node.style.background = "no-repeat center/80% url('./img/splash.gif')"
                }
                setTimeout(() => {
                    node.style.background = ''
                    this.renderTries(this.game.grid)
                }, 1000)
                
            }, this));
        },
        // quand il est attaqué le joueur doit dire si il a un bateaux ou non à l'emplacement choisi par l'adversaire
        receiveAttack: function (col, line, phase, callback) {
            var succeed = false;
            var shipId
            if (phase == "PHASE_PLAY_OPPONENT") {
                if (this.game.players[1].tries[line][col] == true) {
                    succeed = true;
                    this.grid[line][col] = 0;
                }
            } else {
                if (this.game.players[0].tries[line][col] == true) {
                    succeed = true;
                    this.grid[line][col] = 0;
                }
            }
            if (this.grid[line][col] !== 0) {
                succeed = true;
                shipId = this.grid[line][col]
                this.grid[line][col] = 0;
            }
            callback.call(undefined, succeed, shipId);
        },
        setActiveShipPosition: function (x, y, vertical) {
            var ship = this.fleet[this.activeShip];
            var i = 0;
            var ii = 0;
            if (vertical == true) {
                y -= Math.floor(ship.life/2)
                while (ii < ship.getLife()) {
                    if (this.grid[y+ii][x] != 0) {
                    
                        return false;
                    }
                    ii += 1;
                }
                while (i < ship.getLife()) {
                    this.grid[y+i][x] = ship.getId();
                    i += 1;
                }
                return true;
            } else {
                x -= Math.floor(ship.life/2)
                while (ii < ship.getLife()) {
                    if (this.grid[y][x + ii] != 0) {
                    
                        return false;
                    }
                    ii += 1;
                }
                while (i < ship.getLife()) {
                    this.grid[y][x + i] = ship.getId();
                    i += 1;
                }
                return true;
            }
            
        },

        // modification exo 1 (var accepted) //
        clearPreview: function (accepted) {
            if (accepted != "false") {
                accepted = "true";
            }
            this.fleet.forEach(function (ship) {
                if (sheep.dom.parentNode) {
                    sheep.dom.parentNode.removeChild(ship.dom, accepted);
                }
            });
        },
        resetShipPlacement: function () {
            
            this.activeShip = 0;
            this.grid = utils.createGrid(10, 10);
            this.clearPreview(accepted);
        },
        // -------------------------------- //
        activateNextShip: function () {
            if (this.activeShip < this.fleet.length - 1) {
                this.activeShip += 1;
                return true;
            } else {
                return false;
            }
        },
        renderTries: function (grid) {
            this.tries.forEach(function (row, rid) {
                row.forEach(function (val, col) {
                    var node = grid.querySelector('.row:nth-child(' + (rid + 1) + ') .cell:nth-child(' + (col + 1) + ')');
                    if (val === true) {
                            node.style.backgroundColor = '#e60019';
                    } else if (val === false) {
                            node.style.backgroundColor = '#aeaeae';
                    }
                });
            });
        },
        renderShips: function (miniGrid) {
            this.grid.forEach(function (row, rid) {
                row.forEach(function (val, col) {
                    var node = miniGrid.querySelector('.row:nth-child(' + (rid + 1) + ') .cell:nth-child(' + (col + 1) + ')');

                    if (node != null) {
                        if (val != 0) {
                            node.style.backgroundColor = player.fleet[val-1].color
                        }
                    }
                   
                });
            });
                    
              
              
        }
    };

    global.player = player;


}(this));