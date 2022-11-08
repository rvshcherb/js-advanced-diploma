import themes from "./themes";
import { generateTeam } from "./generators";
import Bowman from "./characters/Bowman";
import Swardsman from "./characters/Swordsman";
import Magician from "./characters/Magician";
import Daemon from "./characters/Daemon";
import Vampire from "./characters/Vampire";
import Undead from "./characters/Undead";

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
  }

  init() {
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService

    this.gamePlay.drawUi(themes.prairie);
    this.gamePlay.redrawPositions(this.placeCharcter());
  }

  onCellClick(index) {
    // TODO: react to click
  }

  onCellEnter(index) {
    // TODO: react to mouse enter
  }

  onCellLeave(index) {
    // TODO: react to mouse leave
  }

  placeCharcter() {
    const teamPlayer = generateTeam([Bowman, Swardsman, Magician], 2, 4);
    const teamComputer = generateTeam([Vampire, Daemon, Undead], 2, 4);

    const positionSetPlayer = this.generatePositionSet(teamPlayer.characters);
    const positionSetComputer = this.generatePositionSet(teamComputer.characters);

    const playerPosition = teamPlayer.characters
      .map((item, index) => ({ character: item, position: positionSetPlayer[index] }));

    const computerPosition = teamComputer.characters
      .map((item, index) => ({ character: item, position: positionSetComputer[index] }));
    return playerPosition.concat(computerPosition);
  }

  generatePositionSet(arr) {
    const availablePositionSet = [];
    let teamSide = 0;

    if (['undead', 'vampire', 'daemon'].some((item) => item === arr[0].type)) {
      teamSide = this.gamePlay.boardSize - 2;
    }

    while (availablePositionSet.length < arr.length) {
      const random = (this.gamePlay.boardSize * Math.floor(Math.random() * this.gamePlay.boardSize) + teamSide) + (Math.floor(Math.random() * 2));
      if (!availablePositionSet.find((element) => element === random)) {
        availablePositionSet.push(random);
      }
    }
    return availablePositionSet;
  }
}
