(function() {
  document.addEventListener('DOMContentLoaded', function(event) {
    let spinner = document.querySelector('.spinner');
    let button = document.querySelector('button');
    let input = document.querySelector('#target-input');

    let errorResult = document.querySelector('#failed-result');
    let error = errorResult.querySelector('span');

    let result = document.querySelector('#url-result');
    let link = result.querySelector('a');

    button.addEventListener('click', function(event) {
      'use strict';

      errorResult.classList.add('hidden');
      result.classList.add('hidden');
      spinner.classList.remove('hidden');

      let request = new XMLHttpRequest();
      request.onreadystatechange = function() {
        if(request.readyState === 4) {
          switch(request.status) {
            case 304:
            case 200: displayUrl(JSON.parse(request.response));
                      break;
            case 400: displayError(JSON.parse(request.response));
                      break;
          }

          spinner.classList.add('hidden');
        }
      }

      request.open('POST', '/qxcf', true);
      request.setRequestHeader("Content-type", "application/json");
      request.send(JSON.stringify({ target: input.value }));
    });

    function displayUrl(data) {
      link.href = data.url;
      link.textContent = window.location.origin + data.url;

      result.classList.remove('hidden');
    }

    function displayError(data) {
      errorResult.textContent = data.error;
      errorResult.classList.remove('hidden');
    }
  }, false);
})();
