// @ts-check
/// <reference path="../typings/atom-ide.d.ts"/>
'use babel';

module.exports = class DiagnosticDatatipProvider {

  /**
   * [constructor description]
   */
  constructor() {
    /**
    * [providerRegistry description]
    */
    this.providerRegistry = null;
    /**
     * [messageStore description]
     */
    this.messageStore = null;
  }

  /**
   * [initialize description]
   */
  initialize(providerRegistry, messageStore) {
    this.providerRegistry = providerRegistry;
    this.messageStore = messageStore;
  }

  /**
   * [datatip description]
   */
  datatip(editor, bufferPosition, mouseEvent) {
    let result  = null;
    let messages = this.messageStore.getMessagesAtPosition(editor, bufferPosition);
    let datatip = messages.map((message) => {
      return {
        type: 'markdown',
        grammar: editor.getGrammar().scopeName,
        value: `<div class="diagnostics-marked-container ${message.type}-message"><p>${message.text}</p></div>`
      }
    });

    if ((datatip) && (datatip.length > 0)) {
      result = {
        markedStrings: datatip,
        range: messages[0].range
      }
    }

    return result;
  }

  /**
   * [validForScope description]
   */
  validForScope(scopeName) {
    return this.providerRegistry.findProvider(scopeName) != null;
  }

  /**
   * [providerName description]
   */
  get providerName() {
    return "Atom IDE Diagnostics"
  }

  /**
   * [priority description]
   */
  get priority() {
    return 100;
  }

  /**
   * [grammarScopes description]
   */
  get grammarScopes() {
    return this.providerRegistry.getAllProviders().map((provider) => {
      return provider.grammarScopes;
    }).reduce((collection, values) => { return collection.concat(values) }, []);
  }
}
