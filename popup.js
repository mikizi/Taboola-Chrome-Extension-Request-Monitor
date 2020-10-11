let state = [];
let filter = {
  onlyAbtest: ["*://trc.taboola.com/*abtests?*"],
  allEvents: ["*://trc.taboola.com/*log/3*"],
  bulkVisibleClick: ["*://trc.taboola.com/*bulk?*", "*://trc.taboola.com/*click?*", "*://trc.taboola.com/*visible?*"]
};
document.addEventListener('DOMContentLoaded', function () {
  const body = document.getElementsByTagName('body')[0];
  const placeHolder = body.querySelector('.loading');
  const container = body.querySelector('.container');
  let counter = 0;
  const timeStart = new Date();

  chrome.tabs.query({active: true, currentWindow: true}, function (arrayOfTabs) {
    const reloadBtn = document.getElementById('refreshBtn');
    reloadBtn.addEventListener('click', () => {
      chrome.tabs.reload(arrayOfTabs[0].id);
      chrome.storage.sync.clear(function() {
        console.log('clear state');
        container.innerHTML = '';
        counter = 0;
        placeHolder.style.display = "block";
      });
    });

   chrome.storage.sync.get(['key'], function(result) {
      console.log('Value currently is ' , result);
      if(result.key.length){
        state = result.key
        const contentHtml = state.map(item => {
          const {key, value} = item;
          return getItem(key, value)
        }).join('');

        placeHolder.style.display = "none";
        container.insertAdjacentHTML('beforeend', contentHtml);
      }

    });

  });

  chrome.webRequest.onBeforeRequest.addListener(
    function (details) {

      const url = decodeURIComponent(details.url);
      let eventName = url.match(/log\/3\/(.*)\?/)[1];
      let content = 'no data to show';

      if(eventName === 'abtests') {
        const s = url.split('&').filter((query) => query.indexOf('d={') > -1)[0].split('=')[1];
        let parsed = JSON.parse(s);
        eventName = parsed.name;
        content = Object.keys(parsed).filter((key) => key !== 'name').map((key) => {
          let value = parsed[key];
          if (key === 'eventTime') {
            value = (new Date(value) - timeStart) / 1000
          }

          return getListItem(key, value);
        }).join('');
      }

      state.push({key: eventName, value: content});
      chrome.storage.sync.set({key: state}, function() {
        console.log('Value is set to ' + state);
      });

      const contentHtml = getItem(eventName, content);
      placeHolder.style.display = "none";
      container.insertAdjacentHTML('beforeend', contentHtml);

    },
    {urls: filter.allEvents});

    function getListItem(key, value){
      return `<li class="row ${key}">
                    <h3>${key}</h3>
                    <label>${typeof value === "object" ? JSON.stringify(value) : value}</label>
               </li>`;
    }

    function getItem(eventName, content){
       return `<div class="wraper event">
                    <div class="header">
                        <div class="count">${++counter}</div>
                        <div class="name">${eventName}</div>
                    </div>
                    <ul>${content}</ul>
                   </div>`
    }

}, false);