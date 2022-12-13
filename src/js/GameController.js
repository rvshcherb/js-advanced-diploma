import themes from "./themes";
import { generateTeam } from "./generators";
import Team from "./Team";
import cursors from "./cursors";

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
    this.teamPlayer = null;
    this.teamComputer = null;
    this.characters = null;
    this.currentUnit = null;
    this.currentUnitTeam = null;
  }

  init() {
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
    this.teamPlayer = generateTeam([Bowman, Swardsman, Magician], 2, 4, false);
    this.teamPlayer.generatePositions();
    this.teamComputer = generateTeam([Vampire, Daemon, Undead], 2, 4, true);
    this.teamComputer.generatePositions();
    this.characters = this.teamPlayer.positionedCharachters.concat(this.teamComputer.positionedCharachters);

    this.gamePlay.drawUi(themes.prairie);
    this.gamePlay.redrawPositions(this.characters);

    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
  }

  onCellClick(index) {
    if (this.currentUnit) { // Проверка есть ли на поле выбранные персонаж
      if (this.gamePlay.cells[index].children.length > 0) { // Проверка если кликнутое поле содержит персонаж
        const clickedUnit = Team.getUnit(this.characters, index);
        const clickedUnitTeam = Team.checkTeam(clickedUnit);
        if (clickedUnitTeam === 'player') { // Проверка если кликнутый персонаж из моей команды
          this.currentUnit = clickedUnit;
          this.teamPlayer.calcActions(this.currentUnit);
          const selectedCell = this.gamePlay.cells.findIndex((cell) => cell.classList.contains('selected-yellow'));
          if (selectedCell !== -1) this.gamePlay.deselectCell(selectedCell);
          this.gamePlay.selectCell(index);
        } else if (this.teamPlayer.attackRange.some((item) => item === index)) { // Проверка попадает ли индекс позиции врага в радиус атаки героя
          const damage = Team.calcDamage(this.currentUnit, clickedUnit);
          clickedUnit.character.health -= 1;
          this.gamePlay.showDamage(index, damage).then(() => this.gamePlay.redrawPositions(this.characters));
        } else {
          alert('Too far to attack');
        }
      } else if (this.teamPlayer.moveRange.some((item) => item === index)) { // Проверка попадает ли индекс клетки в радиус перемещения
        this.gamePlay.deselectCell(this.currentUnit.position);
        this.currentUnit.position = index;
        this.gamePlay.redrawPositions(this.characters);
        this.currentUnit = null;
      } else {
        alert('Not allowed to move here');
      }
    } else if (this.gamePlay.cells[index].children.length > 0) {
      this.currentUnit = Team.getUnit(this.characters, index);
      this.currentUnitTeam = Team.checkTeam(this.currentUnit);
      console.log(this.currentUnitTeam);

      if (this.currentUnitTeam === 'player') {
        this.teamPlayer.calcActions(this.currentUnit);
        const selectedCell = this.gamePlay.cells.findIndex((cell) => cell.classList.contains('selected-yellow'));
        if (selectedCell !== -1) this.gamePlay.deselectCell(selectedCell);
        this.gamePlay.selectCell(index);
      } else {
        this.currentUnit = null;
        alert('Wrong team character');
      }
    } else {
      alert('No unit to choose');
    }

    // this.teamComputer.ai([{position: 7}, {position: 23}, {position: 39}, {position: 55}]);
    this.teamComputer.ai(this.teamPlayer);
  }

  onCellEnter(index) {
    if (this.gamePlay.cells[index].children.length > 0) {
      this.characters.forEach((element) => {
        if (element.position === index) {
          const {
            level,
            attack,
            defence,
            health,
          } = element.character;
          this.gamePlay.showCellTooltip(`\u{1F396}${level} \u{2694}${attack} \u{1F6E1}${defence} \u{2764}${health}`, index);
        }
      });
    }

    if (this.currentUnitTeam === 'player') {
      this.gamePlay.setCursor(cursors.notallowed);
      if (this.gamePlay.cells[index].children.length > 0) {
        if (Team.checkTeam(Team.getUnit(this.characters, index)) === 'player') {
          this.gamePlay.setCursor(cursors.pointer);
        } else if (this.teamPlayer.attackRange.some((item) => item === index)) {
          this.gamePlay.setCursor(cursors.crosshair);
          this.gamePlay.selectCell(index, 'red');
        }
      } else if (this.teamPlayer.moveRange.some((item) => item === index)) {
        this.gamePlay.setCursor(cursors.pointer);
        this.gamePlay.selectCell(index, 'green');
      }
    }
  }

  onCellLeave(index) {
    this.gamePlay.hideCellTooltip(index);
    this.gamePlay.setCursor(cursors.auto);
    const selectedCell = this.gamePlay.cells.findIndex((cell) => cell.classList.contains('selected-yellow'));
    if (index !== selectedCell) this.gamePlay.deselectCell(index);
  }
}
