
module.exports = (app) => {
  const {dnaComponent} = app.components;

  app.post('/mutant', dnaComponent.checkDna);
  app.get('/stats', dnaComponent.checkStats);
}
