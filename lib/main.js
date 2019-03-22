'use babel';

const { CompositeDisposable, StatusBar } = require('atom');
const DiagnosticManager = require('./diagnostic-manager');

module.exports = {

  /**
   * [subscriptions description]
   * @type {CompositeDisposable}
   */
  subscriptions: null,

  /**
   * [renderer description]
   * @type {[type]}
   */
  renderer: null,
  /**
   * [busySignalService description]
   * @type {AtomIDE.BusySignalService}
   */
  busySignalService: null,
  /**
   * [statusBarService description]
   * @type {StatusBar}
   */
  statusBarService: null,

  /**
   * [diagnosticManager description]
   * @type {[type]}
   */
  diagnosticManager: null,

  /**
   * called by Atom when activating an extension
   * @param  {[type]} state [description]
   */
  activate(state) {

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    if (!this.diagnosticManager) this.diagnosticManager = new DiagnosticManager();
    this.subscriptions.add(this.diagnosticManager);

    require('atom-package-deps').install('atom-ide-diagnostics').then(() => {
      this.diagnosticManager.initialize(this.renderer);
    });
  },

  /**
   * called by Atom when deactivating an extension
   */
  deactivate() {
    if (this.subscriptions) {
      this.subscriptions.dispose();
    }
    this.subscriptions = null;
  },

  consumeMarkdownRenderer(renderer) {
    this.renderer = renderer;
  },

  consumeCodeActionProvider(codeActionProvider) {
    this.diagnosticManager.addProvider(codeActionProvider);
  },

  consumeBusySignal(busySignalService) {
    this.busySignalService = busySignalService;
  },

  consumeStatusBar(statusBarService) {
    this.statusBarService = statusBarService;
  },

  provideLinterUI() {
  },

  provideIntentions() {
  }
};
