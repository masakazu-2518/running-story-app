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
// ドラムロール入力
const timeVals = { h: 0, m: 0, s: 0 };
const timeMax = { h: 23, m: 59, s: 59 };

function pad(n) { return String(n).padStart(2, '0'); }

function updateDisp() {
    document.getElementById('hDisp').textContent = pad(timeVals.h);
    document.getElementById('mDisp').textContent = pad(timeVals.m);
    document.getElementById('sDisp').textContent = pad(timeVals.s);
}
document.addEventListener("DOMContentLoaded", () => {
    const hEl = document.getElementById('hDisp');
    const mEl = document.getElementById('mDisp');
    const sEl = document.getElementById('sDisp');
    if (hEl) timeVals.h = parseInt(hEl.textContent) || 0;
    if (mEl) timeVals.m = parseInt(mEl.textContent) || 0;
    if (sEl) timeVals.s = parseInt(sEl.textContent) || 0;
});

function step(type, delta) {
    timeVals[type] = Math.min(Math.max(0, timeVals[type] + delta), timeMax[type]);
    updateDisp();
}

// タイムのボックス
['h', 'm', 's'].forEach(type => {
    const el = document.getElementById(type + 'Disp');
    if (!el) return;

    el.setAttribute('contenteditable', 'true');
    el.setAttribute('inputmode', 'numeric');


    el.addEventListener('focus', () => {
        el.textContent = '';  // ← 空にする
        const range = document.createRange();
        range.selectNodeContents(el);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    });

    // 全角を半角にする
    el.addEventListener('input', () => {
        const converted = el.textContent.replace(/[０-９]/g, s =>
            String.fromCharCode(s.charCodeAt(0) - 0xFEE0)
        );
        const v = parseInt(converted.replace(/[^0-9]/g, ''));
        if (!isNaN(v)) {
            if (v > timeMax[type]) {
                el.style.borderColor = '#e53935';
                el.style.boxShadow = '0 0 0 4px rgba(229,57,53,0.15)';
            } else {
                el.style.borderColor = '';
                el.style.boxShadow = '';
                timeVals[type] = v;
            }
        }
    });


    el.addEventListener('blur', () => {
        const converted = el.textContent.replace(/[０-９]/g, s =>
            String.fromCharCode(s.charCodeAt(0) - 0xFEE0)
        );
        const v = parseInt(converted.replace(/[^0-9]/g, ''));
        if (!isNaN(v) && v > timeMax[type]) {
            el.style.borderColor = '#e53935';
            el.style.boxShadow = '0 0 0 4px rgba(229,57,53,0.15)';
            return;
        }
        el.style.borderColor = '';
        el.style.boxShadow = '';
        el.textContent = pad(timeVals[type]);
    });


    el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const converted = el.textContent.replace(/[０-９]/g, s =>
                String.fromCharCode(s.charCodeAt(0) - 0xFEE0)
            );
            const v = parseInt(converted.replace(/[^0-9]/g, ''));
            if (!isNaN(v) && v > timeMax[type]) {
                alert(`${type === 'h' ? '時間は0〜23' : '分・秒は0〜59'}で入力してください`);
                el.style.borderColor = '#e53935';
                el.style.boxShadow = '0 0 0 4px rgba(229,57,53,0.15)';
                return; // 次の枠に進まない
            }
            if (!isNaN(v)) {
                timeVals[type] = Math.min(Math.max(0, v), timeMax[type]);
            }
            el.style.borderColor = '';
            el.style.boxShadow = '';
            el.textContent = pad(timeVals[type]);

            if (type === 'h') {
                document.getElementById('mDisp').focus();
            } else if (type === 'm') {
                document.getElementById('sDisp').focus();
            } else {
                el.blur();
                const form = document.querySelector('.form');
                if (form) form.requestSubmit();
            }
        }
    });
});

// フォームのsubmit処理（既存のものと置き換え）
document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector(".form");
    if (!form) return;

    form.addEventListener("submit", function (e) {
        const total = timeVals.h * 3600 + timeVals.m * 60 + timeVals.s;

        if (total <= 0) {
            e.preventDefault();
            alert('タイムを入力してください');
            return;
        }

        const distanceInput = document.getElementById("distance");
        const distance = Number(distanceInput.value);

        if (!distance || distance <= 0) {
            e.preventDefault();
            distanceInput.reportValidity();
            return;
        }

        const pace = total / distance;
        if (pace < 120) {
            e.preventDefault();
            alert('タイムが速すぎます');
            return;
        }

        document.getElementById('time').value =
            pad(timeVals.h) + ':' + pad(timeVals.m) + ':' + pad(timeVals.s);
    });

    form.addEventListener("keydown", function (e) {
        if (e.key !== "Enter") return;
        if (document.activeElement.tagName === "TEXTAREA") return;
        if (document.activeElement.closest('.time-box') ||
            document.activeElement.id === 'hDisp' ||
            document.activeElement.id === 'mDisp' ||
            document.activeElement.id === 'sDisp') return; // time-boxはそれぞれが制御
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
                    "/static/img/manager_normal.webp"
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
            let imagePath = "/static/img/manager_normal.webp";

            if (topic === "reason") {
                if (value === "speed") {
                    message = "速くなるためか。\nいいな。\nその覚悟は嫌いじゃない。";
                    imagePath = "/static/img/manager_confident.webp";
                }

                if (value === "continue") {
                    message = "続けるために走るのも立派だ。\n積み上げは裏切らない。";
                    imagePath = "/static/img/manager_normal.webp";
                }

                if (value === "fun") {
                    message = "楽しむために走る。\nそれを忘れるな。\nその気持ちが、お前を強くする。";
                    imagePath = "/static/img/manager_happy.webp";
                }
            }

            if (topic === "condition") {
                if (value === "speed") {
                    message = "今日は攻められそうか。\nだが無理はするな。\n冷静に行け。";
                    imagePath = "/static/img/manager_confident.webp";
                }

                if (value === "continue") {
                    message = "普通で十分だ。\nやるべきことをやればいい。";
                    imagePath = "/static/img/manager_normal.webp";
                }

                if (value === "fun") {
                    message = "少し重い日もある。\n今日は大事にしろ。\nその感覚は武器になる。";
                    imagePath = "/static/img/manager_happy.webp";
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