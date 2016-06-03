var React = require('react');
var moment = require('moment');

const AlertsTable = class AlertsTable extends React.Component {
  constructor(props) {
    super(props);
  }

  onResolveAlert(alertId, e) {
    this.props.onResolveAlert(alertId);
  }

  render() {
    let sortedAlerts = this.props.alerts.sort(function(a,b) {
      return a.triggered_at < b.triggered_at;
    });

    let alerts = sortedAlerts.map(alert => (
      <tr key={alert.id}>
        <td className="alerts-list__item">
          <p className="item__title">
            <a href={"https://metrics.librato.com/alerts#/" + alert.id} target="_blank">
              {alert.name}
            </a>
          </p>
          <p className="item__description">
            {alert.description}
          </p>
          <p className="item__timestamp">
            Triggered {moment.unix(alert.triggered_at).format("LLL")}
          </p>
        </td>
        <td className="alerts-list__actions">
          <a className="button button--blue" onClick={this.onResolveAlert.bind(this, alert.id)}>
            Resolve
          </a>
        </td>
      </tr>
    ));

    if (alerts.length > 0) {
      return (
        <table>
          <thead>
            <tr>
              <th>
                <strong>
                  Current Alerts
                </strong>
              </th>
              <th>
              </th>
            </tr>
          </thead>
          <tbody>
            {alerts}
          </tbody>
        </table>
      )
    } else if (this.props.firstFetch) {
      return (
        <div className="alerts-list__placeholder">
          <p>Fetching Alerts...</p>
        </div>
      )
    } else {
      return (
        <div className="alerts-list__placeholder">
          <p>Yay! No Alerts are currently being triggered.</p>
        </div>
      )
    }
  }
}

module.exports.AlertsTable = AlertsTable;
