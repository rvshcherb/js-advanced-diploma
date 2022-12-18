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
    this.selectedUnit = null;
  }

  init() {
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
    this.teamPlayer = generateTeam([Bowman, Swardsman, Magician], 2, 4, false);
    this.teamComputer = generateTeam([Vampire, Daemon, Undead], 2, 4, true);
    [this.teamPlayer, this.teamComputer].forEach((team) => team.generatePositions());

    this.gamePlay.drawUi(themes.prairie);
    this.refresh();

    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
  }

  refresh() {
    this.gamePlay.redrawPositions(this.teamPlayer.characters.concat(this.teamComputer.characters));
  }

  attack(attacker, target) {
    const damage = Team.calcDamage(attacker, target);
    target.character.health -= damage;
    this.gamePlay.showDamage(target.position, damage)
      .then(() => [attacker.position, target.position].forEach((item) => this.gamePlay.deselectCell(item)))
      .then(() => this.refresh());
  }

  move() {
    const { character, position } = this.teamComputer.aiMove();
    character.position = position;
    this.refresh();
  }

  implementAI() {
    setTimeout(() => {
      const { attacker, target } = this.teamComputer.aiAttack(this.teamPlayer);
      if (attacker || target) {
        this.gamePlay.selectCell(attacker.position);
        this.gamePlay.selectCell(target.position, 'red');
        this.attack(attacker, target);
      } else {
        this.move();
        console.log('Противник куда-то ходит');
      }
    }, 1000);
  }

  onCellClick(index) {
    if (this.selectedUnit) {
      if (this.gamePlay.cells[index].children.length > 0) {
        const clickedUnit = this.teamPlayer.pickUnit(index);
        if (clickedUnit && clickedUnit !== this.selectedUnit) {
          // перевыбор игрока
          this.gamePlay.deselectCell(this.selectedUnit.position);
          this.selectedUnit = clickedUnit;
          this.teamPlayer.calcActions(this.selectedUnit);
          this.gamePlay.selectCell(index);
        } else if (!clickedUnit) {
          // атака пользователя
          if (this.teamPlayer.attackRange.includes(index)) {
            const targetObj = this.teamComputer.pickUnit(index);
            this.attack(this.selectedUnit, targetObj);
            this.selectedUnit = null;

            // Действие компьютера
            this.implementAI();
          } else {
            alert('Target is too far for this unit');
          }
        }
      } else if (this.teamPlayer.moveRange.includes(index)) {
        // перемещение пользователя
        this.gamePlay.deselectCell(this.selectedUnit.position);
        this.gamePlay.deselectCell(index);
        this.selectedUnit.position = index;
        this.gamePlay.redrawPositions(this.teamPlayer.characters.concat(this.teamComputer.characters));
        this.selectedUnit = null;

        // Действие компьютера
        this.implementAI();
      } else {
        alert('Position is out of unit\'s move range');
      }
    } else if (this.gamePlay.cells[index].children.length > 0) {
      const clickedUnit = this.teamPlayer.pickUnit(index);
      if (clickedUnit) {
        this.selectedUnit = clickedUnit;
        this.teamPlayer.calcActions(this.selectedUnit);
        this.gamePlay.selectCell(index);
      } else {
        alert('You are not allowed to choose this character');
      }
    } else {
      alert('Nothing to select');
    }
  }

  onCellEnter(index) {
    if (this.gamePlay.cells[index].children.length > 0) {
      const hoverUnit = this.teamPlayer.pickUnit(index) ?? this.teamComputer.pickUnit(index);
      // console.log(hoverUnit);
      const {
        level,
        attack,
        defence,
        health,
      } = hoverUnit.character;
      this.gamePlay.showCellTooltip(`\u{1F396}${level} \u{2694}${attack} \u{1F6E1}${defence} \u{2764}${health}`, index);
    }

    if (this.selectedUnit) {
      this.gamePlay.setCursor(cursors.notallowed);
      if (this.gamePlay.cells[index].children.length > 0) {
        if (this.teamPlayer.pickUnit(index)) {
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
    if (this.selectedUnit && index !== this.selectedUnit.position) this.gamePlay.deselectCell(index);
  }
}
