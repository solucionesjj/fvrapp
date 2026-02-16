// Archivo de prueba para verificar el procesamiento de licencias de Florida
// Este archivo simula datos reales de códigos PDF417 de licencias de Florida

// Ejemplo de datos de una licencia de Florida (formato AAMVA)
const floridaLicenseData = `@

ANSI 636014080002DL00410288ZF03190008DLDAQD12345678901234
DCSSMITH
DDEN
DACJOHN
DDFN
DADMIDDLE
DDGN
DCUUSA
DCAD
DCBNONE
DCDNONE
DBD08152018
DBB08151990
DBA08152026
DBC1
DAU068 IN
DAYBRO
DAG123 MAIN ST
DAIORLANDO
DAJFL
DAK32801
DCF12345678901234567890
DCGUSA
DCK12345678901234567890123456789012345678
DDK1
DDAM
DDB08152018
DDD1
ZFZFAZFB
ZFC
ZFD
ZFE
ZFF
ZFG
ZFH
ZFI
ZFJ
ZFK
ZFL
ZFM
ZFN
ZFO
ZFP
ZFQ
ZFR
ZFS
ZFT
ZFU
ZFV
ZFW
ZFX
ZFY
ZFZ`;

// Función para probar el parseado
function testFloridaLicenseParsing() {
    console.log('=== PRUEBA DE PROCESAMIENTO DE LICENCIA DE FLORIDA ===');
    console.log('Datos originales:');
    console.log(floridaLicenseData);
    console.log('\n=== ANÁLISIS DE CAMPOS ===');
    
    // Simular el procesamiento que hace parseAAMVAText
    const cleanedText = floridaLicenseData.replace(/[@\x1e\r]/g, '').trim();
    const lines = cleanedText.split('\n').filter(Boolean);
    
    console.log('Líneas procesadas:');
    lines.forEach((line, index) => {
        console.log(`${index + 1}: ${line}`);
    });
    
    // Mapeo de campos específicos de Florida
    const fieldMap = {
        ANS: 'licenseCode',
        DAC: 'firstName',
        DAD: 'secondName', 
        DAG: 'address',
        DAI: 'city',
        DAJ: 'state',
        DAK: 'postalCode',
        DAU: 'height',
        DBA: 'licenseExpirationDate',
        DBB: 'dateOfBirth',
        DBC: 'Sex',
        DBD: 'licenseIssueDate',
        DCA: 'licenseTypeOfVehicle',
        DCB: 'licenseRestrictions',
        DCD: 'licenseOtherVehicles',
        DCF: 'licenseId',
        DCG: 'licenseIssueCountry',
        DCK: 'licenseId2',
        DCS: 'surnames',
        DDA: 'licenseCompliance',
        DDB: 'licenseFormatVersion',
        DDD: 'licenseType',
        DDE: 'surnameAlias',
        DDF: 'firstNameAlias',
        DDG: 'secondNameAlias',
        ZFC: 'licenseTypeOfDriver',
        ZFJ: 'statalId'
    };
    
    const parsed = {};
    let currentKey = null;
    
    for (let line of lines) {
        const match = line.match(/^([A-Z]{3})(.*)/); 
        if (match) {
            const [_, code, value] = match;
            currentKey = code;
            if (fieldMap[code]) {
                if (code === 'ANS') {
                    // Extraer DAQ value para licenseCode
                    const daqMatch = value.match(/DAQ(.{13})/);
                    parsed[fieldMap[code]] = daqMatch ? daqMatch[1] : '';
                } else {
                    parsed[fieldMap[code]] = value.trim();
                }
                console.log(`Campo encontrado: ${code} -> ${fieldMap[code]} = ${parsed[fieldMap[code]]}`);
            } else {
                console.log(`Campo no mapeado: ${code} = ${value}`);
            }
        } else if (currentKey && fieldMap[currentKey]) {
            parsed[fieldMap[currentKey]] += ' ' + line.trim();
        }
    }
    
    console.log('\n=== RESULTADO FINAL ===');
    console.log(JSON.stringify(parsed, null, 2));
    
    // Verificar campos críticos
    console.log('\n=== VERIFICACIÓN DE CAMPOS CRÍTICOS ===');
    const criticalFields = ['licenseCode', 'firstName', 'surnames', 'dateOfBirth', 'state'];
    criticalFields.forEach(field => {
        const value = parsed[field];
        console.log(`${field}: ${value ? '✓ ' + value : '✗ FALTANTE'}`);
    });
}

// Ejecutar la prueba
testFloridaLicenseParsing();

// Exportar para uso en otros archivos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        floridaLicenseData,
        testFloridaLicenseParsing
    };
}