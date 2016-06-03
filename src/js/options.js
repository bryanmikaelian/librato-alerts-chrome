class Options {
  constructor() {
    chrome.storage.sync.get({
      email: '',
      token: ''
    }, function(items) {
      document.getElementById('email').value = items.email;
      document.getElementById('token').value = items.token;
    });
  }

  save(callback) {
    let email = document.getElementById('email').value;
    let token = document.getElementById('token').value;
    chrome.storage.sync.set({
      email: email,
      token: token
    }, function() {
      document.querySelector('#notice').textContent = "Credentials Saved!";
      setTimeout(function() {
        document.querySelector('#notice').textContent = "";
      }, 1500);
    });
  }
}

document.addEventListener('DOMContentLoaded', function() {
  let options = new Options();
  document.getElementById('save').addEventListener('click', options.save);
});
