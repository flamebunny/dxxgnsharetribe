import React from 'react';
import classNames from 'classnames';
import { Field } from 'react-final-form';

import css from './FieldRadioButton.module.css';

/**
 * IconRadioButton
 *
 * @component
 * @param {Object} props
 * @param {string?} props.checkedClassName overwrite components own css.checkedStyle
 * @param {boolean?} props.showAsRequired adds attention color for the icon if not selected
 * @returns {JSX.Element} checkbox svg that places the native radio button
 */
const IconRadioButton = props => {
  const { className, checkedClassName, showAsRequired } = props;
  return (
    <div>
      <svg
        className={className}
        width="20"
        height="20"
        xmlns="http://www.w3.org/2000/svg"
        role="presentation"
        viewBox="0 0 20 20"
      >
        <g fill="none" fillRule="evenodd">
          <rect
            className={classNames(css.checked, checkedClassName || css.checkedStyle)}
            x="2"
            y="2"
            width="16"
            height="16"
            rx="0"
          />
          <rect
            className={showAsRequired ? css.required : css.notChecked}
            x="2"
            y="2"
            width="16"
            height="16"
            strokeWidth="2"
            rx="0"
          />
          <path
            className={css.pathChecked}
            d="M6 6L14 14M14 6L6 14"
            stroke="#FFF"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>
      </svg>
    </div>
  );
};

/**
 * Final Form Field containing radio button input
 *
 * @component
 * @param {Object} props
 * @param {string?} props.className add more style rules in addition to components own css.root
 * @param {string?} props.rootClassName overwrite components own css.root
 * @param {string?} props.svgClassName is passed to radio button svg as className
 * @param {string?} props.checkedClassName overwrite components own css.checkedStyle given to icon
 * @param {string} props.id Id is needed to connect the label with input.
 * @param {string} props.name Name groups several RadioButtons to be alternative values for this "key"
 * @param {string} props.value RadioButton needs a value that is passed forward when user checks the RadioButton
 * @param {ReactNode} props.label
 * @param {boolean?} props.showAsRequired adds attention color for the icon if not selected
 * @returns {JSX.Element} Final Form Field containing radio button input
 */
const FieldRadioButton = props => {
  const {
    rootClassName,
    className,
    svgClassName,
    checkedClassName,
    textClassName,
    id,
    label,
    showAsRequired,
    ...rest
  } = props;

  const classes = classNames(rootClassName || css.root, className);
  const handleOnChange = (input, event) => {
    input.onChange(event);

    if (rest.onChange) {
      rest.onChange(event);
    }
  };

  return (
    <span className={classes}>
      <Field type="radio" {...rest}>
        {fieldRenderProps => {
          const { input, disabled } = fieldRenderProps;
          return (
            <input
              id={id}
              className={css.input}
              {...input}
              onChange={event => handleOnChange(input, event)}
              disabled={disabled}
            />
          );
        }}
      </Field>
      <label htmlFor={id} className={css.label}>
        <span className={css.radioButtonWrapper}>
          <IconRadioButton
            className={svgClassName}
            checkedClassName={checkedClassName}
            showAsRequired={showAsRequired}
          />
        </span>
        <span className={classNames(css.text, textClassName)}>{label}</span>
      </label>
    </span>
  );
};

export default FieldRadioButton;
