import React from 'react';
import '@testing-library/jest-dom';
import { Form as FinalForm } from 'react-final-form';

import { renderWithProviders as render, testingLibrary } from '../../util/testHelpers';
import * as validators from '../../util/validators';

import FieldSelectTree from './FieldSelectTree';

const { screen, userEvent } = testingLibrary;

const noop = () => {};

const config = {
  options: [
    {
      option: 'dogs',
      label: 'Dogs',
      suboptions: [
        {
          option: 'labradors',
          label: 'Labradors',
        },
        {
          option: 'poodles',
          label: 'Poodles',
        },
      ],
    },
    {
      option: 'cats',
      label: 'Cats',
      suboptions: [
        {
          option: 'burmese',
          label: 'Burmese cats',
        },
        {
          option: 'egyptian-mau',
          label: 'Egyptian mau',
        },
      ],
    },
    {
      option: 'fish',
      label: 'Fish',
      suboptions: [
        {
          option: 'freshwater',
          label: 'Freshwater',
          suboptions: [
            {
              option: 'greyling',
              label: 'Greyling',
            },
            {
              option: 'arctic-char',
              label: 'Arctic char',
            },
            {
              option: 'pike',
              label: 'Pike',
            },
          ],
        },
        {
          option: 'saltwater',
          label: 'Saltwater',
          suboptions: [
            {
              option: 'tuna',
              label: 'Tuna',
            },
            {
              option: 'cod',
              label: 'Cod',
            },
          ],
        },
      ],
    },
    {
      option: 'birds',
      label: 'Birds',
      suboptions: [
        {
          option: 'parrot',
          label: 'Parrot',
        },
        {
          option: 'macaw',
          label: 'Macaw',
        },
      ],
    },
    {
      option: 'reptiles',
      label: 'Reptiles',
      suboptions: [
        {
          option: 'lizards',
          label: 'Lizards',
        },
        {
          option: 'snakes',
          label: 'Snakes',
        },
      ],
    },
  ],
};

const FormComponent = props => {
  const { alwaysShowSuboptions = false, ...formProps } = props;
  return (
    <FinalForm
      {...formProps}
      render={formRenderProps => {
        const { handleSubmit, invalid, pristine, submitting } = formRenderProps;
        const submitDisabled = invalid || pristine || submitting;
        const required = validators.requiredSelectTreeOption('This field is required');
        return (
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSubmit(e);
            }}
          >
            <FieldSelectTree
              label="Nested options"
              name="nestedLevel"
              options={config.options}
              validate={required}
              alwaysShowSuboptions={alwaysShowSuboptions}
            />
            <button style={{ marginTop: 24 }} type="submit" disabled={submitDisabled}>
              Submit
            </button>
          </form>
        );
      }}
    />
  );
};

const initialData = {}; //{ nestedLevel1: 'women', nestedLevel2: 'jackets', foo: 'bar' };

describe('FieldSelectTree', () => {
  it('matches snapshot', () => {
    const tree = render(<FormComponent onSubmit={noop} initialValues={initialData} />);
    expect(tree.asFragment().firstChild).toMatchSnapshot();
  });

  it('enables submit', async () => {
    const user = userEvent.setup();
    render(<FormComponent onSubmit={noop} />, {
      messages: {
        'FieldSelectTree.screenreader.option': 'Choose {optionName}.',
        'FieldSelectTree.screenreader.optionSelected': '{optionName} is selected.',
      },
    });

    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Choose Dogs.' })).not.toBeDisabled();

    // Select "Fish" and see more options
    expect(screen.queryByRole('button', { name: 'Choose Freshwater.' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Choose Fish.' }));
    expect(screen.getByRole('button', { name: 'Choose Fish/Freshwater.' })).toBeInTheDocument();

    // Select "Freshwater" and see more options
    expect(screen.queryByRole('button', { name: 'Choose Pike.' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Choose Fish/Freshwater.' }));
    expect(
      screen.getByRole('button', { name: 'Choose Fish/Freshwater/Pike.' })
    ).toBeInTheDocument();
  });

  it('can always show suboptions and select a nested option with its parent path', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    render(<FormComponent onSubmit={onSubmit} initialValues={initialData} alwaysShowSuboptions />, {
      messages: {
        'FieldSelectTree.screenreader.option': 'Choose {optionName}.',
        'FieldSelectTree.screenreader.optionSelected': '{optionName} is selected.',
      },
    });

    const pikeOption = screen.getByRole('button', { name: 'Choose Fish/Freshwater/Pike.' });
    expect(pikeOption).toBeInTheDocument();

    await user.click(pikeOption);
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(onSubmit).toHaveBeenCalledWith(
      {
        nestedLevel: {
          nestedLevel1: 'fish',
          nestedLevel2: 'freshwater',
          nestedLevel3: 'pike',
        },
      },
      expect.anything(),
      expect.anything()
    );
  });

  it('replaces the selected parent path when selecting a visible suboption under another branch', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    render(
      <FormComponent
        onSubmit={onSubmit}
        initialValues={{ nestedLevel: { nestedLevel1: 'cats' } }}
        alwaysShowSuboptions
      />,
      {
        messages: {
          'FieldSelectTree.screenreader.option': 'Choose {optionName}.',
          'FieldSelectTree.screenreader.optionSelected': '{optionName} is selected.',
        },
      }
    );

    await user.click(screen.getByRole('button', { name: 'Choose Dogs/Labradors.' }));
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(onSubmit).toHaveBeenCalledWith(
      {
        nestedLevel: {
          nestedLevel1: 'dogs',
          nestedLevel2: 'labradors',
        },
      },
      expect.anything(),
      expect.anything()
    );
  });
});
