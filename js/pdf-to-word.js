/**
 * Módulo para convertir PDF a DOCX
 */

// Importar las librerías necesarias
const pdfjsLib = window["pdfjs-dist/build/pdf"]
const docx = require("docx")

// Configurar el worker de PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js"

// Función principal para convertir PDF a DOCX
async function convertPdfToWord(file) {
  try {
    showStatus("Leyendo el archivo PDF...", "progress")
    updateProgress(10)

    // Leer el archivo PDF
    const arrayBuffer = await readFileAsArrayBuffer(file)
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

    showStatus("Extrayendo texto y contenido...", "progress")
    updateProgress(30)

    // Crear un nuevo documento DOCX
    const doc = new docx.Document({
      sections: [],
    })

    // Extraer texto de cada página
    const numPages = pdf.numPages
    let allParagraphs = []

    for (let i = 1; i <= numPages; i++) {
      updateProgress(30 + (i / numPages) * 40)
      showStatus(`Procesando página ${i} de ${numPages}...`, "progress")

      const page = await pdf.getPage(i)
      const textContent = await page.getTextContent()

      // Añadir texto al documento DOCX
      const text = textContent.items.map((item) => item.str).join(" ")

      // Añadir un párrafo por cada línea de texto
      const paragraphs = text.split("\n").map(
        (line) =>
          new docx.Paragraph({
            children: [new docx.TextRun(line)],
          }),
      )

      allParagraphs = allParagraphs.concat(paragraphs)

      // Añadir un salto de página si no es la última página
      if (i < numPages) {
        allParagraphs.push(
          new docx.Paragraph({
            children: [],
            pageBreakBefore: true,
          }),
        )
      }
    }

    // Añadir todos los párrafos a una sección
    doc.addSection({
      properties: {},
      children: allParagraphs,
    })

    showStatus("Generando archivo DOCX...", "progress")
    updateProgress(80)

    // Generar el archivo DOCX
    const docxBlob = await docx.Packer.toBlob(doc)

    // Cambiar el nombre del archivo
    const newFileName = changeFileExtension(file.name, "docx")

    updateProgress(100)
    showStatus("¡Conversión completada!", "success")

    // Descargar el archivo
    downloadFile(docxBlob, newFileName)

    return true
  } catch (error) {
    console.error("Error al convertir PDF a DOCX:", error)
    showStatus("Error al convertir el archivo: " + error.message, "error")
    updateProgress(0)
    return false
  }
}

// Función para leer un archivo como ArrayBuffer
function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}

// Funciones auxiliares (simuladas para el ejemplo, deben ser implementadas)
function showStatus(message, status) {
  console.log(`Status: ${status}, Message: ${message}`)
}

function updateProgress(progress) {
  console.log(`Progress: ${progress}%`)
}

function changeFileExtension(filename, newExtension) {
  const parts = filename.split(".")
  parts.pop()
  return parts.join(".") + "." + newExtension
}

function downloadFile(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

