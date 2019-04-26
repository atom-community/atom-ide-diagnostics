// @ts-check
/// <reference path="../typings/atom-ide.d.ts"/>
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
   * @type {AtomIDE.MarkdownService}
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
   * [dataTipService description]
   * @type {AtomIDE.DatatipService}
   */
  datatipService: null,
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
      this.diagnosticManager.initialize(this.renderer, this.busySignalService,
                                        this.datatipService, this.statusBarService);
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

  /**
   * [consumeMarkdownRenderer description]
   * @param  {AtomIDE.MarkdownService} renderer [description]
   */
  consumeMarkdownRenderer(renderer) {
    this.renderer = renderer;
  },

  /**
   * [consumeCodeActionProvider description]
   * @param  {AtomIDE.CodeActionProvider} codeActionProvider [description]
   * @return {[type]}                    [description]
   */
  consumeCodeActionProvider(codeActionProvider) {
    this.diagnosticManager.addProvider(codeActionProvider);
  },

  consumeBusySignal(busySignalService) {
    this.busySignalService = busySignalService;
  },

  consumeStatusBar(statusBarService) {
    this.statusBarService = statusBarService;
  },

  /**
   * [consumeDatatipService description]
   * @param  {AtomIDE.DatatipService} datatipService [description]
   * @return {[type]}                [description]
   */
  consumeDatatipService(datatipService) {
    this.datatipService = datatipService;
  },

  provideLinterUI() {
    return this.diagnosticManager;
  },

  provideIntentionsList() {
    const diagnosticManager = this.diagnosticManager;
    return {
      grammarScopes: ['*'],
      getIntentions: function({ textEditor, bufferPosition }) {
        return diagnosticManager.getCodeActions(textEditor, bufferPosition);
      }
    }
  },

  provideIntentionsHighlight() {
    const diagnosticManager = this.diagnosticManager;
    return {
      grammarScopes: ['*'],
      getIntentions: function({ textEditor, visibleRange }) {
        return diagnosticManager.getCodeHighlights(textEditor, visibleRange);
      }
    }
  }
};
