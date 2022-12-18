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
  constructor(characters, isEnemy) {
    this.characters = characters;
    this.isEnemy = isEnemy;
    this.moveRange = null;
    this.attackRange = null;
    this.selectedUnit = null;
  }

  calcMoveRange(unit) {
    const stepsArr = [];
    const { type } = unit.character;
    const index = unit.position;
    let offset;

    switch (type) {
      case 'swordsman':
      case 'daemon':
        offset = 4;
        break;
      case 'bowman':
      case 'vampire':
        offset = 2;
        break;
      default:
        offset = 1;
    }

    for (let i = 1; i <= offset; i += 1) {
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
    const { type } = unit.character;
    const index = unit.position;
    let offset;

    switch (type) {
      case 'magician':
      case 'daemon':
        offset = 4;
        break;
      case 'bowman':
      case 'vampire':
        offset = 2;
        break;
      default:
        offset = 1;
    }

    for (let i = 1; i <= offset; i += 1) {
      attackArr.push(index + 8 * i);
      attackArr.push(index - 8 * i);

      for (let j = 1; j <= offset; j += 1) {
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
    this.calcMoveRange(unit);
    this.calcAttackRange(unit);
  }

  generatePositions() {
    const availablePositionSet = new Set();
    const positions = availablePositionSet[Symbol.iterator]();
    const positionedCharachters = [];
    let teamSide = 0;

    if (this.isEnemy) teamSide = 6;

    while (availablePositionSet.size < this.characters.length) {
      const random = (8 * Math.floor(Math.random() * 8) + teamSide) + (Math.floor(Math.random() * 2));
      availablePositionSet.add(random);
    }

    for (let i = 0; i < this.characters.length; i += 1) {
      positionedCharachters.push(new PositionedCharacter(this.characters[i], positions.next().value));
    }
    this.characters = positionedCharachters;
  }

  pickUnit(index) {
    return this.characters.find((item) => item.position === index);
  }

  static calcDamage(atacker, target) {
    return Math.max(atacker.character.attack - target.character.defence, atacker.character.attack * 0.1);
  }

  aiAttack(enemyTeam) {
    const targetIndexArr = enemyTeam.characters.map((item) => item.position);
    const attacker = this.characters.find((unit) => {
      this.calcActions(unit);
      return targetIndexArr.some((item) => this.attackRange.includes(item));
    });
    const targetIndex = targetIndexArr.find((position) => this.attackRange.includes(position));
    const target = enemyTeam.pickUnit(targetIndex);

    return { attacker, target };
  }

  aiMove() {
    const character = this.characters[Math.floor(Math.random() * this.characters.length)];
    this.calcActions(character);
    const position = this.moveRange[Math.floor(Math.random() * this.moveRange.length)];

    return { character, position };
  }
}
