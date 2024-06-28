const {Player} = TextAliveApp;
import {createLlm} from './llm_factory'
import {createBackground} from './background_factory'
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

const seekbar = document.querySelector("#seekbar");
const paintedSeekbar = seekbar.querySelector("div");

let newPhrase = false;
let lastTime = -1;
let lastCharIndexInPhrase = -1;
let segments = [];
let currentSegment = -1;
let lastIsChorus = false;

let max_vocal = 0, min_vocal = 100000000;
let current_song = null;

let refrain_status = 0;  // 0: non-refrain, 1: left-refrain, 2: right-refrain, 3: center-refrain
let refrainedPhrase = '';
let word_list_refrain = [];
let word_list_melody = [];
let word_list_future = [];
let word_list_key = [];

let color_main = null;
let color_base = null;
let color_accent = null;

let llm = null;
let openai_api_key = null;
let song_url = null;

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

const player_ui = document.getElementById('player');
let lastTouchTime = 0;
const inactivityThreshold = 3000; 

function minimizePlayer() {
    player_ui.classList.add('minimized');
}

function showPlayer() {
    player_ui.classList.remove('minimized');
}

function checkInactivity() {
    if (Date.now() - lastTouchTime > inactivityThreshold) {
        minimizePlayer();
    }
}

function handleInteraction() {
    showPlayer();
    lastTouchTime = Date.now();
}

document.addEventListener('mouseenter', handleInteraction);
document.addEventListener('touchstart', handleInteraction);

player_ui.addEventListener('mouseleave', () => {
    lastTouchTime = Date.now();
});

player_ui.addEventListener('touchstart', (e) => {
    handleInteraction();
});

setInterval(checkInactivity, 1000);

const songSelect = document.getElementById('songSelect');
const searchInput = document.getElementById('searchInput');
const apiKeyInput = document.getElementById('apiKeyInput');
const enbalLyricVideo = document.getElementById('aiToggle');

function saveLLMAnalysisToLocalStorage(url, analysis) {
    try {
        const serializedAnalysis = JSON.stringify(analysis);
        localStorage.setItem(url, serializedAnalysis);
        console.log("LLM analysis data saved to local storage");
    }catch(e) {
        console.error('Failed to save LLM analysis data to local storage', e);
    }
}

function loadLLMAnalysisFromLocalStorage(url) {
    try {
        const serializedAnalysis = localStorage.getItem(url);
        if(serializedAnalysis === null) {
            console.log("No LLM analysis data in local storage");
            return null;
        }
        const cachedLlmData = JSON.parse(serializedAnalysis);
        console.log("LLM analysis data loaded from local storage");
        return cachedLlmData;
    }catch(e) {
        console.error('Failed to load LLM analysis data from local storage', e);
        return null;
    }
}

function getSongInfo(url) {
    let songInfo;
    // cache from local file
    if (songListMap.has(url).cachedLlmData) {
        return songListMap.get(url).cachedLlmData;
    }
    // cache from local storage
    // follwing is the exsample of usage
    tmpTestRes =  {
        refrainedPhrase : `After analyzing the lyrics, I found the following refrained phrases:
        <refrain>何十回も</refrain><refrain>何百回も</refrain><refrain>星の降る夜を超えて</refrain>
        <refrain>何千回も</refrain><refrain>何万回も</refrain><refrain>確かな愛を叫ぶよ</refrain>
        <refrain>何回でも</refrain><refrain>何回でも</refrain><refrain>想いをこの声に乗せて</refrain>
        <refrain>何回だって</refrain><refrain>何回だって</refrain><refrain>届くまで叫ぶよ</refrain>
        These refrained phrases are marked with the <refrain> tags, and they appear multiple times throughout the lyrics.`,
        melody : `<melody>メロディ</melody>
        <melody>歌声</melody>
        <melody>声</melody>
        <melody>五線譜の魔法</melody>
        <melody>この歌</melody>
        <melody>歌</melody>`,
        future : `<future>ミライ</future>
        <future>光</future>
        <future>ミライ</future>
        <future>光</future>
        <future>ミライ</future>
        <future>光</future>`,
        mainColor: `#00aa88`,
        baseColor: `#0066cc`,
        accentColor: `#e12885`
       };
    saveLLMAnalysisToLocalStorage(url, tmpTestRes);
    
    let localCache = loadLLMAnalysisFromLocalStorage(url);
    if(localCache) {
        return localCache;
    }
}

function loadLyricVideo() {
    // 背景
    if (background === null) {
        background = createBackground("future");
    } else {
        // TODO: 曲の選択変更に対応
        const backgroundEl = document.querySelector("#background");
        backgroundEl.classList.remove("hidden");
    }

    let llmAnalysis = getSongInfo(current_song);
    if (llmAnalysis) {
        // フォント
        // const fontFamily = "'Noto Serif JP', serif";
        // const fontFamily = "'Noto Sans JP', sans-serif";
        const fontFamily = "'Murecho', sans-serif";
        let containerEl = document.querySelector("#container")
        containerEl.style.fontFamily = fontFamily;
        let containerVEl = document.querySelector("#container-v");
        containerVEl.style.fontFamily = fontFamily;

        // カラーコード
        if (llmAnalysis.mainColor) {
            color_main = llmAnalysis.mainColor;
        }
        if (llmAnalysis.baseColor) {
            color_base = llmAnalysis.baseColor;
        }
        if (llmAnalysis.accentColor) {
            color_accent = llmAnalysis.accentColor;
        }
        background.setColors(color_main, color_base, color_accent);

        // リフレイン
        if (llmAnalysis.refrainedPhrase) {
            let analyzedEl = document.createElement("div");
            analyzedEl.innerHTML += llmAnalysis.refrainedPhrase;
            const matches = analyzedEl.querySelectorAll("refrain");
            const tmp_list = [];
            matches.forEach((match) => {
                console.log("match refrain:" + match.textContent);
                tmp_list.push(match.textContent);
            });
            word_list_refrain = Array.from(new Set(tmp_list)); // remove duplicates
            console.log("word_list_refrain:" + word_list_refrain);
        }

        // メロディ
        if (llmAnalysis.melody) {
            let analyzedEl = document.createElement("div");
            analyzedEl.innerHTML += llmAnalysis.melody;
            const matches = analyzedEl.querySelectorAll("melody");
            const tmp_list = [];
            matches.forEach((match) => {
                console.log("match melody:" + match.textContent);
                tmp_list.push(match.textContent);
            });
            word_list_melody = Array.from(new Set(tmp_list)); // remove duplicates
            console.log("word_list_melody:" + word_list_melody);
        }

        // 未来
        if (llmAnalysis.future) {
            let analyzedEl = document.createElement("div");
            analyzedEl.innerHTML += llmAnalysis.future;
            const matches = analyzedEl.querySelectorAll("future");
            const tmp_list = [];
            matches.forEach((match) => {
                console.log("match future:" + match.textContent);
                tmp_list.push(match.textContent);
            });
            word_list_future = Array.from(new Set(tmp_list)); // remove duplicates
            console.log("word_list_future:" + word_list_future);
        }

        // キーフレーズ
        if (llmAnalysis.keyPhrase) {
            let analyzedEl = document.createElement("div");
            analyzedEl.innerHTML += llmAnalysis.keyPhrase;
            const matches = analyzedEl.querySelectorAll("key");
            const tmp_list = [];
            matches.forEach((match) => {
                console.log("match key:" + match.textContent);
                tmp_list.push(match.textContent);
            });
            word_list_key = Array.from(new Set(tmp_list)); // remove duplicates
            console.log("word_list_key:" + word_list_key);
        }

        // リフレインとキーフレーズだったらキーフレーズを優先
        word_list_refrain = word_list_refrain.filter(word => !word_list_key.includes(word));
    }

    // 背景を描画
    background.draw();

    // 幕を開ける
    const curtainTop = document.querySelector('.curtain-top');
    const curtainBottom = document.querySelector('.curtain-bottom');
    curtainTop.classList.add('open-top');
    curtainBottom.classList.add('open-bottom');
}

function clearLyricVideo() {
    word_list_refrain = [];
    word_list_melody = [];
    word_list_future = [];
    word_list_key = [];
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
        showPlayer();
        if (enbalLyricVideo.checked) {
            loadLyricVideo();
        }
        player.createFromSongUrl(current_song, music_info.options).then(() => {
            // 曲の読み込みが完了したら再生を開始
            player.requestPlay();
            background.enableAnimation();
            startLLM()
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
                song_url = url;
                player.requestPlay();
                background.enableAnimation();
                startLLM()
            });
        }
    }
});

apiKeyInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && apiKeyInput.value) {
        fadeNavigationUI();
        const key = apiKeyInput.value;
        if (key) {
            openai_api_key = key;
        }
    }
});

const songSelectNavi = document.getElementById('songSelectNavi');
const searchInputNavi = document.getElementById('searchInputNavi');
const apiKeyInputNavi = document.getElementById('apiKeyInputNavi');
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
                song_url = url;
                player.requestPlay();
                background.enableAnimation();
                startLLM()
            });
        }
    }
});

// 入力された Open AI API キーを格納する（取扱注意）
apiKeyInputNavi.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && apiKeyInputNavi.value) {
        fadeNavigationUI();
        const key = apiKeyInputNavi.value;
        if (key) {
            openai_api_key = key;
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
            background.enableAnimation();
            startLLM()
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
            background.disableAnimation();
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
        showPlayer();
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

        // セグメント情報を取得
        let rawSegments = player.data.songMap.segments;
        let tmpSegments = [];
        for (let i = 0; i < rawSegments.length; i++) {
            if (rawSegments[i].chorus) {
                Array.from(rawSegments[i].segments, (z) => {
                    z.chorus = true;
                    z.section = i;
                    tmpSegments.push(z);
                })
            } else {
                Array.from(rawSegments[i].segments, (z) => {
                    z.chorus = false;
                    z.section = i;
                    tmpSegments.push(z);
                })
            }
        }
        segments = tmpSegments.sort(function (a, b) {
            return (a.startTime < b.startTime) ? -1 : 1;
        });
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

        // セグメント上の現在の位置とセクションを算出 (currentSection=1, chorus=true がサビ)
        let segmentCount = 0;
        for (let i = 0; i < segments.length; i++) {
            if (segments[i].startTime < position) {
                segmentCount++;
            }
        }
        if (currentSegment !== segmentCount) {
            currentSegment = segmentCount;
        }
        let currentSection = segments[currentSegment - 1].section;
        let isChorus = segments[currentSegment - 1].chorus;
        console.log("Current section: " + currentSection + " chorus=" + isChorus);
        if (background !== null) {
            background.setChorus(isChorus);
            if(isChorus) {
                background.setPreChorus(false);
            }

            // サビの終了
            if(lastIsChorus && !isChorus) {
                console.log("Chorus end")
                background.postChorusAnimation();
            }
        }
        lastIsChorus = isChorus;

        // 新しいビートを検出
        const beats = player.findBeatChange(lastTime, position);
        if (
            lastTime >= 0 &&
            // ↑初期化された直後はビート検出しない
            beats.entered.length > 0
            // ↑二拍ごとにしたければ
            //   && beats.entered.find((b) => b.position % 2 === 1)
            // のような条件を足してチェックすればよい
        ) {
            // ビート同期のアニメーションを発火させる
            requestAnimationFrame(() => {
                if (background !== null) {
                    background.beatAnimation();
                }
            });
        }

        const chars = player.video.findCharChange(lastTime + 200, position + 200);
        for (const c of chars.entered) {
            // 新しい文字が発声されようとしている
            newChar(c);
        }

        // 2000ミリ秒後がサビならサビ前演出
        let segmentLaterCount = 0;
        for (let i = 0; i < segments.length; i++) {
            if (segments[i].startTime < position + 2000) {
                segmentLaterCount++;
            }
        }
        if(segments[segmentLaterCount-1].chorus) {
            console.log("!!!Chorus coming soon!!!")
            if (background !== null) {
                background.preChorusAnimation();
                background.setPreChorus(true);
            }
        } else {
            if (background !== null) {
                background.setPreChorus(false);
            }
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

    // key phrase related
    let keyPhraseEl = document.querySelector("#key-phrase");
    keyPhraseEl.classList.add("hidden");
    while (keyPhraseEl.firstChild) {
        keyPhraseEl.removeChild(keyPhraseEl.firstChild);
    }
    let keyPhrasePEl = document.createElement("p");
    keyPhraseEl.appendChild(keyPhrasePEl);
}

function startLLM() {
    if (openai_api_key) {
        llm = createLlm("openai");
        llm.setApiKey(openai_api_key)
    } else if (song_url) {
        llm = createLlm("webllm");
    } else {
        // TODO キャッシュがきたら考える
    }
    const prompt = "Analyze this original, identifying the refrained phrases and their apperrances in the text?" +
    "Refrained phrases mean similar phrases included in each line. Make sure that the phrases are included in the original lyrics." +
    "For example, the line \"何十回も何百回も星の降る夜を超えて\" needs to be converted to \"<refrain>何十回も</refrain><refrain>何百回も</refrain>星の降る夜を超えて\". " +
    "For another example, the line \"セカイセカイセカイ\" needs to be converted to \"<refrain>セカイ</refrain><refrain>セカイ</refrain><refrain>セカイ</refrain>\". " +
    "Please just response <melody> tags of extract result, do not include other info" +
    "<lyrics>" + player.data.lyricsBody.text + "</lyrics>"
    const ret = llm.getResponse(prompt);
    console.log("llm reply:" + ret);
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

    word_list_key.forEach((element) => {
            if (phrase_after.startsWith(element)) {
                console.log("key phrase start:" + element);
                const keyPhraseEl = document.querySelector("#key-phrase");
                const keyPhrasePEl = document.createElement("p");
                keyPhraseEl.classList.remove("hidden");
                keyPhrasePEl.textContent = element;
                keyPhraseEl.appendChild(keyPhrasePEl);
            }
            else if (phrase_before.endsWith(element) || current.parent.parent.lastChar === current) {
                console.log("key phrase end:" + element);
                const keyPhrasePEl = document.createElement("p");
                keyPhrasePEl.style.animation = "fadeout 0.5s 1s ease-in forwards";
            }
        }
    )

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
                melodyEl.style.border = '3px solid ' + color_accent;
                currentEl.appendChild(melodyEl);
                console.log("currentEl.innerHTML:" + currentEl.innerHTML);

                if (background !== null) {
                    background.drawNotes();
                }
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
                futureEl.style.border = '3px solid ' + color_main;
                currentEl.appendChild(futureEl);
                console.log("currentEl.innerHTML:" + currentEl.innerHTML);

                if (background !== null) {
                    background.drawText(element);
                }
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
    // Phrase の最後の文字が出力されたとき
    if (current.parent.parent.lastChar === current) {
        console.log("lastChar in the phrase");

        // 少し待ってフェードアウト開始
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