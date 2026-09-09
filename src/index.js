document.addEventListener(
  "DOMContentLoaded",
  async () => {
    const { render } = await __jsx();
    const App = await __app();
    const { $ } = await __utils();

    render(() => [App({})], $("#app"));
  },
  { once: true },
);
