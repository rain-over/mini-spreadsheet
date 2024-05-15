import MiniSpreadSheet from './MiniSpreadSheet.js';

const size = [100, 100];
const container = document.querySelector('#mini-sprdxt');

(function () {
  const spreadSheet = new MiniSpreadSheet();
  const refresh = document.querySelector('#refresh');

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
})();
