(async () => {
  const { App } = await import('../../../index.js');
  console.log('App:', App);
  process.exit(0);
})();
