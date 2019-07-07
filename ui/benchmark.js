import benchmarkDaredevil from './benchmarks/daredevil';
import benchmarkMirage from './benchmarks/mirage';
import benchmarkBtthSmall from './benchmarks/btth-small';
import benchmarkBtthLarge from './benchmarks/btth-large';
import benchmarkChronoDomi from './benchmarks/chrono-domi-two-clone';
import SkillIds from './SkillIds';

export default function(log, selectedPlayer) {
  const spec = selectedPlayer.agent.Player.prof_spec;
  if (spec === 'Weaver') {
    // See if arcane blast was cast
    for (let cast of log.casts) {
      if (cast.id === SkillIds.ARCANE_BLAST) {
        return benchmarkBtthSmall;
      }
    }
    return benchmarkBtthLarge;
  }

  if (spec === 'Daredevil') {
    return benchmarkDaredevil;
  }
  if (spec === 'Mirage') {
    return benchmarkMirage;
  }
  if (spec === 'Chronomancer') {
    return benchmarkChronoDomi;
  }

  return [];
}
