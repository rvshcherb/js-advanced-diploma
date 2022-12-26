import PositionedCharacter from "./PositionedCharacter";

/**
 * Класс, представляющий персонажей команды
 *
 * @todo Самостоятельно продумайте хранение персонажей в классе
 * Например
 * @example
 * ```js
 * const characters = [new Swordsman(2), new Bowman(1)]
 * const team = new Team(characters);
 *
 * team.characters // [swordsman, bowman]
 * ```
 * */
export default class Team {
  // TODO: write your logic here
  constructor() {
    this.characters = null;
    this.unpositionedCharacters = null;
    this.moveRange = null;
    this.attackRange = null;
    this.selectedUnit = null;
  }

  calcMoveRange(unit) {
    const stepsArr = [];
    const { moveOffset } = unit.character;
    const index = unit.position;

    for (let i = 1; i <= moveOffset; i += 1) {
      stepsArr.push(index + 8 * i);
      stepsArr.push(index - 8 * i);

      if (Math.floor(index / 8) === Math.floor((index + i) / 8)) { // Условие проверки переполнения ходов по правой границе игрового поля
        stepsArr.push(index + i);
        stepsArr.push(index - 8 * i + i);
        stepsArr.push(index + 8 * i + i);
      }

      if (Math.floor(index / 8) === Math.floor((index - i) / 8)) { // Условие проверки переполнения ходов по левой границе игрового поля
        stepsArr.push(index - i);
        stepsArr.push(index - 8 * i - i);
        stepsArr.push(index + 8 * i - i);
      }
    }

    this.moveRange = stepsArr.filter((item) => item >= 0 && item <= 63);
  }

  calcAttackRange(unit) {
    const attackArr = [];
    const { attackOffset } = unit.character;
    const index = unit.position;

    for (let i = 1; i <= attackOffset; i += 1) {
      attackArr.push(index + 8 * i);
      attackArr.push(index - 8 * i);

      for (let j = 1; j <= attackOffset; j += 1) {
        if (Math.floor(index / 8) === Math.floor((index + i) / 8)) { // Условие проверки переполнения ходов по правой границе игрового поля
          attackArr.push(index + i);
          attackArr.push((index + i) + 8 * j);
          attackArr.push((index + i) - 8 * j);
        }

        if (Math.floor(index / 8) === Math.floor((index - i) / 8)) { // Условие проверки переполнения ходов по левой границе игрового поля
          attackArr.push(index - i);
          attackArr.push((index - i) + 8 * j);
          attackArr.push((index - i) - 8 * j);
        }
      }
    }

    this.attackRange = attackArr.filter((item) => item >= 0 && item <= 63).sort((a, b) => a - b);
  }

  calcActions(unit) {
    if (this.characters.length > 0) {
      this.calcMoveRange(unit);
      this.calcAttackRange(unit);
    }
  }

  generatePositions(team) {
    const availablePositionSet = new Set();
    const positions = availablePositionSet[Symbol.iterator]();
    const positionedCharachters = [];

    while (availablePositionSet.size < team.length) {
      const random = (8 * Math.floor(Math.random() * 8) + this.sideOffset) + (Math.floor(Math.random() * 2));
      availablePositionSet.add(random);
    }

    for (let i = 0; i < team.length; i += 1) {
      positionedCharachters.push(new PositionedCharacter(team[i], positions.next().value));
    }
    return positionedCharachters;
  }

  placeCharacters(team) {
    this.characters = this.generatePositions(team);
  }

  pickUnit(index) {
    return this.characters.find((item) => item.position === index);
  }

  checkIfTeamDead() {
    return this.characters.length <= 0;
  }

  static checkIfUnitDead(unit, targetTeam) {
    if (unit.character.health <= 0) {
      const targetIndex = targetTeam.characters.findIndex((item) => item.position === unit.position);
      targetTeam.characters.splice(targetIndex, 1);
      console.log(targetTeam);
    }
  }

  static calcDamage(atacker, target) {
    return Math.max(atacker.character.attack - target.character.defence, atacker.character.attack * 0.1);
  }
}
