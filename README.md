# Popup Provider

> Await popup results in React

This library provides a comfortable way to create popups
and `await` any data from that popup close action.

# Usage

See an example in CodeSandbox

[![Edit PopupProvider](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/popupprovider-4kvmqh?fontsize=14&hidenavigation=1&theme=dark)

```tsx
// ...PopupProvider higher up in the hierarchy
// ... `const context = useContext(PopupContext)` in the component

const isSure = await openPopup<number>(
  context,
  (close) => {
    return (
      <div>
        <p>Are you sure?</p>
        <button onClick={() => close(true)}>Yes</button>
        <button onClick={() => close(false)}>No</button>
      </div>
    );
  },
  'are_you_sure' // any unique string
);
```

And provide a place to render your popups

```tsx
return (
  <div>
    {context.layers.map(({ component, resolver, id }) => (
      <div key={id}>
        <section>{component}</section>
        <button onClick={resolver}>Close this</button>
      </div>
    ))}
  <div>
)
```

Where you can have a button (or background) close the popup.
When closed with this method the value is null.
