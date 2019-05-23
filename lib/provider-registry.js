// @ts-check
/// <reference path="../typings/atom-ide.d.ts"/>
'use babel';

const { Disposable, TextEditor } = require('atom');

module.exports = class ProviderRegistry {
  constructor() {
    /**
     * [providers description]
     * @type {Array<AtomIDE.CodeActionProvider>}
     */
    this.providers = [];
  }

  /**
   * [addProvider description]
   * @param {AtomIDE.CodeActionProvider} provider [description]
   */
  addProvider(provider) {
    const index = this.providers.findIndex(
      p => provider.priority > p.priority,
    );
    if (index === -1) {
      this.providers.push(provider);
    } else {
      this.providers.splice(index, 0, provider);
    }

    return new Disposable(() => this.removeProvider(provider));
  }

  /**
   * [removeProvider description]
   * @param  {AtomIDE.CodeActionProvider} provider [description]
   */
  removeProvider(provider) {
    const index = this.providers.indexOf(provider);
    if (index !== -1) {
      this.providers.splice(index, 1);
    }
  }

  /**
   * [getProviderForEditor description]
   * @param  {TextEditor} editor [description]
   * @return {AtomIDE.CodeActionProvider}        [description]
   */
  getProviderForEditor(editor) {
    const grammar = editor.getGrammar().scopeName;
    return this.findProvider(grammar);
  }

  // TODO create an ordering or priority aware util to prefer instead.
  /**
   * [getAllProvidersForEditor description]
   * @param  {TextEditor} editor [description]
   * @return {Iterable<AtomIDE.CodeActionProvider>}        [description]
   */
  getAllProvidersForEditor(editor) {
    const grammar = editor.getGrammar().scopeName;
    return this.findAllProviders(grammar);
  }

  /**
   * [findProvider description]
   * @param  {string} grammar [description]
   * @return {AtomIDE.CodeActionProvider | null}         [description]
   */
  findProvider(grammar) {
    for (const provider of this.findAllProviders(grammar)) {
      return provider;
    }
    return null;
  }

  /**
   * [findAllProviders description]
   * @param  {string}    grammar [description]
   * @return {IterableIterator<AtomIDE.CodeActionProvider>}         [description]
   */
  *findAllProviders(grammar) {
    for (const provider of this.providers) {
      if (provider.grammarScopes == null ||
          provider.grammarScopes.indexOf(grammar) !== -1) {
        yield provider;
      }
    }
  }

  /**
   * [getAllProviders description]
   * @return {[type]} [description]
   */
  getAllProviders() {
    return this.providers;
  }
}
