// for js examples that just require enterprise functionality (landing pages, vanilla enterprise examples etc)

const merge = require('webpack-merge');
const common = require('./webpack.common.beta.config.js');
const glob = require('glob');

const moduleDirectories = glob.sync('../../community-modules/*', {
    ignore: [
        '../../community-modules/all-modules',
        '../../community-modules/core',
        '../../community-modules/angular',
        '../../community-modules/react',
        '../../community-modules/vue',
        '../../community-modules/vue3',
        '../../community-modules/polymer'
    ]
})
    .concat(glob.sync('../../enterprise-modules/*', {ignore: '../../enterprise-modules/all-modules'}));

const mapDirectory = directory => glob.sync(`${directory}/src/**/*.ts`, {
    nodir: true,
    ignore: `${directory}/src/**/*.test.ts`
});

const flattenArray = array => [].concat.apply([], array);

const moduleTsFiles = glob.sync("../../community-modules/core/src/ts/**/*.ts", {
    nodir: true,
    ignore: "../../community-modules/core/src/ts/**/*.test.ts"
})
    .concat(flattenArray(moduleDirectories.map(mapDirectory)));

/* mostly used by landing pages */
module.exports = merge(common, {
    entry: {
        '@ag-grid-enterprise/all-modules':
            moduleTsFiles.concat(['./src/_assets/ts/enterprise-grid-all-modules-umd-beta.js'])
    },

    output: {
        filename: 'ag-grid-enterprise.js',
        library: ['agGrid'],
        libraryTarget: 'umd',
        publicPath: '/',
        pathinfo: false
    }
});
