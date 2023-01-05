import themes from "./themes";
import Team from "./Team";
import MyTeam from "./MyTeam";
import ComputerTeam from "./ComputerTeam";
import cursors from "./cursors";
import Character from "./Character";

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.teamPlayer = null;
    this.teamComputer = null;
    this.selectedUnit = null;
    this.level = 0;
  }

  init() {
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService

    this.newGame();

    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));

    this.gamePlay.addNewGameListener(this.onNewGameClick.bind(this));
    this.gamePlay.addSaveGameListener(this.onSaveGameClick.bind(this));
    this.gamePlay.addLoadGameListener(this.onLoadGameClick.bind(this));
  }

  refresh() {
    this.gamePlay.redrawPositions(this.teamPlayer.characters.concat(this.teamComputer.characters));
  }

  newGame() {
    this.teamPlayer = new MyTeam();
    this.teamComputer = new ComputerTeam();

    [this.teamPlayer, this.teamComputer].forEach((team) => {
      team.createTeam();
      team.placeCharacters(team.unpositionedCharacters);
    });

    this.gamePlay.drawUi(Object.values(themes)[this.level]);
    this.refresh();
  }

  levelUp() {
    if (this.level < 3) {
      this.level += 1;
      this.teamComputer.createTeam();
      this.teamComputer.placeCharacters(this.teamComputer.unpositionedCharacters);
      this.teamPlayer.upgrade();
      this.gamePlay.drawUi(Object.values(themes)[this.level]);
      this.refresh();
    }
  }

  attack(attacker, target, targetTeam) {
    const damage = Team.calcDamage(attacker, target);
    target.character.health -= damage;
    this.gamePlay.showDamage(target.position, damage)
      .then(() => [attacker.position, target.position].forEach((item) => this.gamePlay.deselectCell(item)))
      .then(() => Team.checkIfUnitDead(target, targetTeam))
      .then(() => targetTeam.checkIfTeamDead())
      .then((result) => {
        if (targetTeam === this.teamComputer) {
          if (result) this.levelUp();
        } else if (result) {
          console.log('Game Over');
        }
      })
      .then(() => this.refresh());
  }

  move() {
    const { character, position } = this.teamComputer.aiMove();
    if (character) {
      character.position = position;
      this.refresh();
    }
  }

  implementAI() {
    setTimeout(() => {
      const { attacker, target } = this.teamComputer.aiAttack(this.teamPlayer);
      if (attacker) {
        this.gamePlay.selectCell(attacker.position);
        this.gamePlay.selectCell(target.position, 'red');
        this.attack(attacker, target, this.teamPlayer);
      } else {
        this.move();
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
            this.attack(this.selectedUnit, targetObj, this.teamComputer);
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
      console.log(this.teamComputer);
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

  onNewGameClick() {
    this.newGame();
  }

  onSaveGameClick() {
    const gameState = {
      teamPlayer: this.teamPlayer,
      teamComputer: this.teamComputer,
      level: this.level,
    };

    this.stateService.save(gameState);
  }

  onLoadGameClick() {
    console.log('Game Loaded');
    const gameState = this.stateService.load();
    console.log(gameState);
    this.teamPlayer.characters = gameState.teamPlayer.characters;
    this.teamComputer.characters = gameState.teamComputer.characters;
    console.log(this.teamPlayer);
    Object.setPrototypeOf(this.teamPlayer, new MyTeam());
    Object.setPrototypeOf(this.teamComputer, new ComputerTeam());
    this.teamPlayer.characters.forEach((item) => Object.setPrototypeOf(item.character, new Character()));
    this.teamComputer.characters.forEach((item) => Object.setPrototypeOf(item.character, new Character()));
    this.level = gameState.level;
    this.gamePlay.drawUi(Object.values(themes)[this.level]);
    this.refresh();
  }
}
