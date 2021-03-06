import './console.scss';
import { connect } from 'preact-redux';
import { Component, h } from 'preact';
import Input from './console/input';
import Completion from './console/completion';
import Message from './console/message';
import * as consoleActions from '../../console/actions/console';

const COMPLETION_MAX_ITEMS = 33;

class ConsoleComponent extends Component {
  onBlur() {
    if (this.props.mode === 'command' || this.props.mode === 'find') {
      return this.context.store.dispatch(consoleActions.hideCommand());
    }
  }

  doEnter(e) {
    e.stopPropagation();
    e.preventDefault();

    let value = e.target.value;
    if (this.props.mode === 'command') {
      return this.context.store.dispatch(consoleActions.enterCommand(value));
    } else if (this.props.mode === 'find') {
      return this.context.store.dispatch(consoleActions.enterFind(value));
    }
  }

  selectNext(e) {
    this.context.store.dispatch(consoleActions.completionNext());
    e.stopPropagation();
    e.preventDefault();
  }

  selectPrev(e) {
    this.context.store.dispatch(consoleActions.completionPrev());
    e.stopPropagation();
    e.preventDefault();
  }

  onKeyDown(e) {
    if (e.keyCode === KeyboardEvent.DOM_VK_ESCAPE && e.ctrlKey) {
      this.context.store.dispatch(consoleActions.hideCommand());
    }
    switch (e.keyCode) {
    case KeyboardEvent.DOM_VK_ESCAPE:
      return this.context.store.dispatch(consoleActions.hideCommand());
    case KeyboardEvent.DOM_VK_RETURN:
      return this.doEnter(e);
    case KeyboardEvent.DOM_VK_TAB:
      if (e.shiftKey) {
        this.context.store.dispatch(consoleActions.completionPrev());
      } else {
        this.context.store.dispatch(consoleActions.completionNext());
      }
      e.stopPropagation();
      e.preventDefault();
      break;
    case KeyboardEvent.DOM_VK_OPEN_BRACKET:
      if (e.ctrlKey) {
        return this.context.store.dispatch(consoleActions.hideCommand());
      }
      break;
    case KeyboardEvent.DOM_VK_M:
      if (e.ctrlKey) {
        return this.doEnter(e);
      }
      break;
    case KeyboardEvent.DOM_VK_N:
      if (e.ctrlKey) {
        this.selectNext(e);
      }
      break;
    case KeyboardEvent.DOM_VK_P:
      if (e.ctrlKey) {
        this.selectPrev(e);
      }
      break;
    }
  }

  onInput(e) {
    let text = e.target.value;
    this.context.store.dispatch(consoleActions.setConsoleText(text));
    if (this.props.mode === 'command') {
      this.context.store.dispatch(consoleActions.getCompletions(text));
    }
  }


  componentDidUpdate(prevProps) {
    if (!this.input) {
      return;
    }
    if (prevProps.mode !== 'command' && this.props.mode === 'command') {
      this.context.store.dispatch(
        consoleActions.getCompletions(this.props.consoleText));
      this.focus();
    } else if (prevProps.mode !== 'find' && this.props.mode === 'find') {
      this.focus();
    }
  }

  render() {
    switch (this.props.mode) {
    case 'command':
    case 'find':
      return <div className='vimvixen-console-command-wrapper'>
        <Completion
          size={COMPLETION_MAX_ITEMS}
          completions={this.props.completions}
          select={this.props.select}
        />
        <Input
          ref={(c) => { this.input = c; }}
          mode={this.props.mode}
          onBlur={this.onBlur.bind(this)}
          onKeyDown={this.onKeyDown.bind(this)}
          onInput={this.onInput.bind(this)}
          value={this.props.consoleText}
        />
      </div>;
    case 'info':
    case 'error':
      return <Message mode={ this.props.mode } >
        { this.props.messageText }
      </Message>;
    }
  }

  focus() {
    window.focus();
    this.input.focus();
  }
}

const mapStateToProps = state => state;
export default connect(mapStateToProps)(ConsoleComponent);
