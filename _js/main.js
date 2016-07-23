//= require smoothscroll/smoothscroll.min
//= require prismjs/prism
//= require prismjs/components/prism-bash
//= require prismjs/components/prism-jsx
//= require prismjs/plugins/line-numbers/prism-line-numbers.min

// Register service workers
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/worker.js');
}
