(async () => {
  const { App } = await import('@peter-schweitzer/ezserver');
  console.log('App:', App);
  process.exit(0);
})();
