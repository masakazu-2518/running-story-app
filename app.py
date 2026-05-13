from flask import Flask, render_template, request, redirect
from datetime import datetime
import sqlite3
import random

app = Flask(__name__)

def get_db():
    return sqlite3.connect("database.db", timeout=10)

def init_db():
    conn = sqlite3.connect("database.db")
    cur = conn.cursor()
  

    cur.execute("""
CREATE TABLE IF NOT EXISTS records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    distance REAL,
    time REAL,
    time_of_day TEXT,
    comment TEXT,
    story TEXT,
    created_at TEXT,
    training_type TEXT,
    strength_type TEXT,
    detail_note TEXT
)
""")

    cur.execute("""
CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_name TEXT
)
""")

    conn.commit()
    conn.close()

def get_user_name():
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("SELECT user_name FROM settings ORDER BY id DESC LIMIT 1")
        row = cur.fetchone()

    if row:
        return row[0]

    return ""


def save_record(distance, time, time_of_day, comment, training_type, strength_type, detail_note, story):
    created_at = datetime.now().strftime("%Y年%m月%d日 %H:%M")
    conn = sqlite3.connect("database.db")
    cur = conn.cursor()

    cur.execute("""
INSERT INTO records (distance, time, time_of_day, comment, story, created_at, training_type, strength_type, detail_note)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
""", (distance, time, time_of_day, comment, story, created_at, training_type, strength_type, detail_note))

    conn.commit()
    conn.close()

@app.route("/")
def entry():
    return redirect("/splash")

@app.route("/splash")
def splash():
    user_name = get_user_name()

    if not user_name:
        next_url = "/name"
    else:
        next_url = "/intro"

    return render_template("splash.html", next_url=next_url)

@app.route("/entry")
def entry_page():
    user_name = get_user_name()

    if not user_name:
        return redirect("/name")

    return render_template("entry.html")


@app.route("/intro")
def intro():
    days_left = None
    days_text = "現在、出場予定の大会はありません"

    if race_data and race_data.get("date"):
        today = datetime.today()
        race_day = datetime.strptime(race_data["date"], "%Y-%m-%d")
        days_left = (race_day - today).days

        if days_left < 0:
            days_text = "開催済み"
        else:
            days_text = f"あと {days_left} 日"
# ユーザーネーム反映
    user_name = get_user_name()

    return render_template(
        "intro.html",
        race=race_data,
        days_left=days_left,
        days_text=days_text,
        user_name=user_name
    )

@app.route("/input")
def input_page():
    return render_template("index.html")


@app.route("/result", methods=["POST"])
def result():
    time_str = request.form["time"]
    try:
        h, m, s = map(int, time_str.split(":"))
    except:
        h, m, s = 0, 0, 0
    time = h * 3600 + m * 60 + s
    distance = round(float(request.form["distance"]), 1)
    time_of_day = request.form["time_of_day"]
    training_type = request.form.get("training_type")
    strength_type = request.form.get("strength_type")
    detail_note = request.form.get("detail_note")
    user_name = get_user_name()   # ←ユーザーネーム初回設定
    pace = (time / 60) / distance

    if distance >= 15 or pace <= 3.5:
        state = "good"
    elif distance >= 8 or pace < 4.3:
        state = "normal"
    else:
        state = "tired"

    comments = {
        "good": [
            "かなりいい走りだ。",
            "しっかり積めてるな。",
            "やるな。その調子だ。",
            "調子がいい時ほど、ケアを忘れるな。",
            "努力の成果だな。伸びている。"
        ],
        "normal": [
            "安定してる。",
            "いいリズムだ。",
            "この調子でいけ。土台は裏切らない。",
            "ペースは一定がマラソンの基本だ。",
            "まずまずだな。次はもっと良くなる。"
        ],
        "tired": [
            "少し抑えていこう。",
            "今日は回復意識だ。",
            "無理に続けるな。悪い日は引け。",
            "ちゃんと休養を取れ。",
            "怪我とかしてないよな？"
        ]
    }

    comment = random.choice(comments[state])

    stories = {
    "朝": [
        f"朝の空気がまだ静かに残っていた。\n{user_name}は今日も一歩を踏み出す。\nその積み重ねが、確実に力になっている。",
        f"朝の空気は澄んでいた。\n{user_name}は静かにシューズを結ぶ。\n今日の一歩が、また未来を変えていく。",
        f"眠る街を背に、{user_name}は走り出した。\nまだ誰も知らない努力が、ここにある。",
        f"朝日が差し込む道を、{user_name}は進む。\n積み重ねだけが、自信になると知っていた。"
    ],
    "昼": [
        f"強い光の中、足音が一定のリズムを刻む。\n{user_name}は迷いなく進み続ける。\nその姿は確実に変わり始めていた。",
        f"強い日差しの中でも、{user_name}の足取りは止まらない。\nその継続は、本物だった。",
        f"昼の風を受けながら、{user_name}は一定のリズムを刻む。\n焦らず、ただ前へ進んだ。",
        f"誰も見ていない時間にも、{user_name}は積み上げていた。\nその事実だけで十分だった。"
    ],
    "夕方": [
        f"夕日が背中を照らしていた。\n{user_name}は走り終え、静かに息を整える。\n今日の努力が、確かな自信へと変わっていく。",
        f"夕焼けが街を染める頃、{user_name}は走り終えた。\n今日も確かな一日だった。",
        f"沈む光の中で、{user_name}は呼吸を整える。\n努力は少しずつ形になっていた。",
        f"一日の終わりに、{user_name}は前へ進んだ証を残した。\nそれだけで価値があった。"
    ],
    "夜": [
        f"静かな夜の中、足音だけが響く。\n{user_name}は淡々と走り続ける。\nその積み重ねを知るのは、自分だけだ。",
        f"静かな夜道に、足音だけが響く。\n{user_name}は今日も自分と向き合っていた。",
        f"街の灯りの下、{user_name}は淡々と進む。\n言葉はいらなかった。",
        f"夜風の中でも、{user_name}の歩みは止まらない。\n積み重ねは、誰より自分が知っている。"
    ]
}

    base_story = random.choice(stories[time_of_day])

    h = time // 3600
    m = (time % 3600) // 60
    s = time % 60
    time_text = f"{h}:{m:02d}:{s:02d}"
    

    if pace <= 4.0:
        run_text = f"{distance}kmを{time_text}で走った。その一歩一歩には、確かな鋭さがあった。"
    elif pace <= 5.0:
        run_text = f"{distance}kmを{time_text}で走った。落ち着いたリズムで、最後まで崩れずに積み上げた。"
    else:
        run_text = f"{distance}kmを{time_text}で走った。速さではなく、続けることを選んだ走りだった。"

    story = f"{base_story}\n\n{run_text}\nその積み重ねは、次の日に確かにつながっていく。"

    conn = sqlite3.connect("database.db")
    cur = conn.cursor()

    pb_targets = [1, 3, 5, 10, 21, 42]

    if distance in pb_targets:
        cur.execute("""
    SELECT MIN(time) FROM records WHERE distance = ?
    """, (distance,))

    row = cur.fetchone()
    pb = int(row[0]) if row and row[0] is not None else None

    if pb is None:
        pb_message = "初記録！"
    elif time < pb:
        pb_message = "PB更新🎖"
    else:
        diff = time - pb  # 秒

        diff_hours = diff // 3600
        diff_minutes = (diff % 3600) // 60
        diff_seconds = diff % 60

        if diff_hours > 0:
            pb_message = f"PBまであと {diff_hours}時間{diff_minutes}分{diff_seconds}秒"
        elif diff_minutes > 0:
            pb_message = f"PBまであと {diff_minutes}分{diff_seconds}秒"
        else:
            pb_message = f"PBまであと {diff_seconds}秒"
    save_record(distance, time, time_of_day, comment, training_type, strength_type, detail_note, story)

    # 画像決定ロジック  

# PB更新（最強）
    if distance in pb_targets and pb is None:
        character_img = "img/manager_happy.png"
        comment = "これから始まりだ。"

    elif distance in pb_targets and time < pb:
        character_img = "img/manager_happy.png"
        name_prefix = f"{user_name}。 " if user_name else ""
        comment = f"{name_prefix}自己ベスト更新だ。よく頑張った。"


# 神ラン（長距離＆速い）
    elif distance >= 15 and pace <= 3.5:
        character_img = "img/manager_win.png"

# かなり良い
    elif distance >= 10 and pace <= 4.0:
        character_img = "img/manager_smile.png"

# 安定
    elif distance >= 5 and pace <= 5.0:
        character_img = "img/manager_confident.png"

# 普通
    elif pace <= 6.0:
        character_img = "img/manager_normal.png"

# ちょいキツい
    elif pace <= 7.0:
        character_img = "img/manager_worried.png"

# ダレてる
    elif pace <= 7.5:
        character_img = "img/manager_annoyed.png"

# きつすぎ
    elif pace <= 8:
        character_img = "img/manager_contempt.png"

# 終わってる（回復レベル）
    else:
        character_img = "img/manager_disgust.png"
        comment = "………………………………………………………………。"

    return render_template(
        "result.html",
        distance=distance,
        comment=comment,
        story=story,
        pb_message=pb_message,
        pace=pace,
        character_img=character_img,
        show_pb = distance in pb_targets
    )

@app.route("/logs")
def logs(): 
    conn = sqlite3.connect("database.db")
    conn.row_factory = sqlite3.Row  
    cur = conn.cursor()

    cur.execute("""
SELECT id, distance, time, time_of_day, comment,
       training_type, strength_type, detail_note,
       created_at
FROM records
ORDER BY id DESC
""")
    records = cur.fetchall()

    cur.execute("""
    SELECT distance, MIN(time)
    FROM records
    WHERE distance IN (1, 3, 5, 10, 21, 42)
    GROUP BY distance
    ORDER BY distance
    """)
    pbs = cur.fetchall()

    cur.execute("SELECT SUM(distance) FROM records")
        # 総距離
    total_distance = int(cur.fetchone()[0] or 0)

    # 周回数
    lap_count = total_distance // 500 + 1

    # 今の周の距離
    lap_distance = total_distance % 500

    # ちょうど500, 1000, 1500... のときは満タン表示
    if total_distance > 0 and lap_distance == 0:
        lap_distance = 500

    # メーター割合
    distance_rate = lap_distance / 500 * 100

    # 色ループ（5色）
    color_index = (lap_count - 1) % 5

    # ステージ（演出用）
    if lap_count <= 5:
        stage = "normal"
    elif lap_count <= 15:
        stage = "strong"
    elif lap_count <= 30:
        stage = "boss"
    else:
        stage = "legend"
    # 称号
    if total_distance < 50:
        title = "伍兵"
    elif total_distance < 100:
        title = "伍長"
    elif total_distance < 200:
        title = "百人将"
    elif total_distance < 300:
        title = "二百人将"
    elif total_distance < 500:
        title = "三百人将"
    elif total_distance < 1000:
        title = "五百人将"
    elif total_distance < 3000:
        title = "千人将"
    elif total_distance < 5000:
        title = "三千人将"
    elif total_distance < 10000:
        title = "五千人将"
    elif total_distance < 20000:
        title = "将軍"
    elif total_distance < 30000:
        title = "大将軍"
    else:
        title = "天下の大将軍"
    
    if title == "伍兵":
        title_class = "title-soldier"
    elif title == "伍長":
        title_class = "title-squad"
    elif title == "百人将":
        title_class = "title-100"
    elif title == "二百人将":
        title_class = "title-200"
    elif title == "三百人将":
        title_class = "title-300"
    elif title == "五百人将":
        title_class = "title-500"
    elif title == "千人将":
        title_class = "title-1000"
    elif title == "三千人将":
        title_class = "title-3000"
    elif title == "五千人将":
        title_class = "title-5000"
    elif title == "将軍":
        title_class = "title-general"
    elif title == "大将軍":
        title_class = "title-great"
    elif title == "天下の大将軍":
        title_class = "title-legend"
    else:
        title_class = "title-normal"

    cur.execute("SELECT SUM(distance), SUM(time) FROM records")
    total = cur.fetchone()

    if total[0] and total[1]:
        avg_pace = (total[1] / 60) / total[0]
    else:
        avg_pace = 0

    conn.close()

    user_name = get_user_name()
    return render_template(
    "logs.html",
    user_name=user_name,
    records=records,
    pbs=pbs,
    total_distance=total_distance,
    avg_pace=avg_pace,
    distance_rate=distance_rate,
    lap_count=lap_count,
    lap_distance=lap_distance,
    title=title,
    color_index=color_index,
    stage=stage,
    title_class=title_class
)

@app.route("/edit/<int:record_id>")
def edit_record(record_id):
    conn = sqlite3.connect("database.db")
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    cur.execute("""
    SELECT id, distance, time, time_of_day, training_type, strength_type, detail_note
    FROM records
    WHERE id = ?
    """, (record_id,))
    record = cur.fetchone()

    conn.close()

    total_seconds = int(record["time"])
    hours = total_seconds // 3600
    minutes = (total_seconds % 3600) // 60
    seconds = total_seconds % 60
    time_text = f"{hours:02d}:{minutes:02d}"

    return render_template("edit.html", record=record, time_text=time_text)

@app.route("/update/<int:record_id>", methods=["POST"])
def update_record(record_id):
    distance = float(request.form["distance"])
    time_str = request.form["time"]
    parts = list(map(int, time_str.split(":")))

    if len(parts) == 2:
        h, m = parts
        s = 0
    else:
        h, m, s = parts
    time = h * 3600 + m * 60 + s
    time_of_day = request.form["time_of_day"]
    user_name = get_user_name()

    pace = (time / 60) / distance

    if distance >= 15 or pace <= 3.5:
        state = "good"
    elif distance >= 8 or pace < 4.3:
        state = "normal"
    else:
        state = "tired"

    comments = {
        "good": [
            "かなりいい走りだ。",
            "しっかり積めてるな。",
            "やるな。その調子だ。",
            "調子がいい時ほど、ケアを忘れるな。",
            "努力の成果だな。伸びている。"
        ],
        "normal": [
            "安定してる。",
            "いいリズムだ。",
            "この調子でいけ。土台は裏切らない。",
            "ペースは一定がマラソンの基本だ。",
            "まずまずだな。次はもっと良くなる。"
        ],
        "tired": [
            "少し抑えていこう。",
            "今日は回復意識だ。",
            "無理に続けるな。悪い日は引け。",
            "ちゃんと休養を取れ。",
            "怪我とかしてないよな？"
        ]
    }

    comment = random.choice(comments[state])

    stories = {
   "朝": [
        f"朝の空気がまだ静かに残っていた。\n{user_name}は今日も一歩を踏み出す。\nその積み重ねが、確実に力になっている。",
        f"朝の空気は澄んでいた。\n{user_name}は静かにシューズを結ぶ。\n今日の一歩が、また未来を変えていく。",
        f"眠る街を背に、{user_name}は走り出した。\nまだ誰も知らない努力が、ここにある。",
        f"朝日が差し込む道を、{user_name}は進む。\n積み重ねだけが、自信になると知っていた。"
    ],
    "昼": [
        f"強い光の中、足音が一定のリズムを刻む。\n{user_name}は迷いなく進み続ける。\nその姿は確実に変わり始めていた。",
        f"強い日差しの中でも、{user_name}の足取りは止まらない。\nその継続は、本物だった。",
        f"昼の風を受けながら、{user_name}は一定のリズムを刻む。\n焦らず、ただ前へ進んだ。",
        f"誰も見ていない時間にも、{user_name}は積み上げていた。\nその事実だけで十分だった。"
    ],
    "夕方": [
        f"夕日が背中を照らしていた。\n{user_name}は走り終え、静かに息を整える。\n今日の努力が、確かな自信へと変わっていく。",
        f"夕焼けが街を染める頃、{user_name}は走り終えた。\n今日も確かな一日だった。",
        f"沈む光の中で、{user_name}は呼吸を整える。\n努力は少しずつ形になっていた。",
        f"一日の終わりに、{user_name}は前へ進んだ証を残した。\nそれだけで価値があった。"
    ],
    "夜": [
        f"静かな夜の中、足音だけが響く。\n{user_name}は淡々と走り続ける。\nその積み重ねを知るのは、自分だけだ。",
        f"静かな夜道に、足音だけが響く。\n{user_name}は今日も自分と向き合っていた。",
        f"街の灯りの下、{user_name}は淡々と進む。\n言葉はいらなかった。",
        f"夜風の中でも、{user_name}の歩みは止まらない。\n積み重ねは、誰より自分が知っている。"
    ]
}
    story = random.choice(stories[time_of_day])

    conn = sqlite3.connect("database.db")
    cur = conn.cursor()

    cur.execute("""
UPDATE records
SET distance = ?, time = ?, time_of_day = ?, comment = ?, story = ?
WHERE id = ?
""", (distance, time, time_of_day, comment, story, record_id))
    
    conn.commit()
    conn.close()

    return redirect("/logs")

@app.route("/delete/<int:record_id>", methods=["POST"])
def delete_record(record_id):
    conn = sqlite3.connect("database.db")
    cur = conn.cursor()

    cur.execute("DELETE FROM records WHERE id = ?", (record_id,))

    conn.commit()
    conn.close()

    return redirect("/logs")

@app.route("/novel")
def novel():
    user_name = get_user_name()
    page = request.args.get("page", 1, type=int)
    per_page = 10

    conn = sqlite3.connect("database.db")
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    # 総件数を取得
    cur.execute("SELECT COUNT(*) FROM records")
    total_records = cur.fetchone()[0]

    if total_records == 0:
        conn.close()
        return render_template(
            "novel.html",
            novel_text="まだ記録がありません。",
            page_links=[],
            current_page=1,
            last_page=1,
            current_label="0話"
        )

    # 総ページ数
    last_page = (total_records + per_page - 1) // per_page

    # pageの範囲補正
    if page < 1:
        page = 1
    if page > last_page:
        page = last_page

    offset = (page - 1) * per_page

    # 10件ずつ取得
    cur.execute("""
        SELECT created_at, distance, time, time_of_day, training_type, strength_type, detail_note
        FROM records
        ORDER BY id ASC
        LIMIT ? OFFSET ?
    """, (per_page, offset))

    records = cur.fetchall()
    conn.close()

    opening_map = {
        "朝": [
            "朝の空気はまだ静かだった。",
            "朝の空気が肌に残っていた。",
            "まだ街は目覚めきっていなかった。",
            "東の空がゆっくり色づいていた。",
            "街はまだ静かだった。",
            "朝露の匂いが残っていた。",
            "眠る景色の中で、一日が始まった。"
        ],
        "昼": [
            "強い光が地面に落ちていた。",
            "昼の空気は少し重たかった。",
            "足を踏み出すには十分な時間だった。",
            "空は高く、影は短かった。",
            "強い光が道を照らしていた。",
            "熱を帯びた風が頬をなでた。",
            "街は忙しなく動いていた。"
        ],
        "夕方": [
            "夕日が背中を照らしていた。",
            "光はやわらかくなっていた。",
            "今日を締めくくる時間だった。",
            "空の色が少しずつ変わっていった。",
            "長い影が道に伸びていた。",
            "今日が静かに終わろうとしていた。",
            "やわらかな風が背中を押した。"
        ],
        "夜": [
            "静かな夜だった。",
            "空気は少しひんやりしていた。",
            "足音だけが小さく響いた。",
            "街灯だけが道を照らしていた。",
            "夜気は静かに肌へ触れた。",
            "眠る街に、足音だけが響いた。",
            "誰も知らない時間が流れていた。"
        ]
    }

    parts = []

    for record in records:
        distance = record["distance"]
        run_time = record["time"]
        time_of_day = record["time_of_day"]
        training_type = record["training_type"]
        strength_type = record["strength_type"]
        detail_note = record["detail_note"]
        created_at = record["created_at"]

        lines = []

        # 日付
        created_at_text = str(created_at)
        created_parts = created_at_text.split()

        date_part = created_parts[0] if len(created_parts) > 0 else created_at_text
        record_time = created_parts[1][:5] if len(created_parts) > 1 else ""

        lines.append(f"{date_part}（{time_of_day}）")
        if record_time:
            lines.append(f"記入日時 {record_time}")

        # 導入
        lines.append(random.choice(opening_map.get(time_of_day, ["今日も走り出した。"])))

        # 行動
        action_lines = [
            f"{user_name}は{time_of_day}に走り出した。",
            f"{user_name}は静かに一歩を踏み出した。",
            f"{user_name}は靴音だけを残して進み始めた。",
            f"{user_name}は息を整え、前を向いた。",
            f"{user_name}は今日の道へ踏み出した。"
        ]

        mind_lines = [
            "迷いはなかった。",
            "言葉より先に、身体が動いていた。",
            "その一歩には、小さな決意があった。",
            "何かが変わる気がしていた。",
            "走る理由は、十分だった。"
        ]

        lines.append(random.choice(action_lines))
        lines.append(random.choice(mind_lines))
        
        pace = (run_time / 60) / distance if distance else 999
        kanata_map = {
            "good": [
                "カナタの口元がわずかに緩んだ。",
                "カナタは小さくガッツポーズをした。",
                "『……やるじゃないか。』と、彼女は小さく呟いた。",
                "彼女は視線を逸らしながら、嬉しそうだった。",
                "『ふん……当然だ。』声だけ少し弾んでいた。",
                "カナタは隠しきれず、少し笑っていた。",
                "『見事だ。今日は胸を張れ。』",
                "今日の脚は、確かな答えを出していた。"
            ],
            "normal": [
                "カナタは静かにうなずいた。",
                "『悪くない積み重ねだ。』その声はやさしかった。",
                "彼女は記録を見つめ、安心したように息をついた。",
                "カナタは腕を組んだまま、満足そうだった。",
                "『そういう日を続けろ。強くなる。』",
                "彼女は何も言わず、少しだけ目を細めた。",
                "カナタは小さく頷き、次の一歩を信じていた。",
                "『派手じゃない。でも、こういう日が強い。』",
                "その記録を見て、彼女の表情はやわらいだ。",
                "カナタは口元を少しだけ緩めた。",
                "『こういう日が、一番あとで差になる。』",
                "こういう日々が、あとで差になる。"
            ],
            "tired": [
                "カナタの視線が少しだけやわらいだ。",
                "『今日は休む勇気も必要だ。』と彼女は言った。",
                "無理をしていないか、彼女は少し気にしていた。",
                "彼女は何か言いたげだったが、黙って水を差し出した。",
                "カナタは少し眉をひそめた。",
                "『今日は休め。命令だ。』",
                "『今日はここまででいい。十分だ。』",
                "彼女は責めなかった。ただ静かに隣にいた。",
                "『止まらず来ただけで、価値はある。』",
                "速さだけが価値ではない。"
            ]
        }
        state = "tired"
        if pace <= 4.0:
            state = "good"
        elif pace <= 5.0:
            state = "normal"

        lines.append(random.choice(kanata_map[state]))

        # 内容
        total_seconds = int(run_time)
        hours = total_seconds // 3600
        minutes = (total_seconds % 3600) // 60
        seconds = total_seconds % 60

        if hours > 0:
            time_text = f"{hours}時間{minutes}分{seconds:02d}秒"
        else:
            time_text = f"{minutes}分{seconds:02d}秒"

        if training_type:
            lines.append(f"今日は{training_type}だった。")
            lines.append(f"距離は{distance}km。")
            lines.append(f"タイムは{time_text}。")

        # 補強項目
        if strength_type and strength_type != "なし":
            lines.append(f"補強は{strength_type}を入れた。")

        # メモ
        if detail_note:
            lines.append(f"メモには「{detail_note}」と残されていた。")

        # 振り返り
        pace = (run_time / 60) / distance if distance else 999

        if pace <= 4.0:
            reflect_lines = [
                [
                    "大きな変化はない。だが確実に積み上がっている。",
                    "その一歩一歩には、確かな鋭さがあった。"
                ],
                [
                    "速さの奥に、努力の跡が見えていた。",
                    "今日の脚は、確かな答えを出していた。"
                ],
                [
                    "静かな記録だ。だが内容は濃かった。",
                    "積み重ねは、数字以上の価値を持っていた。"
                ]
            ]

        elif pace <= 5.0:
            reflect_lines = [
                [
                    "大きな変化はない。だが確実に積み上がっている。",
                    "足は重くても、止まる理由にはならなかった。"
                ],
                [
                    "派手さはない。だが必要な一日だった。",
                    "こういう日々が、あとで差になる。"
                ],
                [
                    "静かな前進だった。",
                    "今日もまた、土台は強くなった。"
                ]
            ]

        else:
            reflect_lines = [
                [
                    "今日は派手さより、続けることを選んだ日だった。",
                    "遅くても、この一歩は次につながっている。"
                ],
                [
                    "思うように進まない日もある。",
                    "それでも歩みを止めなかった。"
                ],
                [
                    "速さだけが価値ではない。",
                    "続けた今日にこそ意味がある。"
                ]
            ]

        selected = random.choice(reflect_lines)

        lines.append(selected[0])
        lines.append(selected[1])

        ending_lines = [
            "この一歩は、次につながる。",
            "積み重ねは、静かに未来を変えていく。",
            "誰も見ていなくても、その努力は消えない。",
            "今日の記録は、明日の力になる。",
            "道はまだ続く。だから走れる。",
            "カナタは何も言わなかった。ただ、少し嬉しそうだった。"
        ]

        if random.randint(1, 100) == 1:
            lines.append("『……おかえり。』カナタは視線を逸らした。")
        else:
            lines.append(random.choice(ending_lines))

        text = "\n".join(lines)
        parts.append(text)

    novel_text = "\n\n".join(parts)

    # ページリンク作成
    page_links = []
    for p in range(1, last_page + 1):
        start_num = (p - 1) * per_page + 1
        end_num = min(p * per_page, total_records)
        label = f"{start_num}話〜{end_num}話"
        page_links.append({
            "page": p,
            "label": label
        })

    current_start = (page - 1) * per_page + 1
    current_end = min(page * per_page, total_records)
    current_label = f"{current_start}話〜{current_end}話"
    return render_template(
        "novel.html",
        novel_text=novel_text,
        page_links=page_links,
        current_page=page,
        last_page=last_page,
        current_label=current_label
    )


@app.route("/name")
def name_page():
    user_name = get_user_name()
    return render_template("name.html", user_name=user_name)

@app.route("/save_name", methods=["POST"])
def save_name():
    user_name = request.form["user_name"].strip()

    if not user_name:
        user_name = "名無し"

    conn = sqlite3.connect("database.db")
    cur = conn.cursor()

    cur.execute("DELETE FROM settings")
    cur.execute("INSERT INTO settings (user_name) VALUES (?)", (user_name,))

    conn.commit()
    conn.close()

    return redirect("/intro")

@app.route("/update_name", methods=["POST"])
def update_name():
    user_name = request.form["user_name"]

    conn = sqlite3.connect("database.db")
    cur = conn.cursor()

    cur.execute("DELETE FROM settings")
    cur.execute("INSERT INTO settings (user_name) VALUES (?)", (user_name,))

    conn.commit()
    conn.close()

    return redirect("/intro")



   
from datetime import datetime

race_data = {}

@app.route('/race', methods=['GET', 'POST'])
def race():
    global race_data

    if request.method == 'POST':
        race_name = request.form['race_name']
        race_date = request.form['race_date']

        race_data = {
            "name": race_name,
            "date": race_date
        }

        return redirect('/intro')

    return render_template(
    "race.html",
    race_name=race_data.get("name", ""),
    race_date=race_data.get("date", "")
)

if __name__ == "__main__":
    init_db()
app.run(debug=True, host='127.0.0.1', port=5055)