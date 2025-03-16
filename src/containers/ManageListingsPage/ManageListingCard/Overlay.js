import React from 'react';
import { node, string } from 'prop-types';
import classNames from 'classnames';

import css from './Overlay.module.css';

const Overlay = props => {
  

  const { className, rootClassName, message, messageClass, errorMessage, children } = props;
  const classes = classNames(rootClassName || css.root, className);
  const classes2 = classNames(messageClass ? css.messageClass : '' )

  return (
    <div
      className={classes}
      onClick={event => {
        event.preventDefault();
        event.stopPropagation();
      }}
    >
      <div className={css.overlay} />
      <div className={css.overlayContent}>
        {errorMessage ? <div className={css.errorMessage}>{errorMessage}</div> : null}
        {message ? <div className={classNames(css.message, classes2)}>{message}</div> : null}
        {children}
      </div>
    </div>
  );
};

Overlay.defaultProps = {
  className: null,
  rootClassName: null,
  message: null,
  messageClass: null,
  errorMessage: null,
  children: null,
};

Overlay.propTypes = {
  className: string,
  rootClassName: string,
  message: string,
  messageClass: string,
  errorMessage: string,
  children: node,
};

export default Overlay;
