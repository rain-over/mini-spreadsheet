import MiniSpreadSheet from './src/MiniSpreadSheet/MiniSpreadSheet.js';

const testData = {
  A1: { value: 2, formula: '=b1+c1' },
  B1: { value: 2, formula: '=c1+d1' },
  D1: { value: 2, formula: '=e1' },
  E1: { value: 2, formula: '=f1' },
  F1: { value: 2, formula: '=g1+h1' },
  G1: { value: 1, formula: '=i1' },
  H1: { value: 1, formula: '=i1' },
  I1: { value: '1' },
};
const testSize = [100, 100];
const container = document.querySelector('#mini-sprdxt');

(function () {
  const spreadSheet = new MiniSpreadSheet();
  const refresh = document.querySelector('#refresh');
  const test = document.querySelector('#test');

  spreadSheet.render();

  refresh.onclick = () => {
    const { data, size } = spreadSheet;
    spreadSheet.destroy();

    // Added delay for refresh to be visible.
    setTimeout(() => {
      const redrawSpreadSheet = new MiniSpreadSheet(data, size);
      redrawSpreadSheet.render();
    }, 200);
  };

  test.onclick = () => {
    spreadSheet.destroy();

    // Added delay for refresh to be visible.
    setTimeout(() => {
      const redrawSpreadSheet = new MiniSpreadSheet(testData, testSize);
      redrawSpreadSheet.render();
    }, 200);
  };
})();
