// import Character from '../js/Character.js';
import { characterGenerator, generateTeam } from "../js/generators"
import Bowman from "../js/characters/Bowman";
import Swardsman from "../js/characters/Swordsman";
import Magician from "../js/characters/Magician";
import Daemon from "../js/characters/Daemon";
import Vampire from "../js/characters/Vampire";
import Undead from "../js/characters/Undead";

test('Test number of new characters created', () => {

  const characterTypes =[Bowman, Swardsman, Magician, Daemon, Vampire, Undead]
  const characters = [];
  const numberOfCharacters = 500;

  for (let i = 0; i < numberOfCharacters; i++) characters.push(characterGenerator(characterTypes, 2));
  expect(characters.length).toBe(numberOfCharacters);
})

test('Test team size', () => {

  const characterTypes =[Bowman, Swardsman, Magician, Daemon, Vampire, Undead]
  const numberOfCharacters = 10;
  const team = generateTeam(characterTypes, 4, numberOfCharacters)

  expect(team.characters.length).toBe(numberOfCharacters);
  expect(team.characters.length).toBe(numberOfCharacters);
})

describe('Test team level', () => {
  const characterTypes =[Bowman, Swardsman, Magician, Daemon, Vampire, Undead]
  const numberOfCharacters = 20;
  const team = generateTeam(characterTypes, 4, numberOfCharacters)

  test.each(team.characters)('Test %o level', (character) => {
    expect(character.level).toBeLessThanOrEqual(4);
    expect(character.level).toBeGreaterThanOrEqual(1);
  })
})




