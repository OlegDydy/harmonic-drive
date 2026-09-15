document.addEventListener(
  "DOMContentLoaded",
  async () => {
    const { render } = await __jsx();
    const App = await __app();

    const mountPoint = document.querySelector("#app");
    if (!mountPoint) throw new Error("Can not mount app");

    render(() => App({}), mountPoint);
  },
  { once: true },
);
