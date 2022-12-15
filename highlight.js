const parser = require('xml2json');
var escape = require('escape-html');
const fs = require('fs');
const moment = require('moment');
const { init } = require('express/lib/application');
const { v4: uuidv4 } = require('uuid');

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

// Translation of elements
const translation = {
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
  '2.16.840.1.113883.5.83': 'https://hl7.org/fhir/v3/ObservationInterpretation|http://hl7.org/fhir/v3/ObservationInterpretation'
};

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

// LOWER LEVEL CDA FUNTIONS

const addr = function (thing, data) {
  if (thing[0].use) data.push(thing[0].use);
  if (thing[0].streetAddressLine && thing[0].streetAddressLine.length) {
    for (let i = 0; i < thing[0].streetAddressLine.length; i++) {
      if (thing[0].streetAddressLine[i][0]) data.push(thing[0].streetAddressLine[i][0]);
    }
  }
  if (thing[0].city && thing[0].city[0]) data.push(thing[0].city[0]);
  if (thing[0].state && thing[0].state[0]) data.push(thing[0].state[0]);
  if (thing[0].postalCode && thing[0].postalCode[0]) data.push(thing[0].postalCode[0]);
  if (thing[0].country && thing[0].country[0]) data.push(thing[0].country[0]);  
}

const code = function (thing, data) {
  for (let i = 0; i < thing.length; i++) {
    if (thing && thing[i]) {
      if (thing[i].code) data.push(thing[i].code);
      if (thing[i].codeSystem) data.push(thing[i].codeSystem); 
      if (thing[i].displayName) data.push(thing[i].displayName); 
      if (thing[i].originalText) originalText(thing[i].originalText, data);  
      if (thing[i].translation) code(thing[i].translation, data);
    }  
  }
};

const consumable = function (thing, data) {
  if (thing[0] && thing[0].manufacturedProduct && thing[0].manufacturedProduct[0] && thing[0].manufacturedProduct[0].manufacturedMaterial && thing[0].manufacturedProduct[0].manufacturedMaterial[0]) {
    // console.log('In consumable');
    console.log(thing[0].manufacturedProduct[0].manufacturedMaterial[0])
    if (thing[0].manufacturedProduct[0].manufacturedMaterial[0].code) {
      code(thing[0].manufacturedProduct[0].manufacturedMaterial[0].code, data);
    }
    if (thing[0].manufacturedProduct[0].manufacturedMaterial[0].lotNumberText && thing[0].manufacturedProduct[0].manufacturedMaterial[0].lotNumberText[0]) {
      // console.log('In lotNumber');
      data.push(thing[0].manufacturedProduct[0].manufacturedMaterial[0].lotNumberText[0]);
    }
  }
}

const effectiveTime = function (thing, data) {
  for (let i = 0; i < thing.length; i++) {
    if (thing[i].value) {
      data.push(thing[i].value);
      if (thing[i].unit) {
        data.push(thing[i].unit);
      }
    }
    else if (thing[i].period && thing[i].period[0]) {
      if (thing[i].period[0].value){
        data.push(thing[i].period[0].value);
      }
      if (thing[i].period[0].unit) {
        data.push(thing[i].period[0].unit);
      }
    }
    else {
      if (thing[i].low && thing[i].low[0] && thing[i].low[0].value) {
        data.push(thing[i].low[0].value);
        if(thing[i].low[0].unit) data.push(thing[i].high[0].unit);
      }
      if (thing[i].high && thing[i].high[0] && thing[i].high[0].value) {
        data.push(thing[i].high[0].value);
        if(thing[i].high[0].unit) data.push(thing[i].high[0].unit);
      }
    }
  }
}

const id = function (thing, data) {
  for (let i = 0; i < thing.length; i++) {
   if (thing[i].root) data.push(thing[i].root);
   if (thing[i].extension) data.push(thing[i].extension); 
  }
}

const originalText = function (thing, data) {
  if (thing[0].reference) {
    if (thing[0].reference[0].value) data.push(thing[0].reference[0].value);
  }
  else if (typeof(thing[0]) === 'string' || thing[0] instanceof String) data.push(...thing);
}

const name = function (thing, data) {
  if (thing[0].given || thing[0].family) {
    if (thing[0].given && thing[0].given.length) {
      for (let i = 0; i < thing[0].given.length; i++) {
        if (thing[0].given[i]) data.push(thing[0].given[i]);
      }
    }
    if (thing[0].family && thing[0].family[0]) data.push(thing[0].family[0]);
  }
  else if (typeof(thing[0]) === 'string' || thing[0] instanceof String) {
    data.push(thing[0]);
  }
}

const participant = function (thing, data) {
  if (thing[0].participantRole && thing[0].participantRole[0] && thing[0].participantRole[0].playingEntity && thing[0].participantRole[0].playingEntity[0] && thing[0].participantRole[0].playingEntity[0].code) {
    code(thing[0].participantRole[0].playingEntity[0].code, data);
  }
}

const telecom = function (thing, data) {
  if (thing[0].use) data.push(thing[0].use);
  if (thing[0].value) data.push(thing[0].value);
}

const value = function (thing, data) {
  for (let i = 0; i < thing.length; i++) {
    if (thing[i].value) data.push(thing[i].value);
    if (thing[i].unit) data.push(thing[i].unit);
    if (thing[i].code) data.push(thing[i].code);
    if (thing[i].codeSystem) data.push(thing[i].codeSystem); 
    if (thing[i].displayName) data.push(thing[i].displayName); 
    if (thing[i].originalText) originalText(thing[i].originalText, data);  
    if (thing[i].translation) code(thing[i].translation, data);
  }
}

// HIGHER LEVEL CDA FUNCTIONs

const act = function (thing, data) {
  if (thing[0].id) {
    id(thing[0].id, data);
  }
  if (thing[0].code) {
    code(thing[0].code, data);
  }
  if (thing[0].text) {
    originalText(thing[0].text, data);
  }
  if (thing[0].statusCode) {
    code(thing[0].statusCode, data);
  }
  if (thing[0].effectiveTime) {
    effectiveTime(thing[0].effectiveTime, data);
  }
  if (thing[0].entryRelationship) {
    entryRelationship(thing[0].entryRelationship, data)
  }
  if (thing[0].author){
    author(thing[0].author, data);
  }
  if (thing[0].performer){
    performer(thing[0].performer, data);
  }
}

const author = function (thing, data) {
  if (thing & thing[0]) {
    if (thing[0].functionCode) {
      code(thing[0].functionCode, data);
    }
    if (thing[0].code) {
      code(thing[0].code, data);
    }
    if (thing[0].time) {
      effectiveTime(thing[0].time, data);
    }
    if (thing[0].assignedAuthor && thing[0].assignedAuthor[0]) {
      if (thing[0].assignedAuthor[0].id) {
        id(thing[0].assignedAuthor[0].id, data);
      }
      if (thing[0].assignedAuthor[0].code) {
        code(thing[0].assignedAuthor[0].code, data);
      }
      if (thing[0].assignedAuthor[0].addr) {
        addr(thing[0].assignedAuthor[0].addr, data);
      }
      if (thing[0].assignedAuthor[0].telecom) {
        telecom(thing[0].assignedAuthor[0].telecom, data);
      }
      if (thing[0].assignedAuthor[0].assignedPerson && thing[0].assignedAuthor[0].assignedPerson[0]) {
        if (thing[0].assignedAuthor[0].assignedPerson[0].id) {
          id(thing[0].assignedAuthor[0].assignedPerson[0].id, data)
        }
        if (thing[0].assignedAuthor[0].assignedPerson[0].name) {
          name(thing[0].assignedAuthor[0].assignedPerson[0].name, data)
        }
        if (thing[0].assignedAuthor[0].assignedPerson[0].addr) {
          addr(thing[0].assignedAuthor[0].assignedPerson[0].addr, data)
        }
        if (thing[0].assignedAuthor[0].assignedPerson[0].telecom) {
          telecom(thing[0].assignedAuthor[0].assignedPerson[0].telecom, data)
        }
      } 
    }
  }
}

const encounter = function (thing, data) {
  if (thing[0].id) {
    id(thing[0].id, data);
  }
  if (thing[0].code) {
    code(thing[0].code, data);
  }
  if (thing[0].text) {
    originalText(thing[0].text, data);
  }
  if (thing[0].statusCode) {
    code(thing[0].statusCode, data);
  }
  if (thing[0].effectiveTime) {
    effectiveTime(thing[0].effectiveTime, data);
  }
  if (thing[0].entryRelationship) {
    entryRelationship(thing[0].entryRelationship, data)
  }
  if (thing[0].author){
    author(thing[0].author, data);
  }
  if (thing[0].performer){
    performer(thing[0].performer, data);
  }
}

const entryRelationship = function (thing, data) {
  for (let i = 0; i < thing.length; i++) {
    if (thing[i].act) {
      act(thing[i].act, data);
    }
    else if (thing[i].encounter) {
      encounter(thing[i].encounter, data);
    } 
    else if (thing[i].observation) {
      observation(thing[i].observation, data);
    } 
    else if (thing[i].organizer) {
      organizer(thing[i].organizer, data);
    } 
    else if (thing[i].procedure) {
      procedure(thing[i].procedure, data);
    } 
    else if (thing[i].substanceAdministration) {
      substanceAdministration(thing[i].substanceAdministration, data);
    } 
    else if (thing[i].supply) {
      supply(thing[i].supply, data);
    } 
  } 
}

const observation = function (thing, data) {
  if (thing[0].id) {
    id(thing[0].id, data);
  }
  if (thing[0].code) {
    code(thing[0].code, data);
  }
  if (thing[0].text) {
    originalText(thing[0].text, data);
  }
  if (thing[0].statusCode) {
    code(thing[0].statusCode, data);
  }
  if (thing[0].effectiveTime) {
    effectiveTime(thing[0].effectiveTime, data);
  }
  if (thing[0].value) {
    value(thing[0].value, data)
  }
  if (thing[0].interpretationCode) {
    code(thing[0].interpretationCode, data)
  }
  if (thing[0].methodCode) {
    code(thing[0].methodCode, data)
  }
  if (thing[0].targetSiteCode) {
    code(thing[0].targetSiteCode, data)
  }
  if (thing[0].referenceRange) {
    for (let j = 0; j < thing[0].referenceRange.length; j++) {
      if (thing[0].referenceRange[j].text) {

      }
      if (thing[0].referenceRange[j].value) {
        value(thing[0].referenceRange[j].value, data)
      }
    }
  }
  if (thing[0].participant){
    participant(thing[0].participant, data)
  }

  if (thing[0].entryRelationship) {
    entryRelationship(thing[0].entryRelationship, data)
  }
  if (thing[0].author){
    author(thing[0].author, data);
  }
  if (thing[0].performer){
    performer(thing[0].performer, data);
  }
}

const organizer = function (thing, data) {
  if (thing[0].id) {
    id(thing[0].id, data);
  }
  if (thing[0].code) {
    code(thing[0].code, data);
  }
  if (thing[0].effectiveTime) {
    effectiveTime(thing[0].effectiveTime, data);
  }
  if (thing[0].component) {
    for (let i = 0; i < thing[0].component.length; i++) {
      if (thing[0].component[i].observation) {
        observation(thing[0].component[i].observation, data);
      } 
    }
  }
  if (thing[0].author){
    author(thing[0].author, data);
  }
  if (thing[0].performer){
    performer(thing[0].performer, data);
  }
}

const performer = function (thing, data) {
  if (thing && thing[0] && thing[0].assignedEntity) {
    thing = thing[0].assignedEntity;
    if (thing[0].id) {
      id(thing[0].id, data);
    }
    if (thing[0].functionCode) {
      code(thing[0].functionCode, data);
    }
    if (thing[0].code) {
      code(thing[0].code, data);
    }
    if (thing[0].time) {
      effectiveTime(thing[0].time, data);
    }
    if (thing[0].assignedPerson && thing[0].assignedPerson[0]) {
      if (thing[0].assignedPerson[0].id) {
        id(thing[0].assignedPerson[0].id, data)
      }
      if (thing[0].assignedPerson[0].name) {
        name(thing[0].assignedPerson[0].name, data)
      }
      if (thing[0].assignedPerson[0].addr) {
        addr(thing[0].assignedPerson[0].addr, data)
      }
      if (thing[0].assignedPerson[0].telecom) {
        telecom(thing[0].assignedPerson[0].telecom, data)
      }
    }
    if (thing[0].representedOrganization && thing[0].representedOrganization[0]) {
      if (thing[0].representedOrganization[0].id) {
        id(thing[0].representedOrganization[0].id, data)
      }
      if (thing[0].representedOrganization[0].name) {
        name(thing[0].representedOrganization[0].name, data)
      }
      if (thing[0].representedOrganization[0].addr) {
        addr(thing[0].representedOrganization[0].addr, data)
      }
      if (thing[0].representedOrganization[0].telecom) {
        telecom(thing[0].representedOrganization[0].telecom, data)
      }
    }    
  }
}

const procedure = function (thing, data) {
  if (thing[0].id) {
    id(thing[0].id, data);
  }
  if (thing[0].code) {
    code(thing[0].code, data);
  }
  if (thing[0].text) {
    originalText(thing[0].text, data);
  }
  if (thing[0].statusCode) {
    code(thing[0].statusCode, data);
  }
  if (thing[0].effectiveTime) {
    effectiveTime(thing[0].effectiveTime, data);
  }
  if (thing[0].value) {
    value(thing[0].value, data)
  }
  if (thing[0].approachSiteCode) {
    code(thing[0].approachSiteCode, data)
  }
  if (thing[0].methodCode) {
    code(thing[0].methodCode, data)
  }
  if (thing[0].targetSiteCode) {
    code(thing[0].targetSiteCode, data)
  }
  if (thing[0].participant){
    participant(thing[0].participant, data)
  }

  if (thing[0].entryRelationship) {
    entryRelationship(thing[0].entryRelationship, data)
  }
  if (thing[0].author){
    author(thing[0].author, data);
  }
  if (thing[0].performer){
    performer(thing[0].performer, data);
  }
}

const substanceAdministration = function (thing, data) {
  if (thing[0].id) {
    id(thing[0].id, data);
  }
  if (thing[0].code) {
    code(thing[0].code, data);
  }
  if (thing[0].text) {
    originalText(thing[0].text, data);
  }
  if (thing[0].statusCode) {
    code(thing[0].statusCode, data);
  }
  if (thing[0].effectiveTime) {
    effectiveTime(thing[0].effectiveTime, data);
  }
  if (thing[0].routeCode) {
    code(thing[0].value, data)
  }
  if (thing[0].approachSiteCode) {
    code(thing[0].approachSiteCode, data)
  }
  if (thing[0].doseQuantity) {
    value(thing[0].doseQuantity, data)
  }
  if (thing[0].rateQuantity) {
    value(thing[0].rateQuantity, data)
  }
  if (thing[0].maxDoseQuantity) {
    value(thing[0].maxDoseQuantity, data)
  }
  if (thing[0].methodCode) {
    code(thing[0].methodCode, data)
  }
  if (thing[0].targetSiteCode) {
    code(thing[0].targetSiteCode, data)
  }
  if (thing[0].participant){
    participant(thing[0].participant, data)
  }
  if (thing[0].consumable){
    consumable(thing[0].consumable, data)
  }
  if (thing[0].entryRelationship) {
    entryRelationship(thing[0].entryRelationship, data)
  }
  if (thing[0].author){
    author(thing[0].author, data);
  }
  if (thing[0].performer){
    performer(thing[0].performer, data);
  }
}

const supply = function (thing, data) {
  if (thing[0].id) {
    id(thing[0].id, data);
  }
  if (thing[0].code) {
    code(thing[0].code, data);
  }
  if (thing[0].text) {
    originalText(thing[0].text, data);
  }
  if (thing[0].statusCode) {
    code(thing[0].statusCode, data);
  }
  if (thing[0].effectiveTime) {
    effectiveTime(thing[0].effectiveTime, data);
  }
  if (thing[0].quantity) {
    value(thing[0].quantity, data);
  }
  if (thing[0].entryRelationship) {
    entryRelationship(thing[0].entryRelationship, data)
  }
  if (thing[0].author){
    author(thing[0].author, data);
  }
  if (thing[0].performer){
    performer(thing[0].performer, data);
  }
}

// Operations for Mapping
const dateTranslate = function (thing) {
  let output = null
  try {
   thing = thing.replace('.000', '');
   let newTime = moment(thing, 'YYYYMMDDHHmmssZ');
   output = newTime.toISOString();
  }
  catch (e) {
    console.log(e);
  }
  finally {
    return output;
  }
}

const match = function (fhirStuff, data) {
  let matches = {
    cda: [],
    fhir: []
  };
  let prior = {};
  let colorIndex = 10;
  fhirStuff = fhirStuff.replace(/urn:oid:/gm, '');
  for (let i = 0; i < data.length; i++) {
    if (!prior[data[i]]) {
      let initialLength = matches.cda.length;
      if (fhirStuff.includes( '"' + data[i] + '"', 'gm') || fhirStuff.includes("'" + data[i] + "'", 'gm') ) {
        matches.cda.push({string: data[i], color: colorIndex});
        matches.fhir.push({string: data[i], color: colorIndex});
        prior[data[i]] = true;
      }
      else if (fhirStuff.includes(data[i] + '"', 'gm') || fhirStuff.includes(data[i] + "'", 'gm') ) {
        matches.cda.push({string: data[i], color: colorIndex});
        matches.fhir.push({string: data[i], color: colorIndex});
        prior[data[i]] = true;
      }
      else if (fhirStuff.includes(' ' + data[i] + ' ', 'gm')) {
        matches.cda.push({string: data[i], color: colorIndex});
        matches.fhir.push({string: data[i], color: colorIndex});
        prior[data[i]] = true;
      }
      else if (fhirStuff.includes(' ' + data[i] + ',', 'gm')) {
        matches.cda.push({string: data[i], color: colorIndex});
        matches.fhir.push({string: data[i], color: colorIndex, number: true});
        prior[data[i]] = true;
      }
      else if (translation[data[i]]) {
        let pieces = translation[data[i]].split('|')
        for (let j = 0; j < pieces.length; j++) {
          if (fhirStuff.includes(pieces[j])) {
            matches.cda.push({string: data[i], color: colorIndex});
            matches.fhir.push({string: pieces[j], color: colorIndex});
            prior[data[i]] = true;    
          }
        }
      }
      else if (data[i].slice(0,2) === '19' || data[i].slice(0,2) === '20') {
        if (data[i].length < 9) {
          let re = data[i];
          if (data[i].length === 8) re = data[i].slice(0,4) + '-' + data[i].slice(4,6) + '-' + data[i].slice(6,8);   
          else if (data[i].length === 6) re = data[i].slice(0,4) + '-' + data[i].slice(4,6);
          let results = fhirStuff.match(re);
          if (results && results.length) {
            matches.cda.push({string: data[i], color: colorIndex});
            matches.fhir.push({string: results[0], color: colorIndex});
            prior[data[i]] = true; 
          }
        }
        else {
          let iso = dateTranslate(data[i]);
          if (iso) {
            let start = iso.slice(0,11);
            let end = iso.slice(13,16);
            let re = new RegExp(start + '..' + end, 'gm');
            let results = fhirStuff.match(re)
            if (results && results.length) {
              matches.cda.push({string: data[i], color: colorIndex});
              matches.fhir.push({string: results[0], color: colorIndex});
              prior[data[i]] = true; 
            }
          }  
        }
      }
      if (matches.cda.length !== initialLength) colorIndex++;  
    }
    if (colorIndex === 43) colorIndex = 10;
  }
  console.log(matches);
  return matches;
}

const mark = function (cda, fhir, matches) {
  let cdaOutput = escape(cda);
  let fhirOutput = escape(fhir);
  for (let i = 0; i < matches.cda.length; i++) {
    let stringreplace = matches.cda[i].string;
    if (stringreplace.length < 4) {
      stringreplace = `&quot;${stringreplace}&quot;`;
    }
    let match = new RegExp(stringreplace, 'g');
    if (!cdaOutput.match(match)) {
      stringreplace = matches.cda[i].string;
      stringreplace = `&gt;${stringreplace}&lt;`;
      match = new RegExp(stringreplace, 'g');
    }
    // console.log(match);
    // console.log(cdaOutput.match(match));
    cdaOutput = cdaOutput.replace(match, `<mark class="color${matches.cda[i].color}" >${stringreplace}</mark>`)
  }
  for (let i = 0; i < matches.cda.length; i++) {
    let stringreplace2 = matches.fhir[i].string;
    if (stringreplace2.length < 4 && !matches.fhir[i].number) {
      stringreplace2 = `&quot;${stringreplace2}&quot;`;
    }
    // how to handle integers, will highlight comma
    else if (stringreplace2.length < 4) {
      stringreplace2 = `${stringreplace2},`;
    }
    let match = new RegExp(stringreplace2, 'g');
    fhirOutput = fhirOutput.replace(match, `<mark class="color${matches.fhir[i].color}" >${stringreplace2}</mark>`)
  }
  // console.log(cdaOutput);
  // console.log(fhirOutput);
  // console.log(template);
  let newHtml = template.replace('<div id="cda" class="border codeArea">', `<div id="cda" class="border codeArea">${cdaOutput}`);
  newHtml = newHtml.replace('<div id="fhir" class="border codeArea">', `<div id="fhir" class="border codeArea">${fhirOutput}`);
  return newHtml;
}

// Main function 

const run = function (cdaStuff, fhirStuff) {
  let cda = parser.toJson(cdaStuff, options);
  let fhir = null;
  if (!cda.entry && !cda.recordTarget) {
    return 'ERROR: Not a CDA entry or recordTarget';
  }
  if (typeof(fhirStuff) === 'string') {
    try {
      fhir = JSON.parse(fhirStuff);
    }
    catch (e) {
      console.log(e);
    }  
  }
  else {
    fhir = fhirStuff;
    fhirStuff = JSON.stringify(fhir);
  }
  if (!fhir || !fhir.resource) {
    // console.log(fhir);
    return 'ERROR: Not a FHIR resource';
  }
  let data = [];
  
  if (cda.recordTarget && cda.recordTarget[0] && cda.recordTarget[0].patientRole && cda.recordTarget[0].patientRole[0]) {
    if (cda.recordTarget[0].patientRole[0].id) {
      id(cda.recordTarget[0].patientRole[0].id, data);
    }
    if (cda.recordTarget[0].patientRole[0].addr) {
      addr(cda.recordTarget[0].patientRole[0].addr, data);
    }
    if (cda.recordTarget[0].patientRole[0].telecom){
      telecom(cda.recordTarget[0].patientRole[0].telecom, data);
    }
    if (cda.recordTarget[0].patientRole[0].patient && cda.recordTarget[0].patientRole[0].patient[0]) {
      if (cda.recordTarget[0].patientRole[0].patient[0].name) {
        name(cda.recordTarget[0].patientRole[0].patient[0].name, data);
      }
      if (cda.recordTarget[0].patientRole[0].patient[0].administrativeGenderCode) {
        code(cda.recordTarget[0].patientRole[0].patient[0].administrativeGenderCode, data);
      }
      if (cda.recordTarget[0].patientRole[0].patient[0].birthTime) {
        effectiveTime(cda.recordTarget[0].patientRole[0].patient[0].birthTime, data);
      }
      if (cda.recordTarget[0].patientRole[0].patient[0].raceCode) {
        code(cda.recordTarget[0].patientRole[0].patient[0].raceCode, data);
      }
      if (cda.recordTarget[0].patientRole[0].patient[0].ethnicGroupCode) {
        code(cda.recordTarget[0].patientRole[0].patient[0].ethnicGroupCode, data);
      }
      if (cda.recordTarget[0].patientRole[0].patient[0].languageCommunication && cda.recordTarget[0].patientRole[0].patient[0].languageCommunication[0]) {
        if(cda.recordTarget[0].patientRole[0].patient[0].languageCommunication[0].languageCode) {
          code(cda.recordTarget[0].patientRole[0].patient[0].languageCommunication[0].languageCode, data);
        }
        if(cda.recordTarget[0].patientRole[0].patient[0].languageCommunication[0].preferenceInd) {
          value(cda.recordTarget[0].patientRole[0].patient[0].languageCommunication[0].preferenceInd, data);
        }
      }
    }
  }
  else {
    for (let i = 0; i < cda.entry.length; i++) {
      if (cda.entry[i].act) {
        act(cda.entry[i].act, data);
      }
      else if (cda.entry[i].observation)  {
        observation(cda.entry[i].observation, data);
      }
      else if (cda.entry[i].substanceAdministration) {
        substanceAdministration(cda.entry[i].substanceAdministration, data);
      }
      else if (cda.entry[i].procedure) {
        procedure(cda.entry[i].procedure, data);
      }
      else if (cda.entry[i].supply) {
        supply(cda.entry[i].supply, data);
      }
      else if (cda.entry[i].organizer) {
        organizer(cda.entry[i].organizer, data);
      }
      else if (cda.entry[i].encounter) {
        encounter(cda.entry[i].encounter, data);
      }
      else {
        console.log(`skipping ${cda} from main entry`);
      }
    }
  }

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
