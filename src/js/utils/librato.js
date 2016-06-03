const API_URL = "https://metrics-api.librato.com"
const API_VERSION = "v1"

const Librato = class Librato {
  constructor(email, token) {
    this.email = email;
    this.token = token;
    this.baseURL = API_URL + "/" + API_VERSION;
    this.headers = new Headers();
    let auth = btoa(email + ':' + token);
    this.headers.append('Authorization', 'Basic ' + auth);
  }

  fetchAlerts(success, failure) {
    let req = {
      method: 'GET',
      headers: this.headers
    }

    let url = this.baseURL + "/alerts/status"
    fetch(url, req).then((response) => {
      if (response.ok) {
        response.json().then((json) => {
          success(json);
        });
      } else {
        failure();
      }
    })
  }

  fetchAlert(alertId, success, failure) {
    let req = {
      method: 'GET',
      headers: this.headers
    }

    let url = this.baseURL + "/alerts/" + alertId;
    fetch(url, req).then((response) => {
      if (response.ok) {
        response.json().then((json) => {
          success(json);
        });
      } else {
        failure();
      }
    })
  }

  resolveAlert(alertId, success, failure) {
    let url = this.baseURL + "/alerts/" + alertId + "/clear";
    let req = {
      method: 'POST',
      headers: this.headers
    }
    fetch(url, req).then((response) => {
      if (response.ok) {
        success();
      } else {
        failure();
      }
    })

  }

}


module.exports.Librato = Librato;
