# Elegoo 3D Printer Monitor

This application will automatically discover and display the print status of any Elegoo MLSA Printers on your network.

## Installation

Run the installer to install and launch the application for the first time. No additional configuration is needed, as the app will automatically identify and display any compatible Elegoo MLSA printers.

#### Windows Specific Notes

The installation process will add a shortcut to the application on your desktop.

The application is installed under `%LocalAppData%\Programs\elegoo-3d-printer-monitor`

To remove the application, open the folder `%LocalAppData%\Programs\elegoo-3d-printer-monitor` and execute `Uninstall Elegoo 3D Printer Monitor.exe`

## Known Limitations

While this application is running, slicers, such as Volexdance Tango or Chitubox may be unable to discover your 3D printers. Temporarily close out the Elegoo 3D Printer Monitor to allow your slicer to discover your printers.

Once your slicer has discovered the 3D printer, you can relaunch this application, even while transmitting files to your 3D printer or starting a print remotely from your slicer.

## Additional Information

This application has only been tested with an Elegoo Mars 4 Ultra, but may work with other printers.

If you have access to a wifi-enabled Elegoo 3D printer, you may notice that the application works but does not display the appropriate image for your printer. If this happens, please open an issue, include the debugging information for your printer, and I will add the appropriate mapping data.
