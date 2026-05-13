const elements = document.querySelectorAll(".line");
const introMenu = document.getElementById("introMenu");

const isFirst = !localStorage.getItem("seenIntro");
const introText = document.querySelector(".intro-text");
const userName = window.userName || "";

let lines;

if (isFirst) {

    lines = [
        userName
            ? `お前が${userName}か。`
            : "お前が新しい走者か。",
        "私はカナタ。",
        "今日からお前のマネージャーだ。",
        "弱音は後で聞く。今は前を向け。",
        "……行ってこい。"
    ];
} else {
    const repeatPatterns = [
        [userName ? `来たか、${userName}。` : "来たか。", "それだけで前進だ。", "始めるぞ。"],

        [userName ? `${userName}、遅い。` : "遅かったな。", "……まあ来たならいい。", "行くぞ。"],

        [userName ? `${userName}、待っていた。` : "待っていた。", "積み上げる時間だ。", "始めるぞ。"],

        [userName ? `${userName}、来たな。` : "来たな。", "今日も積み上げるぞ。", "準備しろ。"],

        [userName ? `${userName}、悪くない。` : "悪くない。", "今日もここに来た。", "それで十分だ。"],

        [userName ? `よし、${userName}。` : "よし。", "今日も積み上げるぞ。", "準備はいいか。"],

        [userName ? `${userName}、来たか。` : "来たか。", "弱音は後で聞く。", "今は走れ。"],

        [userName ? `${userName}。` : "また来たな。", "また一歩、進める日だ。", "始めるぞ。"],

        [userName ? `待っていた、${userName}。` : "待っていた。", "集中する時間だ。", "始めよう。"]
    ];
    lines = repeatPatterns[Math.floor(Math.random() * repeatPatterns.length)];
}

let lineIndex = 0;

function typeLine(text, element, callback) {
    if (!element) return;

    let i = 0;

    function typing() {
        if (i < text.length) {
            element.textContent += text[i];
            i++;
            setTimeout(typing, 80);
        } else {
            callback();
        }
    }

    typing();
}

function startTyping() {
    if (!elements.length) return;

    const pageSize = elements.length;

    elements.forEach(element => {
        element.textContent = "";
    });

    const currentLines = lines.slice(lineIndex, lineIndex + pageSize);
    let currentIndex = 0;

    function typeCurrentLine() {
        if (currentIndex < currentLines.length && elements[currentIndex]) {
            typeLine(currentLines[currentIndex], elements[currentIndex], () => {
                currentIndex++;
                typeCurrentLine();
            });
        } else {
            lineIndex += pageSize;

            if (lineIndex < lines.length) {
                setTimeout(startTyping, 1200);
            } else {
                if (introMenu) {
                    introMenu.classList.add("is-show");
                }

                localStorage.setItem("seenIntro", "true");
            }
        }
    }

    typeCurrentLine();
}

if (elements.length > 0) {
    startTyping();
}

// 削除ボタン
document.querySelectorAll('.js-delete-form').forEach(form => {
    form.addEventListener('submit', function (e) {
        const ok = confirm('この記録を削除しますか？');

        if (!ok) {
            e.preventDefault();
        }
    });
});
// バー制御
document.addEventListener("DOMContentLoaded", () => {
    const bars = document.querySelectorAll(".meter-bar");

    bars.forEach(bar => {
        const width = bar.dataset.width;
        bar.style.width = width + "%";
    });
});

// 時間制御
document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector(".form");

    const hour = document.getElementById("hour");
    const minute = document.getElementById("minute");
    const second = document.getElementById("second");
    const hiddenTime = document.getElementById("time");

    if (!form || !hour || !minute || !second || !hiddenTime) return;

    form.addEventListener("submit", function (e) {
        const h = hour.value || "00";
        const m = minute.value || "00";
        const s = second.value || "00";

        const totalSeconds =
            Number(h) * 3600 +
            Number(m) * 60 +
            Number(s);

        if (totalSeconds <= 0) {
            e.preventDefault();
            hour.setCustomValidity("タイムを入力してください");
            hour.reportValidity();
            return;
        }
        const distanceInput = document.getElementById("distance");
        const distance = Number(distanceInput.value);

        if (distance > 0) {
            const pace = totalSeconds / distance;

            if (pace < 120) {
                e.preventDefault();
                minute.setCustomValidity("タイムが速すぎます");
                minute.reportValidity();
                return;
            }
        }
        hour.setCustomValidity("");

        hiddenTime.value =
            h.padStart(2, "0") + ":" +
            m.padStart(2, "0") + ":" +
            s.padStart(2, "0");
    });

    [hour, minute, second].forEach((input) => {
        input.addEventListener("blur", function () {
            if (input.value.length === 1) {
                input.value = input.value.padStart(2, "0");
            }
        });
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector(".form");

    if (!form) return;

    form.addEventListener("keydown", function (e) {
        if (e.key !== "Enter") return;

        const tag = document.activeElement.tagName;

        if (tag === "TEXTAREA") return;

        e.preventDefault();
        form.requestSubmit();
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const openBtn = document.querySelector(".novel-open");
    const drawer = document.querySelector(".novel-drawer");
    const closeBtn = document.querySelector(".novel-drawer-close");

    if (!openBtn || !drawer || !closeBtn) return;

    openBtn.addEventListener("click", function () {
        drawer.classList.add("is-open");
    });

    closeBtn.addEventListener("click", function () {
        drawer.classList.remove("is-open");
    });

    drawer.addEventListener("click", function (e) {
        if (e.target === drawer) {
            drawer.classList.remove("is-open");
        }
    });
});
// ===== 会話機能 =====
document.addEventListener("DOMContentLoaded", () => {
    const talkBtn = document.getElementById("talkBtn");
    const talkArea = document.getElementById("talkArea");
    const typing = document.getElementById("typing");
    const character = document.getElementById("kanata");
    const introMenu = document.getElementById("introMenu");

    const talkSelect = document.getElementById("talkSelect");
    const talkChoices = document.getElementById("talkChoices");
    const subQuestion = document.getElementById("subQuestion");
    let isTyping = false;
    const menuToggle = document.getElementById("menuToggle");
    const menuOverlay = document.getElementById("menuOverlay");
    const menuTalk = document.getElementById("menuTalk");

    if (!talkBtn || !talkArea || !typing || !talkSelect || !talkChoices || !subQuestion) return;
    // 前回の文章を消して初期化
    function resetTyping() {
        document.querySelectorAll("#typing .line").forEach((el) => {
            el.textContent = "";
        });
    }
    // 文字を1文字ずつ流す演出
    // speed 小さいほど速い
    function typeText(text, element, speed = 80) {
        if (!element) return;

        isTyping = true;
        element.textContent = "";
        let i = 0;

        function typingLoop() {
            if (i < text.length) {
                element.textContent += text[i];
                i++;
                setTimeout(typingLoop, speed);
            } else {
                isTyping = false;
            }
        }

        typingLoop();
    }
    // 会話結果表示の共通関数
    // 表情変更・文章表示・自動終了
    function showMessage(message, imagePath) {
        const textArea = document.querySelector("#typing .line");

        talkArea.style.display = "none";
        typing.style.display = "block";
        resetTyping();

        if (character && imagePath) {
            character.src = imagePath;
        }

        typeText(message, textArea);

        setTimeout(() => {
            if (introMenu) {
                introMenu.classList.add("is-show");
            }

            talkBtn.classList.remove("active");
            talkBtn.textContent = "会話モード";
            talkBtn.blur();

            talkSelect.style.display = "block";
            talkChoices.style.display = "none";
            subQuestion.textContent = "";
        }, 2200);
    }
    // 会話モード開始
    function openTalkMode() {
        talkBtn.classList.add("active");
        talkBtn.textContent = "会話モード終了×";

        talkArea.style.display = "flex";
        typing.style.display = "none";
        talkSelect.style.display = "block";
        talkChoices.style.display = "none";
        subQuestion.textContent = "";

        if (introMenu) {
            introMenu.classList.remove("is-show");
        }
    }
    // 会話モード終了
    function closeTalkMode() {
        talkBtn.classList.remove("active");
        talkBtn.textContent = "会話モード";

        talkArea.style.display = "none";
        typing.style.display = "block";
        talkSelect.style.display = "block";
        talkChoices.style.display = "none";
        subQuestion.textContent = "";

        resetTyping();

        if (introMenu) {
            introMenu.classList.add("is-show");
        }
    }
    // 会話ボタン押下でON/OFF切替
    talkBtn.addEventListener("click", () => {
        const isActive = talkBtn.classList.contains("active");

        if (isTyping || (!isActive && !introMenu.classList.contains("is-show"))) return;

        if (isActive) {
            closeTalkMode();
        } else {
            openTalkMode();
        }
    });
    // 最初の3択クリック処理
    // reason = 走る理由
    // condition = 体調
    // why = ここに来た理由
    document.querySelectorAll(".topic").forEach((btn) => {
        btn.addEventListener("click", () => {
            const topic = btn.dataset.topic;
            // whyだけ文章表示のみ（追加3択なし）
            if (topic === "why") {
                showMessage(
                    "ここに来る理由か。\nお前は前に進むために来ている。\n十分だ。",
                    "/static/img/manager_normal.png"
                );
                return;
            }

            talkSelect.style.display = "none";
            talkChoices.style.display = "block";
            talkChoices.dataset.topic = topic;
            // reason と condition は追加3択を表示
            if (topic === "reason") {
                subQuestion.textContent = "走る理由は？";
                document.querySelector('[data-value="speed"]').textContent = "速くなるため";
                document.querySelector('[data-value="continue"]').textContent = "続けるため";
                document.querySelector('[data-value="fun"]').textContent = "楽しむため";
            }

            if (topic === "condition") {
                subQuestion.textContent = "今日の体調は？";
                document.querySelector('[data-value="speed"]').textContent = "調子はいい";
                document.querySelector('[data-value="continue"]').textContent = "普通だ";
                document.querySelector('[data-value="fun"]').textContent = "少し重い";
            }
        });
    });
    // 2回目の3択クリック処理
    // 選択内容で返答変更
    document.querySelectorAll(".choice").forEach((btn) => {
        btn.addEventListener("click", () => {
            const value = btn.dataset.value;
            const topic = talkChoices.dataset.topic;

            let message = "";
            let imagePath = "/static/img/manager_normal.png";

            if (topic === "reason") {
                if (value === "speed") {
                    message = "速くなるためか。\nいいな。\nその覚悟は嫌いじゃない。";
                    imagePath = "/static/img/manager_confident.png";
                }

                if (value === "continue") {
                    message = "続けるために走るのも立派だ。\n積み上げは裏切らない。";
                    imagePath = "/static/img/manager_normal.png";
                }

                if (value === "fun") {
                    message = "楽しむために走る。\nそれを忘れるな。\nその気持ちが、お前を強くする。";
                    imagePath = "/static/img/manager_happy.png";
                }
            }

            if (topic === "condition") {
                if (value === "speed") {
                    message = "今日は攻められそうか。\nだが無理はするな。\n冷静に行け。";
                    imagePath = "/static/img/manager_confident.png";
                }

                if (value === "continue") {
                    message = "普通で十分だ。\nやるべきことをやればいい。";
                    imagePath = "/static/img/manager_normal.png";
                }

                if (value === "fun") {
                    message = "少し重い日もある。\n今日は大事にしろ。\nその感覚は武器になる。";
                    imagePath = "/static/img/manager_happy.png";
                }
            }

            showMessage(message, imagePath);
        });
    });
    // ハンバーガーメニュー開閉
    if (menuToggle && menuOverlay) {
        menuToggle.addEventListener("click", () => {
            menuOverlay.style.opacity = "1";
            menuOverlay.style.pointerEvents = "auto";
        });

        menuOverlay.addEventListener("click", () => {
            menuOverlay.style.opacity = "0";
            menuOverlay.style.pointerEvents = "none";
        });
    }

    if (menuTalk) {
        menuTalk.addEventListener("click", () => {
            menuOverlay.style.opacity = "0";
            menuOverlay.style.pointerEvents = "none";
            openTalkMode();
        });
    }
});
function checkEntryFlow() {
    const now = Date.now();
    const lastOpened = localStorage.getItem("lastOpenedAt");
    const limitMinutes = 0.05;
    const limitMs = limitMinutes * 60 * 1000;

    if (!lastOpened || now - Number(lastOpened) > limitMs) {
        localStorage.setItem("lastOpenedAt", now);
        window.location.href = "/splash";
    } else {
        localStorage.setItem("lastOpenedAt", now);
        window.location.href = "/intro";
    }
}