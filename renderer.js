// Main navigation controller 
document.addEventListener('DOMContentLoaded', () => {
  // Handle menu clicks
  document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', function() {
      // Update active state
      document.querySelectorAll('.menu-item').forEach(el => {
        el.classList.remove('active');
      });
      this.classList.add('active');
      
      // Show selected content
      const target = this.getAttribute('data-target');
      document.querySelectorAll('.function-content').forEach(el => {
        el.style.display = 'none';
      });
      document.getElementById(target).style.display = 'block';
    });
  });

  // ISO to USB write button handler
  const writeBtn = document.getElementById('writeBtn');
  if (writeBtn) {
    writeBtn.addEventListener('click', async () => {
      const isoInput = document.getElementById('isoPath');
      const usbSelect = document.getElementById('usbSelect');
      if (!isoInput || !usbSelect) {
        alert('ISO input or USB select element not found.');
        return;
      }

      const isoFile = isoInput.files[0];
      const usbDrive = usbSelect.value;

      if (!isoFile) {
        alert('Please select an ISO file.');
        return;
      }
      if (!usbDrive) {
        alert('Please select a USB drive.');
        return;
      }

      try {
        const result = await window.electronAPI.writeISO(isoFile.path, usbDrive);
        alert(result);
      } catch (error) {
        alert('Error: ' + error);
      }
    });
  }
});
