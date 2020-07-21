// @ts-check
/// <reference path="../typings/atom-ide.d.ts"/>
'use babel';

const { CompositeDisposable, Disposable, TextEditor, Range, Point } = require('atom');
const ProviderRegistry = require('./provider-registry');
const MessageStore = require('./message-store');
const DiagnosticUI = require('./diagnostic-ui');
const DiagnosticDatatipProvider = require('./diagnostic-datatip-provider');

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
     * @type {AtomIDE.MarkdownService}
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
     * [datatipService description]
     * @type {AtomIDE.DatatipService}
     */
    this.datatipService = null;
    /**
     * [diagnosticDatatipProvider description]
     * @type {DiagnosticDatatipProvider}
     */
    this.diagnosticDatatipProvider = new DiagnosticDatatipProvider();
    /**
     * [messageStore description]
     * @type {MessageStore}
     */
    this.messageStore = new MessageStore();
  }

  /**
   * [initialize description]
   * @param  {AtomIDE.MarkdownService} renderer [description]
   * @param {AtomIDE.BusySignalService} busySignalService
   * @param {AtomIDE.StatusBar} statusBarService
   * @param {AtomIDE.DatatipService} datatipService
   */
  initialize(renderer, busySignalService, statusBarService, datatipService) {
    this.renderer = renderer;
    this.busySignalService = busySignalService;
    this.statusBarService = statusBarService;
    this.datatipService = datatipService;
    this.datatipService.addProvider(this.diagnosticDatatipProvider);
    this.diagnosticDatatipProvider.initialize(this.providerRegistry, this.messageStore);
  }

  /**
   * [dispose description]
   */
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

  /**
   * [name description]
   */
  get name() {
    return "Atom IDE Diagnostic UI";
  }

  /**
   * [didBeginLinting description]
   */
  didBeginLinting(linter, filePath) {
    console.log(linter, filePath);
  }

  /**
   * [didFinishLinting description]
   */
  didFinishLinting(linter, filePath) {
    console.log(linter, filePath);
  }

  /**
   * [render description]
   */
  render(patch) {
    this.messageStore.messages = patch.messages;
  }

  /**
   * [grammarScopes description]
   * @return {[type]} [description]
   */
  get grammarScopes() {
    return this.providerRegistry.getAllProviders().map((provider) => {
      return provider.grammarScopes;
    }).reduce((collection, values) => { return collection.concat(values) }, []);
  }

  /**
   * [getCodeActions description]
   * @param  {TextEditor} textEditor     [description]
   * @param  {Point} bufferPosition [description]
   * @return {Promise}                [description]
   */
  getCodeActions(textEditor, bufferPosition) {
    const grammar = textEditor.getGrammar();
    let provider = this.providerRegistry.findProvider(grammar.scopeName);
    if ((provider == null) || (provider == undefined)) {
      throw new Exception('Provider is undefined');
    }

    let diagnostics = this.messageStore.getMessagesAtPosition(textEditor, bufferPosition);

    return provider.getCodeActions(textEditor, new Range(bufferPosition), diagnostics)
    .then((result) => {
      let titlePromises = result.map(codeAction =>
        codeAction.getTitle()
        .then(title => ({
          icon: 'zap',
          title: title,
          selected: codeAction.apply
        }))
      );

      return Promise.all(titlePromises);
    });
  }
}
