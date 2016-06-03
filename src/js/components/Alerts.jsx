var React = require('react');
var ReactDOM = require('react-dom');
var AlertsTable = require('./AlertsTable.jsx').AlertsTable;

const AlertsUI = class AlertsUI {
  constructor() {
    ReactDOM.render(<AlertsComponent />, document.getElementById('alerts-index')) ;
  }
}

class AlertsComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = { alerts: [], needsCreds: undefined, initialFetch: true };
    this.onResolveAlert = this.onResolveAlert.bind(this);
  }

  onSave() {
    var email = document.querySelector('#email').value;
    var token = document.querySelector('#token').value;

    if (email && token) {
      chrome.storage.sync.set({
        email: email,
        token: token
      }, function() {
        this.setState({needsCreds: false, initialFetch: true});
      }.bind(this));
    } else {
      console.warn("No creds provided.");
    }
  }

  onResolveAlert(alertId) {
    chrome.storage.sync.get('alerts', (items) => {
      if (items.alerts.length) {
        let activeAlerts = items.alerts.filter(function(alert) {
          return alert.id !== alertId;
        });
        chrome.storage.sync.set({'alerts': activeAlerts}, function(bytesInUse) {
          chrome.runtime.sendMessage({resolvedAlertId: alertId}, function(response) {});
          if (activeAlerts.length > 0) {
            chrome.browserAction.setBadgeText({text: String(activeAlerts.length)});
          } else {
            chrome.browserAction.setBadgeText({text: ''});
          }
        }.bind(this));
      }
    });
  }

  componentWillMount() {
    chrome.storage.onChanged.addListener(function(changes, areaName) {
      if (areaName === 'sync') {
        // Something changed in storage...
        if (changes.alerts) {
          // New alerts...
          this.setState({alerts: changes.alerts.newValue, initialFetch: false});
        } else if(this.state.initialFetch) {
          // New credentials but no alerts found...
          this.setState({alerts: [], initialFetch: false});
        } else {
          console.warn('Unable to update alerts');
          this.setState({alerts: [], initialFetch: false});
        }
      }
    }.bind(this));
  }

  componentDidMount() {
    chrome.storage.sync.get({
      email: '',
      token: '',
      validCredentials: true
    }, (items) => {
      if (items.email === '' || items.token === '') {
        this.setState({needsCreds: true});
      } else {
        chrome.storage.sync.get('alerts', (items) => {
          if (items.alerts && items.alerts.length) {
            this.setState({alerts: items.alerts, initialFetch: false, needsCreds: false});
          } else {
            this.setState({alerts: [], initialFetch: false, needsCreds: undefined});
          }
        });
      }
    });

  }

  render() {
    if (this.state.needsCreds === undefined) {
      return (
        <div className="alerts-list alerts-list--empty">
          <div className="alerts-list__placeholder">
            <p>Hmm. Your API credentials appear to be invalid. You can change your credentials under your preferences.</p>
          </div>
        </div>
      )
    } else if (this.state.needsCreds) {
      return (
        <div className='alerts-credentials'>
          <div>
            <div className="alerts-credentials__heading">
              <h1>API Credentials</h1>
              <span>You can create and manage your credentials from your <a href="http://metrics.librato.com/tokens" target="_blank">Librato</a> account.</span>
            </div>
            <div className="alerts-credentials__form">
              <input id="email" type="text" placeholder="librato@test.local" autoFocus="true" />
              <input id="token" type="password" placeholder="Your API token" />
            </div>
            <button className="alerts-credentials__submit button button--blue" onClick={this.onSave.bind(this)}>Add Credentials</button>
          </div>
        </div>
      )
    } else {
      let className = this.state.alerts.length > 0 ? 'alerts-list' : 'alerts-list alerts-list--empty';
      return (
        <div className={className}>
          <AlertsTable alerts={this.state.alerts} firstFetch={this.state.initialFetch} onResolveAlert={this.onResolveAlert}/>
        </div>
      )
    }
  }
}

module.exports.AlertsUI = AlertsUI;
