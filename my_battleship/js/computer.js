/*jslint browser this */
/*global _, player */

(function (global) {
    "use strict";

    var computer = _.assign({}, player, {
        grid: [],
        shootgrid: [],
        tries: [],
        fleet: [],
        game: null,
        diff: "EASY",
        play: function () {
            var x;
            var y;
            var self = this;
            if (self.diff == "HARD") {
                    console.table(this.shootgrid)
                    for (let i = 0; i < 10; i++) {
                        for (let ii = 0; ii < 10; ii++) {
                            if (this.tries[i][ii] === false) {
                                var count = 0
                                while (count != 3) { // horizontal et vertical - 
                                    
                                    var a =  i - 1
                                    var aa = ii - 1
                                    
                                    if (a >= 0) {
                                        this.shootgrid[a][ii] -= 0.05
                                        this.shootgrid[i][aa] -= 0.05
                                    }
                                    count ++
                                }
                                count = 0
                                while (count != 3) { // horizontal et vertical +
    
                                    var a =  i + 1
                                    var aa = ii + 1
                                    
                                    if (a < 10) {
                                        this.shootgrid[a][ii] -= 0.05
                                        this.shootgrid[i][aa] -= 0.05
                                    }
                                    count++
                                }
                                
                                this.shootgrid[i][ii] -= 100
                                if (i+1 < 10 && ii+1 < 10) { // 4 diagonales
                                    this.shootgrid[i+1][ii+1] += 0.1
                                }
                                if (i+1 < 10 && ii-1 >= 0) {
                                    this.shootgrid[i+1][ii-1] += 0.1
                                }
                                if (i-1 >= 0 && ii+1 < 10) {
                                    this.shootgrid[i-1][ii+1] += 0.1
                                }
                                if (i-1 >= 0 && ii-1 >= 0) {
                                    this.shootgrid[i-1][ii-1] += 0.1
                                }
                            } 
                            else if (this.tries[i][ii] == true) {
                                count = 0
                                this.shootgrid[i][ii] -= 100
                                while (count != 2) {
                                    var a =  i - 1
                                    var aa = ii - 1
                                    if (a >= 0) {
                                        this.shootgrid[a][ii] += 0.5
                                        this.shootgrid[i][aa] += 0.5
                                    }
                                    count ++
                                }
                                count = 0
                                while (count != 2) {
                                    var a =  i + 1
                                    var aa = ii + 1
                                    if (a < 10) {
                                        this.shootgrid[a][ii] += 0.5
                                        this.shootgrid[i][aa] += 0.5
                                    }
                                    count ++
                                }
                                if (i+1 < 10 && ii+1 < 10) {
                                    this.shootgrid[i+1][ii+1] -= 0.25
                                }
                                if (i+1 < 10 && ii-1 >= 0) {
                                    this.shootgrid[i+1][ii-1] -= 0.25
                                }
                                if (i-1 >= 0 && ii+1 < 10) {
                                    this.shootgrid[i-1][ii+1] -= 0.25
                                }
                                if (i-1 >= 0 && ii-1 >= 0) {
                                    this.shootgrid[i-1][ii-1] -= 0.25
                                }
                            }
                        }
                    }
                    var biggest = -1000
                    for (let i = 0; i < 10; i++) {
                        for (let ii = 0; ii < 10; ii++) {
                            if (biggest < this.shootgrid[i][ii]) {
                                biggest = this.shootgrid[i][ii]
                                x = i
                                y = ii
                            }
                        }
                    }
                    if (x == undefined || y == undefined) {
                        x = Math.floor(Math.random()*9)
                        y = Math.floor(Math.random()*9)
                    }
                    setTimeout(function () {
                        self.game.fire(this, y, x, function (hasSucced) {
                       
                            self.tries[x][y] = hasSucced;
                        }, this);
                        this.player.game.renderMiniMap()
                    }, 2000)
                    
                
                
            } else {
                
                setTimeout(function () {
                x = Math.floor(Math.random()*9)
                y = Math.floor(Math.random()*9)
                self.game.fire(this, y, x, function (hasSucced) {
                   
                    self.tries[x][y] = hasSucced;
                }, this);
                this.player.game.renderMiniMap()
            }, 2000);
            }
            
            
        },
        
        renderTriesComputer: function (grid) {
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
        areShipsOk: function (callback) {
                var a;
                while (a != -1) {
                    var x;
                    var y;
                    var vertical;
                    var ship = this.fleet[this.activeShip];
                    if (Math.random() < 0.5) {
                        vertical = false
                        x = 2 + Math.floor(Math.random()*((this.grid.length-2)-ship.life))
                        y = Math.floor(Math.random()*(this.grid.length-ship.life))
                    } else {
                        vertical = true
                        x = Math.floor(Math.random()*(this.grid.length-ship.life))
                        y = 2 + Math.floor(Math.random()*((this.grid.length-2)-ship.life))
                    }
                  
                    // on enregistre la position du bateau, si cela se passe bien (la fonction renvoie true) on continue
                    if (this.setActiveShipPosition(x, y, vertical)) {
                        // et on passe au bateau suivant (si il n'y en plus la fonction retournera false)
                        if (!this.activateNextShip()) {
                            a = -1; // quand a = -1, la boucle prend fin
                        }
                    }
                }
                
            setTimeout(function () {
                callback();
            }, 500);
        }
    });

    global.computer = computer;

}(this));