// Smoke test to validate the Jest config.
describe('Jest setup', () => {
  it('runs JS', () => {
    expect(1 + 1).toBe(2);
  });

  it('has jest-dom matchers', () => {
    const el = document.createElement('div');
    el.textContent = 'hello';
    document.body.appendChild(el);
    expect(el).toBeInTheDocument();
    expect(el).toHaveTextContent('hello');
  });
});
