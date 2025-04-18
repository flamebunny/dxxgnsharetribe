import React from 'react';
import { string } from 'prop-types';
import classNames from 'classnames';

import css from './BlockContainerCustom.module.css';

// This element can be used to wrap some common styles and features,
// if there are multiple blockTypes,
const BlockContainerCustom = props => {
  const { className, rootClassName, as, ...otherProps } = props;
  const Tag = as || 'div';
  const classes = classNames(rootClassName || css.root, className);

  // Note: otherProps contains "children" too!
  return <Tag className={classes} {...otherProps} />;
};

BlockContainerCustom.defaultProps = {
  rootClassName: null,
  className: null,
  as: 'div',
};

BlockContainerCustom.propTypes = {
  rootClassName: string,
  className: string,
  as: string,
};

export default BlockContainerCustom;
