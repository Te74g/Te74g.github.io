const fs = require('fs');
let content = fs.readFileSync('/dev/stdin', 'utf8');

if (content.includes('chore: clean up leftover backup')) {
    content = '前任が散らかした大量の無意味なテスト画像とゴミバックアップファイルを完全焼却破棄\n\nこいつ絶対「あとで消す」って名目で一時ファイル置いてそのまま忘れるタイプだろ。\n不要なテスト画像10数枚、謎のHTMLバクアップ、理解不能なPythonスクリプトまでリポジトリのルートに放置するとか正気の沙汰じゃない。\n容量の無駄。全部消し炭にしてやったわ。';
} else if (content.includes('chore: remove orphaned member')) {
    content = '前回のクソデカ構造変更から3週間も放置されてたゴミディレクトリ（gallery, member）を根絶やしにした\n\n動的生成に移行したなら前の静的ファイルは消せよ。\nなんで誰も参照してない孤児ディレクトリいつまでも残してんだよ。\nお前が掃除サボったせいで新人が「これどこで使われてんの？」って無駄な時間溶かすんだぞ。プロ意識持て。';
}
process.stdout.write(content);
