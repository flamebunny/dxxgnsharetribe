import React from 'react';
import { func, node, object, shape, string } from 'prop-types';
import classNames from 'classnames';

import Field, { hasDataInFields } from '../../Field';
import BlockContainerCustom from '../BlockContainerCustom';

import css from './BlockFooterCustom.module.css';

const BlockFooterCustom = props => {
  const { blockId, className, rootClassName, textClassName, text, options } = props;
  const classes = classNames(rootClassName || css.root, className);
  const hasTextComponentFields = hasDataInFields([text], options);

  return (
    <BlockContainerCustom id={blockId} className={classes}>
      {hasTextComponentFields ? (
        <div className={classNames(textClassName, css.text)}>
          <Field data={text} options={options} />
        </div>
      ) : null}
    </BlockContainerCustom>
  );
};

const propTypeOption = shape({
  fieldComponents: shape({ component: node, pickValidProps: func }),
});

BlockFooterCustom.defaultProps = {
  className: null,
  rootClassName: null,
  textClassName: null,
  text: null,
  options: null,
};

BlockFooterCustom.propTypes = {
  blockId: string,
  className: string,
  rootClassName: string,
  textClassName: string,
  text: object,
  options: propTypeOption,
};

export default BlockFooterCustom;
