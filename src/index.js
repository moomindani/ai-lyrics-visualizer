const {Player} = TextAliveApp;
import {getAnalyzedList} from './wwllm'
import {createBackground, clearBackground} from './background_factory'
import {songListMap} from './songList.js';

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
const positionEl = document.querySelector("#position strong");

const beatbarEl = document.querySelector("#beatbar");
const seekbar = document.querySelector("#seekbar");
const paintedSeekbar = seekbar.querySelector("div");
let newPhrase = false;
let lastTime = -1;
let lastCharIndexInPhrase = -1;
let max_vocal = 0, min_vocal = 100000000;
let current_song = null;
let refrain_status = 0;  // 0: non-refrain, 1: left-refrain, 2: right-refrain, 3: center-refrain
let refrainedPhrase = '';
let word_list_refrain = [];
let word_list_melody = [];
let word_list_future = [];

let background = null;

window.addEventListener('load', () => {
    const title = document.getElementById('title');
    setTimeout(() => {
        title.style.opacity = 0;
        setTimeout(() => {
            title.style.display = 'none';
        }, 1000);
    }, 1500);
});

const songSelect = document.getElementById('songSelect');
const searchInput = document.getElementById('searchInput');
const enbalLyricVideo = document.getElementById('aiToggle');

function loadLyricVideo() {
    if (background === null) {
        background = createBackground("future");
        background.draw();
    } else {
        // TODO: 曲の選択変更に対応
        const backgroundEl = document.querySelector("#background");
        backgroundEl.classList.remove("hidden");
    }

    const music_info = songListMap.get(current_song)
    if (music_info.cachedLlmData) {
        if (music_info.cachedLlmData.refrainedPhrase) {
            let analyzedEl = document.createElement("div");
            analyzedEl.innerHTML += music_info.cachedLlmData.refrainedPhrase;
            const matches = analyzedEl.querySelectorAll("refrain");
            const tmp_list = [];
            matches.forEach((match) => {
                console.log("match refrain:" + match.textContent);
                tmp_list.push(match.textContent);
            });
            word_list_refrain = Array.from(new Set(tmp_list)); // remove duplicates
            console.log("word_list_refrain:" + word_list_refrain);
        }
        if (music_info.cachedLlmData.melody) {
            let analyzedEl = document.createElement("div");
            analyzedEl.innerHTML += music_info.cachedLlmData.melody;
            const matches = analyzedEl.querySelectorAll("melody");
            const tmp_list = [];
            matches.forEach((match) => {
                console.log("match melody:" + match.textContent);
                tmp_list.push(match.textContent);
            });
            word_list_melody = Array.from(new Set(tmp_list)); // remove duplicates
            console.log("word_list_melody:" + word_list_melody);
        }
        if (music_info.cachedLlmData.future) {
            let analyzedEl = document.createElement("div");
            analyzedEl.innerHTML += music_info.cachedLlmData.future;
            const matches = analyzedEl.querySelectorAll("future");
            const tmp_list = [];
            matches.forEach((match) => {
                console.log("match future:" + match.textContent);
                tmp_list.push(match.textContent);
            });
            word_list_future = Array.from(new Set(tmp_list)); // remove duplicates
            console.log("word_list_future:" + word_list_future);
        }
    }
}

function clearLyricVideo() {
    word_list_refrain = [];
    word_list_melody = [];
    word_list_future = [];
    const backgroundEl = document.querySelector("#background");
    backgroundEl.classList.add("hidden");
}

enbalLyricVideo.addEventListener("change", (e) => {
    if (enbalLyricVideo.checked) {
        loadLyricVideo();
    } else {
        clearLyricVideo();
    }
});

// 曲の選択に応じて player.createFromSongUrl を呼び出すfunc
function selectSong(e) {
    current_song = e.target.value;
    const music_info = songListMap.get(current_song)
    if (songListMap.has(current_song)) {
        if (enbalLyricVideo.checked) {
            loadLyricVideo();
        }
        player.createFromSongUrl(current_song, music_info.options).then(() => {
            // 曲の読み込みが完了したら再生を開始
            player.requestPlay();
        });
    }
}

// 曲の選択に応じて player.createFromSongUrl を呼び出す
songSelect.addEventListener("change", (e) => {
    fadeNavigationUI();
    selectSong(e);
});

// URLの入力に応じて player.createFromSongUrl を呼び出す
searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && searchInput.value) {
        fadeNavigationUI();
        // clear songSelect select box
        songSelect.selectedIndex = 0;
        const url = searchInput.value;
        if (url) {
            player.createFromSongUrl(url).then(() => {
                // 曲の読み込みが完了したら再生を開始
                player.requestPlay();
            });
        }
    }
});

const songSelectNavi = document.getElementById('songSelectNavi');
const searchInputNavi = document.getElementById('searchInputNavi');
const songSelectUI = document.getElementById('song-select');

function fadeNavigationUI() {
    songSelectUI.style.opacity = 0;
    setTimeout(() => {
        songSelectUI.style.display = 'none';
    }, 1000);
}

// 曲の選択に応じて player.createFromSongUrl を呼び出す
songSelectNavi.addEventListener("change", (e) => {
    fadeNavigationUI();
    selectSong(e);
});

// URLの入力に応じて player.createFromSongUrl を呼び出す
searchInputNavi.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && searchInputNavi.value) {
        fadeNavigationUI();
        // clear songSelect select box and show default
        songSelect.selectedIndex = 0;
        const url = searchInputNavi.value;
        if (url) {
            player.createFromSongUrl(url).then(() => {
                // 曲の読み込みが完了したら再生を開始
                player.requestPlay();
            });
        }
    }
});

// プルダウンの選択肢を動的に作成
// iterate song list map
songListMap.forEach((song, key) => {
    const option = document.createElement("option");
    option.value = key;
    option.text = song.title;
    songSelect.appendChild(option);
    songSelectNavi.appendChild(option.cloneNode(true));
});

playBtn.addEventListener("click", (e) => {
    e.preventDefault()
    if (player) {
        if (player.isPlaying) {
            // do nothing
        } else {
            player.requestPlay();
            background.toggleAnimation();
        }
    }
});
jumpBtn.addEventListener("click", (e) => {
    e.preventDefault()
    if (player) {
        player.requestMediaSeek(player.video.firstPhrase.startTime);
    }
});
pauseBtn.addEventListener("click", (e) => {
    e.preventDefault()
    if (player) {
        if (player.isPlaying) {
            player.requestPause();
            background.toggleAnimation();
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
            document.querySelector("#control").style.display = "flex";
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
        console.log("onTimerReady");
        playBtn.disabled = false;
        jumpBtn.disabled = false;
        pauseBtn.disabled = false;
        rewindBtn.disabled = false;

        console.log("player.data.lyricsBody.text:" + player.data.lyricsBody.text);
        console.log("player.data.lyricsBody.text:" + player.data.lyricsBody.text);
        console.log("player.data.songMap.segments:" + player.data.songMap.segments);
        console.log("player.getChoruses(): " + player.getChoruses());
    },

    /* 再生位置の情報が更新されたら呼ばれる */
    onTimeUpdate(position) {
        //console.log("onTimeUpdate: " + position)
        // シークバーの表示を更新
        paintedSeekbar.style.width = `${
            parseInt((position * 1000) / player.video.duration) / 10
        }%`;

        const positionVisual = document.getElementById("position");
        // 再生時間を表示
        // transform millisecond to minutes : time
        positionVisual.textContent = `${Math.floor(position / 60000)}:${
            ("0" + Math.floor((position % 60000) / 1000)).slice(-2)
        }`;

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


function resetChars() {
    console.log("resetChars")
    lastTime = -1;

    // html related
    let currentPhraseEl = document.querySelector("#container p");
    let newPhraseEl = document.createElement("p");
    newPhraseEl.classList.add("hidden");
    let containerEl = document.querySelector("#container")
    containerEl.replaceChild(newPhraseEl, currentPhraseEl)

    let containerVEl = document.querySelector("#container-v");
    while (containerVEl.firstChild) {
        containerVEl.removeChild(containerVEl.firstChild);
    }

    // refrain related
    refrain_status = 0;
    refrainedPhrase = "";
}

function startLLM() {
    const prompt_refrain = "Can you analyze this lyrics marked in lyrics tag, and retrieve all occurrences of refrained phrases from there?" +
        "For example, \"何十回も何百回も星の降る夜を超えて\" needs to be converted to \"<refrain>何十回も</refrain><refrain>何百回も</refrain>星の降る夜を超えて\". " +
        "For another example, \"セカイ　セカイ　セカイ\" needs to be converted to \"<refrain>セカイ</refrain><refrain>セカイ</refrain><refrain>セカイ</refrain>\". " +
        "If there are multiple identical results, please group them together." +
        "Please just response <melody> tags of extract result, do not include other info" +
        "<lyrics>" + player.data.lyricsBody.text + "</lyrics>"
    getAnalyzedList(prompt_refrain).then(reply => {
        console.log(reply);
        let analyzedEl = document.createElement("div");
        analyzedEl.innerHTML += reply;
        const matches = analyzedEl.querySelectorAll("refrain");
        const tmp_list = [];
        matches.forEach((match) => {
            console.log("match refrain:" + match.textContent);
            tmp_list.push(match.textContent);
        });
        word_list_refrain = Array.from(new Set(tmp_list)); // remove duplicates
    }).catch(error => {
        console.error(error);
        return null;
    });
}

String.prototype.replaceAt = function (index, replacement) {
    return this.substring(0, index) + replacement;
    // return this.substring(0, index) + replacement + this.substring(index+1);
}

function newChar(current) {
    console.log("char:" + current.text);
    console.log("word:" + current.parent.text);
    console.log("word pos:" + current.parent.pos);
    console.log("phrase:" + current.parent.parent.text);

    // フレーズ内の文字が進んでない場合、新しい文字と認識しない（先頭文字が稀にダブる問題の対策）
    if (lastCharIndexInPhrase === current.parent.parent.findIndex(current)) {
        return;
    } else {
        lastCharIndexInPhrase = current.parent.parent.findIndex(current);
    }
    console.log("char index in phrase:" + lastCharIndexInPhrase);
    console.log("word index in phrase:" + current.parent.parent.findIndex(current.parent));

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
    console.log("player.getVocalAmplitude:" + player.getVocalAmplitude(current.startTime) + "(max:" + max_vocal + ",min:" + min_vocal + ")");

    let char_index = current.parent.parent.findIndex(current);
    let phrase = current.parent.parent.text;
    let phrase_before = phrase.substring(0, char_index);
    let phrase_after = phrase.substring(char_index);
    console.log("phrase_before:" + phrase_before);
    console.log("phrase_after:" + phrase_after);

    word_list_refrain.forEach((element) => {
            if (phrase_after.startsWith(element)) {
                console.log("refrain word start:" + element)
                update_refrain(element);
            }
            if (phrase_before.endsWith(element)) {
                refrainedPhrase += element;
                let currentRefrainEl = document.querySelector("container-v refrain" + refrain_status + 1);
                console.log("refrain word end:" + element)
                console.log("updated refrainedPhrase:" + refrainedPhrase);
                console.log("updated refrain_status:" + refrain_status);
            }
        }
    )

    if (refrainedPhrase !== '') {
        phrase = phrase.replace(refrainedPhrase, "");
        console.log("refrained phrase detected: " + refrainedPhrase);
        console.log("phrase minus refrain: " + phrase);
        let remaining_refrain = word_list_refrain.filter(element => phrase.includes(element))
        if (remaining_refrain.length === 0) {
            console.log("refrain phrase end");
            refrain_status = 0;
            // リフレイン終了時に画面上の文字を初期化
            resetChars();
        }
    }

    let phraseEl = document.querySelector("#container p");
    let currentEl = document.createElement("strong");
    if (refrain_status === 0) {
        currentEl.textContent = current.text;
        phraseEl.appendChild(currentEl);
        phraseEl.classList.remove("hidden")
        console.log("innerHTML:" + phraseEl.innerHTML);
    }

    word_list_melody.forEach((element) => {
            if (phrase_after.startsWith(element)) {
                console.log("melody start:" + element);
                let melodyEl = document.createElement("div");
                melodyEl.classList.add("melody");
                currentEl.appendChild(melodyEl);
                console.log("currentEl.innerHTML:" + currentEl.innerHTML);
            } else if (phrase_before.endsWith(element)) {
                console.log("melody end:" + element);
            }
        }
    )

    word_list_future.forEach((element) => {
            if (phrase_after.startsWith(element)) {
                console.log("future start:" + element);
                let futureEl = document.createElement("div");
                futureEl.classList.add("future");
                currentEl.appendChild(futureEl);
                console.log("currentEl.innerHTML:" + currentEl.innerHTML);
            } else if (phrase_before.endsWith(element)) {
                console.log("future end:" + element);
            }
        }
    )

    // Word の最後の文字か否か
    if (current.parent.lastChar === current) {
        console.log("lastChar in the word");
        // 英語の場合スペーサーを入れる
        if (isASCII(current.text) && current.parent.next.pos !== "S") {
            let spacerEl = document.createElement("div");
            spacerEl.classList.add("spacer");
            phraseEl.appendChild(spacerEl);
        }
    }
    // Phrase の最後の文字が出力されたら少し待ってフェードアウト開始
    if (current.parent.parent.lastChar === current) {
        console.log("lastChar in the phrase");
        phraseEl.style.animation = "fadeout 2s 1s ease-in forwards";
    }
}

function isASCII(char) {
    // Get the character code of the input character
    const charCode = char.charCodeAt(0);

    // Check if the character code falls within the ASCII range (0-127)
    return (charCode >= 0 && charCode <= 127);
}

function update_refrain(element) {
    // リフレイン開始時に画面上の文字を初期化
    if (refrain_status === 0) {
        console.log("refrain phrase start");
        resetChars();
    }
    refrain_status++;
    console.log("refrain " + refrain_status + " start: " + element);
    let id = "refrain" + refrain_status;

    let newRefrainEl = document.createElement("p");
    newRefrainEl.id = id;
    newRefrainEl.textContent = element;
    newRefrainEl.classList.remove("hidden")

    // CSS プロパティを動的に設定
    let pos = getRefrainPosition(refrain_status - 1);
    newRefrainEl.style.position = "absolute";
    newRefrainEl.style.top = pos.top;
    newRefrainEl.style.left = pos.left;
    newRefrainEl.style.right = pos.right;

    let containerVEl = document.querySelector("#container-v");
    containerVEl.appendChild(newRefrainEl);
}

function getRefrainPosition(id) {
    const positions = [
        {left: '15%', right: 'auto', top: '15%'},  // 1番目: 左端
        {left: 'auto', right: '15%', top: '15%'},  // 2番目: 右端
        {left: '40%', right: 'auto', top: '25%'},  // 3番目: 中央寄り左
        {left: '5%', right: 'auto', top: '35%'},   // 4番目: 左寄り
        {left: 'auto', right: '5%', top: '35%'}    // 5番目: 右寄り
    ];

    const index = id % positions.length;
    return positions[index];
}