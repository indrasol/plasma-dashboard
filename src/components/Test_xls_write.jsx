function testDownload() {
  const dummyRows = [
    { Campaign: "Test Campaign", Channel: "Email", Classification: "elastic", Engaged: 100, Converted: 50, ConversionRate: "50%" }
  ];

  const worksheet = utils.json_to_sheet(dummyRows);
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, "TestSheet");

  writeFileXLSX(workbook, "test_export.xlsx"); // OR writeFile()
}