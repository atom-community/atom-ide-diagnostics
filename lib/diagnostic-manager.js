'use babel';

const { CompositeDisposable, Disposable } = require('atom');
const ProviderRegistry = require('./provider-registry');

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
     * [renderer description]
     * @type {[type]}
     */
    this.renderer = null;
    /**
     * [linterV2 description]
     * @type {[type]}
     */
    this.linterV2 = null;
  }

  /**
   * [initialize description]
   * @param  {[type]} renderer [description]
   * @param  {[type]} linterV2 [description]
   */
  initialize(renderer, linterV2) {
    this.renderer = renderer;
    this.linterV2 = linterV2;

    console.log(this.renderer);
    console.log(this.linterV2);
    console.log(this.providerRegistry);
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
}
