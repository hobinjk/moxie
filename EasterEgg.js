const konamiKeys = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
  'Enter',
];

const substitutions = {
  notAGoodPlayer: [
    `you are $bad`, `you make me sick`,
    `you should have slash gee geed before you logged in`,
    `you should uninstall`, `uninstall`, `unplug your computer`,
    `you are too heavy for north america, go to europe`,
    `you must be from north america`,
    `is that you jil`, `go back to ERPing`,
    `I digital vomited in my digital mouth`, `go play $mmo`,
    `think about all the people you have let down with your $bad gameplay`,
    `if you want to be rewarded for being so $bad just play $mmo`,
    `blocked and reported`,
    `why not try some world bosses instead`,
    // `gwen called, she saw you try to be a mesmer and wants you to uninstall`,
    `gwen called, she wants you to uninstall`,
    `you made taimi cry`,
    `you make gorrik wish he could have joined blish`,
    `palawa joko came back but you are so $bad it killed him again`,
    `I would rather be in the realm of torment than evaluating gameplay this $bad`,
    `thank you for giving me your account name so I can block you`,
  ],
  wastedTime: [
    `in that time I simulated $bigNumber universes, in all of them you were $bad`,
    `it took me zero point zero zero $number $number seconds to realize you will never get good`,
    `it takes just two minutes to uninstall`,
    `you could have downloaded $mmo in that time`,
    `were you $afk`,
  ],
  afraid: [`afraid`, `scared`],
  bad: [`trash`, `bad`, `terrible`, `garbage`, `subpar`, `disappointing`],
  mmo: [`wow`, `ffxiv`, `eso`, `runescape`, `guild wars one`],
  bigNumber: [
    `$number billion`,
    `$number hundred $doubleDigitNumber million $number hundred $doubleDigitNumber thousand $number hundred $doubleDigitNumber`,
  ],
  number: [`one`, `two`, `three`, `four`, `five`, `six`, `seven`, `eight`, `nine`],
  doubleDigitNumber: [
    `seventeen`,
    `twelve`,
    `twenty $number`,
    `thirty $number`,
    `forty $number`,
    `fifty $number`,
    `sixty $number`,
    `seventy $number`,
    `eighty $number`,
    `ninety $number`,
  ],
  afk: [
    `afk`,
    `walking the dog`,
    `on a bio break`,
    `busy losing a raid tournament because you messed up reflect`,
  ],
  lostCast: [
    `you may hate $spell but I hate your inability to play more`,
    `you do realize $spell does damage`,
    `$spell is your friend, unlike me`,
    `poor thing, in your hands $spell is just as nonexistent as zojja`,
  ],
};
const substitutionsOriginal = JSON.stringify(substitutions);

function substitute(text) {
  while (text.includes('$')) {
    const match = /\$(\w+)/.exec(text);
    if (!match) {
      return text;
    }
    const choices = substitutions[match[1]];
    if (!choices || choices.length === 0) {
      console.warn('Unable to substitute', match[1]);
      return text;
    }

    const choiceI = Math.floor(Math.random() * choices.length);
    const choice = choices[choiceI];
    text = text.replace(match[0], choice);
  }
  return text;
}

function getText() {
  const reportCardItems = document.querySelectorAll('.report-card-item');
  if (reportCardItems.length === 0) {
    return 'too $afraid to upload a log? $notAGoodPlayer';
  }
  let text = '';

  for (const item of reportCardItems) {
    const grade = item.querySelector('.grade').textContent;
    if (grade === 'S') {
      continue;
    }
    let explanation = `you ${item.querySelector('.explanation').textContent.toLowerCase()}.`;
    explanation = explanation.replace('/', ' out of an ideal ');
    let startToken = 'notAGoodPlayer';
    if (Math.random() > 0.3) {
      if (explanation.includes('cast')) {
        startToken = 'lostCast';
      } else if (explanation.includes('seconds')) {
        startToken = 'wastedTime';
      }
    }
    const insults = substitutions[startToken];
    if (item.dataset.spell) {
      substitutions.spell = [item.dataset.spell];
    } else {
      substitutions.spell = [
        'that spell',
        'that ability',
        'that skill',
        'that spell',
        'that ability',
        'that skill',
        'pressing keys',
      ];
    }
    const insultI = Math.floor(Math.random() * insults.length);
    const insult =
      substitute(insults[insultI]);

    substitutions[startToken].splice(insultI, 1);
    if (substitutions[startToken].length === 0) {
      substitutions[startToken] = JSON.parse(substitutionsOriginal)[startToken];
    }
    text += `${explanation} ${insult}. `;
  }
  if (text === '') {
    return 'maybe you aren\'t completely $bad. just kidding, $notAGoodPlayer';
  }
  return text;
}

function speak(text) {
  const synth = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance(text);
  for (let voice of synth.getVoices()) {
    if (voice.name === 'Daniel') {
      utterance.voice = voice;
    }
  }
  utterance.rate = 1.2;
  synth.speak(utterance);
}

function doTheThing() {
  const text = getText();
  console.log('doing the thing', text);
  speak(text);
}

let index = 0;
export default {
  attach: function() {
    document.body.addEventListener('keydown', function(event) {
      let expectedKey = konamiKeys[index];
      if (event.key !== expectedKey) {
        index = 0;
        return;
      }
      index += 1;
      if (index >= konamiKeys.length) {
        doTheThing();
        index = 0;
      }
    });
  },
};
