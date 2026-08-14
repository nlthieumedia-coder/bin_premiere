# PremiereBinBuilder (CEP Smoke Test)

This folder contains a minimal **smoke test** for Adobe Premiere Pro CEP extension to verify that:
1. The CEP panel successfully loads in Premiere.
2. The HTML/JS client successfully communicates with the ExtendScript host via `CSInterface.js`.

---

## 1. Extension Folder to Copy

You must copy the entire `cep` directory into your Adobe CEP extensions folder. 

Rename the folder to `PremiereBinBuilder` upon copying.

### Target Location (Windows):
`C:\Program Files (x86)\Common Files\Adobe\CEP\extensions\PremiereBinBuilder`

*Ensure that the final file path structure is:*
`C:\Program Files (x86)\Common Files\Adobe\CEP\extensions\PremiereBinBuilder\CSXS\manifest.xml`
`C:\Program Files (x86)\Common Files\Adobe\CEP\extensions\PremiereBinBuilder\client\index.html`

---

## 2. Enabling Developer Debug Mode

Because this is a locally deployed, unsigned extension, you must enable `PlayerDebugMode` in the Windows registry:

Open **Command Prompt (CMD) as Administrator** and execute:

```cmd
:: Enable debug mode for CEP 11 (Premiere Pro 2024 / v24.x)
reg add "HKCU\Software\Adobe\CSXS.11" /v PlayerDebugMode /t REG_SZ /d 1 /f

:: Enable debug mode for CEP 12 (Premiere Pro 2025+ / v25.x+)
reg add "HKCU\Software\Adobe\CSXS.12" /v PlayerDebugMode /t REG_SZ /d 1 /f
```

---

## 3. How to Run the Smoke Test

1. Restart **Adobe Premiere Pro**.
2. Open any project.
3. In the top menu bar, select:
   **Window > Extensions > PremiereBinBuilder**
4. Click the **TEST CONNECTION** button.
5. If communication is successful, the status label will turn green and display:
   `Status: Premiere connection OK`
