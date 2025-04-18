## BlockBuilderCustom

The default schema for page content has 3 levels that can include content fields:

- **page asset** (data from Asset Delivery API)
  - **sections** (page asset contains sections)
    - **blocks** (section might contain blocks)

This is the builder for block types. Although, at the time of writing, there's only one block type
supported: '**defaultBlockCustom**'. The component called **BlockDefaultCustom** handles the rendering of that
block type.

```jsx
<BlockBuilderCustom
  ctaButtonClass={css.myCallToActionButton}
  blocks={[
    {
      blockType: 'defaultBlock',
      blockId: 'block-1',
      title: {
        fieldType: 'heading2',
        content: 'Hello world!',
      },
      text: {
        fieldType: 'markdown',
        content: `**Lorem ipsum** consectetur adepisci velit`,
      },
      callToAction: {
        fieldType: 'internalButtonLink',
        content: 'Go to search page',
        href: '/s',
      },
    },
  ]}
  responsiveImageSizes={responsiveImageSizes}
  options={options}
/>
```

## Adding a new block component

1. Create a new folder

   - E.g. _BlockMyComponent_
   - The naming convention (i.e. _'Block'_ prefix) is just there to help to work with code editors
     and text suggestions.

2. Add component files there

   - **_BlockMyComponent.js_**
     - Main file containing the component's code
     - There's a special component called BlockContainerCustom, which should be used to wrap your
       component. For example:
       ```jsx
       <BlockContainerCustom id={blockId} className={css.root}>
         <Field data={title} options={options} />
         <Field data={text} options={options} />
       </BlockContainerCustom>
       ```
   - **_BlockMyComponent.module.css_**
     - Styles for your component
   - **_index.js_**
     - This should just export your main component

3. Edit _BlockBuilderCustom.js_

   1. You need to import your component to BlockBuilderCustom:

      ```js
      // Block components
      import BlockDefaultCustom from './BlockDefaultCustom';
      import BlockMyComponentCustom from './BlockMyComponentCustom';
      // This is the same as writing:
      // import BlockMyComponentCustom from './BlockMyComponentCustom/index.js';
      ```

   2. Inside BlockBuilderCustom, there's a mapping between block type and component that can render it:

      ```js
      const defaultBlockComponents = {
        defaultBlock: { component: BlockDefaultCustom },
      };
      ```

      You can change this to use your custom component:

      ```js
      const defaultBlockComponents = {
        defaultBlock: { component: BlockMyComponent },
      };
      ```
