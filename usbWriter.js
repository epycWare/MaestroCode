const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

function formatUSB(driveLetter, callback) {
  const scriptContent = `
select volume ${driveLetter.replace(':', '')}
clean
create partition primary
format fs=ntfs quick
assign
exit
  `.trim();

  const scriptPath = path.join(os.tmpdir(), 'format_usb_script.txt');
  fs.writeFileSync(scriptPath, scriptContent);

  exec(`diskpart /s "${scriptPath}"`, (error, stdout, stderr) => {
    if (error) return callback(`Error running diskpart:\n${stderr}`);
    callback(null, 'USB formatted successfully');
  });
}

function copyISO(isoPath, usbDrive, callback) {
  const destination = `${usbDrive}\\`;
  exec(`xcopy "${isoPath}" "${destination}" /E /H /K /Y`, (error, stdout, stderr) => {
    if (error) return callback(`Error copying ISO:\n${stderr}`);
    callback(null, 'ISO files copied to USB successfully');
  });
}

function writeISOToUSB(isoPath, driveLetter, callback) {
  formatUSB(driveLetter, (formatError) => {
    if (formatError) return callback(formatError);

    copyISO(isoPath, driveLetter, (copyError) => {
      if (copyError) return callback(copyError);
      callback(null, 'Process completed successfully');
    });
  });
}

module.exports = {
  writeISOToUSB
};
