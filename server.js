const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { exec } = require('child_process');
const drivelist = require('drivelist');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const upload = multer({ dest: 'uploads/' });

// ─────── VIDEO DOWNLOAD ───────
app.post('/download', (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).send('Video URL is required.');

  const command = `yt-dlp -o "downloads/%(title)s.%(ext)s" ${url}`;
  exec(command, (err, stdout, stderr) => {
    if (err) {
      console.error(stderr);
      return res.status(500).send('Failed to download the video.');
    }
    res.send('Video downloaded successfully.');
  });
});

// ─────── LIST USB DRIVES ───────
app.get('/drives', async (req, res) => {
  try {
    const drives = await drivelist.list();
    const usbDrives = drives
      .filter(d => d.isUSB && d.mountpoints.length > 0)
      .map(d => ({
        device: d.device,
        description: d.description
      }));

    res.json(usbDrives);
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to list USB drives.');
  }
});

// ─────── WRITE ISO TO USB ───────
app.post('/write', upload.single('iso'), (req, res) => {
  const isoPath = req.file.path;
  const usbDevice = req.body.usb;

  if (!usbDevice || !isoPath) return res.status(400).send('Missing ISO file or USB target.');

  const rufusCommand = `"rufus.exe" --quiet --device=${usbDevice} --iso=${isoPath}`;

  exec(rufusCommand, (err, stdout, stderr) => {
    fs.unlinkSync(isoPath); // clean temp ISO
    if (err) {
      console.error(stderr);
      return res.status(500).send('Failed to write ISO to USB.');
    }
    res.send('ISO written successfully to USB.');
  });
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
