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
let current_song_url = null;

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
const advancedSetting = document.getElementById('advancedSettingToggle');
const advancedSettingOk = document.getElementById('advancedSettingOk');


function saveLLMAnalysisToLocalStorage(url, analysis) {
    try {
        const serializedAnalysis = JSON.stringify(analysis);
        localStorage.setItem(url, serializedAnalysis);
        console.log("LLM analysis data saved to local storage");
    } catch (e) {
        console.error('Failed to save LLM analysis data to local storage', e);
    }
}

function loadLLMAnalysisFromLocalStorage(url) {
    try {
        const serializedAnalysis = localStorage.getItem(url);
        if (serializedAnalysis === null) {
            console.log("No LLM analysis data in local storage");
            return null;
        }
        const cachedLlmData = JSON.parse(serializedAnalysis);
        console.log("LLM analysis data loaded from local storage");
        return cachedLlmData;
    } catch (e) {
        console.error('Failed to load LLM analysis data from local storage', e);
        return null;
    }
}

async function getSongInfo(url) {
    let songInfo;
    // cache from local file
    if (songListMap.has(url)) {
        console.log("Cached data found in pre-defined song list.")
        return songListMap.get(url).cachedLlmData;
    }

    let localCache = loadLLMAnalysisFromLocalStorage(url);
    if (localCache) {
        console.log("Cached data found in browser local storage.")
        return localCache;
    } else {
        // LLM を呼んで testRes を作って保存する
        let localCache = await loadLLMAnalysis()
        saveLLMAnalysisToLocalStorage(url, localCache);
        return localCache;
    }
}

async function loadLyricVideo() {
    // 背景
    if (background === null) {
        background = createBackground("future");
    } else {
        // TODO: 曲の選択変更に対応
        const backgroundEl = document.querySelector("#background");
        backgroundEl.classList.remove("hidden");
    }

    await getSongInfo(current_song_url).then((llmAnalysis) => {
        if (llmAnalysis) {
            // フォント
            let fontFamily = "'Noto Sans JP', sans-serif";
            if (llmAnalysis.font) {
                let analyzedEl = document.createElement("div");
                analyzedEl.innerHTML += llmAnalysis.font;
                const matches = analyzedEl.querySelectorAll("font");
                const tmp_list = [];
                matches.forEach((match) => {
                    console.log("match font:" + match.textContent);
                    tmp_list.push(match.textContent);
                });
                const filtered_list = tmp_list.filter(item => item !== '');
                console.log("font:" + filtered_list[0]);
                fontFamily = filtered_list[0];
            }
            let containerEl = document.querySelector("#container")
            containerEl.style.fontFamily = fontFamily;
            let containerVEl = document.querySelector("#container-v");
            containerVEl.style.fontFamily = fontFamily;

            // カラーコード
            if (llmAnalysis.mainColor) {
                let analyzedEl = document.createElement("div");
                analyzedEl.innerHTML += llmAnalysis.mainColor;
                const matches = analyzedEl.querySelectorAll("mainColor");
                const tmp_list = [];
                matches.forEach((match) => {
                    console.log("match mainColor:" + match.textContent);
                    tmp_list.push(match.textContent);
                });
                const filtered_list = tmp_list.filter(item => item !== '');
                console.log("mainColor:" + filtered_list[0]);
                color_main = filtered_list[0];
            }
            if (llmAnalysis.baseColor) {
                let analyzedEl = document.createElement("div");
                analyzedEl.innerHTML += llmAnalysis.baseColor;
                const matches = analyzedEl.querySelectorAll("baseColor");
                const tmp_list = [];
                matches.forEach((match) => {
                    console.log("match baseColor:" + match.textContent);
                    tmp_list.push(match.textContent);
                });
                const filtered_list = tmp_list.filter(item => item !== '');
                console.log("baseColor:" + filtered_list[0]);
                color_base = filtered_list[0];
            }
            if (llmAnalysis.accentColor) {
                let analyzedEl = document.createElement("div");
                analyzedEl.innerHTML += llmAnalysis.accentColor;
                const matches = analyzedEl.querySelectorAll("accentColor");
                const tmp_list = [];
                matches.forEach((match) => {
                    console.log("match accentColor:" + match.textContent);
                    tmp_list.push(match.textContent);
                });
                const filtered_list = tmp_list.filter(item => item !== '');
                console.log("accentColor:" + filtered_list[0]);
                color_accent = filtered_list[0];
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
                const filtered_list = tmp_list.filter(item => item !== '');
                word_list_refrain = Array.from(new Set(filtered_list)); // remove duplicates
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
                const filtered_list = tmp_list.filter(item => item !== '');
                word_list_melody = Array.from(new Set(filtered_list)); // remove duplicates
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
                const filtered_list = tmp_list.filter(item => item !== '');
                word_list_future = Array.from(new Set(filtered_list)); // remove duplicates
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
            // 背景を描画
            background.draw();
        }
    });

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
    current_song_url = e.target.value;
    const music_info = songListMap.get(current_song_url)
    if (songListMap.has(current_song_url)) {
        showPlayer();
        player.createFromSongUrl(current_song_url, music_info.options).then(() => {
            // 曲の読み込みが完了したら再生を開始
            if (enbalLyricVideo.checked) {
                loadLyricVideo().then(() => {
                    player.requestPlay();
                    if (background !== null) {
                        // background.clear();
                        background.enableAnimation();
                    }
                });
            } else {
                player.requestPlay();
                if (background !== null) {
                    // background.clear();
                    background.enableAnimation();
                }
            }
            if (background !== null) {
                background.enableAnimation();
            }
        });
    }
}

advancedSetting.addEventListener('change', function () {
    console.log("advancedSetting");
    document.querySelector('.advancedSetting').classList.toggle('show');
});

// 曲の選択に応じて player.createFromSongUrl を呼び出す
songSelect.addEventListener("change", (e) => {
    fadeNavigationUI();
    selectSong(e);
});

// 入力された Song URL と Open AI API キー（取扱注意）を格納する
advancedSettingOk.addEventListener("click", (e) => {
    fadeNavigationUI();

    songSelect.selectedIndex = 0;
    const url = searchInput.value;
    if (url) {
        player.createFromSongUrl(url).then(() => {
            current_song_url = url;
            loadLyricVideo().then(() => {
                // 曲の読み込みが完了したら再生を開始
                player.requestPlay();
                if (background !== null) {
                    // background.clear();
                    background.enableAnimation();
                }
            });
        });
    }
    if (apiKeyInput.value) {
        openai_api_key = apiKeyInput.value;
    }
});

const songSelectNavi = document.getElementById('songSelectNavi');
const searchInputNavi = document.getElementById('searchInputNavi');
const apiKeyInputNavi = document.getElementById('apiKeyInputNavi');
const songSelectUI = document.getElementById('song-select');
const advancedSettingNavi = document.getElementById('advancedSettingToggleNavi');
const advancedSettingOkNavi = document.getElementById('advancedSettingOkNavi');

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

advancedSettingNavi.addEventListener('change', function () {
    console.log("advancedSettingNavi");
    document.querySelector('.advancedSettingNavi').classList.toggle('show');
});

// 入力された Song URL と Open AI API キー（取扱注意）を格納する
advancedSettingOkNavi.addEventListener("click", (e) => {
    fadeNavigationUI();

    songSelect.selectedIndex = 0;
    const url = searchInputNavi.value;
    if (url) {
        player.createFromSongUrl(url).then(() => {
            current_song_url = url;
            loadLyricVideo().then(() => {
                // 曲の読み込みが完了したら再生を開始
                player.requestPlay();
                if (background !== null) {
                    // background.clear();
                    background.enableAnimation();
                }
            });
        });
    }
    if (apiKeyInputNavi.value) {
        openai_api_key = apiKeyInputNavi.value;
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
            if (background !== null) {
                background.enableAnimation();
            }
        }
    }
});
jumpBtn.addEventListener("click", (e) => {
    e.preventDefault()
    if (player) {
        player.requestMediaSeek(player.video.firstPhrase.startTime);
        resetChars();
    }
});
pauseBtn.addEventListener("click", (e) => {
    e.preventDefault()
    if (player) {
        if (player.isPlaying) {
            player.requestPause();
            if (background !== null) {
                background.disableAnimation();
            }
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
            if (isChorus) {
                background.setPreChorus(false);
            }

            // サビの終了
            if (lastIsChorus && !isChorus) {
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
            && beats.entered.find((b) => b.position % 2 === 1)
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
        if (segments[segmentLaterCount - 1].chorus) {
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
}

// LLM のレスポンスを変換
// 以下のような形式に変換する
// let tmpTestRes =  {
//     refrainedPhrase : `After analyzing the lyrics, I found the following refrained phrases:
//     <refrain>何十回も</refrain><refrain>何百回も</refrain><refrain>星の降る夜を超えて</refrain>
//     <refrain>何千回も</refrain><refrain>何万回も</refrain><refrain>確かな愛を叫ぶよ</refrain>
//     <refrain>何回でも</refrain><refrain>何回でも</refrain><refrain>想いをこの声に乗せて</refrain>
//     <refrain>何回だって</refrain><refrain>何回だって</refrain><refrain>届くまで叫ぶよ</refrain>
//     These refrained phrases are marked with the <refrain> tags, and they appear multiple times throughout the lyrics.`,
//     melody : `<melody>メロディ</melody>
//     <melody>歌声</melody>
//     <melody>声</melody>
//     <melody>五線譜の魔法</melody>
//     <melody>この歌</melody>
//     <melody>歌</melody>`,
//     future : `<future>ミライ</future>
//     <future>光</future>
//     <future>ミライ</future>
//     <future>光</future>
//     <future>ミライ</future>
//     <future>光</future>`,
//     mainColor: `#00aa88`,
//     baseColor: `#0066cc`,
//     accentColor: `#e12885`
//    };
function transformLLMResponse(response, result) {
    // 入れ子になったタグを処理する関数
    function processNestedTags(text, outerTag, innerTag) {
        const regex = new RegExp(`<${outerTag}>.*?<\/${outerTag}>`, 'g');
        return text.replace(regex, (match) => {
            const innerContent = match.replace(new RegExp(`</?${outerTag}>`, 'g'), '');
            return `<${outerTag}>${innerContent}</${outerTag}>` +
                innerContent.replace(new RegExp(`<${innerTag}>(.*?)<\/${innerTag}>`, 'g'), `<${innerTag}>$1</${innerTag}>`);
        });
    }

    // 入れ子になったタグを処理
    response = processNestedTags(response, 'melody', 'refrain');
    response = processNestedTags(response, 'refrain', 'melody');
    response = processNestedTags(response, 'future', 'refrain');
    response = processNestedTags(response, 'refrain', 'future');

    let refrainMatches = response.match(/<refrain>.*?<\/refrain>/g);
    if (refrainMatches && refrainMatches.length > 0) {
        result.refrainedPhrase += ' ' + refrainMatches.join(' ');
    }

    let melodyMatches = response.match(/<melody>.*?<\/melody>/g);
    if (melodyMatches && melodyMatches.length > 0) {
        result.melody += ' ' + melodyMatches.join(' ');
    }

    let futureMatches = response.match(/<future>.*?<\/future>/g);
    if (futureMatches && futureMatches.length > 0) {
        result.future += ' ' + futureMatches.join(' ');
    }

    let fontMatches = response.match(/<font>.*?<\/font>/g);
    if (fontMatches && fontMatches.length > 0) {
        result.font = fontMatches[0]; // ひとつだけの想定
    }

    let mainColorMatches = response.match(/<mainColor>.*?<\/mainColor>/g);
    if (mainColorMatches && mainColorMatches.length > 0) {
        result.mainColor = mainColorMatches[0]; // ひとつだけの想定
    }

    let baseColorMatches = response.match(/<baseColor>.*?<\/baseColor>/g);
    if (baseColorMatches && baseColorMatches.length > 0) {
        result.baseColor = baseColorMatches[0]; // ひとつだけの想定
    }

    let accentColorMatches = response.match(/<accentColor>.*?<\/accentColor>/g);
    if (accentColorMatches && accentColorMatches.length > 0) {
        result.accentColor = accentColorMatches[0]; // ひとつだけの想定
    }

    let keyPhraseMatches = response.match(/<key>.*?<\/key>/g);
    if (keyPhraseMatches && keyPhraseMatches.length > 0) {
        result.keyPhrase += ' ' + keyPhraseMatches.join(' ');
    }

    return result;
}

async function loadLLMAnalysis() {
    if (openai_api_key) {
        llm = createLlm("openai");
        llm.setApiKey(openai_api_key)
    } else if (current_song_url) {
        llm = createLlm("webllm");
    }

    let result_initial = {
        refrainedPhrase: '',
        keyPhrase: '',
        melody: '',
        future: '',
        font: "'Noto Sans JP', sans-serif",   // デフォルト
        mainColor: '#00aa88',  // デフォルト
        baseColor: '#0066cc',  // デフォルト
        accentColor: '#e12885' // デフォルト
    };

    // OpenAI と WebLLM で prompt の reply を取得する

    // リフレイン
    const prompt_refrain = "Read this lyrics: <lyrics>" + player.data.lyricsBody.text + "</lyrics>" +
        "Analyze this lyrics, identifying the refrained phrases and their apperrances in the text?" +
        "Refrained phrases mean similar phrases included in one line. Make sure that the phrases are included in the original lyrics." +
        // "Don't mark refrain when there is only one occurrance in the line."
        "For example, the line \"何十回も何百回も星の降る夜を超えて\" needs to be converted to \"<refrain>何十回も</refrain><refrain>何百回も</refrain>星の降る夜を超えて\". " +
        "For another example, the line \"セカイセカイセカイ\" needs to be converted to \"<refrain>セカイ</refrain><refrain>セカイ</refrain><refrain>セカイ</refrain>\". "
    const ret_refrain = await llm.getResponse(prompt_refrain);
    console.log("llm prompt:" + prompt_refrain);
    console.log("llm reply:" + ret_refrain);
    const result_refrain = transformLLMResponse(ret_refrain, result_initial);

    // メロディ
    const prompt_melody = "Read this lyrics: <lyrics>" + player.data.lyricsBody.text + "</lyrics>" +
        "Analyze this lyrics, identifying the words related to melody, sound, song, and voice, and their apperrances in the text?" +
        "For example, the words like \"メロディ\", \"歌\", \"声\", \"音\", \"響\", and \"叫\" need to be marked with melody tag like \"<melody>メロディ</melody>\" tag. "
    const ret_melody = await llm.getResponse(prompt_melody);
    console.log("llm prompt:" + prompt_melody);
    console.log("llm reply:" + ret_melody);
    const result_melody = transformLLMResponse(ret_melody, result_refrain);

    // ミライ
    const prompt_future = "Read this lyrics: <lyrics>" + player.data.lyricsBody.text + "</lyrics>" +
        "Analyze this lyrics, identifying the words related to future, lights, magic, hope, and miracle, and their apperrances in the text?" +
        "For example, the words like \"未来\", \"ミライ\", \"魔法\", \"奇跡\", \"キセキ\", \"光\", \"願い\", \"想い\" need to be marked with future tag like \"<future>ミライ</future>\" tag. "
    const ret_future = await llm.getResponse(prompt_future);
    console.log("llm prompt:" + prompt_future);
    console.log("llm reply:" + ret_future);
    const result_future = transformLLMResponse(ret_future, result_melody);

    // フォント
    const prompt_font = "Read this lyrics: <lyrics>" + player.data.lyricsBody.text + "</lyrics>" +
        "Analyze this lyrics, identifying the best font that fits the context of the lyrics?" +
        "For standard, active, energetic, positive lyrics, 'Noto Sans JP' will be the best." +
        "For pop, cute, charming lyrics, 'Murecho' will be the best." +
        "For negative, sad, dark lyrics, 'Noto Serif JP' will be the best." +
        "Return one of following string with including font tag, <font>'Noto Sans JP', sans-serif</font>, <font>'Noto Serif JP', serif</font>, or <font>'Murecho', sans-serif</font>"
    const ret_font = await llm.getResponse(prompt_font);
    console.log("llm prompt:" + prompt_font);
    console.log("llm reply:" + ret_font);
    const result_font = transformLLMResponse(ret_font, result_future);

    // カラーコード
    const prompt_color = "Read this lyrics: <lyrics>" + player.data.lyricsBody.text + "</lyrics>" +
        "Analyze this lyrics, identifying the best color code in hexadecimal format that fits the context of the lyrics?" +
        "Return three color codes; main color, base color, and accent color with relevant tags." +
        "For main color, use the tag \"mainColor\" e.g. <mainColor>#00aa88</mainColor>." +
        "For base color, use the tag \"baseColor\" e.g. <baseColor>#0066cc</baseColor>." +
        "For accent color, use the tag \"accentColor\" e.g. <accentColor>#e12885</accentColor>."
    const ret_color = await llm.getResponse(prompt_color);
    console.log("llm prompt:" + prompt_color);
    console.log("llm reply:" + ret_color);
    const result_color = transformLLMResponse(ret_color, result_font);

    // キーフレーズ
    const prompt_key = "Read this lyrics: <lyrics>" + player.data.lyricsBody.text + "</lyrics>" +
        "Analyze this lyrics, identifying the key phrases and their apperrances in the text?" +
        "Key phrase represents the most important message of the lyrics. I expect only one or two key phrases per lyrics." +
        "Return key phrases with the tag \"key\". e.g. <key>SUPERHERO</key>." +
        "Please make sure that you do not choose refrain phrases defined here:" + ret_refrain
    const ret_key = await llm.getResponse(prompt_key);
    console.log("llm prompt:" + prompt_key);
    console.log("llm reply:" + ret_key);
    const result_final = transformLLMResponse(ret_key, result_color);

    return result_final;
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

                let phraseEl = document.querySelector("#container p");
                phraseEl.style.textShadow = "2px 2px 4px " + color_accent;
                phraseEl.style.fontSize = "6vw";

            } else if (phrase_before.endsWith(element)) {
                console.log("key phrase end:" + element);
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
        const containerVEl = document.querySelector("#container-v");
        const pElements = containerVEl.getElementsByTagName('p');
        Array.from(pElements).forEach((element, index) => {
            element.style.animation = "fadeout 2s 1s ease-in forwards";
        });
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