import Team from "./Team";
import { generateTeam } from "./generators";

import Daemon from "./characters/Daemon";
import Vampire from "./characters/Vampire";
import Undead from "./characters/Undead";

export default class ComputerTeam extends Team {
  constructor() {
    super();
    this.sideOffset = 6;
    this.allowedTypes = [Daemon, Vampire, Undead];
  }

  createTeam() {
    this.unpositionedCharacters = generateTeam(this.allowedTypes, {
      maxLevel: 2,
      characterCount: 4,
    });
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
