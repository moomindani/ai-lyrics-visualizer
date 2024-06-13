import { Player, Ease } from "textalive-app-api";
import { getReply } from './wwllm'

const player = new Player({
  app: {
    token: "WWvjJHTdwTORGwNI"
  },
  mediaElement: document.querySelector("#media"),
  valenceArousalEnabled: true,
  vocalAmplitudeEnabled: true
});

player.addListener({
  onAppReady,
  onTimerReady,
  onTimeUpdate,
  onThrottledTimeUpdate
});

const playBtn = document.querySelector("#play");
const jumpBtn = document.querySelector("#jump");
const pauseBtn = document.querySelector("#pause");
const rewindBtn = document.querySelector("#rewind");
const llmBtn = document.querySelector("#llm");
const positionEl = document.querySelector("#position strong");

const artistSpan = document.querySelector("#artist span");
const songSpan = document.querySelector("#song span");
const beatbarEl = document.querySelector("#beatbar");
let c;
let max_vocal=0, min_vocal=100000000;
let refrain_status =0;  // 0: non-refrain, 1: left-refrain, 2: right-refrain
let refrainedPhrase = '';
// let refrain_list = ["何十回も", "何百回も", "何千回も", "何万回も", "何回でも", "何回だって"]
let refrain_list = [];

function onAppReady(app) {
  if (!app.managed) {
    document.querySelector("#control").style.display = "block";
    playBtn.addEventListener("click", () => player.video && player.requestPlay());
    jumpBtn.addEventListener("click", () => player.video && player.requestMediaSeek(player.video.firstPhrase.startTime));
    pauseBtn.addEventListener("click", () => player.video && player.requestPause());
    rewindBtn.addEventListener("click", () => player.video && player.requestMediaSeek(0));
    llmBtn.addEventListener("click", () => startLLM());
  }
  if (!app.songUrl) {
    // フューチャーノーツ / shikisai
    player.createFromSongUrl("https://piapro.jp/t/XiaI/20240201203346", {
      video: {
        // 音楽地図訂正履歴
        beatId: 4592297,
        chordId: 2727637,
        repetitiveSegmentId: 2824328,
        // 歌詞タイミング訂正履歴: https://textalive.jp/lyrics/piapro.jp%2Ft%2FXiaI%2F20240201203346
        lyricId: 59417,
        lyricDiffId: 13964
      },
    });
    // // いつか君と話したミライは / タケノコ少年
    // player.createFromSongUrl("https://piapro.jp/t/--OD/20240202150903", {
    //   video: {
    //     // 音楽地図訂正履歴
    //      beatId: 4592296,
    //      chordId: 2727636,
    //      repetitiveSegmentId: 2824327,
    //      // 歌詞タイミング訂正履歴: https://textalive.jp/lyrics/piapro.jp%2Ft%2F--OD%2F20240202150903
    //      lyricId: 59416,
    //      lyricDiffId: 13963
    //    },
    //  });
  }
  c = null;
}

function startLLM(){
  const prompt = "Can you analyze this lyrics marked in lyrics tag, and retrieve all occurrences of refrained phrases from there?" +
      "For example, \"何十回も何百回も星の降る夜を超えて\" needs to be converted to \"<refrain>何十回も</refrain><refrain>何百回も</refrain>星の降る夜を超えて\". " +
      "For another example, \"セカイ　セカイ　セカイ\n\" needs to be converted to \"<refrain>セカイ</refrain><refrain>セカイ</refrain><refrain>セカイ</refrain>\". " +
      "<lyrics>" + player.data.lyricsBody.text + "</lyrics>"
  getReply(prompt).then(reply=> {
    console.log(reply);
    let analyzedEl = document.createElement("div");
    analyzedEl.innerHTML = reply;
    const matches = analyzedEl.querySelectorAll("refrain")
    const tmp_refrain_list = []
    matches.forEach((match) => {
      console.log("match refrain:" + match.textContent);
      tmp_refrain_list.push(match.textContent)
    });
    refrain_list = Array.from(new Set(tmp_refrain_list)); // remove duplicates
  }).catch(error=> {
    console.error(error);
  });

}
function onTimerReady() {
  artistSpan.textContent = player.data.song.artist.name;
  songSpan.textContent = player.data.song.name;

  document
    .querySelectorAll("button")
    .forEach((btn) => (btn.disabled = false));

  let p = player.video.firstPhrase;
  jumpBtn.disabled = !p;

  console.log("player.data.lyricsBody.text:" + player.data.lyricsBody.text)
  console.log("player.video.phrases:" + player.video.phrases)

  // set `animate` method
  while (p && p.next) {
    p.animate = animatePhrase;
    p = p.next;
  }
}

String.prototype.replaceAt = function(index, replacement) {
    return this.substring(0, index) + replacement;
    // return this.substring(0, index) + replacement + this.substring(index+1);
}

function onTimeUpdate(position) {

  // show beatbar
  const beat = player.findBeat(position);
  if (!beat) {
    return;
  }
  beatbarEl.style.width = `${Math.ceil(Ease.circIn(beat.progress(position)) * 100)}%`;

  // 100ms先に発声される文字を取得
  let current = c || player.video.firstChar;
  let newPhrase = false;

  while (current && current.startTime < position + 200) {
    // 新しい文字が発声されようとしている
    if (c !== current) {
      console.log("char:" + current.text);
      console.log("word:" + current.parent.text);
      console.log("word pos:" + current.parent.pos);
      console.log("phrase:" + current.parent.parent.text);

      console.log("char index in phrase:" + current.parent.parent.findIndex(current) )
      console.log("word index in phrase:" + current.parent.parent.findIndex(current.parent) )

      // 新しいフレーズの開始
      if (!newPhrase && current.parent.parent.findIndex(current)==0) {
        newPhrase = true;
        console.log("!!!new phrase!!!")

        let currentPhraseEl = document.querySelector("#container p");
        let newPhraseEl = document.createElement("p");
        let containerEl = document.querySelector("#container")
        containerEl.replaceChild(newPhraseEl, currentPhraseEl)

        let refrain1El = document.querySelector("#container-v #refrain1");
        let refrain2El = document.querySelector("#container-v #refrain2");
        refrain1El.textContent = '';
        refrain2El.textContent = '';
        refrainedPhrase = ''
      } else {
        newPhrase = false;
      }

      if (max_vocal < player.getVocalAmplitude(current.startTime)) {
        max_vocal = player.getVocalAmplitude(current.startTime)
      }
      if (min_vocal > player.getVocalAmplitude(current.startTime)) {
        min_vocal = player.getVocalAmplitude(current.startTime)
      }
      console.log("player.getValenceArousal:" + player.getValenceArousal(current.startTime).a + "," + player.getValenceArousal(current.startTime).v);
      console.log("player.getVocalAmplitude:" + player.getVocalAmplitude(current.startTime) + "(max:"+ max_vocal + ",min:" + min_vocal + ")");

      let char_index = current.parent.parent.findIndex(current)
      let phrase = current.parent.parent.text

      refrain_list.forEach((element) => {
          // console.log("phrase.substring(char_index):" + phrase.substring(char_index))
          // console.log("phrase.substring(0, char_index):" + phrase.substring(0, char_index))
          if (phrase.substring(char_index).startsWith(element)) {
            if (refrain_status === 0 || refrain_status === 2) {
              let currentRefrain1El = document.querySelector("#container-v #refrain1");
              let newRefrain1El = document.createElement("p");
              newRefrain1El.id = "refrain1"
              let containerVEl = document.querySelector("#container-v")
              containerVEl.replaceChild(newRefrain1El, currentRefrain1El)
              newRefrain1El.textContent = element;
              console.log("refrain1");
              refrainedPhrase += element;
              console.log("refrainedPhrase:" + refrainedPhrase);
              refrain_status = 1;
            } else if (refrain_status ===1) {
              let currentRefrain2El = document.querySelector("#container-v #refrain2");
              let newRefrain2El = document.createElement("p");
              newRefrain2El.id = "refrain2"
              let containerVEl = document.querySelector("#container-v")
              containerVEl.replaceChild(newRefrain2El, currentRefrain2El)
              newRefrain2El.textContent = element;
              console.log("refrain2");
              refrainedPhrase += element;
              console.log("refrainedPhrase:" + refrainedPhrase);
              refrain_status = 2;
            }
          } else if (phrase.substring(0, char_index).endsWith(element)) {
            if (refrain_status === 1) {
              console.log("refrain1 end");
              console.log("refrainedPhrase:" + refrainedPhrase);
            } else if (refrain_status === 2) {
              console.log("refrain2 end");
              console.log("refrainedPhrase:" + refrainedPhrase);
              refrain_status = 0;
            }
          }
        }
      )

      if (refrain_status === 0) {
        let phraseEl = document.querySelector("#container p");
        if (refrainedPhrase != '') {
          let index = phrase.indexOf(refrainedPhrase);
          if (index !== -1) {
            phrase = phrase.slice(0, index) + phrase.slice(index + refrainedPhrase.length);
            console.log("minus refrain: " + phrase);
            char_index -= refrainedPhrase.length;
          }
        }
        phraseEl.innerHTML = phrase.replaceAt(char_index, "<strong>" + current.text + "</strong>");
        console.log("innerHTML:" + phraseEl.innerHTML)
      }
      c = current;
    }
    current = current.next;
  }

}

function onThrottledTimeUpdate(position) {
  positionEl.textContent = String(Math.floor(position));
}

function animatePhrase(now, unit) {
  // show current phrase
  if (unit.contains(now)) {
    //phraseEl.textContent = unit.text;
  }
}