import type { ChapterContent } from '../types'

const chapter: ChapterContent = {
  id: '00',
  flashcards: [
    { id: 'c1', front: 'Was macht `map.merge(k, 1, Integer::sum)`?', back: 'Fehlt der Key: setzt `1`. Sonst: `alt + 1`.' },
  ],
  quiz: [
    {
      id: 'q1',
      prompt: 'Welchen Typ hat `names`?',
      code: `var names = users.stream().map(User::name).toList();`,
      options: ['`List<User>`', '`List<String>`', '`Stream<String>`', '`String[]`'],
      correct: 1,
      explanation: '`map(User::name)` macht aus `Stream<User>` einen `Stream<String>`, `toList()` sammelt in `List<String>`.',
    },
  ],
  katas: [
    {
      id: 'k1',
      title: 'Frequency Counter mit merge',
      level: 2,
      description: 'Implementiere `count`, das für jede Technologie zählt, wie oft sie vorkommt.',
      given: `record Dummy(String x) {}`,
      starter: `class Solution {
    static Map<String, Integer> count(List<String> technologies) {
        // TODO
        return null;
    }
}`,
      solution: `class Solution {
    static Map<String, Integer> count(List<String> technologies) {
        Map<String, Integer> counts = new HashMap<>();
        for (String tech : technologies) {
            counts.merge(tech, 1, Integer::sum);
        }
        return counts;
    }
}`,
      hints: ['Du brauchst eine Map als Zähler.', '`Map.merge`', 'für jede tech: merge(tech, 1, sum)'],
      tests: `check("Java zweimal", 2, Solution.count(List.of("Java", "Go", "Java")).get("Java"));
check("leere Liste", Map.of(), Solution.count(List.of()));`,
    },
  ],
}

export default chapter
