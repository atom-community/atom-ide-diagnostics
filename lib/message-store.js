// @ts-check
/// <reference path="../typings/atom-ide.d.ts"/>
'use babel';

const { CompositeDisposable, Disposable, TextEditor, Range, Point } = require('atom');

module.exports = class MessageStore {

  constructor() {
    /**
     * [items description]
     * @type {Array<AtomIDE.Diagnostic>}
     */
    this.items = [];
  }

  /**
   * [setMessages description]
   */
  set messages(messages) {
    this.items = messages;
    console.log(this.items);
  }

  /**
   * [getMessagesAtPosition description]
   * @param  {TextEditor} textEditor     [description]
   * @param  {Point} bufferPosition [description]
   * @return {Array<AtomIDE.Diagnostic>}                [description]
   */
  getMessagesAtPosition(textEditor, bufferPosition) {
    const messages = this.items.filter((message) => {
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
}
