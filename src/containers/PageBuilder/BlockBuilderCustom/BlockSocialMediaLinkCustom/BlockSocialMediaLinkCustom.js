import React from 'react';
import { func, node, object, shape, string } from 'prop-types';
import classNames from 'classnames';

import Field from '../../Field';
import BlockContainerCustom from '../BlockContainerCustom';

import css from './BlockSocialMediaLinkCustom.module.css';

const BlockSocialMediaLinkCustom = props => {
  const { blockId, className, rootClassName, link, options } = props;

  const classes = classNames(rootClassName || css.root, className);

  return (
    <BlockContainerCustom id={blockId} className={classes}>
      <Field data={link} options={options} className={css.link} />
    </BlockContainerCustom>
  );
};

const propTypeOption = shape({
  fieldComponents: shape({ component: node, pickValidProps: func }),
});

const propTypeLink = shape({
  fieldType: string,
  platform: string,
  url: string,
});

BlockSocialMediaLinkCustom.defaultProps = {
  className: null,
  rootClassName: null,
  link: null,
};

BlockSocialMediaLinkCustom.propTypes = {
  blockId: string,
  className: string,
  rootClassName: string,
  link: propTypeLink,
  options: propTypeOption,
};

export default BlockSocialMediaLinkCustom;
