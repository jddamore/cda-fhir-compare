# CDA-FHIR Visualizer Tool

A web tool to compare CDA entries to FHIR resources. This tool was developed by More Informatics, Inc as part of a cross-group project managed by Health Level 7 (HL7) International. 

The tool is currently hosted here to try out: http://ccda.online/
(Please note that you should only submit fictional test samples, not appropriate for PHI submission)

<b>PLEASE NOTE THAT THE TOOL IS IN ALPHA/BETA AND MAY CHANGE SIGNIFICNATLY</b>

The tool uses a set of colors to highlight data within a clinical document (CDA or C-CDA) and then shows where that information may appear in a FHIR resource. Note that it's <b><u>NOT</b></u> an intelligent mapping tool. It does not know if any of these mappings are correct. It only runs if you provide both the CDA and the corresponding FHIR data. It works via identifying data in CDA document entry elements and then doing very simple regular expression matching in the provided FHIR resource. 

## How to run application

Assuming you have node and npm, all you'll need to do is to download packages and run app

`npm i`
`node app` 

If you prefer to use `npm start` that will start using nodemon (may require separate package install) which will reset on file change or application crash.

## More about HL7 project for C-CDA to FHIR mapping

For information on the group working on C-CDA to FHIR mapping, see https://confluence.hl7.org/display/CGP/C-CDA+to+and+from+US+Core+Mapping?src=contextnavpagetreemode

HL7, CDA and FHIR are trademarks of HL7 International. Note that this application is not approved for any use, but it may be helpful and is open-source using the MIT License. 



