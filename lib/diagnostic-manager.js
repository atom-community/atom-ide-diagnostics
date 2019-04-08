'use babel';

const { CompositeDisposable, Disposable, TextEditor, Range, Point } = require('atom');
const ProviderRegistry = require('./provider-registry');
const DiagnosticUI = require('./diagnostic-ui');

module.exports = class DiagnosticManager {

  constructor() {
    /**
     * [subscriptions description]
     * @type {CompositeDisposable}
     */
    this.subscriptions = new CompositeDisposable();
    /**
     * [providerRegistry description]
     * @type {ProviderRegistry}
     */
    this.providerRegistry = new ProviderRegistry();

    /**
     * [diagnosticUI description]
     * @type {DiagnosticUI}
     */
    this.diagnosticUI = null;

    /**
     * [renderer description]
     * @type {[type]}
     */
    this.renderer = null;

    /**
     * [busySignalService description]
     * @type {AtomIDE.BusySignalService}
     */
    this.busySignalService = null;

    /**
     * [statusBarService description]
     * @type {AtomIDE.StatusBar}
     */
    this.statusBarService = null;

    /**
     * [messages description]
     * @type {Array<AtomIDE.Diagnostic>}
     */
    this.messages = [];
  }

  /**
   * [initialize description]
   * @param  {[type]} renderer [description]
   * @param {AtomIDE.BusySignalService} busySignalService
   * @param {AtomIDE.StatusBar} statusBarService
   */
  initialize(renderer, busySignalService, statusBarService) {
    this.renderer = renderer;
    this.busySignalService = busySignalService;
    this.statusBarService = statusBarService;
  }

  dispose() {
    if (this.subscriptions) {
      this.subscriptions.dispose();
    }
    this.subscriptions = null;
  }

    /**
   * [addProvider description]
   * @param {AtomIDE.CodeActionProvider} provider [description]
   * @returns {Disposable}
   */
  addProvider (provider) {
    return this.providerRegistry.addProvider(provider);
  }

  get name() {
    return "Atom IDE Diagnostic UI";
  }

  didBeginLinting(linter, filePath) {
    console.log(linter, filePath);
  }

  didFinishLinting(linter, filePath) {
    console.log(linter, filePath);
  }

  render(patch) {
    console.log(patch);
    this.messages = patch.messages;
  }

  /**
   * [getCodeActions description]
   * @param  {TextEditor} textEditor     [description]
   * @param  {Point} bufferPosition [description]
   * @return {Promise}                [description]
   */
  getCodeActions(textEditor, bufferPosition) {
    let p = new Promise((resolve, reject) => {
      const grammar = textEditor.getGrammar();
      let provider = this.providerRegistry.findProvider(grammar.scopeName);
      if ((provider == null) || (provider == undefined)) reject();
      let diagnostics = this.getMessagesAtPosition(textEditor, bufferPosition);
      provider.getCodeActions(textEditor, new Range(bufferPosition), diagnostics)
        .then((result) => {
          let titlePromises = result.map((codeAction) => {
            return new Promise((resolve, reject) => {
              codeAction.getTitle().then((title) => {
                resolve({
                  icon: 'zap',
                  title: title,
                  selected: codeAction.apply
                });
              }).catch(reject);
            })
          });
          Promise.all(titlePromises)
            .then((intentions) => {
              console.log(intentions);
              resolve(intentions);
            })
            .catch(reject);
        })
        .catch(reject);
    });

    return p;
  }

  /**
   * [getCodeHighlights description]
   * @param  {TextEditor} textEditor     [description]
   * @param  {Range} visibleRange [description]
   * @return {Promise}                [description]
   */
  getCodeHighlights(textEditor, visibleRange) {
    let p = new Promise((resolve, reject) => {
      const grammar = textEditor.getGrammar();
      let provider = this.providerRegistry.findProvider(grammar.scopeName);
      if ((provider == null) || (provider == undefined)) reject();
      let highlights = this.getMessagesInRange(textEditor, visibleRange)
        .map((highlight) => {
          return {
            range: highlight.range,
            created: function ({ textEditor, element, marker, matchedText }) {
              console.log("intention highlight created for ", matchedText);
            }
          }
        });
      resolve(highlights);
    });

    return p;
  }

  /**
   * [getMessagesAtPosition description]
   * @param  {TextEditor} textEditor     [description]
   * @param  {Point} bufferPosition [description]
   * @return {Array<AtomIDE.Diagnostic>}                [description]
   */
  getMessagesAtPosition(textEditor, bufferPosition) {
    const messages = this.messages.filter((message) => {
      if ((textEditor.getBuffer().getPath() === message.location.file) &&
          (message.location.position.containsPoint(bufferPosition))) {
            return message;
          }
    }).map((message) => {
      return {
        filePath: message.location.file,
        providerName: message.linterName,
        range: message.location.position,
        text: message.excerpt,
        type: message.severity[0].toUpperCase() + message.severity.slice(1)
      }
    });

    return messages;
  }

  /**
   * [getMessagesInRange description]
   * @param  {TextEditor} textEditor   [description]
   * @param  {Range} visibleRange [description]
   * @return {Array<AtomIDE.Diagnostic>}              [description]
   */
  getMessagesInRange(textEditor, visibleRange) {
    const messages = this.messages.filter((message) => {
      if ((textEditor.getBuffer().getPath() === message.location.file) &&
          (message.location.position.intersectsWith(visibleRange))) {
            return message;
          }
    }).map((message) => {
      return {
        filePath: message.location.file,
        providerName: message.linterName,
        range: message.location.position,
        text: message.excerpt,
        type: message.severity[0].toUpperCase() + message.severity.slice(1)
      }
    });

    return messages;
  }
}
