'use babel';

const { CompositeDisposable } = require('atom');

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
   * called by Atom when activating an extension
   * @param  {[type]} state [description]
   */
  activate(state) {

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // if (!this.signatureHelpManager) this.signatureHelpManager = new SignatureHelpManager();
    // this.subscriptions.add(this.signatureHelpManager);

    require('atom-package-deps').install('atom-ide-diagnostics').then(() => {
      // this.signatureHelpManager.initialize(this.renderer);
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
  }
};
