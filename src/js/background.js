var LibratoAPI = require('./utils/librato').Librato;

const ALARM_NAME = "com.librato.alerts.fetcher";

class Background {
  constructor() {
    this.apiClient = null;
    this.alarm = null;
    this.activeAlertIds = [];
    this.firingAlerts = [];

    // Setup Librato API Client, fetch alerts, start alarm
    new Promise((resolve, reject) => {
      this.initAPIClient(function(success) {
        if (success) {
          resolve();
        } else {
          reject();
        }
      });
    })
    .then(() => {
      // Check if any alerts already exist...
      chrome.storage.sync.get('alerts', function(items) {
        if (items.alerts) {
          this.firingAlerts = items.alerts;
          this.activeAlertIds = this.firingAlerts.map(function(a) {
            return a.id;
          });
        }
        // Query the API for any changes to these alerts. Create alarm
        this.fetchAlerts();
        this.createAlarm();
      }.bind(this));
    })
    .catch(function() {
      console.warn("Unable to init API Client due to invalid credentials.");
      chrome.browserAction.setBadgeText({text: '?'});
    });

    // Listen for storage changes
    chrome.storage.onChanged.addListener(this.onStorageChange.bind(this));

    // Listen for any messages
    chrome.runtime.onMessage.addListener(this.onMessage.bind(this));
  }

  initAPIClient(callback) {
    chrome.storage.sync.get({
      email: '',
      token: ''
    }, (items) => {
      if (items.email !== '' && items.token !== '') {
        this.apiClient = new LibratoAPI(items.email, items.token);
        callback(true);
      } else {
        callback(false);
      }
    });
  }

  fetchAlerts() {
    let previousAlertIds = this.activeAlertIds;
    let previousFiringAlerts = this.firingAlerts;

    // Clear out firing alerts so alerts that stopped firing are removed
    this.activeAlertIds = [];
    this.firingAlerts = [];

    this.apiClient.fetchAlerts((alerts) => {
      if (alerts && alerts.firing.length) {
        Promise.all(alerts.firing.map((alert) => {
          let promise = new Promise((resolve, reject) => {
            if (previousAlertIds.indexOf(alert.id) < 0) {
              // First time seeing this alert...
              this.apiClient.fetchAlert(alert.id, (alertDetail) => {
                this.activeAlertIds.push(alert.id);
                alertDetail.triggered_at = alert.triggered_at; // Triggered at isn't returned from /status endpoint
                this.firingAlerts.push(alertDetail);
                this.sendNotificationForAlert(alertDetail);
                resolve();
              }, function() {
                reject();
              });
            } else {
              // We have seen this alert already and it is still happening...
              this.activeAlertIds.push(alert.id);
              this.firingAlerts.push(previousFiringAlerts.find(function(firingAlert) {
                return firingAlert.id === alert.id;
              }));
              resolve();
            }
          });

          return promise;
        })).then(() =>{
          this.updateBadgeText();
          this.updateStorage();
        });
      } else {
        // No alerts exist...
        this.updateBadgeText();
        this.updateStorage();
      }
    }, function() {
      console.warn("Unable to fetch firing alerts");
      chrome.browserAction.setBadgeText({text: '?'});
      this.clearAlarm(function() {});
    }.bind(this));
  }

  updateStorage() {
    chrome.storage.sync.set({'alerts': this.firingAlerts}, function(bytesInUse) {});
  }

  updateBadgeText() {
    let alertsCount = this.activeAlertIds.length;
    if (alertsCount > 0) {
      chrome.browserAction.setBadgeText({text: String(alertsCount)});
    } else {
      chrome.browserAction.setBadgeText({text: ''});
    }
  }

  sendNotificationForAlert(alert) {
    chrome.notifications.getPermissionLevel(function(level) {
      if (level === "granted") {
        let message;

        if (alert.conditions.length) {
          let condition = alert.conditions[0];
          message = condition.metric_name + " was " + condition.type + " the threshold of " + condition.threshold + ".";
        } else {
          message = "";
        }

        let opts = {
          type: "basic",
          title: "Alert " + alert.name + " has triggered!",
          message: message,
          contextMessage: alert.description,
          iconUrl: "./icon.png"
        };

        chrome.notifications.create("", opts, function(notificationId) {
        });
      }
    }.bind(this));
  }

  createAlarm() {
    if (this.alarm === null) {
      chrome.alarms.create(ALARM_NAME, {periodInMinutes: 1});
      chrome.alarms.onAlarm.addListener(this.onAlarm.bind(this));
    }
  }

  clearAlarm(callback) {
    chrome.alarms.clear(ALARM_NAME, function(wasCleared) {
      if (wasCleared) {
        callback();
        this.alarm = null;
      } else {
        callback();
      }
    }.bind(this));
  }

  purgeData() {
    console.log('Purging all data. 👋');
    this.clearAlarm();
    chrome.browserAction.setBadgeText({text: ''});
    chrome.storage.sync.clear(function() {});
    this.apiClient = null;
    this.activeAlertIds = [];
    this.firingAlerts = [];
  }

  onAlarm(alarm) {
    console.log('Alarm fired');
    this.fetchAlerts();
  }

  onStorageChange(changes, areaName) {
    if (areaName === "sync") {
      if (changes.alerts) {
        this.firingAlerts = changes.alerts.newValue || [];
        this.activeAlertIds = this.firingAlerts.map(function(a) { return a.id; });
      } else if (changes.email || changes.password) {
        // Credentials were added, changed, or removed.

        if (changes.email.newValue === "" || changes.password === "") {
          // Credentials removed. Purge all the things.
          this.purgeData();
        } else if (changes.email.oldValue !== changes.email.newValue || changes.token.oldValue !== changes.token.newValue ) {
          // Credentials were added or changed. Re-init API Client and restart everything
          this.initAPIClient(function(success) {
            if (success) {
              chrome.storage.sync.remove('alerts', function() {
                this.fetchAlerts();
                this.clearAlarm(function() {});
              }.bind(this));
            }
          }.bind(this));
        }
      }
    }
  }

  onMessage(request, sender, sendResponse) {
    if (request && request.resolvedAlertId) {
      // Alert was resolved
      this.apiClient.resolveAlert(request.resolvedAlertId, function() {
        sendResponse({resolved: true});
      }, function() {
        sendResponse({resolved: true});
      });
    }

    return true;
  }
}

if (chrome.runtime) {
  if (chrome.runtime.onStartup) {
    chrome.runtime.onStartup.addListener(function() {
      new Background();
    });
  }

  if (chrome.runtime.onInstalled) {
    chrome.runtime.onInstalled.addListener(function() {
      new Background();
    });
  }
}
