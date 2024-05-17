/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const path = require('path');

const subgraphsDir = path.join(
  __dirname,
  '..',
  '..',
  'src',
  'networks',
  'subgraphs',
);
const packageJsonPath = path.join(__dirname, '..', '..', 'package.json');

fs.readdir(subgraphsDir, (err, files) => {
  if (err) {
    console.error('Error al leer la carpeta de subgraphs:', err);
    return;
  }

  const yamlFiles = files.filter((file) => file.endsWith('.yaml'));

  const scripts = yamlFiles.reduce((acc, file) => {
    const subgraphName = path.basename(file, '.yaml');
    acc[`deploy:subgraph:${subgraphName}`] =
      `graph deploy --studio 0x2d83—EC0B66/${subgraphName} ${path.join(
        subgraphsDir,
        file,
      )}`;
    return acc;
  }, {});

  fs.readFile(packageJsonPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error al leer package.json:', err);
      return;
    }

    const packageJson = JSON.parse(data);
    packageJson.scripts = { ...packageJson.scripts, ...scripts };

    fs.writeFile(
      packageJsonPath,
      JSON.stringify(packageJson, null, 2),
      'utf8',
      (err) => {
        if (err) {
          console.error('Error al escribir en package.json:', err);
          return;
        }
      },
    );
  });
});
