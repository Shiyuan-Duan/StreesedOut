const importAll = (r) => r.keys().map(r);

const fearSet1 = importAll(require.context('../../assets/images/Fear/Set 1', false, /\.(png|jpe?g|svg)$/));
const fearSet2 = importAll(require.context('../../assets/images/Fear/Set 2', false, /\.(png|jpe?g|svg)$/));
const fearSet3 = importAll(require.context('../../assets/images/Fear/Set 3', false, /\.(png|jpe?g|svg)$/));
const fearSet4 = importAll(require.context('../../assets/images/Fear/Set 4', false, /\.(png|jpe?g|svg)$/));

const happySet1 = importAll(require.context('../../assets/images/Happy/Set 1', false, /\.(png|jpe?g|svg)$/));
const happySet2 = importAll(require.context('../../assets/images/Happy/Set 2', false, /\.(png|jpe?g|svg)$/));
const happySet3 = importAll(require.context('../../assets/images/Happy/Set 3', false, /\.(png|jpe?g|svg)$/));
const happySet4 = importAll(require.context('../../assets/images/Happy/Set 4', false, /\.(png|jpe?g|svg)$/));

const images = {
  Fear: {
    'Set 1': fearSet1,
    'Set 2': fearSet2,
    'Set 3': fearSet3,
    'Set 4': fearSet4,
  },
  Happy: {
    'Set 1': happySet1,
    'Set 2': happySet2,
    'Set 3': happySet3,
    'Set 4': happySet4,
  },
};

export default images;
