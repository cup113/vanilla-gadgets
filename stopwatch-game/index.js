let startTimestamp = performance.now();
let nowTimestamp = performance.now();
let running = false;
let handle = 0;
const target = 1000 * 5;
const maxHistoryItems = 15;

const grades = [
  { diff: 2.0, grade: "E", color: "gray", score: 0 },
  { diff: 1.0, grade: "D", color: "green", score: 20 },
  { diff: 0.5, grade: "D+", color: "green", score: 40 },
  { diff: 0.3, grade: "C-", color: "blue", score: 60 },
  { diff: 0.2, grade: "C", color: "blue", score: 65 },
  { diff: 0.15, grade: "C+", color: "blue", score: 70 },
  { diff: 0.13, grade: "B-", color: "red", score: 75 },
  { diff: 0.11, grade: "B", color: "red", score: 80 },
  { diff: 0.1, grade: "B+", color: "red", score: 85 },
  { diff: 0.08, grade: "A", color: "purple", score: 90 },
  { diff: 0.06, grade: "A+", color: "purple", score: 95 },
  { diff: 0.05, grade: "S-", color: "aquamarine", score: 100 },
  { diff: 0.04, grade: "S", color: "aquamarine", score: 105 },
  { diff: 0.03, grade: "S+", color: "aquamarine", score: 110 },
  { diff: 0.02, grade: "SS", color: "yellow", score: 120 },
  { diff: 0.015, grade: "SS+", color: "yellow", score: 130 },
  { diff: 0.01, grade: "SSS", color: "yellow", score: 150 },
  { diff: 0.005, grade: "U", color: "deeppink", score: 170 },
  { diff: 0.002, grade: "U+", color: "deeppink", score: 200 },
  { diff: 0.0005, grade: "U++", color: "deeppink", score: 250 },
].reverse();

const gradeScoreMap = new Map(
  grades.map((grade) => [grade.grade, grade.score]),
);

const historyRecord = JSON.parse(localStorage.getItem("SG_history") ?? "[]");

function format_time(totalMs) {
  const s = totalMs / 1000;
  return s < 10 ? "0" + s.toFixed(4) : s.toFixed(4);
}

function setTimestamp(timestamp) {
  nowTimestamp = Math.max(timestamp, startTimestamp);
  document.querySelector("#timer").textContent = format_time(
    nowTimestamp - startTimestamp,
  );
  handle = requestAnimationFrame(setTimestamp);
}

function start() {
  if (running) {
    return;
  }
  running = true;
  document.querySelector("#result").style.visibility = "hidden";
  startTimestamp = performance.now();
  handle = requestAnimationFrame(setTimestamp);
}

function gen_history_element(grade) {
  const el = document.createElement("div");
  el.textContent = grade;
  el.style.color = grades.find((g) => g.grade === grade).color;
  return el;
}

function add_history(grade) {
  historyRecord.push({ grade });
  const elHistory = document.querySelector("#history");
  if (historyRecord.length > maxHistoryItems) {
    historyRecord.shift();
    elHistory.removeChild(elHistory.lastChild);
  }
  localStorage.setItem("SG_history", JSON.stringify(historyRecord));
  elHistory.insertBefore(gen_history_element(grade), elHistory.firstChild);
}

function update_comprehensive_grade() {
  if (historyRecord.length < maxHistoryItems) {
    return;
  }
  const el = document.querySelector("#comprehensive-grade");
  const averageScore =
    historyRecord.reduce(
      (acc, item) => acc + (gradeScoreMap.get(item.grade) || 0),
      0,
    ) / historyRecord.length;
  const averageGrade = grades.find((g) => g.score <= averageScore) || {
    grade: "/",
  };
  el.textContent = `${averageGrade.grade} (${averageScore.toFixed(1)})`;
  el.style.color = averageGrade.color;
}

function stop() {
  if (!running) {
    return;
  }
  running = false;
  cancelAnimationFrame(handle);
  setTimestamp(performance.now());
  cancelAnimationFrame(handle);
  const diff = Math.abs(nowTimestamp - startTimestamp - target) / 1000;
  const grade =
    grades.find((grade) => grade.diff > diff + 1e-5) ??
    grades[grades.length - 1];
  document.querySelector("#result").style.visibility = "visible";
  document.querySelector("#diff").textContent =
    (nowTimestamp - startTimestamp >= target ? "+" : "-") +
    format_time(diff * 1000);
  document.querySelector("#grade").textContent = grade.grade;
  document.querySelector("#diff").style.color = grade.color;
  document.querySelector("#grade").style.color = grade.color;
  add_history(grade.grade);
  update_comprehensive_grade();
}

function reset() {
  startTimestamp = performance.now();
  nowTimestamp = startTimestamp;
  document.querySelector("#timer").textContent = format_time(0);
  if (running) {
    stop();
  }
  document.querySelector("#result").style.visibility = "hidden";
}

window.onload = () => {
  const attachments = [
    { id: "start", func: start },
    { id: "stop", func: stop },
    { id: "reset", func: reset },
  ];
  attachments.forEach((attachment) => {
    document
      .querySelector(`#${attachment.id}`)
      .addEventListener("click", attachment.func);
  });
  document.querySelector("#target").textContent = format_time(target);
  historyRecord.forEach((grade) => {
    const elHistory = document.querySelector("#history");
    elHistory.insertBefore(
      gen_history_element(grade.grade),
      elHistory.firstChild,
    );
  });
  update_comprehensive_grade();
};
