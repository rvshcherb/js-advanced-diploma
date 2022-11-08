import Team from "./Team";

/**
 * Формирует экземпляр персонажа из массива allowedTypes со
 * случайным уровнем от 1 до maxLevel
 *
 * @param allowedTypes массив классов
 * @param maxLevel максимальный возможный уровень персонажа
 * @returns генератор, который при каждом вызове
 * возвращает новый экземпляр класса персонажа
 *
 */
export function* characterGenerator(allowedTypes, maxLevel) {
  // TODO: write logic here

  while (true) {
    const randomCharacter = Math.floor(Math.random() * allowedTypes.length);
    const randomLevel = Math.floor(Math.random() * maxLevel + 1);
    yield new allowedTypes[randomCharacter](randomLevel);
  }
}

/**
 * Формирует массив персонажей на основе characterGenerator
 * @param allowedTypes массив классов
 * @param maxLevel максимальный возможный уровень персонажа
 * @param characterCount количество персонажей, которое нужно сформировать
 * @returns экземпляр Team, хранящий экземпляры персонажей. Количество персонажей в команде - characterCount
 * */
export function generateTeam(allowedTypes, maxLevel, characterCount) {
  // TODO: write logic here

  const charactersArr = [];
  const getCharacter = characterGenerator(allowedTypes, maxLevel);
  let i = 0;
  while (i < characterCount) {
    charactersArr.push(getCharacter.next().value);
    i += 1;
  }
  return new Team(charactersArr);
}
