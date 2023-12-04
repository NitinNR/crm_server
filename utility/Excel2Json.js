const convertExcelToJson = async (inputFile, outputFile, sheetName) => {
    const ExcelJS = require('exceljs');
    const jsonfile = require('jsonfile');
    const workbook = new ExcelJS.Workbook();
  
    try {
      await workbook.xlsx.readFile(inputFile);
      const worksheet = workbook.getWorksheet(sheetName);
      console.log("worksheet", worksheet);
      const json = [];
  
      for (const row of worksheet.getSheetValues()) {
        const rowObject = {};
  
        for (const [colNumber, cell] of row.entries()) {
          rowObject[`col${colNumber + 1}`] = cell;
        }
  
        json.push(rowObject);
      }
  
      await jsonfile.writeFile(outputFile, json, { spaces: 4 });
      console.log(`JSON file saved to ${outputFile}`);
    } catch (error) {
      console.error('Error:', error);
    }
  };
  
  module.exports = { convertExcelToJson };
  