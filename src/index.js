const { Player } = TextAliveApp;
import { getAnalyzedList } from './wwllm'

const player = new Player({
  app: {
    token: "WWvjJHTdwTORGwNI"
  },
  valenceArousalEnabled: true,
  vocalAmplitudeEnabled: true
});

const playBtn = document.querySelector("#play");
const jumpBtn = document.querySelector("#jump");
const pauseBtn = document.querySelector("#pause");
const rewindBtn = document.querySelector("#rewind");
const llmBtn = document.querySelector("#llm");
const positionEl = document.querySelector("#position strong");

const beatbarEl = document.querySelector("#beatbar");
const seekbar = document.querySelector("#seekbar");
const paintedSeekbar = seekbar.querySelector("div");
let newPhrase = false;
let lastTime = -1;
let max_vocal=0, min_vocal=100000000;
let refrain_status =0;  // 0: non-refrain, 1: left-refrain, 2: right-refrain, 3: center-refrain
let refrainedPhrase = '';
//let word_list_refrain = ["何十回も", "何百回も", "何千回も", "何万回も", "何回でも", "何回だって", "未来"]
let word_list_refrain = [];
//let word_list_melody = ["メロディ", "歌", "声", "音", "響", "叫"];
let word_list_melody = [];
//let word_list_future = ["未来", "ミライ", "魔法", "奇跡", "キセキ", "光", "願い", "想い"];
let word_list_future = [];

const songList = [
  {
    title: "フューチャーノーツ / shikisai",
    url: "https://piapro.jp/t/XiaI/20240201203346",
    options: {
      video: {
        beatId: 4592297,
        chordId: 2727637,
        repetitiveSegmentId: 2824328,
        lyricId: 59417,
        lyricDiffId: 13964
      },
    },
  },
  {
    title: "いつか君と話したミライは / タケノコ少年",
    url: "https://piapro.jp/t/--OD/20240202150903",
    options: {
      video: {
        beatId: 4592296,
        chordId: 2727636,
        repetitiveSegmentId: 2824327,
        lyricId: 59416,
        lyricDiffId: 13963
      },
    },
  },
  {
    title: "未来交響曲 / ヤマギシコージ",
    url: "https://piapro.jp/t/Rejk/20240202164429",
    options: {
      video: {
        beatId: 4592298,
        chordId: 2727638,
        repetitiveSegmentId: 2824329,
        lyricId: 59418,
        lyricDiffId: 13965
      },
    },
  },
  {
    title: "SUPERHERO / めろくる",
    url: "https://piapro.jp/t/hZ35/20240130103028",
    options: {
      video: {
        beatId: 4592293,
        chordId: 2727635,
        repetitiveSegmentId: 2824326,
        lyricId: 59415,
        lyricDiffId: 13962
      },
    },
  },
  {
    title: "リアリティ / 歩く人",
    url: "https://piapro.jp/t/ELIC/20240130010349",
    options: {
      video: {
        beatId: 4592299,
        chordId: 2727639,
        repetitiveSegmentId: 2824330,
        lyricId: 59419,
        lyricDiffId: 13966
      },
    },
  },
  {
    title: "The Marks / 2ouDNS",
    url: "https://piapro.jp/t/xEA7/20240202002556",
    options: {
      video: {
        beatId: 4592300,
        chordId: 2727640,
        repetitiveSegmentId: 2824331,
        lyricId: 59420,
        lyricDiffId: 13967
      },
    },
  },
];

// プルダウンの選択肢を動的に作成
const songSelect = document.getElementById("songSelect");
songList.forEach((song, index) => {
  const option = document.createElement("option");
  option.value = index;
  option.text = song.title;
  songSelect.appendChild(option);
});

// 曲の選択に応じて player.createFromSongUrl を呼び出す
songSelect.addEventListener("change", (e) => {
  const selectedIndex = parseInt(e.target.value);
  if (!isNaN(selectedIndex) && selectedIndex >= 0 && selectedIndex < songList.length) {
    const selectedSong = songList[selectedIndex];
    player.createFromSongUrl(selectedSong.url, selectedSong.options).then(() => {
      // 曲の読み込みが完了したら再生を開始
      player.requestPlay();
    });
  }
});

playBtn.addEventListener("click", (e) => {
  e.preventDefault()
  if (player) {
    if (player.isPlaying) {
      // do nothing
    } else {
      player.requestPlay()
    }
  }
});
jumpBtn.addEventListener("click", (e) => {
  e.preventDefault()
  if (player) {
    player.requestMediaSeek(player.video.firstPhrase.startTime)
  }
});
pauseBtn.addEventListener("click", (e) => {
  e.preventDefault()
  if (player) {
    if (player.isPlaying) {
      player.requestPause()
    } else {
      // do nothing
    }
  }
});
rewindBtn.addEventListener("click", (e) => {
  e.preventDefault()
  if (player) {
    player.requestMediaSeek(0)
  }
});
llmBtn.addEventListener("click", (e) => {
  e.preventDefault()
  startLLM()
});

/* シークバー */
seekbar.addEventListener("click", (e) => {
  e.preventDefault();
  if (player) {
    player.requestMediaSeek(
      (player.video.duration * e.offsetX) / seekbar.clientWidth
    );
  }
  return false;
});

player.addListener({
  /* APIの準備ができたら呼ばれる */
  onAppReady(app) {
    console.log("onAppReady")
    if (!app.managed) {
      document.querySelector("#control").style.display = "block";
    }
    if (!app.songUrl) {
      // // フューチャーノーツ / shikisai
      // player.createFromSongUrl("https://piapro.jp/t/XiaI/20240201203346", {
      //   video: {
      //     // 音楽地図訂正履歴
      //     beatId: 4592297,
      //     chordId: 2727637,
      //     repetitiveSegmentId: 2824328,
      //     // 歌詞タイミング訂正履歴: https://textalive.jp/lyrics/piapro.jp%2Ft%2FXiaI%2F20240201203346
      //     lyricId: 59417,
      //     lyricDiffId: 13964
      //   },
      // });
      // いつか君と話したミライは / タケノコ少年
      player.createFromSongUrl("https://piapro.jp/t/--OD/20240202150903", {
        video: {
          // 音楽地図訂正履歴
           beatId: 4592296,
           chordId: 2727636,
           repetitiveSegmentId: 2824327,
           // 歌詞タイミング訂正履歴: https://textalive.jp/lyrics/piapro.jp%2Ft%2F--OD%2F20240202150903
           lyricId: 59416,
           lyricDiffId: 13963
         },
       });
    }
    lastTime = -1;
  },

  /* 楽曲が変わったら呼ばれる */
  onAppMediaChange() {
    console.log("onAppMediaChange")
    resetChars();
  },

  /* 楽曲情報が取れたら呼ばれる */
  onVideoReady(video) {
    console.log("onVideoReady")
    // 楽曲情報を表示
    document.querySelector("#artist span").textContent = player.data.song.artist.name;
    document.querySelector("#song span").textContent = player.data.song.name;

    // 最後に取得した再生時刻の情報をリセット
    lastTime = -1;
  },

  /* 再生コントロールができるようになったら呼ばれる */
  onTimerReady() {
    console.log("onTimerReady")
    document.querySelectorAll("button")
      .forEach((btn) => (btn.disabled = false));

    console.log("player.data.lyricsBody.text:" + player.data.lyricsBody.text)
    console.log("player.video.phrases:" + player.video.phrases)
  },

  /* 再生位置の情報が更新されたら呼ばれる */
  onTimeUpdate(position) {
    //console.log("onTimeUpdate: " + position)
    // シークバーの表示を更新
    paintedSeekbar.style.width = `${
      parseInt((position * 1000) / player.video.duration) / 10
    }%`;

    // finish if there is no chars
    if (!player.video.firstChar) {
      return;
    }

    // reset visuals if rewind happens
    if (lastTime > position + 1000) {
      resetChars();
    }

    const chars = player.video.findCharChange(lastTime + 200, position + 200);
    for (const c of chars.entered) {
      // 新しい文字が発声されようとしている
      newChar(c);
    }

    // 次回呼ばれるときのために再生時刻を保存しておく
    lastTime = position;
  }
});



function resetChars(){
  console.log("resetChars")
  lastTime = -1;

  // html related
  let currentPhraseEl = document.querySelector("#container p");
  let newPhraseEl = document.createElement("p");
  newPhraseEl.classList.add("hidden");
  let containerEl = document.querySelector("#container")
  containerEl.replaceChild(newPhraseEl, currentPhraseEl)

  let refrain1El = document.querySelector("#container-v #refrain1");
  let refrain2El = document.querySelector("#container-v #refrain2");
  let refrain3El = document.querySelector("#container-v #refrain3");
  refrain1El.textContent = '';
  refrain1El.classList.add("hidden")
  refrain2El.textContent = '';
  refrain2El.classList.add("hidden")
  refrain3El.textContent = '';
  refrain3El.classList.add("hidden")

  // refrain related
  refrain_status = 0;
  refrainedPhrase = "";
}

function analyze(prompt, selector) {
  getAnalyzedList(prompt).then(reply=> {
    console.log(reply);
    let analyzedEl = document.createElement("div");
    analyzedEl.innerHTML += reply;
    const matches = analyzedEl.querySelectorAll(selector);
    const tmp_list = [];
    matches.forEach((match) => {
      console.log("match refrain:" + match.textContent);
      tmp_list.push(match.textContent);
    });
    return Array.from(new Set(tmp_list)); // remove duplicates
  }).catch(error=> {
    console.error(error);
    return null;
  });
}
function startLLM(){
  const prompt_refrain = "Can you analyze this lyrics marked in lyrics tag, and retrieve all occurrences of refrained phrases from there?" +
      "For example, \"何十回も何百回も星の降る夜を超えて\" needs to be converted to \"<refrain>何十回も</refrain><refrain>何百回も</refrain>星の降る夜を超えて\". " +
      "For another example, \"セカイ　セカイ　セカイ\" needs to be converted to \"<refrain>セカイ</refrain><refrain>セカイ</refrain><refrain>セカイ</refrain>\". " +
      "<lyrics>" + player.data.lyricsBody.text + "</lyrics>"
  word_list_refrain = analyze(prompt_refrain, "refrain");

  // TODO serlialize function execution
  // const prompt_melody = "Can you analyze this lyrics marked in lyrics tag, and retrieve all occurrences of words related to sound, melody, song, or voices from there?" +
  //     "For example, \"紡いだ言葉とメロディが今も\" needs to be converted to \"紡いだ言葉と<melody>メロディ</melody>が今も\". " +
  //     "For another example, \"何回でも何回でも想いはこの声に乗せて\" needs to be converted to \"何回でも何回でも想いはこの<melody>声</melody>に乗せて\". " +
  //     "<lyrics>" + player.data.lyricsBody.text + "</lyrics>"
  // word_list_melody = analyze(prompt_melody, "melody");
  //
  // const prompt_future = "Can you analyze this lyrics marked in lyrics tag, and retrieve all occurrences of words related to future, lights, hope, or shine?" +
  //     "For example, \"五線譜の魔法 砂漠に芽吹くミライ\" needs to be converted to \"五線譜の魔法 砂漠に芽吹く<future>ミライ</future>\". " +
  //     "For another example, \"精一杯のこの歌が光指す道となって\" needs to be converted to \"精一杯のこの歌が<future>光</future>指す道となって\". " +
  //     "<lyrics>" + player.data.lyricsBody.text + "</lyrics>"
  // word_list_future = analyze(prompt_future, "future");
}

String.prototype.replaceAt = function(index, replacement) {
    return this.substring(0, index) + replacement;
    // return this.substring(0, index) + replacement + this.substring(index+1);
}

function newChar(current) {
  console.log("char:" + current.text);
  console.log("word:" + current.parent.text);
  console.log("word pos:" + current.parent.pos);
  console.log("phrase:" + current.parent.parent.text);

  console.log("char index in phrase:" + current.parent.parent.findIndex(current) );
  console.log("word index in phrase:" + current.parent.parent.findIndex(current.parent) );

  // フレーズの最後の文字か否か
  if (current.parent.parent.lastChar === current) {
    console.log("lastChar");
  }

  // 新しいフレーズの開始
  if (!newPhrase && current.parent.parent.firstChar === current) {
    newPhrase = true;
    console.log("!!!new phrase!!!");

    resetChars()
  } else {
    newPhrase = false;
  }

  if (max_vocal < player.getVocalAmplitude(current.startTime)) {
    max_vocal = player.getVocalAmplitude(current.startTime);
  }
  if (min_vocal > player.getVocalAmplitude(current.startTime)) {
    min_vocal = player.getVocalAmplitude(current.startTime);
  }
  console.log("player.getValenceArousal:" + player.getValenceArousal(current.startTime).a + "," + player.getValenceArousal(current.startTime).v);
  console.log("player.getVocalAmplitude:" + player.getVocalAmplitude(current.startTime) + "(max:"+ max_vocal + ",min:" + min_vocal + ")");

  let char_index = current.parent.parent.findIndex(current);
  let phrase = current.parent.parent.text;
  let phrase_before = phrase.substring(0, char_index);
  let phrase_after = phrase.substring(char_index);
  console.log("phrase_before:" + phrase_before);
  console.log("phrase_after:" + phrase_after);

  word_list_refrain.forEach((element) => {
      if (phrase_after.startsWith(element)) {
        console.log("refrain word start:" + element)
        if (refrain_status === 0 || refrain_status === 3) {
          update_refrain("#container-v #refrain1", "refrain1", element);
        } else if (refrain_status === 1) {
          update_refrain("#container-v #refrain2", "refrain2", element);
        } else if (refrain_status === 2) {
          update_refrain("#container-v #refrain3", "refrain3", element);
        }
      }
      if (phrase_before.endsWith(element)) {
        refrainedPhrase += element;
        console.log("refrain word end:" + element)
        console.log("updated refrainedPhrase:" + refrainedPhrase);
        console.log("updated refrain_status:" + refrain_status);
        if (refrain_status === 1) {
          console.log("refrain1 word end:" + element);
        } else if (refrain_status === 2) {
          console.log("refrain2 word end:" + element);
        } else if (refrain_status === 3) {
          console.log("refrain3 word end:" + element);
        }
      }
    }
  )

  if (refrainedPhrase != '') {
    phrase = phrase.replace(refrainedPhrase, "");
    console.log("refrained phrase detected: " + refrainedPhrase);
    console.log("phrase minus refrain: " + phrase);
    let remaining_refrain = word_list_refrain.filter(element => phrase.includes(element))
    if (remaining_refrain.length === 0) {
      console.log("refrain phrase end");
      char_index -= refrainedPhrase.length;
      refrain_status = 0;
    }
  }

  let phraseEl = document.querySelector("#container p");
  if (refrain_status === 0) {
    phraseEl.innerHTML = phrase.replaceAt(char_index, "<strong >" + current.text + "</strong>");
    phraseEl.classList.remove("hidden")
    console.log("innerHTML:" + phraseEl.innerHTML);
  }

  word_list_melody.forEach((element) => {
      if (phrase_after.startsWith(element)) {
        console.log("melody start:" + element);
        phraseEl.innerHTML = phraseEl.innerHTML + "<div class='melody'></div>"
        console.log("phraseEl.innerHTML:" + phraseEl.innerHTML);
      } else if (phrase_before.endsWith(element)) {
        console.log("melody end:" + element);
      }
    }
  )

  word_list_future.forEach((element) => {
      if (phrase_after.startsWith(element)) {
        console.log("future start:" + element);
        phraseEl.innerHTML = phraseEl.innerHTML + "<div class='future'></div>"
        console.log("phraseEl.innerHTML:" + phraseEl.innerHTML);
      } else if (phrase_before.endsWith(element)) {
        console.log("future end:" + element);
      }
    }
  )
}

function update_refrain(selector, id, element){
  let currentRefrainEl = document.querySelector(selector);
  let newRefrainEl = document.createElement("p");
  newRefrainEl.id = id;
  let containerVEl = document.querySelector("#container-v");
  containerVEl.replaceChild(newRefrainEl, currentRefrainEl);
  newRefrainEl.textContent = element;
  newRefrainEl.classList.remove("hidden")
  console.log("refrain " + id + " start: " + element);
  refrain_status ++;
}
