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
  }

  /**
   * [initialize description]
   * @param  {[type]} renderer [description]
   */
  initialize(renderer) {
    this.renderer = renderer;

    console.log(this.renderer);
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
