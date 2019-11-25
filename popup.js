document.addEventListener('DOMContentLoaded', function () {
  chrome.tabs.query({active: true, currentWindow: true}, function (arrayOfTabs) {
    chrome.tabs.reload(arrayOfTabs[0].id);
  });

  let couenter = 0;
  const timestart = new Date();
  chrome.webRequest.onBeforeRequest.addListener(
    function (details) {
      const body = document.getElementsByTagName('body')[0];
      const placeHolder = body.querySelector('.loading');
      const container = body.querySelector('.container');
      const url = decodeURIComponent(details.url);
      const s = url.split('&').filter((query) => query.indexOf('d={') > -1)[0].split('=')[1];
      const parsed = JSON.parse(s);
      const content = Object.keys(parsed).filter((key) => key !== 'name').map((key) => {
        let value = parsed[key];
        if (key === 'eventTime') {
          value = (new Date(value) - timestart) / 1000
        }
        return `<li class="row ${key}">
                    <h3>${key}</h3>
                    <label>${ typeof value === "object" ? JSON.stringify(value) : value}</label>
               </li>`
      });
      const el = `<div class="wraper event"><div class="header"><div class="count">${++couenter}</div><div class="name">${parsed.name}</div></div><ul>${content.join(
        '')}</ul></div>`
      placeHolder.style.display = "none";
      container.insertAdjacentHTML('beforeend', el)
    },
    {urls: ["*://trc.taboola.com/*abtests?*"]});

}, false);