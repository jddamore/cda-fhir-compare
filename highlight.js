var escape = require('escape-html');
const fs = require('fs');
const moment = require('moment');
const { init } = require('express/lib/application');
const { v4: uuidv4 } = require('uuid');
const { add } = require('nodemon/lib/rules');
const { parse, stringify } = require('comment-json');
const xml2js = require('xml2js');

// let xmlFile = fs.readFileSync('./examples/allergy/example.xml', 'utf-8');
// let jsonFile = fs.readFileSync('./examples/allergy/example.json', 'utf-8');
let template = fs.readFileSync('./template.html', 'utf-8');

let options = {
  object: true,
  reversible: false,
  coerce: false,
  sanitize: true,
  trim: true,
  arrayNotation: true,
  alternateTextNode: false
};

// Translation of elements (also re-highlights strings on CDA side)
const fhirEquivalents = {
  '2.16.840.1.113883.6.96' : 'https://www.snomed.org/|http://www.snomed.org/|https://snomed.info/sct|http://snomed.info/sct',
  '2.16.840.1.113883.6.88' : 'https://www.nlm.nih.gov/research/umls/rxnorm|http://www.nlm.nih.gov/research/umls/rxnorm',
  '2.16.840.1.113883.6.1' : 'https://loinc.org|http://loinc.org',
  '2.16.840.1.113883.6.90' : 'http://hl7.org/fhir/sid/icd-10-cm',
  '2.16.840.1.113883.6.69': 'https://hl7.org/fhir/sid/ndc|http://hl7.org/fhir/sid/ndc',
  '2.16.840.1.113883.6.101': 'https://terminology.hl7.org/CodeSystem/v3-nuccProviderCodes|http://terminology.hl7.org/CodeSystem/v3-nuccProviderCodes|https://nucc.org/provider-taxonomy|http://nucc.org/provider-taxonomy',
  '2.16.840.1.113883.5.4': 'https://hl7.org/fhir/v3/ActCode|http://hl7.org/fhir/v3/ActCode',
  '2.16.840.1.113883.6.12': 'https://www.ama-assn.org/go/cpt|http://www.ama-assn.org/go/cpt',
  '2.16.840.1.113883.12.292': 'https://hl7.org/fhir/sid/cvx|http://hl7.org/fhir/sid/cvx',	
  '2.16.840.1.113883.6.103': 'https://hl7.org/fhir/sid/icd-9-cm|http://hl7.org/fhir/sid/icd-9-cm',
  '2.16.840.1.113883.6.104': 'https://hl7.org/fhir/sid/icd-9-cm|http://hl7.org/fhir/sid/icd-9-cm',
  '2.16.840.1.113883.6.4': 'https://www.icd10data.com/icd10pcs|http://www.icd10data.com/icd10pcs',
  '2.16.840.1.113883.3.26.1.1': 'https://ncicb.nci.nih.gov/xml/owl/EVS/Thesaurus.owl|http://ncicb.nci.nih.gov/xml/owl/EVS/Thesaurus.owl',
  '2.16.840.1.113883.5.83': 'https://hl7.org/fhir/v3/ObservationInterpretation|http://hl7.org/fhir/v3/ObservationInterpretation',
  '2.16.840.1.113883.5.8': 'http://terminology.hl7.org/CodeSystem/v3-ActReason',

  '419511003': 'medication',
  '46680005': 'vital-signs',
  '74728-7': '85353-1', // Vital Sign CDA vs FHIR panel code
  'f': 'female',  // don't do 'm' since we use that for married
  'h': 'home',
  'negationind=&quot;true&quot;': 'not-done',
  '2708-6': '59408-5',  // Pulse ox mapping to 2 FHIR codes
  '1.030': '1.03',
};

const cdaSynonyms = {
  '2.16.840.1.113883.6.1' : ['LOINC'],
  '2.16.840.1.113883.6.88' : ['RxNorm'],
  '2.16.840.1.113883.6.90' : ['ICD-10-CM'],
  '2.16.840.1.113883.6.96' : ['SNOMED CT', 'SNOMED-CT', 'SNOMED'],
  '46680005' : ['&quot;vital signs&quot;', 'vital-signs'],
  'recurrence': ['246455001'],
}

const ignoredWords = [
  'administration',
  'maritalstatus',
  'or',
  'unit',
];

/*
These were not mapped above but available in VSAC
ActMood	http://hl7.org/fhir/v3/ActMood	2.16.840.1.113883.5.1001
ActPriority	http://hl7.org/fhir/v3/ActPriority	2.16.840.1.113883.5.7
ActReason	http://hl7.org/fhir/v3/ActReason	2.16.840.1.113883.5.8
ActRelationshipType	http://hl7.org/fhir/v3/ActRelationshipType	2.16.840.1.113883.5.1002
ActStatus	http://hl7.org/fhir/v3/ActStatus	2.16.840.1.113883.5.14
AddressUse	http://hl7.org/fhir/v3/AddressUse	2.16.840.1.113883.5.1119
AdministrativeGender	http://hl7.org/fhir/v3/AdministrativeGender	2.16.840.1.113883.5.1
AdministrativeSex	http://hl7.org/fhir/v2/0001	2.16.840.1.113883.18.2
CDT	http://www.ada.org/cdt	2.16.840.1.113883.6.13
Confidentiality	http://hl7.org/fhir/v3/Confidentiality	2.16.840.1.113883.5.25
DischargeDisposition	http://hl7.org/fhir/v2/0112	2.16.840.1.113883.12.112
EntityNamePartQualifier	http://hl7.org/fhir/v3/EntityNamePartQualifier	2.16.840.1.113883.5.43
EntityNameUse	http://hl7.org/fhir/v3/EntityNameUse	2.16.840.1.113883.5.45
LanguageAbilityMode	http://hl7.org/fhir/v3/LanguageAbilityMode	2.16.840.1.113883.5.60
LanguageAbilityProficiency	http://hl7.org/fhir/v3/LanguageAbilityProficiency	2.16.840.1.113883.5.61
LivingArrangement	http://hl7.org/fhir/v3/LivingArrangement	2.16.840.1.113883.5.63
MaritalStatus	http://hl7.org/fhir/v3/MaritalStatus	2.16.840.1.113883.5.2
MED-RT	http://www.nlm.nih.gov/research/umls/MED-RT	2.16.840.1.113883.6.345
NDFRT	http://hl7.org/fhir/ndfrt	2.16.840.1.113883.3.26.1.5
NUCCPT	http://nucc.org/provider-taxonomy	2.16.840.1.113883.6.101
NullFlavor	http://hl7.org/fhir/v3/NullFlavor	2.16.840.1.113883.5.1008
ObservationInterpretation	http://hl7.org/fhir/v3/ObservationInterpretation	2.16.840.1.113883.5.83
ObservationValue	http://hl7.org/fhir/v3/ObservationValue	2.16.840.1.113883.5.1063
ParticipationFunction	http://hl7.org/fhir/v3/ParticipationFunction	2.16.840.1.113883.5.88
ParticipationMode	http://hl7.org/fhir/v3/ParticipationMode	2.16.840.1.113883.5.1064
ParticipationType	http://hl7.org/fhir/v3/ParticipationType	2.16.840.1.113883.5.90
PresentOnAdmission	https://www.cms.gov/Medicare/Medicare-Fee-for-Service-Payment/HospitalAcqCond/Coding	2.16.840.1.113883.6.301.11
ReligiousAffiliation	http://hl7.org/fhir/v3/ReligiousAffiliation	2.16.840.1.113883.5.1076
RoleClass	http://hl7.org/fhir/v3/RoleClass	2.16.840.1.113883.5.110
RoleCode	http://hl7.org/fhir/v3/RoleCode	2.16.840.1.113883.5.111
RoleStatus	http://hl7.org/fhir/v3/RoleStatus	2.16.840.1.113883.5.1068
SOP	https://nahdo.org/sopt	2.16.840.1.113883.3.221.5
UCUM (Common UCUM Units)	http://unitsofmeasure.org	2.16.840.1.113883.6.8
UMLS	http://www.nlm.nih.gov/research/umls	2.16.840.1.113883.6.86
UNII	http://fdasis.nlm.nih.gov	2.16.840.1.113883.4.9
mediaType	http://hl7.org/fhir/v3/MediaType	2.16.840.1.113883.5.79
*/

const addFields = function (thing, data) {
  if (!thing) return;
  if (typeof thing === 'string') {
    data.push(tweakString(thing));
    return;
  }
  if (Array.isArray(thing)) {
    for (const item of thing) {
      addFields(item, data);
    }
    return;
  }

  // Maaaaybe need to ignore some?
  for (const field of Object.keys(thing)) {
    if (typeof thing[field] === 'string') {
      if (field === 'negationInd' && thing[field] === 'true') {
        data.push('negationInd=&quot;true&quot;');
      } else {
        data.push(tweakString(thing[field]));
      }
    }
    else if (Array.isArray(thing[field])) {
      for (const item of thing[field]) {
        addFields(item, data);
      }
    }
    else if (typeof thing[field] === 'object') {
      addFields(thing[field], data);
    }
  }
}

const tweakString = function (string) {
  if (string.startsWith('tel:')) string = string.slice(4);
  return string.trim();
}

// Operations for Mapping
const dateTranslate = function (thing) {
  const dateParts = thing.match(/^(\d{4})(\d{2})(\d{2})(\d{2})?(\d{2})?(\d{2})?([+-]\d{2})?(\d{2})?/);
  if (dateParts) {
    const [_, year, month, day, hour = '00', minute = '00', second = '00', offsetH = '', offsetM = ''] = dateParts;
    const offset = offsetH ? `${offsetH}:${offsetM}` : '';
    return `${year}-${month}-${day}T${hour}:${minute}:${second}${offset}`;
  }
}

const match = function (fhirStuff, data) {
  let matches = {
    cda: [],
    fhir: []
  };
  let colorIndex = 10;
  fhirStuff = fhirStuff.replace(/urn:(oid|uuid):/gm, '');
  for (let i = 0; i < data.length; i++) {
    let initialLength = matches.cda.length;
    const number = !isNaN(Number(data[i]));
    // Separate runs - first one to find a match - stop looking
    for (const [pre, post] of [
      ['"', '"'],   // Surrounded by quotes
      ["'", "'"],   // Surrounded by single quotes
      ['\\s', '"'],  // End of a string
      ['\\s', '\\s'], // Surrounded by spaces
      ['\\s', ',']   // End of a string with a comma
    ]) {
      const match = fhirStuff.match(stringToRegExp(data[i], pre, post));
      if (match && match[1]) {
        matches.cda.push({string: data[i], color: colorIndex});
        matches.fhir.push({string: match[1], color: colorIndex, number});
        break
      }
    }
    if (data[i].slice(0,2) === '19' || data[i].slice(0,2) === '20') {
      if (data[i].length < 9) {
        let re = data[i];
        if (data[i].length === 8) re = data[i].slice(0,4) + '-' + data[i].slice(4,6) + '-' + data[i].slice(6,8);   
        else if (data[i].length === 6) re = data[i].slice(0,4) + '-' + data[i].slice(4,6);
        let results = fhirStuff.match(re);
        if (results && results.length) {
          matches.cda.push({string: data[i], color: colorIndex});
          matches.fhir.push({string: results[0], color: colorIndex});
        }
      }
      else {
        let iso = dateTranslate(data[i]);
        if (iso) {
          let results = fhirStuff.match(iso)
          if (results && results.length) {
            matches.cda.push({string: data[i], color: colorIndex});
            matches.fhir.push({string: results[0], color: colorIndex});
          }
        }  
      }
    }

    // Always run the translations
    if (fhirEquivalents[data[i]]) {
      let pieces = fhirEquivalents[data[i]].split('|')
      for (let j = 0; j < pieces.length; j++) {
        const results = fhirStuff.match(stringToRegExp(pieces[j]));
        if (results) {
          matches.cda.push({string: data[i], color: colorIndex});
          matches.fhir.push({string: results[0], color: colorIndex, number});
        }
      }
    }


    if (matches.cda.length !== initialLength) colorIndex++;  
    if (colorIndex === 43) colorIndex = 10;
  }
  console.log(matches);
  return matches;
}

function stringToRegExp(string, preRegEx, postRegEx) {
  let mainSearch = string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  let flags = 'im';
  if (preRegEx || postRegEx) {
    mainSearch = `(${mainSearch})`;
    if (preRegEx) mainSearch = `(?:${preRegEx})${mainSearch}`;
    if (postRegEx) mainSearch = `${mainSearch}(?:${postRegEx})`;
  } else {
    flags += 'g';
  }
  return new RegExp(mainSearch, flags);
}

const mark = function (cda, fhir, matches) {
  let cdaOutput = escape(cda);
  let fhirOutput = escape(fhir);
  matches.cda.sort((a, b) => b.string.length - a.string.length);
  for (let i = 0; i < matches.cda.length; i++) {
    let toWrap = matches.cda[i].string
    if (toWrap.length < 4) {
      toWrap = `&quot;${toWrap}&quot;`;
    }
    let match = stringToRegExp(toWrap);
    // Doesn't match with strings? See if it's between elements, like <value>12</value>
    if (!cdaOutput.match(match)) {
      toWrap = `&gt;${matches.cda[i].string}&lt;`;
      match = stringToRegExp(toWrap);
    }
    // Doesn't match with either of those? Try space-separated
    if (!cdaOutput.match(match)) {
      toWrap = ` ${matches.cda[i].string} `;
      match = stringToRegExp(toWrap);
    }
    cdaOutput = cdaOutput.replace(match, (matched) => `<mark class="color${matches.cda[i].color}" >${matched}</mark>`);

    // Translation
    if (cdaSynonyms[matches.cda[i].string]) {
      for (const altName of cdaSynonyms[matches.cda[i].string]) {
        const altMatch = new RegExp(altName, 'gi');
        cdaOutput = cdaOutput.replace(altMatch, `<mark class="color${matches.cda[i].color}" >${altName}</mark>`)
      }
    }
  }
  matches.fhir.sort((a, b) => b.string.length - a.string.length);
  for (let i = 0; i < matches.fhir.length; i++) {
    let toWrap = matches.fhir[i].string;
    if (toWrap.length < 4) {
      // First try finding instances of number as a number
      if (matches.fhir[i].number) {
        fhirOutput = fhirOutput.replace(stringToRegExp(toWrap, null, ',|\\n'), (matched) => `<mark class="color${matches.fhir[i].color}" >${matched}</mark>`);
      }
      // But always look for quoted versions, too, and replace them
      toWrap = `&quot;${toWrap}&quot;`;
    }
    let match = stringToRegExp(toWrap);
    fhirOutput = fhirOutput.replace(match, `<mark class="color${matches.fhir[i].color}" >${toWrap}</mark>`)
  }
  // console.log(cdaOutput);
  // console.log(fhirOutput);
  // console.log(template);

  // Simple XML highlighting
  cdaOutput = cdaOutput
    .replace(/(&lt;\/?)([a-zA-Z0-9:._-]+)(\s|&gt;|$)/g, '$1<span class="field">$2</span>$3')
    .replace(/(&lt;!--[\s\S\n]*?--&gt;)/g, '<span class="comment">$1</span>')
    .replace(/(\s)([a-zA-Z0-9:._-]+=)((?:<mark .*>)?&quot;.*?&quot;(?:<\/mark>)?)/g, '$1<span class="attrib">$2</span>$3')
    .replace(/(&quot;.*?&quot;)/g, '<span class="value">$1</span>');
  
  // Simple JSON highlighting
  fhirOutput = fhirOutput
    .replace(/(\n\s+&quot;)([a-zA-Z0-9:._-]+)(&quot;)/g, '$1<span class="field">$2</span>$3')
    .replace(/(\n\s+)(\/\/.+)/g, '$1<span class="comment">$2</span>')
    .replace(/(\n\s+)(\/\*[\s\S\n]*?\*\/\s*\n?)/mg, '$1<span class="comment">$2</span>')
    .replace(/(:\s+&quot;)(.*?)(&quot;)/g, '$1<span class="value">$2</span>$3')
    .replace(/(:\s+)(\d+,)/g, '$1<span class="value">$2</span>');


  let newHtml = template.replace('<div id="cda" class="border codeArea">', `<div id="cda" class="border codeArea">${cdaOutput}`);
  newHtml = newHtml.replace('<div id="fhir" class="border codeArea">', `<div id="fhir" class="border codeArea">${fhirOutput}`);
  return newHtml;
}

// My regex extraction alternative that doesn't seem to be working...
const extractStringsFromXML = function(xmlString) {
  const doubleQuoteStrings = [];
  const betweenTagsStrings = [];

  // Extract strings in double quotes
  const doubleQuoteRegex = /"([^"]*)"/g;
  let match;
  while ((match = doubleQuoteRegex.exec(xmlString)) !== null) {
    doubleQuoteStrings.push(match[1]);
  }

  // Extract strings between > and <
  const betweenTagsRegex = />([^<]*)</gm;
  while ((match = betweenTagsRegex.exec(xmlString)) !== null) {
    if (match[1].trim()) {
      betweenTagsStrings.push(match[1].trim());
    }
  }

  // Extract strings from comments containing a colon
  const commentRegex = /<!--[^:>]*:\s*([^>]*)>/g;
  while ((match = commentRegex.exec(xmlString)) !== null) {
    if (match[1].trim()) {
      betweenTagsStrings.push(match[1].trim());
    }
  }

  return [...new Set(doubleQuoteStrings), ...new Set(betweenTagsStrings)];
};

// Main function 
const run = async function (cdaStuff, fhirStuff) {
  const cda = await new xml2js.Parser().parseStringPromise(cdaStuff);
  let fhir = null;
  if (typeof(fhirStuff) === 'string') {
    try {
      fhir = parse(fhirStuff); // JSON.parse(fhirStuff);
    }
    catch (e) {
      console.log(e);
    }  
  }
  else {
    fhir = fhirStuff;
    fhirStuff = stringify(fhir); // JSON.stringify(fhir);
  }
  if (!fhir || (!fhir.resource && !fhir.resourceType)) {
    // console.log(fhir);
    return 'ERROR: Not a FHIR resource';
  }
  let data = [];

  addFields(cda, data);
  // Remove duplicates
  data = [...new Set(data.map(item => item.toLowerCase()).filter(item => !ignoredWords.includes(item)))];

  // Process XML comments of resolves to
  let r = new RegExp(/<!--[\s\S\n]*?-->/gm);
  let comments = cdaStuff.match(r);
  
  if (comments && comments.length) {
    for (let i = 0; i < comments.length; i++) {
      let pieces = comments[i].split(': ')
      if (pieces[1]) {
        let output = pieces[1].replace(' -->', '');
        data.push(output);
      }  
    }  
  }
  
  console.log(data);
  
  let matches = match(fhirStuff, data)
  // console.log(matches);

  let html = mark(cdaStuff, fhirStuff, matches)
  // console.log(JSON.stringify(cda));

  // make a record for debugging time being
  let identifier = uuidv4();
  if(!fs.existsSync('debug')) {
    fs.mkdirSync('debug');
    setTimeout(function() {
      fs.writeFileSync(`./debug/${identifier}.xml`, cdaStuff);
      //fs.writeFileSync(`./debug/${identifier}.html`, html);
      fs.writeFileSync(`./debug/${identifier}.json`, fhirStuff);    
      return html;
    }, 1000);
  }
  else {
    fs.writeFileSync(`./debug/${identifier}.xml`, cdaStuff);
    // fs.writeFileSync(`./debug/${identifier}.html`, html);
    fs.writeFileSync(`./debug/${identifier}.json`, fhirStuff);    
    return html;
  }  
}

module.exports = run;

//run(xmlFile, jsonFile)

/* 

let iso = '1980-05-01T04:00:00.000Z'
let start = iso.slice(0,11);
let end = iso.slice(13);
let re = new RegExp(start + '.*' + end, 'gm');
let z = '1980-05-01T00:00:00.000Z'
z.match(re)

*/
