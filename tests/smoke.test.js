// Smoke test pour valider la config Jest.
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
