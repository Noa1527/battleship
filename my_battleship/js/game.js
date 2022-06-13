/*jslint browser this */
/*global _, player, computer, utils */

(function () {
    "use strict";

    var game = {
        PHASE_INIT_PLAYER: "PHASE_INIT_PLAYER",
        PHASE_INIT_OPPONENT: "PHASE_INIT_OPPONENT",
        PHASE_PLAY_PLAYER: "PHASE_PLAY_PLAYER",
        PHASE_PLAY_OPPONENT: "PHASE_PLAY_OPPONENT",
        PHASE_GAME_OVER: "PHASE_GAME_OVER",
        PHASE_WAITING: "waiting",

        currentPhase: "",
        phaseOrder: [],
        // garde une référence vers l'indice du tableau phaseOrder qui correspond à la phase de jeu pour le joueur humain
        playerTurnPhaseIndex: 2,

        // l'interface utilisateur doit-elle être bloquée ?
        waiting: false,

        // garde une référence vers les noeuds correspondant du dom
        grid: null,
        miniGrid: null,

        // liste des joueurs
        players: [],

        // lancement du jeu
        init: function () {

            // initialisation
            this.grid = document.querySelector('.board .main-grid');
            this.miniGrid = document.querySelector('.column .mini-grid');
            var ans = prompt("Qui commence à jouer ?\n 1 : Le joueur humain \n 2 : L'ordinateur \n 3 : Aléatoire")

            if (ans == '3') {
                ans = _.random(1,2)
            }
            if (ans == '1') {
                this.phaseOrder = [
                    this.PHASE_INIT_PLAYER,
                    this.PHASE_INIT_OPPONENT,
                    this.PHASE_PLAY_PLAYER,
                    this.PHASE_PLAY_OPPONENT,
                    this.PHASE_GAME_OVER
                ];
            } else {
                this.phaseOrder = [
                    this.PHASE_INIT_PLAYER,
                    this.PHASE_INIT_OPPONENT,
                    this.PHASE_PLAY_OPPONENT,
                    this.PHASE_PLAY_PLAYER,
                    this.PHASE_GAME_OVER
                ];
            } 
            // défini l'ordre des phase de jeu

            this.playerTurnPhaseIndex = 0;

            // initialise les joueurs
            this.setupPlayers();

            // ajoute les écouteur d'événement sur la grille
            this.addListeners();

            // c'est parti !
            this.goNextPhase();
        },
        setupPlayers: function () {
            // donne aux objets player et computer une réference vers l'objet game
            player.setGame(this);
            computer.setGame(this);

            // todo : implémenter le jeu en réseaux
            this.players = [player, computer];

            this.players[0].init();
            this.players[1].init();
        },
        goNextPhase: function () {
            // récupération du numéro d'index de la phase courante
            var ci = this.phaseOrder.indexOf(this.currentPhase);
            
            var self = this;
            
            if (ci !== this.phaseOrder.length - 1) {
                this.currentPhase = this.phaseOrder[ci + 1]
                
            } else {
                this.currentPhase = this.phaseOrder[2];
            }

            switch (this.currentPhase) {
            case this.PHASE_GAME_OVER:
                // detection de la fin de partie
                if (!this.gameIsOver()) {
                    
                    // le jeu n'est pas terminé on recommence un tour de jeu
                    // this.currentPhase = this.phaseOrder[1];
                    this.goNextPhase()
                } 
                break;
            case this.PHASE_INIT_PLAYER:
                utils.info("Placez vos bateaux");
                break;
            case this.PHASE_INIT_OPPONENT:
                var diff = prompt('Choisissez la difficulté : 1 = Facile (random) 2 = Difficile')
                if (diff == '2') {
                    this.players[1].diff = "HARD"
                } else {
                    this.players[1].diff = "EASY"
                }
                this.wait();
                utils.info("En attente de votre adversaire");

                this.players[1].areShipsOk(function () {
                    self.stopWaiting();
                    self.goNextPhase();
                });
                break;
            case this.PHASE_PLAY_PLAYER:
                utils.info("A vous de jouer, choisissez une case !");
                break;
            case this.PHASE_PLAY_OPPONENT:
                utils.info("A votre adversaire de jouer...");
                this.players[1].play();
                break;
            }
        },
        gameIsOver: function () {
            var p1 = this.players[0]
            var p2 = this.players[1]
            var downed = 0
            for (let i = 0; i < 10; i++) {
                for (let ii = 0; ii < 10; ii++) {
                    if (p2.tries[i][ii] == true) {
                        downed += 1
                    }
                    if (downed >= 17) {
                            alert("Le joueur 1 n'as plus de navires; le Joueur 2 gagne !")
                            return true
                    }
                }
            }
 
            downed = 0;
            
            for (let i = 0; i < 10; i++) {
                for (let ii = 0; ii < 10; ii++) {
                    if (p1.tries[i][ii] == true) {
                        downed += 1
                    }
                    if (downed >= 17) {
                        alert("Le joueur 2 n'as plus de navires; le Joueur 1 gagne !")
                        return true
                    }
                }
            }

            return false;
        },
        getPhase: function () {
            if (this.waiting) {
                return this.PHASE_WAITING;
            }
            return this.currentPhase;
        },
        // met le jeu en mode "attente" (les actions joueurs ne doivent pas être pris en compte si le jeu est dans ce mode)
        wait: function () {
            this.waiting = true;
        },
        // met fin au mode mode "attente"
        stopWaiting: function () {
            this.waiting = false;
        },
        addListeners: function () {
            // on ajoute des acouteur uniquement sur la grid (délégation d'événement)
            this.grid.addEventListener('mousemove', _.bind(this.handleMouseMove, this));
            this.grid.addEventListener('click', _.bind(this.handleClick, this));
            this.grid.addEventListener('contextmenu',  _.bind(this.handleClickRight, this));
        },
        handleMouseMove: function (e) {
            // on est dans la phase de placement des bateau
            if (this.getPhase() === this.PHASE_INIT_PLAYER && e.target.classList.contains('cell')) {
                var ship = this.players[0].fleet[this.players[0].activeShip];

                // si on a pas encore affiché (ajouté aux DOM) ce bateau
                if (!ship.dom.parentNode) {
                    this.grid.appendChild(ship.dom);
                    ship.dom.style.zIndex = -1;
                }
               
                if (ship.getRotate() == false){
                    // décalage visuelle, le point d'ancrage du curseur est au milieu du bateau
                    ship.dom.style.top = "" + (utils.eq(e.target.parentNode)) * utils.CELL_SIZE - (600 + (this.players[0].activeShip * 60)) + "px";
                    ship.dom.style.left = "" + utils.eq(e.target) * utils.CELL_SIZE - Math.floor(ship.getLife() / 2) * utils.CELL_SIZE + "px";
                } else if (ship.getRotate() == true){
                    // décalage visuelle, le point d'ancrage du curseur est au milieu du bateau
                    ship.dom.style.top = "" + (utils.eq(e.target.parentNode)) * utils.CELL_SIZE - (600 + this.players[0].activeShip * ship.divPosition) - (60 * 2)  + "px";
                    ship.dom.style.left = "" + utils.eq(e.target) * utils.CELL_SIZE - Math.floor(ship.getLife() / 2) / utils.CELL_SIZE + "px";
                }
            }
        },
        // fonction pour recupere la taille des bateau en verticale 
        divRotationShipe: function (){
            if (ship.getRotate() == true){
                ship.getdivPosition()
            }
        },
        handleClickRight: function (event) {
            event.preventDefault();
            var ship = this.players[0].fleet[this.players[0].activeShip];
            let sizeHeightShip = ship.dom.style.height

            if (ship.getRotate() == true){
                ship.setRotate(false)
            } else if (ship.getRotate() == false){
                ship.setRotate(true)
            }

            ship.dom.style.height = ship.dom.style.width;
            ship.dom.style.width = sizeHeightShip;
            ship.dom.style.zIndex = -1;
        },
        handleClick: function (e) {
            // self garde une référence vers "this" en cas de changement de scope
            var self = this;
            // si on a cliqué sur une cellule (délégation d'événement)
            if (e.target.classList.contains('cell')) {
                // si on est dans la phase de placement des bateau
                if (this.getPhase() === this.PHASE_INIT_PLAYER) {
                    // on enregistre la position du bateau, si cela se passe bien (la fonction renvoie true) on continue
                    if (this.players[0].setActiveShipPosition(utils.eq(e.target), utils.eq(e.target.parentNode), this.players[0].fleet[this.players[0].activeShip].getRotate())) {
                        // et on passe au bateau suivant (si il n'y en plus la fonction retournera false)
                        if (!this.players[0].activateNextShip()) {
                            this.wait();
                            utils.confirm("Confirmez le placement ?", function () {
                                // si le placement est confirmé
                                self.stopWaiting();
                                // self.miniGrid = self.Grid
                                self.renderMiniMap();
                                self.players[0].clearPreview();
                                self.goNextPhase();
                            }, function () {
                                self.stopWaiting();
                                // sinon, on efface les bateaux (les positions enregistrées), et on recommence
                                self.players[0].resetShipPlacement();
                            });
                        }
                    }
                // si on est dans la phase de jeu (du joueur humain)
                } else if (this.getPhase() === this.PHASE_PLAY_PLAYER) {
                    this.players[0].play(utils.eq(e.target), utils.eq(e.target.parentNode));
                }
            }
        },
        // fonction utlisée par les objets représentant les joueurs (ordinateur ou non)
        // pour placer un tir et obtenir de l'adversaire l'information de réusssite ou non du tir
        fire: function (from, col, line, callback) {
            var fireAudio = new Audio('./sound/fire.mp3')
            var hitAudio = new Audio('./sound/hit.mp3')
            var missAudio = new Audio('./sound/miss.mp3')
            fireAudio.play()
            this.wait();
            var self = this;
            var msg = "";

            // determine qui est l'attaquant et qui est attaqué
            var target = this.players.indexOf(from) === 0
                ? this.players[1]
                : this.players[0];

            if (this.currentPhase === this.PHASE_PLAY_OPPONENT) {
                msg += "Votre adversaire vous a... ";
            }
            // console.table(target.grid)
            var phase = this.currentPhase
            // on demande à l'attaqué si il a un bateaux à la position visée
            // le résultat devra être passé en paramètre à la fonction de callback (3e paramètre)
            target.receiveAttack(col, line, phase, function (hasSucceed, shipId){
                
                if (hasSucceed) {
                    msg += "Touché !";
                    setTimeout(() => {
                        hitAudio.play()
                    }, 500)
                    
                    
                } else {
                    msg += "Manqué...";
                    setTimeout(() => {
                        missAudio.play()
                    }, 500)
                }
                utils.info(msg);

                // on invoque la fonction callback (4e paramètre passé à la méthode fire)
                // pour transmettre à l'attaquant le résultat de l'attaque
                callback(hasSucceed, shipId);

                var destroyed;
                if (shipId != undefined) {
                    if (shipId == 1) {
                        target.fleet[0].life -= 1
                        if ( target.fleet[0].life == 0) {
                            destroyed = document.getElementsByClassName('battleship')[0]
                            destroyed.classList.add("sunk") 
                        }
                    } else if (shipId == 2) {
                        target.fleet[1].life -= 1
                        if ( target.fleet[1].life == 0) {
                            destroyed = document.getElementsByClassName('destroyer')[0]
                            destroyed.classList.add("sunk") 
                        }
                    } else if (shipId == 3) {
                        target.fleet[2].life -= 1
                        if ( target.fleet[2].life == 0) {
                            destroyed = document.getElementsByClassName('submarine')[0]
                            destroyed.classList.add("sunk") 
                        }
                    } else if (shipId == 4) {
                        target.fleet[3].life -= 1
                        if ( target.fleet[3].life == 0) {
                            destroyed = document.getElementsByClassName('small-ship')[0]
                            destroyed.classList.add("sunk") 
                        }
                    }
                }
                // on fait une petite pause avant de continuer...
                self.wait()
                // histoire de laisser le temps au joueur de lire les message affiché
                setTimeout(function () {
                    self.stopWaiting();
                    self.goNextPhase();
                }, 1000);
            });

        },
        renderMap: function () {
            this.players[0].renderTries(this.grid);
        },

        renderMiniMap: function () {
            this.players[0].renderShips(this.miniGrid);
            this.players[1].renderTriesComputer(this.miniGrid);
        }
    };

    // point d'entrée
    document.addEventListener('DOMContentLoaded', function () {
        game.init();
    });

}());