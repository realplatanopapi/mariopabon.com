const emoji = [
  "🍌",
  "🍍",
  "🥥",
  "🍊",
  "🍑",
  "🥝",
  "🥑",
  "🍉",
  "🍒",
  "🍋",
  "🍎",
  "🌴",
  "🇵🇷",
  "🇨🇺",
  "🇲🇽",
];

let isPainting = true;

function getRandomEmoji() {
  const index = Math.floor(Math.random() * emoji.length);
  return emoji[index];
}

function throttle(fn, wait) {
  let lastCalled = null;

  return function throttledFn() {
    const now = Date.now();
    if (lastCalled === null || now - lastCalled >= wait) {
      fn.apply(null, arguments);
      lastCalled = now;
    }
  };
}

const paintEmoji = throttle(function paintEmoji(x, y) {
  const node = document.createElement("span");
  node.classList.add("emoji");
  node.innerHTML = getRandomEmoji();
  node.style.left = x;
  node.style.top = y;
  document.body.appendChild(node);

  // Center node once we know its width and height
  node.style.left = Math.ceil(x - node.clientWidth / 2);
  node.style.top = Math.ceil(y - node.clientHeight / 2);

  setTimeout(() => {
    node.style.animationName = "popOut";
    setTimeout(() => {
      document.body.removeChild(node);
    }, 250);
  }, 750);
}, 75);

function canPaintInTag(tagName) {
  const tagNameBlackList = ["h1", "h2", "h3", "p", "li", "a"];

  return tagNameBlackList.indexOf(tagName) < 0;
}

function startPainting() {
  isPainting = true;
}

function stopPainting() {
  isPainting = false;
}

document.body.addEventListener("touchstart", (event) => {
  const touch = event.targetTouches[event.targetTouches.length - 1];
  paintEmoji(touch.clientX, touch.clientY);

  const tagName = event.target.tagName.toLowerCase();
  if (canPaintInTag(tagName)) {
    event.preventDefault();
    event.stopPropagation();
    startPainting();
  }
});

document.body.addEventListener("mousemove", (event) => {
  const tagName = event.target.tagName.toLowerCase();
  console.log({
    tagName,
  });
  if (canPaintInTag(tagName)) {
    // Prevent text from being selected while the user is painting
    event.preventDefault();
    paintEmoji(event.clientX, event.clientY);
  } else {
    stopPainting();
  }
});

document.body.addEventListener("touchmove", (event) => {
  if (!isPainting) {
    return;
  }

  // Prevent text from being selected while the user is painting
  event.preventDefault();
  event.stopPropagation();
  const touch = event.targetTouches[event.targetTouches.length - 1];
  paintEmoji(touch.clientX, touch.clientY);
});

document.body.addEventListener("touchend", stopPainting);
