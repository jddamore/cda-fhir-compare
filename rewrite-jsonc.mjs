import fs from 'fs';
import stripJsonComments from 'strip-json-comments';

let files = fs.readdirSync('./examples/ccda-fhir-project');

for (let i = 0; i < files.length; i++) {
    if (files[i].slice(-5).toLowerCase() === 'jsonc') {
        let file = fs.readFileSync(`./examples/ccda-fhir-project/${files[i]}`, 'utf-8');
        let write = stripJsonComments(file);
        fs.writeFileSync(`./examples/ccda-fhir-project/${files[i].replace('jsonc', 'json')}`, write);
    }
} 