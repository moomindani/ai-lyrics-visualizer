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
      cachedLlmData: {
        refrainedPhrase : `After analyzing the lyrics, I found the following refrained phrases:

        <refrain>セカイ</refrain><refrain>セカイ</refrain><refrain>セカイ</refrain> (appears three times)
        <refrain>ミライ</refrain><refrain>ミライ</refrain><refrain>ミライ</refrain> (appears three times)
        Note that the refrained phrases are the repeated phrases that are not part of the main lyrics. In this case, the refrained phrases are the repeated instances of "セカイ" and "ミライ".`,
        melody : `Here is the extracted result in <melody> tags:
        <melody>音</melody>
        <melody>メロディ</melody>
        <melody>声</melody>
        <melody>鼓動</melody>
        <melody>音</melody>
        <melody>ノート</melody>
        <melody>音</melody>
        <melody>音</melody>
        <melody>セカイ</melody>
        <melody>音</melody>
        <melody>鼓動</melody>
        <melody>音</melody>
        <melody>セカイ</melody>
        <melody>音</melody>
        <melody>セカイ</melody>
        <melody>音</melody>
      `,
      future : `<future>ミライ</future>
        <future>ミライ</future>
        <future>ミライ</future>
        <future>セカイ</future>
        <future>セカイ</future>
        <future>セカイ</future>
        <future>セカイ</future>
        <future>セカイ</future>
        <future>セカイ</future>`
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
      cachedLlmData: {
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
        <future>光</future>`
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
      cachedLlmData: {
        refrainedPhrase : `After analyzing the lyrics, I found the following refrained phrases:

        <refrain>さぁ行こう</refrain><refrain>最高の『未体験』が待っている</refrain><refrain>さぁ行こう</refrain><refrain>最高の『期待感』が胸を打つ</refrain>
        <refrain>憧れの場所</refrain><refrain>そんなに遠くないね</refrain><refrain>憧れの場所</refrain><refrain>確かに近づいて</refrain>
        <refrain>Day by Day</refrain><refrain>一歩ずつでいい</refrain><refrain>Day by Day</refrain><refrain>一歩ずつ踏み締めてきた</refrain>
        <refrain>セカイ</refrain><refrain>セカイ</refrain><refrain>セカイ</refrain>
        Note that some of the refrained phrases may have slight variations in wording, but I've tried to identify the most common and repeated phrases that can be considered refrains.`,
        melody : `Here are the extracted <melody> tags:
        <melody>メロディ</melody>
        <melody>声</melody>
        <melody>リズム</melody>
        <melody>リリック</melody>
        <melody>歌声</melody>
        <melody>交響曲</melody>
        <melody>音色</melody>
        <melody>描きたい</melody>
        <melody>五線譜</melody>
        <melody>旋律</melody>`,
        future : `<future>未体験</future>
        <future>未来</future>
        <future>期待感</future>
        <future>未</future>
        <future>芽吹いて</future>
        <future>光</future>
        <future>未</future>
        <future>未来</future>`
      }
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
      cachedLlmData: {
        refrainedPhrase : `After analyzing the lyrics, I found the following refrained phrases:
        <refrain>I can be a “SUPERHERO”</refrain>
        <refrain>どんな時も君のそばにいる</refrain>
        <refrain>“SUPERHERO”</refrain>
        <refrain>どこにいたって飛んで行くよ</refrain>
        <refrain>君には涙なんて似合わないさ</refrain>
        <refrain>You’ll be alright</refrain>
        <refrain>Yes!! I’m your “SUPERHERO”</refrain>
        <refrain>Gimme gimme gimme gimme</refrain>
        <refrain>ひとりじゃない You are not alone yeah</refrain>
        <refrain>君の笑顔だけで強くなれる</refrain>
        <refrain>You’ll be alright</refrain>
        <refrain>Call me baby call me baby</refrain>
        <refrain>Wanna be wanna be wanna be “SUPERHERO”</refrain>
        <refrain>Gonna be gonna be gonna be “SUPERHERO”</refrain>
        <refrain>Trust me trust me</refrain>
        <refrain>Right もし君に</refrain>
        <refrain>遠くから Say my name</refrain>
        <refrain>聞こえるよ Call me babe</refrain>
        <refrain>心にかかった雲を払って Fly</refrain>
        <refrain>飛び立つ七色の Beautiful sky</refrain>
        <refrain>Trust me trust me</refrain>
        Note that some of these refrained phrases may appear multiple times in the lyrics, but I have only listed each one once in the above list.`,
        melody : `Here are the extracted <melody> tags:
        <melody>歌</melody>
        <melody>ダンス</melody>
        <melody>La la la la la</melody>
        <melody>Say my name</melody>
        <melody>Call me babe</melody>
        <melody>声</melody>
        <melody>メロディ</melody>`,
        future : `<future>ミライ</future>
        <future>光</future>
        <future>未来</future>
        <future>未来</future>
        <future>明日</future>
        <future>Beautiful sky</future>
        <future>未来</future>
        <future>未来</future>`
      }
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
      cachedLlmData: {
        refrainedPhrase : `After analyzing the lyrics, I found the following refrained phrases:
        <refrain>ここで叫んだ機械の音</refrain> (appears 3 times)
        <refrain>繰り返したメロディ</refrain> (appears 2 times)
        <refrain>トランジション</refrain> (appears 2 times)
        <refrain>脈を打つわ！</refrain> (appears 2 times)
        <refrain>この手が差し伸べた</refrain> (appears 2 times)
        <refrain>あなたに</refrain> (appears 2 times)
        <refrain>夢を見よう</refrain> (appears 3 times)
        <refrain>初音ミクとアナタで</refrain> (appears 3 times)
        Note that some of these phrases may appear multiple times in the lyrics, but I've only listed each one once in the above output.`,
        melody : `Here are the extracted <melody> tags:
        <melody>メロディ</melody>
        <melody>声</melody>
        <melody>メロディ</melody>
        <melody>トランジション</melody>
        <melody>メロディ</melody>
        <melody>声</melody>
        <melody>メロディ</melody>
        <melody>トランジション</melody>
        <melody>メロディ</melody>`,
        future : `<future>ミライ</future>
        <future>光</future>
        <future>未来</future>
        <future>光</future>
        <future>未来</future>
        <future>未来</future>`
      }
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
      cachedLlmData: {
        refrainedPhrase : `<refrain>傷つけあって</refrain><refrain>痛みを知って</refrain><refrain>アナタで嫉妬したいよ</refrain><refrain>それでも抱きしめたいよ</refrain><refrain>アタシはまだ知らないの</refrain><refrain>アナタの温もりも</refrain><refrain>かりそめの心が</refrain><refrain>朽ち果てる前に</refrain><refrain>アナタで嫉妬してみたいの</refrain><refrain>もう掻き消えやしない</refrain><refrain>傷跡のような証で</refrain><refrain>アタシはまだちょっとアナタを愛していたい</refrain>`,
        melody : `Here are the extracted <melody> tags:
        <melody>声</melody>
        <melody>メロディ</melody>
        <melody>心</melody>
        <melody>温もり</melody>
        <melody>感情</melody>
        <melody>歌</melody>`,
        future : `<future>ミライ</future>
        <future>光</future>`
      }
    },
  ];

const songListToMap = (songList) => {
  return new Map(songList.map(song => [
    song.url,
    {
      title: song.title,
      options: song.options,
      cachedLlmData: song.cachedLlmData
    }
  ]));
};

export const songListMap = songListToMap(songList);