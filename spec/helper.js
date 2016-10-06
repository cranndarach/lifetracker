var path = require('path');

module.exports = {
  appPath: function() {
    switch (process.platform) {
      case 'darwin':
        return path.join(__dirname, '..', '.tmp', 'Lifetracker-darwin-x64', 'Lifetracker.app', 'Contents', 'MacOS', 'Lifetracker');
      case 'linux':
        return path.join(__dirname, '..', '.tmp', 'Lifetracker-linux-x64', 'Lifetracker');
      default:
        throw 'Unsupported platform';
    }
  }
};
